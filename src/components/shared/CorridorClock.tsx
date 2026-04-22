"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * CorridorClock. A thin marketing artefact that lives in the navbar on
 * desktop. Alternates between the two live launch corridors - Dublin
 * (Sept 2026) and Munich (Oct 2026) - showing the actual local time
 * and a live temperature pulled from Open-Meteo (no API key, CC-BY).
 *
 * v9 two-beachhead version: the pill swaps city every ~7 seconds so
 * readers see both Ireland and Germany surfaced in the chrome, not just
 * Dublin. Same visual footprint as the old DublinClock - one pill,
 * same width tolerance, same animation envelope.
 *
 * Updates:
 *   - Time: every 30s per city (drift-tolerant)
 *   - Weather: every 15 minutes per city (stale-while-revalidate;
 *     Open-Meteo edge-caches so impact is negligible)
 *   - City swap: every 7 seconds via AnimatePresence fade
 *
 * Fails silent if offline - the pill collapses to just the clock.
 */

type City = {
  iata: string; // 3-letter airport code shown in the pill
  label: string; // ARIA label full name
  tz: string; // IANA timezone
  lat: number;
  lng: number;
};

const CITIES: readonly City[] = [
  {
    iata: "DUB",
    label: "Dublin",
    tz: "Europe/Dublin",
    lat: 53.3498,
    lng: -6.2603,
  },
  {
    iata: "MUC",
    label: "Munich",
    tz: "Europe/Berlin",
    lat: 48.1351,
    lng: 11.582,
  },
] as const;

type Weather = { temp: number; label: string };

// WMO weather interpretation codes - collapse to the descriptors both
// Dublin and Munich actually experience; anything exotic stays generic.
function weatherLabel(code: number): string {
  if (code === 0) return "clear";
  if (code <= 3) return "partly cloudy";
  if (code <= 48) return "fog";
  if (code <= 57) return "drizzle";
  if (code <= 67) return "rain";
  if (code <= 77) return "snow";
  if (code <= 82) return "showers";
  if (code <= 86) return "snow showers";
  if (code <= 99) return "storm";
  return "overcast";
}

function fmtLocalTime(d: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

export function CorridorClock() {
  const [cityIndex, setCityIndex] = useState(0);
  const [times, setTimes] = useState<Record<string, string>>({});
  const [weather, setWeather] = useState<Record<string, Weather>>({});

  const activeCity = CITIES[cityIndex];

  // Clock tick - update every city every 30s. Hydration-safe: we render
  // nothing on the server and let the first effect fill the pill.
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const next: Record<string, string> = {};
      for (const c of CITIES) next[c.iata] = fmtLocalTime(now, c.tz);
      setTimes(next);
    };
    update();
    const id = window.setInterval(update, 30_000);
    return () => window.clearInterval(id);
  }, []);

  // Weather fetch - best-effort, ignored on failure. Fetched in parallel
  // for both cities so neither blocks the other.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const results = await Promise.all(
          CITIES.map(async (c) => {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lng}&current=temperature_2m,weather_code&timezone=${encodeURIComponent(c.tz)}`;
            const res = await fetch(url, { cache: "no-store" });
            if (!res.ok) return null;
            const json = (await res.json()) as {
              current: { temperature_2m: number; weather_code: number };
            };
            return {
              iata: c.iata,
              temp: Math.round(json.current.temperature_2m),
              label: weatherLabel(json.current.weather_code),
            };
          }),
        );
        if (cancelled) return;
        const next: Record<string, Weather> = {};
        for (const r of results) {
          if (r) next[r.iata] = { temp: r.temp, label: r.label };
        }
        setWeather(next);
      } catch {
        // Offline, blocked, whatever - stay silent.
      }
    }
    load();
    const id = window.setInterval(load, 15 * 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  // Swap cities every 7 seconds. Only start after first time hydrates.
  useEffect(() => {
    if (!times[activeCity.iata]) return;
    const id = window.setInterval(() => {
      setCityIndex((i) => (i + 1) % CITIES.length);
    }, 7_000);
    return () => window.clearInterval(id);
  }, [times, activeCity.iata]);

  const time = times[activeCity.iata];
  if (!time) {
    // Avoid hydration flicker. The navbar layout reserves no width for
    // this pill, so just render nothing pre-mount.
    return null;
  }

  const w = weather[activeCity.iata];

  return (
    <div
      className="hidden items-center md:flex"
      aria-label={`${activeCity.label} time ${time}${w ? `, ${w.temp} degrees, ${w.label}` : ""}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeCity.iata}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
          className="flex items-center gap-2 rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-fg-muted)]"
        >
          <span
            aria-hidden="true"
            className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--color-primary)]"
          />
          <span className="font-semibold tabular-nums text-[color:var(--color-fg)]">
            {activeCity.iata}
          </span>
          <span className="tabular-nums">{time}</span>
          {w && (
            <>
              <span className="text-[color:var(--color-fg-subtle)]">·</span>
              <span className="tabular-nums">{w.temp}°</span>
              <span className="hidden text-[color:var(--color-fg-subtle)] lg:inline">
                {w.label}
              </span>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
