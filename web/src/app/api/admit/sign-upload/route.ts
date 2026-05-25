import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { signUpload, isMockCloudflareImages } from "@/lib/cloudflare-images";
import { requireAuthedUser } from "@/lib/api-auth";
import { clientIp, enforceRateLimit } from "@/lib/rate-limit";
import { requireSameOrigin } from "@/lib/csrf";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { SignupMetadata } from "@/lib/supabase/schema";

export const runtime = "nodejs";

/** Max admit-letter file size in bytes. Cloudflare Images caps at 10 MB
 *  per file but we accept smaller (most uni admits are 2–5 MB PDFs). */
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB

/** Whitelist of allowed MIME types. Anything else is rejected before
 *  we even hit Cloudflare. The client also enforces this but server is
 *  authoritative — never trust the browser. */
const ALLOWED_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "application/pdf",
]);

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
  const origin = requireSameOrigin(req);
  if (!origin.ok) {
    return NextResponse.json({ error: "E001:bad_origin" }, { status: 403 });
  }

  const auth = await requireAuthedUser();
  if (!auth.user) return auth.response;

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

  // Server-side MIME + size validation. The client also checks these, but
  // the server is authoritative. Cloudflare Images does additional content
  // validation on actual bytes (rejects non-image, non-PDF), but our
  // function shouldn't even sign an upload URL for a too-large or wrong
  // MIME claim.
  if (!ALLOWED_MIMES.has(body.mimeType)) {
    return NextResponse.json(
      { error: "E041:admit_unsupported_mime" },
      { status: 400 },
    );
  }
  if (body.fileSizeBytes > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "E042:admit_file_too_large" },
      { status: 400 },
    );
  }

  const result = await signUpload({
    mimeType: body.mimeType,
    fileSizeBytes: body.fileSizeBytes,
    ownerId: auth.user.id,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  // SECURITY (H8): persist the (user_id, docId) binding so /api/admit/
  // complete can reject docIds the caller didn't actually upload. Without
  // this, user A who learns user B's docId could claim it as their own
  // admit letter. We stash in user_metadata.pending_admit_doc_id so the
  // service-role write is minimal — a dedicated table would be cleaner
  // but Bucket 8 hasn't landed yet.
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const admin = getSupabaseAdmin();
      const { data: cur } = await admin.auth.admin.getUserById(auth.user.id);
      const meta = (cur?.user?.user_metadata ?? {}) as SignupMetadata & {
        pending_admit_doc_id?: string;
      };
      await admin.auth.admin.updateUserById(auth.user.id, {
        user_metadata: { ...meta, pending_admit_doc_id: result.imageId },
      });
    } catch (err) {
      // Non-fatal — the docId is still tied to ownerId in Cloudflare
      // Images metadata at upload time; complete route can fall back to
      // that. Log + continue.
      console.warn("[sign-upload] pending_admit_doc_id stash failed:", err);
    }
  }

  return NextResponse.json({
    uploadUrl: result.uploadUrl,
    docId: result.imageId,
    retentionMinutesAfterReview: result.retentionMinutesAfterReview,
    mock: result.mock || isMockCloudflareImages(),
  });
}
