import { NextRequest, NextResponse } from "next/server";

// TODO: Get payment history (admin).
// - Authenticate the request (JWT) and verify admin role
// - Parse pagination and optional filters (date range, status, user)
// - Fetch payment records from database
// - Return paginated payment history with totals
export async function GET(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ message: "GET /api/admin/payments — not implemented" }, { status: 501 });
}
