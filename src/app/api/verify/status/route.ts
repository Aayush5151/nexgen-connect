import { NextRequest, NextResponse } from "next/server";

// TODO: Get all verification statuses for the current user.
// - Authenticate the request (JWT)
// - Fetch phone, email, govt-ID, and LinkedIn verification statuses
// - Return aggregated verification state
export async function GET(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ message: "GET /api/verify/status — not implemented" }, { status: 501 });
}
