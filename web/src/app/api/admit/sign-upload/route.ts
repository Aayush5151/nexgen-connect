import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { signUpload, isMockCloudflareImages } from "@/lib/cloudflare-images";
import { requireAuthedUser } from "@/lib/api-auth";
import { clientIp, enforceRateLimit } from "@/lib/rate-limit";

/**
 * POST /api/admit/sign-upload
 *
 * Server-side signed-upload URL for the admit letter. Client receives
 * the URL and PUTs the file directly to Cloudflare Images — bytes never
 * pass through our function.
 *
 * Auth: required. ownerId is bound to the authenticated user id so the
 * upload metadata lands in Cloudflare Images tagged correctly (was
 * "demo-user-1" placeholder in the original Bucket 6 stub).
 *
 * Input: { mimeType: string, fileSizeBytes: number }
 * Output: { uploadUrl, docId, retentionMinutesAfterReview }
 *
 * v16 web pivot §Bucket 6 / §Bucket 7 (auth wired).
 */

const inputSchema = z.object({
  mimeType: z.string().min(1),
  fileSizeBytes: z.number().int().min(1),
});

export async function POST(req: NextRequest) {
  const auth = await requireAuthedUser();
  if (!auth.user) return auth.response;

  // 5/min cap: typical funnel is 1 upload, retries up to 3. Higher
  // surfaces an obvious abuse signal.
  const rl = await enforceRateLimit({
    route: "admit-sign-upload",
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

  const result = await signUpload({
    mimeType: body.mimeType,
    fileSizeBytes: body.fileSizeBytes,
    ownerId: auth.user.id,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    uploadUrl: result.uploadUrl,
    docId: result.imageId,
    retentionMinutesAfterReview: result.retentionMinutesAfterReview,
    mock: result.mock || isMockCloudflareImages(),
  });
}
