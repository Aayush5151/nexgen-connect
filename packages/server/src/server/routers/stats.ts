/**
 * Stats router — public, read-only counters for marketing surfaces.
 *
 * `signupsCount` returns the number of phone-verified signups so the
 * public hero can stop animating fake "Aditya just verified" rows and
 * instead surface a real, monotonically-increasing trust signal:
 *
 *     "37 verified · 23 to unlock first DM"
 *
 * The query reads the `verified_user` table where `phone_status =
 * 'verified'`. We deliberately count *phone-verified* (not
 * fully-verified) rows because:
 *
 *   - it's the most-permissive number that's still gated by the OTP,
 *     so it can't be inflated by drive-by traffic;
 *   - identity / admit-letter approvals lag by hours-to-days, so a
 *     "fully verified" count would lag the actual cohort by a week
 *     and feel dead during the launch corridor's first month.
 *
 * Result is cached in the storage layer (Upstash Redis when set, in-
 * memory otherwise) for 60 seconds to keep DB load flat — the hero is
 * polled by a small fraction of total page-views but the raw query
 * isn't free, and a 60s lag on a count that grows by tens-per-day is
 * imperceptible.
 *
 * v16 web pivot §P1.d (live trust signals).
 */
import { z } from "zod";
import { eq } from "drizzle-orm";
import { count } from "drizzle-orm";
import { router, publicProcedure } from "../trpc";
import { getDb } from "../../db/client";
import { verifiedUser } from "../../db/schema";
import { storage } from "../lib/storage";

const CACHE_KEY = "stats:signupsCount:v1";
const CACHE_TTL_SECONDS = 60;

const SignupsCountOutput = z.object({
  count: z.number().int().nonnegative(),
  /** ISO timestamp of when the count was computed (cache hit or miss). */
  asOf: z.string(),
  /** True when the value was served from the storage cache. */
  cached: z.boolean(),
});

export const statsRouter = router({
  signupsCount: publicProcedure
    .output(SignupsCountOutput)
    .query(async ({ ctx }) => {
      // Cache hit: return immediately. Skip DB entirely.
      const cached = await storage.get(CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as { count: number; asOf: string };
          return { ...parsed, cached: true };
        } catch {
          // Corrupt cache entry — fall through to DB and overwrite.
        }
      }

      // Cache miss: live count. If the DB is unavailable (dev without
      // POSTGRES_URL), return zero gracefully so the hero never breaks
      // on the public landing page.
      let liveCount = 0;
      try {
        const db = getDb();
        const result = await db
          .select({ count: count() })
          .from(verifiedUser)
          .where(eq(verifiedUser.phoneStatus, "verified"));
        liveCount = Number(result[0]?.count ?? 0);
      } catch (err) {
        // Don't surface DB errors to the public hero — log and degrade
        // to a zero count. The Sentry adapter on the server already
        // captures unhandled errors elsewhere.
        console.warn(
          "[stats.signupsCount] DB read failed, returning 0:",
          err instanceof Error ? err.message : err,
        );
      }

      const asOf = ctx.now.toISOString();
      const payload = { count: liveCount, asOf };
      await storage.setEx(CACHE_KEY, JSON.stringify(payload), CACHE_TTL_SECONDS);
      return { ...payload, cached: false };
    }),
});
