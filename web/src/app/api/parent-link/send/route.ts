import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { sendParentMagicLink, isMockResend } from "@/lib/parent-link";

/**
 * POST /api/parent-link/send
 *
 * Generates a single-use magic-link, signs it, persists the row, and
 * sends the email through Resend. The link path is `/parent/[token]`
 * — the receiving page lands in Bucket 8.
 *
 * Input:  { email: string }
 * Output: { expiresAt, emailSentTo }
 *
 * v16 web pivot §Bucket 6.
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

  // ownerId placeholder — Bucket 7 reads the authenticated user from
  // the Supabase SSR cookie. Until then we pass a demo id so Resend
  // template rendering has a value to interpolate.
  const result = await sendParentMagicLink({
    email: body.email,
    studentFirstName: "Demo",
    studentUni: "University College Dublin",
    ownerId: "demo-user-1",
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
