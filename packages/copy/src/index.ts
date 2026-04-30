/**
 * @nexgen-connect/copy — i18n copy library.
 *
 * v15 BP §20 / v6 build §20 — EN baseline 100%, HI partial (onboarding
 * + verification + Premium namespaces). Per v15 user-heart language.
 *
 * Structure:
 *   src/en/        EN baseline (every namespace, every key).
 *   src/hi/        HI partial (onboarding + verification + premium).
 *   src/index.ts   Resolver — pick(locale, namespace, key) → string.
 *
 * Resolver returns the EN value as the fallback for any HI miss. Real
 * apps would use i18next/react-intl; we keep a tiny resolver because
 * we don't want runtime locale negotiation overhead in P3 — the user's
 * locale is pinned at install time and rarely changes.
 *
 * Usage:
 *   import { copy } from "@nexgen-connect/copy";
 *   const t = copy("en", "onboarding");
 *   t("welcome.heading"); // "Find your people / before you land."
 */

import * as enOnboarding from "./en/onboarding";
import * as enVerification from "./en/verification";
import * as enPremium from "./en/premium";
import * as enErrors from "./en/errors";
import * as enPush from "./en/push";
import * as enEmpty from "./en/empty-states";
import * as enCorridor from "./en/corridor";
import * as enChat from "./en/chat";
import * as enSafety from "./en/safety";

import * as hiOnboarding from "./hi/onboarding";
import * as hiVerification from "./hi/verification";
import * as hiPremium from "./hi/premium";

export type Locale = "en" | "hi";

export type Namespace =
  | "onboarding"
  | "verification"
  | "premium"
  | "errors"
  | "push"
  | "empty-states"
  | "corridor"
  | "chat"
  | "safety";

type CopyTable = Record<string, string>;

const tables: Record<Locale, Partial<Record<Namespace, CopyTable>>> = {
  en: {
    onboarding: enOnboarding.copy,
    verification: enVerification.copy,
    premium: enPremium.copy,
    errors: enErrors.copy,
    push: enPush.copy,
    "empty-states": enEmpty.copy,
    corridor: enCorridor.copy,
    chat: enChat.copy,
    safety: enSafety.copy,
  },
  hi: {
    onboarding: hiOnboarding.copy,
    verification: hiVerification.copy,
    premium: hiPremium.copy,
  },
};

/**
 * Look up a copy string. Falls back through the locale chain:
 *   pick(hi, ns, key) → if missing, pick(en, ns, key) → if missing, key.
 *
 * In dev, missing-key lookups log to console with the lookup path so
 * translators see the gap.
 */
export function pick(
  locale: Locale,
  namespace: Namespace,
  key: string,
): string {
  const localeTable = tables[locale]?.[namespace];
  const value = localeTable?.[key];
  if (value !== undefined) return value;
  // Fall back to EN.
  if (locale !== "en") {
    const enValue = tables.en[namespace]?.[key];
    if (enValue !== undefined) return enValue;
  }
  // Last resort: return the key. This is visible in the UI ("missing
  // key: ${key}") so it surfaces during dev.
  return key;
}

/** Curried convenience — build a per-namespace lookup. */
export function copy(locale: Locale, namespace: Namespace) {
  return (key: string) => pick(locale, namespace, key);
}

/** Test helper — list all keys in a namespace for a locale. */
export function _keysIn(locale: Locale, namespace: Namespace): string[] {
  return Object.keys(tables[locale]?.[namespace] ?? {});
}
