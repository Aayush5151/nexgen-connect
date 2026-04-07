import { NextRequest, NextResponse } from "next/server";

// TODO: Get all matches for the current user.
// - Authenticate the request (JWT)
// - Fetch all match records where current user is a participant
// - Include matched user profile info (name, photo, university)
// - Return sorted matches (newest first)
export async function GET(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ message: "GET /api/matches — not implemented" }, { status: 501 });
}
