"use client";

import { useSyncExternalStore } from "react";

/**
 * CityPulse — the "place-feel" hero strip on each university page.
 *
 * Three composed parts:
 *   1. Live local time in the city (computed via Intl.DateTimeFormat
 *      against the city's IANA timezone — updates every 30s)
 *   2. Vibe descriptor for the current month (a static "season + mood"
 *      pair per city, e.g. "Autumn in Dublin — Trinity Term begins")
 *   3. Three neighborhood density rows (where verified students
 *      cluster), each with a small density meter
 *
 * The goal is a one-glance sense of place: a TUM-bound student arrives
 * on /tum and sees "16:43 in Munich · cool autumn · Schwabing /
 * Maxvorstadt / Garching" — the page knows where they're going.
 *
 * Implementation:
 *   - Live time uses useSyncExternalStore subscribed to a 30s interval.
 *     SSR snapshot returns "" (empty placeholder). First client paint
 *     fills the wall clock — no hydration mismatch because both halves
 *     start from "" and the client updates after mount.
 *   - prefers-reduced-motion: no impact (no animation, just text).
 *
 * v18 trillion-dollar polish.
 */

export type CityPulseConfig = {
  /** IANA timezone — "Europe/Dublin", "Europe/Berlin", etc. */
  timezone: string;
  /** One-line current-season descriptor — "Autumn · Trinity Term begins". */
  vibe: string;
  /** 3 neighborhood rows with density signals. */
  neighborhoods: {
    name: string;
    tag: string;
    density: 1 | 2 | 3;
  }[];
};

function subscribeTime(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const id = window.setInterval(callback, 30_000);
  return () => window.clearInterval(id);
}

function getTimeSnapshot(timezone: string): string {
  if (typeof window === "undefined") return "";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: timezone,
    }).format(new Date());
  } catch {
    return "";
  }
}

function getServerTimeSnapshot(): string {
  return "";
}

export function CityPulse({
  city,
  config,
}: {
  city: string;
  config: CityPulseConfig;
}) {
  const now = useSyncExternalStore(
    subscribeTime,
    () => getTimeSnapshot(config.timezone),
    getServerTimeSnapshot,
  );

  return (
    <section
      aria-label={`Local ${city} signal`}
      className="border-y border-[color:var(--color-border)] bg-[color:var(--color-bg)]/40 py-5 backdrop-blur-sm sm:py-6"
    >
      <div className="container-narrow">
        <div className="grid items-center gap-4 sm:grid-cols-[auto_1fr_auto] sm:gap-8">
          <div className="flex items-center gap-3">
            <span className="presence-dot" aria-hidden="true" />
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[20px] font-semibold tabular-nums tracking-[-0.005em] text-[color:var(--color-fg)] sm:text-[22px]">
                {now || "--:--"}
              </span>
              <span className="label-eyebrow text-[color:var(--color-fg-subtle)]">
                in {city}
              </span>
            </div>
          </div>

          <p className="hidden font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--color-fg-muted)] sm:block sm:text-center">
            {config.vibe}
          </p>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[color:var(--color-fg-muted)] sm:hidden">
            {config.vibe}
          </p>

          <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:justify-end">
            {config.neighborhoods.map((n) => (
              <li
                key={n.name}
                className="flex items-center gap-2"
                title={n.tag}
              >
                <DensityBars level={n.density} />
                <span className="font-mono text-[11px] font-medium tracking-[0.01em] text-[color:var(--color-fg)]">
                  {n.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function DensityBars({ level }: { level: 1 | 2 | 3 }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-3 items-end gap-[2px]"
    >
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={
            "w-[3px] rounded-[1px] transition-colors " +
            (n <= level
              ? "bg-[color:var(--color-primary)]"
              : "bg-[color:var(--color-border)]")
          }
          style={{ height: n === 1 ? "5px" : n === 2 ? "9px" : "12px" }}
        />
      ))}
    </span>
  );
}
