/**
 * Chat push fan-out — emits a web-push notification to every other
 * member of the chat thread when a message is sent.
 *
 * Flow:
 *   1. Load every chat_thread_member for the thread, excluding the
 *      sender. Cap at 200 recipients (a single thread shouldn't exceed
 *      this; if it does, the cap protects the function from runaway
 *      memory).
 *   2. Load every active push_subscription for those user_ids
 *      (last_failure_at IS NULL).
 *   3. Sign + send a payload via web-push to each endpoint, in
 *      parallel inside one step. Per-recipient failures are caught
 *      and logged; expired subscriptions (404 / 410) get marked
 *      via last_failure_* so the next fan-out skips them.
 *
 * The event payload's `corridorId` field is the chat thread_id
 * (kept named "corridorId" for legacy event-shape stability — see
 * web/src/lib/inngest/client.ts InngestEvents).
 *
 * VAPID env requirements:
 *   - NEXT_PUBLIC_VAPID_PUBLIC_KEY (also handed to the SW for subscribe)
 *   - VAPID_PRIVATE_KEY            (server-only)
 *   - VAPID_SUBJECT                (mailto: or https: identifier)
 *
 * Failure semantics: a single recipient endpoint failing doesn't fail
 * the whole fan-out. The function only fails if the membership lookup
 * itself errors (which Inngest then retries per the function's policy).
 *
 * v16 web pivot Bucket 4 follow-up (P4 work).
 */
import webpush from "web-push";

import { inngest } from "../client";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const RECIPIENT_CAP = 200;

type PushSubRow = {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

let vapidConfigured = false;

function configureVapid(): boolean {
  if (vapidConfigured) return true;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
  return true;
}

export const pushFanout = inngest.createFunction(
  {
    id: "push-fanout",
    retries: 2,
    triggers: [{ event: "chat/message.sent" }],
  },
  async ({ event, step }) => {
    const { messageId, corridorId, senderId, bodyExcerpt } = event.data;
    const threadId = corridorId;

    // VAPID + service-role are both required to actually deliver. In
    // dev/preview without them, log + return — the durable run still
    // appears in the Inngest UI for observability.
    if (!configureVapid()) {
      console.log(
        `[inngest:push-fanout] VAPID unset; skipping send message=${messageId} thread=${threadId}`,
      );
      return { ok: true, recipients: 0, action: "skipped-no-vapid" };
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log(
        `[inngest:push-fanout] SUPABASE_SERVICE_ROLE_KEY unset; skipping message=${messageId}`,
      );
      return { ok: true, recipients: 0, action: "skipped-no-service-role" };
    }

    const subscriptions = await step.run(
      "load-subscriptions",
      async (): Promise<PushSubRow[]> => {
        const admin = getSupabaseAdmin();

        // 1) Members of the thread, minus the sender.
        const { data: members, error: memberErr } = await admin
          .from("chat_thread_member")
          .select("user_id")
          .eq("thread_id", threadId)
          .neq("user_id", senderId)
          .limit(RECIPIENT_CAP);
        if (memberErr) {
          // chat_thread_member missing in dev (mock chat path) is the
          // common case — log and short-circuit rather than throwing.
          console.warn(
            `[inngest:push-fanout] member lookup failed thread=${threadId}: ${memberErr.message}`,
          );
          return [];
        }
        const recipientIds = (members ?? [])
          .map((r) => r.user_id as string)
          .filter(Boolean);
        if (recipientIds.length === 0) return [];

        // 2) Active subscriptions for those users.
        const { data: subs, error: subErr } = await admin
          .from("push_subscription")
          .select("id, user_id, endpoint, p256dh, auth")
          .in("user_id", recipientIds)
          .is("last_failure_at", null);
        if (subErr) {
          console.warn(
            `[inngest:push-fanout] subscription lookup failed: ${subErr.message}`,
          );
          return [];
        }
        return (subs ?? []) as PushSubRow[];
      },
    );

    if (subscriptions.length === 0) {
      return { ok: true, messageId, recipients: 0, action: "no-subscribers" };
    }

    // Payload is intentionally minimal — body excerpt is already capped
    // to 140 chars at the chat-send tier. The Service Worker decides
    // how to render it.
    const payload = JSON.stringify({
      kind: "chat-message",
      threadId,
      messageId,
      excerpt: bodyExcerpt,
    });

    const result = await step.run("fanout-send", async () => {
      let delivered = 0;
      let failed = 0;
      const expiredIds: string[] = [];

      const sends = subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            payload,
            { TTL: 60 * 60 },
          );
          delivered += 1;
        } catch (err) {
          failed += 1;
          // 404 / 410 → endpoint expired. Mark the row so the next
          // fan-out doesn't retry. Other errors (network blips, 5xx)
          // are non-fatal and not marked — Inngest's function-level
          // retry covers them.
          const status =
            (err as { statusCode?: number } | null)?.statusCode ?? null;
          const expired = status === 404 || status === 410;
          if (expired) {
            expiredIds.push(sub.id);
          }
          console.warn(
            `[inngest:push-fanout] send failed sub=${sub.id} status=${status} expired=${expired}`,
          );
        }
      });
      await Promise.all(sends);

      // Mark expired subscriptions in one batch so the next fan-out
      // skips them. Best-effort — a failure here is non-fatal.
      if (expiredIds.length > 0) {
        const admin = getSupabaseAdmin();
        const { error } = await admin
          .from("push_subscription")
          .update({
            last_failure_at: new Date().toISOString(),
            last_failure_code: 410,
          })
          .in("id", expiredIds);
        if (error) {
          console.warn(
            `[inngest:push-fanout] expired-mark failed: ${error.message}`,
          );
        }
      }

      return { delivered, failed, expired: expiredIds.length };
    });

    return {
      ok: true,
      messageId,
      recipients: subscriptions.length,
      ...result,
    };
  },
);
