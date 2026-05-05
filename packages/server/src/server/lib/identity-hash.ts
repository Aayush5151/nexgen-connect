/**
 * Composite identity hash — server-only.
 *
 * v15 BP §9.1 + v16 web pivot §3.1 + post-Bucket-10 review item 1.
 *
 * The single uniqueness anchor for the entire three-check trust model.
 * Without this, two phones can claim to be the same person and matching
 * corridors have no actual uniqueness guarantee. Bans must survive
 * SIM swaps, email re-registration, and even DigiLocker VID rotation.
 *
 * INPUTS (5-tuple):
 *   normalizedName  — lowercase, NFD-normalised, diacritics stripped, single-spaced
 *   dobYearMonth    — "YYYY-MM" (year + month only; never the day)
 *   phoneE164       — full E.164 string, no spaces, no plus
 *   admitHEICode    — university institutional code (e.g., "UCD", "TUM")
 *   IDENTITY_PEPPER — server-side env, rotated quarterly
 *
 * OUTPUT:
 *   sha256 hex string, 64 chars.
 *
 * THREAT MODEL DEFENCES:
 *   - Phone is hashed with PHONE_PEPPER before joining the composite,
 *     so a leak of the composite hash doesn't leak phone numbers.
 *   - Name is normalised (NFD → strip combining marks → lowercase →
 *     collapse whitespace) so "Aayush Shah" / "AAYUSH SHAH" / "Aayúsh
 *     Shah" all hash identically. Stops trivial obfuscation.
 *   - Year-month of DOB (no day) keeps the hash stable across users
 *     who fudged the day on different forms but blocks real-twin
 *     collisions because our matching pool is ~50K users.
 *   - admit_HEI ties the identity to the institution, so a real person
 *     who switches admit (rare; visa rejections happen) has to
 *     re-register cleanly through the new institution rather than
 *     impersonating their old self.
 *   - IDENTITY_PEPPER (server-only env) means the hash cannot be
 *     reproduced by anyone without the pepper — leaked database dumps
 *     can't be rainbow-table'd back to plaintext.
 *
 * HARD RULES:
 *   - Never log the input components.
 *   - Never expose the pepper to the client. Mobile bundle MUST NOT
 *     import this module.
 *   - When rotating peppers, the old peppers must remain available
 *     for verification of historical bans. Storage of old peppers is
 *     in `ROTATED_IDENTITY_PEPPERS` env (comma-separated) and the
 *     ban-check function tries new + each old in order.
 *
 * v16 web pivot §3.1.
 */
import { createHash } from "node:crypto";

export type IdentityHashInput = {
  /** Will be normalised inside; pass the user's raw input. */
  normalizedName: string;
  /** Format: "YYYY-MM". Validated. */
  dobYearMonth: string;
  /** E.164 string, no '+', no spaces. e.g., "919876543210". */
  phoneE164: string;
  /** Short institutional code. e.g., "UCD", "TUM", "TRINITY". */
  admitHEICode: string;
};

const REQUIRED_PEPPERS = ["IDENTITY_PEPPER", "PHONE_PEPPER"] as const;
type RequiredPepper = (typeof REQUIRED_PEPPERS)[number];

/**
 * Normalise a name for consistent hashing.
 *
 * Steps:
 *   1. NFD-decompose so diacritics become combining marks
 *   2. Strip combining marks (\p{Mn}) — "Aayúsh" → "Aayush"
 *   3. Lowercase — "AAYUSH SHAH" → "aayush shah"
 *   4. Collapse runs of whitespace to one space — "  Aayush   Shah  " → "aayush shah"
 *   5. Trim leading/trailing whitespace
 *
 * Examples:
 *   normalizeName("Aayush Shah")           → "aayush shah"
 *   normalizeName("AAYUSH  SHAH ")         → "aayush shah"
 *   normalizeName("Aayúsh Shåh")           → "aayush shah"
 *   normalizeName("Áàâăäãåā")              → "aaaaaaaa"
 *   normalizeName("आयुष")                  → "आयुष"  (Devanagari preserved)
 */
