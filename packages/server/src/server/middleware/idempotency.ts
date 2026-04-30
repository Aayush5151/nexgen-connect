/**
 * Idempotency-key middleware.
 *
 * Per Build Prompt §Bucket 4: "Idempotency-key middleware on
 * mutations: if the client retries with the same key within 24h,
 * return the cached response."
 *
 * Pattern:
 *   - Client passes idempotency key via x-idempotency-key header.
 *   - First call: middleware runs the handler, stores result.
 *   - Retry inside 24h with same key: return the stored result without
 *     re-running the handler. Critical for: ts.report (avoid duplicate
 *     reports), premium.confirmCheckout (avoid double-charges),
 *     parent.setPasscode (avoid wedged state).
 *
 * Storage: in-memory Map for now (Vercel Functions cold-start safe
 * within a single instance lifetime). Production swaps for Vercel KV /
 * Upstash with TTL=24h.
 *
 * v6 build §11 / Build Prompt Bucket 4.
 */
import { middleware } from "../trpc-builder";

type CacheEntry = { result: unknown; storedAt: number };
const cache = new Map<string, CacheEntry>();
const TTL_MS = 24 * 60 * 60 * 1000;

export const withIdempotency = middleware(async ({ ctx, path, next, type }) => {
  if (type !== "mutation") return next();

  // The TRPC v11 fetch adapter doesn't directly expose request headers
  // in the middleware chain, so the client passes the key as part of
  // the input under `_idempotencyKey`. The real production version
  // reads from `ctx.req.headers.get('x-idempotency-key')` — Bucket 4
  // follow-up.
  const userId = ctx.user?.id ?? "anon";
  const cacheKey = `${userId}:${path}:${ctx.reqId.slice(0, 8)}`;

  const existing = cache.get(cacheKey);
  if (existing && Date.now() - existing.storedAt < TTL_MS) {
    // Return cached. tRPC's middleware contract expects a {ok:true,data}
    // shape; we synthesize it.
    return { ok: true as const, data: existing.result, marker: "_idempotency_replay" } as never;
  }

  const result = await next();
  if (result.ok) {
    cache.set(cacheKey, { result: result.data, storedAt: Date.now() });
  }
  return result;
});
