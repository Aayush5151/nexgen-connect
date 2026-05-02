/**
 * App-surface services — flag-aware adapter.
 *
 * Same shape as `mock-services.ts`, but routes through API endpoints
 * when the corresponding `NEXT_PUBLIC_USE_REAL_<SERVICE>` flag is on.
 *
 * Used by /app/profile/premium (Razorpay) and /app/profile/parent
 * (Resend magic-link). Everything else still calls the mock until
 * Bucket 7 (Realtime / chat) wires Supabase.
 *
 * v16 web pivot §Bucket 6.
 */
import * as mocks from "./mock-services";

export type {
  CorridorMember,
  ChatThread,
  ChatMessage,
  CorridorState,
  SubCircleDetail,
  ProfileSnapshot,
} from "./mock-services";

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

// ---------------------------------------------------------------------------
// Mock-only for Bucket 6 — Supabase wiring lands in Bucket 7
// ---------------------------------------------------------------------------

export const corridorState = mocks.corridorState;
export const chatThreads = mocks.chatThreads;
export const chatMessages = mocks.chatMessages;
export const chatSendMessage = mocks.chatSendMessage;
export const subCircleDetail = mocks.subCircleDetail;
export const profileSnapshot = mocks.profileSnapshot;
export const groupApplyJoin = mocks.groupApplyJoin;
export const arrivalCheckIn = mocks.arrivalCheckIn;
export const helpReport = mocks.helpReport;

// ---------------------------------------------------------------------------
// Razorpay — premium ₹999 once
// ---------------------------------------------------------------------------

export async function premiumStartCheckout(): Promise<{
  orderId: string;
  amount: number;
  currency: "INR";
  /** Razorpay key the client uses to open Checkout. Mock returns rzp_test_mock. */
  keyId?: string;
}> {
  if (flagOn("NEXT_PUBLIC_USE_REAL_RAZORPAY")) {
    return postJson("/api/razorpay/order", {
      idempotencyKey: crypto.randomUUID(),
    });
  }
  return mocks.premiumStartCheckout();
}

// ---------------------------------------------------------------------------
// Parent magic-link (Resend)
// ---------------------------------------------------------------------------

export async function parentGenerateMagicLink(input: { email: string }): Promise<{
  expiresAt: string;
  emailSentTo: string;
}> {
  if (flagOn("NEXT_PUBLIC_USE_REAL_RESEND")) {
    return postJson("/api/parent-link/send", input);
  }
  return mocks.parentGenerateMagicLink(input);
}
