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

export type Context = {
  user: AuthedUser | null;
  reqId: string;
  now: Date;
  /** Stand-in for db client until Supabase wires (Bucket 4 follow-up). */
  db: unknown | null;
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

  return {
    user: token ? _mockUserFor(token) : null,
    reqId: crypto.randomUUID(),
    now: new Date(),
    db: null,
  };
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
