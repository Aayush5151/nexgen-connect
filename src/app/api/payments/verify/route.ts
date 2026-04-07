import { NextRequest, NextResponse } from "next/server";

// TODO: Verify Razorpay payment.
// - Parse razorpay_order_id, razorpay_payment_id, razorpay_signature from request body
// - Verify signature using Razorpay webhook secret (HMAC SHA256)
// - Update payment record status in database
// - Activate user's subscription / unlock features
// - Return verification result
export async function POST(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ message: "POST /api/payments/verify — not implemented" }, { status: 501 });
}
