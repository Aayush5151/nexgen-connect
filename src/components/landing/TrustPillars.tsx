"use client";

import { motion } from "framer-motion";

/**
 * TrustPillars — "How does it actually work?"
 *
 * v17: this section answers the core mechanical question. Headline
 * names the rule in plain English; body explains what the reader
 * actually experiences; number is the evidence (60), supporting row
 * names the three product anti-patterns we refuse to ship.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

const ANTI = [
  { label: "No agents", body: "No recruiters. No brokers. Students only." },
  { label: "No ads", body: "Operators pay us, never you. You won&rsquo;t be the product." },
  { label: "No fakes", body: "Phone, Aadhaar, and admit letter — every member, no exception." },
] as const;

export function TrustPillars() {
  return (
    <section className="relative flex min-h-[100dvh] items-center bg-[color:var(--color-bg)] py-20 sm:py-24">
      <div className="container-narrow w-full">
        <div className="mx-auto flex max-w-[1080px] flex-col items-center text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-fg-subtle)]"
          >
            How it works
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
            Your group only forms{" "}
            <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-primary)]">
              when it&rsquo;s real.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.2 }}
            className="mt-6 max-w-[680px] text-balance text-[color:var(--color-fg-muted)]"
            style={{
              fontSize: "clamp(16px, 1.6vw, 19px)",
              lineHeight: 1.55,
            }}
          >
            Group DMs unlock when sixty verified students share your
            home city, your destination, and your intake month. Until
            then, the group isn&rsquo;t real — and we tell you so,
            instead of hiding the count behind a marketing screen.
          </motion.p>

          {/* The number — sized for impact but not so big it crushes
              the explanatory copy above it. Sits below the body so
              the reader has the context before the receipt. */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
            className="mt-10 flex items-baseline gap-4 sm:mt-14 sm:gap-6"
          >
            <span
              aria-hidden="true"
              className="font-heading font-semibold tabular-nums text-[color:var(--color-primary)]"
              style={{
                fontSize: "clamp(120px, 18vw, 240px)",
                lineHeight: 0.85,
                letterSpacing: "-0.05em",
              }}
            >
              60
            </span>
            <span
              className="font-heading font-medium text-[color:var(--color-fg-muted)]"
              style={{
                fontSize: "clamp(16px, 1.6vw, 20px)",
                lineHeight: 1.3,
                letterSpacing: "-0.01em",
              }}
            >
              verified students,
              <br />
              before any DM opens
            </span>
          </motion.div>

          {/* Three anti-patterns we refuse to ship. Plain prose,
              no card chrome — just three labelled lines. */}
          <motion.ul
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.45 }}
            className="mt-12 grid w-full max-w-[820px] grid-cols-1 gap-6 border-t border-[color:var(--color-border)] pt-8 sm:mt-16 sm:grid-cols-3 sm:gap-10"
          >
            {ANTI.map((a) => (
              <li
                key={a.label}
                className="flex flex-col items-center text-center sm:items-start sm:text-left"
              >
                <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-primary)]">
                  {a.label}
                </span>
                <p
                  className="mt-2 max-w-[240px] text-[color:var(--color-fg-muted)]"
                  style={{
                    fontSize: "clamp(13px, 1.1vw, 14.5px)",
                    lineHeight: 1.5,
                  }}
                  dangerouslySetInnerHTML={{ __html: a.body }}
                />
              </li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
