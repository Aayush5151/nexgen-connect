"use client";

import { useEffect, useState } from "react";
import { UNIVERSITIES, CITIES, COHORT_CAP } from "@/lib/waitlist";
import { cn } from "@/lib/utils";

type Count = { city: string; university: string; count: number };

type LastJoined = {
  name: string;
  city: string;
  university: string;
  created_at: string;
};

type Data = {
  counts: Count[];
  last_joined: LastJoined | null;
  total: number;
};

const FEATURED = [
  { uni: "tum", cities: ["Mumbai", "Delhi", "Pune", "Bangalore"] as const },
  { uni: "rwth", cities: ["Mumbai", "Delhi"] as const },
  { uni: "tub", cities: ["Mumbai"] as const },
];

function relativeTime(iso: string): string {
  const d = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - d);
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

function uniName(id: string): string {
  return UNIVERSITIES.find((u) => u.id === id)?.name ?? id;
}

export function CohortWidget({ className }: { className?: string }) {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/waitlist", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as Data;
        if (mounted) setData(json);
      } catch {
        // quiet fail — honest zero-state takes over
      }
    }
    load();
    const id = setInterval(load, 30_000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  function countFor(uni: string, city: string): number {
    if (!data) return 0;
    return data.counts.find((c) => c.university === uni && c.city === city)?.count ?? 0;
  }

  return (
    <div className={cn("rounded-2xl border border-border bg-[#121217] p-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            WS26 Cohort — Live
          </p>
          <p className="mt-1 text-sm text-foreground">
            {data ? (
              data.total === 0 ? (
                <>Be the first. Your name goes here.</>
              ) : (
                <>
                  <span className="font-mono text-foreground">{data.total}</span>{" "}
                  verified so far
                </>
              )
            ) : (
              <span className="text-muted-foreground">Loading…</span>
            )}
          </p>
        </div>
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-[#66D9A3]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#66D9A3] opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#66D9A3]" />
          </span>
          Live
        </span>
      </div>

      <div className="mt-6 space-y-5">
        {FEATURED.map((group) => (
          <div key={group.uni}>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {uniName(group.uni)}
            </p>
            <div className="mt-2 space-y-1.5">
              {group.cities.map((city) => {
                const n = countFor(group.uni, city);
                const pct = Math.min(100, (n / COHORT_CAP) * 100);
                const isEmpty = n === 0;
                return (
                  <div key={city} className="group flex items-center gap-3 text-[13px]">
                    <span className="w-20 text-muted-foreground">{city}</span>
                    <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-[#1C1C22]">
                      <div
                        className="h-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-16 text-right font-mono text-[12px] tabular-nums text-foreground">
                      {isEmpty ? (
                        <span className="text-subtle">be 1st →</span>
                      ) : (
                        <>
                          {n}<span className="text-subtle"> / {COHORT_CAP}</span>
                        </>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {data?.last_joined && (
        <div className="mt-6 border-t border-border pt-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">
            Last joined
          </p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            <span className="text-foreground">{data.last_joined.name}</span> ·{" "}
            {data.last_joined.city} → {uniName(data.last_joined.university)} ·{" "}
            <span className="text-subtle">{relativeTime(data.last_joined.created_at)}</span>
          </p>
        </div>
      )}

      {data && data.total === 0 && (
        <div className="mt-6 border-t border-border pt-4">
          <p className="font-mono text-[11px] leading-relaxed text-subtle">
            Real zero. Not fake forty-three. Cohorts cap at {COHORT_CAP}.
          </p>
        </div>
      )}

      <p className="sr-only">
        CITIES available: {CITIES.join(", ")}
      </p>
    </div>
  );
}
