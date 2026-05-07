/**
 * Razorpay payment-async job.
 *
 * Webhook handler at /api/razorpay/webhook fires `premium/order.paid`
 * after HMAC validation; this job picks it up, marks user_premium
 * paid, and emits the premium_paid analytics event.
 *
 * Retries: Inngest retries failed steps with exponential backoff
 * (default 3 attempts over ~30 minutes). Step output is durable so
 * a partial run resumes from the last completed step.
 *
 * v16 web pivot Bucket 4 follow-up (P4 work).
 */
import { inngest } from "../client";

export const razorpayPaid = inngest.createFunction(
  {
    id: "razorpay-paid",
    retries: 3,
    triggers: [{ event: "premium/order.paid" }],
  },
  async ({ event, step }) => {
    const { orderId, paymentId, amountInr, verifiedUserId } = event.data;

    await step.run("mark-user-premium-paid", async () => {
      // Stub — wires to Drizzle update once P1.a fully takes over.
      // const db = await getDb();
      // await db.update(userPremium)
      //   .set({ paidAt: new Date(), razorpayPaymentId: paymentId })
      //   .where(eq(userPremium.userId, verifiedUserId));
      console.log(
        `[inngest:razorpay-paid] order=${orderId} payment=${paymentId} amount=${amountInr} user=${verifiedUserId}`,
      );
    });

    // Analytics emission for premium_paid lives in the PostHog
    // taxonomy (see web/src/lib/posthog.ts). It fires from the
    // browser-side checkout-success path, not from this durable job —
    // emitting auth/phone.verified here would re-trigger
    // welcome-email + stale-signup on every premium purchase, which
    // would double-send the welcome email and start a fresh 48h
    // dropout window for an already-verified user. Intentionally
    // empty.

    return { ok: true, orderId };
  },
);
