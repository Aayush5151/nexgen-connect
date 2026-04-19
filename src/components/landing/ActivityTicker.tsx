"use client";

import { useEffect, useState } from "react";
import { getRecentActivityAction } from "@/app/actions/waitlist";
import type { RecentActivityRow } from "@/lib/supabase/schema";

let cache: { rows: RecentActivityRow[]; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 60_000;

function formatRelative(iso: string): string {
  const delta = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(delta / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} d ago`;
}

export function ActivityTicker() {
  const [rows, setRows] = useState<RecentActivityRow[] | null>(() =>
    cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS ? cache.rows : null,
  );

  useEffect(() => {
    if (rows !== null) return;
    let cancelled = false;
    getRecentActivityAction(10).then((res) => {
      if (cancelled) return;
      if (res.ok) {
        cache = { rows: res.rows, fetchedAt: Date.now() };
        setRows(res.rows);
      } else {
        setRows([]);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [rows]);

  // Honesty rule: hide entirely if fewer than 3 real signups.
  if (!rows || rows.length < 3) return null;

  const loop = [...rows, ...rows];

  return (
    <section
      aria-label="Recent cohort signups"
      className="overflow-hidden border-y border-[color:var(--color-border)] bg-[color:var(--color-surface)]"
    >
      <div className="ticker-track flex items-center gap-10 whitespace-nowrap py-4 text-[13px]">
        {loop.map((r, i) => (
          <span
            key={`${r.created_at}-${i}`}
            className="inline-flex items-center gap-2"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
              →
            </span>
            <span className="font-medium text-[color:var(--color-fg)]">
              {r.first_name}
            </span>
            <span className="text-[color:var(--color-fg-subtle)]">from</span>
            <span className="text-[color:var(--color-fg-muted)]">{r.home_city}</span>
            <span className="text-[color:var(--color-primary)]">joined</span>
            <span className="text-[color:var(--color-fg)]">
              {r.destination_university} · Sept 2026
            </span>
            <span className="text-[color:var(--color-fg-subtle)]">·</span>
            <span className="font-mono text-[color:var(--color-fg-subtle)]">
              {formatRelative(r.created_at)}
            </span>
          </span>
        ))}
      </div>

      <style jsx>{`
        .ticker-track {
          animation: ticker-scroll 40s linear infinite;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
        @keyframes ticker-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .ticker-track {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
