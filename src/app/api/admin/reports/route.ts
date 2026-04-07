import { NextRequest, NextResponse } from "next/server";

// TODO: GET — List pending reports (admin).
// - Authenticate the request (JWT) and verify admin role
// - Fetch reports from database, optionally filtered by status (pending, resolved)
// - Include reporter and reported user info
// - Return paginated report list
export async function GET(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ message: "GET /api/admin/reports — not implemented" }, { status: 501 });
}

// TODO: PATCH — Update a report (admin action).
// - Authenticate the request (JWT) and verify admin role
// - Parse report ID and new status/resolution from request body
// - Update report record (resolve, dismiss, or escalate)
// - Optionally apply action to reported user (warn, suspend, ban)
// - Return updated report
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ message: "PATCH /api/admin/reports — not implemented" }, { status: 501 });
}
