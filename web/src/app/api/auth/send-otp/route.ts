import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { sendOtp, isMockOtp } from "@/lib/msg91";
import { verifyTurnstileToken } from "@/lib/turnstile";

/**
 * POST /api/auth/send-otp
 *
 * Two gates before MSG91:
 *   1. Turnstile siteverify on every request (mock-pass when key unset)
 *   2. Phone validator
 *
 * When MSG91 keys are unset, falls through to the existing mock path
 * (returns mock=true). Production env without keys + MOCK_OTP=false
 * fails closed.
 *
 * Input: { phone: { country: "IN", e164: string }, turnstileToken: string }
 * Output (200):
 *   { otpSessionId: string, expiresAt: string, maskedPhone: string }
 *
 * v16 web pivot §Bucket 6.
 */

const phoneSchema = z.object({
  country: z.literal("IN"),
  e164: z.string().regex(/^91[6-9]\d{9}$/),
});

const inputSchema = z.object({
  phone: phoneSchema,
  turnstileToken: z.string().min(1),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof inputSchema>;
  try {
    body = inputSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "E010:invalid_phone" }, { status: 400 });
  }

  const remoteIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    undefined;
  const turnstile = await verifyTurnstileToken(body.turnstileToken, remoteIp);
  if (!turnstile.ok) {
    return NextResponse.json({ error: turnstile.error }, { status: 400 });
  }

  const phoneE164 = `+${body.phone.e164}`;
  const result = await sendOtp(phoneE164);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  // Stamp an OTP-session id locally; in real impl this is a row in
  // `auth.otp_sessions` keyed by id with `phone_hash` and TTL set
  // server-side. Bucket 7 wires the table.
  const otpSessionId = result.requestId ?? crypto.randomUUID();

  return NextResponse.json({
    otpSessionId,
    expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
    maskedPhone: `+91 *****${body.phone.e164.slice(-4)}`,
    mock: result.mock || isMockOtp(),
  });
}
