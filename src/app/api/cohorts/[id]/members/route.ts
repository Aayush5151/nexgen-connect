import { NextRequest, NextResponse } from "next/server";

// TODO: Get cohort member list.
// - Authenticate the request (JWT)
// - Parse cohort ID from route params
// - Verify user belongs to or has access to this cohort
// - Fetch paginated member list from database
// - Return members with basic profile info
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  return NextResponse.json({ message: `GET /api/cohorts/${id}/members — not implemented` }, { status: 501 });
}
