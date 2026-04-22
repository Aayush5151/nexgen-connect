"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * PricingTiers. Two-tier pricing: a Free tier that already does what
 * most students need, and a Premium one-time \u20b91,499 unlock that adds
 * three named pillars \u2014 priority matching, first-week apartment
 * coordination, and a read-only Parent view.
 *
 * v6 business rules (rebalanced Premium):
 *   - No subscription. No monthly. One-time payment, unlocked forever.
 *   - Free is not a trial. Core matching, verification, DMs, and the
 *     pre-flight countdown live in Free and stay there.
 *   - Premium = three pillars: priority match, apartment-together
 *     tooling, parent peace-of-mind. The parent view is one of three,
 *     not the whole tier.
 *   - No separate Parent / Family plan.
 *   - Apartment tooling is listings-partner + group-apply layer, not
 *     a marketplace we operate. Honest scope.
 *
 * v5 visual brief carried forward: skewed inner border + soft glow on
 * Premium, conic-gradient ring, pill tier-names, mixed-weight price,
 * "Both include" trust strip, "Less than one meal in Dublin" anchor.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

type Tier = {
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  features: string[];
  accent: boolean;
  ctaLabel: string;
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
    ctaLabel: "Start free \u2014 join waitlist",
  },
  {
    name: "Premium",
    price: "\u20b91,499",
    cadence: "one-time, no renewal",
    tagline:
      "Priority match, apartment together, peace of mind for the people at home. One unlock, no renewal.",
    features: [
      "Everything in Free",
      "Priority matching &mdash; enter the pool 4 months before intake, not 6 weeks",
      "Group-apply apartment tooling &mdash; shared shortlist, lease-readiness checklist, co-signer coordination",
      "Alumni Handover Board &mdash; leases passed down from last year&rsquo;s verified cohort",
      "Read-only Parent view &mdash; itinerary, group size, arrival time",
      "Priority 24/7 support &amp; direct line to a Trust &amp; Safety advisor",
    ],
    accent: true,
    ctaLabel: "Unlock Premium at launch",
  },
];

function scrollToWaitlist() {
  if (typeof window === "undefined") return;
  const el = document.getElementById("download");
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
}

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
            Free gets you the group.{" "}
            <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-primary)]">
              Premium lands you together.
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

        <ul className="relative mx-auto mt-6 grid max-w-[1040px] grid-cols-1 items-stretch gap-4 md:mt-8 md:grid-cols-2 md:gap-5">
          {TIERS.map((tier, i) => (
            <motion.li
              key={tier.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.08 * i }}
              className="relative flex"
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
                className={`relative flex h-full w-full flex-col overflow-hidden rounded-[19px] border p-4 sm:p-5 ${
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
                <p className="relative mt-4 flex items-baseline gap-2">
                  <span
                    className="font-heading font-semibold leading-none text-[color:var(--color-fg)]"
                    style={{
                      fontSize: "clamp(34px, 4.5vw, 52px)",
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
                  className="relative mt-2 max-w-[440px] text-[13px] leading-[1.5] text-[color:var(--color-fg-muted)] sm:text-[13.5px]"
                  dangerouslySetInnerHTML={{ __html: tier.tagline }}
                />

                <div
                  aria-hidden="true"
                  className="relative mt-4 h-px w-full bg-[color:var(--color-border)]"
                />

                <ul className="relative mt-3 flex flex-col gap-2">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <span
                        aria-hidden="true"
                        className={`mt-[2px] flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full ${
                          tier.accent
                            ? "bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]"
                            : "bg-[color:color-mix(in_srgb,var(--color-primary)_16%,transparent)] text-[color:var(--color-primary)]"
                        }`}
                      >
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      </span>
                      <span
                        className="text-[13px] leading-[1.45] text-[color:var(--color-fg-muted)] sm:text-[13.5px]"
                        dangerouslySetInnerHTML={{ __html: f }}
                      />
                    </li>
                  ))}
                </ul>

                {/* Spacer pushes the footer to the bottom so card heights
                    stay aligned even when feature lists differ. */}
                <div className="flex-1" aria-hidden="true" />

                {/* Per-tier CTA. Pre-launch this scrolls to the waitlist
                    in the FinalCTA section. Once the app ships, swap this
                    for a real store link + account unlock path. */}
                <button
                  type="button"
                  onClick={scrollToWaitlist}
                  className={`relative mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[10px] text-[13.5px] font-semibold transition-[background-color,transform,border-color] duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg)] active:translate-y-[1px] ${
                    tier.accent
                      ? "bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)] hover:bg-[color:var(--color-primary-hover)]"
                      : "border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] text-[color:var(--color-fg)] hover:border-[color:var(--color-primary)]/55 hover:bg-[color:var(--color-surface-elevated)]"
                  }`}
                >
                  {tier.ctaLabel}
                </button>

                {/* Card footer - the anchor line that makes the price feel
                    small. Different per tier. */}
                <p
                  className={`relative mt-3 text-center font-mono text-[10px] uppercase tracking-[0.12em] ${
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
          className="mx-auto mt-5 flex max-w-[760px] flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-2.5 sm:mt-6"
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
