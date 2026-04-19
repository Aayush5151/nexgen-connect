"use client";

import { useEffect, useState } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { getRecentActivityAction } from "@/app/actions/waitlist";
import type { RecentActivityRow } from "@/lib/supabase/schema";

function formatRelative(iso: string): string {
  const delta = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(delta / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ActivityTicker() {
  const [rows, setRows] = useState<RecentActivityRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getRecentActivityAction(5).then((res) => {
      if (cancelled) return;
      if (res.ok) setRows(res.rows);
      else setRows([]);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Honesty rule: hide entirely if fewer than 3 real signups.
  if (!rows || rows.length < 3) return null;

  return (
    <section className="border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-10 md:py-14">
      <div className="container-narrow">
        <SectionLabel>Just reserved</SectionLabel>
        <ul className="mt-6 grid gap-3 md:grid-cols-5 md:gap-4">
          {rows.map((r, i) => (
            <li
              key={`${r.created_at}-${i}`}
              className="rounded-[10px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                {formatRelative(r.created_at)}
              </p>
              <p className="mt-1.5 text-[14px] font-medium text-[color:var(--color-fg)]">
                {r.first_name}
              </p>
              <p className="text-[12px] text-[color:var(--color-fg-muted)]">
                {r.home_city} → {r.destination_university}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
