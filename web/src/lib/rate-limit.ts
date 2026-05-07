import "server-only";

import { NextResponse } from "next/server";

/**
 * Per-route rate limiting for /api/* REST handlers.
 *
 * In-memory token bucket scoped per Vercel Function instance. Cold
 * starts reset the counter — acceptable for the v1 launch volume
 * (hundreds of users; per-instance limit is the floor, real abuse
 * would still be caught upstream by the Vercel platform). When
 * cross-instance consistency matters (post-launch scaling), swap the
 * `buckets` Map for the Upstash-backed Storage abstraction in
 * packages/server/src/server/lib/storage.ts.
 *
 * Subject precedence: authenticated user id (if available) → client
 * IP from x-forwarded-for → "anon". Per-route key namespace so tight
 * limits on /api/parent-link/send don't shrink the budget for
 * /api/chat/send.
 *
 * v16 web pivot Bucket 7+8 follow-up — covers the REST surface the
 * tRPC withRateLimit middleware doesn't reach.
 */

type Bucket = { count: number; expiresAt: number };
const buckets = new Map<string, Bucket>();

export type RateLimitResult =
  | { ok: true; response?: never }
  | { ok?: never; response: NextResponse };

export type EnforceArgs = {
  /** Stable slug for this route, e.g. "chat-send". */
  route: string;
  /** Authenticated user id if available, else null. */
  userId: string | null;
  /** Client IP (raw first hop from x-forwarded-for). */
  ip: string | null;
  /** Max requests per window. */
  limit: number;
  /** Window length in seconds. */
  windowSec: number;
};

export async function enforceRateLimit(args: EnforceArgs): Promise<RateLimitResult> {
  const subject = args.userId ?? args.ip ?? "anon";
  const key = `restrl:${args.route}:${subject}`;
  const now = Date.now();

  const existing = buckets.get(key);
  if (existing && existing.expiresAt > now) {
    existing.count += 1;
    if (existing.count > args.limit) {
      const retryAfterSec = Math.max(1, Math.ceil((existing.expiresAt - now) / 1000));
      return {
        response: NextResponse.json(
          { error: "E060:rate_limited", retryAfterSec },
          {
            status: 429,
            headers: { "Retry-After": String(retryAfterSec) },
          },
        ),
      };
    }
    return { ok: true };
  }

  buckets.set(key, { count: 1, expiresAt: now + args.windowSec * 1000 });
  return { ok: true };
}

/** Pull the client IP from x-forwarded-for / x-real-ip. Returns the
 *  first hop (the actual client) or null if no IP header present. */
export function clientIp(req: Request): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  const real = req.headers.get("x-real-ip");
  return fwd?.split(",")[0]?.trim() ?? real ?? null;
}
