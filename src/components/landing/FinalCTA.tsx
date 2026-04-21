"use client";

import { motion } from "framer-motion";
import { AppStoreBadge } from "@/components/ui/AppStoreBadge";
import { PlayStoreBadge } from "@/components/ui/PlayStoreBadge";
import { SocialChips } from "@/components/ui/SocialChips";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { EmailWaitlistForm } from "@/components/landing/EmailWaitlistForm";
import { MagneticButton } from "@/components/shared/MagneticButton";

/**
 * FinalCTA. The closing screen of the marketing site. A single, quiet
 * "download the app" page - big typographic close, dual store badges,
 * an email waitlist for pre-launch visitors, and the social row.
 *
 * No counters, no countdowns, no scarcity theatre. The product itself
 * is the scarcity - one group per corridor, verified only.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

export function FinalCTA() {
  return (
    <section
      id="download"
      className="relative overflow-hidden border-t border-[color:var(--color-border)] py-20 sm:py-24 md:py-40"
    >
      {/* Ambient glow - a single soft primary bloom behind the headline. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 40% at 50% 30%, color-mix(in srgb, var(--color-primary) 10%, transparent) 0%, transparent 65%)",
        }}
      />

      <div className="container-narrow relative">
        <div className="mx-auto max-w-[820px] text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <SectionLabel className="mx-auto">The app · Coming soon</SectionLabel>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.06 }}
            className="mt-6 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(34px, 9vw, 100px)",
              lineHeight: 1,
              letterSpacing: "-0.035em",
            }}
          >
            Your people are{" "}
            <span className="font-serif font-normal italic tracking-[-0.02em] text-[color:var(--color-primary)]">
              already packing.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.14 }}
            className="mx-auto mt-6 max-w-[520px] text-[15px] leading-[1.55] text-[color:var(--color-fg-muted)] sm:mt-8 sm:text-[17px] md:text-[18px]"
          >
            The app ships to the App Store and Play Store before the first
            September 2026 flights take off. Download it the moment it&apos;s
            live.
          </motion.p>

          {/* Store badges */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.22 }}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:mt-12 sm:flex-row sm:gap-4"
          >
            <MagneticButton strength={6}>
              <AppStoreBadge size="md" />
            </MagneticButton>
            <MagneticButton strength={6}>
              <PlayStoreBadge size="md" />
            </MagneticButton>
          </motion.div>

          {/* Waitlist */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
            className="mt-10 sm:mt-14"
          >
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
              Or leave your email. We&apos;ll ping you the moment it launches.
            </p>
            <div className="mx-auto w-full max-w-[420px]">
              <EmailWaitlistForm referrer="final" />
            </div>
          </motion.div>

          {/* Soft divider */}
          <div
            aria-hidden="true"
            className="mx-auto mt-16 h-px w-24 bg-[color:var(--color-border)] sm:mt-20"
          />

          {/* Social row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.38 }}
            className="mt-8 sm:mt-10"
          >
            <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
              Follow the build
            </p>
            <SocialChips className="justify-center" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
