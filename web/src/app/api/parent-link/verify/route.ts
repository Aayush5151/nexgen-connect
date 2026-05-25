import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSameOrigin } from "@/lib/csrf";
import { verifyParentLinkToken } from "@/lib/parent-link-verify";

export const runtime = "nodejs";

/**
 * POST /api/parent-link/verify
 *
 * Thin route wrapper around verifyParentLinkToken (in @/lib/parent-link-
 * verify). The same function is called directly by /parent/[token]/page.tsx
 * — no self-fetch loop.
 *
 * Returns: VerifySuccess on hit, { ok:false, error:E081:invalid_token } on
 * any failure (generic error to avoid token enumeration).
 *
 * v16 web pivot §Bucket 8 — security hardening.
 */

const inputSchema = z.object({ token: z.string().min(8).max(4096) });

function generic(status = 400): NextResponse {
  return NextResponse.json(
    { ok: false, error: "E081:invalid_token" },
    { status },
  );
}

export async function POST(req: NextRequest) {
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
    return generic();
  }

  const result = await verifyParentLinkToken(body.token);
  if (!result.ok) {
    if (result.reason === "storage_unavailable") {
      return NextResponse.json(
        { ok: false, error: "E081:storage_unavailable" },
        { status: 503 },
      );
    }
    return generic();
  }

  return NextResponse.json(result);
}
