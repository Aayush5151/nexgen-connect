"use client";

import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";

/**
 * LiveSignupCount — quiet trust badge for the marketing hero.
 *
 * Calls `stats.signupsCount` (server-cached at 60s) and renders one
 * line: "<N> students verified · live count". Hides itself entirely
 * while the value is loading or zero, so a fresh deploy with a cold
 * Supabase doesn't show "0 verified" to the first visitor — better
 * to be invisible than to undermine the trust signal we're trying to
 * build.
 *
 * Why a separate component, not inline in MarketingHero:
 *   - keeps MarketingHero free of trpc + framer dependencies it
 *     already has but that pile up fast in one file;
 *   - gives the count its own animation in/out independent of the
 *     hero's stagger sequence;
 *   - lets us drop this in elsewhere on the marketing site (FAQ,
 *     FinalCTA) without duplicating the fetch.
 *
 * v16 web pivot §P1.d (live trust signals).
 */
export function LiveSignupCount({ className }: { className?: string }) {
  const { data, isLoading, isError } = trpc.stats.signupsCount.useQuery(
    undefined,
    {
      // 60s server cache, 30s client stale window. The hero re-mounts
      // on route change anyway, so we don't lean hard on background
      // refetch.
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // Don't retry — if the public marketing page can't read stats
      // we'd rather show nothing than hammer the API.
      retry: false,
    },
  );

  if (isLoading || isError) return null;
  const count = data?.count ?? 0;
  if (count <= 0) return null;

  return (
    <motion.p
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
      className={
        className ??
        "mt-3 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)] sm:text-[11px] sm:tracking-[0.16em]"
      }
    >
      <span className="relative flex h-1.5 w-1.5">
        <span
          aria-hidden="true"
          className="absolute inset-0 animate-ping rounded-full bg-[color:var(--color-success)] opacity-60"
        />
        <span className="relative h-1.5 w-1.5 rounded-full bg-[color:var(--color-success)]" />
      </span>
      <span>
        <span className="font-semibold text-[color:var(--color-fg)]">
          {count.toLocaleString("en-IN")}
        </span>{" "}
        verified · live count
      </span>
    </motion.p>
  );
}
