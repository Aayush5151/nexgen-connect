"use client";

import { motion } from "framer-motion";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * TrustPillars. Four receipts placed after WaitlistProof and before
 * ProblemMoments. The job is concrete: convert the "waitlist open"
 * nudge into four locked-in design facts before the reader hits the
 * pain section. Four facts, four big mono numbers, one line each.
 *
 * Why four, why these four (v10-aligned):
 *   - GROUP UNLOCKS 60 names the corridor threshold from v10 §1.1 —
 *     DMs only open when 60 verified students share a corridor. This
 *     is the canonical anti-WhatsApp-group fact: not a vibes claim,
 *     a hard product rule.
 *   - VERIFICATION 03x names the three gates (Phone OTP, DigiLocker,
 *     admit letter) so verification stops being a word and becomes a
 *     checklist. Matches SafetyParents pillar 01 but earlier in the
 *     read.
 *   - NO AGENTS 00 kills the "is this another broker funnel" objection
 *     before it forms. The zero is deliberate - a number you cannot
 *     misread.
 *   - STUDENT BILL Rs 0 captures v10 §3.1 promise #3: revenue comes
 *     from PBSA operators (referral fees) and an optional Premium —
 *     never from students. No ads. No data sale.
 *
 * Design grammar matches SafetyParents (receipt cards, primary edge
 * stripe, "Locked in, day one" stamp) so the page reads as one
 * coherent rule-set. The difference is scale: SafetyParents is six
 * pillars of body copy; TrustPillars is four pillars of numbers. The
 * reader hits TrustPillars in four seconds, SafetyParents in thirty.
 *
 * Intentionally does not mention cities per product direction - only
 * corridor-level facts. No uni names, no city names.
 */

type Pillar = {
  index: string;
  label: string;
  metric: string;
  detail: string;
};

const PILLARS: Pillar[] = [
  {
    index: "01",
    label: "Group unlocks",
    metric: "60",
    detail: "DMs open when 60 verified students share your home city, destination, and month.",
  },
  {
    index: "02",
    label: "Verification",
    metric: "03\u00d7",
    detail: "Phone OTP. DigiLocker. Admit letter. Every member, no exception.",
  },
  {
    index: "03",
    label: "Agents inside",
    metric: "00",
    detail: "No recruiters. No brokers. Nobody selling you a flat.",
  },
  {
    index: "04",
    label: "Student bill",
    metric: "\u20b90",
    detail: "Free core, forever. Optional \u20b91,499 unlock. No ads. No data sale.",
  },
];

const EASE = [0.2, 0.8, 0.2, 1] as const;

export function TrustPillars() {
  return (
    <section className="relative border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-10 sm:py-12 md:py-16">
      <div className="container-narrow">
        <div className="mx-auto max-w-[720px] text-center">
          <SectionLabel className="mx-auto">Four receipts</SectionLabel>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="mt-3 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(24px, 5vw, 48px)",
              lineHeight: 1.04,
              letterSpacing: "-0.03em",
            }}
          >
            Four numbers{" "}
            <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-fg-muted)]">
              that keep us honest.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.08 }}
            className="mx-auto mt-3 max-w-[520px] text-[14px] leading-[1.55] text-[color:var(--color-fg-muted)] sm:text-[15px]"
          >
            No vanity stats. Four design decisions we have locked in,
            printed at receipt size.
          </motion.p>
        </div>

        {/* Four receipt cards. 2 cols on sm, 4 cols on md so the grid
            reads as a single tight row of numbers on a laptop. */}
        <ul className="mx-auto mt-8 grid max-w-[1040px] grid-cols-2 gap-3 sm:mt-10 sm:gap-3.5 md:grid-cols-4 md:gap-4">
          {PILLARS.map((p, i) => (
            <motion.li
              key={p.label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.05 * i }}
              className="group relative flex flex-col overflow-hidden rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 transition-colors hover:border-[color:var(--color-primary)]/45 sm:p-5"
            >
              {/* Primary edge stripe mirrors SafetyParents so the two
                  sections read as one rule-set, not two unrelated
                  grids. */}
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 h-full w-[3px] bg-[color:var(--color-primary)] opacity-70 transition-opacity group-hover:opacity-100"
              />

              {/* Header row: mono index on the left, label on the right */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-primary)]">
                  {p.index}
                </span>
                <span className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-fg-subtle)]">
                  {p.label}
                </span>
              </div>

              {/* The metric. Serif so it doesn't feel like a dashboard
                  stat - it feels like a printed number on a ticket. */}
              <p
                className="mt-5 font-serif font-normal tracking-[-0.02em] text-[color:var(--color-fg)] sm:mt-6"
                style={{
                  fontSize: "clamp(38px, 6.5vw, 60px)",
                  lineHeight: 0.95,
                }}
              >
                {p.metric}
              </p>

              <p className="mt-3 flex-1 text-[13px] leading-[1.5] text-[color:var(--color-fg-muted)] sm:mt-4">
                {p.detail}
              </p>

              {/* Locked-in stamp. Rhymes with SafetyParents' "Built in,
                  day one" so readers who scan both sections feel one
                  consistent voice. */}
              <div className="mt-4 flex items-center gap-1.5 border-t border-[color:var(--color-border)] pt-3">
                <span
                  aria-hidden="true"
                  className="flex h-3 w-3 items-center justify-center rounded-full bg-[color:var(--color-primary)]"
                >
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 6l3 3 5-6"
                      stroke="var(--color-primary-fg)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-[color:var(--color-fg-subtle)]">
                  Locked in, day one
                </span>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
