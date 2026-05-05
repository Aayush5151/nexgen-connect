/**
 * Storage abstraction — used by the rate-limit and idempotency
 * middleware. Two implementations:
 *
 *   - inMemoryStorage   — Map<string, …> per-process. Defeated by every
 *                         cold start on Vercel Functions. Dev/test only.
 *   - upstashStorage    — Upstash Redis via @upstash/redis. Production
 *                         path. Survives cold starts because the cache
 *                         lives in a network-attached store.
 *
 * The active impl is chosen at module load:
 *   if process.env.UPSTASH_REDIS_REST_URL is set → upstashStorage
 *   else → inMemoryStorage (logs a warning in production)
 *
 * v16 web pivot §3.3 / pre-launch-blockers.md §3.
 */

export interface Storage {
  /** Read a string value, or null if absent / expired. */
  get(key: string): Promise<string | null>;
  /** Write a value with TTL. Resets the TTL if the key already exists. */
  setEx(key: string, value: string, ttlSec: number): Promise<void>;
  /** Atomically increment a numeric counter. Creates with value 1 if absent. */
  incr(key: string): Promise<number>;
  /** Set or update the TTL on an existing key. No-op if the key doesn't exist. */
  expire(key: string, ttlSec: number): Promise<void>;
  /** Delete the key. Idempotent. */
  del(key: string): Promise<void>;
}

/* ------------------------------------------------------------------ */
/* In-memory adapter — dev / test only                                  */
/* ------------------------------------------------------------------ */

type Entry = { value: string; expiresAt: number };

class InMemoryStorage implements Storage {
  private map = new Map<string, Entry>();

  async get(key: string): Promise<string | null> {
    const entry = this.map.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.map.delete(key);
      return null;
    }
    return entry.value;
  }

  async setEx(key: string, value: string, ttlSec: number): Promise<void> {
    this.map.set(key, { value, expiresAt: Date.now() + ttlSec * 1000 });
  }

  async incr(key: string): Promise<number> {
    const existing = await this.get(key);
    const n = existing ? parseInt(existing, 10) + 1 : 1;
    // Preserve TTL if any; otherwise default to 1 hour to avoid leaks.
    const existingEntry = this.map.get(key);
    const ttlSec = existingEntry
      ? Math.max(1, Math.floor((existingEntry.expiresAt - Date.now()) / 1000))
      : 3600;
    await this.setEx(key, String(n), ttlSec);
    return n;
  }

  async expire(key: string, ttlSec: number): Promise<void> {
    const entry = this.map.get(key);
    if (!entry) return;
    entry.expiresAt = Date.now() + ttlSec * 1000;
  }

  async del(key: string): Promise<void> {
    this.map.delete(key);
  }

  /** Test-only: clear all entries. */
  _resetForTests(): void {
    this.map.clear();
  }
}

export const inMemoryStorage = new InMemoryStorage();

/* ------------------------------------------------------------------ */
/* Upstash Redis adapter — production path                              */
/* ------------------------------------------------------------------ */

/**
 * Lazy adapter — we don't import @upstash/redis at module load because
 * (a) the package is optional in dev and (b) importing it requires
 * UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN to be set, which
 * they aren't in dev.
 *
 * The adapter is created on first use; subsequent calls reuse the same
 * client instance.
 */
class UpstashStorage implements Storage {
  private client: { get: (k: string) => Promise<string | null>; set: (k: string, v: string, opts: { ex: number }) => Promise<unknown>; incr: (k: string) => Promise<number>; expire: (k: string, s: number) => Promise<unknown>; del: (k: string) => Promise<unknown> } | null = null;

  private async getClient() {
    if (this.client) return this.client;
    // Dynamic import keeps @upstash/redis as an optional dep — projects
    // that don't have it installed won't fail at module load.
    const mod = (await import("@upstash/redis").catch(() => null)) as
      | typeof import("@upstash/redis")
      | null;
    if (!mod) {
      throw new Error(
        "storage: @upstash/redis not installed. Add it to packages/server/package.json " +
          "or unset UPSTASH_REDIS_REST_URL to fall back to in-memory storage.",
      );
    }
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) {
      throw new Error("storage: UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN required");
    }
    this.client = new mod.Redis({ url, token }) as unknown as typeof this.client;
    return this.client!;
  }

  async get(key: string): Promise<string | null> {
    const c = await this.getClient();
    const v = await c.get(key);
    return v == null ? null : String(v);
  }

  async setEx(key: string, value: string, ttlSec: number): Promise<void> {
    const c = await this.getClient();
    await c.set(key, value, { ex: ttlSec });
  }

  async incr(key: string): Promise<number> {
    const c = await this.getClient();
    return c.incr(key);
  }

  async expire(key: string, ttlSec: number): Promise<void> {
    const c = await this.getClient();
    await c.expire(key, ttlSec);
  }

  async del(key: string): Promise<void> {
    const c = await this.getClient();
    await c.del(key);
  }
}

export const upstashStorage = new UpstashStorage();

/* ------------------------------------------------------------------ */
/* Active storage selection                                             */
/* ------------------------------------------------------------------ */

/**
 * The default storage chosen at module load. If UPSTASH_REDIS_REST_URL
 * is set, use Upstash; else fall back to in-memory with a one-time
 * warning in production environments.
 */
export const storage: Storage = (() => {
  if (process.env.UPSTASH_REDIS_REST_URL) return upstashStorage;
  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[storage] WARNING: UPSTASH_REDIS_REST_URL not set in production. " +
        "Rate-limit + idempotency caches are in-memory; defeated by every cold start. " +
        "Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN in Vercel env to fix.",
    );
  }
  return inMemoryStorage;
})();
