"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * WaitlistProof — "Why now?"
 *
 * v19: previous version had a 3-column grid with `items-end` that
 * caused the giant middle number to overlap the smaller side ones
 * because each column had a different intrinsic height. Replaced
 * with a clean vertical stack — big 68,593 sits on its own line,
 * then a divider, then a clean two-up Ireland / Germany row.
 *
 * Bonus: the 68,593 now counts up on first viewport entry. Quiet
 * editorial counter — no tickertape gimmick — just a half-second
 * count to lock the magnitude in the reader's head.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;
const TARGET = 68593;

export function WaitlistProof() {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) {
      setCount(TARGET);
      return;
    }
    const start = performance.now();
    const duration = 1400;
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = Math.min(1, (now - start) / duration);
      // ease-out-cubic so the run-up feels deliberate, not drag-racey
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setCount(Math.round(TARGET * eased));
      if (elapsed < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started]);

  return (
    <section
      aria-label="Why now"
      className="relative flex min-h-[100dvh] items-center bg-[color:var(--color-bg)] py-14 sm:py-16"
    >
      <div className="container-narrow w-full">
        <div className="mx-auto flex max-w-[1080px] flex-col items-center text-center">
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
            className="mt-5 max-w-[640px] text-balance text-[color:var(--color-fg-muted)]"
            style={{
              fontSize: "clamp(14.5px, 1.4vw, 17px)",
              lineHeight: 1.55,
            }}
          >
            Ireland and Germany absorbed the largest Indian student cohort
            either country has ever seen last year. The old WhatsApp-and-
            agent path doesn&rsquo;t scale.
          </motion.p>

          {/* The mega number — its own row, full width, animated on
              first view. No competing siblings on the same baseline. */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            onViewportEnter={() => setStarted(true)}
            transition={{ duration: 0.7, ease: EASE, delay: 0.3 }}
            className="mt-8 flex flex-col items-center sm:mt-10"
          >
            <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-[color:var(--color-fg-subtle)] sm:text-[11px]">
              Combined · Indian students · 2024/25
            </p>
            <span
              className="mt-3 font-heading font-semibold tabular-nums text-[color:var(--color-primary)]"
              style={{
                fontSize: "clamp(52px, 9vw, 128px)",
                lineHeight: 0.88,
                letterSpacing: "-0.05em",
              }}
            >
              {count.toLocaleString("en-IN")}
            </span>
          </motion.div>

          {/* Ireland / Germany split — clean two-up row below the
              mega number, separated by a vertical hairline so the
              two countries read as siblings of the combined total. */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.5 }}
            className="mt-8 grid w-full max-w-[640px] grid-cols-2 items-stretch gap-0 border-t border-[color:var(--color-border)] pt-7 sm:mt-10 sm:pt-8"
          >
            <div className="flex flex-col items-center border-r border-[color:var(--color-border)] px-4 text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-fg-subtle)] sm:text-[11px]">
                Ireland
              </p>
              <span
                className="mt-3 font-heading font-semibold tabular-nums text-[color:var(--color-fg)]"
                style={{
                  fontSize: "clamp(36px, 5vw, 60px)",
                  lineHeight: 0.95,
                  letterSpacing: "-0.035em",
                }}
              >
                9,174
              </span>
              <p className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--color-primary)]">
                +30% YoY
              </p>
              <p className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-[color:var(--color-fg-subtle)]">
                HEA · 2024/25
              </p>
            </div>
            <div className="flex flex-col items-center px-4 text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-fg-subtle)] sm:text-[11px]">
                Germany
              </p>
              <span
                className="mt-3 font-heading font-semibold tabular-nums text-[color:var(--color-fg)]"
                style={{
                  fontSize: "clamp(36px, 5vw, 60px)",
                  lineHeight: 0.95,
                  letterSpacing: "-0.035em",
                }}
              >
                59,419
              </span>
              <p className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--color-primary)]">
                +20% YoY
              </p>
              <p className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-[color:var(--color-fg-subtle)]">
                DAAD · 2024/25
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
