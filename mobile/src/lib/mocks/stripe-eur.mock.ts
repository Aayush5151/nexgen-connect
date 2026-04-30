/**
 * Stripe-EUR — mock client (Y1.5 fallback for in-destination users).
 *
 * v15 BP §5.2 / v6 build §3.1 — when an Indian user is already in
 * destination (post-arrival) with a EUR-only card, we fall back to
 * Stripe instead of Razorpay. Same Premium price, currency conversion
 * shown explicitly.
 *
 * Mock: returns success / failure based on the test parameter. Real
 * implementation uses `@stripe/stripe-react-native` with PaymentSheet.
 */

export type StripeCheckoutInput = {
  amountEurCents: number; // 999 EUR cents = €9.99 ≈ ₹999
  description: string;
  customerEmail: string;
  /** Test override — set to "card_declined" to force failure. */
  testFailureMode?: "card_declined" | "network_error" | "3ds_failed";
};

export type StripeCheckoutResult =
  | {
      ok: true;
      paymentIntentId: string;
      receiptUrl: string;
      amountEurCents: number;
    }
  | {
      ok: false;
      errorCode: "card_declined" | "network_error" | "3ds_failed";
      errorMessage: string;
    };

function randomId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 14)}`;
}

function delay<T>(ms: number, v: T): Promise<T> {
  return new Promise((r) => setTimeout(() => r(v), ms));
}

export const stripeEurMock = {
  async checkout(input: StripeCheckoutInput): Promise<StripeCheckoutResult> {
    if (input.testFailureMode) {
      const errorMessages: Record<string, string> = {
        card_declined: "Your card was declined. Try another card.",
        network_error: "Couldn't reach Stripe. Check your connection.",
        "3ds_failed": "3D Secure check failed. Try again.",
      };
      return delay(800, {
        ok: false,
        errorCode: input.testFailureMode,
        errorMessage: errorMessages[input.testFailureMode],
      });
    }
    return delay(1200, {
      ok: true,
      paymentIntentId: randomId("pi"),
      receiptUrl: `https://pay.stripe.com/receipts/${randomId("rcpt")}`,
      amountEurCents: input.amountEurCents,
    });
  },
};

export type StripeEurClient = typeof stripeEurMock;
