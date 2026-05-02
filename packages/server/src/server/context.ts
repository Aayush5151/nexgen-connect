/**
 * tRPC request context.
 *
 * Built from each incoming request. Carries:
 *   - user — null until phone OTP verified, then minimal shape.
 *   - verificationStage — public | phoneOnly | fullyVerified.
 *     Used by the auth middleware in trpc.ts.
 *   - reqId — random per-request id for audit-log correlation.
 *   - now — current timestamp; injected so tests can freeze the clock.
 *
 * Until Bucket 4 wires Supabase for real, the context is hand-built
 * from a session-token header. The mocks read user from a static map
 * keyed by the bearer token (see `_mockUserFor()`).
 *
 * v15 BP §9 / v6 build §11 / Build Prompt Bucket 4.
 */
import type { NextRequest } from "next/server";
import { createHash } from "node:crypto";

export type VerificationStage = "public" | "phoneOnly" | "fullyVerified";

export type AuthedUser = {
  id: string;
  /** v15 BP §9.1 composite identity hash (server-only). Never leaves
   *  the server; client receives only the masked variant. */
  identityHashMasked: string;
  /** Verification stage drives middleware gates. */
  stage: VerificationStage;
  /** Premium activation timestamp; null until paid. */
  premiumActiveAt: string | null;
};

/**
 * The minimal DB surface tRPC procedures depend on. v16 web pivot
 * §3.2 + §3.4 — the audit-log middleware + account router check for
 * `auditLogInsert` / `erasureRequestInsert` capability and write
 * accordingly. Real Supabase client implements these methods; in dev
 * `db` is null and the writes fall back to console / no-op.
 */
export type DbClient = {
  auditLogInsert?: (record: unknown) => Promise<void>;
  erasureRequestInsert?: (record: unknown) => Promise<void>;
  consentRecordsInsert?: (record: unknown) => Promise<void>;
  bannedIdentityHashHas?: (hash: string) => Promise<boolean>;
};

export type Context = {
  user: AuthedUser | null;
  reqId: string;
  now: Date;
  /** SHA-256 of the request IP, salted with IP_HASH_PEPPER. Used by
   *  audit-log + rate-limit when no userId is present (anonymous calls). */
  ipHash: string | null;
  /** Real Supabase client when `SUPABASE_SERVICE_ROLE_KEY` is set;
   *  null in dev (audit-log + erasure writes log to stdout / no-op). */
  db: DbClient | null;
};

/**
 * Build context for an incoming tRPC request.
 *
 * Reads `Authorization: Bearer <token>` and resolves user. Until DB
 * lands, _mockUserFor() returns a hardcoded shape per token. The
 * production swap is one line — replace _mockUserFor with a real
 * `db.users.findBySessionToken(token)`.
 */
export async function createContext(req: NextRequest): Promise<Context> {
  const auth = req.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0]?.trim() ?? realIp ?? null;

  return {
    user: token ? _mockUserFor(token) : null,
    reqId: crypto.randomUUID(),
    now: new Date(),
    ipHash: ip ? hashIp(ip) : null,
    db: null,
  };
}

/** Hash request IP with IP_HASH_PEPPER. Returns null in dev if pepper
 *  isn't set — only fails-closed in production. */
function hashIp(ip: string): string | null {
  const pepper = process.env.IP_HASH_PEPPER;
  if (!pepper) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "context: IP_HASH_PEPPER not configured in production. Refusing to record audit-log entries without IP provenance.",
      );
    }
    return null;
  }
  return createHash("sha256").update(pepper + ip).digest("hex");
}

/** Mock user-resolver. Replace with real db query in Bucket 4 follow-up. */
function _mockUserFor(token: string): AuthedUser | null {
  // Demo tokens — match the shape mobile/src/lib/services/index.ts mocks
  // would generate in production.
  if (token === "demo-phone-only") {
    return {
      id: "demo-user-1",
      identityHashMasked: "****0000",
      stage: "phoneOnly",
      premiumActiveAt: null,
    };
  }
  if (token === "demo-fully-verified") {
    return {
      id: "demo-user-2",
      identityHashMasked: "****12af",
      stage: "fullyVerified",
      premiumActiveAt: null,
    };
  }
  if (token === "demo-premium") {
    return {
      id: "demo-user-3",
      identityHashMasked: "****9b3c",
      stage: "fullyVerified",
      premiumActiveAt: new Date("2026-01-15").toISOString(),
    };
  }
  return null;
}
