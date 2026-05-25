import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";

import { getPaymentGateway } from "@/lib/payments";
import { requireAuthedUser } from "@/lib/api-auth";
import { requireSameOrigin } from "@/lib/csrf";

export const runtime = "nodejs";

/**
 * POST /api/razorpay/order
 *
 * Creates a payment order for the ₹999 premium one-time.
 *
 * SECURITY (post-hardening May 2026):
 *   - Requires an authenticated user (cookie-session). Anonymous calls
 *     to mint Razorpay orders against our merchant account are refused.
 *   - Idempotency key is DERIVED server-side from `${user.id}:${date}`
 *     instead of trusting the client. A client-controlled idempotency
 *     key let a single user spam our Razorpay dashboard.
 *   - `notes.user_id` is set server-side so the webhook can credit the
 *     correct user without trusting payload-controlled fields. Previously
 *     the order had no user binding and the webhook trusted the payer's
 *     `notes.user_id` — a third party could credit premium to any victim.
 *   - Origin/CSRF gate so a malicious site can't trigger orders for a
 *     logged-in victim browsing it.
 *
 * Input: none (body ignored; idempotency is server-derived)
 * Output: { orderId, amount: 99900, currency: "INR", keyId, mock }
 *
 * v16 web pivot §Bucket 6 / security hardening §May2026.
 */

const PREMIUM_AMOUNT_PAISE = 99_900; // ₹999.00

export async function POST(req: NextRequest) {
  // CSRF guard.
  const origin = requireSameOrigin(req);
  if (!origin.ok) {
    return NextResponse.json({ error: "E001:bad_origin" }, { status: 403 });
  }

  const auth = await requireAuthedUser();
  if (!auth.user) return auth.response;

  // Derive idempotency key from (user_id, UTC date). Same user re-clicking
  // "Pay" within the same day reuses the same order. A second day produces
  // a new order — that's correct: the previous one expired upstream.
  const dayUtc = new Date().toISOString().slice(0, 10);
  const idempotencyKey = createHash("sha256")
    .update(`razorpay-order:${auth.user.id}:${dayUtc}`)
    .digest("hex")
    .slice(0, 32);

  const gateway = getPaymentGateway();
  const result = await gateway.createOrder({
    amountSubunit: PREMIUM_AMOUNT_PAISE,
    currency: "INR",
    receipt: `nx-premium-${auth.user.id.slice(0, 8)}-${Date.now()}`,
    idempotencyKey,
    userId: auth.user.id,
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
