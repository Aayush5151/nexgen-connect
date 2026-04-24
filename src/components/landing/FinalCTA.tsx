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
 * v12.1 v9 alignment: the v9 business plan explicitly expects two
 * brand taglines on the site - the functional "Find your people
 * before you land" and the emotional "You don't land alone." The
 * Hero carries the functional tagline verbatim as its H1. This
 * closer now carries the emotional tagline as the H2 so the pair
 * bookends the page exactly as v9 Section 0 describes (see v9.1
 * alignment doc in the repo root for the full diff).
 *
 * v13 pass - three additions that turn the closer from "one more
 * CTA" into a genuine typographic manifesto moment:
 *   - NOT stack: a three-line serif-italic prelude above the tagline
 *     that names the three things NexGen is not (another group chat,
 *     another agent funnel, another gamble). Rhymes with Claude
 *     Design's Manifesto section but compresses it into three lines
 *     rather than a full section.
 *   - Supporting copy is restructured from one run-on paragraph into
 *     a three-voice typographic stack: serif kicker ("Your people
 *     are already packing."), sans detail ("Ireland in September.
 *     Germany in October."), mono sign-off ("We'll ping you the
 *     moment the app is live.") so the section carries the same
 *     three-register type hierarchy as the rest of the site.
 *   - A thin primary seal bar between the NOT stack and the tagline
 *     is the visual pivot from negation into the emotional promise.
 *
 * Everything else - email form, store badges, social row - is
 * unchanged.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

const NOT_LINES = [
  "Not another group chat.",
  "Not another agent funnel.",
  "Not another gamble.",
];

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

          {/* NOT stack - three serif italic negations that compress
              everything the reader has learned over twelve sections
              into three lines, then pivot into the tagline. Reads as
              the brand's closing credo. */}
          <ol className="mx-auto mt-6 flex flex-col items-center gap-1.5 sm:mt-7 sm:gap-2">
            {NOT_LINES.map((line, i) => (
              <motion.li
                key={line}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{
                  duration: 0.55,
                  ease: EASE,
                  delay: 0.06 + i * 0.08,
                }}
                className="font-serif italic tracking-[-0.015em] text-[color:var(--color-fg-muted)]"
                style={{
                  fontSize: "clamp(15px, 2.1vw, 20px)",
                  lineHeight: 1.25,
                }}
              >
                {line}
              </motion.li>
            ))}
          </ol>

          {/* Thin primary seal bar - the visual pivot from negation
              into the emotional promise. */}
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.32 }}
            className="mx-auto mt-6 h-px w-16 origin-center bg-[color:var(--color-primary)] sm:mt-7"
          />

          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.4 }}
            className="mt-5 font-heading font-semibold text-balance text-[color:var(--color-fg)] sm:mt-6"
            style={{
              fontSize: "clamp(30px, 6vw, 64px)",
              lineHeight: 1,
              letterSpacing: "-0.035em",
            }}
          >
            You don&rsquo;t{" "}
            <span className="font-serif font-normal italic tracking-[-0.02em] text-[color:var(--color-primary)]">
              land alone.
            </span>
          </motion.h2>

          {/* Three-voice supporting stack: serif kicker, sans detail,
              mono sign-off. Replaces the previous run-on paragraph so
              the closer carries the same tri-register hierarchy as
              the rest of the page. */}
          <div className="mx-auto mt-4 flex max-w-[520px] flex-col items-center gap-1.5 sm:mt-5">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.55, ease: EASE, delay: 0.5 }}
              className="font-serif italic tracking-[-0.01em] text-[color:var(--color-fg)]"
              style={{
                fontSize: "clamp(17px, 2.4vw, 22px)",
                lineHeight: 1.25,
              }}
            >
              Your people are already packing.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.58 }}
              className="text-[14px] leading-[1.5] text-[color:var(--color-fg-muted)] sm:text-[15px]"
            >
              Ireland in September. Germany in October.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.45, ease: EASE, delay: 0.66 }}
              className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--color-fg-subtle)]"
            >
              We&rsquo;ll ping you the moment the app is live.
            </motion.p>
          </div>

          {/* Primary CTA: email waitlist. Delay extended so the form
              lands after the three-voice supporting stack finishes. */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.76 }}
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
            transition={{ duration: 0.6, ease: EASE, delay: 0.86 }}
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
            transition={{ duration: 0.6, ease: EASE, delay: 0.94 }}
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
