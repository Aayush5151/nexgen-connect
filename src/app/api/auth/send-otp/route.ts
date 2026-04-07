import { NextRequest, NextResponse } from "next/server";

// TODO: Send phone OTP via Firebase Auth.
// - Parse phone number from request body
// - Call Firebase Admin SDK to initiate phone verification
// - Return verification session ID
export async function POST(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ message: "POST /api/auth/send-otp — not implemented" }, { status: 501 });
}
