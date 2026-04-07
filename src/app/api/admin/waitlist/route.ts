import { NextRequest, NextResponse } from "next/server";

// TODO: Get waitlist entries (admin).
// - Authenticate the request (JWT) and verify admin role
// - Parse pagination params (page, limit)
// - Fetch waitlist entries from database, sorted by signup date
// - Return paginated waitlist with total count
export async function GET(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ message: "GET /api/admin/waitlist — not implemented" }, { status: 501 });
}
