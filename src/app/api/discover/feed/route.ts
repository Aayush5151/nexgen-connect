import { NextRequest, NextResponse } from "next/server";

// TODO: Get next batch of profile cards for discovery feed.
// - Authenticate the request (JWT)
// - Apply matching algorithm: same cohort, destination, interests
// - Exclude already-swiped and blocked profiles
// - Return paginated batch of profile cards
export async function GET(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ message: "GET /api/discover/feed — not implemented" }, { status: 501 });
}
