import { NextRequest, NextResponse } from "next/server";

// TODO: Record a swipe and check for match.
// - Authenticate the request (JWT)
// - Parse target user ID and direction (like/pass) from request body
// - Store swipe record in database
// - If "like", check whether target user also liked current user
// - If mutual like, create a match record and return match flag
export async function POST(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ message: "POST /api/discover/swipe — not implemented" }, { status: 501 });
}
