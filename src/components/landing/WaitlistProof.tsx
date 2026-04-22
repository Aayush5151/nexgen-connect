"use client";

import { motion } from "framer-motion";

/**
 * WaitlistProof. A thin proof-band right after the hero. Pre-launch we
 * do not fabricate waitlist numbers or fake avatar stacks - this strip
 * reads the current corridor, launch window, and TestFlight cadence
 * instead. Once real signups arrive, we can reintroduce a live counter
 * driven by the backend (see the old count-up implementation in git
 * history for the animation scaffold).
 *
 * Deliberately *not* a full section - it is punctuation between the
 * hero's promise and the first problem beat.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

export function WaitlistProof() {
  return (
    <section
      aria-label="Waitlist and launch window"
      className="relative border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-8 sm:py-10"
    >
      <div className="container-narrow">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:gap-6"
        >
          {/* Live dot + current windows. Two beachheads now, so the
              window copy pairs them - September (Ireland) + October
              (Germany) - rather than picking a favourite. */}
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span
                aria-hidden="true"
                className="absolute inset-0 animate-ping rounded-full bg-[color:var(--color-primary)] opacity-75"
              />
              <span className="relative h-2 w-2 rounded-full bg-[color:var(--color-primary)]" />
            </span>
            <p className="font-heading text-[15px] font-semibold text-[color:var(--color-fg)] sm:text-[16px]">
              Waitlist open for{" "}
              <span className="text-[color:var(--color-primary)]">
                Sept &amp; Oct 2026
              </span>
            </p>
          </div>

          {/* Divider dot */}
          <span
            aria-hidden="true"
            className="hidden h-1 w-1 rounded-full bg-[color:var(--color-border-strong)] sm:block"
          />

          {/* Two-corridor caption - India to Ireland (Sept) and India to
              Germany (Oct), both part of the launch beachhead. */}
          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
            India &rarr; Ireland &middot; India &rarr; Germany
          </p>
        </motion.div>
      </div>
    </section>
  );
}
