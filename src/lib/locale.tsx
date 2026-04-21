"use client";

import { createContext, useContext, useEffect, useState } from "react";

/**
 * Locale. A lightweight EN / हिं toggle that persists to localStorage
 * and exposes a `t(key)` helper for component-level strings. Scope is
 * deliberately narrow for launch: hero + safety/parent section, because
 * those are the most emotionally weighted reads for a Hindi-first
 * parent or student. We can scale it to full-page later.
 *
 * Not a full i18n system - no pluralisation, no interpolation, no
 * locale-specific number formatting. Just a switch.
 */

export type Locale = "en" | "hi";

type Dict = Record<string, string>;

const STRINGS: Record<Locale, Dict> = {
  en: {
    "hero.kicker": "The app · Coming soon",
    "hero.title1": "Find your people",
    "hero.title2": "before you land.",
    "hero.body":
      "A pocket-sized group of verified students, all flying to the same country, the same month, as you.",
    "hero.pitch": "Ireland first. Everywhere after that.",
    "hero.waitlistHint": "Or get notified the moment it ships",

    "parents.kicker": "For the most skeptical reader",
    "parents.title1": "If you're a parent",
    "parents.title2": "reading this.",
    "parents.body":
      "Your daughter, son, your only child. We know what's at stake. Four things we built in from day one, so you can breathe.",
    "parents.closing": "Your job is to worry. Ours is to make it stop.",
  },
  hi: {
    "hero.kicker": "यह ऐप · जल्द आ रहा है",
    "hero.title1": "अपने लोग पाओ",
    "hero.title2": "पहुँचने से पहले।",
    "hero.body":
      "एक छोटा, जाँचा-परखा ग्रुप — उसी देश, उसी महीने उड़ान भरने वाले छात्रों का, जिसमें तुम भी हो।",
    "hero.pitch": "पहले आयरलैंड। फिर हर जगह।",
    "hero.waitlistHint": "या लॉन्च होते ही सूचना पाओ",

    "parents.kicker": "सबसे सतर्क पाठक के लिए",
    "parents.title1": "अगर आप माता-पिता हैं",
    "parents.title2": "और यह पढ़ रहे हैं।",
    "parents.body":
      "आपकी बेटी, बेटा, आपकी संतान। हम जानते हैं क्या दाँव पर है। पहले दिन से चार चीज़ें, ताकि आप चैन से सो सकें।",
    "parents.closing": "चिंता करना आपका काम है। उसे रोकना हमारा।",
  },
};

type LocaleContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

const STORAGE_KEY = "nx-locale";

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  // Load persisted preference once mounted.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "hi" || saved === "en") setLocaleState(saved);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, l);
    }
  };

  const t = (key: string) =>
    STRINGS[locale][key] ?? STRINGS.en[key] ?? key;

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  // Graceful fallback if provider is missing (e.g. RSC pages).
  // Consumers still render English copy.
  if (!ctx) {
    return {
      locale: "en",
      setLocale: () => {},
      t: (key: string) => STRINGS.en[key] ?? key,
    };
  }
  return ctx;
}
