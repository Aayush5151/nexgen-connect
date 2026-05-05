/**
 * Inngest client — single instance for the web app.
 *
 * Inngest is the durable workflow runtime for the v16 web pivot.
 * The four background lanes that need durability:
 *
 *   1. Razorpay payment-async — webhook fires → Inngest validates HMAC,
 *      updates user_premium, fires premium_paid analytics.
 *   2. T&S report SLA — chat report filed → Inngest schedules a 4h
 *      review reminder, then escalates to admin if unresolved.
 *   3. Push fan-out — chat message sent → Inngest emits web-push
 *      notification to every other corridor member with subscriptions.
 *   4. Welcome email — phone OTP verified → Inngest sends Resend
 *      welcome email + admin alert (today this is fire-and-forget in
 *      the verifyOtp REST route; lifting to Inngest gives retries).
 *
 * Functions are co-located with the lanes (web/src/lib/inngest/jobs/*)
 * and registered through `web/src/app/api/inngest/route.ts` (the
 * standard Inngest serve handler).
 *
 * v16 web pivot Bucket 4 follow-up (P4 work).
 */
import { Inngest } from "inngest";

export type InngestEvents = {
  // Razorpay
  "premium/order.paid": {
    data: {
      orderId: string;
      paymentId: string;
      amountInr: number;
      verifiedUserId: string;
    };
  };

  // Trust & Safety
  "ts/report.filed": {
    data: {
      reportId: string;
      filedByUserId: string;
      reportedMessageId: string;
      corridorId: string;
      reasonCode: string;
    };
  };

  // Group chat fan-out
  "chat/message.sent": {
    data: {
      messageId: string;
      corridorId: string;
      senderId: string;
      bodyExcerpt: string; // 140-char preview, no full content
    };
  };

  // Onboarding
  "auth/phone.verified": {
    data: {
      verifiedUserId: string;
      phoneE164: string;
    };
  };
};

export const inngest = new Inngest({
  id: "nexgen-connect",
  // Event key is required in production; in dev the SDK falls back to
  // the local dev server (npx inngest-cli dev).
  eventKey: process.env.INNGEST_EVENT_KEY,
});
