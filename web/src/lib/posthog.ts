/**
 * PostHog client wrapper + closed event taxonomy.
 *
 * Sits beside the Plausible tracker in `analytics.ts` (Plausible runs
 * the public marketing surface; PostHog runs the authed funnel — see
 * docs/v16-web-pivot-decisions.md §observability for the split).
 *
 * One global PostHog instance per browser tab. The taxonomy below is
 * the canonical event-name list — `track()` is generic over EventName
 * + EventProps so adding a call that's not in the union fails
 * typecheck. Adding a property that's not in the matching shape
 * likewise fails.
 *
 * Why a closed taxonomy: prevents the "every dev makes up a new
 * event name" drift that breaks analytics in month 3. When a new
 * event is required, add it here in the same PR that emits it.
 *
 * PII discipline matches Sentry's `beforeSend` — phone, OTP, Aadhaar,
 * email, and token fields are stripped via `scrubProperties` on every
 * track call. PostHog `register` (super-properties) is allowed only
 * for non-PII session/device fields.
 *
 * v16 web pivot Bucket 4 follow-up (P3 work).
 */
import posthog from "posthog-js";

let initialised = false;

const PII_KEYS = new Set([
  "phone",
  "phoneE164",
  "e164",
  "e_164",
  "aadhaar",
  "aadhar",
  "vid",
  "otp",
  "code",
  "email",
  "sessionToken",
  "refreshToken",
  "sb-access-token",
  "sb-refresh-token",
]);

function scrubProperties(props: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(props)) {
    out[k] = PII_KEYS.has(k) ? "[redacted]" : v;
  }
  return out;
}

export function initPostHog() {
  if (initialised) return;
  if (typeof window === "undefined") return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;

  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
    // Capture is opt-in via the cookie consent flow — the consent
    // journal (Bucket 3 §consent) sets the opt-in only when the user
    // has accepted analytics in the cookie banner.
    opt_out_capturing_by_default: true,
    capture_pageview: false, // we fire 'pageview' explicitly via track()
    capture_pageleave: true,
    persistence: "localStorage+cookie",
    autocapture: false,
  });
  initialised = true;
}

export function optInAnalytics() {
  if (initialised) posthog.opt_in_capturing();
}

export function optOutAnalytics() {
  if (initialised) posthog.opt_out_capturing();
}

// ---------------------------------------------------------------------------
// Event taxonomy. Adding a new event = add to BOTH `EventName` and
// `EventProps` below. The closed union prevents drift.
// ---------------------------------------------------------------------------

export type EventName =
  | "pageview"
  | "signup_started"
  | "otp_requested"
  | "otp_resent"
  | "otp_channel_switched"
  | "otp_verified"
  | "otp_failed"
  | "identity_started"
  | "identity_completed"
  | "identity_failed"
  | "admit_uploaded"
  | "admit_approved"
  | "admit_rejected"
  | "corridor_chosen"
  | "premium_checkout_started"
  | "premium_paid"
  | "premium_failed"
  | "parent_link_sent"
  | "parent_link_verified"
  | "chat_message_sent"
  | "ts_report_filed"
  | "y6_check_in"
  | "group_apply_join"
  | "consent_accepted"
  | "consent_revoked"
  | "erasure_requested";

export type EventProps = {
  pageview: { path: string };
  signup_started: { source?: string };
  otp_requested: { channel: "whatsapp" | "sms"; preferSms: boolean };
  otp_resent: { channel: "whatsapp" | "sms"; preferSms: boolean };
  otp_channel_switched: { channel: "whatsapp" | "sms"; preferSms: boolean };
  otp_verified: { channel: "whatsapp" | "sms"; durationMs: number };
  otp_failed: { errorCode: string; channel?: "whatsapp" | "sms" };
  identity_started: Record<string, never>;
  identity_completed: Record<string, never>;
  identity_failed: { reason: string };
  admit_uploaded: { docId: string };
  admit_approved: { docId: string; queueWaitMinutes: number };
  admit_rejected: { docId: string; reason: string; canResubmit: boolean };
  corridor_chosen: {
    homeCity: string;
    destination: string;
    intake: string;
    coldStart: boolean;
  };
  premium_checkout_started: { orderId: string };
  premium_paid: { orderId: string; amountInr: number };
  premium_failed: { orderId: string; reason: string };
  parent_link_sent: Record<string, never>;
  parent_link_verified: Record<string, never>;
  chat_message_sent: { corridorId: string; layer: 1 | 2 | 3 };
  ts_report_filed: { reasonCode: string };
  y6_check_in: { destinationCity: string };
  group_apply_join: { groupId: string };
  consent_accepted: { policyVersion: string };
  consent_revoked: { policyVersion: string };
  erasure_requested: Record<string, never>;
};

export function trackPostHog<N extends EventName>(name: N, props: EventProps[N]) {
  if (!initialised) return;
  posthog.capture(name, scrubProperties(props as Record<string, unknown>));
}

/**
 * Identify a user without leaking PII. Pass the internal verified-user
 * id (UUID). Phone / email are NEVER identifiers in our taxonomy.
 */
export function identify(verifiedUserId: string) {
  if (!initialised) return;
  posthog.identify(verifiedUserId);
}

export function reset() {
  if (!initialised) return;
  posthog.reset();
}
