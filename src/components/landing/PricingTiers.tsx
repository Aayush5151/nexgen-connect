"use client";

import { motion } from "framer-motion";

/**
 * PricingTiers — "What does this cost?"
 *
 * v17: previous "two skewed conic-gradient cards with seven-line
 * feature checklists" was visual noise. Replaced with a clean
 * two-column type-only composition: each tier is just a name, a
 * price, a one-line description, and four feature bullets in plain
 * mono prose. No card chrome, no gradient rings, no "recommended"
 * pill ceremony.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

const FREE_FEATURES = [
  "Corridor matching — home city × destination × month",
  "Three-check verification on every member",
  "DMs unlock when 60 verified students share your corridor",
  "Auto-formed intro circles and uni-specific subgroups",
] as const;

const PREMIUM_FEATURES = [
  "Priority match — first seat when your corridor unlocks",
  "Group-apply housing — bundle 3-6 students into one PBSA application",
  "Read-only Parent view — group size, verification, arrival; never chats",
  "30-minute human call within 24 hours, any question",
] as const;

function scrollToWaitlist() {
  if (typeof window === "undefined") return;
  document
    .getElementById("download")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function PricingTiers() {
  return (
    <section
      aria-labelledby="pricing-heading"
      className="relative flex min-h-[100dvh] items-center bg-[color:var(--color-bg)] py-20 sm:py-24"
    >
      <div className="container-narrow w-full">
        <div className="mx-auto max-w-[1080px]">
          <div className="mx-auto max-w-[820px] text-center">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-fg-subtle)]"
            >
              Pricing
            </motion.p>

            <motion.h2
              id="pricing-heading"
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
              Free for everyone.{" "}
              <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-primary)]">
                Premium if you want more.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.55, ease: EASE, delay: 0.2 }}
              className="mt-6 max-w-[640px] mx-auto text-balance text-[color:var(--color-fg-muted)]"
              style={{
                fontSize: "clamp(16px, 1.6vw, 19px)",
                lineHeight: 1.55,
              }}
            >
              The core product — matching, verification, and group DMs
              once your corridor unlocks — is free, forever. PBSA
              operators pay us referral fees. Students never pay to
              find their people.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.3 }}
            className="mt-14 grid grid-cols-1 gap-12 border-t border-[color:var(--color-border)] pt-12 sm:mt-16 sm:gap-16 md:grid-cols-2 md:gap-20"
          >
            {/* FREE column */}
            <div className="flex flex-col">
              <div className="flex items-baseline justify-between gap-4 border-b border-[color:var(--color-border)] pb-5">
                <div className="flex items-baseline gap-3">
                  <span
                    className="font-heading font-semibold text-[color:var(--color-fg)]"
                    style={{
                      fontSize: "clamp(48px, 6vw, 80px)",
                      lineHeight: 0.9,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    Free
                  </span>
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--color-fg-subtle)]">
                    Forever
                  </span>
                </div>
              </div>
              <p
                className="mt-5 max-w-[420px] text-[color:var(--color-fg-muted)]"
                style={{
                  fontSize: "clamp(15px, 1.4vw, 17px)",
                  lineHeight: 1.55,
                }}
              >
                Everything most students need before they land. No
                trial, no usage cap, no upgrade nag.
              </p>
              <ul className="mt-6 flex flex-col gap-3">
                {FREE_FEATURES.map((f) => (
                  <li
                    key={f}
                    className="flex gap-3 text-[14px] leading-[1.55] text-[color:var(--color-fg)] sm:text-[15px]"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[color:var(--color-primary)]"
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={scrollToWaitlist}
                className="mt-8 inline-flex h-11 items-center justify-center rounded-md border border-[color:var(--color-border-strong)] px-5 font-mono text-[12px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-fg)] transition-colors hover:border-[color:var(--color-primary)]/60 hover:text-[color:var(--color-primary)]"
              >
                Start free
              </button>
            </div>

            {/* PREMIUM column */}
            <div className="flex flex-col">
              <div className="flex items-baseline justify-between gap-4 border-b border-[color:var(--color-primary)]/40 pb-5">
                <div className="flex items-baseline gap-3">
                  <span
                    className="font-heading font-semibold text-[color:var(--color-primary)]"
                    style={{
                      fontSize: "clamp(48px, 6vw, 80px)",
                      lineHeight: 0.9,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    ₹1,499
                  </span>
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--color-primary)]">
                    One-time
                  </span>
                </div>
              </div>
              <p
                className="mt-5 max-w-[420px] text-[color:var(--color-fg-muted)]"
                style={{
                  fontSize: "clamp(15px, 1.4vw, 17px)",
                  lineHeight: 1.55,
                }}
              >
                For students who want priority matching, group-apply
                housing, and peace of mind for the people at home. No
                subscription, no auto-renew, no surprise charge.
              </p>
              <ul className="mt-6 flex flex-col gap-3">
                {PREMIUM_FEATURES.map((f) => (
                  <li
                    key={f}
                    className="flex gap-3 text-[14px] leading-[1.55] text-[color:var(--color-fg)] sm:text-[15px]"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[color:var(--color-primary)]"
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={scrollToWaitlist}
                className="mt-8 inline-flex h-11 items-center justify-center rounded-md bg-[color:var(--color-primary)] px-5 font-mono text-[12px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-primary-fg)] transition-colors hover:bg-[color:var(--color-primary-hover)]"
              >
                Unlock at launch
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
