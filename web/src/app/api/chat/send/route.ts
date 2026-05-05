import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * POST /api/chat/send
 *
 * Inserts a row into chat_message. RLS guards membership: only thread
 * members can insert with their own user_id. The Realtime publication
 * pushes the new row to subscribers.
 *
 * Mock fallback: when Supabase isn't configured, returns a deterministic
 * fake message (the chat thread page's local state still shows it).
 *
 * Input: { threadId: string, content: string }
 *
 * v16 web pivot §Bucket 7.
 */

const inputSchema = z.object({
  threadId: z.string().uuid(),
  content: z.string().min(1).max(4000),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof inputSchema>;
  try {
    body = inputSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "E071:invalid_chat_input" }, { status: 400 });
  }

  // Real path: read the SSR Supabase client, insert into chat_message
  // with the authenticated user_id derived from the cookie. Bucket 8
  // wires the Supabase SSR helper here so the RLS context is right.
  if (process.env.NEXT_PUBLIC_USE_REAL_REALTIME !== "true") {
    return NextResponse.json({
      id: crypto.randomUUID(),
      threadId: body.threadId,
      userId: "demo-user-1",
      authorFirstName: "You",
      content: body.content,
      sentAt: new Date().toISOString(),
      isOwn: true,
      mock: true,
    });
  }

  return NextResponse.json(
    { error: "E071:realtime_not_yet_wired" },
    { status: 501 },
  );
}
