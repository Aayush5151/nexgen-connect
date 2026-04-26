"use client";

import { motion } from "framer-motion";

/**
 * SafetyParents — "If you're a parent reading this."
 *
 * v18: 3x2 SAFEGUARD card grid in the editorial style. Each card
 * is a structured row of three things: SAFEGUARD index (mono kicker)
 * + status badge ("DAY ONE"), title (sans heading), body (one
 * line). Six cards laid out as a 3-col grid on desktop, 2-col on
 * tablet, 1-col on mobile.
 *
 * Headline keeps the editorial serif-italic pattern with emphasis
 * on "parent" — the reader's most defining identity in this
 * section. Subhead stays one line so the reader gets the contract
 * before the grid: six safeguards, one line each.
 *
 * v10 alignment: every card maps to a §9 Trust & Safety
 * commitment. Safeguard 05 is the "direct line to safety" framing
 * (named T&S advisor, 24h SLA, every corridor) — softer than the
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
    body: "Every report reaches our named Trust & Safety advisor within 24 hours.",
  },
  {
    index: "Safeguard 05",
    ship: "Day one",
    title: "Direct line to safety",
    body: "Reach a named advisor within 24h, every corridor, every time zone.",
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
    <section className="relative flex min-h-[100dvh] items-center bg-[color:var(--color-bg)] py-20 sm:py-24">
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
                fontSize: "clamp(40px, 6vw, 88px)",
                lineHeight: 1,
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
              className="mt-6 max-w-[640px] mx-auto text-balance text-[color:var(--color-fg-muted)]"
              style={{
                fontSize: "clamp(15px, 1.4vw, 18px)",
                lineHeight: 1.55,
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
              className="mt-8 inline-flex items-center gap-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-primary)] sm:text-[11px]"
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
          <ul className="mt-12 grid grid-cols-1 gap-3 sm:mt-14 sm:grid-cols-2 sm:gap-3.5 lg:grid-cols-3 lg:gap-4">
            {SAFEGUARDS.map((s, i) => (
              <motion.li
                key={s.index}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.04 * i }}
                className="group flex flex-col rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 transition-colors hover:border-[color:var(--color-primary)]/45 sm:p-7"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-fg-subtle)] sm:text-[10.5px]">
                    {s.index}
                  </span>
                  <span
                    className={`font-mono text-[10px] font-semibold uppercase tracking-[0.18em] sm:text-[10.5px] ${
                      s.ship === "Premium"
                        ? "text-[color:var(--color-primary)]"
                        : "text-[color:var(--color-primary)]"
                    }`}
                  >
                    {s.ship}
                  </span>
                </div>

                <h3
                  className="mt-8 font-heading font-semibold text-[color:var(--color-fg)]"
                  style={{
                    fontSize: "clamp(20px, 2.2vw, 26px)",
                    lineHeight: 1.15,
                    letterSpacing: "-0.015em",
                  }}
                >
                  {s.title}
                </h3>

                <p
                  className="mt-3 text-[color:var(--color-fg-muted)]"
                  style={{
                    fontSize: "clamp(13.5px, 1.05vw, 15px)",
                    lineHeight: 1.55,
                  }}
                >
                  {s.body}
                </p>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
