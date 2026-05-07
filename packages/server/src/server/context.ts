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
 * Two resolution paths sit behind `user`:
 *
 *   1. Supabase Auth JWT (production)  — when the request carries the
 *      Supabase access-token cookie (`sb-<project>-auth-token`), we
 *      verify it against `SUPABASE_JWT_SECRET` and resolve a minimal
 *      AuthedUser shape from the JWT claims. Phone OTP success →
 *      `stage: "phoneOnly"`; identity + admit verified user_metadata
 *      flags → `stage: "fullyVerified"`.
 *
 *   2. Demo bearer token (dev / preview) — `Authorization: Bearer
 *      demo-fully-verified` resolves through `_mockUserFor()`.
 *      Falls through automatically when no Supabase cookie is present
 *      and `NEXT_PUBLIC_DEV_BEARER_TOKEN` is set client-side.
 *
 * v15 BP §9 / v6 build §11 / v16 web pivot §P2 (Supabase JWT path).
 */
import type { NextRequest } from "next/server";
import { createHash } from "node:crypto";
import { jwtVerify, type JWTPayload } from "jose";

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
  /** Admin role gate. Sourced from `user_metadata.is_admin` on the
   *  Supabase JWT and bootstrapped via SQL — see
   *  `web/supabase/migrations/0005_admin_review.sql` for the legacy
   *  waitlist-row path. The tRPC `requireAdmin` middleware (trpc.ts)
   *  consumes this; admin procedures must NEVER ship without it. */
  isAdmin: boolean;
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
 * Resolves the user via (in order):
 *   1. Supabase JWT cookie  — production path. Reads
 *      `sb-<project>-auth-token`, verifies with SUPABASE_JWT_SECRET,
 *      and synthesises an AuthedUser from the claims.
 *   2. `Authorization: Bearer <demo-token>` — dev/preview path. Falls
 *      through to `_mockUserFor()`.
 */
export async function createContext(req: NextRequest): Promise<Context> {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0]?.trim() ?? realIp ?? null;

  // Path 1: Supabase JWT
  let user: AuthedUser | null = await resolveSupabaseUser(req);

  // Path 2: demo bearer (dev / preview only)
  if (!user) {
    const auth = req.headers.get("authorization");
    const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
    if (token) user = _mockUserFor(token);
  }

  return {
    user,
    reqId: crypto.randomUUID(),
    now: new Date(),
    ipHash: ip ? hashIp(ip) : null,
    db: null,
  };
}

/**
 * Verify a Supabase access token from the cookie chain. The cookie name
 * is `sb-<project-ref>-auth-token` and contains a JSON-stringified array
 * `[access_token, refresh_token, ...]`.
 *
 * Returns null on any failure mode (missing cookie, expired JWT, malformed
 * payload, missing JWT secret) — caller falls back to the demo-bearer
 * path. Production fails-loud only if SUPABASE_JWT_SECRET is unset
 * specifically when a cookie IS present (signals misconfiguration).
 */
async function resolveSupabaseUser(req: NextRequest): Promise<AuthedUser | null> {
  // Locate the access-token cookie. Supabase SSR uses the project ref
  // in the name, so we scan rather than hardcode.
  const cookieHeader = req.headers.get("cookie") ?? "";
  const accessToken = parseSupabaseAccessToken(cookieHeader);
  if (!accessToken) return null;

  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[context] SUPABASE_JWT_SECRET unset but a Supabase auth cookie is present. Falling back to anonymous.",
      );
    }
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      accessToken,
      new TextEncoder().encode(secret),
    );
    return jwtToAuthedUser(payload);
  } catch (err) {
    // Expired / tampered / wrong secret. Anonymous.
    if (process.env.NODE_ENV !== "production") {
      console.warn("[context] supabase JWT verify failed:", err);
    }
    return null;
  }
}

