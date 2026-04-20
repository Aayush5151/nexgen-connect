"use client";

import { motion } from "framer-motion";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * ProblemMoments. Sparse, line-by-line reveal of the pain. No icons,
 * no cards, just typography — the goal is for the reader to slow down
 * and feel the story. Built on framer-motion whileInView so each line
 * fades in as the section scrolls through the viewport.
 */

const LINES = [
  "The admit letter arrives.",
  "You find the WhatsApp group.",
  "488 members. 52 from Gujarat.",
  "Zero of them from your city.",
  "You scroll for two hours. You close the tab.",
] as const;

const EASE = [0.2, 0.8, 0.2, 1] as const;

export function ProblemMoments() {
  return (
    <section className="relative border-y border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-28 md:py-40">
      <div className="container-narrow">
        <div className="mx-auto max-w-[840px]">
          <SectionLabel>The problem</SectionLabel>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mt-4 font-heading font-semibold text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(32px, 4.5vw, 52px)",
              lineHeight: 1.15,
              letterSpacing: "-0.025em",
            }}
          >
            Every student moving abroad has{" "}
            <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-fg-muted)]">
              the same Sunday night.
            </span>
          </motion.h2>

          <ul className="mt-16 space-y-6 md:mt-20 md:space-y-7">
            {LINES.map((line, i) => (
              <motion.li
                key={line}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{
                  duration: 0.6,
                  ease: EASE,
                  delay: i * 0.05,
                }}
                className="font-heading font-medium text-[color:var(--color-fg-muted)]"
                style={{
                  fontSize: "clamp(22px, 3vw, 36px)",
                  lineHeight: 1.3,
                  letterSpacing: "-0.015em",
                }}
              >
                {line}
              </motion.li>
            ))}
          </ul>

          {/* Turn. One italic line that re-frames everything. */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{
              duration: 0.7,
              ease: EASE,
              delay: LINES.length * 0.05 + 0.15,
            }}
            className="mt-14 font-serif italic text-[color:var(--color-fg)] md:mt-16"
            style={{
              fontSize: "clamp(28px, 4vw, 48px)",
              lineHeight: 1.25,
              letterSpacing: "-0.015em",
            }}
          >
            So we built an app{" "}
            <span className="text-[color:var(--color-primary)]">
              for the other thing.
            </span>
          </motion.p>
        </div>
      </div>
    </section>
  );
}
