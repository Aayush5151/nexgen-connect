import { NextRequest, NextResponse } from "next/server";

// TODO: List all cohorts (admin).
// - Authenticate the request (JWT) and verify admin role
// - Fetch all cohorts from database
// - Include member count, destination, intake period per cohort
// - Return cohort list
export async function GET(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ message: "GET /api/admin/cohorts — not implemented" }, { status: 501 });
}
