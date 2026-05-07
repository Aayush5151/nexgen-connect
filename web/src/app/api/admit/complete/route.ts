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

  // Persist the doc id + admit_status on the user's metadata. Mock
  // mode (no Supabase service role) skips this — the AdminReviewTable
  // will then have nothing new to display, which is the right
  // behaviour for dev / preview without env wired.
  const useDb = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  let admin: ReturnType<typeof getSupabaseAdmin> | null = null;
  let priorMetadata: SignupMetadata = {};

  if (useDb) {
    try {
      admin = getSupabaseAdmin();
      const { data } = await admin.auth.admin.getUserById(auth.user.id);
      priorMetadata = ((data?.user?.user_metadata ?? {}) as SignupMetadata) || {};
      const next: SignupMetadata = {
        ...priorMetadata,
        admit_doc_id: body.docId,
        admit_status: "pending",
        signup_step: priorMetadata.signup_step === "complete"
          ? "complete"
          : "admit",
      };
      const { error } = await admin.auth.admin.updateUserById(auth.user.id, {
        user_metadata: next,
      });
      if (error) {
        console.warn("[api/admit/complete] metadata write failed:", error.message);
      }
    } catch (err) {
      console.warn("[api/admit/complete] db init failed:", err);
    }
  }

  // Best-effort vision parse. Fully feature-flagged + degrades to a
  // no-op return when unavailable. Failures here NEVER fail the route
  // — the founder can still review by hand.
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

    if (admin) {
      try {
        const { error } = await admin.auth.admin.updateUserById(auth.user.id, {
          user_metadata: {
            ...priorMetadata,
            admit_doc_id: body.docId,
            admit_status: "pending",
            admit_extracted: extractedSummary,
          },
        });
        if (error) {
          console.warn(
            "[api/admit/complete] extracted-fields write failed:",
            error.message,
          );
        }
      } catch (err) {
        console.warn("[api/admit/complete] extracted-fields catch:", err);
      }
    }
  }

  return NextResponse.json({
    reviewBy: new Date(Date.now() + 48 * 3600_000).toISOString(),
    queuePosition: 12,
    docId: body.docId,
    // Hand the client a tiny summary so the post-upload screen can
    // confirm "we read your letter — university, intake matched".
    // No PII beyond what they themselves uploaded.
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
