import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Shared parent-link token verifier — single source of truth used by
 * BOTH /api/parent-link/verify/route.ts (when a browser POSTs) and
 * /parent/[token]/page.tsx (Server Component rendering the dashboard
 * directly without a network round-trip).
 *
 * M12 fix: previously the page Server Component would `fetch()` its own
 * /api route, which was wasteful and fragile to host-header injection.
 * Now both surfaces call this function directly.
 *
 * Token format (from web/src/lib/parent-link.ts signToken):
 *   `<base64url(payload)>.<HMAC-SHA256(secret, payload)>`
 * where payload is `<ownerId>.<expiresAtMs>.<random>`.
 *
 * Checks (fail-closed, in order):
 *   1. Token splits into payloadB64 + sig
 *   2. HMAC-SHA256(PARENT_LINK_SECRET, payload) === sig (timingSafeEqual)
 *   3. expiresAtMs > now
 *   4. SHA-256(token) matches a row in `parent_link`
 *   5. row.used_at IS NULL AND row.expires_at > now()
 *   6. atomic UPDATE used_at=now() RETURNING owner_id
 */

export type VerifySuccess = {
  ok: true;
  studentFirstName: string;
  studentUni: string;
  groupSize: number | null;
  verified: boolean;
  arrival: {
    airport: string | null;
    scheduledAt: string | null;
    status: string;
  } | null;
  tokenHashPrefix: string;
};

export type VerifyFailure = { ok: false; reason: string };

export type VerifyResult = VerifySuccess | VerifyFailure;

function inProd(): boolean {
  return (
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production"
  );
}

function verifyHmac(token: string): { payload: string } | null {
  const secret = process.env.PARENT_LINK_SECRET;
  if (!secret) return null;
  const lastDot = token.lastIndexOf(".");
  if (lastDot < 1) return null;
  const payloadB64 = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);
  let payload: string;
  try {
    payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  } catch {
    return null;
  }
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  if (expected.length !== sig.length) return null;
  try {
    if (!timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null;
  } catch {
    return null;
  }
  return { payload };
}

const MIN_TOKEN = 8;
const MAX_TOKEN = 4096;

export async function verifyParentLinkToken(
  token: string,
): Promise<VerifyResult> {
  if (
    typeof token !== "string" ||
    token.length < MIN_TOKEN ||
    token.length > MAX_TOKEN
  ) {
    return { ok: false, reason: "invalid_token" };
  }

  // Mock path — non-production only. Real users in prod never reach this.
  if (!inProd() && process.env.NEXT_PUBLIC_USE_REAL_RESEND !== "true") {
    const tokenHash = createHash("sha256").update(token).digest("hex");
    return {
      ok: true,
      studentFirstName: "Demo",
      studentUni: "University College Dublin",
      groupSize: 4,
      verified: true,
      arrival: {
        airport: "DUB",
        scheduledAt: new Date(Date.now() + 7 * 24 * 3600_000).toISOString(),
        status: "scheduled",
      },
      tokenHashPrefix: tokenHash.slice(0, 8),
    };
  }

  // Real path.
  const hmac = verifyHmac(token);
  if (!hmac) return { ok: false, reason: "invalid_token" };

  const parts = hmac.payload.split(".");
  if (parts.length < 3) return { ok: false, reason: "invalid_token" };
  const ownerId = parts[0];
  const expiresAtMs = Number(parts[1]);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= Date.now()) {
    return { ok: false, reason: "invalid_token" };
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");
  let admin: ReturnType<typeof getSupabaseAdmin>;
  try {
    admin = getSupabaseAdmin();
  } catch {
    return { ok: false, reason: "storage_unavailable" };
  }

  // Atomic single-use mark.
  const { data: marked, error: markErr } = await admin
    .from("parent_link")
    .update({ used_at: new Date().toISOString() })
    .eq("token_hash", tokenHash)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .select("owner_id")
    .maybeSingle();

  if (markErr || !marked || marked.owner_id !== ownerId) {
    return { ok: false, reason: "invalid_token" };
  }

  // Student snapshot.
  const { data: student } = await admin
    .from("waitlist")
    .select("first_name, destination_uni, identity_status, admit_status")
    .eq("user_id", ownerId)
    .maybeSingle<{
      first_name: string | null;
      destination_uni: string | null;
      identity_status: string | null;
      admit_status: string | null;
    }>();

  return {
    ok: true,
    studentFirstName: student?.first_name ?? "Student",
    studentUni: student?.destination_uni ?? "(university unset)",
    verified:
      student?.identity_status === "verified" &&
      student?.admit_status === "approved",
    groupSize: null,
    arrival: null,
    tokenHashPrefix: tokenHash.slice(0, 8),
  };
}
