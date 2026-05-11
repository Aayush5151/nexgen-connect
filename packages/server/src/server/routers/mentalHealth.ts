/**
 * Mental health router — region-localised crisis resources.
 *
 * v15 BP §16 + clinical reviewer governance / v6 build §18 / Build
 * Prompt Bucket 4.
 */
import { z } from "zod";
import { router, publicProcedure } from "../trpc";

const CrisisResource = z.object({
  name: z.string(),
  phone: z.string().nullable(),
  url: z.string().optional(),
  priority: z.number(),
  region: z.enum(["IN", "IE", "DE"]),
  freeCall: z.boolean().optional(),
});

const RESOURCES_BY_REGION: Record<"IN" | "IE" | "DE", z.infer<typeof CrisisResource>[]> = {
  IN: [
    { name: "iCall (TISS)", phone: "+919152987821", priority: 1, region: "IN", freeCall: false },
    { name: "Vandrevala Foundation", phone: "+9118602662345", priority: 2, region: "IN", freeCall: true },
    {
      name: "AASRA",
      phone: "+919820466726",
      url: "http://www.aasra.info",
      priority: 3,
      region: "IN",
      freeCall: false,
    },
  ],
  IE: [
    { name: "Samaritans Ireland", phone: "116123", priority: 1, region: "IE", freeCall: true },
    { name: "Pieta House", phone: "1800247247", priority: 2, region: "IE", freeCall: true },
  ],
  DE: [
    { name: "TelefonSeelsorge", phone: "08001110111", priority: 1, region: "DE", freeCall: true },
    { name: "Türkische Seelsorge Berlin", phone: "0800-7775552", priority: 2, region: "DE", freeCall: true },
  ],
};

export const mentalHealthRouter = router({
  resources: publicProcedure
    .input(z.object({ region: z.enum(["IN", "IE", "DE"]) }))
    .output(z.array(CrisisResource))
    // Explicit cast: zod 4 + isolatedModules infers `input` as `any`
    // in this cross-workspace consumption pattern, which trips
    // noImplicitAny on the Record index. Runtime is enforced by zod
    // so the cast is safe.
    .query(async ({ input }) =>
      RESOURCES_BY_REGION[input.region as "IN" | "IE" | "DE"],
    ),
});
