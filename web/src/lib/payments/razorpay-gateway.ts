/**
 * Razorpay implementation of the PaymentGateway interface.
 *
 * Wraps the existing `web/src/lib/razorpay.ts` helpers with the
 * narrower interface so call sites bind to `PaymentGateway` and a
 * future second gateway can swap in via a flag.
 *
 * v16 web pivot Bucket 4 follow-up.
 */
import "server-only";

import {
  createOrder as createRazorpayOrder,
  isMockRazorpay,
  verifyWebhookSignature as verifyRazorpaySignature,
} from "@/lib/razorpay";
import type {
  CreateOrderInput,
  CreateOrderResult,
  PaymentGateway,
  VerifyWebhookResult,
} from "./types";

export const razorpayGateway: PaymentGateway = {
  id: "razorpay",

  isMock() {
    return isMockRazorpay();
  },

  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    const result = await createRazorpayOrder({
      amountPaise: input.amountSubunit,
      currency: input.currency,
      receipt: input.receipt,
      idempotencyKey: input.idempotencyKey,
      userId: input.userId,
    });
    if (!result.ok) return { ok: false, error: result.error };
    return {
      ok: true,
      mock: result.mock,
      orderId: result.orderId,
      amountSubunit: result.amount,
      currency: result.currency,
    };
  },

  verifyWebhookSignature(rawBody: string, signature: string): VerifyWebhookResult {
    // SECURITY: NEVER short-circuit to ok=true on a missing secret. The
    // previous design accepted any signature in non-production envs without
    // a secret, which in Vercel previews allowed forged webhooks. Real or
    // mock, the signature MUST verify against the local HMAC secret.
    if (!signature) return { ok: false, reason: "missing_signature" };
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      return { ok: false, reason: "missing_secret" };
    }
    const ok = verifyRazorpaySignature(rawBody, signature);
    return ok
      ? { ok: true, mock: isMockRazorpay() }
      : { ok: false, reason: "mismatch" };
  },
};
