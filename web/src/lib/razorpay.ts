import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

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

/**
 * Returns true when Razorpay should use mock data. Production refuses
 * mocking unconditionally — even MOCK_RAZORPAY=true is ignored. The
 * previous design accepted any signature in mock mode AND treated
 * "no creds in non-prod" as mock; in a Vercel preview without
 * RAZORPAY_WEBHOOK_SECRET that was a forged-webhook vector.
 */
export function isMockRazorpay(): boolean {
  const inProd =
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production";
  if (inProd) {
    if (process.env.MOCK_RAZORPAY === "true" && !mock_in_prod_warned) {
      mock_in_prod_warned = true;
      console.error(
        "[razorpay] MOCK_RAZORPAY=true detected in production — IGNORING. " +
          "Mock payments are refused in production regardless of env state.",
      );
    }
    return false;
  }
  if (process.env.MOCK_RAZORPAY === "true") return true;
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    if (!warned) {
      warned = true;
      console.warn(
        "[razorpay] no credentials configured, falling back to mock orders. " +
          "Set RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET to use sandbox.",
      );
    }
    return true;
  }
  return false;
}
let warned = false;
let mock_in_prod_warned = false;

export type CreateOrderInput = {
  amountPaise: number;
  currency: "INR";
  receipt: string;
  /** Server-derived idempotency key. Persisted as `notes.idempotency_key`. */
  idempotencyKey: string;
  /** Auth'd user id. Persisted as `notes.user_id` so the webhook can credit
   *  premium back to the right user without trusting payload `notes` —
   *  Razorpay's order-notes are server-set and immutable by the payer. */
  userId: string;
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
        // SECURITY: notes are SERVER-SET at order creation. The Checkout
        // SDK cannot override them at pay time. The webhook reads
        // notes.user_id to credit premium — trusting client-side notes
        // here was the prior CRITICAL bug (anyone could credit any victim).
        notes: {
          idempotency_key: input.idempotencyKey,
          user_id: input.userId,
        },
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
 *
 * SECURITY: This function NEVER short-circuits to true. Even in mock
 * mode the signature MUST match the locally-computed HMAC. Mock callers
 * should pass a signature computed with RAZORPAY_WEBHOOK_SECRET="mock"
 * (or whatever local secret is set). This guarantees that a missing
 * secret never silently accepts forged webhooks.
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[razorpay.webhook] RAZORPAY_WEBHOOK_SECRET missing, rejecting webhook.");
    return false;
  }
  if (!signature || typeof signature !== "string") return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  if (expected.length !== signature.length) return false;
  try {
    return timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(signature, "hex"),
    );
  } catch {
    // signature wasn't valid hex
    return false;
  }
}
