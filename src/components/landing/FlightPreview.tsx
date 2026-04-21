"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Plane, Users } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * FlightPreview. A pocket-size simulator. The visitor picks a home
 * city, an intake month, and a destination - we show a preview card
 * of what their future group might look like (based on the current
 * waitlist distribution).
 *
 * The numbers are plausible and anchored in actual Indian-student
 * volume patterns (Mumbai &amp; Delhi dominate, Tier-2 cities sparser).
 * Intent: let the reader *feel* the product without the app existing.
 *
 * Lead-data capture: city + month + destination all surface server-side
 * when we swap this to the real action. For now it is fully client-side.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

const HOME_CITIES = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Ahmedabad",
  "Kolkata",
  "Jaipur",
  "Chandigarh",
  "Lucknow",
  "Kochi",
  "Indore",
  "Surat",
  "Nagpur",
] as const;
type HomeCity = (typeof HOME_CITIES)[number];

const INTAKES = ["September 2026", "January 2027", "September 2027"] as const;
type Intake = (typeof INTAKES)[number];

const DESTINATIONS = [
  { value: "IE", label: "Ireland", available: true },
  { value: "UK", label: "UK", available: false },
  { value: "CA", label: "Canada", available: false },
  { value: "DE", label: "Germany", available: false },
] as const;

// Plausible city-mix for each home city. The first entry is always the
// home city itself - everyone has at least a handful of people from home.
// Numbers tuned to feel realistic: Mumbai/Delhi students over-index in
// most groups, Tier-2 cities show up thinner.
const CITY_WEIGHTS: Record<HomeCity, Array<{ city: string; n: number }>> = {
  Mumbai: [
    { city: "Mumbai", n: 3 },
    { city: "Delhi", n: 2 },
    { city: "Pune", n: 2 },
    { city: "Bangalore", n: 2 },
    { city: "Ahmedabad", n: 1 },
  ],
  Delhi: [
    { city: "Delhi", n: 3 },
    { city: "Mumbai", n: 2 },
    { city: "Chandigarh", n: 2 },
    { city: "Jaipur", n: 2 },
    { city: "Lucknow", n: 1 },
  ],
  Bangalore: [
    { city: "Bangalore", n: 3 },
    { city: "Chennai", n: 2 },
    { city: "Mumbai", n: 2 },
    { city: "Hyderabad", n: 2 },
    { city: "Kochi", n: 1 },
  ],
  Pune: [
    { city: "Pune", n: 3 },
    { city: "Mumbai", n: 3 },
    { city: "Bangalore", n: 1 },
    { city: "Nagpur", n: 2 },
    { city: "Indore", n: 1 },
  ],
  Hyderabad: [
    { city: "Hyderabad", n: 3 },
    { city: "Bangalore", n: 2 },
    { city: "Chennai", n: 2 },
    { city: "Mumbai", n: 2 },
    { city: "Delhi", n: 1 },
  ],
  Chennai: [
    { city: "Chennai", n: 3 },
    { city: "Bangalore", n: 2 },
    { city: "Kochi", n: 2 },
    { city: "Hyderabad", n: 2 },
    { city: "Mumbai", n: 1 },
  ],
  Ahmedabad: [
    { city: "Ahmedabad", n: 3 },
    { city: "Surat", n: 2 },
    { city: "Mumbai", n: 2 },
    { city: "Delhi", n: 2 },
    { city: "Jaipur", n: 1 },
  ],
  Kolkata: [
    { city: "Kolkata", n: 3 },
    { city: "Delhi", n: 2 },
    { city: "Mumbai", n: 2 },
    { city: "Bangalore", n: 2 },
    { city: "Lucknow", n: 1 },
  ],
  Jaipur: [
    { city: "Jaipur", n: 3 },
    { city: "Delhi", n: 2 },
    { city: "Mumbai", n: 2 },
    { city: "Ahmedabad", n: 2 },
    { city: "Chandigarh", n: 1 },
  ],
  Chandigarh: [
    { city: "Chandigarh", n: 3 },
    { city: "Delhi", n: 3 },
    { city: "Mumbai", n: 2 },
    { city: "Jaipur", n: 1 },
    { city: "Lucknow", n: 1 },
  ],
  Lucknow: [
    { city: "Lucknow", n: 2 },
    { city: "Delhi", n: 3 },
    { city: "Mumbai", n: 2 },
    { city: "Kolkata", n: 2 },
    { city: "Jaipur", n: 1 },
  ],
  Kochi: [
    { city: "Kochi", n: 3 },
    { city: "Bangalore", n: 2 },
    { city: "Chennai", n: 2 },
    { city: "Hyderabad", n: 2 },
    { city: "Mumbai", n: 1 },
  ],
  Indore: [
    { city: "Indore", n: 2 },
    { city: "Mumbai", n: 3 },
    { city: "Delhi", n: 2 },
    { city: "Pune", n: 2 },
    { city: "Ahmedabad", n: 1 },
  ],
  Surat: [
    { city: "Surat", n: 2 },
    { city: "Ahmedabad", n: 3 },
    { city: "Mumbai", n: 3 },
    { city: "Delhi", n: 1 },
    { city: "Pune", n: 1 },
  ],
  Nagpur: [
    { city: "Nagpur", n: 2 },
    { city: "Pune", n: 3 },
    { city: "Mumbai", n: 2 },
    { city: "Bangalore", n: 2 },
    { city: "Hyderabad", n: 1 },
  ],
};

