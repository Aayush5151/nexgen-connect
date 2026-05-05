/**
 * Chat push fan-out — emits a web-push notification to every other
 * member of the corridor when a message is sent.
 *
 * The chat router fires `chat/message.sent` after persistence; this
 * function looks up every push_subscription row in the same corridor
 * and posts a Web Push payload to each endpoint.
 *
 * Concurrency: Inngest's step.run is sequential by default; we wrap
 * the per-recipient send in `Promise.all` inside one step so 100
 * recipients fan out in parallel without each becoming its own
 * durable step (would blow the function-step quota).
 *
 * Failure semantics: a single recipient endpoint failing (expired
 * subscription, etc.) doesn't fail the whole fan-out — those errors
 * are caught and logged. The function only fails if the corridor
 * lookup itself errors.
 *
 * v16 web pivot Bucket 4 follow-up (P4 work).
 */
import { inngest } from "../client";

export const pushFanout = inngest.createFunction(
  {
    id: "push-fanout",
    retries: 2,
    triggers: [{ event: "chat/message.sent" }],
  },
  async ({ event, step }) => {
    const { messageId, corridorId } = event.data;
    // senderId and bodyExcerpt are referenced via event.data inside the
    // step.run closure once the real fan-out lands; destructured but
    // unused for now would lint-fail.

    const subscriptions = await step.run("load-subscriptions", async () => {
      // Stub — once P1.c lifts the push_subscription table through
      // tRPC, this fetches all rows where corridor_id = corridorId AND
      // user_id != senderId.
      console.log(
        `[inngest:push-fanout] loading subs for corridor=${corridorId}`,
      );
      return [] as Array<{ endpoint: string; p256dh: string; auth: string }>;
    });

    await step.run("fanout-send", async () => {
      const sends = subscriptions.map(async (sub) => {
        try {
          // web-push send goes here; for now a structured log.
          console.log(
            `[inngest:push-fanout] message=${messageId} → endpoint=${sub.endpoint.slice(0, 40)}…`,
          );
        } catch (err) {
          // Per-recipient failure is non-fatal.
          console.warn(
            `[inngest:push-fanout] send failed for endpoint=${sub.endpoint}:`,
            err,
          );
        }
      });
      await Promise.all(sends);
      return { delivered: subscriptions.length };
    });

    return { ok: true, messageId, recipients: subscriptions.length };
  },
);
