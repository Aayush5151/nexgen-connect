"use client";

import { motion } from "framer-motion";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * AttentionCurve. A horizontal five-phase timeline of the pre-flight
 * journey, from admit letter to landing day. This section exists to
 * answer the single loudest objection raised during v4 user tests:
 *
 *   &ldquo;180 days is too long. I&rsquo;ll treat it like a dating app and leave.&rdquo;
 *
 * The v4 answer is progressive unlock - every phase ships a new
 * capability so the app never feels stagnant. Put the capabilities
 * on a single line and it becomes obvious: this is not a chatroom
 * waiting for September; this is a countdown with six different
 * reasons to come back.
 *
 * Phases (T = days to flight):
 *   01  T-180 -> T-120  Warm-up       - corridor forms, no DMs
 *   02  T-120 -> T-60   Building      - women-only opt-in, preview grows
 *   03  T-60  -> T-30   Preview       - group crystallises, DMs unlock
 *   04  T-30  -> T-7    Lock          - itinerary + parent view (Premium)
 *   05  T-7   -> T+30   Flight &amp; settle - arrivals board, Dublin survival
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

type Phase = {
  idx: string;
  window: string;
  title: string;
  body: string;
  unlocks: string;
};

const PHASES: Phase[] = [
  {
    idx: "01",
    window: "T-180 → T-120",
    title: "Warm-up",
    body: "Your corridor begins to form. You see anonymised previews of verified classmates heading to your city.",
    unlocks: "Corridor preview",
  },
  {
    idx: "02",
    window: "T-120 → T-60",
    title: "Building",
    body: "Widening rules kick in if the corridor is thin. Women-only opt-in decision sits here. Still no DMs.",
    unlocks: "Women-only toggle",
  },
  {
    idx: "03",
    window: "T-60 → T-30",
    title: "Preview",
    body: "Your eight-to-twelve-person group crystallises. DMs unlock the moment your corridor crosses sixty verified students.",
    unlocks: "Group + DMs",
  },
  {
    idx: "04",
    window: "T-30 → T-7",
    title: "Lock",
    body: "Group is locked. Itinerary, flight number, airport arrival all snap in. Premium&rsquo;s read-only Parent view goes live.",
    unlocks: "Parent view",
  },
  {
    idx: "05",
    window: "T-7 → T+30",
    title: "Flight &amp; settle",
    body: "Dublin arrivals board. Gate pickups. Dorm and apartment survival guides. One-tap crisis line live 24/7.",
    unlocks: "Arrivals + T&amp;S line",
  },
];

export function AttentionCurve() {
  return (
    <section
      id="curve"
      aria-labelledby="curve-heading"
      className="relative overflow-hidden border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-20 sm:py-24 md:py-32"
    >
      {/* Two faint primary washes at the ends to mimic the take-off and
          landing bookends of the curve. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(32% 38% at 8% 50%, color-mix(in srgb, var(--color-primary) 6%, transparent) 0%, transparent 65%), radial-gradient(32% 38% at 92% 50%, color-mix(in srgb, var(--color-primary) 6%, transparent) 0%, transparent 65%)",
        }}
      />

      <div className="container-narrow relative">
        <div className="mx-auto max-w-[760px] text-center">
          <SectionLabel className="mx-auto">
            Pre-flight timeline
          </SectionLabel>
          <motion.h2
            id="curve-heading"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="mt-4 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(28px, 6vw, 64px)",
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            Six months is long.{" "}
            <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-primary)]">
              Not empty.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.08 }}
            className="mx-auto mt-4 max-w-[560px] text-[14.5px] leading-[1.6] text-[color:var(--color-fg-muted)] sm:text-[15.5px]"
          >
            Five phases from admit letter to arrivals board. Every phase
            unlocks a new capability - so the app gives you a reason to
            open it long before the DMs go live.
          </motion.p>
        </div>

        {/* Horizontal timeline - scrolls on mobile, grid on md+ */}
        <div className="relative mx-auto mt-14 max-w-[1120px] sm:mt-16">
          {/* Continuous rule across the desktop grid, behind the phase cards */}
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-[30px] hidden h-px bg-[color:var(--color-border)] md:block"
          />

          <ol className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4 sm:gap-4 md:grid md:grid-cols-5 md:gap-3 md:overflow-visible md:pb-0">
            {PHASES.map((phase, i) => (
              <motion.li
                key={phase.idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.55, ease: EASE, delay: 0.08 * i }}
                className="relative min-w-[78%] shrink-0 snap-start sm:min-w-[52%] md:min-w-0"
              >
                {/* Tick on the rule (desktop only) */}
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 top-[24px] hidden h-3 w-3 -translate-x-1/2 rounded-full border border-[color:var(--color-primary)]/40 bg-[color:var(--color-bg)] md:block"
                >
                  <span className="absolute inset-[3px] rounded-full bg-[color:var(--color-primary)]" />
                </span>

                <div className="flex h-full flex-col rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 md:mt-12 md:p-5">
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-[11px] font-medium tracking-[0.14em] text-[color:var(--color-primary)]">
                      {phase.idx}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
                      {phase.window}
                    </span>
                  </div>

                  <h3
                    className="mt-3 font-heading text-[16px] font-semibold text-[color:var(--color-fg)] sm:text-[17px]"
                    dangerouslySetInnerHTML={{ __html: phase.title }}
                  />

                  <p
                    className="mt-2 text-[13px] leading-[1.55] text-[color:var(--color-fg-muted)] sm:text-[13.5px]"
                    dangerouslySetInnerHTML={{ __html: phase.body }}
                  />

                  <div className="mt-auto pt-4">
                    <div className="border-t border-[color:var(--color-border)] pt-3">
                      <p className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
                        Unlocks
                      </p>
                      <p
                        className="mt-1 font-heading text-[12.5px] font-semibold text-[color:var(--color-fg)]"
                        dangerouslySetInnerHTML={{ __html: phase.unlocks }}
                      />
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
          className="mx-auto mt-12 max-w-[520px] text-center font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)] sm:mt-14"
        >
          Anti-dating by design. Every unlock is a capability, not a lure.
        </motion.p>
      </div>
    </section>
  );
}
