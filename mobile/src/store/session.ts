/**
 * Session store. Holds the auth token + user id + the onboarding
 * funnel state. Persisted to expo-secure-store on iOS / Android via
 * a custom Zustand storage adapter — secure-store puts values in
 * the iOS Keychain / Android Keystore, not in AsyncStorage, so a
 * stolen device can't surface the session token from a backup.
 *
 * Why not AsyncStorage:
 *   - AsyncStorage on iOS is just a plist in app sandbox; readable by
 *     anyone with file-system access (root + jailbreak).
 *   - secure-store wraps Keychain (iOS) and EncryptedSharedPreferences
 *     (Android), so even a forensic image needs the device unlock.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";

/** Storage adapter that bridges Zustand persist to expo-secure-store. */
const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await SecureStore.deleteItemAsync(name);
  },
};

/* ------------------------------------------------------------------ */
/* State.                                                              */
/* ------------------------------------------------------------------ */

export type Phone = { country: string; e164: string };

export type SessionState = {
  /* Auth */
  sessionToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  phone: Phone | null;

  /* Funnel — kept here so a hard reload returns the user to where
     they left off in the onboarding flow. */
  otpSessionId: string | null;
  identityVerified: boolean;
  admitUploaded: boolean;
  admitApproved: boolean;
};

export type SessionActions = {
  setPhone(phone: Phone): void;
  setOtpSessionId(id: string | null): void;
  setSession(input: {
    sessionToken: string;
    refreshToken: string;
    userId: string;
  }): void;
  markIdentityVerified(): void;
  markAdmitUploaded(): void;
  markAdmitApproved(): void;
  clear(): void;
};

const initialState: SessionState = {
  sessionToken: null,
  refreshToken: null,
  userId: null,
  phone: null,
  otpSessionId: null,
  identityVerified: false,
  admitUploaded: false,
  admitApproved: false,
};

export const useSession = create<SessionState & SessionActions>()(
  persist(
    (set) => ({
      ...initialState,

      setPhone: (phone) => set({ phone }),
      setOtpSessionId: (id) => set({ otpSessionId: id }),

      setSession: ({ sessionToken, refreshToken, userId }) =>
        set({
          sessionToken,
          refreshToken,
          userId,
          otpSessionId: null,
        }),

      markIdentityVerified: () => set({ identityVerified: true }),
      markAdmitUploaded: () => set({ admitUploaded: true }),
      markAdmitApproved: () => set({ admitApproved: true }),

      clear: () => set(initialState),
    }),
    {
      name: "session-v1",
      storage: createJSONStorage(() => secureStorage),
      // Don't persist transient OTP session — it expires server-side
      // anyway, and persisting confuses re-entry to O3.
      partialize: (state) => {
        const { otpSessionId: _, ...persisted } = state;
        return persisted;
      },
    },
  ),
);

/**
 * Reactive hydration flag.
 *
 * Zustand persist reads from secure-store asynchronously. On first
 * mount, `useSession((s) => s.sessionToken)` returns `null` even for
 * a verified returning user — until hydration completes a moment
 * later. Auth-gates that redirect on `null` therefore flash the
 * Welcome screen for one frame.
 *
 * To kill that flicker we expose a separate reactive store for
 * hydration state. Zustand persist's `onFinishHydration` flips the
 * flag once the secure-store read completes; components subscribed
 * via `useSessionHydrated()` re-render at that moment.
 */

import { create as createStore } from "zustand";

const useHydrationStore = createStore<{ hydrated: boolean }>(() => ({
  hydrated: false,
}));

useSession.persist.onFinishHydration(() => {
  useHydrationStore.setState({ hydrated: true });
});
// Edge case: if hydration already finished before this module
// mounted (rare on cold start, common during fast-refresh), surface
// that immediately so the gate doesn't hang.
if (useSession.persist.hasHydrated()) {
  useHydrationStore.setState({ hydrated: true });
}

export function useSessionHydrated(): boolean {
  return useHydrationStore((s) => s.hydrated);
}
