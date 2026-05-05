import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createOrder, isMockRazorpay } from "@/lib/razorpay";

/**
 * POST /api/razorpay/order
 *
 * Creates a Razorpay order for the ₹999 premium one-time. Idempotency
 * key is required to prevent duplicate orders if the user double-taps.
 *
 * Input:  { idempotencyKey: string }
 * Output: { orderId, amount: 99900, currency: "INR" }
 *
 * v16 web pivot §Bucket 6.
 */

const inputSchema = z.object({
  idempotencyKey: z.string().min(8),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof inputSchema>;
  try {
    body = inputSchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { error: "E061:razorpay_idempotency_required" },
      { status: 400 },
    );
  }

  const result = await createOrder({
    amountPaise: 99900, // ₹999.00
    currency: "INR",
    receipt: `nx-premium-${Date.now()}`,
    idempotencyKey: body.idempotencyKey,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({
    orderId: result.orderId,
    amount: result.amount,
    currency: result.currency,
    keyId: process.env.RAZORPAY_KEY_ID ?? "rzp_test_mock",
    mock: result.mock || isMockRazorpay(),
  });
}
