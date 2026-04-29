/**
 * Push notification catalogue mocks. Real push delivery (FCM / APNS)
 * happens server-side; these are the canonical client-visible payload
 * shapes that map to v6 build §0 changes 14 (push catalogue).
 *
 * The mobile client doesn't send push notifications — it RECEIVES them.
 * These mocks exist so:
 *   1. UI surfaces that surface notifications inline (e.g., the
 *      "scheduled" toast in CH6 first-mover) can render the same copy
 *      that the real push will show.
 *   2. Tests / Storybook can render pixel-perfect previews.
 *   3. The push-catalogue is treated as a versioned contract — if a
 *      copy string changes here, it must change server-side too.
 *
 * v15 BP §3.7a/§3.7b drive most of these.
 */

export type PushNotificationKind =
  /** N33 — Layer 1 hometown crew unlocked (>= 8 verified). */
  | "n33_layer_1_unlock"
  /** N34 — First-mover founder-call scheduled (within 24h). */
  | "n34_first_mover_call_scheduled"
  /** N35 — Women-only sub-thread auto-spawned (≥4 verified women). */
  | "n35_women_only_sub_thread_spawned"
  /** N36 — Hybrid programme warning (Berlin IU 2025 protection). */
  | "n36_hybrid_programme_warning";

export type PushNotificationPayload = {
  kind: PushNotificationKind;
  title: string;
  body: string;
  /** Optional deep link the OS notification tray opens on tap. */
  deepLink?: string;
};

/** Canonical copy table. Server emits these exact strings; client
 *  surfaces (in-app toasts, inline confirmations) match. */
export const PUSH_CATALOGUE: Record<PushNotificationKind, PushNotificationPayload> = {
  n33_layer_1_unlock: {
    kind: "n33_layer_1_unlock",
    title: "Hometown crew is live",
    body: "8 verified students from your home city are now in your Layer 1 thread. Tap to see them.",
    deepLink: "nexgen://corridor/hometown",
  },
  n34_first_mover_call_scheduled: {
    kind: "n34_first_mover_call_scheduled",
    title: "Your founder-call is scheduled",
    body: "Aayush or T&S will call within 24 hours via masked-number bridge — your number stays private.",
    deepLink: "nexgen://corridor/hometown",
  },
  n35_women_only_sub_thread_spawned: {
    kind: "n35_women_only_sub_thread_spawned",
    title: "Verified women-only thread is open",
    body: "4+ verified women in your corridor — a parallel women-only sub-thread just opened. Opt-out anytime.",
    deepLink: "nexgen://chat",
  },
  n36_hybrid_programme_warning: {
    kind: "n36_hybrid_programme_warning",
    title: "Hybrid programme · check before you fly",
    body: "Your admit shows a hybrid programme at a German HEI. Open NexGen to read the visa-class risk before continuing.",
    deepLink: "nexgen://onboarding/hybrid-warning",
  },
};

/** Mock helper — fakes "this notification was just delivered" for
 *  in-app surfaces that want to render its copy without subscribing
 *  to the real FCM/APNS pipe. */
export function mockNotification(
  kind: PushNotificationKind,
): PushNotificationPayload {
  return { ...PUSH_CATALOGUE[kind] };
}
