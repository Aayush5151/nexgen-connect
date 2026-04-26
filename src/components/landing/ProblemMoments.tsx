"use client";

import { motion } from "framer-motion";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * ProblemMoments. The Sunday-night pain of going alone, told as four
 * narrative beats instead of a list of one-liners.
 *
 * v13 pass - rewritten from five dry lines into four richer beats, each
 * with a serif-italic headline and a concrete detail line underneath.
 * The numbered motif ("Beat 01" ... "Beat 04") mirrors SafetyParents'
 * receipt grammar so the page reads as one ruleset rather than six
 * different ornaments. Rationale:
 *
 *   - The previous one-liners asked the reader to fill in the texture
 *     themselves. A skeptical Indian parent or an 18-year-old student
 *     looking at the site in October does not fill in texture - they
 *     scan, and a scan of five similar-length sentences reads as
 *     generic. Adding a specific second line (the "October", the
 *     "twelve times before it loads", the "half of them selling")
 *     forces the reader to see themselves in the beat.
 *   - Keeping the serif-italic headline treatment on the beat itself
 *     (rather than the detail line) preserves the rhythm of the rest
 *     of the page - every emotional moment lands in serif, every
 *     supporting fact in sans.
 *   - The existing closer ("So we built the group chat that actually
 *     works.") is kept verbatim - it is the single best line on the
 *     page and the pivot from problem into product.
 */

type Beat = {
  index: string;
  headline: string;
  detail: string;
};

const BEATS: Beat[] = [
  {
    index: "01",
    headline: "The admit letter lands.",
    detail:
      "October. You refresh the portal twelve times before it loads.",
  },
  {
    index: "02",
    headline: "You find the WhatsApp group.",
    detail:
      "Five hundred people. Half of them selling. None of them yours.",
  },
  {
    index: "03",
    headline: "Nobody from your city.",
    detail:
      "Nobody you can place. Nobody your parents can verify.",
  },
  {
    index: "04",
    headline: "You close the tab.",
    detail:
      "The countdown to a new continent begins. Alone.",
  },
];

const EASE = [0.2, 0.8, 0.2, 1] as const;

export function ProblemMoments() {
  return (
    <section className="relative flex min-h-[100dvh] items-center border-y border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-10 sm:py-12 md:py-16">
      <div className="container-narrow">
        <div className="mx-auto max-w-[840px]">
          <SectionLabel>The problem</SectionLabel>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mt-3 font-heading font-semibold text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(26px, 5vw, 48px)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            You got in. Now the{" "}
            <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-fg-muted)]">
              real
            </span>{" "}
            wait starts.
          </motion.h2>

          {/* Four beats. Each beat is a three-row stack:
                row 1 - tiny mono index ("Beat 01") in primary
                row 2 - serif italic headline (the emotional line)
                row 3 - sans muted detail (the concrete line)
              Separated by thin top borders so the set reads as a
              structured ruleset, not a paragraph list. */}
          <ol className="mt-8 flex flex-col sm:mt-10 md:mt-12">
            {BEATS.map((beat, i) => (
              <motion.li
                key={beat.index}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{
                  duration: 0.6,
                  ease: EASE,
                  delay: i * 0.06,
                }}
                className="relative border-t border-[color:var(--color-border)] py-6 sm:py-7 md:py-8"
              >
                <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-primary)]">
                  Beat {beat.index}
                </p>
                <p
                  className="mt-2 font-serif italic text-[color:var(--color-fg)] sm:mt-3"
                  style={{
                    fontSize: "clamp(24px, 4.4vw, 40px)",
                    lineHeight: 1.1,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {beat.headline}
                </p>
                <p
                  className="mt-2 max-w-[620px] text-[14.5px] leading-[1.55] text-[color:var(--color-fg-muted)] sm:mt-3 sm:text-[16px]"
                >
                  {beat.detail}
                </p>
              </motion.li>
            ))}
          </ol>

          {/* Turn. One italic line that re-frames everything. Kept
              verbatim from the previous version because it is the
              single best line on the page - the pivot from the problem
              into the product. */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{
              duration: 0.7,
              ease: EASE,
              delay: BEATS.length * 0.06 + 0.15,
            }}
            className="mt-8 border-t border-[color:var(--color-border)] pt-8 font-serif italic text-[color:var(--color-fg)] sm:mt-10 md:mt-12"
            style={{
              fontSize: "clamp(22px, 4.4vw, 40px)",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            So we built the group chat{" "}
            <span className="text-[color:var(--color-primary)]">
              that actually works.
            </span>
          </motion.p>
        </div>
      </div>
    </section>
  );
}
