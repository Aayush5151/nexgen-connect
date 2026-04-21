"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * DublinClock. A thin marketing artefact that lives in the navbar on
 * desktop. Shows the *actual* time in Dublin right now, plus a live
 * temperature pulled from Open-Meteo (no API key, CC-BY).
 *
 * Designed to make a reader feel the distance in one glance: your
 * future city is already awake and it is already drizzling there.
 *
 * Two updates:
 *   - Time: every 30s (drift-tolerant, the clock is cosmetic)
 *   - Weather: every 15 minutes (stale-while-revalidate style; cached
 *     on the Open-Meteo edge so impact is negligible)
 *
 * Fails silent if offline - the pill collapses to just the clock.
 */

const DUBLIN_LAT = 53.3498;
const DUBLIN_LNG = -6.2603;
const WEATHER_ENDPOINT = `https://api.open-meteo.com/v1/forecast?latitude=${DUBLIN_LAT}&longitude=${DUBLIN_LNG}&current=temperature_2m,weather_code&timezone=Europe/Dublin`;

type Weather = { temp: number; label: string };

// WMO weather interpretation codes. We collapse to the ~dozen descriptors
// Dublin actually experiences - anything exotic stays generic.
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

function fmtDublinTime(d: Date): string {
  return new Intl.DateTimeFormat("en-IE", {
    timeZone: "Europe/Dublin",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

export function DublinClock() {
  const [time, setTime] = useState<string | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);

  // Clock tick - update every 30s. Hydration-safe: we render nothing on
  // the server and let the first effect fill the pill.
  useEffect(() => {
    const update = () => setTime(fmtDublinTime(new Date()));
    update();
    const id = window.setInterval(update, 30_000);
    return () => window.clearInterval(id);
  }, []);

  // Weather fetch - best-effort, ignored on failure.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(WEATHER_ENDPOINT, { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as {
          current: { temperature_2m: number; weather_code: number };
        };
        if (cancelled) return;
        setWeather({
          temp: Math.round(json.current.temperature_2m),
          label: weatherLabel(json.current.weather_code),
        });
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

  if (!time) {
    // Avoid hydration flicker. The navbar layout reserves no width for
    // this pill, so just render nothing pre-mount.
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
        className="hidden items-center gap-2 rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-fg-muted)] md:flex"
        aria-label={`Dublin time ${time}${weather ? `, ${weather.temp} degrees, ${weather.label}` : ""}`}
      >
        <span
          aria-hidden="true"
          className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--color-primary)]"
        />
        <span className="font-semibold tabular-nums text-[color:var(--color-fg)]">
          DUB
        </span>
        <span className="tabular-nums">{time}</span>
        {weather && (
          <>
            <span className="text-[color:var(--color-fg-subtle)]">·</span>
            <span className="tabular-nums">{weather.temp}°</span>
            <span className="hidden text-[color:var(--color-fg-subtle)] lg:inline">
              {weather.label}
            </span>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
