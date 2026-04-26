"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

/**
 * PricingTiers — v20 editorial pricing.
 *
 * Previous version was a generic two-column type-only layout that
 * felt "minimal but empty" — no visual hierarchy, no character, no
 * differentiation between Free and Premium. Replaced with a proper
 * editorial split: two cards side by side, both confident, with
 * strong visual contrast so the eye knows immediately which one is
 * the upsell.
 *
 * FREE card: restrained, hairline border, ghost CTA, plain
 * everything. Reads as the substantive default tier — not a
 * crippled trial.
 *
 * PREMIUM card: primary-tinted border, subtle radial bloom from
 * top, "Most chosen" pill, ₹1,499 in primary green with the EUR
 * conversion as fine print, primary solid CTA. Reads as a
 * confident upgrade, not a desperate upsell.
 *
 * Both cards land in one frame on desktop. On mobile they stack —
 * Premium first because that's what most readers will bookmark
 * mentally, even if they start on Free.
 *
 * v10 alignment:
 *   Free (§5.1): corridor matching, three-check verification, group
 *   DMs at 60 unlock, uni subgroups, pre-flight countdown.
 *
 *   Premium (§5.2, ₹1,499 one-time, no renewal): priority match,
 *   group-apply PBSA tooling (3–6 student bundle), Parent view,
 *   30-min human call within 24h. EUR conversion uses the v10
 *   sources-list ECB rate (INR 110.39/EUR, 24 April 2026).
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

const FREE_FEATURES = [
  "Corridor matching · home city × destination × month",
  "Three-check verification on every member",
  "Group DMs unlock when 60 verified students share your corridor",
  "Auto-formed intro circles + uni subgroups at 20+ verified",
  "Pre-flight countdown and women-only opt-in",
];

const PREMIUM_FEATURES = [
  "Priority match — first seat the moment your corridor unlocks",
  "Group-apply housing — 3–6 students into one PBSA application",
  "Read-only Parent view — group size, verification, arrival time",
  "30-minute human call within 24 hours, any question",
];

function scrollToWaitlist() {
  if (typeof window === "undefined") return;
  document
    .getElementById("download")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function PricingTiers() {
  return (
    <section
      aria-labelledby="pricing-heading"
      className="relative flex min-h-[100dvh] items-center bg-[color:var(--color-bg)] py-16 sm:py-20"
    >
      <div className="container-narrow w-full">
        <div className="mx-auto max-w-[1200px]">
          {/* Header */}
          <div className="mx-auto max-w-[860px] text-center">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="inline-flex items-center gap-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-primary)] sm:text-[11px]"
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)]"
              />
              Pricing
            </motion.p>

            <motion.h2
              id="pricing-heading"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
              className="mt-6 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
              style={{
                fontSize: "clamp(34px, 5.2vw, 60px)",
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
              }}
            >
              Free for everyone.{" "}
              <span className="font-serif font-normal italic tracking-[-0.02em] text-[color:var(--color-primary)]">
                Premium if you want more.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.55, ease: EASE, delay: 0.2 }}
              className="mt-5 max-w-[600px] mx-auto text-balance text-[color:var(--color-fg-muted)]"
              style={{
                fontSize: "clamp(14.5px, 1.4vw, 17px)",
                lineHeight: 1.55,
              }}
            >
              PBSA operators pay us referral fees. Students never pay to find
              their people.
            </motion.p>
          </div>

          {/* Two-card split */}
          <div className="mt-12 grid grid-cols-1 gap-4 sm:mt-14 md:grid-cols-2 md:gap-5 lg:gap-6">
            {/* FREE — restrained, ghost everything */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="relative flex flex-col rounded-[20px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-7 transition-colors hover:border-[color:var(--color-border-strong)] sm:p-8"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-fg-subtle)]">
                  Free · Forever
                </span>
                <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--color-fg-subtle)]">
                  Always
                </span>
              </div>

              <p className="mt-8 flex items-baseline gap-2">
                <span
                  className="font-heading font-semibold tabular-nums text-[color:var(--color-fg)]"
                  style={{
                    fontSize: "clamp(56px, 7vw, 96px)",
                    lineHeight: 0.9,
                    letterSpacing: "-0.045em",
                  }}
                >
                  ₹0
                </span>
              </p>

              <p
                className="mt-4 max-w-[420px] font-serif italic tracking-[-0.01em] text-[color:var(--color-fg-muted)]"
                style={{
                  fontSize: "clamp(15px, 1.4vw, 18px)",
                  lineHeight: 1.4,
                }}
              >
                Everything most students actually need before they land.
              </p>

              <div
                aria-hidden="true"
                className="mt-7 h-px w-full bg-[color:var(--color-border)]"
              />

              <ul className="mt-6 flex flex-col gap-3.5">
                {FREE_FEATURES.map((f) => (
                  <FeatureRow key={f}>{f}</FeatureRow>
                ))}
              </ul>

              <div className="flex-1" aria-hidden="true" />

              <button
                type="button"
                onClick={scrollToWaitlist}
                className="mt-8 inline-flex h-12 items-center justify-center rounded-[10px] border border-[color:var(--color-border-strong)] px-5 text-[13.5px] font-semibold text-[color:var(--color-fg)] transition-[border-color,background-color] hover:border-[color:var(--color-primary)]/55 hover:bg-[color:var(--color-surface-elevated)]"
              >
                Start free
              </button>

              <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-fg-subtle)]">
                Available to every Indian student
              </p>
            </motion.div>

            {/* PREMIUM — primary-tinted, "most chosen" pill, elevated */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.08 }}
              className="relative flex flex-col overflow-hidden rounded-[20px] border border-[color:var(--color-primary)]/45 bg-[color:var(--color-surface)] p-7 transition-colors hover:border-[color:var(--color-primary)]/65 sm:p-8"
              style={{
                boxShadow:
                  "0 0 0 1px color-mix(in srgb, var(--color-primary) 18%, transparent), 0 32px 64px -32px color-mix(in srgb, var(--color-primary) 30%, transparent), inset 0 1px 0 color-mix(in srgb, var(--color-primary) 22%, transparent)",
              }}
            >
              {/* Subtle top-half primary bloom */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-44"
                style={{
                  background:
                    "radial-gradient(70% 100% at 50% 0%, color-mix(in srgb, var(--color-primary) 9%, transparent) 0%, transparent 80%)",
                }}
              />

              <div className="relative flex items-center justify-between">
                <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-primary)]">
                  Premium · One-time
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-primary)]/45 bg-[color:color-mix(in_srgb,var(--color-primary)_12%,transparent)] px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-primary)]">
                  <span
                    aria-hidden="true"
                    className="h-1 w-1 rounded-full bg-[color:var(--color-primary)]"
                  />
                  Most chosen
                </span>
              </div>

              <p className="relative mt-8 flex items-baseline gap-3">
                <span
                  className="font-heading font-semibold tabular-nums text-[color:var(--color-primary)]"
                  style={{
                    fontSize: "clamp(56px, 7vw, 96px)",
                    lineHeight: 0.9,
                    letterSpacing: "-0.045em",
                  }}
                >
                  ₹1,499
                </span>
                <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--color-fg-muted)]">
                  ≈ €13.60
                </span>
              </p>

              <p
                className="relative mt-4 max-w-[460px] font-serif italic tracking-[-0.01em] text-[color:var(--color-fg-muted)]"
                style={{
                  fontSize: "clamp(15px, 1.4vw, 18px)",
                  lineHeight: 1.4,
                }}
              >
                For students who want to{" "}
                <span className="text-[color:var(--color-fg)]">
                  land together.
                </span>
              </p>

              <div
                aria-hidden="true"
                className="relative mt-7 h-px w-full bg-[color:var(--color-primary)]/25"
              />

              <ul className="relative mt-6 flex flex-col gap-3.5">
                <FeatureRow muted={false} primary>
                  Everything in Free
                </FeatureRow>
                {PREMIUM_FEATURES.map((f) => (
                  <FeatureRow key={f} primary>
                    {f}
                  </FeatureRow>
                ))}
              </ul>

              <div className="relative flex-1" aria-hidden="true" />

              <button
                type="button"
                onClick={scrollToWaitlist}
                className="relative mt-8 inline-flex h-12 items-center justify-center rounded-[10px] bg-[color:var(--color-primary)] px-5 text-[13.5px] font-semibold text-[color:var(--color-primary-fg)] transition-[background-color,transform] hover:bg-[color:var(--color-primary-hover)] active:scale-[0.985]"
              >
                Unlock at launch
              </button>

              <p className="relative mt-4 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-primary)]">
                Less than one meal in Dublin
              </p>
            </motion.div>
          </div>

          {/* Trust strip — both tiers */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.25 }}
            className="mx-auto mt-10 flex max-w-[860px] flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:mt-12"
          >
            {[
              "No subscription",
              "No auto-renew",
              "No ads",
              "No data sale",
              "Full data deletion on request",
            ].map((item) => (
              <p
                key={item}
                className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-muted)] sm:text-[10.5px]"
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
      </div>
    </section>
  );
}

function FeatureRow({
  children,
  primary = false,
  muted = false,
}: {
  children: React.ReactNode;
  primary?: boolean;
  muted?: boolean;
}) {
  return (
    <li className="flex items-start gap-3">
      <span
        aria-hidden="true"
        className={`mt-[3px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ${
          primary
            ? "bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]"
            : "bg-[color:color-mix(in_srgb,var(--color-primary)_14%,transparent)] text-[color:var(--color-primary)]"
        }`}
      >
        <Check className="h-2.5 w-2.5" strokeWidth={3.2} />
      </span>
      <span
        className={`text-[13.5px] leading-[1.5] sm:text-[14.5px] ${
          muted
            ? "text-[color:var(--color-fg-muted)]"
            : "text-[color:var(--color-fg)]"
        }`}
      >
        {children}
      </span>
    </li>
  );
}
