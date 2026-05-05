import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getPaymentGateway } from "@/lib/payments";

/**
 * POST /api/razorpay/order
 *
 * Creates a payment order for the ₹999 premium one-time. Routes
 * through the PaymentGateway abstraction so a future second gateway
 * (Stripe / Cashfree) can drop in via PAYMENT_GATEWAY env var.
 *
 * Idempotency key is required to prevent duplicate orders on client
 * double-tap.
 *
 * Input:  { idempotencyKey: string }
 * Output: { orderId, amount: 99900, currency: "INR" }
 *
 * v16 web pivot §Bucket 6 (initial) / cross-cut PaymentGateway extract.
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

  const gateway = getPaymentGateway();
  const result = await gateway.createOrder({
    amountSubunit: 99900, // ₹999.00 in paise
    currency: "INR",
    receipt: `nx-premium-${Date.now()}`,
    idempotencyKey: body.idempotencyKey,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({
    orderId: result.orderId,
    amount: result.amountSubunit,
    currency: result.currency,
    keyId: process.env.RAZORPAY_KEY_ID ?? "rzp_test_mock",
    mock: result.mock,
  });
}
