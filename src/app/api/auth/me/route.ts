import { NextRequest, NextResponse } from "next/server";

// TODO: Get current user from JWT.
// - Extract and verify JWT from Authorization header or cookie
// - Fetch user record from database
// - Return user profile data
export async function GET(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ message: "GET /api/auth/me — not implemented" }, { status: 501 });
}
