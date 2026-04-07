import { NextRequest, NextResponse } from "next/server";

// TODO: Handle LinkedIn OAuth callback.
// - Parse authorization code from request body
// - Exchange code for LinkedIn access token
// - Fetch LinkedIn profile data (name, email, profile URL)
// - Create or link user account, return JWT
export async function POST(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ message: "POST /api/auth/linkedin — not implemented" }, { status: 501 });
}
