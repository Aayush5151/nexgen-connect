import { NextRequest, NextResponse } from "next/server";

// TODO: Create user from onboarding data.
// - Authenticate the request (JWT)
// - Parse onboarding fields from request body (name, university, destination, etc.)
// - Validate required fields
// - Insert user record into database
// - Return created user
export async function POST(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ message: "POST /api/users — not implemented" }, { status: 501 });
}
