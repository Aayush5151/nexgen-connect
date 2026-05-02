/**
 * Rate-limit middleware — backed by the Storage abstraction.
 *
 * v16 web pivot §3.3 + post-Bucket-10 review item 3. Production uses
 * Upstash Redis (cross-instance counters survive cold starts).
 * Development falls back to in-memory.
 *
 * Per v16 prompt §Bucket 3 + v15 BP §Bucket 3:
 *   - OTP request:        1 per 30s + 3 per hour
 *   - Report submission:  1 per minute
 *   - Premium checkout:   3 per hour
 *   - Account erasure:    1 per hour (idempotency-safe)
 *
 * Server-side hard limits — never trust the client.
 *
 * v16 web pivot §3.3.
 */
import { TRPCError } from "@trpc/server";
import { middleware } from "../trpc-builder";
import { storage } from "../lib/storage";

/**
 * Apply rate limit. Two windows:
 *   - perMinute: requests-per-minute cap (60s rolling)
 *   - perHour:   optional second bucket (1h rolling)
 *
 * Both are stored as sliding windows in the storage layer with
 * per-window TTL. The Upstash adapter ensures the counters are shared
 * across Vercel Function instances; the in-memory adapter is per-
 * process (dev only).
 */
export function withRateLimit(opts: { perMinute: number; perHour?: number }) {
  return middleware(async ({ ctx, path, next }) => {
    const userOrAnon = ctx.user?.id ?? ctx.ipHash ?? "anon";
    const minKey = `rl:min:${userOrAnon}:${path}`;
    const hrKey = `rl:hr:${userOrAnon}:${path}`;

    // Per-minute window.
    const minCount = await storage.incr(minKey);
    if (minCount === 1) await storage.expire(minKey, 60);
    if (minCount > opts.perMinute) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `E060:rate_limit_minute (${opts.perMinute}/min)`,
      });
    }

    // Per-hour window if specified.
    if (opts.perHour !== undefined) {
      const hrCount = await storage.incr(hrKey);
      if (hrCount === 1) await storage.expire(hrKey, 3600);
      if (hrCount > opts.perHour) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `E061:rate_limit_hour (${opts.perHour}/hr)`,
        });
      }
    }

    return next();
  });
}
