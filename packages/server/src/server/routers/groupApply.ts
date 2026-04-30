/**
 * Group-apply router — PBSA cluster formation + submission.
 *
 * Phase enum: forming → submitted → accepted / declined.
 *
 * v15 BP §5.2 / v6 build §18 / Build Prompt Bucket 4.
 */
import { z } from "zod";
import { router, fullyVerifiedProcedure, fullyVerifiedMutation } from "../trpc";

const Cluster = z.object({
  id: z.string(),
  partner: z.string(),
  city: z.string(),
  size: z.number(),
  phase: z.enum(["forming", "submitted", "accepted", "declined"]),
  members: z.array(
    z.object({
      id: z.string(),
      initials: z.string(),
      firstName: z.string(),
    }),
  ),
  moveInDate: z.string(),
  lastActivityAt: z.string(),
});

export const groupApplyRouter = router({
  myCluster: fullyVerifiedProcedure
    .output(Cluster.nullable())
    .query(async () => null),

  formCluster: fullyVerifiedMutation
    .output(Cluster)
    .mutation(async ({ ctx }) => ({
      id: crypto.randomUUID(),
      partner: "aparto",
      city: "Dublin",
      size: 4,
      phase: "forming" as const,
      members: [
        { id: "u1", initials: "AS", firstName: "Aayush" },
        { id: "u2", initials: "PG", firstName: "Priya" },
        { id: "u3", initials: "RK", firstName: "Rohan" },
        { id: "u4", initials: "NM", firstName: "Neha" },
      ],
      moveInDate: "2026-09-01",
      lastActivityAt: ctx.now.toISOString(),
    })),

  submit: fullyVerifiedMutation
    .input(z.object({ clusterId: z.string() }))
    .output(
      z.object({
        clusterId: z.string(),
        submittedAt: z.string(),
        respondBy: z.string(),
        trackingRef: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => ({
      clusterId: input.clusterId,
      submittedAt: ctx.now.toISOString(),
      respondBy: new Date(ctx.now.getTime() + 7 * 86400_000).toISOString(),
      trackingRef: `APRT-${Date.now()}`,
    })),

  leaveCluster: fullyVerifiedMutation
    .input(z.object({ clusterId: z.string() }))
    .output(z.object({ ok: z.boolean() }))
    .mutation(async () => ({ ok: true })),
});
