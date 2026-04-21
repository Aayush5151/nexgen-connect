"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { FeedbackForm } from "@/components/layout/FeedbackForm";

/**
 * FooterFAQ. Pre-footer block with a controlled accordion of common
 * questions and a compact feedback form on the right. The accordion is
 * driven by local state so only one item is open at a time - this keeps
 * the section dense enough to fit above the legal strip without
 * pushing the app badge row too far down.
 *
 * Answers are intentionally written in our voice (direct, specific,
 * no corporate hedging). Each answer is a short paragraph, not a wall
 * of text - the FAQ is a smell test for trust, not a manual.
 */

type FAQ = {
  q: string;
  a: string;
};

const FAQS: FAQ[] = [
  {
    q: "When does the app ship?",
    a: "September 2026 - before the first Ireland-bound flights take off. We'll email everyone on the waitlist the moment it's live on the App Store and Play Store.",
  },
  {
    q: "What countries do you launch with?",
    a: "Ireland first - UCD, Trinity, UCC. Every group is anchored to a university × month. Once Ireland proves out, we open the next corridor. Every corridor, eventually.",
  },
  {
    q: "How do you verify students?",
    a: "Four checks. Phone OTP via MSG91. DigiLocker Aadhaar (government consent flow - we never store the number). A real human reviews your admit letter. And your group only unlocks when ten verified members exist in your corridor.",
  },
  {
    q: "Is it actually free?",
    a: "Founding members - anyone on the waitlist before launch - pay zero. We'll announce pricing for later cohorts well before anyone is ever charged. No surprise fees.",
  },
  {
    q: "How is this different from a WhatsApp group?",
    a: "WhatsApp groups have 500 strangers, zero verification, and endless noise from agents and consultancies. NexGen matches ten verified students going to the same university the same month. That's the whole difference.",
  },
  {
    q: "What data do you store?",
    a: "Only what's needed to place you in a group: hashed phone, email if you gave it, home city, destination, admit status. We never sell data. Full deletion within an hour if you email us.",
  },
  {
    q: "Who's behind the app?",
    a: "Built by Aayush Shah after watching friends land in empty cities because the WhatsApp groups were useless. One-person shop becoming a small team. No agents. No consultancies.",
  },
  {
    q: "How do I report someone?",
    a: "One tap from any profile. We suspend the account within an hour and a human reviews it within twenty-four. One report kills a profile - there's no appeals theatre.",
  },
];

const EASE = [0.2, 0.8, 0.2, 1] as const;

export function FooterFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      aria-labelledby="footer-faq-heading"
      className="border-t border-[color:var(--color-border)] py-16 sm:py-20 md:py-24"
    >
      <div className="container-narrow">
        <div className="grid gap-10 sm:gap-12 md:grid-cols-12 md:gap-16">
          {/* LEFT column - intro + accordion */}
          <div className="md:col-span-7">
            <SectionLabel>FAQ</SectionLabel>
            <h2
              id="footer-faq-heading"
              className="mt-3 font-heading font-semibold text-[color:var(--color-fg)]"
              style={{
                fontSize: "clamp(26px, 5.2vw, 48px)",
                lineHeight: 1.05,
                letterSpacing: "-0.025em",
              }}
            >
              Questions most people ask{" "}
              <span className="font-serif font-bold italic tracking-[-0.015em] text-[color:var(--color-primary)]">
                before they sign up.
              </span>
            </h2>
            <p className="mt-3 max-w-[520px] text-[13.5px] leading-[1.55] text-[color:var(--color-fg-muted)] sm:mt-4 sm:text-[14px]">
              Can&apos;t find what you&apos;re looking for? Ask us directly -
              we read every message.
            </p>

            <ul className="mt-6 divide-y divide-[color:var(--color-border)] border-y border-[color:var(--color-border)] sm:mt-8">
              {FAQS.map((faq, i) => {
                const open = openIndex === i;
                const buttonId = `faq-trigger-${i}`;
                const panelId = `faq-panel-${i}`;
                return (
                  <li key={faq.q}>
                    <h3>
                      <button
                        id={buttonId}
                        type="button"
                        onClick={() => setOpenIndex(open ? null : i)}
                        aria-expanded={open}
                        aria-controls={panelId}
                        className="group flex w-full items-center justify-between gap-4 py-4 text-left transition-colors hover:text-[color:var(--color-fg)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg)]"
                      >
                        <span
                          className={`font-heading text-[14px] font-semibold leading-[1.35] transition-colors sm:text-[15px] md:text-[16px] ${
                            open
                              ? "text-[color:var(--color-fg)]"
                              : "text-[color:var(--color-fg-muted)]"
                          }`}
                        >
                          {faq.q}
                        </span>
                        <motion.span
                          aria-hidden="true"
                          animate={{ rotate: open ? 180 : 0 }}
                          transition={{ duration: 0.25, ease: EASE }}
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors ${
                            open
                              ? "border-[color:var(--color-primary)]/50 bg-[color:color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[color:var(--color-primary)]"
                              : "border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] text-[color:var(--color-fg-muted)] group-hover:border-[color:var(--color-primary)]/40 group-hover:text-[color:var(--color-fg)]"
                          }`}
                        >
                          <ChevronDown className="h-4 w-4" strokeWidth={2} />
                        </motion.span>
                      </button>
                    </h3>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          id={panelId}
                          role="region"
                          aria-labelledby={buttonId}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.26, ease: EASE }}
                          className="overflow-hidden"
                        >
                          <p className="pb-5 pr-8 text-[14px] leading-[1.6] text-[color:var(--color-fg-muted)] md:text-[14.5px]">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* RIGHT column - feedback form */}
          <div className="md:col-span-5">
            <div className="sticky top-24 rounded-[16px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 md:p-7">
              <SectionLabel>Still have a question?</SectionLabel>
              <h3
                className="mt-3 font-heading font-semibold text-[color:var(--color-fg)]"
                style={{
                  fontSize: "clamp(22px, 2.6vw, 28px)",
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                }}
              >
                Write us.{" "}
                <span className="font-serif font-bold italic tracking-[-0.015em] text-[color:var(--color-primary)]">
                  A human replies.
                </span>
              </h3>
              <p className="mt-3 text-[13px] leading-[1.55] text-[color:var(--color-fg-muted)]">
                Feedback, questions, bugs - anything. Leave an email and we
                reply the same day.
              </p>
              <div className="mt-6">
                <FeedbackForm referrer="footer" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
