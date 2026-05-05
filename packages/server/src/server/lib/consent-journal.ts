/**
 * Consent journal — append-only record of every consent the user gives.
 *
 * Required by GDPR Art. 7(1) ("the controller shall be able to
 * demonstrate that the data subject has consented") and DPDP Act §6(2)
 * ("a Data Fiduciary shall be responsible for ... establishing the
 * particulars of consent"). This module is the canonical record.
 *
 * Storage: Supabase `consent_records` table (migration 0005, paired
 * with this commit). One row per consent event. Never updated, never
 * deleted (subject to retention rules — see Privacy Policy §3).
 *
 * Consent events captured:
 *   - signup_otp           — phone OTP verification accepted ToS + Privacy
 *   - digilocker_handshake — DigiLocker authorization initiated
 *   - admit_upload         — admit letter uploaded for human review
 *   - premium_purchase     — Razorpay payment initiated
 *   - parent_view_share    — magic-link generated for parent
 *   - data_export_request  — user requested export of their data
 *   - account_erasure      — user requested account deletion
 *
 * v16 web pivot §2.4.
 */
import { createHash } from "node:crypto";

export const CONSENT_TYPES = [
  "signup_otp",
  "digilocker_handshake",
  "admit_upload",
  "premium_purchase",
  "parent_view_share",
  "data_export_request",
  "account_erasure",
] as const;
export type ConsentType = (typeof CONSENT_TYPES)[number];

export type ConsentRecord = {
  /** UUID generated server-side at insert. */
  id: string;
  /** UUID of the verified_user; null only if recorded pre-signup
   *  (e.g., OTP request before account creation). */
  userId: string | null;
  consentType: ConsentType;
  /** Version string of the policy doc the user agreed to.
   *  Format: "privacy@2026-05-02" or "terms@2026-05-02". */
  policyVersion: string;
  /** SHA-256 hash of the request IP, salted with IP_HASH_PEPPER.
   *  Plain IP is never stored. */
  ipHash: string;
  /** ISO timestamp when the consent was recorded. */
  recordedAt: string;
  /** Optional metadata (e.g., the OTP session id, the admit doc id). */
  metadata: Record<string, unknown> | null;
};

export interface ConsentJournalStorage {
  insert(record: Omit<ConsentRecord, "id" | "recordedAt">): Promise<ConsentRecord>;
  /** Most-recent-first list of consent events for a user. Used by
   *  `account.dataExport` to emit the user's full consent history. */
  listByUser(userId: string): Promise<ConsentRecord[]>;
}

/**
 * Hash the request IP with the IP_HASH_PEPPER. Throws if the pepper
 * isn't configured — this is fail-closed; a consent record without a
 * verifiable IP-hash provenance trail is worthless.
 */
export function hashIp(ip: string): string {
  const pepper = process.env.IP_HASH_PEPPER;
  if (!pepper) {
    throw new Error(
      "consent-journal: IP_HASH_PEPPER not configured. Refusing to record consent without IP provenance.",
    );
  }
  return createHash("sha256").update(pepper + ip).digest("hex");
}

/**
 * Record a consent event. Wraps the storage contract so callers don't
 * need to construct the IP hash themselves.
 *
 * Usage (from a tRPC procedure):
 *   await recordConsent(ctx.consentJournal, {
 *     userId: ctx.user?.id ?? null,
 *     consentType: "signup_otp",
 *     policyVersion: "privacy@2026-05-02",
 *     ip: ctx.req.headers.get("x-forwarded-for") ?? "unknown",
 *     metadata: { otpSessionId },
 *   });
 */
export async function recordConsent(
  storage: ConsentJournalStorage,
  input: {
    userId: string | null;
    consentType: ConsentType;
    policyVersion: string;
    ip: string;
    metadata?: Record<string, unknown> | null;
  },
): Promise<ConsentRecord> {
  return storage.insert({
    userId: input.userId,
    consentType: input.consentType,
    policyVersion: input.policyVersion,
    ipHash: hashIp(input.ip),
    metadata: input.metadata ?? null,
  });
}

/**
 * In-memory storage adapter for dev. Production uses the Supabase
 * adapter (Bucket 3 wires it). Tests use this directly.
 */
export function createInMemoryConsentJournal(): ConsentJournalStorage {
  const rows: ConsentRecord[] = [];
  return {
    async insert(record) {
      const full: ConsentRecord = {
        id: crypto.randomUUID(),
        recordedAt: new Date().toISOString(),
        ...record,
      };
      rows.push(full);
      return full;
    },
    async listByUser(userId) {
      return rows
        .filter((r) => r.userId === userId)
        .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
    },
  };
}
