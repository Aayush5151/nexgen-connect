import { NextRequest, NextResponse } from "next/server";

// TODO: Get aggregate admin dashboard stats.
// - Authenticate the request (JWT) and verify admin role
// - Aggregate: total users, active users, verified users, matches, revenue, etc.
// - Include trend data (daily/weekly signups)
// - Return dashboard stats object
export async function GET(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ message: "GET /api/admin/dashboard — not implemented" }, { status: 501 });
}
