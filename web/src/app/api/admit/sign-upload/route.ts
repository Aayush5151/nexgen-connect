import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { signUpload, isMockCloudflareImages } from "@/lib/cloudflare-images";

/**
 * POST /api/admit/sign-upload
 *
 * Server-side signed-upload URL for the admit letter. Client receives
 * the URL and PUTs the file directly to Cloudflare Images — bytes never
 * pass through our function.
 *
 * Input: { mimeType: string, fileSizeBytes: number }
 * Output: { uploadUrl, docId, retentionMinutesAfterReview }
 *
 * v16 web pivot §Bucket 6.
 */

const inputSchema = z.object({
  mimeType: z.string().min(1),
  fileSizeBytes: z.number().int().min(1),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof inputSchema>;
  try {
    body = inputSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "E041:admit_unsupported_mime" }, { status: 400 });
  }

  // ownerId placeholder — Bucket 7 reads the authenticated user from
  // the Supabase SSR cookie instead of accepting a client-supplied id.
  const ownerId = "demo-user-1";

  const result = await signUpload({
    mimeType: body.mimeType,
    fileSizeBytes: body.fileSizeBytes,
    ownerId,
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