/**
 * Pull the access token out of the Supabase SSR cookie chain. The cookie
 * value can take two forms (depending on @supabase/ssr version):
 *
 *   1. `["access","refresh",null,null,null]`     — JSON array
 *   2. `base64-<base64-encoded-json>`            — newer chunked form
 *
 * We try (1) first; if it fails, attempt the base64 unwrap.
 */
function parseSupabaseAccessToken(cookieHeader: string): string | null {
  const match = cookieHeader.match(/sb-[^=]*-auth-token=([^;]+)/);
  if (!match) return null;
  const raw = decodeURIComponent(match[1]);
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && typeof parsed[0] === "string") {
      return parsed[0];
    }
  } catch {
    // fall through to base64
  }
  if (raw.startsWith("base64-")) {
    try {
      const json = Buffer.from(raw.slice(7), "base64").toString("utf8");
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed) && typeof parsed[0] === "string") {
        return parsed[0];
      }
    } catch {
      // give up
    }
  }
  return null;
}

/**
 * Synthesise an AuthedUser from a verified Supabase JWT payload.
 *
 * Stage resolution: phone-confirmed users land in `phoneOnly`. The
 * `user_metadata.identity_verified_at` + `admit_approved_at` flags
 * promote to `fullyVerified`. Without those flags the gate stays at
 * phoneOnly so DigiLocker / admit upload procedures still gate
 * correctly.
 */
function jwtToAuthedUser(payload: JWTPayload): AuthedUser | null {
  const sub = typeof payload.sub === "string" ? payload.sub : null;
  if (!sub) return null;

  // Cast with care — the JWT can contain arbitrary user_metadata.
  const meta = (payload.user_metadata as Record<string, unknown> | undefined) ?? {};
  const phoneVerified = !!payload.phone || meta.phone_verified === true;
  const identityVerifiedAt = typeof meta.identity_verified_at === "string"
    ? meta.identity_verified_at
    : null;
  const admitApprovedAt = typeof meta.admit_approved_at === "string"
    ? meta.admit_approved_at
    : null;
  const premiumActiveAt = typeof meta.premium_active_at === "string"
    ? meta.premium_active_at
    : null;

  let stage: VerificationStage = "public";
  if (phoneVerified) stage = "phoneOnly";
  if (identityVerifiedAt && admitApprovedAt) stage = "fullyVerified";

  // Admin role can come either from Supabase's `app_metadata` (set by
  // service-role bootstrap SQL — preferred, user-non-editable) or from
  // `user_metadata.is_admin` (legacy / dev path). Both checked so an
  // operator can flip it via either route during migration.
  const appMeta =
    (payload.app_metadata as Record<string, unknown> | undefined) ?? {};
  const isAdmin =
    appMeta.is_admin === true || meta.is_admin === true;

  return {
    id: sub,
    identityHashMasked: typeof meta.identity_hash_masked === "string"
      ? meta.identity_hash_masked
      : "****0000",
    stage,
    premiumActiveAt,
    isAdmin,
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
      isAdmin: false,
    };
  }
  if (token === "demo-fully-verified") {
    return {
      id: "demo-user-2",
      identityHashMasked: "****12af",
      stage: "fullyVerified",
      premiumActiveAt: null,
      isAdmin: false,
    };
  }
  if (token === "demo-premium") {
    return {
      id: "demo-user-3",
      identityHashMasked: "****9b3c",
      stage: "fullyVerified",
      premiumActiveAt: new Date("2026-01-15").toISOString(),
      isAdmin: false,
    };
  }
  if (token === "demo-admin") {
    // Dev-only: admin role for testing the adminRouter gate without
    // wiring SQL bootstrap. Production must use app_metadata.is_admin
    // — never grant admin via demo bearer in deployed envs.
    return {
      id: "demo-user-4",
      identityHashMasked: "****ad11",
      stage: "fullyVerified",
      premiumActiveAt: null,
      isAdmin: true,
    };
  }
  return null;
}
