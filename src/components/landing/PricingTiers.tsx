"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

/**
 * PricingTiers, v21 tight pricing.
 *
 * Previous v20 still ran past one viewport because every feature
 * carried a long explanation after an em dash, which wrapped to two
 * or three lines per row. Replaced with one short label per row,
 * no explanations. The labels are the v10 mechanic; readers who
 * want detail click the tier to expand the FAQ or hit /how.
 *
 * Body copy on each tier reduced to a single sentence. Section
 * padding reduced. Cards are click-through to the waitlist as a
 * whole, not just via the button, more clickable target.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

const FREE_FEATURES = [
  "Corridor matching",
  "Three-check verification",
  "Group DMs at 60 verified",
  "Uni subgroups at 20+",
  "Pre-flight countdown",
];

const PREMIUM_FEATURES = [
  "Everything in Free",
  "Priority match",
  "Group-apply housing",
  "Read-only Parent view",
  "30-min human call, 24h",
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
      className="relative flex min-h-[100dvh] items-center bg-[color:var(--color-bg)] py-12 sm:py-16"
    >
      <div className="container-narrow w-full">
        <div className="mx-auto max-w-[1200px]">
          {/* Header, tight, one-line subhead */}
          <div className="mx-auto max-w-[780px] text-center">
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
              className="mt-5 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
              style={{
                fontSize: "clamp(30px, 4.6vw, 52px)",
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
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.18 }}
              className="mt-4 text-[14.5px] leading-[1.5] text-[color:var(--color-fg-muted)] sm:text-[15px]"
            >
              Operators pay us. Students never pay to find their people.
            </motion.p>
          </div>

          {/* Two-card split */}
          <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 md:grid-cols-2 md:gap-5 lg:gap-6">
            {/* FREE, restrained, whole card clickable */}
            <motion.button
              type="button"
              onClick={scrollToWaitlist}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="group relative flex flex-col rounded-[20px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 text-left transition-[border-color,transform] duration-300 ease-out hover:-translate-y-0.5 hover:border-[color:var(--color-border-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] sm:p-7"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-fg-subtle)]">
                  Free
                </span>
                <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--color-fg-subtle)]">
                  Forever
                </span>
              </div>

              <p className="mt-6 flex items-baseline gap-2">
                <span
                  className="font-heading font-semibold tabular-nums text-[color:var(--color-fg)]"
                  style={{
                    fontSize: "clamp(48px, 6vw, 80px)",
                    lineHeight: 0.9,
                    letterSpacing: "-0.045em",
                  }}
                >
                  ₹0
                </span>
              </p>

              <p
                className="mt-3 font-serif italic tracking-[-0.01em] text-[color:var(--color-fg-muted)]"
                style={{
                  fontSize: "clamp(14px, 1.3vw, 16px)",
                  lineHeight: 1.45,
                }}
              >
                Everything you need before you land.
              </p>

              <div
                aria-hidden="true"
                className="mt-5 h-px w-full bg-[color:var(--color-border)]"
              />

              <ul className="mt-5 flex flex-col gap-2.5">
                {FREE_FEATURES.map((f) => (
                  <FeatureRow key={f}>{f}</FeatureRow>
                ))}
              </ul>

              <div className="flex-1" aria-hidden="true" />

              <span className="mt-6 inline-flex h-11 items-center justify-center rounded-[10px] border border-[color:var(--color-border-strong)] px-5 text-[13px] font-semibold text-[color:var(--color-fg)] transition-colors group-hover:border-[color:var(--color-primary)]/55 group-hover:bg-[color:var(--color-surface-elevated)]">
                Start free
              </span>
            </motion.button>

            {/* PREMIUM, primary-tinted, whole card clickable */}
            <motion.button
              type="button"
              onClick={scrollToWaitlist}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.08 }}
              className="group relative flex flex-col overflow-hidden rounded-[20px] border border-[color:var(--color-primary)]/45 bg-[color:var(--color-surface)] p-6 text-left transition-[border-color,transform] duration-300 ease-out hover:-translate-y-0.5 hover:border-[color:var(--color-primary)]/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] sm:p-7"
              style={{
                boxShadow:
                  "0 0 0 1px color-mix(in srgb, var(--color-primary) 18%, transparent), 0 32px 64px -32px color-mix(in srgb, var(--color-primary) 30%, transparent), inset 0 1px 0 color-mix(in srgb, var(--color-primary) 22%, transparent)",
              }}
            >
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
                  Premium
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-primary)]/45 bg-[color:color-mix(in_srgb,var(--color-primary)_12%,transparent)] px-2 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-primary)]">
                  <span
                    aria-hidden="true"
                    className="h-1 w-1 rounded-full bg-[color:var(--color-primary)]"
                  />
                  Most chosen
                </span>
              </div>

              <p className="relative mt-6 flex items-baseline gap-2.5">
                <span
                  className="font-heading font-semibold tabular-nums text-[color:var(--color-primary)]"
                  style={{
                    fontSize: "clamp(48px, 6vw, 80px)",
                    lineHeight: 0.9,
                    letterSpacing: "-0.045em",
                  }}
                >
                  ₹1,499
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-fg-muted)]">
                  ≈ €13.60
                </span>
              </p>

              <p
                className="relative mt-3 font-serif italic tracking-[-0.01em] text-[color:var(--color-fg-muted)]"
                style={{
                  fontSize: "clamp(14px, 1.3vw, 16px)",
                  lineHeight: 1.45,
                }}
              >
                For students who want to{" "}
                <span className="text-[color:var(--color-fg)]">
                  land together.
                </span>
              </p>

              <div
                aria-hidden="true"
                className="relative mt-5 h-px w-full bg-[color:var(--color-primary)]/25"
              />

              <ul className="relative mt-5 flex flex-col gap-2.5">
                {PREMIUM_FEATURES.map((f, i) => (
                  <FeatureRow key={f} primary={i > 0}>
                    {f}
                  </FeatureRow>
                ))}
              </ul>

              <div className="relative flex-1" aria-hidden="true" />

              <span className="relative mt-6 inline-flex h-11 items-center justify-center rounded-[10px] bg-[color:var(--color-primary)] px-5 text-[13px] font-semibold text-[color:var(--color-primary-fg)] transition-[background-color] group-hover:bg-[color:var(--color-primary-hover)]">
                Unlock at launch
              </span>
            </motion.button>
          </div>

          {/* Trust strip, both tiers */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.25 }}
            className="mx-auto mt-8 flex max-w-[860px] flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:mt-10"
          >
            {[
              "No subscription",
              "No auto-renew",
              "No ads",
              "No data sale",
              "Delete on request",
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
}: {
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <li className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className={`flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full ${
          primary
            ? "bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]"
            : "bg-[color:color-mix(in_srgb,var(--color-primary)_14%,transparent)] text-[color:var(--color-primary)]"
        }`}
      >
        <Check className="h-[9px] w-[9px]" strokeWidth={3.4} />
      </span>
      <span className="text-[13.5px] leading-[1.4] text-[color:var(--color-fg)] sm:text-[14px]">
        {children}
      </span>
    </li>
  );
}
