"use client";

import { motion } from "framer-motion";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * RoadmapSection. Abstract, horizon-feeling roadmap. Three phases on a
 * single timeline. Only Phase 01 names a country (Ireland, Sept 2026) -
 * subsequent phases are deliberately unnamed so the product doesn't
 * over-promise destinations it hasn't committed to yet.
 *
 * Layout:
 *   - Desktop: three columns sharing a single horizontal rule.
 *   - Mobile: three stacked rows sharing a left vertical rule.
 *   - Phase 01 is the "live now" card (ping dot). 02 is "next". 03 is
 *     the aspirational close.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

type Phase = {
  index: string;
  status: "live" | "next" | "horizon";
  statusLabel: string;
  title: string;
  titleAccent?: string;
  body: string;
  eyebrow: string;
};

const PHASES: Phase[] = [
  {
    index: "01",
    status: "live",
    statusLabel: "Shipping first",
    eyebrow: "Sept 2026",
    title: "Ireland.",
    body: "We start with one corridor, because one corridor done right is the only thing that matters. Dublin, Cork, Galway, Limerick.",
  },
  {
    index: "02",
    status: "next",
    statusLabel: "In build",
    eyebrow: "The next corridor",
    title: "A second country.",
    body: "Announced when the first one works. We won't name a country until every student flying there has a real group waiting on the other side.",
  },
  {
    index: "03",
    status: "horizon",
    statusLabel: "The horizon",
    eyebrow: "Every corridor",
    title: "Everywhere students go.",
    titleAccent: "Everywhere students go.",
    body: "The end state is simple. Every student leaving home, to any country, any intake, opens this app and finds their ten.",
  },
];

export function RoadmapSection() {
  return (
    <section className="relative border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-28 md:py-40">
      <div className="container-narrow">
        {/* Heading block */}
        <div className="mx-auto max-w-[760px]">
          <SectionLabel>The roadmap</SectionLabel>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mt-4 font-heading font-semibold text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(32px, 4.5vw, 52px)",
              lineHeight: 1.15,
              letterSpacing: "-0.025em",
            }}
          >
            One corridor first.{" "}
            <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-fg-muted)]">
              Then every corridor.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.08 }}
            className="mt-6 max-w-[560px] text-[16px] leading-[1.6] text-[color:var(--color-fg-muted)] md:text-[17px]"
          >
            A roadmap, not a list. We build country-by-country, because a
            group of verified students who don&apos;t actually know each other
            by landing day is worse than no group at all.
          </motion.p>
        </div>

        {/* Timeline */}
        <div className="relative mt-20 md:mt-24">
          {/* Desktop horizontal rule */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-[22px] left-0 right-0 hidden h-px bg-gradient-to-r from-transparent via-[color:var(--color-border)] to-transparent md:block"
          />

          <ol className="relative grid gap-12 md:grid-cols-3 md:gap-8 lg:gap-12">
            {PHASES.map((phase, i) => (
              <PhaseCard key={phase.index} phase={phase} index={i} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function PhaseCard({ phase, index }: { phase: Phase; index: number }) {
  const statusStyle = {
    live: {
      dot: "bg-[color:var(--color-primary)]",
      ring: "border-[color:var(--color-primary)]/40 bg-[color:color-mix(in_srgb,var(--color-primary)_8%,transparent)]",
      label: "text-[color:var(--color-primary)]",
    },
    next: {
      dot: "bg-[color:var(--color-fg-muted)]",
      ring: "border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)]",
      label: "text-[color:var(--color-fg-muted)]",
    },
    horizon: {
      dot: "bg-[color:var(--color-fg-subtle)]",
      ring: "border-[color:var(--color-border)] bg-transparent",
      label: "text-[color:var(--color-fg-subtle)]",
    },
  }[phase.status];

  return (
    <motion.li
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, ease: EASE, delay: index * 0.08 }}
      className="relative"
    >
      {/* Node - sits on the horizontal rule on desktop */}
      <div className="flex items-center gap-3">
        <span
          className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${statusStyle.ring}`}
        >
          {phase.status === "live" && (
            <span
              aria-hidden="true"
              className={`absolute inset-0 animate-ping rounded-full ${statusStyle.dot} opacity-30`}
            />
          )}
          <span className={`relative h-2 w-2 rounded-full ${statusStyle.dot}`} />
        </span>
        <span
          className={`font-mono text-[10px] font-semibold uppercase tracking-[0.12em] ${statusStyle.label}`}
        >
          {phase.statusLabel}
        </span>
      </div>

      {/* Content */}
      <div className="mt-7 md:mt-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
          {phase.index} · {phase.eyebrow}
        </p>
        <h3
          className={`mt-3 font-heading font-semibold ${
            phase.status === "horizon"
              ? "font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-fg)]"
              : "text-[color:var(--color-fg)]"
          }`}
          style={{
            fontSize: "clamp(24px, 2.6vw, 30px)",
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
          }}
        >
          {phase.title}
        </h3>
        <p className="mt-3 max-w-[34ch] text-[14.5px] leading-[1.55] text-[color:var(--color-fg-muted)]">
          {phase.body}
        </p>
      </div>
    </motion.li>
  );
}