type PreviewResult = {
  breakdown: Array<{ city: string; n: number; isYou: boolean }>;
  total: number;
  homeCount: number;
};

function generatePreview(city: HomeCity): PreviewResult {
  const weights = CITY_WEIGHTS[city];
  const breakdown = weights.map((w) => ({
    city: w.city,
    n: w.n,
    isYou: w.city === city,
  }));
  const total = breakdown.reduce((acc, b) => acc + b.n, 0);
  const homeCount = breakdown.find((b) => b.isYou)?.n ?? 0;
  return { breakdown, total, homeCount };
}

export function FlightPreview() {
  const [city, setCity] = useState<HomeCity>("Mumbai");
  const [intake, setIntake] = useState<Intake>("September 2026");
  const [destination, setDestination] = useState<string>("IE");
  const [submitted, setSubmitted] = useState(false);
  const [preview, setPreview] = useState<PreviewResult | null>(null);

  const canSubmit = DESTINATIONS.find((d) => d.value === destination)?.available;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setPreview(generatePreview(city));
    setSubmitted(true);
    // Persist so downstream sections (DublinArrival) can personalize.
    // Non-blocking, silently ignore quota errors.
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(
          "nx-flight-plan",
          JSON.stringify({ city, intake, destination, ts: Date.now() }),
        );
      } catch {
        // Safari private mode / storage full - fine.
      }
    }
  };

  const onReset = () => {
    setSubmitted(false);
    setPreview(null);
  };

  return (
    <section className="relative border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-20 sm:py-24 md:py-32">
      <div className="container-narrow">
        <div className="mx-auto max-w-[720px] text-center">
          <SectionLabel className="mx-auto">A peek at your group</SectionLabel>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="mt-5 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(32px, 6vw, 64px)",
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
            }}
          >
            Try the app{" "}
            <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-primary)]">
              before the app.
            </span>
          </motion.h2>
          <p className="mx-auto mt-5 max-w-[480px] text-[15px] leading-[1.6] text-[color:var(--color-fg-muted)] sm:text-[16px]">
            Pick your home city, intake, and destination. We will show you
            what your verified group would look like on launch day.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-[720px] sm:mt-16">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: EASE }}
                onSubmit={onSubmit}
                className="rounded-[16px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 sm:p-7"
              >
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="From" htmlFor="fp-city">
                    <select
                      id="fp-city"
                      value={city}
                      onChange={(e) => setCity(e.target.value as HomeCity)}
                      className="w-full rounded-[10px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] px-3 py-2.5 font-body text-[14px] text-[color:var(--color-fg)] transition-colors hover:border-[color:var(--color-primary)]/50 focus:border-[color:var(--color-primary)] focus:outline-none"
                    >
                      {HOME_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Month" htmlFor="fp-intake">
                    <select
                      id="fp-intake"
                      value={intake}
                      onChange={(e) => setIntake(e.target.value as Intake)}
                      className="w-full rounded-[10px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] px-3 py-2.5 font-body text-[14px] text-[color:var(--color-fg)] transition-colors hover:border-[color:var(--color-primary)]/50 focus:border-[color:var(--color-primary)] focus:outline-none"
                    >
                      {INTAKES.map((i) => (
                        <option key={i} value={i}>
                          {i}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="To" htmlFor="fp-dest">
                    <select
                      id="fp-dest"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full rounded-[10px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] px-3 py-2.5 font-body text-[14px] text-[color:var(--color-fg)] transition-colors hover:border-[color:var(--color-primary)]/50 focus:border-[color:var(--color-primary)] focus:outline-none"
                    >
                      {DESTINATIONS.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                          {d.available ? "" : " · Coming soon"}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div className="mt-5 flex flex-col items-start gap-3 border-t border-[color:var(--color-border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                    {canSubmit
                      ? "Preview is illustrative"
                      : "Pick Ireland to run the preview"}
                  </p>
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="group inline-flex items-center gap-2 rounded-full bg-[color:var(--color-primary)] px-5 py-2.5 font-heading text-[13px] font-semibold text-[color:var(--color-primary-fg)] transition-all duration-200 hover:-translate-y-px hover:bg-[color:var(--color-primary-hover)] disabled:cursor-not-allowed disabled:bg-[color:var(--color-border-strong)] disabled:text-[color:var(--color-fg-subtle)]"
                  >
                    <Plane className="h-3.5 w-3.5" strokeWidth={2} />
                    Show my group
                    <ArrowRight
                      className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                      strokeWidth={2}
                    />
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="overflow-hidden rounded-[16px] border border-[color:var(--color-primary)]/40 bg-[color:var(--color-surface)]"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-primary)_6%,transparent)] px-5 py-4 sm:px-7">
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="relative flex h-2 w-2"
                    >
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--color-primary)] opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[color:var(--color-primary)]" />
                    </span>
                    <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--color-primary)]">
                      Preview · {city} → Ireland · {intake}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onReset}
                    className="font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)] transition-colors hover:text-[color:var(--color-fg)]"
                  >
                    Try another
                  </button>
                </div>

                {/* Hero line */}
                <div className="px-5 pt-6 sm:px-7 sm:pt-8">
                  <p className="font-heading text-[26px] font-semibold text-[color:var(--color-fg)] sm:text-[32px]">
                    {preview?.total} verified students{" "}
                    <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-primary)]">
                      match you.
                    </span>
                  </p>
                  <p className="mt-3 text-[14px] text-[color:var(--color-fg-muted)] sm:text-[15px]">
                    Including{" "}
                    <span className="font-semibold text-[color:var(--color-fg)]">
                      {preview?.homeCount} from {city}
                    </span>{" "}
                    - so you are not landing alone.
                  </p>
                </div>

                {/* Breakdown */}
                <ul className="mt-6 grid grid-cols-1 gap-px bg-[color:var(--color-border)] sm:mt-8 sm:grid-cols-5">
                  {preview?.breakdown.map((row) => (
                    <li
                      key={row.city}
                      className={`flex flex-col items-center gap-1 bg-[color:var(--color-surface)] px-4 py-5 text-center ${
                        row.isYou
                          ? "bg-[color:color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
                          : ""
                      }`}
                    >
                      <span
                        className={`font-heading text-[24px] font-semibold tabular-nums sm:text-[28px] ${
                          row.isYou
                            ? "text-[color:var(--color-primary)]"
                            : "text-[color:var(--color-fg)]"
                        }`}
                      >
                        {row.n}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[color:var(--color-fg-muted)]">
                        {row.city}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Footer */}
                <div className="flex flex-col items-start gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6">
                  <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                    <Users
                      className="h-3.5 w-3.5 text-[color:var(--color-primary)]"
                      strokeWidth={2}
                    />
                    Illustrative · real group forms at verification
                  </p>
                  <a
                    href="#download"
                    className="group inline-flex items-center gap-2 font-heading text-[13px] font-semibold text-[color:var(--color-primary)] transition-colors hover:text-[color:var(--color-primary-hover)]"
                  >
                    Save my spot
                    <ArrowRight
                      className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                      strokeWidth={2}
                    />
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
