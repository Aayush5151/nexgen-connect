"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * PricingTiers. Two-tier pricing: a Free tier that already does what
 * most students need, and a Premium one-time \u20b91,499 unlock that adds
 * parent peace-of-mind, priority review, and extended preview.
 *
 * v5 visual brief: more premium, less DIY. The previous card was the
 * default "two-card grid, checkmarks, radial gradient behind it" that
 * any starter kit ships with. This pass adds:
 *   - A skewed inner border + soft glow on the Premium card so it
 *     reads as a distinct object, not a color-tinted twin.
 *   - A subtle conic-gradient ring around Premium that feels metallic
 *     rather than highlighter-green.
 *   - Tier names sit in a pill, price uses mixed-weight display.
 *   - A compact "Both include" trust strip at the bottom.
 *   - Anchor line: "Less than one meal in Dublin" - more concrete.
 *
 * v4 business rules still hold:
 *   - No subscription. No monthly. One-time payment, unlocked forever.
 *   - Free is not a trial. Core matching, verification, DMs, and the
 *     pre-flight countdown live in Free and stay there.
 *   - Premium is explicitly parent-facing.
 *   - No separate Parent / Family plan.
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
      "Corridor matching &mdash; city, uni, and intake month",
      "Three-check verification (phone, DigiLocker, admit)",
      "Eight-to-twelve person verified groups",
      "Prompt-scaffolded group DMs",
      "180-day pre-flight countdown timeline",
      "Women-only group opt-in",
      "One-tap report &amp; human review",
    ],
    accent: false,
  },
  {
    name: "Premium",
    price: "\u20b91,499",
    cadence: "one-time, no renewal",
    tagline:
      "For the parent sitting next to you while you fill this out. Unlock it once, it stays unlocked.",
    features: [
      "Everything in Free",
      "Read-only Parent view &mdash; itinerary, group size, arrival time",
      "Priority human review on your admit letter",
      "Extended group preview before the 60-user DM threshold",
      "Priority 24/7 human support",
      "Direct line to a Trust &amp; Safety advisor",
    ],
    accent: true,
  },
];

const BOTH_INCLUDE = [
  "No subscription",
  "No auto-renewal",
  "No surprise charges",
  "Full data deletion in 1 hour",
];

