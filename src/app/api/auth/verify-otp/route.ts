import { NextRequest, NextResponse } from "next/server";

// TODO: Verify phone OTP and return JWT.
// - Parse OTP code and verification session ID from request body
// - Verify OTP with Firebase Admin SDK
// - Create or fetch user record
// - Sign and return a JWT
export async function POST(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ message: "POST /api/auth/verify-otp — not implemented" }, { status: 501 });
}
