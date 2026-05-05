/**
 * Auth router — phone OTP request + verify.
 *
 * Procedures:
 *   requestOtp  — send a 6-digit OTP via the OtpProvider chain.
 *                 Primary channel: WhatsApp (Meta Cloud direct).
 *                 Fallback: MSG91 SMS.
 *                 Channel choice + actual channel used both land in
 *                 the audit log via the procedure's output.
 *                 Rate-limit: 1 per 30s, 3 per hour per Build Prompt §Bucket 3.
 *   verifyOtp   — verify the 6-digit code, return session token.
 *
 * v15 BP §9.1 / v6 build §18 / v16 web pivot §P0.
 */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { PhoneSchema, OtpSchema } from "@nexgen-connect/shared";
import { router, publicProcedure, withRateLimit } from "../trpc";
import { sendOtp } from "../lib/otp";

const RequestOtpInput = z.object({
  phone: PhoneSchema,
  /**
   * User-set preference. When true, the OTP router skips WhatsApp and
   * goes straight to SMS. Persisted on the funnel state (Bucket 4),
   * resent on retry / "didn't receive it" flows.
   */
  preferSms: z.boolean().optional(),
});
const RequestOtpOutput = z.object({
  otpSessionId: z.string(),
  expiresAt: z.string(),
  maskedPhone: z.string(),
  /** The channel that actually delivered. Audit log captures this. */
  channel: z.enum(["whatsapp", "sms"]),
});

const VerifyOtpOutput = z.object({
  sessionToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.string(),
    phoneVerifiedAt: z.string(),
  }),
});

// In-memory OTP store. Production swaps for Postgres.
const otpStore = new Map<string, { phone: string; code: string; expiresAt: Date }>();

export const authRouter = router({
  requestOtp: publicProcedure
    .use(withRateLimit({ perMinute: 2, perHour: 3 }))
    .input(RequestOtpInput)
    .output(RequestOtpOutput)
    .mutation(async ({ input, ctx }) => {
      const otpSessionId = crypto.randomUUID();
      // Code generation stays here (not in the provider) — providers
      // are pure delivery; the code is our source of truth, persisted
      // in otpStore for the verify step. Mock mode uses 123456 so dev
      // funnels are deterministic.
      const code =
        process.env.MOCK_OTP === "true"
          ? "123456"
          : String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = new Date(ctx.now.getTime() + 5 * 60_000);
      otpStore.set(otpSessionId, {
        phone: input.phone.e164,
        code,
        expiresAt,
      });

      const result = await sendOtp({
        phoneE164: input.phone.e164,
        code,
        userOptedOutOfWhatsapp: input.preferSms ?? false,
      });

      if (!result.ok) {
        // Drop the persisted code immediately — caller will retry, and
        // a stale code shouldn't be verifiable.
        otpStore.delete(otpSessionId);
        throw new TRPCError({
          code: "BAD_GATEWAY",
          // Forward the E0XX code, not the upstream message — keeps
          // upstream-leaky details out of the client.
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
    .input(OtpSchema)
    .output(VerifyOtpOutput)
    .mutation(async ({ input, ctx }) => {
      const session = otpStore.get(input.otpSessionId);
      if (!session) {
        throw new TRPCError({ code: "NOT_FOUND", message: "E020:otp_session_missing" });
      }
      if (ctx.now > session.expiresAt) {
        otpStore.delete(input.otpSessionId);
        throw new TRPCError({ code: "BAD_REQUEST", message: "E021:otp_expired" });
      }
      if (session.code !== input.code) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "E022:otp_invalid" });
      }
      otpStore.delete(input.otpSessionId);
      return {
        sessionToken: "demo-phone-only", // wires to context's mock user resolver
        refreshToken: crypto.randomUUID(),
        user: {
          id: "demo-user-1",
          phoneVerifiedAt: ctx.now.toISOString(),
        },
      };
    }),
});

function maskPhone(e164: string): string {
  const digits = e164.replace(/\D/g, "");
  return "*".repeat(Math.max(0, digits.length - 4)) + digits.slice(-4);
}
