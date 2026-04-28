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
import {
  verificationMock,
  DigiLockerFailureError,
} from "../mocks/verification.mock";
import { corridorMock } from "../mocks/corridor.mock";
import { chatMock } from "../mocks/chat.mock";
import { premiumMock } from "../mocks/premium.mock";
import { parentMock } from "../mocks/parent.mock";
import { trustSafetyMock } from "../mocks/trust-safety.mock";
import type { Services } from "./types";

const useMocks =
  (Constants.expoConfig?.extra?.useMocks as boolean | undefined) ?? true;

export const services: Services = useMocks
  ? {
      auth: authMock,
      verification: verificationMock,
      corridor: corridorMock,
      chat: chatMock,
      premium: premiumMock,
      parent: parentMock,
      trustSafety: trustSafetyMock,
    }
  : {
      // TODO Phase 1+: replace each with the tRPC client binding once
      // the backend lands. Type contract in ./types.ts is the source
      // of truth — anything diverging there breaks both impls equally.
      auth: authMock,
      verification: verificationMock,
      corridor: corridorMock,
      chat: chatMock,
      premium: premiumMock,
      parent: parentMock,
      trustSafety: trustSafetyMock,
    };

/** Dev-only handles for runtime state toggles in mock mode. */
export const devTools = {
  unlockCorridor: () => corridorMock._unlock(),
  relockCorridor: () => corridorMock._relock(),
};

export { OtpInvalidError, DigiLockerFailureError };
export type * from "./types";
