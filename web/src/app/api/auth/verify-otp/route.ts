import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { verifyOtpUpstream, isMockOtp } from "@/lib/msg91";

/**
 * POST /api/auth/verify-otp
 *
 * Wraps `msg91.verifyOtpUpstream`. On success we return a sessionToken
 * placeholder; the real Supabase Auth handoff lands in Bucket 7 (where
 * the verified phone is bound to a Supabase Auth identity + RLS).
 *
 * Input: { otpSessionId: string, code: string, phoneE164: string }
 * Output: { sessionToken, refreshToken, user: { id, phoneVerifiedAt } }
 *
 * v16 web pivot §Bucket 6.
 */

const inputSchema = z.object({
  otpSessionId: z.string().min(1),
  code: z.string().regex(/^\d{6}$/),
  phoneE164: z.string().regex(/^\+?91[6-9]\d{9}$/),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof inputSchema>;
  try {
    body = inputSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "E022:otp_invalid" }, { status: 400 });
  }

  const phoneE164 = body.phoneE164.startsWith("+") ? body.phoneE164 : `+${body.phoneE164}`;
  const result = await verifyOtpUpstream(phoneE164, body.code);
  if (!result.ok) {
    return NextResponse.json({ error: "E022:otp_invalid" }, { status: 401 });
  }

  return NextResponse.json({
    sessionToken: "phone-verified",
    refreshToken: crypto.randomUUID(),
    user: {
      id: crypto.randomUUID(),
      phoneVerifiedAt: new Date().toISOString(),
    },
    mock: result.mock || isMockOtp(),
  });
}
