"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * UniversitySelector. Three tabs - UCD, Trinity, UCC - each revealing a
 * campus-specific card: intake size, what Indian students typically study,
 * and one characteristic note. Gives the reader a reason to pick a lane
 * before the Ireland map loads, turning a passive "oh cool" into an
 * active "that&rsquo;s my campus".
 *
 * Deliberately not wired to real data - this is pre-launch positioning.
 * Mirrors the PIN metadata in IrelandMap.tsx so the story stays consistent.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

type Campus = "UCD" | "Trinity" | "UCC";

type CampusInfo = {
  key: Campus;
  fullName: string;
  city: "Dublin" | "Cork";
  intake: string;
  headline: string;
  courses: string[];
  tone: string;
};

const CAMPUSES: CampusInfo[] = [
  {
    key: "UCD",
    fullName: "University College Dublin",
    city: "Dublin",
    intake: "~1,800/year",
    headline: "The broadest Indian student mix in Ireland.",
    courses: ["Data Science", "Finance", "Supply Chain", "AI"],
    tone: "Largest Indian cohort. Biggest group of Mumbai, Bangalore and Pune origins.",
  },
  {
    key: "Trinity",
    fullName: "Trinity College Dublin",
    city: "Dublin",
    intake: "~1,000/year",
    headline: "Strongest Delhi and Bangalore pipeline.",
    courses: ["Business", "Computer Science", "MSc Management", "Biotech"],
    tone: "Older, quieter campus. Competitive programs. Tight alumni loop.",
  },
  {
    key: "UCC",
    fullName: "University College Cork",
    city: "Cork",
    intake: "~500/year",
    headline: "Fastest-growing CS and biotech intake.",
    courses: ["Computer Science", "Biotech", "Pharma", "Food Science"],
    tone: "Smaller city. Stronger apartment market. Cohesive group feel.",
  },
];

export function UniversitySelector() {
  const [active, setActive] = useState<Campus>("UCD");
  const info = CAMPUSES.find((c) => c.key === active)!;

  return (
    <section className="relative overflow-hidden border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-16 sm:py-20 md:py-24">
      <div className="container-narrow">
        <div className="mx-auto max-w-[680px] text-center">
          <SectionLabel className="mx-auto">Pick your corridor</SectionLabel>
          <h2
            className="mt-4 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(26px, 5.5vw, 56px)",
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
            }}
          >
            Three campuses.{" "}
            <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-fg-muted)]">
              Three groups.
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-[440px] text-[14px] leading-[1.55] text-[color:var(--color-fg-muted)] sm:text-[15px]">
            Tap one to see what your cohort actually looks like.
          </p>
        </div>

        {/* Tab row */}
        <div
          role="tablist"
          aria-label="Pick a campus"
          className="mx-auto mt-10 flex max-w-[520px] items-center justify-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-1.5 sm:mt-12"
        >
          {CAMPUSES.map((c) => {
            const isActive = active === c.key;
            return (
              <button
                key={c.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(c.key)}
                className={`relative flex-1 rounded-full px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors sm:text-[12px] ${
                  isActive
                    ? "text-[color:var(--color-primary-fg)]"
                    : "text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="campus-pill"
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full bg-[color:var(--color-primary)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
                  />
                )}
                <span className="relative z-10">{c.key}</span>
              </button>
            );
          })}
        </div>

        {/* Reveal card */}
        <div className="mx-auto mt-6 max-w-[720px] sm:mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="rounded-[16px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)] sm:text-[11px]">
                    {info.city} · Sept 2026
                  </p>
                  <h3 className="mt-2 font-heading text-[20px] font-semibold text-[color:var(--color-fg)] sm:text-[24px]">
                    {info.fullName}
                  </h3>
                </div>
                <span className="shrink-0 rounded-full border border-[color:var(--color-primary)]/30 bg-[color:color-mix(in_srgb,var(--color-primary)_8%,transparent)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[color:var(--color-primary)] sm:text-[11px]">
                  {info.intake}
                </span>
              </div>

              <p className="mt-5 text-[15px] leading-[1.55] text-[color:var(--color-fg)] sm:text-[16px]">
                {info.headline}
              </p>
              <p className="mt-2 text-[13.5px] leading-[1.55] text-[color:var(--color-fg-muted)] sm:text-[14px]">
                {info.tone}
              </p>

              <div className="mt-6 border-t border-[color:var(--color-border)] pt-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)] sm:text-[11px]">
                  Top courses for Indian students
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {info.courses.map((c) => (
                    <li
                      key={c}
                      className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-3 py-1 font-mono text-[11px] text-[color:var(--color-fg-muted)]"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
