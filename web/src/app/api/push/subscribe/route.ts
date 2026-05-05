import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * POST /api/push/subscribe
 *
 * Persists a Web Push subscription. The browser hands us:
 *   { endpoint, keys: { p256dh, auth } }
 *
 * We store one row per (user_id, endpoint). Bucket 8 wires the table;
 * Bucket 11 wires the cron + worker that actually fan out push from
 * each trigger:
 *   group_unlocked   — corridor crossed verified ≥ 60
 *   admit_approved   — reviewer approved the admit letter
 *   ts_replied       — T&S advisor responded
 *   parent_link_sent — parent magic-link generated
 *
 * v16 web pivot §Bucket 9.
 */

const inputSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof inputSchema>;
  try {
    body = inputSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "E091:invalid_subscription" }, { status: 400 });
  }

  // Upsert by endpoint. The endpoint is unique-per-(user, browser, device).
  // Real path uses Supabase service-role; mock acks.
  return NextResponse.json({
    ok: true,
    mock: true,
    endpointHashPrefix: body.endpoint.slice(0, 32),
  });
}
