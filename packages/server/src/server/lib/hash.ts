/**
 * Server-only hash helpers — peppered SHA-256 for OTP / phone / Aadhaar
 * reference / IP. The peppers MUST be set as env vars in production. The
 * `required()` helper throws fail-loud if a pepper is missing — better a
 * deploy crash than silent unsalted hashing.
 *
 * Note: this mirrors `web/src/lib/hash.ts` but lives in the server package
 * so tRPC procedures (which compile separately from the Next app) can use
 * the same peppers. Both files MUST be kept in sync — they read the same
 * env vars and produce identical output bytes for a given input.
 */
import { createHash, timingSafeEqual } from "node:crypto";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

export function hashPhone(phoneE164: string): string {
  const pepper = required("PHONE_PEPPER");
  return createHash("sha256")
    .update(`${pepper}:${phoneE164.trim()}`)
    .digest("hex");
}

export function hashOtp(code: string): string {
  const pepper = required("OTP_PEPPER");
  return createHash("sha256").update(`${pepper}:${code.trim()}`).digest("hex");
}

/**
 * Constant-time compare of two hex-encoded equal-length hashes. Returns
 * false on any length mismatch or hex-decode failure — no exception
 * leaks back to the caller (so timing-side-channel can't distinguish
 * "bad hex" from "valid hex but wrong").
 */
export function constantTimeEqualHex(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}
