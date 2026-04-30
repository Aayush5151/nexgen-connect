/**
 * Services barrel — single import path the rest of the app uses.
 *
 *   import { services } from "@/lib/services";
 *   const me = await services.corridor.me();
 *
 * Routes everything to in-memory mocks. When Phase 1+ accounts land
 * (MSG91 / DigiLocker / Supabase / Razorpay), swap the imports below
 * to the tRPC client implementations and every screen picks up the
 * real backend without any other change.
 */

import Constants from "expo-constants";
import { authMock, OtpInvalidError } from "../mocks/auth.mock";
import { verificationMock, DigiLockerFailureError } from "../mocks/verification.mock";
import { corridorMock } from "../mocks/corridor.mock";
import { chatMock } from "../mocks/chat.mock";
import { premiumMock } from "../mocks/premium.mock";
import { parentMock } from "../mocks/parent.mock";
import { trustSafetyMock } from "../mocks/trust-safety.mock";
import { groupApplyMock } from "../mocks/group-apply.mock";
import { mentalHealthMock } from "../mocks/mental-health.mock";
import { scamsMock } from "../mocks/scams.mock";
// External integration mocks (v6 PR3 — single import-flip swap point
// for each when the real account / SDK is provisioned). v15 BP §6.4
// (Twilio Voice), §12 (Supabase Realtime), §21 (PostHog), §22 (Sentry),
// §5.2 (Stripe-EUR fallback), §13 (Cloudflare Images).
import { twilioVoiceMock } from "../mocks/twilio-voice.mock";
import { supabaseRealtimeMock } from "../mocks/supabase-realtime.mock";
import { sentryMock } from "../mocks/sentry.mock";
import { posthogMock } from "../mocks/posthog.mock";
import { stripeEurMock } from "../mocks/stripe-eur.mock";
import { cloudflareImagesMock } from "../mocks/cloudflare-images.mock";
import type { Services } from "./types";

const useMocks = (Constants.expoConfig?.extra?.useMocks as boolean | undefined) ?? true;

const allMocks: Services = {
  auth: authMock,
  verification: verificationMock,
  corridor: corridorMock,
  chat: chatMock,
  premium: premiumMock,
  parent: parentMock,
  trustSafety: trustSafetyMock,
  groupApply: groupApplyMock,
  mentalHealth: mentalHealthMock,
  scams: scamsMock,
};

export const services: Services = useMocks
  ? allMocks
  : // TODO Phase 1+: replace each with the tRPC client binding once
    // the backend lands. Type contract in ./types.ts is the source
    // of truth — anything diverging there breaks both impls equally.
    allMocks;

/** Dev-only handles for runtime state toggles in mock mode. */
export const devTools = {
  unlockCorridor: () => corridorMock._unlock(),
  relockCorridor: () => corridorMock._relock(),
};

/** External integration clients — separate from `services` (which is
 *  the tRPC contract surface) because these wrap third-party SDKs.
 *  Single-import-flip swap point per integration when its real account
 *  / SDK is provisioned. Mock files document the matching real-client
 *  API. */
export const externalClients = {
  twilioVoice: twilioVoiceMock,
  realtime: supabaseRealtimeMock,
  sentry: sentryMock,
  analytics: posthogMock,
  stripeEur: stripeEurMock,
  cloudflareImages: cloudflareImagesMock,
};

export type ExternalClients = typeof externalClients;

export { OtpInvalidError, DigiLockerFailureError };
export type * from "./types";
