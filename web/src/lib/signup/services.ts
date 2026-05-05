/**
 * Signup services — flag-aware adapter.
 *
 * Each function checks a `NEXT_PUBLIC_USE_REAL_<SERVICE>` env flag at
 * call time:
 *   - flag === "true": fetches the corresponding API route (real service
 *     with mock fallback decided server-side based on key presence)
 *   - otherwise: returns the local mock-services result
 *
 * Why client-side flag instead of "always fetch": dev with no API
 * routes spun up (e.g., running just `next dev` against the mock pages
 * for design review) shouldn't 502 every step. Production deploys
 * always set the flag to "true".
 *
 * v16 web pivot §Bucket 6.
 */
import * as mocks from "./mock-services";
import type { Phone } from "./mock-services";

export type { Phone } from "./mock-services";
// CorridorChoice lives on the Zustand store (state.ts), not the service.
export type { CorridorChoice } from "./state";

function flagOn(name: string): boolean {
  if (typeof process === "undefined") return false;
  return process.env[name] === "true";
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error((errBody as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error((errBody as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

// ---------------------------------------------------------------------------
// Auth (MSG91)
// ---------------------------------------------------------------------------

export async function authRequestOtp(input: { phone: Phone; turnstileToken: string }) {
  if (flagOn("NEXT_PUBLIC_USE_REAL_MSG91")) {
    return postJson<{
      otpSessionId: string;
      expiresAt: string;
      maskedPhone: string;
    }>("/api/auth/send-otp", input);
  }
  return mocks.authRequestOtp(input);
}

export async function authVerifyOtp(input: {
  otpSessionId: string;
  code: string;
  /** Required by the real route to construct the upstream URL. */
  phoneE164?: string;
}) {
  if (flagOn("NEXT_PUBLIC_USE_REAL_MSG91")) {
    if (!input.phoneE164) throw new Error("E022:phone_required_for_real_verify");
    return postJson<{
      sessionToken: string;
      refreshToken: string;
      user: { id: string; phoneVerifiedAt: string };
    }>("/api/auth/verify-otp", {
      otpSessionId: input.otpSessionId,
      code: input.code,
      phoneE164: input.phoneE164,
    });
  }
  return mocks.authVerifyOtp({ otpSessionId: input.otpSessionId, code: input.code });
}

// ---------------------------------------------------------------------------
// Corridor preview — mock-only for Bucket 6 (Supabase view lands in B7)
// ---------------------------------------------------------------------------

export const corridorPreview = mocks.corridorPreview;

// ---------------------------------------------------------------------------
// DigiLocker
// ---------------------------------------------------------------------------

export async function verificationStartDigiLocker() {
  if (flagOn("NEXT_PUBLIC_USE_REAL_DIGILOCKER")) {
    return getJson<{ authUrl: string; state: string }>("/api/digilocker/start");
  }
  return mocks.verificationStartDigiLocker();
}

export const verificationCompleteDigiLocker = mocks.verificationCompleteDigiLocker;

// ---------------------------------------------------------------------------
// Admit (Cloudflare Images)
// ---------------------------------------------------------------------------

export async function verificationUploadAdmit(input: {
  mimeType: string;
  fileSizeBytes: number;
}) {
  if (flagOn("NEXT_PUBLIC_USE_REAL_CF_IMAGES")) {
    return postJson<{
      uploadUrl: string;
      docId: string;
      retentionMinutesAfterReview: number;
    }>("/api/admit/sign-upload", input);
  }
  return mocks.verificationUploadAdmit(input);
}

export async function verificationCompleteAdmit(input: { docId: string }) {
  if (flagOn("NEXT_PUBLIC_USE_REAL_CF_IMAGES")) {
    return postJson<{
      reviewBy: string;
      queuePosition: number;
      docId: string;
    }>("/api/admit/complete", input);
  }
  return mocks.verificationCompleteAdmit(input);
}

export const verificationStatus = mocks.verificationStatus;
