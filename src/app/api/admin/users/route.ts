import { NextRequest, NextResponse } from "next/server";

// TODO: GET — List users (paginated).
// - Authenticate the request (JWT) and verify admin role
// - Parse pagination params (page, limit) and optional filters (search, status)
// - Query users from database with pagination
// - Return paginated user list with total count
export async function GET(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ message: "GET /api/admin/users — not implemented" }, { status: 501 });
}

// TODO: PATCH — Update a user (admin action).
// - Authenticate the request (JWT) and verify admin role
// - Parse user ID and update fields from request body
// - Apply allowed admin-level updates (role, status, verification override)
// - Return updated user
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ message: "PATCH /api/admin/users — not implemented" }, { status: 501 });
}