export function PricingTiers() {
  return (
    <section
      aria-labelledby="pricing-heading"
      className="relative overflow-hidden border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-10 sm:py-12 md:py-16"
    >
      {/* Ambient primary wash behind the Premium card. Wider and softer
          than v4, so the section feels lit rather than stamped. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(45% 55% at 72% 46%, color-mix(in srgb, var(--color-primary) 11%, transparent) 0%, transparent 72%), radial-gradient(35% 45% at 28% 55%, color-mix(in srgb, var(--color-primary) 4%, transparent) 0%, transparent 68%)",
        }}
      />

      <div className="container-narrow relative">
        <div className="mx-auto max-w-[760px] text-center">
          <SectionLabel className="mx-auto">Pricing</SectionLabel>
          <motion.h2
            id="pricing-heading"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="mt-3 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(26px, 5vw, 54px)",
              lineHeight: 0.98,
              letterSpacing: "-0.035em",
            }}
          >
            Free does the job.{" "}
            <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-primary)]">
              Premium does the parents.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.08 }}
            className="mx-auto mt-3 max-w-[520px] text-[14px] leading-[1.55] text-[color:var(--color-fg-muted)] sm:text-[15px]"
          >
            One price. One decision. No monthly, no renewal, no surprise
            charge six months in. You see the bill before you&apos;re billed.
          </motion.p>
        </div>

        <ul className="relative mx-auto mt-8 grid max-w-[1040px] grid-cols-1 gap-4 md:mt-10 md:grid-cols-2 md:gap-6">
          {TIERS.map((tier, i) => (
            <motion.li
              key={tier.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.08 * i }}
              className="relative"
            >
              {/* Outer conic-gradient ring - metallic, not candy - only
                  on the Premium card. Sits behind the card via a 1px
                  offset so the edge reads as a sharp ring rather than
                  a fill. */}
              {tier.accent && (
                <div
                  aria-hidden="true"
                  className="absolute -inset-px rounded-[20px]"
                  style={{
                    background:
                      "conic-gradient(from 120deg, color-mix(in srgb, var(--color-primary) 55%, transparent) 0deg, transparent 90deg, transparent 180deg, color-mix(in srgb, var(--color-primary) 35%, transparent) 230deg, transparent 320deg)",
                  }}
                />
              )}

              <div
                className={`relative flex h-full flex-col overflow-hidden rounded-[19px] border p-5 sm:p-6 ${
                  tier.accent
                    ? "border-[color:var(--color-primary)]/55 bg-[color:color-mix(in_srgb,var(--color-surface)_85%,black)]"
                    : "border-[color:var(--color-border)] bg-[color:var(--color-surface)]"
                }`}
                style={
                  tier.accent
                    ? {
                        boxShadow:
                          "0 0 0 1px color-mix(in srgb, var(--color-primary) 18%, transparent), 0 32px 64px -32px color-mix(in srgb, var(--color-primary) 30%, transparent), inset 0 1px 0 color-mix(in srgb, var(--color-primary) 22%, transparent)",
                      }
                    : undefined
                }
              >
                {/* Soft specular highlight on the Premium card */}
                {tier.accent && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-40"
                    style={{
                      background:
                        "radial-gradient(70% 100% at 50% 0%, color-mix(in srgb, var(--color-primary) 9%, transparent) 0%, transparent 80%)",
                    }}
                  />
                )}

                {/* Header row: tier chip + "recommended" for Premium */}
                <div className="relative flex items-start justify-between gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] ${
                      tier.accent
                        ? "bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]"
                        : "border border-[color:var(--color-border-strong)] text-[color:var(--color-fg-muted)]"
                    }`}
                  >
                    {tier.accent && (
                      <Sparkles
                        className="h-3 w-3"
                        strokeWidth={2.5}
                        aria-hidden="true"
                      />
                    )}
                    {tier.name}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
                    {tier.cadence}
                  </span>
                </div>

                {/* Price - bigger, mixed-weight, with &middot; and "INR" so
                    the number doesn't feel monolithic */}
                <p className="relative mt-5 flex items-baseline gap-2">
                  <span
                    className="font-heading font-semibold leading-none text-[color:var(--color-fg)]"
                    style={{
                      fontSize: "clamp(40px, 5.5vw, 60px)",
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {tier.price}
                  </span>
                  {tier.accent ? (
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
                      INR &middot; once
                    </span>
                  ) : (
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
                      Always
                    </span>
                  )}
                </p>

                <p
                  className="relative mt-3 max-w-[440px] text-[13.5px] leading-[1.55] text-[color:var(--color-fg-muted)] sm:text-[14.5px]"
                  dangerouslySetInnerHTML={{ __html: tier.tagline }}
                />

                <div
                  aria-hidden="true"
                  className="relative mt-5 h-px w-full bg-[color:var(--color-border)]"
                />

                <ul className="relative mt-4 flex flex-col gap-2.5">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className={`mt-[3px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ${
                          tier.accent
                            ? "bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]"
                            : "bg-[color:color-mix(in_srgb,var(--color-primary)_16%,transparent)] text-[color:var(--color-primary)]"
                        }`}
                      >
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      </span>
                      <span
                        className="text-[14px] leading-[1.5] text-[color:var(--color-fg-muted)] sm:text-[14.5px]"
                        dangerouslySetInnerHTML={{ __html: f }}
                      />
                    </li>
                  ))}
                </ul>

                {/* Card footer - the anchor line that makes the price feel
                    small. Different per tier. */}
                <p
                  className={`relative mt-6 font-mono text-[10.5px] uppercase tracking-[0.12em] ${
                    tier.accent
                      ? "text-[color:var(--color-primary)]"
                      : "text-[color:var(--color-fg-subtle)]"
                  }`}
                >
                  {tier.accent
                    ? "Less than one meal in Dublin"
                    : "Always free. For every student."}
                </p>
              </div>
            </motion.li>
          ))}
        </ul>

        {/* Trust strip - both tiers inherit these guarantees */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.55, ease: EASE, delay: 0.25 }}
          className="mx-auto mt-6 flex max-w-[760px] flex-wrap items-center justify-center gap-x-6 gap-y-3 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 py-3 sm:mt-8"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
            Both tiers include
          </p>
          {BOTH_INCLUDE.map((item) => (
            <p
              key={item}
              className="flex items-center gap-1.5 text-[12px] text-[color:var(--color-fg-muted)]"
            >
              <span
                aria-hidden="true"
                className="h-1 w-1 rounded-full bg-[color:var(--color-primary)]"
              />
              {item}
            </p>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
