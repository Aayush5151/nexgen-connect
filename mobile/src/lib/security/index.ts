/**
 * Security module barrel.
 *
 * Single import path for the mobile security primitives:
 *
 *   import { reauth, isJailbrokenOrRooted, useScreenCapturePrevent,
 *     maskPhone, scrubObject, useIdleTimeout } from "@/lib/security";
 *
 * v15 BP §16 / v6 build §16 / Build Prompt Bucket 3.
 */
export { reauth, isBiometricAvailable, type ReauthResult } from "./biometric";
export { isJailbrokenOrRooted, _resetJailbreakCache } from "./jailbreak";
export { useScreenCapturePrevent } from "./screen-protection";
export {
  maskPhone,
  maskEmail,
  scrubObject,
  sentryBeforeSend,
  filterAnalyticsProperties,
  POSTHOG_PROPERTY_WHITELIST,
} from "./pii-scrub";
export {
  bumpActivity,
  idleDurationMs,
  idleThresholdFor,
  useIdleTimeout,
  _setLastActivityForTest,
  type VerificationStage,
} from "./session-manager";
export { PINNED_HOSTS, PINNING_ENABLED, type PinnedHost } from "./cert-pinning";
export { useReducedMotion } from "./use-reduced-motion";
