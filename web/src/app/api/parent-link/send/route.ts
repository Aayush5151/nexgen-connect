import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { sendParentMagicLink, isMockResend } from "@/lib/parent-link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SignupMetadata } from "@/lib/supabase/schema";
import { clientIp, enforceRateLimit } from "@/lib/rate-limit";

/**
 * POST /api/parent-link/send
 *
 * Generates a single-use magic-link, signs it, persists the row, and
 * sends the email through Resend. The link path is `/parent/[token]`.
 *
 * Auth: required. The route mails from our verified Resend sender
 * domain — without an auth gate, any unauthenticated POST would let
 * an attacker spam arbitrary inboxes with what looks like a legitimate
 * "<student> added you as a parent on NexGen Connect" email under our
 * brand. Reads `first_name` + `destination_uni` from the authenticated
 * user's `auth.users.user_metadata` so the email reflects who the
 * student actually is.
 *
 * Input:  { email: string }
 * Output: { expiresAt, emailSentTo }
 *
 * v16 web pivot §Bucket 6 / §Bucket 8 (SSR auth wired).
 */

const inputSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof inputSchema>;
  try {
    body = inputSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "E081:invalid_parent_email" }, { status: 400 });
  }

  // Auth gate. The /app/profile/parent UI sits behind proxy.ts's
  // /app/** redirect, so a real user reaches this route with the SSR
  // cookie set. A bare unauthed POST gets 401 — closes the brand-
  // spam vector outlined above.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json(
      { error: "E001:auth_required" },
      { status: 401 },
    );
  }

  // Even with auth, every send costs a real Resend invocation and
  // burns sender-domain reputation. 3/hour caps a misbehaving client
  // (or a compromised session) without blocking the legit "send a
  // fresh link" pattern.
  const rl = await enforceRateLimit({
    route: "parent-link-send",
    userId: user.id,
    ip: clientIp(req),
    limit: 3,
    windowSec: 3600,
  });
  if (!rl.ok) return rl.response;

  const meta = (user.user_metadata ?? {}) as SignupMetadata;
  const studentFirstName = meta.first_name?.trim() || "Your student";
  const studentUni =
    meta.destination_uni?.trim() ||
    meta.destination_city?.trim() ||
    "their university";

  const result = await sendParentMagicLink({
    email: body.email,
    studentFirstName,
    studentUni,
    ownerId: user.id,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({
    expiresAt: result.expiresAt,
    emailSentTo: body.email,
    mock: result.mock || isMockResend(),
  });
}
