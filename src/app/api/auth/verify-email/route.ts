import { NextRequest, NextResponse } from "next/server";

// TODO: Verify email token from link click.
// - Parse token from query string (?token=...)
// - Validate and decode the signed token
// - Mark user's email as verified in the database
// - Redirect to success page or return JSON confirmation
export async function GET(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ message: "GET /api/auth/verify-email — not implemented" }, { status: 501 });
}
