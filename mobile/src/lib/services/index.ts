/**
 * Services barrel — single import path the rest of the app uses.
 *
 *   import { services } from "@/lib/services";
 *   const result = await services.auth.requestOtp({ phone });
 *
 * Currently routes everything to the in-memory mocks. When Phase 1
 * accounts (MSG91 / DigiLocker partner / Supabase) come online, swap
 * the imports below to the tRPC client implementations and every
 * screen picks up the real backend without any other change.
 */

import Constants from "expo-constants";
import { authMock, OtpInvalidError } from "../mocks/auth.mock";
import {
  verificationMock,
  DigiLockerFailureError,
} from "../mocks/verification.mock";
import type { Services } from "./types";

const useMocks =
  (Constants.expoConfig?.extra?.useMocks as boolean | undefined) ?? true;

export const services: Services = useMocks
  ? {
      auth: authMock,
      verification: verificationMock,
    }
  : {
      // TODO Phase 1: replace with tRPC client implementations once
      // MSG91 + DigiLocker partner + Supabase backend are live. The
      // shape of `Services` won't change — only the bindings below.
      auth: authMock,
      verification: verificationMock,
    };

export { OtpInvalidError, DigiLockerFailureError };
export type * from "./types";