export function normalizeName(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Validate dobYearMonth is in "YYYY-MM" format with sane bounds.
 * Throws on malformed input.
 */
export function validateDobYearMonth(s: string): void {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(s)) {
    throw new Error(`identity-hash: dobYearMonth must be "YYYY-MM"; got "${s}"`);
  }
  const year = parseInt(s.slice(0, 4), 10);
  const now = new Date().getFullYear();
  if (year < 1900 || year > now) {
    throw new Error(`identity-hash: dobYearMonth year out of range (1900..${now}); got ${year}`);
  }
}

/**
 * Validate phoneE164 — digits only, length 10-15.
 */
export function validatePhoneE164(s: string): void {
  if (!/^\d{10,15}$/.test(s)) {
    throw new Error(`identity-hash: phoneE164 must be 10-15 digits, no '+'; got "${s.slice(0, 4)}…"`);
  }
}

/**
 * Validate admit HEI code — uppercase letters, digits, hyphens, 2-32 chars.
 */
export function validateAdmitHEICode(s: string): void {
  if (!/^[A-Z0-9-]{2,32}$/.test(s)) {
    throw new Error(`identity-hash: admitHEICode must match [A-Z0-9-]{2,32}; got "${s}"`);
  }
}

/** Throws if a required pepper is missing from env. */
function requirePepper(name: RequiredPepper): string {
  const v = process.env[name];
  if (!v || v.length < 16) {
    throw new Error(
      `identity-hash: ${name} env var missing or too short (<16 chars). ` +
        `Configure in Vercel project env. Never claim identity verification you can't anchor.`,
    );
  }
  return v;
}

/**
 * Compute the composite identity hash. Throws if peppers missing or
 * inputs malformed.
 */
export function computeIdentityHash(input: IdentityHashInput): string {
  const identityPepper = requirePepper("IDENTITY_PEPPER");
  const phonePepper = requirePepper("PHONE_PEPPER");

  const normalised = normalizeName(input.normalizedName);
  if (normalised.length < 1) {
    throw new Error("identity-hash: normalizedName is empty after normalisation");
  }
  validateDobYearMonth(input.dobYearMonth);
  validatePhoneE164(input.phoneE164);
  validateAdmitHEICode(input.admitHEICode);

  const phoneHash = createHash("sha256")
    .update(phonePepper + input.phoneE164)
    .digest("hex");

  const composite = [
    normalised,
    input.dobYearMonth,
    phoneHash,
    input.admitHEICode,
    identityPepper,
  ].join("|");

  return createHash("sha256").update(composite).digest("hex");
}

/**
 * Compute against the active pepper plus any rotated peppers (for ban
 * lookups across pepper rotations). Returns the array of hashes — the
 * first is the current, then any historical.
 *
 * Used by `account.requestErasure` + the ban-check at signup.
 */
export function computeAllIdentityHashes(input: IdentityHashInput): string[] {
  const current = computeIdentityHash(input);
  const rotated = (process.env.ROTATED_IDENTITY_PEPPERS ?? "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (rotated.length === 0) return [current];

  const phonePepper = requirePepper("PHONE_PEPPER");
  const normalised = normalizeName(input.normalizedName);
  const phoneHash = createHash("sha256").update(phonePepper + input.phoneE164).digest("hex");
  const historical = rotated.map((oldPepper) =>
    createHash("sha256")
      .update(
        [normalised, input.dobYearMonth, phoneHash, input.admitHEICode, oldPepper].join("|"),
      )
      .digest("hex"),
  );
  return [current, ...historical];
}

/**
 * Mask a hash to last-4 only for display in the UI / logs.
 * "abc…" → "****abc1" (last-4 of the hash).
 *
 * Per Privacy Policy §3 — the user's identity hash is server-only;
 * the client only ever sees the masked variant.
 */
export function maskIdentityHash(hash: string): string {
  if (hash.length < 4) return "****";
  return "****" + hash.slice(-4);
}
