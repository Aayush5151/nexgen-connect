"use client";

import { motion } from "framer-motion";

/**
 * SafetyParents — "Is it actually safe?"
 *
 * v17: answers the parent / safety-first reader's silent question.
 * Headline names the architecture (verified-only); body explains
 * what each layer does; the three checks are listed plainly with
 * what each one does and what it never does.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

const CHECKS = [
  {
    n: "01",
    title: "Phone",
    body: "Six-digit OTP via MSG91. Your number is hashed on arrival — we never store it in plain text.",
  },
  {
    n: "02",
    title: "Identity",
    body: "DigiLocker Aadhaar consent flow. We receive a one-way verification token — never the 12-digit number itself.",
  },
  {
    n: "03",
    title: "Admit letter",
    body: "A real human reviews your admit PDF within 48 hours. No bots, no auto-approve. We will reject a forgery.",
  },
] as const;

export function SafetyParents() {
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
            For parents
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
            Verified before they{" "}
            <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-primary)]">
              ever say hello.
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
            Three independent checks per person, all completed before
            anyone can join your group. No swipe, no photo-first
            profiles, no infinite scroll. Identity-tied bans mean a
            removed user can&rsquo;t come back with a new number.
          </motion.p>

          {/* The three checks. Plain row, numbered, no card chrome.
              Each has a name, a one-line explanation, and one
              specific commitment. Reads as a technical receipt. */}
          <motion.ol
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.32 }}
            className="mt-14 grid w-full max-w-[920px] grid-cols-1 gap-8 border-t border-[color:var(--color-border)] pt-10 sm:mt-16 sm:grid-cols-3 sm:gap-10 sm:pt-12"
          >
            {CHECKS.map((c) => (
              <li
                key={c.n}
                className="flex flex-col items-center text-center sm:items-start sm:text-left"
              >
                <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-primary)]">
                  Check {c.n}
                </span>
                <h3
                  className="mt-3 font-heading font-semibold text-[color:var(--color-fg)]"
                  style={{
                    fontSize: "clamp(22px, 2.6vw, 30px)",
                    lineHeight: 1.1,
                    letterSpacing: "-0.015em",
                  }}
                >
                  {c.title}
                </h3>
                <p
                  className="mt-3 max-w-[260px] text-[color:var(--color-fg-muted)]"
                  style={{
                    fontSize: "clamp(13.5px, 1.1vw, 15px)",
                    lineHeight: 1.55,
                  }}
                >
                  {c.body}
                </p>
              </li>
            ))}
          </motion.ol>
        </div>
      </div>
    </section>
  );
}
