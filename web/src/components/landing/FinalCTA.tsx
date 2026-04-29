"use client";

import { motion } from "framer-motion";
import { AppStoreBadge } from "@/components/ui/AppStoreBadge";
import { PlayStoreBadge } from "@/components/ui/PlayStoreBadge";
import { EmailWaitlistForm } from "@/components/landing/EmailWaitlistForm";
import { MagneticButton } from "@/components/shared/MagneticButton";

/**
 * FinalCTA, the closing ask. Quiet, confident, one move to make.
 *
 * v17: stripped of the NOT-stack, the manifesto seals, the social
 * row, and the founder-quote rotation. The closing only needs to do
 * one thing, give the reader a clear way to act, and a brand line
 * worth remembering. Tagline → email → store badges. Done.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

export function FinalCTA() {
  return (
    <section className="relative flex items-center overflow-hidden py-12 sm:py-20 md:min-h-[100dvh] md:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(50% 40% at 50% 35%, color-mix(in srgb, var(--color-primary) 12%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="container-narrow relative w-full">
        <div className="mx-auto flex max-w-[820px] flex-col items-center text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-fg-subtle)]"
          >
            Waitlist open · Launching 2026
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.12 }}
            className="mt-4 font-heading font-semibold text-balance text-[color:var(--color-fg)] sm:mt-6"
            style={{
              fontSize: "clamp(40px, 9vw, 96px)",
              lineHeight: 0.98,
              letterSpacing: "-0.035em",
            }}
          >
            You don&rsquo;t{" "}
            <span className="font-serif font-normal italic tracking-[-0.025em] text-[color:var(--color-primary)]">
              land alone.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.24 }}
            className="mt-3 max-w-[560px] text-balance text-[color:var(--color-fg-muted)] sm:mt-6"
            style={{
              fontSize: "clamp(13.5px, 1.6vw, 19px)",
              lineHeight: 1.5,
            }}
          >
            Drop your email and we&rsquo;ll send you the TestFlight
            build the moment your corridor opens. Ireland in September.
            Germany in October.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.36 }}
            className="mt-6 w-full max-w-[420px] sm:mt-10"
          >
            <EmailWaitlistForm
              referrer="final"
              submitLabel="Reserve my spot - free"
            />
          </motion.div>

          {/* CTAs match the Hero pattern: full-width 2-col grid on
              mobile (sm-size badges side-by-side), natural width
              centred row on sm+. */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.48 }}
            className="mt-5 grid w-full max-w-[420px] grid-cols-2 gap-2 sm:mt-8 sm:flex sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-4"
          >
            <div className="flex w-full sm:hidden [&>*]:w-full [&_a]:w-full [&_a]:justify-center">
              <MagneticButton strength={6}>
                <AppStoreBadge size="sm" />
              </MagneticButton>
            </div>
            <div className="flex w-full sm:hidden [&>*]:w-full [&_a]:w-full [&_a]:justify-center">
              <MagneticButton strength={6}>
                <PlayStoreBadge size="sm" />
              </MagneticButton>
            </div>
            <span className="hidden sm:inline-flex">
              <MagneticButton strength={6}>
                <AppStoreBadge size="md" />
              </MagneticButton>
            </span>
            <span className="hidden sm:inline-flex">
              <MagneticButton strength={6}>
                <PlayStoreBadge size="md" />
              </MagneticButton>
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
