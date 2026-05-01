/**
 * Session manager — idle timeout + token refresh skeleton.
 *
 * Build Prompt §Bucket 3 / Session management:
 *   "15-minute idle timeout for un-verified users (phone-only state).
 *    7-day idle timeout for fully verified users. Refresh tokens are
 *    short-lived (24 hours) with rotating issuance. Server invalidates
 *    on logout."
 *
 * Implementation:
 *   - Tracks "last activity" timestamp from any user input event
 *     (button press, screen navigation).
 *   - Compares against the appropriate idle threshold based on user's
 *     verification stage.
 *   - On idle exceedance, calls onIdleSession() — typically clears
 *     session + redirects to /onboarding/welcome.
 *   - Refresh-token rotation is skeletonised here; the actual refresh
 *     call lands in Bucket 4 when the tRPC client wires up.
 *
 * Wire `useIdleTimeout()` once in RootLayout and `bumpActivity()`
 * inside any consequential interaction (Button onPress, Pressable,
 * navigation events).
 *
 * v15 BP §16 / v6 build §16 / Build Prompt Bucket 3.
 */

import { useEffect, useRef } from "react";
import { AppState } from "react-native";

const IDLE_TIMEOUT_PHONE_ONLY_MS = 15 * 60 * 1000; // 15 minutes
const IDLE_TIMEOUT_FULLY_VERIFIED_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

let lastActivity: number = Date.now();
const listeners = new Set<() => void>();

/** Bump the activity timestamp. Called from event handlers, navigation
 *  hooks, etc. */
export function bumpActivity(): void {
  lastActivity = Date.now();
}

/** Read the idle duration in ms. */
export function idleDurationMs(): number {
  return Date.now() - lastActivity;
}

export type VerificationStage = "unauthenticated" | "phone_only" | "fully_verified";

export function idleThresholdFor(stage: VerificationStage): number {
  switch (stage) {
    case "unauthenticated":
      // No timeout — they're not signed in.
      return Number.POSITIVE_INFINITY;
    case "phone_only":
      return IDLE_TIMEOUT_PHONE_ONLY_MS;
    case "fully_verified":
      return IDLE_TIMEOUT_FULLY_VERIFIED_MS;
  }
}

/**
 * Hook the idle-timeout monitor.
 *
 * Pass the current verification stage and an `onIdle` callback. The
 * hook polls every 30 seconds and fires `onIdle` once the threshold
 * is crossed. App backgrounding doesn't pause the timer — backgrounded
 * for 8 days = idle on resume.
 *
 * Caller is responsible for clearing session + navigating away from
 * authed surfaces inside `onIdle`.
 */
export function useIdleTimeout(stage: VerificationStage, onIdle: () => void): void {
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;

  useEffect(() => {
    const threshold = idleThresholdFor(stage);
    if (threshold === Number.POSITIVE_INFINITY) return;

    const fire = () => {
      if (idleDurationMs() >= threshold) {
        onIdleRef.current();
      }
    };

    // Poll every 30s. Cheap on battery, fine for the precision we need.
    const interval = setInterval(fire, 30_000);

    // App-state subscriber: when the app comes to foreground, check
    // immediately. A 7-day-backgrounded fully-verified user shouldn't
    // wait another 30s for the idle gate.
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") fire();
    });

    listeners.add(fire);
    return () => {
      clearInterval(interval);
      sub.remove();
      listeners.delete(fire);
    };
  }, [stage]);
}

/**
 * Test helper. Resets the activity clock to a specific timestamp.
 * Production code should never call this.
 */
export function _setLastActivityForTest(ms: number): void {
  lastActivity = ms;
}
