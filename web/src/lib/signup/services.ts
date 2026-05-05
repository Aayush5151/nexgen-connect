/**
 * Signup services — flag-aware adapter.
 *
 * Two integration paths sit behind these functions:
 *
 *   1. tRPC (P1.b)         — auth.requestOtp / auth.verifyOtp now go
 *                             through the typed `trpcVanilla` client
 *                             into the in-process /api/trpc handler.
 *                             The router itself respects MOCK_OTP=true,
 *                             so dev without MSG91 keys still works.
 *
 *   2. REST + flag (B6)    — DigiLocker + Cloudflare Images still use
 *                             the original REST routes behind a
 *                             `NEXT_PUBLIC_USE_REAL_<SERVICE>` flag.
 *                             Lifting these to tRPC is P1.c follow-up.
 *
 * Why client-side flag for #2: dev with no API routes spun up (e.g.,
 * `next dev` against the mock pages for design review) shouldn't 502
 * every step. Production deploys always set the flag to "true".
 *
 * v16 web pivot §Bucket 6 (initial) / §P1.b (auth.* swapped to tRPC).
 */
import * as mocks from "./mock-services";
import type { Phone } from "./mock-services";
import { trpcVanilla } from "@/lib/trpc";

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
// Auth (P1.b — tRPC)
//
// Both procedures are public (no session required), so the vanilla client
// can call them without a cookie. The server respects MOCK_OTP=true and
// returns mock=true behaviour, so we don't need a client-side flag here.
// `turnstileToken` is accepted by the input schema and discarded server-
// side until the Turnstile gate gets wired into the auth router (Bucket 6
// follow-up). It stays in the public signature so the OTP page doesn't
// have to change once the gate lands.
// ---------------------------------------------------------------------------

export async function authRequestOtp(input: { phone: Phone; turnstileToken: string }) {
  return trpcVanilla.auth.requestOtp.mutate({ phone: input.phone });
}

export async function authVerifyOtp(input: {
  otpSessionId: string;
  code: string;
  /**
   * Legacy field — the REST route required it for upstream MSG91 calls;
   * the tRPC procedure derives it from the persisted OTP session. Kept
   * optional so existing call-sites compile without churn.
   */
  phoneE164?: string;
}) {
  return trpcVanilla.auth.verifyOtp.mutate({
    otpSessionId: input.otpSessionId,
    code: input.code,
  });
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
