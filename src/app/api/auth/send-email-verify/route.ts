import { NextRequest, NextResponse } from "next/server";

// TODO: Send email verification link.
// - Authenticate the request (JWT)
// - Generate a signed verification token
// - Send verification email via email service (e.g., Resend, SendGrid)
export async function POST(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ message: "POST /api/auth/send-email-verify — not implemented" }, { status: 501 });
}
