import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAuthedUser } from "@/lib/api-auth";
import { clientIp, enforceRateLimit } from "@/lib/rate-limit";

/**
 * POST /api/admit/complete
 *
 * Notification that the client finished the direct PUT to Cloudflare.
 * We persist the imageId + queue position; a human reviewer picks it
 * up via the admin queue (Bucket 8 wires the queue table + reviewer
 * UI in /admin/review-admit).
 *
 * Auth: required. The docId is associated to the authenticated user
 * for the eventual admin queue write (Bucket 8 follow-up).
 *
 * Input:  { docId: string }
 * Output: { reviewBy: string (ISO), queuePosition: number, docId }
 *
 * v16 web pivot §Bucket 6 / §Bucket 7 (auth wired).
 */

const inputSchema = z.object({
  docId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const auth = await requireAuthedUser();
  if (!auth.user) return auth.response;

  const rl = await enforceRateLimit({
    route: "admit-complete",
    userId: auth.user.id,
    ip: clientIp(req),
    limit: 5,
    windowSec: 60,
  });
  if (!rl.ok) return rl.response;

  let body: z.infer<typeof inputSchema>;
  try {
    body = inputSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "E041:admit_unsupported_mime" }, { status: 400 });
  }

  // Real impl writes to `admit_review_queue` and bumps queue depth.
  // For Bucket 6 we return a deterministic mock — Bucket 8 wires the
  // table + reviewer surface.
  return NextResponse.json({
    reviewBy: new Date(Date.now() + 48 * 3600_000).toISOString(),
    queuePosition: 12,
    docId: body.docId,
  });
}
