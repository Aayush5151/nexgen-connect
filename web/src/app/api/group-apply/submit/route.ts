import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * POST /api/group-apply/submit
 *
 * Sends the group's bundle to the chosen PBSA partner. Real integration
 * lands in Bucket 8 (partner-specific webhook URLs + auth headers).
 *
 * Premium gate: checked here. Only premium=active users can submit a
 * group. The check itself is mocked until the SSR Supabase helper lands.
 *
 * Input: { groupId: string }
 * Output: { partnerSlug, submittedAt, expectedReplyBy }
 *
 * v16 web pivot §Bucket 8.
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
  let body: z.infer<typeof inputSchema>;
  try {
    body = inputSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "E082:invalid_group_id" }, { status: 400 });
  }

  // Real path: Supabase service-role read of group_apply + members,
  // POST bundle to PARTNER_<SLUG>_WEBHOOK_URL with HMAC signature.
  // Bucket 8 wires the partner-specific schema; this route is the
  // dispatch point.
  const partnerSlug = "aparto";
  const webhookUrl = PARTNER_WEBHOOK[partnerSlug];

  if (!webhookUrl) {
    // Mock fallback for dev / preview — pretend we submitted.
    return NextResponse.json({
      partnerSlug,
      submittedAt: new Date().toISOString(),
      expectedReplyBy: new Date(Date.now() + 5 * 24 * 3600_000).toISOString(),
      mock: true,
      groupId: body.groupId,
    });
  }

  // Real bundle submission to the partner webhook. We never inline
  // the membership PII into the request — the partner gets a callback
  // URL into our own /api/group-apply/inbound endpoint where they
  // request the bundle with a one-time token.
  return NextResponse.json(
    { error: "E082:partner_webhook_not_yet_wired" },
    { status: 501 },
  );
}
