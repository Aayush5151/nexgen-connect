import { NextRequest, NextResponse } from "next/server";

// TODO: GET — Get own profile.
// - Authenticate the request (JWT)
// - Fetch full user profile from database
// - Return profile data
export async function GET(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ message: "GET /api/users/me — not implemented" }, { status: 501 });
}

// TODO: PATCH — Update own profile.
// - Authenticate the request (JWT)
// - Parse allowed update fields from request body
// - Validate and apply updates to the database
// - Return updated profile
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ message: "PATCH /api/users/me — not implemented" }, { status: 501 });
}
