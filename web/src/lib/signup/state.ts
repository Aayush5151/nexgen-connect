"use client";

/**
 * Signup funnel state — Zustand store, pinned to the signup module.
 *
 * Holds funnel-only state (phone, otp session, name, corridor choice,
 * etc.). Persists to localStorage so a refresh OR a fresh tab pickup
 * mid-funnel doesn't drop the user. Wiped on `complete()` and on
 * /signup landing.
 *
 * TTL: state older than 7 days is dropped on rehydrate — covers the
 * "user came back two weeks later" case where their corridor / first
 * choices may no longer reflect intent. OTP session ids expire
 * server-side after 5 minutes regardless, so /signup/otp will bounce
 * to /signup if the cached id has gone stale.
 *
 * Auth session itself (after OTP verify) is a separate concern —
 * that's a Supabase-managed HTTP-only cookie set by the server-side
 * auth.verifyOtp procedure (Bucket 6 wires the real Supabase Auth).
 *
 * v16 web pivot §Bucket 4 / §P1.c (cross-session resume).
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const STATE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type CorridorChoice = {
  country: "IE" | "DE";
  city: string;
  uni: string;
  intake: string;
};

export type Phone = {
  /** ISO 2 — only "IN" supported at launch. */
  country: "IN";
  /** E.164 without "+", digits only. */
  e164: string;
};

type SignupState = {
  // step 1
  phone: Phone | null;
  otpSessionId: string | null;
  /** Channel that delivered the most recent OTP — "whatsapp" or "sms". */
  otpChannel: "whatsapp" | "sms" | null;
  // step 2 (post-OTP)
  sessionToken: string | null;
  // step 3
  firstName: string | null;
  email: string | null;
  homeCity: string | null;
  dobMonth: number | null; // 1..12
  // step 4
  corridorChoice: CorridorChoice | null;
  isFirstTimer: boolean | null; // RC question
  // step 6
  identityHashMasked: string | null;
  identityFailureReason: "aadhaar_not_linked" | "mobile_changed" | "deactivated" | "invisible_character" | null;
  // step 7
  admitDocId: string | null;
  admitState: "not_uploaded" | "pending" | "approved" | "rejected" | null;

  /** Last-touch timestamp; the persist gate uses this to drop stale sessions. */
  _persistedAt: number;

  setPhone(p: Phone): void;
  setOtpSession(id: string, channel?: "whatsapp" | "sms"): void;
  setOtpChannel(channel: "whatsapp" | "sms"): void;
  setSession(token: string): void;
  setProfile(p: { firstName: string; email: string | null; homeCity: string; dobMonth: number }): void;
  setCorridorChoice(c: CorridorChoice): void;
  setIsFirstTimer(v: boolean): void;
  setIdentity(masked: string): void;
  setIdentityFailure(reason: SignupState["identityFailureReason"]): void;
  setAdmit(p: { docId: string; state: SignupState["admitState"] }): void;
  reset(): void;
};

const initial = {
  phone: null,
  otpSessionId: null,
  otpChannel: null,
  sessionToken: null,
  firstName: null,
  email: null,
  homeCity: null,
  dobMonth: null,
  corridorChoice: null,
  isFirstTimer: null,
  identityHashMasked: null,
  identityFailureReason: null,
  admitDocId: null,
  admitState: null,
  _persistedAt: 0,
} satisfies Omit<
  SignupState,
  "setPhone"
  | "setOtpSession"
  | "setOtpChannel"
  | "setSession"
  | "setProfile"
  | "setCorridorChoice"
  | "setIsFirstTimer"
  | "setIdentity"
  | "setIdentityFailure"
  | "setAdmit"
  | "reset"
>;

// Tag every mutating setter so the persist middleware also captures
// the touch timestamp. This is what the rehydrate gate consults to
// drop stale sessions older than STATE_TTL_MS.
const stamp = () => ({ _persistedAt: Date.now() });

export const useSignup = create<SignupState>()(
  persist(
    (set) => ({
      ...initial,
      setPhone: (phone) => set({ phone, ...stamp() }),
      setOtpSession: (otpSessionId, channel) =>
        set({ otpSessionId, ...(channel ? { otpChannel: channel } : null), ...stamp() }),
      setOtpChannel: (otpChannel) => set({ otpChannel, ...stamp() }),
      setSession: (sessionToken) => set({ sessionToken, ...stamp() }),
      setProfile: (p) =>
        set({
          firstName: p.firstName,
          email: p.email,
          homeCity: p.homeCity,
          dobMonth: p.dobMonth,
          ...stamp(),
        }),
      setCorridorChoice: (corridorChoice) => set({ corridorChoice, ...stamp() }),
      setIsFirstTimer: (isFirstTimer) => set({ isFirstTimer, ...stamp() }),
      setIdentity: (identityHashMasked) =>
        set({ identityHashMasked, identityFailureReason: null, ...stamp() }),
      setIdentityFailure: (identityFailureReason) => set({ identityFailureReason, ...stamp() }),
      setAdmit: (p) => set({ admitDocId: p.docId, admitState: p.state, ...stamp() }),
      reset: () => set({ ...initial }),
    }),
    {
      // Bumped from v1 (sessionStorage) to v2 (localStorage). The
      // v2 key namespace prevents stale sessionStorage payloads from
      // being mis-applied if a user has both running side-by-side.
      name: "nx-signup-v2",
      version: 2,
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? voidStorage : localStorage,
      ),
      onRehydrateStorage: () => (state, error) => {
        if (error || !state) return;
        if (
          state._persistedAt &&
          Date.now() - state._persistedAt > STATE_TTL_MS
        ) {
          // Stale (>7d). Drop everything so the funnel restarts
          // clean. reset() is bound to the rehydrated store.
          state.reset();
        }
      },
    },
  ),
);

const voidStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
} as unknown as Storage;
