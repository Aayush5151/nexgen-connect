/**
 * Mock auth service. Lets the entire onboarding funnel run without
 * MSG91 / DigiLocker / a backend. When real services land in Phase 1
 * we swap the export in src/lib/services/index.ts to point at the
 * tRPC client; nothing else changes.
 *
 * Behaviour:
 *   - requestOtp delays 600ms, returns an otpSessionId (uuid).
 *   - verifyOtp delays 500ms, accepts code "123456" as success;
 *     anything else throws an OtpInvalid error so the screen can
 *     show "Wrong code, try again".
 *   - The "magic" code is logged to the console so a dev can read it
 *     from Expo dev tools and skip retyping during demos.
 */

import type {
  RequestOtpInput,
  RequestOtpResult,
  VerifyOtpInput,
  VerifyOtpResult,
} from "../services/types";

const MAGIC_OTP = "123456";

function delay<T>(ms: number, value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 10) + "_mock";
}

function maskPhone(e164: string): string {
  if (e164.length < 4) return e164;
  return "+" + e164.slice(0, 2) + " " + "*".repeat(8) + e164.slice(-2);
}

export class OtpInvalidError extends Error {
  constructor() {
    super("Wrong code. Try again.");
    this.name = "OtpInvalidError";
  }
}

export const authMock = {
  async requestOtp(input: RequestOtpInput): Promise<RequestOtpResult> {
    if (__DEV__) {
      console.log(
        `[mock auth] OTP for ${input.phone.e164} → ${MAGIC_OTP} (use this in dev)`,
      );
    }
    return delay(600, {
      otpSessionId: randomId(),
      expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
      maskedPhone: maskPhone(input.phone.e164),
    });
  },

  async verifyOtp(input: VerifyOtpInput): Promise<VerifyOtpResult> {
    await delay(500, null);
    if (input.code !== MAGIC_OTP) {
      throw new OtpInvalidError();
    }
    return {
      sessionToken: "mock_session_" + randomId(),
      refreshToken: "mock_refresh_" + randomId(),
      user: {
        id: "mock_user_" + randomId(),
        phoneVerifiedAt: new Date().toISOString(),
      },
    };
  },
};
