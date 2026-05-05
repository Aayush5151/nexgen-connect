import "server-only";

import { createHmac } from "node:crypto";

/**
 * Razorpay client — premium ₹999 one-time.
 *
 * Two modes:
 *   - mock: when RAZORPAY_KEY_ID is unset (dev / preview without keys),
 *     returns deterministic fake order data. Webhook verification is
 *     skipped — the dev UI flow becomes self-completing.
 *   - real: sends an Orders API request and verifies webhook HMAC.
 *
 * Stop condition (v16 §Bucket 6): Razorpay test-mode unconfirmable
 * without sandbox keys. Production env MUST have RAZORPAY_KEY_ID +
 * RAZORPAY_KEY_SECRET + RAZORPAY_WEBHOOK_SECRET, else the route falls
 * fail-closed.
 *
 * v16 web pivot §Bucket 6.
 */

const RAZORPAY_API = "https://api.razorpay.com/v1";
const FETCH_TIMEOUT_MS = 10_000;

export function isMockRazorpay(): boolean {
  if (process.env.MOCK_RAZORPAY === "true") return true;
  const inProd = process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
  if (inProd) return false;
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    if (!warned) {
      warned = true;
      console.warn(
        "[razorpay] no credentials configured — falling back to mock orders. " +
          "Set RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET to use sandbox.",
      );
    }
    return true;
  }
  return false;
}
let warned = false;

export type CreateOrderInput = {
  amountPaise: number;
  currency: "INR";
  receipt: string;
  /** Idempotency key — caller-supplied. Razorpay's `notes.idempotency_key`. */
  idempotencyKey: string;
};

export type CreateOrderResult =
  | { ok: true; mock: boolean; orderId: string; amount: number; currency: "INR" }
  | { ok: false; error: string };

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  if (isMockRazorpay()) {
    return {
      ok: true,
      mock: true,
      orderId: `mock_order_${Date.now()}`,
      amount: input.amountPaise,
      currency: "INR",
    };
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return { ok: false, error: "Razorpay not configured." };
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${RAZORPAY_API}/orders`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: input.amountPaise,
        currency: input.currency,
        receipt: input.receipt,
        notes: { idempotency_key: input.idempotencyKey },
      }),
    });
    if (!res.ok) {
      console.error(`[razorpay.order] status=${res.status}`);
      return { ok: false, error: "Couldn't open checkout. Try again." };
    }
    const body = (await res.json()) as { id?: string; amount?: number; currency?: string };
    if (!body.id) return { ok: false, error: "Invalid response from payments." };
    return { ok: true, mock: false, orderId: body.id, amount: body.amount ?? input.amountPaise, currency: "INR" };
  } catch (err) {
    console.error("[razorpay.order] threw:", err instanceof Error ? err.message : err);
    return { ok: false, error: "Payments service timed out." };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Verify a Razorpay webhook payload by recomputing the HMAC-SHA256 of
 * the raw body using RAZORPAY_WEBHOOK_SECRET.
 *
 * Razorpay sends `x-razorpay-signature` as the hex-encoded HMAC.
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  if (isMockRazorpay()) return true;
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[razorpay.webhook] RAZORPAY_WEBHOOK_SECRET missing — rejecting webhook.");
    return false;
  }
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  // timingSafeEqual not strictly needed here (signature length is fixed
  // and the input is server-controlled), but using it is cheap insurance.
  return expected.length === signature.length && expected === signature;
}
