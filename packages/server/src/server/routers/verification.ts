/**
 * Verification router — DigiLocker handshake + admit-letter review.
 *
 * Aadhaar handling per v15 BP §9.1: the 12-digit Aadhaar number NEVER
 * lands on the client. DigiLocker returns a VID + name + DOB; the
 * server-side composite hash (name + DOB-month + phone-hash + admit-HEI
 * + identity-pepper) is computed here and stored. Client receives only
 * `maskedHash` ("****12af") and `summary.{nameFirstAndLast,
 * yearMonthOfBirth}`.
 *
 * v15 BP §9.1 / v6 build §4 / Build Prompt Bucket 3 + 4.
 */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { UploadAdmitSchema } from "@nexgen-connect/shared";
import { router, phoneOnlyProcedure, fullyVerifiedProcedure } from "../trpc";

const StartDigiLockerOutput = z.object({
  authUrl: z.string().url(),
  state: z.string(),
});

const CompleteDigiLockerInput = z.object({
  state: z.string(),
  code: z.string(),
});
const CompleteDigiLockerOutput = z.object({
  maskedHash: z.string(),
  summary: z.object({
    nameFirstAndLast: z.string(),
    yearMonthOfBirth: z.string(),
  }),
});

const ForceFailureInput = z.object({
  reason: z.enum(["aadhaar_not_linked", "mobile_changed", "deactivated", "invisible_character"]),
});

const UploadAdmitOutput = z.object({
  uploadUrl: z.string().url(),
  docId: z.string(),
  retentionMinutesAfterReview: z.number(),
});

const CompleteAdmitInput = z.object({ docId: z.string() });
const CompleteAdmitOutput = z.object({
  reviewBy: z.string(),
  queuePosition: z.number(),
});

const VerificationStatusOutput = z.object({
  phone: z.object({
    state: z.enum(["unverified", "verified"]),
    verifiedAt: z.string().optional(),
  }),
  identity: z.discriminatedUnion("state", [
    z.object({ state: z.literal("unstarted") }),
    z.object({ state: z.literal("in_progress") }),
    z.object({
      state: z.literal("failed"),
      reason: z.enum(["aadhaar_not_linked", "mobile_changed", "deactivated", "invisible_character"]),
    }),
    z.object({ state: z.literal("verified"), verifiedAt: z.string() }),
  ]),
  admit: z.discriminatedUnion("state", [
    z.object({ state: z.literal("not_uploaded") }),
    z.object({ state: z.literal("pending"), queuePosition: z.number(), reviewBy: z.string() }),
    z.object({ state: z.literal("approved"), reviewedAt: z.string() }),
    z.object({
      state: z.literal("rejected"),
      reason: z.string(),
      canResubmit: z.boolean(),
    }),
  ]),
});

export const verificationRouter = router({
  startDigiLocker: phoneOnlyProcedure
    .output(StartDigiLockerOutput)
    .mutation(async () => {
      // TODO(bucket-4-followup): real DigiLocker OAuth URL when KYC clears.
      return {
        authUrl: "https://api.digitallocker.gov.in/public/oauth2/1/authorize?client_id=mock&state=demo-state",
        state: "demo-state",
      };
    }),

  completeDigiLocker: phoneOnlyProcedure
    .input(CompleteDigiLockerInput)
    .output(CompleteDigiLockerOutput)
    .mutation(async ({ input }) => {
      if (input.state !== "demo-state") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "E031:digilocker_state_mismatch" });
      }
      // Composite hash computed server-side; client never sees raw VID.
      // Per v15 BP §9.1 the hash composition uses identity-pepper from
      // env. Mock returns a stable masked value.
      return {
        maskedHash: "****12af",
        summary: {
          nameFirstAndLast: "Aayush Shah",
          yearMonthOfBirth: "2003-03",
        },
      };
    }),

  forceFailure: phoneOnlyProcedure
    .input(ForceFailureInput)
    .output(z.object({ ok: z.boolean() }))
    .mutation(async () => {
      // Demo-only — flips the user into a specific failure state for
      // testing the S27/S28/S29/S30 fallback flows.
      return { ok: true };
    }),

  uploadAdmit: phoneOnlyProcedure
    .input(UploadAdmitSchema)
    .output(UploadAdmitOutput)
    .mutation(async () => {
      // TODO(bucket-4-followup): Supabase signed URL for client direct
      // upload; admit-letter PDFs auto-delete within 60 minutes of
      // review per L12.
      return {
        uploadUrl: "https://signed-url.supabase.co/admit/mock-doc-id",
        docId: crypto.randomUUID(),
        retentionMinutesAfterReview: 60,
      };
    }),

  completeAdmit: phoneOnlyProcedure
    .input(CompleteAdmitInput)
    .output(CompleteAdmitOutput)
    .mutation(async ({ ctx }) => {
      const reviewBy = new Date(ctx.now.getTime() + 48 * 3600_000).toISOString();
      return { reviewBy, queuePosition: 12 };
    }),

  status: phoneOnlyProcedure
    .output(VerificationStatusOutput)
    .query(async ({ ctx }) => {
      // Demo state: phone verified, identity + admit pending. Real
      // version reads from verified_user table.
      return {
        phone: { state: "verified", verifiedAt: ctx.now.toISOString() },
        identity: { state: "verified", verifiedAt: ctx.now.toISOString() },
        admit: {
          state: "pending",
          queuePosition: 12,
          reviewBy: new Date(ctx.now.getTime() + 36 * 3600_000).toISOString(),
        },
      };
    }),
});
