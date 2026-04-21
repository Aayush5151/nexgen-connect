"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * PricingTiers. Two-tier pricing grid: a Free tier that already does
 * what most students need, and a Premium one-time \u20b91,499 unlock that
 * adds parent peace-of-mind, priority review, and extended preview.
 *
 * v4 design commitments encoded here:
 *   - No subscription. No monthly. One-time payment, unlocked forever.
 *   - Free tier is not a trial. Core matching, verification, DMs,
 *     and the pre-flight countdown are in Free and stay there.
 *   - Premium is explicitly parent-facing. The read-only Parent view
 *     is the anchor feature - everything else is scaffolding.
 *   - We do NOT show a separate Parent / Family plan. Removed in v4
 *     after user feedback that three tiers felt upsold.
 *
 * Visual intent: two sibling cards, equal weight. Premium gets a quiet
 * primary-ring accent, not a loud badge. This is a confidence move -
 * people who need Parent view know why they&apos;re here.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

type Tier = {
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  features: string[];
  accent: boolean;
};

const TIERS: Tier[] = [
  {
    name: "Free",
    price: "\u20b90",
    cadence: "forever",
    tagline: "Everything most students actually need before they land.",
    features: [
      "Corridor matching (city + uni + intake)",
      "Three-check verification",
      "Eight-to-twelve person groups",
      "Group DMs, prompt-scaffolded",
      "Pre-flight countdown timeline",
      "Women-only group opt-in",
      "One-tap report &amp; human review",
    ],
    accent: false,
  },
  {
    name: "Premium",
    price: "\u20b91,499",
    cadence: "one-time",
    tagline: "For the parent sitting next to you while you fill this out.",
    features: [
      "Everything in Free",
      "Read-only Parent view (itinerary, group size, airport arrival)",
      "Priority admit-letter human review",
      "Extended group preview before the DM unlock threshold",
      "Priority 24/7 human support",
      "Direct line to Trust &amp; Safety advisor",
    ],
    accent: true,
  },
];

export function PricingTiers() {
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="relative overflow-hidden border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-20 sm:py-24 md:py-32"
    >
      {/* A single faint primary wash behind the Premium card so the eye
          settles there without any explicit "recommended" badge. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(40% 50% at 72% 48%, color-mix(in srgb, var(--color-primary) 7%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="container-narrow relative">
        <div className="mx-auto max-w-[720px] text-center">
          <SectionLabel className="mx-auto">Pricing</SectionLabel>
          <motion.h2
            id="pricing-heading"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="mt-4 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(28px, 6vw, 64px)",
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            One price.{" "}
            <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-primary)]">
              One decision.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.08 }}
            className="mx-auto mt-4 max-w-[480px] text-[14.5px] leading-[1.6] text-[color:var(--color-fg-muted)] sm:text-[15.5px]"
          >
            Free does the job. Premium is for the parents. No subscriptions,
            no upsells, no surprise charges - ever.
          </motion.p>
        </div>

        <ul className="mx-auto mt-12 grid max-w-[960px] grid-cols-1 gap-4 sm:mt-14 md:grid-cols-2 md:gap-6">
          {TIERS.map((tier, i) => (
            <motion.li
              key={tier.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, ease: EASE, delay: 0.08 * i }}
              className={`relative flex flex-col rounded-[18px] border p-6 sm:p-8 ${
                tier.accent
                  ? "border-[color:var(--color-primary)]/40 bg-[color:var(--color-surface)]"
                  : "border-[color:var(--color-border)] bg-[color:var(--color-surface)]"
              }`}
              style={
                tier.accent
                  ? {
                      boxShadow:
                        "0 0 0 1px color-mix(in srgb, var(--color-primary) 18%, transparent), 0 24px 48px -24px color-mix(in srgb, var(--color-primary) 24%, transparent)",
                    }
                  : undefined
              }
            >
              <div className="flex items-baseline justify-between">
                <h3 className="font-heading text-[18px] font-semibold text-[color:var(--color-fg)] sm:text-[20px]">
                  {tier.name}
                </h3>
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
                  {tier.cadence}
                </p>
              </div>

              <p className="mt-4 flex items-baseline gap-1.5">
                <span
                  className="font-heading font-semibold text-[color:var(--color-fg)]"
                  style={{
                    fontSize: "clamp(40px, 6vw, 60px)",
                    lineHeight: 1,
                    letterSpacing: "-0.025em",
                  }}
                >
                  {tier.price}
                </span>
              </p>

              <p
                className="mt-3 text-[14px] leading-[1.55] text-[color:var(--color-fg-muted)] sm:text-[15px]"
                dangerouslySetInnerHTML={{ __html: tier.tagline }}
              />

              <ul className="mt-6 flex flex-col gap-2.5 border-t border-[color:var(--color-border)] pt-6">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                        tier.accent
                          ? "bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]"
                          : "bg-[color:color-mix(in_srgb,var(--color-primary)_18%,transparent)] text-[color:var(--color-primary)]"
                      }`}
                    >
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                    <span
                      className="text-[13.5px] leading-[1.5] text-[color:var(--color-fg-muted)] sm:text-[14px]"
                      dangerouslySetInnerHTML={{ __html: f }}
                    />
                  </li>
                ))}
              </ul>
            </motion.li>
          ))}
        </ul>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
          className="mx-auto mt-10 max-w-[520px] text-center font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)] sm:mt-12"
        >
          Less than one meal in your new city.
        </motion.p>
      </div>
    </section>
  );
}
