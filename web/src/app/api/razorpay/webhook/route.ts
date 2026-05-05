import { NextRequest, NextResponse } from "next/server";

import { verifyWebhookSignature, isMockRazorpay } from "@/lib/razorpay";

/**
 * POST /api/razorpay/webhook
 *
 * Razorpay sends payment lifecycle events here. Signature verification
 * is the FIRST gate — any request without a valid HMAC of the raw body
 * (using RAZORPAY_WEBHOOK_SECRET) is rejected with 401.
 *
 * Events we care about (Bucket 8 wires the side effects):
 *   payment.captured  — premium = true on the user
 *   payment.failed    — log + email user
 *   refund.processed  — premium = false on the user
 *
 * v16 web pivot §Bucket 6.
 */

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const rawBody = await req.text();

  if (!verifyWebhookSignature(rawBody, signature)) {
    console.error("[razorpay.webhook] signature verification failed");
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  let payload: { event?: string; payload?: { payment?: { entity?: { order_id?: string; status?: string } } } } = {};
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Bucket 8 lands the side-effects — write payment row, set premium=true,
  // send Resend receipt. For now we ack so Razorpay stops retrying in test
  // mode.
  console.log(
    `[razorpay.webhook] event=${payload.event ?? "unknown"} order=${payload.payload?.payment?.entity?.order_id ?? "?"} mock=${isMockRazorpay()}`,
  );

  return NextResponse.json({ ok: true });
}
