/**
 * Analytics boot — wires PostHog + Plausible into the React tree.
 *
 * Must run inside a client component because PostHog has to read
 * window.localStorage on init. Mounted from the root layout right
 * next to <TrpcProvider> so all session ids are set before any tRPC
 * call fires.
 *
 * No-op in SSR (typeof window check) and no-op when env keys are
 * absent (so dev / preview deploys without observability set up
 * stay quiet).
 *
 * v16 web pivot Bucket 4 follow-up (P3 work).
 */
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initPostHog, trackPostHog } from "@/lib/posthog";

export function AnalyticsBoot() {
  const pathname = usePathname();

  useEffect(() => {
    initPostHog();
  }, []);

  useEffect(() => {
    if (!pathname) return;
    trackPostHog("pageview", { path: pathname });
  }, [pathname]);

  return null;
}
