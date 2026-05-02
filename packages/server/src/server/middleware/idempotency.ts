/**
 * Idempotency-key middleware — backed by the Storage abstraction.
 *
 * v16 web pivot §3.3 + post-Bucket-10 review item 3. Production uses
 * Upstash Redis so retries arriving at a different Vercel Function
 * instance still hit the cached response.
 *
 * Pattern:
 *   - Client passes idempotency key via the `_idempotencyKey` field on
 *     the input object (or via x-idempotency-key header — the future
 *     tRPC adapter will expose request headers).
 *   - First call: middleware runs the handler, stores result for 24h.
 *   - Retry within 24h with same key: middleware returns the cached
 *     response without re-running the handler.
 *
 * Critical for:
 *   - trustSafety.report     — avoid duplicate reports on flaky network
 *   - premium.confirmCheckout — avoid double-charges
 *   - account.requestErasure — avoid wedged state on retried tap
 *
 * v16 web pivot §3.3.
 */
import { middleware } from "../trpc-builder";
import { storage } from "../lib/storage";

const TTL_SEC = 24 * 60 * 60; // 24 hours

export const withIdempotency = middleware(async ({ ctx, path, input, next, type }) => {
  if (type !== "mutation") return next();

  // Extract idempotency key from input. Convention: `_idempotencyKey`
  // string field. If absent, no idempotency caching — caller is
  // responsible for accepting the consequences.
  const inputObj = (input ?? {}) as { _idempotencyKey?: unknown };
  const idempotencyKey =
    typeof inputObj._idempotencyKey === "string" && inputObj._idempotencyKey.length > 0
      ? inputObj._idempotencyKey
      : null;
  if (!idempotencyKey) return next();

  const userId = ctx.user?.id ?? "anon";
  const cacheKey = `idem:${userId}:${path}:${idempotencyKey}`;

  const cached = await storage.get(cacheKey);
  if (cached) {
    try {
      const data = JSON.parse(cached);
      // tRPC middleware contract — return shape compatible with `next()`.
      return { ok: true as const, data, marker: "_idempotency_replay" } as never;
    } catch {
      // Corrupt cache row — fall through and re-run.
    }
  }

  const result = await next();
  if (result.ok) {
    try {
      await storage.setEx(cacheKey, JSON.stringify(result.data), TTL_SEC);
    } catch (e) {
      // Cache-write failure is logged but doesn't fail the request —
      // worst case is the user retries and we re-process.
      console.error("[idempotency] cache write failed:", e instanceof Error ? e.message : String(e));
    }
  }
  return result;
});
