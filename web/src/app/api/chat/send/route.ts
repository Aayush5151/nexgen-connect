import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { inngest } from "@/lib/inngest/client";
import { requireAuthedUser } from "@/lib/api-auth";
import { clientIp, enforceRateLimit } from "@/lib/rate-limit";
import { requireSameOrigin } from "@/lib/csrf";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * POST /api/chat/send
 *
 * Inserts a row into chat_message. RLS guards membership: only thread
 * members can insert with their own user_id. The Realtime publication
 * pushes the new row to subscribers.
 *
 * Auth: required. senderId comes from the authenticated user (was
 * "demo-user-1" placeholder in the original Bucket 7 stub).
 *
 * Mock fallback: when Supabase Realtime isn't configured, returns a
 * deterministic fake message (the chat thread page's local state
 * still shows it).
 *
 * Input: { threadId: string, content: string }
 *
 * v16 web pivot §Bucket 7 (auth wired).
 */

const inputSchema = z.object({
  threadId: z.string().uuid(),
  content: z.string().min(1).max(4000),
});

export async function POST(req: NextRequest) {
  const origin = requireSameOrigin(req);
  if (!origin.ok) {
    return NextResponse.json({ error: "E001:bad_origin" }, { status: 403 });
  }

  const auth = await requireAuthedUser();
  if (!auth.user) return auth.response;

  // Chat is high-frequency in normal use. 60/min covers spirited
  // conversation while stopping a runaway client / abuse loop.
  const rl = await enforceRateLimit({
    route: "chat-send",
    userId: auth.user.id,
    ip: clientIp(req),
    limit: 60,
    windowSec: 60,
  });
  if (!rl.ok) return rl.response;

  let body: z.infer<typeof inputSchema>;
  try {
    body = inputSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "E071:invalid_chat_input" }, { status: 400 });
  }

  // SECURITY (H6): thread-membership check. Without this, any authed
  // user could fire chat/message.sent against any threadId — triggering
  // push fan-out to that thread's members. We gate via Supabase service-
  // role lookup against `chat_thread_member` (created in Bucket 8 wiring).
  // When the table doesn't exist yet (pre-Bucket-8), we refuse to emit
  // Inngest at all — better no push than spurious push.
  let isMember = false;
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const admin = getSupabaseAdmin();
      const { data, error } = await admin
        .from("chat_thread_member")
        .select("user_id")
        .eq("thread_id", body.threadId)
        .eq("user_id", auth.user.id)
        .maybeSingle();
      if (error) {
        // Table likely doesn't exist yet — fail-closed (no membership
        // implies no fan-out below).
        isMember = false;
      } else {
        isMember = !!data;
      }
    } catch {
      isMember = false;
    }
  }

  // Real path: read the SSR Supabase client, insert into chat_message
  // with the authenticated user_id derived from the cookie. Bucket 8
  // wires the Supabase SSR helper here so the RLS context is right.
  if (process.env.NEXT_PUBLIC_USE_REAL_REALTIME !== "true") {
    const messageId = crypto.randomUUID();

    // Only fan out via Inngest if the user is a verified member of the
    // thread. Mock mode without DB → no fan-out, message echoes locally
    // only. This eliminates the "anyone authed can spam push to any
    // threadId" abuse vector.
    if (isMember) {
      try {
        await inngest.send({
          name: "chat/message.sent",
          data: {
            messageId,
            corridorId: body.threadId,
            senderId: auth.user.id,
            bodyExcerpt: body.content.slice(0, 140),
          },
        });
      } catch (err) {
        console.warn("[chat.send] inngest emit failed:", err);
      }
    }

    return NextResponse.json({
      id: messageId,
      threadId: body.threadId,
      userId: auth.user.id,
      authorFirstName: "You",
      content: body.content,
      sentAt: new Date().toISOString(),
      isOwn: true,
      mock: true,
    });
  }

  if (!isMember) {
    return NextResponse.json(
      { error: "E072:not_thread_member" },
      { status: 403 },
    );
  }

  return NextResponse.json(
    { error: "E071:realtime_not_yet_wired" },
    { status: 501 },
  );
}
