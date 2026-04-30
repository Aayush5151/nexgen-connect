/**
 * Auth router — phone OTP request + verify.
 *
 * Procedures:
 *   requestOtp  — send a 6-digit OTP via MSG91 (mocked).
 *                 Rate-limit: 1 per 30s, 3 per hour per Build Prompt §Bucket 3.
 *   verifyOtp   — verify the 6-digit code, return session token.
 *
 * v15 BP §9.1 / v6 build §18 / Build Prompt Bucket 4.
 */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { PhoneSchema, OtpSchema } from "@nexgen-connect/shared";
import { router, publicProcedure, withRateLimit } from "../trpc";

const RequestOtpInput = z.object({ phone: PhoneSchema });
const RequestOtpOutput = z.object({
  otpSessionId: z.string(),
  expiresAt: z.string(),
  maskedPhone: z.string(),
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
      const code =
        process.env.MOCK_OTP === "true" ? "123456" : String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = new Date(ctx.now.getTime() + 5 * 60_000);
      otpStore.set(otpSessionId, {
        phone: input.phone.e164,
        code,
        expiresAt,
      });
      // TODO(bucket-4-followup): real MSG91 send. For now, log only.
      console.log(`[mock-msg91] OTP ${code} → ${input.phone.e164.slice(0, 5)}…`);
      return {
        otpSessionId,
        expiresAt: expiresAt.toISOString(),
        maskedPhone: maskPhone(input.phone.e164),
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
