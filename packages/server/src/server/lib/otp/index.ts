/**
 * OTP module barrel.
 *
 * Single import path for the tRPC procedure to consume:
 *   import { sendOtp } from "@/server/lib/otp";
 *
 * v16 web pivot §P0.
 */
export { sendOtp } from "./router";
export type { OtpChannel, OtpProvider, SendOtpInput, SendOtpResult } from "./types";
export type { RouterInput, ProviderRegistry } from "./router";
