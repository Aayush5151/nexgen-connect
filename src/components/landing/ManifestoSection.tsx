"use client";

import { motion } from "framer-motion";
import {
  BadgeCheck,
  Home,
  Mail,
  PlaneLanding,
  Sparkles,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * ManifestoSection. Narrative re-tell of the NexGen promise framed as
 * three familiar moments every Indian student going abroad recognises:
 * admit letter → app → arrival. Replaces the older text-only list with
 * illustrated story beats and a compact "not this / this" chip strip.
 */

type Moment = {
  icon: LucideIcon;
  day: string;
  heading: string;
  body: string;
};

const MOMENTS: Moment[] = [
  {
    icon: Mail,
    day: "Day 0",
    heading: "The admit letter lands.",
    body: "You re-read it three times. Then silence. Nobody you know is going.",
  },
  {
    icon: Sparkles,
    day: "Day −60",
    heading: "You open NexGen.",
    body: "Ten verified students. Your city. Your campus. Your September.",
  },
  {
    icon: PlaneLanding,
    day: "Day 1 · Dublin",
    heading: "You land into a group.",
    body: "Nine faces at orientation are already familiar. You breathe out.",
  },
];

type ChipPair = {
  before: string;
  after: string;
  afterIcon: LucideIcon;
};

const CHIPS: ChipPair[] = [
  { before: "A directory", after: "A verified group", afterIcon: Users },
  { before: "A dating app", after: "A trust layer", afterIcon: BadgeCheck },
  { before: "A networking lounge", after: "A landing pad", afterIcon: Home },
];

export function ManifestoSection() {
  return (
    <section className="relative overflow-hidden border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-20 md:py-28">
      <div className="container-narrow relative">
        <div className="mx-auto max-w-[760px] text-center">
          <SectionLabel>A quiet promise</SectionLabel>
          <h2
            className="mt-4 font-heading font-semibold text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(44px, 7vw, 80px)",
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
            }}
          >
            Familiarity
            <br />
            <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-fg-muted)]">
              before foreignness.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-[520px] text-[16px] leading-[1.55] text-[color:var(--color-fg-muted)]">
            Day one abroad shouldn&rsquo;t be your loneliest.
            We rewrite the first three moments.
          </p>
        </div>

        {/* Three-moment story. Desktop: horizontal timeline with a dashed
            connector. Mobile: stacked cards, connector becomes a spine. */}
        <div className="relative mx-auto mt-12 max-w-[1040px] md:mt-16">
          {/* Desktop connector */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[14%] right-[14%] top-10 hidden h-px md:block"
            style={{
              backgroundImage:
                "linear-gradient(to right, color-mix(in srgb, var(--color-primary) 0%, transparent), color-mix(in srgb, var(--color-primary) 55%, transparent), color-mix(in srgb, var(--color-primary) 0%, transparent))",
            }}
          />

          <ul className="grid gap-8 md:grid-cols-3 md:gap-6">
            {MOMENTS.map((m, i) => {
              const Icon = m.icon;
              return (
                <motion.li
                  key={m.heading}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{
                    delay: 0.08 + i * 0.12,
                    duration: 0.5,
                    ease: [0.2, 0.8, 0.2, 1],
                  }}
                  className="relative flex flex-col items-center text-center"
                >
                  {/* Icon medallion. Sits on the connector line on desktop. */}
                  <span
                    aria-hidden="true"
                    className="relative flex h-16 w-16 items-center justify-center rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface-elevated)]"
                  >
                    <Icon
                      className="relative h-6 w-6 text-[color:var(--color-primary)]"
                      strokeWidth={1.6}
                    />
                  </span>

                  <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-fg-subtle)]">
                    {m.day}
                  </p>
                  <h3 className="mt-2 font-heading text-[22px] font-semibold leading-[1.2] text-[color:var(--color-fg)] md:text-[24px]">
                    {m.heading}
                  </h3>
                  <p className="mt-3 max-w-[280px] text-[14px] leading-[1.6] text-[color:var(--color-fg-muted)]">
                    {m.body}
                  </p>
                </motion.li>
              );
            })}
          </ul>
        </div>

        {/* Compact "not this → this" chip strip. Replaces the old two-column
            strikethrough list. Stays on brand but reads as a quick rhythm. */}
        <div className="mx-auto mt-14 max-w-[880px]">
          <p className="text-center font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-fg-subtle)]">
            What it is &middot; what it is not
          </p>
          <ul className="mt-5 flex flex-col gap-3 md:flex-row md:flex-wrap md:justify-center md:gap-3">
            {CHIPS.map((c, i) => {
              const AIcon = c.afterIcon;
              return (
                <motion.li
                  key={c.after}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ delay: 0.08 * i, duration: 0.35 }}
                  className="flex items-center justify-center gap-3 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-2.5"
                >
                  <span className="font-mono text-[12px] text-[color:var(--color-fg-subtle)] line-through decoration-[color:var(--color-fg-subtle)]/50">
                    {c.before}
                  </span>
                  <span
                    aria-hidden="true"
                    className="h-[1px] w-4 bg-[color:var(--color-border-strong)]"
                  />
                  <span className="flex items-center gap-1.5 font-mono text-[12px] font-semibold uppercase tracking-[0.04em] text-[color:var(--color-primary)]">
                    <AIcon className="h-3.5 w-3.5" strokeWidth={2.2} />
                    {c.after}
                  </span>
                </motion.li>
              );
            })}
          </ul>
        </div>

        {/* Closing line. One thought. No scroll weight. */}
        <p className="mx-auto mt-12 max-w-[520px] text-center font-serif italic text-[24px] leading-[1.3] tracking-[-0.015em] text-[color:var(--color-fg)] md:text-[30px]">
          That&rsquo;s the whole idea.
        </p>
      </div>
    </section>
  );
}
