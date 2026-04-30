/**
 * Admin router — back-office procedures the AD13 / AD14 admin UI calls.
 *
 * Per Build Prompt D2: admin tRPC procedures are IN SCOPE for Bucket 4
 * (server-side, mocked, no UI). Admin UI screens (AD13, AD14) are OUT
 * of scope for the mobile build prompt — they live in a separate
 * Next.js admin dashboard that consumes these procedures.
 *
 * Procedures:
 *   callFirstMover       — Twilio Voice Masked Number bridge for the
 *                          first-mover commitment (v15 BP §3.7a + W16).
 *   firstMoverOutcome    — log advisor's outcome notes after the call.
 *   banUser              — composite identity-hash ban (v15 BP §9.1
 *                          identity-tied bans, not email-tied).
 *   scmReview            — flag a scam-pattern report for review.
 *   mhOutreach           — initiate mental-health outreach call.
 *   peppersRotate        — rotate the OTP/phone/identity peppers
 *                          (rare; quarterly in steady state).
 *
 * Auth: all procedures require admin role (founder | ts_head |
 * ts_advisor with first_mover_capability). The role check is enforced
 * by a separate middleware that lands when the admin auth lane wires.
 *
 * v15 BP §3.7a, §5.18 / v6 build §16, §18 / Build Prompt Bucket 4 + D2.
 */
import { z } from "zod";
import { router, fullyVerifiedMutation } from "../trpc";

export const adminRouter = router({
  /** Server decrypts user phone in process memory, calls Twilio, returns
   *  masked number to the advisor. Plaintext wiped within 5 seconds. */
  callFirstMover: fullyVerifiedMutation
    .input(z.object({ userId: z.string(), advisorId: z.string() }))
    .output(
      z.object({
        maskedNumber: z.string(),
        sessionId: z.string(),
        expiresAt: z.string(),
      }),
    )
    .mutation(async ({ ctx }) => {
      // TODO(bucket-4-followup): real Twilio Voice Masked Number bridge.
      return {
        maskedNumber: "+91-MASKED-A7F3",
        sessionId: crypto.randomUUID(),
        expiresAt: new Date(ctx.now.getTime() + 30 * 60_000).toISOString(),
      };
    }),

  firstMoverOutcome: fullyVerifiedMutation
    .input(
      z.object({
        firstMoverOutreachId: z.string(),
        outcome: z.enum([
          "completed_call_picked_up",
          "completed_text_sent",
          "completed_user_unreachable",
        ]),
        notes: z.string().max(2000).optional(),
      }),
    )
    .output(z.object({ ok: z.boolean() }))
    .mutation(async () => ({ ok: true })),

  banUser: fullyVerifiedMutation
    .input(
      z.object({
        userId: z.string(),
        reason: z.string().min(10).max(500),
        /** Whether to also append the composite identity-hash to the
         *  banned-hash table (catches re-registration via a new phone). */
        identityTied: z.boolean(),
      }),
    )
    .output(z.object({ ok: z.boolean() }))
    .mutation(async () => ({ ok: true })),

  scmReview: fullyVerifiedMutation
    .input(
      z.object({
        scmIncidentId: z.string(),
        decision: z.enum(["confirmed", "false_positive", "investigation_open"]),
        notes: z.string().max(2000).optional(),
      }),
    )
    .output(z.object({ ok: z.boolean() }))
    .mutation(async () => ({ ok: true })),

  mhOutreach: fullyVerifiedMutation
    .input(
      z.object({
        userId: z.string(),
        urgency: z.enum(["imminent", "concerning", "follow_up"]),
        advisorId: z.string(),
      }),
    )
    .output(z.object({ ok: z.boolean(), sessionId: z.string() }))
    .mutation(async () => ({ ok: true, sessionId: crypto.randomUUID() })),

  peppersRotate: fullyVerifiedMutation
    .input(
      z.object({
        kind: z.enum(["phone", "otp", "aadhaar_ref", "identity"]),
      }),
    )
    .output(z.object({ ok: z.boolean(), rotatedAt: z.string() }))
    .mutation(async ({ ctx }) => ({
      ok: true,
      rotatedAt: ctx.now.toISOString(),
    })),
});
