"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

/**
 * SafetyParents, "If you're a parent reading this."
 *
 * v18: 3x2 SAFEGUARD card grid in the editorial style. Each card
 * is a structured row of three things: SAFEGUARD index (mono kicker)
 * + status badge ("DAY ONE"), title (sans heading), body (one
 * line). Six cards laid out as a 3-col grid on desktop, 2-col on
 * tablet, 1-col on mobile.
 *
 * Headline keeps the editorial serif-italic pattern with emphasis
 * on "parent", the reader's most defining identity in this
 * section. Subhead stays one line so the reader gets the contract
 * before the grid: six safeguards, one line each.
 *
 * v10 alignment: every card maps to a §9 Trust & Safety
 * commitment. Safeguard 05 is the "direct line to safety" framing
 * (named T&S advisor, 24h SLA, every corridor), softer than the
 * "24/7 always-on crisis line" earlier copy that we corrected last
 * audit pass.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

type Safeguard = {
  index: string;
  ship: string;
  title: string;
  body: string;
};

const SAFEGUARDS: Safeguard[] = [
  {
    index: "Safeguard 01",
    ship: "Day one",
    title: "Verified-only walls",
    body: "Phone OTP, DigiLocker Aadhaar, human-checked admit letter. No exceptions, no auto-approve.",
  },
  {
    index: "Safeguard 02",
    ship: "Day one",
    title: "Women-only groups",
    body: "Opt in and match only with verified women. Invisible to everyone else.",
  },
  {
    index: "Safeguard 03",
    ship: "Day one",
    title: "No dating patterns",
    body: "No swipe. No photo-first profiles. Instagram revealed only on mutual opt-in.",
  },
  {
    index: "Safeguard 04",
    ship: "Day one",
    title: "One-tap report",
    body: "Named T&S advisor first-responds in 4h business, 12h overnight. Imminent-harm cases get a 30-minute outreach.",
  },
  {
    index: "Safeguard 05",
    ship: "Day one",
    title: "Direct line to safety",
    body: "Premium gets a 1-hour SLA, 24/7. Every corridor, every time zone, never an off-shore script.",
  },
  {
    index: "Safeguard 06",
    ship: "Premium",
    title: "Parent view",
    body: "Group size, verification status, arrival time only. Never your chats. Never your Instagram.",
  },
];

export function SafetyParents() {
  return (
    <section className="relative flex items-center bg-[color:var(--color-bg)] py-12 sm:py-20 md:min-h-[100dvh] md:py-24">
      <div className="container-narrow w-full">
        <div className="mx-auto max-w-[1200px]">
          <div className="mx-auto max-w-[920px] text-center">
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="font-heading font-semibold text-balance text-[color:var(--color-fg)]"
              style={{
                fontSize: "clamp(32px, 4.6vw, 64px)",
                lineHeight: 1.02,
                letterSpacing: "-0.035em",
              }}
            >
              If you&rsquo;re a{" "}
              <span className="font-serif font-normal italic tracking-[-0.025em] text-[color:var(--color-fg)]">
                parent
              </span>{" "}
              reading this.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.55, ease: EASE, delay: 0.18 }}
              className="mt-3 max-w-[640px] mx-auto text-balance text-[color:var(--color-fg-muted)] sm:mt-6"
              style={{
                fontSize: "clamp(13px, 1.4vw, 18px)",
                lineHeight: 1.5,
              }}
            >
              Six safeguards, one line each. Your job is to worry. Ours is
              to make it stop.
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.28 }}
              className="mt-4 hidden items-center gap-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-primary)] sm:mt-8 sm:inline-flex sm:text-[11px]"
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)]"
              />
              For the most skeptical reader
            </motion.p>
          </div>

          {/* 3x2 safeguard card grid. Each card has a top row
              (mono kicker + ship status), a sans heading, and a
              one-line body. Subtle border on idle, brighter
              primary border on hover. */}
          {/* Mobile: 2-col tight grid, body hidden so titles + ship-tag
              communicate the safeguard. sm+: 2-col with body. lg+:
              3-col with body. */}
          <ul className="mt-6 grid grid-cols-2 gap-2 sm:mt-8 sm:gap-3 lg:mt-10 lg:grid-cols-3 lg:gap-4">
            {SAFEGUARDS.map((s, i) => (
              <motion.li
                key={s.index}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.04 * i }}
                className="group flex flex-col rounded-[10px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3 transition-colors hover:border-[color:var(--color-primary)]/45 sm:rounded-[14px] sm:p-5 lg:p-6"
              >
                <div className="flex items-baseline justify-between gap-2 sm:gap-3">
                  <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-fg-subtle)] sm:text-[10.5px] sm:tracking-[0.18em]">
                    {s.index}
                  </span>
                  <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-primary)] sm:text-[10.5px] sm:tracking-[0.18em]">
                    {s.ship}
                  </span>
                </div>

                <h3
                  className="mt-3 font-heading font-semibold text-[color:var(--color-fg)] sm:mt-5"
                  style={{
                    fontSize: "clamp(14px, 1.6vw, 20px)",
                    lineHeight: 1.2,
                    letterSpacing: "-0.015em",
                  }}
                >
                  {s.title}
                </h3>

                {/* Body hidden on mobile - title + ship tag communicate
                    the safeguard. sm+: full body line. */}
                <p
                  className="mt-2 hidden text-[color:var(--color-fg-muted)] sm:block sm:mt-3"
                  style={{
                    fontSize: "clamp(13px, 0.95vw, 14px)",
                    lineHeight: 1.5,
                  }}
                >
                  {s.body}
                </p>
              </motion.li>
            ))}
          </ul>

          {/* Cross-link to /women-only and /research for the parent who
              wants to go deeper than six bullet cards. */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
            className="mx-auto mt-8 flex max-w-[920px] flex-col items-center justify-center gap-3 text-center sm:mt-10 sm:flex-row sm:gap-6"
          >
            <Link
              href="/women-only"
              className="group inline-flex items-center gap-2 rounded-full border border-[color:var(--color-primary)]/40 bg-[color:color-mix(in_srgb,var(--color-primary)_8%,transparent)] px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-primary)] transition-colors hover:border-[color:var(--color-primary)]/70 hover:bg-[color:color-mix(in_srgb,var(--color-primary)_14%,transparent)]"
            >
              Women-only walkthrough
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2.2}
              />
            </Link>
            <Link
              href="/research"
              className="group inline-flex items-center gap-2 rounded-full border border-[color:var(--color-primary)]/40 bg-[color:color-mix(in_srgb,var(--color-primary)_8%,transparent)] px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-primary)] transition-colors hover:border-[color:var(--color-primary)]/70 hover:bg-[color:color-mix(in_srgb,var(--color-primary)_14%,transparent)]"
            >
              The numbers, sourced
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2.2}
              />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
