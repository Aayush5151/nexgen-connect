/**
 * Trust & Safety router — report + advisor dialogue.
 *
 * SLAs per v15 BP §9.5 graded harassment matrix:
 *   - 30-min imminent-harm
 *   - 1-hour standard harassment
 *   - 4-hour business-hours other
 *
 * v15 BP §9.5 / v6 build §18 / Build Prompt Bucket 4.
 */
import { z } from "zod";
import { ReportSchema } from "@nexgen-connect/shared";
import { router, fullyVerifiedProcedure, fullyVerifiedMutation, withRateLimit } from "../trpc";

export const trustSafetyRouter = router({
  report: fullyVerifiedMutation
    .use(withRateLimit({ perMinute: 1 })) // BP §Bucket 3 — 1 per minute
    .input(ReportSchema)
    .output(
      z.object({
        reportId: z.string(),
        firstResponseBy: z.string(),
        ackText: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const sla =
        input.category === "hard_time"
          ? 30 * 60_000
          : input.category === "harassment"
            ? 60 * 60_000
            : 4 * 3600_000;
      return {
        reportId: crypto.randomUUID(),
        firstResponseBy: new Date(ctx.now.getTime() + sla).toISOString(),
        ackText:
          input.category === "hard_time"
            ? "A named advisor will reach out within 30 minutes."
            : "Your report is received. A named advisor responds within the SLA.",
      };
    }),

  dialogue: fullyVerifiedProcedure
    .input(z.object({ reportId: z.string() }))
    .output(
      z.object({
        messages: z.array(
          z.object({
            id: z.string(),
            from: z.enum(["advisor", "you", "system"]),
            body: z.string(),
            sentAt: z.string(),
            advisorName: z.string().optional(),
          }),
        ),
      }),
    )
    .query(async ({ ctx }) => ({
      messages: [
        {
          id: "sys-1",
          from: "system",
          body: "Report received. A named advisor will reach out shortly.",
          sentAt: ctx.now.toISOString(),
        },
      ],
    })),

  replyToReport: fullyVerifiedMutation
    .input(z.object({ reportId: z.string(), body: z.string().min(1).max(2000) }))
    .output(z.object({ ok: z.boolean() }))
    .mutation(async () => ({ ok: true })),
});
