import { NextRequest, NextResponse } from "next/server";

// TODO: Report a user.
// - Authenticate the request (JWT)
// - Parse reported user ID, reason, and optional description from request body
// - Validate the reported user exists
// - Store report record in database with "pending" status
// - Return success confirmation
export async function POST(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ message: "POST /api/reports — not implemented" }, { status: 501 });
}
