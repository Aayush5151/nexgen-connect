"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { FAQ_ITEMS, type FAQItem } from "@/lib/faq";

/**
 * FAQSection. The last-mile objection handler. Eight questions, ranked
 * by how often a skeptical student or parent asks them. Answers are
 * short and honest - no marketing varnish, no hedging. If the honest
 * answer is &ldquo;we haven&rsquo;t built that yet,&rdquo; we say so.
 *
 * Pattern: single-open accordion. Opening one closes the others, which
 * keeps the column short and the eye focused. Respects keyboard users
 * (native button semantics, aria-expanded, aria-controls).
 *
 * JSON-LD is emitted in the site layout separately so the structured
 * data is legal for Google rich results.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

// Re-export so other landing files can keep `@/components/landing/FAQSection`
// as the import path if they prefer.
export type { FAQItem };
export { FAQ_ITEMS };

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      className="relative border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-16 sm:py-20 md:py-28"
    >
      <div className="container-narrow">
        <div className="grid gap-10 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-4">
            <SectionLabel>Questions</SectionLabel>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="mt-4 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
              style={{
                fontSize: "clamp(28px, 5vw, 52px)",
                lineHeight: 1.02,
                letterSpacing: "-0.03em",
              }}
            >
              Everything you&rsquo;d{" "}
              <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-fg-muted)]">
                actually ask.
              </span>
            </motion.h2>
            <p className="mt-4 max-w-[360px] text-[14px] leading-[1.55] text-[color:var(--color-fg-muted)]">
              The eight questions every student and parent asks before
              trusting a new app. Honest answers, no hedging.
            </p>
          </div>

          <div className="md:col-span-8">
            <ul className="flex flex-col divide-y divide-[color:var(--color-border)] overflow-hidden rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
              {FAQ_ITEMS.map((item, i) => {
                const isOpen = openIndex === i;
                const Icon = isOpen ? Minus : Plus;
                return (
                  <li key={item.q}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${i}`}
                      id={`faq-trigger-${i}`}
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      className="flex w-full items-start justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-[color:var(--color-surface-elevated)] sm:px-7 sm:py-6"
                    >
                      <h3 className="font-heading text-[15px] font-semibold leading-[1.35] text-[color:var(--color-fg)] sm:text-[17px]">
                        {item.q}
                      </h3>
                      <span
                        aria-hidden="true"
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors ${
                          isOpen
                            ? "border-[color:var(--color-primary)]/50 bg-[color:color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[color:var(--color-primary)]"
                            : "border-[color:var(--color-border-strong)] text-[color:var(--color-fg-muted)]"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={`faq-panel-${i}`}
                          role="region"
                          aria-labelledby={`faq-trigger-${i}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28, ease: EASE }}
                          className="overflow-hidden"
                        >
                          <p className="px-5 pb-6 text-[14px] leading-[1.65] text-[color:var(--color-fg-muted)] sm:px-7 sm:pb-7 sm:text-[15px]">
                            {item.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>

            <p className="mt-6 text-center text-[13px] text-[color:var(--color-fg-subtle)]">
              Still have a question?{" "}
              <a
                href="mailto:hello@nexgenconnect.com"
                className="text-[color:var(--color-primary)] transition-colors hover:text-[color:var(--color-primary-hover)]"
              >
                hello@nexgenconnect.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
