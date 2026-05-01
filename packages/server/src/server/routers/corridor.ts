/**
 * Corridor router — three-layer architecture per v15 BP §3.2.
 *
 * Layer 1 (home_city × destination × intake) — hometown crew, unlock=8.
 * Layer 2 (destination × intake)              — primary surface, unlock=30.
 * Layer 3 (destination_city × intake)         — ambient fallback, floor=50.
 *
 * v15 BP §3.2, §3.5 / v6 build §17, §18 / Build Prompt Bucket 4.
 */
import { z } from "zod";
import { CorridorChoiceSchema } from "@nexgen-connect/shared";
import { router, phoneOnlyProcedure, fullyVerifiedProcedure } from "../trpc";

const CorridorOut = z.object({
  layer: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  id: z.string(),
  parentCorridorId: z.string().optional(),
  homeCity: z.string(),
  destination: z.string(),
  destinationCountry: z.enum(["Ireland", "Germany"]),
  intakeMonth: z.string(),
  verifiedCount: z.number(),
  unlockThreshold: z.number(),
  unlocked: z.boolean(),
  unlockedAt: z.string().nullable(),
  memberCountL1: z.number().optional(),
  womenOnlySubThreadActive: z.boolean().optional(),
});

export const corridorRouter = router({
  preview: phoneOnlyProcedure
    .input(CorridorChoiceSchema)
    .output(
      z.object({
        l2_count: z.number(),
        l1_count: z.number(),
        l3_count: z.number(),
        sub_circle_active_counts: z.array(z.object({ topic: z.string(), count: z.number() })),
      }),
    )
    .query(async () => ({
      l2_count: 95,
      l1_count: 5,
      l3_count: 312,
      sub_circle_active_counts: [
        { topic: "housing", count: 6 },
        { topic: "airport", count: 4 },
        { topic: "food", count: 5 },
        { topic: "roommates", count: 3 },
        { topic: "studies", count: 6 },
        { topic: "being-alone", count: 4 },
      ],
    })),

  me: fullyVerifiedProcedure
    .output(CorridorOut)
    .query(async ({ ctx }) => ({
      layer: 2 as const,
      id: "corridor-l2-ucd-sept-2026",
      homeCity: "Pune",
      destination: "UCD",
      destinationCountry: "Ireland" as const,
      intakeMonth: "September 2026",
      verifiedCount: 95,
      unlockThreshold: 30,
      unlocked: true,
      unlockedAt: ctx.now.toISOString(),
      memberCountL1: 5,
      womenOnlySubThreadActive: true,
    })),

  members: fullyVerifiedProcedure
    .output(
      z.array(
        z.object({
          id: z.string(),
          initials: z.string(),
          name: z.string(),
          homeCity: z.string(),
          uni: z.string(),
          verifiedAt: z.string(),
          isYou: z.boolean(),
        }),
      ),
    )
    .query(async ({ ctx }) => [
      {
        id: "u1",
        initials: "AS",
        name: "Aayush S.",
        homeCity: "Pune",
        uni: "UCD",
        verifiedAt: ctx.now.toISOString(),
        isYou: true,
      },
    ]),

  subCircles: fullyVerifiedProcedure
    .output(
      z.array(
        z.object({
          id: z.string(),
          topic: z.enum(["housing", "airport", "food", "roommates"]),
          count: z.number(),
          lastActivityAt: z.string(),
          joined: z.boolean(),
        }),
      ),
    )
    .query(async ({ ctx }) => [
      { id: "sc1", topic: "housing", count: 6, lastActivityAt: ctx.now.toISOString(), joined: true },
    ]),

  toggleSubCircle: fullyVerifiedProcedure
    .input(z.object({ subCircleId: z.string() }))
    .output(
      z.object({
        id: z.string(),
        topic: z.enum(["housing", "airport", "food", "roommates"]),
        count: z.number(),
        lastActivityAt: z.string(),
        joined: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => ({
      id: input.subCircleId,
      topic: "housing" as const,
      count: 6,
      lastActivityAt: ctx.now.toISOString(),
      joined: true,
    })),
});
