"use client";

/**
 * Signup funnel state — Zustand store, pinned to the signup module.
 *
 * Holds funnel-only state (phone, otp session, name, corridor choice,
 * etc.). Persists to sessionStorage so a refresh mid-funnel doesn't
 * drop the user. Wiped on `complete()` and on /signup landing.
 *
 * Auth session itself (after OTP verify) is a separate concern —
 * that's a Supabase-managed HTTP-only cookie set by the server-side
 * auth.verifyOtp procedure (Bucket 6 wires the real Supabase Auth).
 *
 * v16 web pivot §Bucket 4.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
  // step 5
  scariestThingSeptember: string | null;
  // step 6
  identityHashMasked: string | null;
  identityFailureReason: "aadhaar_not_linked" | "mobile_changed" | "deactivated" | "invisible_character" | null;
  // step 7
  admitDocId: string | null;
  admitState: "not_uploaded" | "pending" | "approved" | "rejected" | null;

  setPhone(p: Phone): void;
  setOtpSession(id: string): void;
  setSession(token: string): void;
  setProfile(p: { firstName: string; email: string | null; homeCity: string; dobMonth: number }): void;
  setCorridorChoice(c: CorridorChoice): void;
  setIsFirstTimer(v: boolean): void;
  setScared(text: string | null): void;
  setIdentity(masked: string): void;
  setIdentityFailure(reason: SignupState["identityFailureReason"]): void;
  setAdmit(p: { docId: string; state: SignupState["admitState"] }): void;
  reset(): void;
};

const initial = {
  phone: null,
  otpSessionId: null,
  sessionToken: null,
  firstName: null,
  email: null,
  homeCity: null,
  dobMonth: null,
  corridorChoice: null,
  isFirstTimer: null,
  scariestThingSeptember: null,
  identityHashMasked: null,
  identityFailureReason: null,
  admitDocId: null,
  admitState: null,
} satisfies Omit<
  SignupState,
  "setPhone"
  | "setOtpSession"
  | "setSession"
  | "setProfile"
  | "setCorridorChoice"
  | "setIsFirstTimer"
  | "setScared"
  | "setIdentity"
  | "setIdentityFailure"
  | "setAdmit"
  | "reset"
>;

export const useSignup = create<SignupState>()(
  persist(
    (set) => ({
      ...initial,
      setPhone: (phone) => set({ phone }),
      setOtpSession: (otpSessionId) => set({ otpSessionId }),
      setSession: (sessionToken) => set({ sessionToken }),
      setProfile: (p) =>
        set({ firstName: p.firstName, email: p.email, homeCity: p.homeCity, dobMonth: p.dobMonth }),
      setCorridorChoice: (corridorChoice) => set({ corridorChoice }),
      setIsFirstTimer: (isFirstTimer) => set({ isFirstTimer }),
      setScared: (scariestThingSeptember) => set({ scariestThingSeptember }),
      setIdentity: (identityHashMasked) => set({ identityHashMasked, identityFailureReason: null }),
      setIdentityFailure: (identityFailureReason) => set({ identityFailureReason }),
      setAdmit: (p) => set({ admitDocId: p.docId, admitState: p.state }),
      reset: () => set(initial),
    }),
    {
      name: "nx-signup-v1",
      storage: createJSONStorage(() => (typeof window === "undefined" ? voidStorage : sessionStorage)),
    },
  ),
);

const voidStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
} as unknown as Storage;
