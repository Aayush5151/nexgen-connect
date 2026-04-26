"use client";

import { motion } from "framer-motion";
import { AppStoreBadge } from "@/components/ui/AppStoreBadge";
import { PlayStoreBadge } from "@/components/ui/PlayStoreBadge";
import { EmailWaitlistForm } from "@/components/landing/EmailWaitlistForm";
import { MagneticButton } from "@/components/shared/MagneticButton";

/**
 * FinalCTA — the closing ask. Quiet, confident, one move to make.
 *
 * v17: stripped of the NOT-stack, the manifesto seals, the social
 * row, and the founder-quote rotation. The closing only needs to do
 * one thing — give the reader a clear way to act, and a brand line
 * worth remembering. Tagline → email → store badges. Done.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

export function FinalCTA() {
  return (
    <section className="relative flex min-h-[100dvh] items-center overflow-hidden py-20 sm:py-24">
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
            className="mt-6 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(48px, 7vw, 96px)",
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
            className="mt-6 max-w-[560px] text-balance text-[color:var(--color-fg-muted)]"
            style={{
              fontSize: "clamp(16px, 1.6vw, 19px)",
              lineHeight: 1.55,
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
            className="mt-10 w-full max-w-[420px]"
          >
            <EmailWaitlistForm
              referrer="final"
              submitLabel="Notify me on launch"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.48 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
          >
            <MagneticButton strength={6}>
              <AppStoreBadge size="md" />
            </MagneticButton>
            <MagneticButton strength={6}>
              <PlayStoreBadge size="md" />
            </MagneticButton>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
