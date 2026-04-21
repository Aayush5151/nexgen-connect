"use client";

import { motion } from "framer-motion";
import {
  BadgeCheck,
  Clock3,
  MapPin,
  Plane,
  Shield,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * BentoClose. Asymmetric recap grid right before the final download CTA.
 * Six tiles - one hero tile + five supporting - pulling together the
 * strongest facts of the page into a single pre-footer summary. No new
 * information here; the job is to remind the reader of what they just
 * scrolled past, so the download tap feels earned.
 *
 * Inspired by Linear / Arc / Vercel bento sections. Every tile has the
 * same visual grammar: muted border, subtle surface, one accent beat.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

type Tile = {
  icon: LucideIcon;
  label: string;
  value: string;
  body: string;
  hero?: boolean;
  accent?: boolean;
};

const TILES: Tile[] = [
  {
    icon: Users,
    label: "Group size",
    value: "10",
    body: "Per corridor, per month. Not a directory, not a forum.",
    hero: true,
  },
  {
    icon: Shield,
    label: "Verification",
    value: "100%",
    body: "DigiLocker-checked. Aadhaar, PAN, DL, Passport.",
  },
  {
    icon: MapPin,
    label: "First corridor",
    value: "Ireland",
    body: "UCD · Trinity · UCC. Sept 2026.",
    accent: true,
  },
  {
    icon: Clock3,
    label: "Match time",
    value: "90s",
    body: "From sign-up to your verified group preview.",
  },
  {
    icon: BadgeCheck,
    label: "Agents",
    value: "0",
    body: "Students only. No immigration resellers, ever.",
  },
  {
    icon: Plane,
    label: "Day 1",
    value: "Nine waves at Gate 42",
    body: "You land into a group. Not a WhatsApp shout.",
  },
];

export function BentoClose() {
  return (
    <section className="relative overflow-hidden border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-16 sm:py-20 md:py-28">
      <div className="container-narrow">
        <div className="mx-auto max-w-[680px] text-center">
          <SectionLabel className="mx-auto">The whole idea, one screen</SectionLabel>
          <h2
            className="mt-4 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(26px, 5.5vw, 56px)",
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
            }}
          >
            What you get,{" "}
            <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-fg-muted)]">
              at a glance.
            </span>
          </h2>
        </div>

        {/* 4-col bento grid. Hero tile spans 2x2 on desktop. */}
        <div className="mx-auto mt-10 grid max-w-[1080px] grid-cols-2 gap-3 sm:mt-12 sm:gap-4 md:grid-cols-4">
          {TILES.map((t, i) => {
            const Icon = t.icon;
            return (
              <motion.article
                key={t.label}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.05 * i }}
                className={`relative overflow-hidden rounded-[14px] border bg-[color:var(--color-surface)] p-5 sm:p-6 ${
                  t.hero ? "col-span-2 md:col-span-2 md:row-span-2" : ""
                } ${
                  t.accent
                    ? "border-[color:var(--color-primary)]/35 bg-[color:color-mix(in_srgb,var(--color-primary)_5%,var(--color-surface))]"
                    : "border-[color:var(--color-border)]"
                }`}
              >
                {/* Hero tile gets a faint primary bloom */}
                {t.hero && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(55% 70% at 85% 15%, color-mix(in srgb, var(--color-primary) 12%, transparent) 0%, transparent 70%)",
                    }}
                  />
                )}

                <div className="relative flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--color-primary)]/30 bg-[color:color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
                  >
                    <Icon
                      className="h-4 w-4 text-[color:var(--color-primary)]"
                      strokeWidth={1.8}
                    />
                  </span>
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)] sm:text-[11px]">
                    {t.label}
                  </p>
                </div>

                <p
                  className={`relative mt-4 font-heading font-semibold text-[color:var(--color-fg)] ${
                    t.hero
                      ? "text-[56px] leading-none sm:text-[88px] md:text-[120px]"
                      : "text-[28px] leading-none sm:text-[34px]"
                  }`}
                  style={{ letterSpacing: "-0.03em" }}
                >
                  {t.value}
                </p>

                <p
                  className={`relative mt-3 text-[color:var(--color-fg-muted)] ${
                    t.hero
                      ? "max-w-[340px] text-[15px] leading-[1.5] sm:text-[16px] md:text-[18px]"
                      : "text-[12.5px] leading-[1.5] sm:text-[13.5px]"
                  }`}
                >
                  {t.body}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
