/**
 * Auth router — phone OTP request + verify.
 *
 * Procedures:
 *   requestOtp  — send a 6-digit OTP via the OtpProvider chain.
 *                 Rate-limit: 2/min, 3/hour per phone.
 *   verifyOtp   — verify the 6-digit code, mint a single-use nonce that
 *                 /api/auth/establish-session must consume to mint a real
 *                 Supabase session.
 *                 Rate-limit: 5/min, 20/hour (per phone) to defeat brute
 *                 force on the 1M-code OTP space.
 *
 * Security properties (post-hardening pass May 2026):
 *   - OTP code stored as peppered SHA-256, never plaintext
 *   - Verify compares via timing-safe equal
 *   - Per-session attempts counter (max 5); record deleted on hit OR exhaustion
 *   - verifyOtp rate-limited (in addition to requestOtp)
 *   - Success mints `OtpNonce` keyed by random uuid; /api/auth/establish-session
 *     consumes the nonce single-use and returns the phone it was minted for.
 *     This is the only binding between OTP-verified state and session creation.
 *
 * v15 BP §9.1 / v6 build §18 / v16 web pivot §P0 / security hardening §May2026.
 */
import { randomInt } from "node:crypto";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { PhoneSchema, OtpSchema } from "@nexgen-connect/shared";
import { router, publicProcedure, withRateLimit } from "../trpc";
import { sendOtp } from "../lib/otp";
import { storage } from "../lib/storage";
import { hashOtp, constantTimeEqualHex } from "../lib/hash";
import { putOtpNonce, OTP_NONCE_TTL_SECONDS } from "../lib/otp-nonce";

// Re-export for consumers that still import from this module (back-compat).
export { consumeOtpNonce } from "../lib/otp-nonce";

const RequestOtpInput = z.object({
  phone: PhoneSchema,
  preferSms: z.boolean().optional(),
});
const RequestOtpOutput = z.object({
  otpSessionId: z.string(),
  expiresAt: z.string(),
  maskedPhone: z.string(),
  channel: z.enum(["whatsapp", "sms"]),
});

const VerifyOtpOutput = z.object({
  /** Single-use nonce. Consumed by /api/auth/establish-session to mint
   *  a real Supabase session. Not a session token itself. */
  sessionNonce: z.string(),
  phoneE164: z.string(),
  expiresAt: z.string(),
});

/** OTP TTL in seconds — the window a user has to enter the code. */
const OTP_TTL_SECONDS = 5 * 60;
/** Max wrong attempts before the session is locked + deleted. */
const MAX_OTP_ATTEMPTS = 5;

/**
 * Stored OTP record. The `code` field is the peppered SHA-256 of the
 * plaintext code — never the code itself. A Redis snapshot leak therefore
 * can't recover an actual OTP without also leaking OTP_PEPPER, which
 * lives in a different secret store.
 */
type OtpRecord = {
  phoneE164: string;
  codeHash: string;
  expiresAt: string;
  attempts: number;
};

function otpKey(sessionId: string) {
  return `otp:session:${sessionId}`;
}

async function putOtp(sessionId: string, record: OtpRecord) {
  await storage.setEx(otpKey(sessionId), JSON.stringify(record), OTP_TTL_SECONDS);
}

async function getOtp(sessionId: string): Promise<OtpRecord | null> {
  const raw = await storage.get(otpKey(sessionId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OtpRecord;
  } catch {
    await storage.del(otpKey(sessionId));
    return null;
  }
}

async function deleteOtp(sessionId: string) {
  await storage.del(otpKey(sessionId));
}

export const authRouter = router({
  requestOtp: publicProcedure
    .use(withRateLimit({ perMinute: 2, perHour: 3 }))
    .input(RequestOtpInput)
    .output(RequestOtpOutput)
    .mutation(async ({ input, ctx }) => {
      const otpSessionId = crypto.randomUUID();
      // Code generation stays here (not in the provider) — providers are
      // pure delivery; the code is our source of truth. Math.random is
      // not CSPRNG; randomInt is.
      const code =
        process.env.MOCK_OTP === "true"
          ? "123456"
          : String(randomInt(100000, 1000000));
      const expiresAt = new Date(ctx.now.getTime() + OTP_TTL_SECONDS * 1000);
      await putOtp(otpSessionId, {
        phoneE164: input.phone.e164,
        codeHash: hashOtp(code),
        expiresAt: expiresAt.toISOString(),
        attempts: 0,
      });

      const result = await sendOtp({
        phoneE164: input.phone.e164,
        code,
        userOptedOutOfWhatsapp: input.preferSms ?? false,
      });

      if (!result.ok) {
        // Drop the persisted code immediately — caller will retry, and a
        // stale code shouldn't be verifiable.
        await deleteOtp(otpSessionId);
        throw new TRPCError({
          code: "BAD_GATEWAY",
          message: result.error,
        });
      }

      return {
        otpSessionId,
        expiresAt: expiresAt.toISOString(),
        maskedPhone: maskPhone(input.phone.e164),
        channel: result.channel,
      };
    }),

  verifyOtp: publicProcedure
    // Rate-limit verify too — without this, an attacker who knows
    // otpSessionId can brute-force the 1M-code space in the 5-min TTL.
    .use(withRateLimit({ perMinute: 5, perHour: 20 }))
    .input(OtpSchema)
    .output(VerifyOtpOutput)
    .mutation(async ({ input, ctx }) => {
      const session = await getOtp(input.otpSessionId);
      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "E020:otp_session_missing",
        });
      }
      const expiresAt = new Date(session.expiresAt);
      if (ctx.now > expiresAt) {
        await deleteOtp(input.otpSessionId);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "E021:otp_expired",
        });
      }

      // Constant-time compare. The code we received is plaintext; hash
      // it with the same pepper and compare hex-encoded.
      const submittedHash = hashOtp(input.code);
      const match = constantTimeEqualHex(session.codeHash, submittedHash);

      if (!match) {
        // Increment attempts. On the Nth failure, delete the record so the
        // attacker has to request a new OTP (and re-pay the requestOtp
        // rate-limit cost).
        const nextAttempts = session.attempts + 1;
        if (nextAttempts >= MAX_OTP_ATTEMPTS) {
          await deleteOtp(input.otpSessionId);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "E024:otp_attempts_exhausted",
          });
        }
        // Re-persist with bumped attempts (preserving TTL via setEx with
        // the remaining lifetime — storage layer resets TTL, which is
        // acceptable here; an attacker who can land 5 attempts in the
        // 5-min window already hits the attempts limit first).
        await putOtp(input.otpSessionId, {
          ...session,
          attempts: nextAttempts,
        });
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "E022:otp_invalid",
        });
      }

      // Hit. Delete the OTP record and mint a single-use nonce. The
      // nonce is the ONLY proof the caller actually verified an OTP —
      // /api/auth/establish-session refuses to mint a Supabase session
      // without consuming a valid nonce.
      await deleteOtp(input.otpSessionId);
      const nonce = crypto.randomUUID();
      const nonceExpiresAt = new Date(
        ctx.now.getTime() + OTP_NONCE_TTL_SECONDS * 1000,
      );
      await putOtpNonce(nonce, {
        phoneE164: session.phoneE164,
        expiresAt: nonceExpiresAt.toISOString(),
      });

      return {
        sessionNonce: nonce,
        phoneE164: session.phoneE164,
        expiresAt: nonceExpiresAt.toISOString(),
      };
    }),
});

function maskPhone(e164: string): string {
  const digits = e164.replace(/\D/g, "");
  return "*".repeat(Math.max(0, digits.length - 4)) + digits.slice(-4);
}
