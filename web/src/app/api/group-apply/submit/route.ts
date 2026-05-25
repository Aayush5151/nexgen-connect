import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAuthedUser } from "@/lib/api-auth";
import { clientIp, enforceRateLimit } from "@/lib/rate-limit";
import { requireSameOrigin } from "@/lib/csrf";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * POST /api/group-apply/submit
 *
 * Sends the group's bundle to the chosen PBSA partner. Real integration
 * lands in Bucket 8 (partner-specific webhook URLs + auth headers).
 *
 * Auth: required. Without it, anyone could POST a forged groupId and
 * trigger a partner webhook (or fill mock storage) under our brand.
 *
 * Premium gate: checked here. Only premium=active users can submit a
 * group. The check itself is mocked until the SSR Supabase helper lands.
 *
 * Input: { groupId: string }
 * Output: { partnerSlug, submittedAt, expectedReplyBy }
 *
 * v16 web pivot §Bucket 8 (auth wired).
 */

const inputSchema = z.object({
  groupId: z.string().uuid(),
});

const PARTNER_WEBHOOK: Record<string, string | undefined> = {
  aparto: process.env.PARTNER_APARTO_WEBHOOK_URL,
  yugo: process.env.PARTNER_YUGO_WEBHOOK_URL,
  fresh: process.env.PARTNER_FRESH_WEBHOOK_URL,
  mezzino: process.env.PARTNER_MEZZINO_WEBHOOK_URL,
};

export async function POST(req: NextRequest) {
  const origin = requireSameOrigin(req);
  if (!origin.ok) {
    return NextResponse.json({ error: "E001:bad_origin" }, { status: 403 });
  }

  const auth = await requireAuthedUser();
  if (!auth.user) return auth.response;

  // Submission is the action that costs us — partner webhook fan-out
  // + admin attention. 3/hour bounds spam without blocking legit
  // retry on partner failure.
  const rl = await enforceRateLimit({
    route: "group-apply-submit",
    userId: auth.user.id,
    ip: clientIp(req),
    limit: 3,
    windowSec: 3600,
  });
  if (!rl.ok) return rl.response;

  let body: z.infer<typeof inputSchema>;
  try {
    body = inputSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "E082:invalid_group_id" }, { status: 400 });
  }

  // SECURITY (H7): premium + ownership check.
  //   - Premium: only paid users can submit (matches the v15 BP §6.2 plan)
  //   - Ownership: only the cluster lead (group_apply.lead_user_id) can
  //     submit FOR that groupId
  // Without both, any authed user could trigger partner-side submissions
  // for any UUID they guess.
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = getSupabaseAdmin();

    // Premium: read user_metadata.premium_active_at
    const { data: userRes } = await admin.auth.admin.getUserById(auth.user.id);
    const premiumActiveAt =
      (userRes?.user?.user_metadata as Record<string, unknown> | undefined)?.[
        "premium_active_at"
      ];
    if (typeof premiumActiveAt !== "string" || !premiumActiveAt) {
      return NextResponse.json(
        { error: "E082:premium_required" },
        { status: 402 },
      );
    }

    // Ownership: cluster lead lookup. Fail-closed if table doesn't yet
    // exist (Bucket 8) — refuse the submit rather than allow.
    try {
      const { data: group, error } = await admin
        .from("group_apply")
        .select("lead_user_id")
        .eq("id", body.groupId)
        .maybeSingle<{ lead_user_id: string }>();
      if (error) {
        // table not provisioned yet — refuse rather than allow
        return NextResponse.json(
          { error: "E082:group_apply_not_yet_wired" },
          { status: 501 },
        );
      }
      if (!group || group.lead_user_id !== auth.user.id) {
        return NextResponse.json(
          { error: "E082:not_cluster_lead" },
          { status: 403 },
        );
      }
    } catch {
      return NextResponse.json(
        { error: "E082:group_apply_lookup_failed" },
        { status: 500 },
      );
    }
  }

  // Real path: POST bundle to PARTNER_<SLUG>_WEBHOOK_URL with HMAC
  // signature. Bucket 8 wires the partner-specific schema; this route
  // is the dispatch point.
  const partnerSlug = "aparto";
  const webhookUrl = PARTNER_WEBHOOK[partnerSlug];

  if (!webhookUrl) {
    // Mock fallback for dev / preview — pretend we submitted.
    return NextResponse.json({
      partnerSlug,
      submittedAt: new Date().toISOString(),
      expectedReplyBy: new Date(Date.now() + 5 * 24 * 3600_000).toISOString(),
      submittedByUserId: auth.user.id,
      mock: true,
      groupId: body.groupId,
    });
  }

  return NextResponse.json(
    { error: "E082:partner_webhook_not_yet_wired" },
    { status: 501 },
  );
}
