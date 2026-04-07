import { NextRequest, NextResponse } from "next/server";

// TODO: Create a Razorpay order.
// - Authenticate the request (JWT)
// - Parse plan/tier from request body
// - Create a Razorpay order via Razorpay SDK (amount, currency, receipt)
// - Store order reference in database
// - Return Razorpay order ID and key for client-side checkout
export async function POST(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ message: "POST /api/payments/create-order — not implemented" }, { status: 501 });
}
