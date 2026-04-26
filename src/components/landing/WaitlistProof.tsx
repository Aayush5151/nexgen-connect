"use client";

import { motion } from "framer-motion";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * WaitlistProof — the magnitude section. Why now, in one number.
 *
 * v15 redesign: previous version was a four-line thesis paragraph
 * that read as a corridor explainer. Replaced with the single number
 * that explains why this product exists at all — 68,593 Indian
 * students arrived in Ireland and Germany combined in 2024/25, the
 * largest cohort either country has ever absorbed. The body line
 * gives the official-source split (HEA + Destatis) and the trend
 * (#1 in both, +30% / +20% YoY).
 *
 * Designed to fit in one viewport on every device. Big number caps
 * at ~360px on a 4K display and floors at ~96px on a 375x812 phone
 * because the digit count is six (vs. the two-digit "60" in
 * TrustPillars), so it has to be smaller to fit.
 *
 * v10 §1.2 alignment:
 *   - Ireland 2024/25:    9,174 Indian students   (HEA, +30% YoY)
 *   - Germany 2024/25:   59,419 Indian students   (DAAD/DZHW, +20% YoY)
 *   - Combined Y1 cohort:        68,593
 * Indians are the #1 source country in both markets.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

const SPLIT = [
  { country: "Ireland", value: "9,174", yoy: "+30% YoY", source: "HEA" },
  { country: "Germany", value: "59,419", yoy: "+20% YoY", source: "DAAD" },
] as const;

export function WaitlistProof() {
  return (
    <section
      aria-label="Why now"
      className="relative flex min-h-[100dvh] items-center overflow-hidden border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-10 sm:py-12 md:py-16"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(50% 45% at 50% 50%, color-mix(in srgb, var(--color-primary) 11%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="container-narrow relative w-full">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center text-center">
          <SectionLabel className="mx-auto">Why now</SectionLabel>

          {/* The headline number. Six digits + comma, so type caps
              smaller than the two-digit mega numbers elsewhere on the
              site — but still enormous next to body copy. */}
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="mt-6 flex flex-col items-center"
          >
            <span
              aria-hidden="true"
              className="font-heading font-semibold tabular-nums text-[color:var(--color-primary)]"
              style={{
                fontSize: "clamp(72px, 13vw, 220px)",
                lineHeight: 0.9,
                letterSpacing: "-0.04em",
              }}
            >
              68,593
            </span>
            <span className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--color-fg-subtle)] sm:text-[11px]">
              2024/25 academic year
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.12 }}
            className="mt-6 max-w-[860px] font-heading font-semibold text-balance text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(20px, 3.4vw, 36px)",
              lineHeight: 1.18,
              letterSpacing: "-0.02em",
            }}
          >
            Indian students arrived in Ireland and Germany.{" "}
            <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-primary)]">
              The largest cohort ever.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.2 }}
            className="mt-4 max-w-[560px] text-[14px] leading-[1.55] text-[color:var(--color-fg-muted)] sm:text-[15.5px]"
          >
            Indians are now the{" "}
            <span className="text-[color:var(--color-fg)]">
              #1 source country
            </span>{" "}
            in both markets — and the curve is still bending up.
          </motion.p>

          {/* Two-up split below the headline. Each side names the
              country, the count, the YoY growth, and the source —
              receipts at glance. Borders only on the inner edge so
              the two sides read as one composition. */}
          <motion.ul
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.3 }}
            className="mt-10 grid w-full max-w-[820px] grid-cols-2 gap-4 border-t border-[color:var(--color-border)] pt-8 sm:gap-10 sm:pt-10"
          >
            {SPLIT.map((s) => (
              <li
                key={s.country}
                className="flex flex-col items-center text-center"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--color-fg-subtle)] sm:text-[11px]">
                  {s.country}
                </span>
                <span
                  className="mt-2 font-heading font-semibold tabular-nums text-[color:var(--color-fg)]"
                  style={{
                    fontSize: "clamp(36px, 6vw, 72px)",
                    lineHeight: 0.95,
                    letterSpacing: "-0.04em",
                  }}
                >
                  {s.value}
                </span>
                <span className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--color-primary)]">
                  {s.yoy}
                </span>
                <span className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
                  Source · {s.source}
                </span>
              </li>
            ))}
          </motion.ul>

          {/* Bottom kicker — the launch beachheads. Single line,
              tight, mono — plays as a footer to the magnitude
              composition. */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.42 }}
            className="mt-8 flex items-center gap-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--color-fg-muted)] sm:text-[11.5px]"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span
                aria-hidden="true"
                className="absolute inset-0 animate-ping rounded-full bg-[color:var(--color-primary)] opacity-70"
              />
              <span className="relative h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)]" />
            </span>
            Launching India → Ireland · Sept 2026
            <span aria-hidden="true" className="text-[color:var(--color-fg-subtle)]">
              ·
            </span>
            India → Germany · Oct 2026
          </motion.p>
        </div>
      </div>
    </section>
  );
}
