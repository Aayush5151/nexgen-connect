/**
 * NexGen Connect — error code catalogue.
 *
 * Every user-facing error gets a stable code (E0##) so support, T&S,
 * and audit can correlate logs with what the user actually saw on
 * their screen. Codes are append-only — once published, never re-used,
 * never re-meaningfully'd. If a flow's error semantics change, mint a
 * new code and deprecate the old one in-place (don't delete).
 *
 * Codes E001-E062 come from BP v14.1 / Mobile Plan v5.1. v6 introduces
 * E063-E065 below.
 */

export type ErrorCode =
  /* v6 codes (v6 build §0 change 15) ----------------------------- */
  /** E063 — Layer routing conflict. The user's session indicates a
   *  layer membership state that doesn't reconcile with their corridor
   *  data (e.g., layer-1 parentCorridorId references a non-existent
   *  Layer 2). Hits in O3a router success path + corridor placement.
   *  Recovery: resync corridor data, re-place. */
  | "E063"
  /** E064 — First-mover call scheduling failed. The session's
   *  scheduleFirstMoverCall() succeeded locally but the server-side
   *  Twilio bridge handoff (admin AD13) couldn't be queued. Hits in
   *  CH6. Recovery: tell the user we'll reach out manually + flag
   *  for ops within 5 min. */
  | "E064"
  /** E065 — Hybrid-programme decision rejected. The user chose
   *  "withdraw + refund" on O11a but the refund flow returned an
   *  error (e.g., already past Razorpay refund window, identity hash
   *  collision blocking refund processing). Hits in O11a. Recovery:
   *  T&S advisor reaches out within 1 hour with manual refund. */
  | "E065";

export type ErrorDetail = {
  code: ErrorCode;
  /** Short label for in-app error surfaces. */
  title: string;
  /** Plain-English what-happened. Shown to the user. */
  body: string;
  /** What we'll do next. Always specific — not "please try again". */
  recovery: string;
};

export const ERROR_CATALOGUE: Record<ErrorCode, ErrorDetail> = {
  E063: {
    code: "E063",
    title: "Corridor placement glitch",
    body: "We hit a snag matching your layer state to your corridor. Nothing was lost.",
    recovery:
      "We're re-syncing in the background. If this screen doesn't refresh in 30 seconds, pull down to retry.",
  },
  E064: {
    code: "E064",
    title: "Call scheduling didn't go through",
    body: "Your founder-call confirmation reached us, but our outbound queue rejected it.",
    recovery:
      "Don't worry — we logged it manually. Aayush or T&S will reach you within 4 hours.",
  },
  E065: {
    code: "E065",
    title: "Refund couldn't auto-process",
    body: "Your withdraw decision was recorded, but the automatic refund failed.",
    recovery:
      "A T&S advisor will reach you within 1 hour with a manual refund. No payment was double-charged.",
  },
};
