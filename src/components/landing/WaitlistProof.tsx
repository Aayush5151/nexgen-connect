"use client";

import { motion } from "framer-motion";

/**
 * WaitlistProof — "Why does this exist now?"
 *
 * v17: each section answers a question the reader is silently
 * asking. This one answers "Why does this product matter — why
 * now?" The answer: there's never been more of us moving abroad,
 * and the old WhatsApp-and-agents path has run out of road.
 *
 * Layout: clean centred composition. Headline (the answer in one
 * sentence) + body (what it means) + number (the evidence) +
 * source attribution (the receipt). No card chrome, no decoration.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

export function WaitlistProof() {
  return (
    <section
      aria-label="Why now"
      className="relative flex min-h-[100dvh] items-center bg-[color:var(--color-bg)] py-20 sm:py-24"
    >
      <div className="container-narrow w-full">
        <div className="mx-auto flex max-w-[920px] flex-col items-center text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-fg-subtle)]"
          >
            Why now
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
            className="mt-6 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(36px, 5.5vw, 64px)",
              lineHeight: 1.05,
              letterSpacing: "-0.025em",
            }}
          >
            More Indian students are moving abroad than{" "}
            <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-primary)]">
              ever before.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.2 }}
            className="mt-6 max-w-[640px] text-balance text-[color:var(--color-fg-muted)]"
            style={{
              fontSize: "clamp(16px, 1.6vw, 19px)",
              lineHeight: 1.55,
            }}
          >
            Ireland and Germany alone absorbed the largest Indian
            student cohort either country has ever seen last year. The
            old WhatsApp-and-agent path doesn&rsquo;t scale — and never
            served the people who used it well.
          </motion.p>

          {/* Evidence row — number flanked by country breakdown.
              Three columns on desktop, stacked on mobile. The big
              number is the centerpiece; the country splits provide
              the receipt. */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.32 }}
            className="mt-12 grid w-full max-w-[860px] grid-cols-1 items-end gap-6 sm:mt-16 sm:grid-cols-3 sm:gap-10"
          >
            <div className="flex flex-col items-center sm:items-end sm:text-right">
              <span
                className="font-heading font-semibold tabular-nums text-[color:var(--color-fg)]"
                style={{
                  fontSize: "clamp(36px, 4.5vw, 56px)",
                  lineHeight: 0.95,
                  letterSpacing: "-0.03em",
                }}
              >
                9,174
              </span>
              <span className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--color-primary)]">
                Ireland · +30% YoY
              </span>
              <span className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
                HEA, 2024/25
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--color-fg-subtle)]">
                Combined
              </span>
              <span
                className="mt-2 font-heading font-semibold tabular-nums text-[color:var(--color-primary)]"
                style={{
                  fontSize: "clamp(72px, 10vw, 144px)",
                  lineHeight: 0.85,
                  letterSpacing: "-0.045em",
                }}
              >
                68,593
              </span>
              <span className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--color-fg-muted)]">
                Indian students · 2024/25
              </span>
            </div>

            <div className="flex flex-col items-center sm:items-start sm:text-left">
              <span
                className="font-heading font-semibold tabular-nums text-[color:var(--color-fg)]"
                style={{
                  fontSize: "clamp(36px, 4.5vw, 56px)",
                  lineHeight: 0.95,
                  letterSpacing: "-0.03em",
                }}
              >
                59,419
              </span>
              <span className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--color-primary)]">
                Germany · +20% YoY
              </span>
              <span className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
                DAAD, 2024/25
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
