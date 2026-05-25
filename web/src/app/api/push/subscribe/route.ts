import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAuthedUser } from "@/lib/api-auth";
import { clientIp, enforceRateLimit } from "@/lib/rate-limit";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireSameOrigin } from "@/lib/csrf";

export const runtime = "nodejs";

/**
 * POST /api/push/subscribe
 *
 * Persists a Web Push subscription. The browser hands us:
 *   { endpoint, keys: { p256dh, auth } }
 *
 * Auth: required. The subscription must be tied to a known user so
 * the push-fanout job can target the right corridor — without auth,
 * anyone could plant arbitrary endpoints in our table.
 *
 * We store one row per (user_id, endpoint) and upsert on the unique
 * constraint declared in 0008_push_subscription.sql. Re-subscribing
 * (same browser, same user, after a permission flip-flop) overwrites
 * the prior keys + clears any failure markers from the fan-out job.
 *
 * Used by the push-fanout Inngest job to deliver:
 *   group_unlocked   — corridor crossed verified ≥ 60
 *   admit_approved   — reviewer approved the admit letter
 *   ts_replied       — T&S advisor responded
 *   parent_link_sent — parent magic-link generated
 *
 * v16 web pivot §Bucket 9 (auth wired) + Bucket 4 follow-up (real insert).
 */

const inputSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

const MAX_USER_AGENT_CHARS = 240;

export async function POST(req: NextRequest) {
  const origin = requireSameOrigin(req);
  if (!origin.ok) {
    return NextResponse.json({ error: "E001:bad_origin" }, { status: 403 });
  }

  const auth = await requireAuthedUser();
  if (!auth.user) return auth.response;

  // Subscriptions arrive once per browser/device per user; 10/min
  // covers re-subscribe + multi-device legitimately.
  const rl = await enforceRateLimit({
    route: "push-subscribe",
    userId: auth.user.id,
    ip: clientIp(req),
    limit: 10,
    windowSec: 60,
  });
  if (!rl.ok) return rl.response;

  let body: z.infer<typeof inputSchema>;
  try {
    body = inputSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "E091:invalid_subscription" }, { status: 400 });
  }

  // Bounded user-agent for the optional UI label. Truncate before
  // persistence so a hostile UA string can't bloat the row.
  const userAgent =
    req.headers.get("user-agent")?.slice(0, MAX_USER_AGENT_CHARS) ?? null;

  // Service-role insert. The push_subscription table has RLS enabled
  // and only the service role writes — the SSR-auth'd user is the
  // subject (user_id), the actor is the server.
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // Dev / preview without service role: ack and skip persistence.
    // The fan-out job is a no-op without rows anyway.
    return NextResponse.json({
      ok: true,
      mock: true,
      userId: auth.user.id,
      endpointHashPrefix: body.endpoint.slice(0, 32),
    });
  }

  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from("push_subscription")
      .upsert(
        {
          user_id: auth.user.id,
          endpoint: body.endpoint,
          p256dh: body.keys.p256dh,
          auth: body.keys.auth,
          user_agent: userAgent,
          // Re-subscribing always clears the failure markers — the
          // browser handed us a fresh endpoint, so any prior 404/410
          // is no longer relevant.
          last_failure_at: null,
          last_failure_code: null,
        },
        { onConflict: "user_id,endpoint" },
      );
    if (error) {
      console.error("[api/push/subscribe] upsert failed:", error.message);
      return NextResponse.json(
        { error: "E092:push_subscribe_failed" },
        { status: 502 },
      );
    }
  } catch (err) {
    console.error("[api/push/subscribe] catch:", err);
    return NextResponse.json(
      { error: "E092:push_subscribe_failed" },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    userId: auth.user.id,
    endpointHashPrefix: body.endpoint.slice(0, 32),
  });
}
