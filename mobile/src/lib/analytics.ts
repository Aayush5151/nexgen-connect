/**
 * Analytics — typed event constants + capture wrapper.
 *
 * v15 BP §21 / v6 build §21 — ~40 telemetry events per the catalogue.
 * Wraps the externalClients.analytics (PostHog mock for now, real
 * PostHog SDK when EXPO_PUBLIC_POSTHOG_KEY is provisioned).
 *
 * Events are typed by name + payload shape so the call-site is self-
 * documenting and a typo can't ship to production. Add new events to
 * AnalyticsEvent below; the union type forces strict adherence.
 */

import { externalClients } from "@/lib/services";

/* ------------------------------------------------------------------ */
/* Event catalogue                                                     */
/* ------------------------------------------------------------------ */

/** v6 build §21 — ~40 events. Each event is a discriminated union
 *  member: `name` is the event name PostHog stores, properties are
 *  the payload. Names use snake_case per PostHog convention. */
export type AnalyticsEvent =
  // Onboarding (~10)
  | { name: "onboarding_started" }
  | { name: "phone_entered"; properties: { isValidIN: boolean } }
  | { name: "otp_sent" }
  | { name: "otp_verified" }
  | { name: "otp_invalid_attempts"; properties: { count: number } }
  | { name: "scared_submitted"; properties: { length: number } }
  | { name: "scared_skipped" }
  | { name: "rc_answered"; properties: { isFirstTimer: boolean } }
  | { name: "you_completed"; properties: { hasEmail: boolean } }
  | { name: "corridor_question_completed" }
  | { name: "preview_viewed" }
  // Verification (~6)
  | { name: "digilocker_started" }
  | { name: "digilocker_completed" }
  | {
      name: "digilocker_failed";
      properties: {
        reason: "aadhaar_not_linked" | "mobile_changed" | "deactivated" | "invisible_character";
      };
    }
  | { name: "admit_uploaded"; properties: { sizeMb: number; mime: string } }
  | { name: "admit_approved" }
  | { name: "admit_rejected"; properties: { canResubmit: boolean } }
  // Corridor (~6)
  | {
      name: "corridor_layer_2_unlock";
      properties: { count: number; threshold: number };
    }
  | {
      name: "corridor_layer_1_unlock";
      properties: { count: number; threshold: number };
    }
  | { name: "ch1_viewed" }
  | { name: "ch2_viewed" }
  | { name: "ch6_viewed" }
  | { name: "lurker_banner_dismissed" }
  // Chat (~5)
  | { name: "chat_opened" }
  | { name: "message_sent"; properties: { channelKind: string } }
  | { name: "subcircle_joined"; properties: { topic: string } }
  | { name: "subcircle_left"; properties: { topic: string } }
  | { name: "report_button_tapped" }
  // Premium / parent (~6)
  | { name: "premium_upsell_viewed" }
  | {
      name: "premium_unlock_attempted";
      properties: { source: "pr1" | "settings" | "deeplink" };
    }
  | { name: "premium_unlock_succeeded" }
  | {
      name: "premium_unlock_failed";
      properties: { reason: string };
    }
  | { name: "parent_dashboard_setup_started" }
  | { name: "parent_dashboard_unlocked" }
  // T&S / safety (~5)
  | {
      name: "ts_report_filed";
      properties: { category: string; channelId?: string };
    }
  | { name: "advisor_replied" }
  | {
      name: "hn1_triage_tapped";
      properties: { category: string };
    }
  | { name: "scam_pattern_viewed"; properties: { patternId: string } }
  | { name: "crisis_resources_viewed"; properties: { region: string } }
  // First-mover + Y6 (~3)
  | { name: "first_mover_modal_opened" }
  | { name: "first_mover_call_scheduled" }
  | { name: "y6_thumb_submitted"; properties: { vote: "up" | "down"; day: number } };

/* ------------------------------------------------------------------ */
/* Capture wrapper — single API for all events                         */
/* ------------------------------------------------------------------ */

/** Fire an analytics event. Routes to externalClients.analytics
 *  (PostHog mock for now; real PostHog when SDK lands). */
export function track(event: AnalyticsEvent): void {
  const properties =
    "properties" in event ? (event.properties as Record<string, unknown>) : undefined;
  externalClients.analytics.capture(event.name, properties);
}

/** Identify the current user — call after auth.verifyOtp success.
 *  Real PostHog persists this distinct id across sessions; mock just
 *  buffers it. */
export function identifyUser(userId: string, traits?: Record<string, unknown>): void {
  externalClients.analytics.identify(userId, traits);
}

/** Reset analytics identity on sign-out — flips events back to
 *  anonymous-keyed. */
export function resetAnalyticsIdentity(): void {
  externalClients.analytics.reset();
}

/** Track a screen view. Convenience over track(); mirrors PostHog's
 *  $screen event convention. */
export function trackScreen(screenName: string): void {
  externalClients.analytics.screen(screenName);
}
