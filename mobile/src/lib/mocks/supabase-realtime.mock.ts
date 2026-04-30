/**
 * Supabase Realtime — mock client.
 *
 * v15 BP §12 / v6 build §12 — chat channel pub/sub for Layer 2 + Layer 1
 * + sub-circles + women-only sub-thread. Real implementation uses the
 * Supabase Realtime SDK with channel-pool sharding above 150 subscribers
 * (v6 §22 update).
 *
 * Mock: in-memory event emitter that mimics the Supabase Realtime channel
 * API. Subscribers receive events for their channel only. No sharding
 * logic — that's a server concern.
 *
 * Real swap: replace this module's exports with `@supabase/realtime-js`
 * client; the public API of `subscribe`/`unsubscribe`/`broadcast`/`presence`
 * matches.
 */

export type RealtimeMessage = {
  /** Channel topic, e.g., `corridor:l2_dublin_sep26`. */
  topic: string;
  /** Event name, e.g., `message.new`, `presence.join`. */
  event: string;
  /** Arbitrary payload — contract is per-channel. */
  payload: Record<string, unknown>;
  /** ISO timestamp of broadcast. */
  at: string;
};

type Subscription = {
  topic: string;
  callback: (msg: RealtimeMessage) => void;
};

const subscribers: Map<string, Set<Subscription>> = new Map();

export const supabaseRealtimeMock = {
  /** Subscribe to a channel topic. Returns an unsubscribe handle.
   *
   *  Usage:
   *    const unsub = realtime.subscribe(
   *      "corridor:l2_dublin_sep26",
   *      (msg) => console.log(msg.payload),
   *    );
   *    // ...
   *    unsub();
   */
  subscribe(topic: string, callback: (msg: RealtimeMessage) => void): () => void {
    const sub: Subscription = { topic, callback };
    if (!subscribers.has(topic)) subscribers.set(topic, new Set());
    subscribers.get(topic)!.add(sub);
    return () => {
      subscribers.get(topic)?.delete(sub);
    };
  },

  /** Broadcast an event to all subscribers of a topic. Real impl
   *  goes server-side; mock dispatches synchronously. */
  broadcast(topic: string, event: string, payload: Record<string, unknown>): void {
    const subs = subscribers.get(topic);
    if (!subs) return;
    const msg: RealtimeMessage = {
      topic,
      event,
      payload,
      at: new Date().toISOString(),
    };
    for (const s of subs) {
      try {
        s.callback(msg);
      } catch {
        // Subscriber threw; swallow — same as real Supabase client.
      }
    }
  },

  /** Test helper — count subscribers on a topic. */
  _subscriberCount(topic: string): number {
    return subscribers.get(topic)?.size ?? 0;
  },

  /** Test helper — list all active topics. */
  _activeTopics(): string[] {
    return Array.from(subscribers.keys()).filter((t) => (subscribers.get(t)?.size ?? 0) > 0);
  },

  /** Test helper — clear all subscriptions. */
  _reset(): void {
    subscribers.clear();
  },
};

export type SupabaseRealtimeClient = typeof supabaseRealtimeMock;
