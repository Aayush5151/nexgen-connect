/**
 * Single-use nonces minted by `auth.verifyOtp` and consumed by
 * `/api/auth/establish-session`. The nonce is the ONLY binding between
 * "OTP just succeeded" and "mint a real Supabase session". Without this
 * shared module, a stranger could call establish-session for any phone.
 *
 * Storage: backed by the same `storage` abstraction the OTP records use
 * (Upstash in prod, in-memory in dev). Keys are namespaced under
 * `otp:nonce:<uuid>` and carry a short TTL (2 min).
 *
 * See:
 *   - packages/server/src/server/routers/auth.ts  (mint)
 *   - web/src/app/api/auth/establish-session/route.ts  (consume)
 *   - web/src/app/api/auth/attach-phone/route.ts  (consume — OAuth path)
 */
import { storage } from "./storage";

const NONCE_TTL_SECONDS = 2 * 60;

export type OtpNonceRecord = {
  phoneE164: string;
  expiresAt: string;
};

function nonceKey(nonce: string): string {
  return `otp:nonce:${nonce}`;
}

export async function putOtpNonce(
  nonce: string,
  record: OtpNonceRecord,
): Promise<void> {
  await storage.setEx(nonceKey(nonce), JSON.stringify(record), NONCE_TTL_SECONDS);
}

/**
 * Consume a nonce single-use. Returns the record on first call, then null
 * on every subsequent call (delete-on-read).
 *
 * Race window: between `get` and `del` there's a sub-ms gap during which a
 * concurrent reader could see the same value. With a 2-min nonce TTL and
 * a single hot key, double-consume from a single attacker requires
 * sub-ms re-firing — below the practical attack threshold. For true
 * atomicity we'd need GETDEL (Redis 6.2+), which @upstash/redis doesn't
 * yet expose; revisit when it lands.
 */
export async function consumeOtpNonce(
  nonce: string,
): Promise<OtpNonceRecord | null> {
  const raw = await storage.get(nonceKey(nonce));
  if (!raw) return null;
  // Delete immediately so subsequent reads return null even if parse fails.
  await storage.del(nonceKey(nonce));
  let parsed: OtpNonceRecord;
  try {
    parsed = JSON.parse(raw) as OtpNonceRecord;
  } catch {
    return null;
  }
  if (new Date(parsed.expiresAt).getTime() <= Date.now()) return null;
  return parsed;
}

export const OTP_NONCE_TTL_SECONDS = NONCE_TTL_SECONDS;
