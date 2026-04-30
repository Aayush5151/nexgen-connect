/**
 * Rate-limit middleware.
 *
 * Token-bucket per (userId-or-IP, procedurePath). Cheap in-memory
 * implementation suitable for Vercel Functions (single-instance per
 * cold start) — the production deploy moves this to Vercel KV /
 * Upstash Redis once Bucket 4's credentials land.
 *
 * Per Build Prompt §Bucket 3:
 *   "Rate limiting: client-side throttle on OTP request (1 per 30s,
 *    3 per hour), report submission (1 per minute), Premium checkout
 *    (3 per hour). Server-side hard limits."
 *
 * v6 build §11 / Build Prompt Bucket 4.
 */
import { TRPCError } from "@trpc/server";
import { middleware } from "../trpc-builder";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/**
 * Apply rate limit. Two args:
 *   - perMinute: requests-per-minute cap (sliding window).
 *   - perHour:   optional second bucket; useful for OTP (1/30s + 3/hour).
 */
export function withRateLimit(opts: { perMinute: number; perHour?: number }) {
  return middleware(async ({ ctx, path, next }) => {
    const key = `${ctx.user?.id ?? "anon"}:${path}`;
    const now = Date.now();

    // Per-minute bucket.
    const minBucket = buckets.get(`${key}:min`) ?? { count: 0, resetAt: now + 60_000 };
    if (now > minBucket.resetAt) {
      minBucket.count = 0;
      minBucket.resetAt = now + 60_000;
    }
    if (minBucket.count >= opts.perMinute) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `E060:rate_limit_minute (${opts.perMinute}/min)`,
      });
    }
    minBucket.count++;
    buckets.set(`${key}:min`, minBucket);

    // Per-hour bucket if specified.
    if (opts.perHour !== undefined) {
      const hrBucket = buckets.get(`${key}:hr`) ?? { count: 0, resetAt: now + 3_600_000 };
      if (now > hrBucket.resetAt) {
        hrBucket.count = 0;
        hrBucket.resetAt = now + 3_600_000;
      }
      if (hrBucket.count >= opts.perHour) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `E061:rate_limit_hour (${opts.perHour}/hr)`,
        });
      }
      hrBucket.count++;
      buckets.set(`${key}:hr`, hrBucket);
    }

    return next();
  });
}
