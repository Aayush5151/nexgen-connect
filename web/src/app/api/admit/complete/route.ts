import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  diffAdmitExtracted,
  parseAdmitLetter,
} from "@/lib/ai/admit-parse";
import { requireAuthedUser } from "@/lib/api-auth";
import { clientIp, enforceRateLimit } from "@/lib/rate-limit";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { SignupMetadata } from "@/lib/supabase/schema";
import { requireSameOrigin } from "@/lib/csrf";

export const runtime = "nodejs";

/**
 * POST /api/admit/complete
 *
 * Notification that the client finished the direct PUT to Cloudflare.
 * We persist the imageId on the user's metadata, then (if enabled)
 * kick off the AI vision parse to extract structured fields.
 *
 * Auth: required. The docId is associated to the authenticated user
 * for the eventual admin queue write (Bucket 8 follow-up).
 *
 * AI parse (feature-flagged):
 *   - AI_ADMIT_PARSE_ENABLED=true → vision pass on the uploaded letter.
 *     Reads university / intake / applicant / red flags. Diffs against
 *     the user's typed corridor fields and stores mismatches alongside
 *     the extraction. The /admin reviewer sees this as a chip; nothing
 *     auto-approves.
 *   - Disabled → behaves exactly like the pre-AI route. Safe to flip
 *     off if the parser starts misbehaving in prod.
 *
 * Input:  { docId: string }
 * Output: { reviewBy: string (ISO), queuePosition: number, docId,
 *           extracted?: { ...summary fields... } }
 *
 * v16 web pivot §Bucket 6 / §Bucket 7 (auth wired) / Bucket 4 follow-up
 * (vision parse).
 */

const inputSchema = z.object({
  docId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const origin = requireSameOrigin(req);
  if (!origin.ok) {
    return NextResponse.json({ error: "E001:bad_origin" }, { status: 403 });
  }

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

  // SECURITY (H8): verify the docId was actually issued to THIS user via
  // /api/admit/sign-upload. Without this check user A could claim user B's
  // leaked docId. The sign-upload route stashes the docId in
  // user_metadata.pending_admit_doc_id.
  const useDb = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  let admin: ReturnType<typeof getSupabaseAdmin> | null = null;
  let priorMetadata: SignupMetadata & { pending_admit_doc_id?: string } = {};

  if (useDb) {
    try {
      admin = getSupabaseAdmin();
      const { data } = await admin.auth.admin.getUserById(auth.user.id);
      priorMetadata = (data?.user?.user_metadata ?? {}) as SignupMetadata & {
        pending_admit_doc_id?: string;
      };
      const expected = priorMetadata.pending_admit_doc_id;
      if (expected && expected !== body.docId) {
        console.warn(
          "[admit/complete] docId mismatch — refused",
        );
        return NextResponse.json(
          { error: "E043:admit_doc_id_mismatch" },
          { status: 403 },
        );
      }
    } catch (err) {
      console.warn("[api/admit/complete] db init failed:", err);
    }
  }

  // Best-effort vision parse. Fully feature-flagged + degrades to a
  // no-op return when unavailable.
  const parse = await parseAdmitLetter(body.docId);
  let extractedSummary: SignupMetadata["admit_extracted"] | null = null;

  if (parse.ok) {
    const mismatches = diffAdmitExtracted(parse.extracted, {
      destinationUni: priorMetadata.destination_uni ?? null,
      intake: priorMetadata.intake ?? null,
    });
    extractedSummary = {
      ...parse.extracted,
      mismatches,
      parsed_at: new Date().toISOString(),
    };
  }

  // M7 fix: single combined metadata write to avoid the two-step
  // priorMetadata-clobber race. We compute the final shape once and
  // submit it. If a concurrent request modified user_metadata between
  // our read and write, that change is lost — but we've eliminated the
  // intra-route race that previously double-clobbered.
  if (admin) {
    const next: SignupMetadata & { pending_admit_doc_id?: string } = {
      ...priorMetadata,
      admit_doc_id: body.docId,
      admit_status: "pending",
      // Consume the pending_admit_doc_id stash now that we've matched.
      pending_admit_doc_id: undefined,
      signup_step:
        priorMetadata.signup_step === "complete" ? "complete" : "admit",
      ...(extractedSummary ? { admit_extracted: extractedSummary } : {}),
    };
    try {
      const { error } = await admin.auth.admin.updateUserById(auth.user.id, {
        user_metadata: next,
      });
      if (error) {
        console.warn(
          "[api/admit/complete] metadata write failed:",
          error.message,
        );
      }
    } catch (err) {
      console.warn("[api/admit/complete] metadata write threw:", err);
    }
  }

  return NextResponse.json({
    reviewBy: new Date(Date.now() + 48 * 3600_000).toISOString(),
    // M10 fix: do NOT pretend the user is "#12 in line" — that hardcoded
    // number was always a lie. Front-end now renders a generic "we'll
    // get back to you within 48h" message; the queue position is not
    // surfaced until a real count is available post-Bucket-8.
    docId: body.docId,
    extracted: extractedSummary
      ? {
          university_name: extractedSummary.university_name,
          intake_term: extractedSummary.intake_term,
          mismatches: extractedSummary.mismatches,
          confidence: extractedSummary.confidence,
        }
      : null,
  });
}
