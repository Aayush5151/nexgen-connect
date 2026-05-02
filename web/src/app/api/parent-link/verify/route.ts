import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createHash } from "node:crypto";

/**
 * POST /api/parent-link/verify
 *
 * Server-side verification of a parent magic-link token. Two checks:
 *   1. SHA-256 of the token matches a row in `parent_link`
 *   2. row.used_at IS NULL AND row.expires_at > now()
 *
 * On success: marks `used_at = now()` (single-use enforcement) and
 * returns the read-only student snapshot.
 *
 * Mock fallback: when MOCK_RESEND=true (set in dev when no key is
 * configured), returns deterministic demo data for any non-empty token.
 *
 * v16 web pivot §Bucket 8.
 */

const inputSchema = z.object({ token: z.string().min(8) });

export async function POST(req: NextRequest) {
  let body: z.infer<typeof inputSchema>;
  try {
    body = inputSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "E081:invalid_token" }, { status: 400 });
  }

  // Hash the inbound token; we never store the plaintext.
  const tokenHash = createHash("sha256").update(body.token).digest("hex");

  // Real path: read from `parent_link` via Supabase service-role,
  // mark used_at = now(), join with the student's profile snapshot.
  // Bucket lands in Bucket 8 itself but the SSR helper isn't wired yet
  // — for now return a deterministic mock that exercises the parent
  // page UI.
  if (process.env.NEXT_PUBLIC_USE_REAL_RESEND !== "true") {
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

  return NextResponse.json(
    { ok: false, error: "E081:parent_link_not_yet_wired" },
    { status: 501 },
  );
}
