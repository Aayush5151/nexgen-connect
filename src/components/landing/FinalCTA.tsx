"use client";

import { motion } from "framer-motion";
import { AppStoreBadge } from "@/components/ui/AppStoreBadge";
import { PlayStoreBadge } from "@/components/ui/PlayStoreBadge";
import { SocialChips } from "@/components/ui/SocialChips";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { EmailWaitlistForm } from "@/components/landing/EmailWaitlistForm";
import { MagneticButton } from "@/components/shared/MagneticButton";

/**
 * FinalCTA. The closing screen. A single, quiet "download the app"
 * moment - big typographic close, store badges, a pre-launch email
 * waitlist, and the social row.
 *
 * v10 editorial pass: the previous AirportMoment typewriter scene was
 * redundant with the Hero's emotional anchor ("You don't land alone")
 * and delayed the actual CTA for three typed lines. Stripped to a clean
 * single screen.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden border-t border-[color:var(--color-border)] py-10 sm:py-12 md:py-16">
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
            <SectionLabel className="mx-auto">
              Waitlist open &middot; Launching Sept 2026
            </SectionLabel>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.06 }}
            className="mt-3 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(26px, 5.5vw, 58px)",
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
            className="mx-auto mt-3 max-w-[520px] text-[14px] leading-[1.55] text-[color:var(--color-fg-muted)] sm:text-[15px]"
          >
            Ireland in September. Germany in October. We&rsquo;ll ping you the
            moment the app is live on the store.
          </motion.p>

          {/* Primary CTA: email waitlist */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.22 }}
            className="mt-5 sm:mt-6"
          >
            <div className="mx-auto w-full max-w-[420px]">
              <EmailWaitlistForm
                referrer="final"
                submitLabel="Notify me on launch"
              />
            </div>
          </motion.div>

          {/* Store badges - secondary, shown as a visual promise */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
            className="mt-5 flex flex-col items-center justify-center gap-3 sm:mt-6 sm:flex-row sm:gap-4"
          >
            <MagneticButton strength={6}>
              <AppStoreBadge size="md" />
            </MagneticButton>
            <MagneticButton strength={6}>
              <PlayStoreBadge size="md" />
            </MagneticButton>
          </motion.div>

          {/* Soft divider */}
          <div
            aria-hidden="true"
            className="mx-auto mt-8 h-px w-24 bg-[color:var(--color-border)]"
          />

          {/* Social row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.38 }}
            className="mt-6"
          >
            <p className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
              Follow the build
            </p>
            <SocialChips className="justify-center" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
