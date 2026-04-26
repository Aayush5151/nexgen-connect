"use client";

import { motion } from "framer-motion";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * SafetyParents. The verification stack in one number.
 *
 * v15 redesign: previous version had six pillar cards in a 2-or-3-col
 * grid that grew taller than a phone viewport on Pune-Internet-grade
 * Android handsets. Replaced with the v10 §3.1 promise distilled to
 * one number — 3× — and the three exact gates underneath. The
 * skeptical-parent reader gets the receipt in two seconds: three
 * separate verifications per person, none of them a tick-box.
 *
 * Three supplementary safety facts (women-only mode, named T&S
 * advisor, no dating patterns) hang at the foot in a single row,
 * carrying the v10 §9 commitments without expanding into a
 * brochure-grid.
 *
 * Designed to fit in 100dvh on any device. Big number caps at 380px
 * for 4K TVs; floors at 140px on a 375x812 phone.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

const CHECKS = [
  {
    n: "1",
    title: "Phone OTP",
    body: "Six-digit code via MSG91. Number hashed on arrival.",
  },
  {
    n: "2",
    title: "DigiLocker Aadhaar",
    body: "Government consent flow. We receive a token, never the number.",
  },
  {
    n: "3",
    title: "Admit letter",
    body: "Human-reviewed within 48 hours. No bots, no auto-approve.",
  },
] as const;

const ALSO = [
  "Women-only matching, opt-in",
  "Named Trust & Safety advisor on every report",
  "No swipe, no photo-first, no infinite scroll",
] as const;

export function SafetyParents() {
  return (
    <section className="relative flex min-h-[100dvh] items-center overflow-hidden border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-12 sm:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(50% 35% at 50% 0%, color-mix(in srgb, var(--color-primary) 12%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="container-narrow relative w-full">
        <div className="mx-auto flex max-w-[1080px] flex-col items-center text-center">
          <SectionLabel className="mx-auto">For parents</SectionLabel>

          {/* The mega number — three checks, every member, every
              corridor. */}
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
                fontSize: "clamp(140px, 22vw, 380px)",
                lineHeight: 0.85,
                letterSpacing: "-0.05em",
              }}
            >
              3×
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.12 }}
            className="mt-6 max-w-[820px] font-heading font-semibold text-balance text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(20px, 3.4vw, 36px)",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            Independent verification checks{" "}
            <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-primary)]">
              per person.
            </span>
          </motion.h2>

          {/* Three checks in one row — not cards, not boxes, just a
              row of numbered facts. Reads as a list of safeguards,
              not as a marketing grid. */}
          <motion.ol
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.2 }}
            className="mt-8 grid w-full max-w-[920px] grid-cols-1 gap-5 border-y border-[color:var(--color-border)] py-6 sm:grid-cols-3 sm:gap-8 sm:py-8"
          >
            {CHECKS.map((c) => (
              <li
                key={c.n}
                className="flex flex-col items-center text-center sm:items-start sm:text-left"
              >
                <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-primary)]">
                  Check {c.n}
                </span>
                <h3
                  className="mt-1 font-heading font-semibold text-[color:var(--color-fg)]"
                  style={{
                    fontSize: "clamp(17px, 2.4vw, 22px)",
                    lineHeight: 1.2,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {c.title}
                </h3>
                <p className="mt-2 max-w-[260px] text-[13px] leading-[1.5] text-[color:var(--color-fg-muted)] sm:text-[14px]">
                  {c.body}
                </p>
              </li>
            ))}
          </motion.ol>

          {/* And-also row — three short safety commitments without
              a card grid. Single line of separators. */}
          <motion.ul
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.32 }}
            className="mt-6 flex flex-col items-center gap-2 sm:mt-8 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-5 sm:gap-y-2"
          >
            {ALSO.map((line, i) => (
              <li
                key={line}
                className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-[color:var(--color-fg-muted)] sm:text-[11px]"
              >
                {i > 0 && (
                  <span
                    aria-hidden="true"
                    className="hidden h-1 w-1 rounded-full bg-[color:var(--color-primary)] sm:inline-flex"
                  />
                )}
                <span>{line}</span>
              </li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
