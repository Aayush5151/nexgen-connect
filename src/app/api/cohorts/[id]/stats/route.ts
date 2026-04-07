import { NextRequest, NextResponse } from "next/server";

// TODO: Get cohort stats.
// - Authenticate the request (JWT)
// - Parse cohort ID from route params
// - Aggregate stats: member count, verification rates, match count, etc.
// - Return cohort statistics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  return NextResponse.json({ message: `GET /api/cohorts/${id}/stats — not implemented` }, { status: 501 });
}
