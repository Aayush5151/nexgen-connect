import { NextRequest, NextResponse } from "next/server";

// TODO: Clear session / log out.
// - Clear auth cookies (set expired Set-Cookie header)
// - Optionally invalidate refresh token in database
// - Return success confirmation
export async function POST(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ message: "POST /api/auth/logout — not implemented" }, { status: 501 });
}
