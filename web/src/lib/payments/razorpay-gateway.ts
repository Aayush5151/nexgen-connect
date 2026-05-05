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
    if (!signature) return { ok: false, reason: "missing_signature" };
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      // In mock mode we accept all signatures (dev convenience). In
      // production a missing secret means we can't verify — fail-closed.
      if (process.env.NODE_ENV !== "production") {
        return { ok: true, mock: true };
      }
      return { ok: false, reason: "missing_secret" };
    }
    const ok = verifyRazorpaySignature(rawBody, signature);
    return ok
      ? { ok: true, mock: isMockRazorpay() }
      : { ok: false, reason: "mismatch" };
  },
};
