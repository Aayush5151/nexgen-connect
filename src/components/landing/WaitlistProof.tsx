"use client";

import { motion } from "framer-motion";

/**
 * WaitlistProof. The thesis anchor right after the hero. Answers the
 * question every visitor is silently asking after the H1: "OK, but
 * what IS NexGen Connect?" The hero promises an outcome ("find your
 * people"); this section names the product, the audience, and the
 * launch corridors in plain English so the rest of the page has
 * somewhere to anchor.
 *
 * v14 promotion: was previously a thin punctuation band ("Waitlist
 * open · India to Ireland · India to Germany"). Promoted into a
 * proper thesis section because the page didn't clearly state what
 * we are building or for whom. Live dot stays as the visual signal
 * of pre-launch momentum; the new type stack carries the meaning.
 *
 * Three-register grammar, consistent with the rest of the site:
 *   - mono live-dot kicker  (status pulse)
 *   - serif/sans H2 split   (declarative thesis with a serif italic
 *                            emphasis on the second line)
 *   - sans body             (one paragraph that names the product,
 *                            the group size, the verification, and
 *                            the philosophy)
 *   - mono corridor row     (the two launch beachheads with dates)
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

export function WaitlistProof() {
  return (
    <section
      aria-label="What NexGen Connect is"
      className="relative overflow-hidden border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-12 sm:py-16 md:py-20"
    >
      {/* Soft primary wash so this section reads as a quiet pivot from
          the hero rather than a hard new chapter. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(40% 30% at 50% 50%, color-mix(in srgb, var(--color-primary) 6%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="container-narrow relative">
        <div className="mx-auto max-w-[760px] text-center">
          {/* Live dot kicker — kept from the previous WaitlistProof so
              the section still signals pre-launch momentum at a glance. */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="inline-flex items-center gap-2"
          >
            <span className="relative flex h-2 w-2">
              <span
                aria-hidden="true"
                className="absolute inset-0 animate-ping rounded-full bg-[color:var(--color-primary)] opacity-75"
              />
              <span className="relative h-2 w-2 rounded-full bg-[color:var(--color-primary)]" />
            </span>
            <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-primary)]">
              Waitlist open &middot; Ireland Sept &middot; Germany Oct
            </p>
          </motion.div>

          {/* H2 thesis — declarative, two-line, with a serif italic
              second clause that carries the emphasis. Sets the entire
              page's frame: "we exist to put you with your people before
              you fly". */}
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.08 }}
            className="mt-5 font-heading font-semibold text-balance text-[color:var(--color-fg)] sm:mt-6"
            style={{
              fontSize: "clamp(28px, 5.4vw, 56px)",
              lineHeight: 1.02,
              letterSpacing: "-0.032em",
            }}
          >
            The verified group of students you fly with —{" "}
            <span className="font-serif font-normal italic tracking-[-0.018em] text-[color:var(--color-primary)]">
              met before takeoff, not after.
            </span>
          </motion.h2>

          {/* Sans body — names the product, the size, the verification,
              and the philosophy in one paragraph. This is the line a
              reader can quote back to a parent if they're asked
              "what's this app you're on?". */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.18 }}
            className="mx-auto mt-5 max-w-[560px] text-[15px] leading-[1.55] text-[color:var(--color-fg-muted)] sm:mt-6 sm:text-[16.5px]"
          >
            NexGen Connect is the verified group app for Indian students
            going abroad. Your home city, your destination city, your
            intake month &mdash; once 60 verified classmates share that
            group, it unlocks. Three checks per person. No agents. No
            strangers. Just the people you&rsquo;re about to share a
            year with.
          </motion.p>

          {/* Mono corridor row — two-up on desktop, stacked on mobile.
              Replaces the old single-line "India → Ireland · India →
              Germany" caption. Each corridor gets its own date so the
              reader sees the full launch plan at a glance. */}
          <motion.ul
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.28 }}
            className="mx-auto mt-7 flex max-w-[480px] flex-col items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] sm:mt-8 sm:flex-row sm:gap-6"
          >
            <li className="flex items-center gap-2 text-[color:var(--color-fg-muted)]">
              <span
                aria-hidden="true"
                className="h-1 w-1 rounded-full bg-[color:var(--color-primary)]"
              />
              India &rarr; Ireland &middot; Sept 2026
            </li>
            <li
              aria-hidden="true"
              className="hidden h-px w-6 bg-[color:var(--color-border)] sm:block"
            />
            <li className="flex items-center gap-2 text-[color:var(--color-fg-muted)]">
              <span
                aria-hidden="true"
                className="h-1 w-1 rounded-full bg-[color:var(--color-primary)]"
              />
              India &rarr; Germany &middot; Oct 2026
            </li>
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
