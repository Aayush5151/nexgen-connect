"use client";

import Link from "next/link";
import { motion } from "framer-motion";
// AppStoreBadge + PlayStoreBadge imports retired with the pre-launch
// CTA removal — see comment below the funnel button.
import { EmailWaitlistForm } from "@/components/landing/EmailWaitlistForm";

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

          {/* v16 web pivot — primary funnel CTA above the secondary
              store-badge cluster. The /signup funnel is the real way
              a verified user makes it through; store badges below
              keep their original "notify me when the app ships"
              behaviour for visitors who want that path. */}
          {/* v18 mobile-trim: this "Get started · 30 seconds" button
              previously sat below the email waitlist form and
              duplicated the hero CTA word-for-word. On mobile the
              effect was wordy ("two ways to start" feels like the
              site is hedging). The email form above IS the closing
              action — the small text-link below preserves the
              "funnel signup" path without competing with it. */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.42 }}
            className="mt-5 sm:mt-7"
          >
            <Link
              href="/signup"
              data-cta="final-secondary-signup"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[color:var(--color-fg-muted)] underline decoration-dotted underline-offset-4 transition-colors hover:text-[color:var(--color-fg)]"
            >
              Or sign up now in 30 seconds
              <span aria-hidden>→</span>
            </Link>
          </motion.div>

          {/* App Store + Play Store CTAs removed pre-launch. The
              apps don't exist yet; "Get notified for iOS / Android"
              promised something the user couldn't act on. The funnel
              CTA above is the single primary call. Re-add when the
              apps go live. */}
        </div>
      </div>
    </section>
  );
}
