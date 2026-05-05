/**
 * App-surface services adapter.
 *
 * Two integration paths sit behind these functions:
 *
 *   1. tRPC (P1.c)         — premium.startCheckout now goes through
 *                             the typed `trpcVanilla` client. The
 *                             vanilla path keeps existing imperative
 *                             call-sites (button onClick handlers)
 *                             working without a hooks refactor.
 *
 *   2. Mock + REST flag    — corridor / chat / profile / sub-circle /
 *                             group-apply / Y6 / help still ride the
 *                             mock-services shapes because the server
 *                             routers' shapes (Channel/Message in the
 *                             chat router vs ChatThread/ChatMessage
 *                             in the UI mocks) haven't converged.
 *                             Shape-alignment + lift to tRPC happens
 *                             in P1.c follow-up; tracked in
 *                             docs/v16-cross-cut-cleanups.md.
 *
 *                             The Resend parent-link path keeps its
 *                             REST route /api/parent-link/send for
 *                             now — react-email template port +
 *                             trpc.parent.setPasscode wiring is the
 *                             follow-up landing alongside the
 *                             template extraction.
 *
 * v16 web pivot §Bucket 6 (initial) / §P1.c (premium swapped to tRPC).
 */
import * as mocks from "./mock-services";
import { trpcVanilla } from "@/lib/trpc";

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
// Mock-backed surfaces (shape-alignment with the server routers is a
// P1.c follow-up; tracked in docs/v16-cross-cut-cleanups.md). These
// preserve the existing UI rendering paths exactly.
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
// Razorpay — premium ₹999 once (P1.c — tRPC)
//
// `premium.startCheckout` is server-gated at fullyVerifiedProcedure.
// In dev without Supabase Auth wired the call throws E001:auth_required
// and the page surfaces a sign-in prompt — a deliberate signal rather
// than a silent mock fallback.
//
// Shape adapter: the server returns `{razorpayOrderId, amountDisplay}`
// while the UI was written against the mock's `{orderId, amount,
// currency, keyId}` contract. We map fields here so the call sites
// don't need to change. The next iteration will widen the procedure
// output to include `keyId` (the rzp_test/live key the browser uses
// to open Checkout) — until then we read it from the public env var
// `NEXT_PUBLIC_RAZORPAY_KEY_ID`.
// ---------------------------------------------------------------------------

export async function premiumStartCheckout(): Promise<{
  orderId: string;
  amount: number;
  currency: "INR";
  /** Razorpay key the client uses to open Checkout. */
  keyId?: string;
}> {
  // Mock-only fallback for dev offline (no API mounted). The flag is
  // explicit so a forgotten preview deploy still hits real tRPC.
  if (flagOn("NEXT_PUBLIC_USE_MOCK_PREMIUM")) {
    return mocks.premiumStartCheckout();
  }

  const result = await trpcVanilla.premium.startCheckout.mutate();
  return {
    orderId: result.razorpayOrderId,
    // amountDisplay is "₹999" — strip the prefix and parse to integer
    // rupees so the UI's existing display logic (currency formatter +
    // analytics emit `amountInr`) keeps working unchanged.
    amount: Number(result.amountDisplay.replace(/[^\d]/g, "")) || 999,
    currency: "INR",
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  };
}

// ---------------------------------------------------------------------------
// Parent magic-link (Resend) — flag-aware REST until react-email
// template port lands. See docs/v16-cross-cut-cleanups.md item 3.
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
