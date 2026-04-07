import { NextRequest, NextResponse } from "next/server";

// TODO: Check payment status for the current user.
// - Authenticate the request (JWT)
// - Fetch latest payment/subscription record from database
// - Return payment status, plan tier, and expiry date
export async function GET(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ message: "GET /api/payments/status — not implemented" }, { status: 501 });
}
