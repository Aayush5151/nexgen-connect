/**
 * PaymentGateway interface — abstraction over the concrete payment
 * provider. The v1 launch ships only Razorpay (INR-only), but this
 * interface lets a second gateway (Stripe / Cashfree / etc.) drop in
 * via a sibling implementation file plus a runtime flag.
 *
 * Methods are all async + return discriminated `ok` shapes so callers
 * can branch without try/catch on the happy path.
 *
 * v16 web pivot Bucket 4 follow-up.
 */
import "server-only";

export type CreateOrderInput = {
  /** Amount in the smallest currency unit (paise / cents). */
  amountSubunit: number;
  currency: "INR";
  /** Caller-supplied receipt id. Surfaces in the gateway dashboard. */
  receipt: string;
  /** Server-derived idempotency key (NEVER trust client). */
  idempotencyKey: string;
  /** The auth'd user this order belongs to. Persisted as `notes.user_id`
   *  on the gateway side so the webhook can credit premium back to the
   *  correct user — and CANNOT be set by the payer. */
  userId: string;
};

export type CreateOrderResult =
  | {
      ok: true;
      mock: boolean;
      orderId: string;
      amountSubunit: number;
      currency: "INR";
    }
  | { ok: false; error: string };

/** Result of a webhook signature verify. */
export type VerifyWebhookResult =
  | { ok: true; mock: boolean }
  | { ok: false; reason: "missing_signature" | "missing_secret" | "mismatch" };

export interface PaymentGateway {
  /** Identifier used in logs / Inngest events. */
  readonly id: "razorpay" | "stripe" | "cashfree";

  /** True when running with mock credentials (no real charges). */
  isMock(): boolean;

  /** Create a payment order. Idempotent on `idempotencyKey`. */
  createOrder(input: CreateOrderInput): Promise<CreateOrderResult>;

  /** Verify a webhook signature against the raw body. */
  verifyWebhookSignature(rawBody: string, signature: string): VerifyWebhookResult;
}
