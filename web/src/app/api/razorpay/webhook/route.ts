import { NextRequest, NextResponse } from "next/server";

import { getPaymentGateway } from "@/lib/payments";
import { inngest } from "@/lib/inngest/client";

/**
 * POST /api/razorpay/webhook
 *
 * Razorpay sends payment lifecycle events here. Signature verification
 * is the FIRST gate — any request without a valid HMAC of the raw body
 * (using RAZORPAY_WEBHOOK_SECRET) is rejected with 401.
 *
 * Side effects (Bucket 8):
 *   payment.captured  → user_premium.status = 'active', send receipt email
 *   payment.failed    → log + email user
 *   refund.processed  → user_premium.status = 'refunded'
 *
 * The Supabase service-role write goes through Bucket 8's wiring once
 * the SSR helper lands. For now each branch is logged + acked; the row
 * upsert is idempotent on (user_id, razorpay_order_id) when wired.
 *
 * v16 web pivot §Bucket 8 (extends §Bucket 6 scaffolding).
 */

type RazorpayEvent = {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        status?: string;
        amount?: number;
        notes?: { user_id?: string; idempotency_key?: string };
      };
    };
    refund?: { entity?: { id?: string; payment_id?: string } };
  };
};

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const rawBody = await req.text();

  const gateway = getPaymentGateway();
  const verify = gateway.verifyWebhookSignature(rawBody, signature);
  if (!verify.ok) {
    console.error(`[razorpay.webhook] signature verification failed: ${verify.reason}`);
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  let payload: RazorpayEvent = {};
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const event = payload.event ?? "unknown";
  const orderId = payload.payload?.payment?.entity?.order_id;
  const paymentId = payload.payload?.payment?.entity?.id;
  const userId = payload.payload?.payment?.entity?.notes?.user_id;

  switch (event) {
    case "payment.captured": {
      console.log(
        `[razorpay.webhook] CAPTURE order=${orderId} payment=${paymentId} user=${userId} mock=${gateway.isMock()}`,
      );
      // Hand off to the Inngest `razorpay-paid` job (web/src/lib/inngest
      // /jobs/razorpay-paid.ts) for the user_premium upsert + receipt
      // email + analytics emit. Inngest's durable retries handle
      // transient Postgres / Resend failures so we ack the webhook
      // immediately (Razorpay's retry policy is aggressive — a slow
      // synchronous handler triggers duplicates).
      const amountInr = payload.payload?.payment?.entity?.amount
        ? Math.round(payload.payload.payment.entity.amount / 100)
        : 999;
      if (orderId && paymentId && userId) {
        await inngest.send({
          name: "premium/order.paid",
          data: {
            orderId,
            paymentId,
            amountInr,
            verifiedUserId: userId,
          },
        });
      } else {
        console.warn(
          "[razorpay.webhook] capture event missing required fields — skipped Inngest emit",
        );
      }
      break;
    }
    case "payment.failed":
      console.log(`[razorpay.webhook] FAILED order=${orderId} user=${userId}`);
      break;
    case "refund.processed":
      console.log(`[razorpay.webhook] REFUND payment=${paymentId}`);
      // user_premium update: status='refunded', refunded_at=now()
      break;
    default:
      console.log(`[razorpay.webhook] event=${event} (no handler)`);
  }

  return NextResponse.json({ ok: true });
}
