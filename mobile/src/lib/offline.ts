/**
 * Offline support scaffold — queue + replay infrastructure.
 *
 * v15 BP §15 / v6 build §15 — 12 screens have specified offline
 * behaviour (chat send, admit upload retry, etc.). This module is
 * the queue + replay foundation; consumer screens hook in via
 * `useOfflineQueue` to enqueue actions when network is down.
 *
 * Backed by AsyncStorage so queued actions survive app reload.
 *
 * Usage (planned — consumer integration is per-screen P5 polish):
 *   const enqueue = useOfflineQueue("chat.sendMessage");
 *   if (!isOnline) {
 *     enqueue({ channelId, body });
 *     // Show "queued · will send when online" indicator
 *   } else {
 *     services.chat.sendMessage({ channelId, body });
 *   }
 *
 * Replay: when network returns, useOfflineQueue's effect drains the
 * queue in FIFO order. Failed replays bubble to the user via the
 * standard error catalogue (E007 network unreachable).
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "offline-queue-v1";

export type QueueEntry = {
  /** Action kind — matches the service procedure path, e.g.,
   *  "chat.sendMessage", "verification.uploadAdmit". */
  kind: string;
  /** Serialised input. Each consumer is responsible for its own
   *  schema validation when replayed. */
  payload: Record<string, unknown>;
  /** ISO timestamp the action was enqueued. */
  enqueuedAt: string;
  /** Idempotency key — prevents double-submit if replay races with
   *  a successful real-time submit. */
  idempotencyKey: string;
};

let memoryQueue: QueueEntry[] = [];
let hydrated = false;

async function ensureHydrated(): Promise<void> {
  if (hydrated) return;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    memoryQueue = raw ? (JSON.parse(raw) as QueueEntry[]) : [];
  } catch {
    memoryQueue = [];
  }
  hydrated = true;
}

async function persist(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(memoryQueue));
  } catch {
    // Best effort; if AsyncStorage is full we drop the persist but
    // keep memoryQueue. Reload would lose entries, which is the same
    // as a true network failure — surface as E007 if it matters.
  }
}

function randomKey(): string {
  return Math.random().toString(36).slice(2, 14);
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export const offlineQueue = {
  async enqueue(
    kind: string,
    payload: Record<string, unknown>,
  ): Promise<string> {
    await ensureHydrated();
    const idempotencyKey = randomKey();
    memoryQueue.push({
      kind,
      payload,
      enqueuedAt: new Date().toISOString(),
      idempotencyKey,
    });
    await persist();
    return idempotencyKey;
  },

  /** Drain all entries of a given kind (or all kinds if not specified)
   *  and return them. Caller is responsible for replaying via the
   *  service layer + handling individual failures. Failed entries
   *  should be re-enqueued by the caller. */
  async drain(kind?: string): Promise<QueueEntry[]> {
    await ensureHydrated();
    if (!kind) {
      const drained = memoryQueue;
      memoryQueue = [];
      await persist();
      return drained;
    }
    const matching = memoryQueue.filter((e) => e.kind === kind);
    memoryQueue = memoryQueue.filter((e) => e.kind !== kind);
    await persist();
    return matching;
  },

  async size(kind?: string): Promise<number> {
    await ensureHydrated();
    if (!kind) return memoryQueue.length;
    return memoryQueue.filter((e) => e.kind === kind).length;
  },

  /** Test helper — clear the queue. */
  async _reset(): Promise<void> {
    memoryQueue = [];
    hydrated = true;
    await persist();
  },
};

/* ------------------------------------------------------------------ */
/* Offline-screens matrix (v6 §15 — 12 screens)                        */
/* ------------------------------------------------------------------ */

/** v6 §15 catalogue — which screens have offline branches and what
 *  they queue. Per-screen consumer integration is P5 polish; this
 *  object documents the contract. */
export const OFFLINE_MATRIX = {
  "phone (O2)": "Phone entry — submit queues if offline; OTP request retries on reconnect.",
  "otp (O3)": "OTP verify — server-roundtrip required, blocks with E007 if offline.",
  "scared (O3a)": "Submit queues; user proceeds to /you with text held locally.",
  "you (O4)": "Profile entry — fully offline; persists to session immediately.",
  "corridor wizard (O5)": "Wizard — fully offline; selections persist to session.",
  "admit upload (O9)": "Upload queues; replay fires when online with idempotency key.",
  "chat send (CT2)": "Optimistic local render + offline queue; replays in FIFO.",
  "subcircle toggle (G3)": "Toggle queues; conflicts resolved server-side on replay.",
  "premium unlock (PR2)": "Razorpay sheet requires online; blocks with E046 if offline.",
  "ts report (TS1)": "Report submit queues; advisor SLA timer starts from enqueue ts.",
  "y6 thumb (Y6)": "Daily thumb submit queues; replays in 1-day window.",
  "first-mover schedule (CH6)": "Schedule queues; admin AD13 sees the queued state.",
};
