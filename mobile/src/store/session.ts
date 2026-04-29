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

import { Platform } from "react-native";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";

/**
 * Storage adapter for Zustand persist.
 *
 * On native (iOS / Android) we use expo-secure-store: writes to the
 * Keychain / EncryptedSharedPreferences so a forensic image of the
 * device can't surface the session token without the device unlock
 * code.
 *
 * On web there is no Keychain — expo-secure-store is a no-op shim
 * that returns null and never resolves cleanly through the
 * Zustand-persist hydration handshake. Fall back to localStorage on
 * web so the persist middleware can hydrate (and the splash gate
 * can resolve). For dev-only browser previews this is fine; the
 * production web surface is the marketing site, not the authed app.
 */
const secureStorage =
  Platform.OS === "web"
    ? {
        getItem: async (name: string): Promise<string | null> => {
          if (typeof window === "undefined") return null;
          return window.localStorage.getItem(name);
        },
        setItem: async (name: string, value: string): Promise<void> => {
          if (typeof window === "undefined") return;
          window.localStorage.setItem(name, value);
        },
        removeItem: async (name: string): Promise<void> => {
          if (typeof window === "undefined") return;
          window.localStorage.removeItem(name);
        },
      }
    : {
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

/**
 * Soft profile collected on the YOU screen, before identity
 * verification. DigiLocker validates the legal name later — what
 * the user types here is the display name + the data we need to
 * route them. Per BP §9.1 the dob_month feeds the composite
 * identity hash; storing it here means we can compute the hash on
 * the server the moment DigiLocker returns.
 */
export type Profile = {
  /** First name only — display name in chats. */
  firstName: string;
  /** Optional. Backup channel if SMS fails. */
  email: string | null;
  /** 1-12. Composite-hash anchor (BP §9.1). */
  dobMonth: number | null;
  /** Self-declared home city (where they're flying from). */
  homeCity: string;
};

/**
 * Destination + intake. Captured on the CORRIDOR screen. Used to
 * place the user into a (home_city × destination_city × intake)
 * corridor for matching.
 */
export type CorridorChoice = {
  /** ISO country code: IE / DE. India isn't a destination. */
  country: "IE" | "DE";
  city: string;
  uni: string;
  /** "September 2026", "October 2026", etc. */
  intake: string;
};

export type SessionState = {
  /* Auth */
  sessionToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  phone: Phone | null;

  /* Funnel state — kept here so a hard reload returns the user to
     where they left off in the onboarding flow. */
  otpSessionId: string | null;
  profile: Profile | null;
  corridorChoice: CorridorChoice | null;
  identityVerified: boolean;
  admitUploaded: boolean;
  admitApproved: boolean;

  /* v6 funnel signals (v15 BP §3.4 RC persona, §3.6 first-10-min,
     §5.2 arrival-checkin). Held at top-level rather than inside
     Profile because O3a fires before /you runs setProfile. */

  /** O3a free-text answer to "what scares you most about September".
   *  Captured between O3 OTP and /you. Optional — user may skip. */
  scariestThingSeptember: string | null;

  /** /corridor wizard step 1: "Is this your first time studying abroad?"
   *  `true` = first-timer (default path). `false` = recovering-student
   *  branch — triggers S31 hybrid-programme warning, accommodation-only
   *  mode, and enhanced visa-status check downstream. `null` until step
   *  1 answers. v15 BP §3.4. */
  isRecoveringStudent: boolean | null;

  /** Y6 first-week arrival check-in window anchor (ISO YYYY-MM-DD).
   *  Y6 surface renders only Day 0–7 from this date. Premium-gated.
   *  v15 BP §5.2 arrival-checkin feature. */
  arrivalDate: string | null;

  /* v6 migration */

  /** True iff a legacy `session-v1` blob was detected during rehydration
   *  and cleared. Welcome screen reads this once on cold-start, shows a
   *  one-time transparency toast, then calls `clearMigrationToast()` to
   *  unset (and persist `false`). v15 BP §3.4 + v6 build §16 — generic
   *  template for any future schema-forced re-onboard. */
  migratedFromV1: boolean;
};

export type SessionActions = {
  setPhone(phone: Phone): void;
  setOtpSessionId(id: string | null): void;
  setSession(input: {
    sessionToken: string;
    refreshToken: string;
    userId: string;
  }): void;
  setProfile(profile: Profile): void;
  setCorridorChoice(choice: CorridorChoice): void;
  /** O3a setter. Pass `null` to clear (user skipped). */
  setScariestThing(text: string | null): void;
  /** /corridor wizard step 1 setter. */
  setRecoveringStudent(value: boolean): void;
  /** Y6 setter. Pass `null` to clear. */
  setArrivalDate(iso: string | null): void;
  markIdentityVerified(): void;
  markAdmitUploaded(): void;
  markAdmitApproved(): void;
  /** Welcome screen calls this AFTER the migration toast has been
   *  dismissed (auto-dismiss timer or user tap), not on first render —
   *  otherwise a user backgrounding the app pre-toast loses the toast
   *  on the next launch. */
  clearMigrationToast(): void;
  clear(): void;
};

const initialState: SessionState = {
  sessionToken: null,
  refreshToken: null,
  userId: null,
  phone: null,
  otpSessionId: null,
  profile: null,
  corridorChoice: null,
  identityVerified: false,
  admitUploaded: false,
  admitApproved: false,
  scariestThingSeptember: null,
  isRecoveringStudent: null,
  arrivalDate: null,
  migratedFromV1: false,
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

      setProfile: (profile) => set({ profile }),
      setCorridorChoice: (choice) => set({ corridorChoice: choice }),
      setScariestThing: (text) => set({ scariestThingSeptember: text }),
      setRecoveringStudent: (value) => set({ isRecoveringStudent: value }),
      setArrivalDate: (iso) => set({ arrivalDate: iso }),

      markIdentityVerified: () => set({ identityVerified: true }),
      markAdmitUploaded: () => set({ admitUploaded: true }),
      markAdmitApproved: () => set({ admitApproved: true }),

      clearMigrationToast: () => set({ migratedFromV1: false }),

      clear: () => set(initialState),
    }),
    {
      name: "session-v2",
      version: 2,
      storage: createJSONStorage(() => secureStorage),
      // Don't persist transient OTP session — it expires server-side
      // anyway, and persisting confuses re-entry to O3.
      partialize: (state) => {
        const { otpSessionId: _, ...persisted } = state;
        return persisted;
      },
      // After hydration completes, scan for a legacy session-v1 blob.
      // If found, delete it and flip migratedFromV1 so the welcome
      // screen renders a one-time transparency toast on next render.
      // v15 BP §3.4 / v6 build §16 forced re-onboard pattern — generic
      // template for any future schema-forced re-onboard (just bump
      // the storage key + version, point this at the prior key).
      onRehydrateStorage: () => async (_state, error) => {
        if (error) return;
        try {
          const legacy = await secureStorage.getItem("session-v1");
          if (legacy !== null) {
            await secureStorage.removeItem("session-v1");
            useSession.setState({ migratedFromV1: true });
          }
        } catch {
          // Best-effort cleanup. The legacy blob is Keychain-protected
          // on native and never read again, so a missed cleanup is a
          // small storage leak, not a security issue.
        }
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
