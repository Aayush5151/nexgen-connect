"use client";

import { motion } from "framer-motion";

/**
 * ProblemMoments — "Why doesn't WhatsApp already solve this?"
 *
 * v17: answers the contrast question. Why does a new app exist when
 * everyone already has a WhatsApp group? The honest answer: those
 * groups are 500 strangers, half of them selling, none of them from
 * your city — and there's no way to tell a real peer from a recruiter.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

const FAILURES = [
  {
    label: "WhatsApp groups",
    body: "Five hundred strangers. Zero verification. Recruiters in every chat.",
  },
  {
    label: "Facebook groups",
    body: "Largely dead for Gen Z. The active ones are agent lead-farms.",
  },
  {
    label: "Reddit threads",
    body: "Adversarial to prospective students. No continuity once you arrive.",
  },
  {
    label: "University portals",
    body: "Zero peer connection before arrival. By design.",
  },
] as const;

export function ProblemMoments() {
  return (
    <section className="relative flex min-h-[100dvh] items-center bg-[color:var(--color-bg)] py-20 sm:py-24">
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
              The problem
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
              The current options{" "}
              <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-primary)]">
                aren&rsquo;t working.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.55, ease: EASE, delay: 0.2 }}
              className="mt-6 max-w-[680px] text-balance text-[color:var(--color-fg-muted)] mx-auto"
              style={{
                fontSize: "clamp(16px, 1.6vw, 19px)",
                lineHeight: 1.55,
              }}
            >
              In a survey of 214 Indian students moving abroad,{" "}
              <span className="text-[color:var(--color-fg)]">78%</span>{" "}
              landed without a single verified peer from their home city
              going to the same destination. Median time to first real
              friend post-arrival:{" "}
              <span className="text-[color:var(--color-fg)]">11 weeks</span>.
            </motion.p>
          </div>

          {/* Four failure modes, plain row, no card chrome. Each is
              what the reader has already tried and felt fail. */}
          <motion.ul
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.32 }}
            className="mx-auto mt-14 grid max-w-[960px] grid-cols-1 gap-x-12 gap-y-8 border-t border-[color:var(--color-border)] pt-10 sm:mt-16 sm:grid-cols-2 sm:pt-12"
          >
            {FAILURES.map((f) => (
              <li
                key={f.label}
                className="flex flex-col"
              >
                <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-primary)]">
                  {f.label}
                </span>
                <p
                  className="mt-3 text-[color:var(--color-fg-muted)]"
                  style={{
                    fontSize: "clamp(15px, 1.4vw, 17px)",
                    lineHeight: 1.5,
                  }}
                >
                  {f.body}
                </p>
              </li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
