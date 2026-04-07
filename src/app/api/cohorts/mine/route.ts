import { NextRequest, NextResponse } from "next/server";

// TODO: Get the current user's cohort info.
// - Authenticate the request (JWT)
// - Look up user's assigned cohort from database
// - Return cohort details (name, destination, intake, member count)
export async function GET(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ message: "GET /api/cohorts/mine — not implemented" }, { status: 501 });
}
