"use client";

import { motion } from "framer-motion";

/**
 * ProblemMoments — "You got in. Now the real wait starts."
 *
 * v18: editorial design language. Massive serif H2 with italic
 * accent on the pivot word ("real"). Four BEAT rows arranged as a
 * table — mono index column on the left, serif italic phrase in
 * the middle, sans body line on the right. Then a single closing
 * line that rotates from problem into product: "So we built the
 * group chat that actually works."
 *
 * Pattern echoes the editorial three-register typography used
 * across the v18 site: mono for system labels, serif italic for
 * emotional pivots, sans for body and declarative copy.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

type Beat = {
  index: string;
  headline: string;
  detail: string;
};

const BEATS: Beat[] = [
  {
    index: "Beat 01",
    headline: "The admit letter lands.",
    detail: "October. You refresh the portal twelve times before it loads.",
  },
  {
    index: "Beat 02",
    headline: "You find the WhatsApp group.",
    detail: "Five hundred people. Half are agents. None are yours.",
  },
  {
    index: "Beat 03",
    headline: "Nobody from your city.",
    detail: "Nobody you can place. Nobody your parents can verify.",
  },
  {
    index: "Beat 04",
    headline: "You close the tab.",
    detail: "The countdown to a new continent begins. Alone.",
  },
];

export function ProblemMoments() {
  return (
    <section className="relative flex min-h-[100dvh] items-center bg-[color:var(--color-bg)] py-20 sm:py-24">
      <div className="container-narrow w-full">
        <div className="mx-auto max-w-[1200px]">
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="font-heading font-semibold text-balance text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(40px, 6.5vw, 92px)",
              lineHeight: 0.98,
              letterSpacing: "-0.035em",
              maxWidth: "16ch",
            }}
          >
            You got in. Now the{" "}
            <span className="font-serif font-normal italic tracking-[-0.02em] text-[color:var(--color-fg)]">
              real
            </span>{" "}
            wait starts.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.18 }}
            className="mt-10 inline-flex items-center gap-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-primary)] sm:text-[11px]"
          >
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)]"
            />
            The problem
          </motion.p>

          {/* Four-beat table. Each row is three columns on md+:
              mono index | serif italic phrase | sans body. On mobile
              the columns stack into a clean read. Top + bottom
              hairlines bracket the set so it reads as a single
              composition. */}
          <ol className="mt-10 flex flex-col border-y border-[color:var(--color-border)] sm:mt-12">
            {BEATS.map((beat, i) => (
              <motion.li
                key={beat.index}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.55, ease: EASE, delay: 0.05 + i * 0.06 }}
                className="grid gap-x-8 gap-y-3 border-t border-[color:var(--color-border)] py-6 first:border-t-0 sm:py-8 md:grid-cols-12 md:gap-x-12 md:py-10"
              >
                <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-fg-subtle)] md:col-span-2 md:pt-3 md:text-[11px]">
                  {beat.index}
                </p>
                <p
                  className="font-serif italic tracking-[-0.02em] text-[color:var(--color-fg)] md:col-span-6"
                  style={{
                    fontSize: "clamp(24px, 3.4vw, 44px)",
                    lineHeight: 1.1,
                  }}
                >
                  {beat.headline}
                </p>
                <p
                  className="text-[color:var(--color-fg-muted)] md:col-span-4 md:pt-3"
                  style={{
                    fontSize: "clamp(14.5px, 1.2vw, 16.5px)",
                    lineHeight: 1.55,
                  }}
                >
                  {beat.detail}
                </p>
              </motion.li>
            ))}
          </ol>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.3 }}
            className="mt-12 max-w-[820px] font-serif italic tracking-[-0.02em] text-[color:var(--color-fg)] sm:mt-14"
            style={{
              fontSize: "clamp(28px, 4.4vw, 56px)",
              lineHeight: 1.15,
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
