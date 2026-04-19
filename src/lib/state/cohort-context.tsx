"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { University } from "@/lib/supabase/schema";

/**
 * Shared state for the landing page's two main interactive surfaces:
 * the CohortCard (top of hero) and the GroupCanvas (below ActivityTicker).
 *
 * Goal: if a user fills in their city + campus in the card, the group
 * visualization below should reflect that the moment they scroll. And
 * vice versa. The whole page behaves like one surface, not two.
 *
 * Anything that doesn't live inside a <CohortProvider> falls back to
 * component-local state via the null-check in `useCohort`. That keeps
 * the CohortCard component renderable in isolation for tests / demos.
 */

export type UniValue = University | "";

interface CohortState {
  city: string;
  uni: UniValue;
  setCity: (c: string) => void;
  setUni: (u: UniValue) => void;
}

const CohortContext = createContext<CohortState | null>(null);

export function CohortProvider({
  children,
  initialCity = "",
  initialUni = "",
}: {
  children: React.ReactNode;
  initialCity?: string;
  initialUni?: UniValue;
}) {
  const [city, setCity] = useState(initialCity);
  const [uni, setUni] = useState<UniValue>(initialUni);

  // Stable callbacks so consumers can safely add them to effect deps
  // without triggering re-runs on every re-render of the provider.
  const stableSetCity = useCallback((c: string) => setCity(c), []);
  const stableSetUni = useCallback((u: UniValue) => setUni(u), []);

  const value = useMemo<CohortState>(
    () => ({
      city,
      uni,
      setCity: stableSetCity,
      setUni: stableSetUni,
    }),
    [city, uni, stableSetCity, stableSetUni],
  );

  return (
    <CohortContext.Provider value={value}>{children}</CohortContext.Provider>
  );
}

/**
 * Shared cohort state. If the caller isn't wrapped in a CohortProvider,
 * returns null so the consumer can decide whether to fall back to its
 * own local state (useful for the CohortCard when embedded outside the
 * landing page).
 */
export function useCohort(): CohortState | null {
  return useContext(CohortContext);
}

/** Non-null variant for consumers that absolutely require the provider. */
export function useCohortStrict(): CohortState {
  const ctx = useContext(CohortContext);
  if (!ctx) {
    throw new Error(
      "useCohortStrict must be used inside <CohortProvider>. Wrap the tree at the page level.",
    );
  }
  return ctx;
}
