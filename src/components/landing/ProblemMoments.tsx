"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ProblemMoments — "You got in. Now the real wait starts."
 *
 * v19: previous version was a vertical 4-row beat table that
 * exceeded one viewport on smaller laptops and required scrolling.
 * Replaced with a single rotating "beat stage" — one beat at a time
 * holds the full center stage of the section, auto-cycles every
 * 3.6 seconds, and the reader can tap a dot to jump or pause.
 *
 * Pattern: editorial cinema. The H2 stays fixed at the top of the
 * section as a static frame. Below it, a single beat-card cross-
 * fades through the four problem moments — admit landing, WhatsApp
 * group chaos, no-one-from-your-city, closing-the-tab. Beneath the
 * stage, four progress dots show position; clicking a dot jumps
 * the beat and pauses auto-cycle for 8 seconds. A static closing
 * line ("So we built the group chat that actually works.") sits
 * at the section foot to land the pivot into the rest of the page.
 *
 * The result: more interactive, reads in one viewport at any
 * laptop size, and the cinematic crossfade does the work that the
 * static 4-row table couldn't pay for.
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

const CYCLE_MS = 3600;
const PAUSE_AFTER_TAP_MS = 8000;

export function ProblemMoments() {
  const [active, setActive] = useState(0);
  const pauseUntilRef = useRef(0);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = window.setInterval(() => {
      if (Date.now() < pauseUntilRef.current) return;
      setActive((a) => (a + 1) % BEATS.length);
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, []);

  const goTo = (i: number) => {
    pauseUntilRef.current = Date.now() + PAUSE_AFTER_TAP_MS;
    setActive(i);
  };

  const beat = BEATS[active];

  return (
    <section className="relative flex min-h-[100dvh] items-center overflow-hidden bg-[color:var(--color-bg)] py-20 sm:py-24">
      <div className="container-narrow w-full">
        <div className="mx-auto flex max-w-[1180px] flex-col">
          {/* Top: kicker + section H2 */}
          <div className="flex flex-col items-start">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="inline-flex items-center gap-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-primary)] sm:text-[11px]"
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)]"
              />
              The problem
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
              className="mt-6 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
              style={{
                fontSize: "clamp(36px, 5.4vw, 72px)",
                lineHeight: 1.02,
                letterSpacing: "-0.03em",
                maxWidth: "16ch",
              }}
            >
              You got in. Now the{" "}
              <span className="font-serif font-normal italic tracking-[-0.02em] text-[color:var(--color-fg)]">
                real
              </span>{" "}
              wait starts.
            </motion.h2>
          </div>

          {/* Beat stage — single beat fills the stage; cross-fades on
              auto-cycle / manual jump. Min height so the section
              doesn't jump as content lengths differ between beats. */}
          <div className="mt-10 grid gap-x-12 gap-y-6 sm:mt-14 md:grid-cols-12">
            {/* Left rail: progress meter (mono index + dots) */}
            <div className="md:col-span-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-fg-subtle)] sm:text-[11px]">
                {beat.index}
                <span className="ml-2 text-[color:var(--color-fg-muted)]">
                  / 04
                </span>
              </p>

              <ol className="mt-5 flex items-center gap-2 md:mt-6 md:flex-col md:items-start md:gap-3">
                {BEATS.map((b, i) => {
                  const isActive = i === active;
                  return (
                    <li key={b.index} className="md:w-full">
                      <button
                        type="button"
                        onClick={() => goTo(i)}
                        aria-label={`Jump to ${b.index}`}
                        aria-current={isActive ? "step" : undefined}
                        className="group flex w-full items-center gap-2"
                      >
                        <span
                          className={`relative h-px transition-all duration-500 ease-out ${
                            isActive
                              ? "w-12 bg-[color:var(--color-primary)] md:w-full"
                              : "w-6 bg-[color:var(--color-border-strong)] group-hover:bg-[color:var(--color-fg-subtle)] md:w-12"
                          }`}
                        >
                          {isActive && (
                            <motion.span
                              key={`fill-${i}`}
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{
                                duration: CYCLE_MS / 1000,
                                ease: "linear",
                              }}
                              className="absolute inset-0 origin-left bg-[color:var(--color-primary)]"
                              style={{
                                animationPlayState:
                                  Date.now() < pauseUntilRef.current
                                    ? "paused"
                                    : "running",
                              }}
                            />
                          )}
                        </span>
                        <span
                          className={`hidden font-mono text-[10px] uppercase tracking-[0.16em] transition-colors md:inline ${
                            isActive
                              ? "text-[color:var(--color-fg)]"
                              : "text-[color:var(--color-fg-subtle)] group-hover:text-[color:var(--color-fg-muted)]"
                          }`}
                        >
                          0{i + 1}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Stage: the active beat */}
            <div className="md:col-span-9">
              <div className="relative min-h-[280px] sm:min-h-[320px] md:min-h-[360px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={beat.index}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.45, ease: EASE }}
                    className="absolute inset-0 flex flex-col justify-center"
                  >
                    <p
                      className="font-serif italic tracking-[-0.02em] text-[color:var(--color-fg)]"
                      style={{
                        fontSize: "clamp(36px, 6.4vw, 84px)",
                        lineHeight: 1.05,
                      }}
                    >
                      {beat.headline}
                    </p>
                    <p
                      className="mt-6 max-w-[640px] text-[color:var(--color-fg-muted)]"
                      style={{
                        fontSize: "clamp(15px, 1.6vw, 20px)",
                        lineHeight: 1.5,
                      }}
                    >
                      {beat.detail}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Closing pivot — fixed at the foot, doesn't change with
              the beat. Reads as the section's resolution. */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.4 }}
            className="mt-12 max-w-[860px] border-t border-[color:var(--color-border)] pt-8 font-serif italic tracking-[-0.02em] text-[color:var(--color-fg)] sm:mt-14 sm:pt-10"
            style={{
              fontSize: "clamp(22px, 3.2vw, 40px)",
              lineHeight: 1.2,
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
