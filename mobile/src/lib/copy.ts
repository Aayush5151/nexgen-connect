/**
 * useCopy hook — the consumer-facing wrapper around @nexgen-connect/copy.
 *
 * v6 build §20 / Phase 5 i18n integration. Reads the user's locale
 * preference from the preferences store (defaults to "en") and returns
 * a per-namespace copy lookup function.
 *
 * Usage:
 *   const t = useCopy("onboarding");
 *   <Text>{t("welcome.heading")}</Text>
 *
 * The hook is reactive — when the user changes locale in settings,
 * every screen using useCopy re-renders with the new locale.
 *
 * Keys reference the dot-paths defined in packages/copy/src/<locale>/
 * <namespace>.ts. Missing keys fall back through the resolver chain
 * (hi → en → key string for dev visibility).
 */

import { copy as copyResolver, type Locale, type Namespace } from "@nexgen-connect/copy";
import { usePreferences } from "@/store/preferences";

export function useCopy(namespace: Namespace) {
  const locale = usePreferences((s) => s.locale);
  return copyResolver(locale as Locale, namespace);
}

/** Non-hook variant for places React state isn't available
 *  (notification handlers, deep-link routers, etc.). Reads locale
 *  from preferences store imperatively. */
export function getCopy(namespace: Namespace) {
  const locale = usePreferences.getState().locale as Locale;
  return copyResolver(locale, namespace);
}
