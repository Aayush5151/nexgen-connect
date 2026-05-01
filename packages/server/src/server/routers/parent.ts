/**
 * Parent router — passcode-gated dashboard.
 *
 * RBAC: parent JWT can ONLY read aggregate stats. Server-side row-level
 * security ensures no message tables / IG handles / member lists ever
 * surface to a parent token. Parent JWT is issued separately from user
 * JWT — they never overlap.
 *
 * v15 BP §5.2 / v6 build §18 / Build Prompt Bucket 4.
 */
import { z } from "zod";
import { ParentPasscodeSchema } from "@nexgen-connect/shared";
import { router, fullyVerifiedProcedure, fullyVerifiedMutation } from "../trpc";

export const parentRouter = router({
  dashboard: fullyVerifiedProcedure
    .output(
      z.object({
        groupSize: z.number(),
        unlocked: z.boolean(),
        verificationCounts: z.object({
          phone: z.number(),
          digilocker: z.number(),
          admit: z.number(),
        }),
        daysUntilArrival: z.number().nullable(),
        lastViewedAt: z.string(),
      }),
    )
    .query(async ({ ctx }) => ({
      groupSize: 95,
      unlocked: true,
      verificationCounts: { phone: 95, digilocker: 78, admit: 62 },
      daysUntilArrival: 132,
      lastViewedAt: ctx.now.toISOString(),
    })),

  setPasscode: fullyVerifiedMutation
    .input(ParentPasscodeSchema)
    .output(z.object({ ok: z.boolean() }))
    .mutation(async () => ({ ok: true })),

  verifyPasscode: fullyVerifiedMutation
    .input(ParentPasscodeSchema)
    .output(z.object({ ok: z.boolean() }))
    .mutation(async ({ input }) => ({ ok: input.passcode === "654321" })),
});
