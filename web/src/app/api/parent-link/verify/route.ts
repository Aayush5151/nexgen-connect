import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { requireSameOrigin } from "@/lib/csrf";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * POST /api/parent-link/verify
 *
 * Server-side verification of a parent magic-link token.
 *
 * Token format (from web/src/lib/parent-link.ts signToken):
 *   `<base64url(payload)>.<HMAC-SHA256(secret, payload)>`
 * where payload is `<ownerId>.<expiresAtMs>.<random>`.
 *
 * Checks (in order, fail-closed):
 *   1. Token splits into payloadB64 + sig
 *   2. HMAC-SHA256(PARENT_LINK_SECRET, payload) === sig (timingSafeEqual)
 *   3. expiresAtMs > now
 *   4. SHA-256(token) matches a row in `parent_link`
 *   5. row.used_at IS NULL
 *   6. atomic UPDATE used_at=now() WHERE used_at IS NULL (single-use)
 *
 * On success returns the read-only student snapshot. Failure modes
 * always return a generic E081:invalid_token to avoid enumeration.
 *
 * MOCK PATH: returns deterministic demo data ONLY in non-production
 * environments. Production refuses the mock path unconditionally —
 * the previous design returned mock data for any token ≥ 8 chars
 * regardless of env, which leaked a real-looking parent dashboard
 * to anyone with curl.
 *
 * v16 web pivot §Bucket 8 — security hardening.
 */

const inputSchema = z.object({ token: z.string().min(8).max(4096) });

function inProd(): boolean {
  return (
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production"
  );
}

function genericFail(): NextResponse {
  return NextResponse.json(
    { ok: false, error: "E081:invalid_token" },
    { status: 400 },
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

export async function POST(req: NextRequest) {
  // CSRF / origin guard for mutating-ish (single-use mark) route.
  const origin = requireSameOrigin(req);
  if (!origin.ok) {
    return NextResponse.json(
      { ok: false, error: "E001:bad_origin" },
      { status: 403 },
    );
  }

  let body: z.infer<typeof inputSchema>;
  try {
    body = inputSchema.parse(await req.json());
  } catch {
    return genericFail();
  }

  // Mock path — non-production only. Real users in prod never reach this.
  if (!inProd() && process.env.NEXT_PUBLIC_USE_REAL_RESEND !== "true") {
    const tokenHash = createHash("sha256").update(body.token).digest("hex");
    return NextResponse.json({
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
    });
  }

  // Real path. HMAC-verify first to short-circuit forgeries before any DB read.
  const hmac = verifyHmac(body.token);
  if (!hmac) return genericFail();

  // Parse payload: `<ownerId>.<expiresAtMs>.<random>`
  const parts = hmac.payload.split(".");
  if (parts.length < 3) return genericFail();
  const ownerId = parts[0];
  const expiresAtMs = Number(parts[1]);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= Date.now()) {
    return genericFail();
  }

  // Storage lookup: tokenHash, single-use, not expired.
  const tokenHash = createHash("sha256").update(body.token).digest("hex");
  let admin: ReturnType<typeof getSupabaseAdmin>;
  try {
    admin = getSupabaseAdmin();
  } catch {
    // Service-role not configured — refuse rather than fall back to mock.
    return NextResponse.json(
      { ok: false, error: "E081:storage_unavailable" },
      { status: 503 },
    );
  }

  // Atomic single-use: UPDATE … SET used_at=now() WHERE token_hash=? AND
  // used_at IS NULL AND expires_at > now() RETURNING owner_id.
  const { data: marked, error: markErr } = await admin
    .from("parent_link")
    .update({ used_at: new Date().toISOString() })
    .eq("token_hash", tokenHash)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .select("owner_id")
    .maybeSingle();

  if (markErr || !marked || marked.owner_id !== ownerId) {
    return genericFail();
  }

  // Snapshot of student state. Read the waitlist row by owner_id; project
  // only the fields the parent surface is allowed to see.
  const { data: student } = await admin
    .from("waitlist")
    .select(
      "first_name, destination_uni, identity_status, admit_status",
    )
    .eq("user_id", ownerId)
    .maybeSingle();

  return NextResponse.json({
    ok: true,
    studentFirstName: student?.first_name ?? "Student",
    studentUni: student?.destination_uni ?? "(university unset)",
    verified:
      student?.identity_status === "verified" &&
      student?.admit_status === "approved",
    groupSize: null,
    arrival: null,
    tokenHashPrefix: tokenHash.slice(0, 8),
  });
}
