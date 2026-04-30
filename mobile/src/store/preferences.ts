/**
 * User preferences store. Notification toggles, language, theme prefs.
 *
 * Persisted via AsyncStorage (NOT secure-store) — these are not
 * secrets, just UX state. The session store in src/store/session.ts
 * handles auth tokens via Keychain / Keystore; this store handles
 * everything else that should survive an app reload.
 *
 * Toggles are wired to push notification subscriptions in Phase 4
 * polish (when expo-notifications service binds). For now, flipping a
 * toggle is a UI-only change that persists across reloads.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type NotificationPrefs = {
  /** Push when corridor crosses 60 verified. */
  unlock: boolean;
  /** Push for day-1 prompts and sub-circle activity nudges. */
  prompt: boolean;
  /** Push for direct-message notifications. */
  dm: boolean;
  /** Off-by-default product / marketing email + push. */
  marketing: boolean;
};

const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  unlock: true,
  prompt: true,
  dm: true,
  marketing: false,
};

/** v6 §20 — locale preference. Defaults to "en". HI is partial per
 *  the v6 §20 scope (onboarding + verification + premium namespaces).
 *  Future locales added to this union as the copy package grows. */
export type LocaleCode = "en" | "hi";

export type PreferencesState = {
  notifications: NotificationPrefs;
  locale: LocaleCode;
};

export type PreferencesActions = {
  setNotificationPref: (key: keyof NotificationPrefs, value: boolean) => void;
  resetNotificationPrefs: () => void;
  setLocale: (locale: LocaleCode) => void;
};

export const usePreferences = create<PreferencesState & PreferencesActions>()(
  persist(
    (set) => ({
      notifications: DEFAULT_NOTIFICATION_PREFS,
      locale: "en",

      setNotificationPref: (key, value) =>
        set((state) => ({
          notifications: { ...state.notifications, [key]: value },
        })),

      resetNotificationPrefs: () => set({ notifications: DEFAULT_NOTIFICATION_PREFS }),

      setLocale: (locale) => set({ locale }),
    }),
    {
      name: "preferences-v1",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
