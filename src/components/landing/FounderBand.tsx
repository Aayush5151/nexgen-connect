"use client";

import { motion } from "framer-motion";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * FounderBand. A single quiet paragraph from the founder, signed by
 * hand. Sits right before FinalCTA so the reader gets one human face
 * before the download close. No bio, no links, no stats - just the
 * "why" in the person&rsquo;s own words. Credibility through restraint.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

export function FounderBand() {
  return (
    <section className="relative overflow-hidden border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-16 sm:py-20 md:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(40% 55% at 50% 50%, color-mix(in srgb, var(--color-primary) 6%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="container-narrow relative">
        <div className="mx-auto max-w-[720px] text-center">
          <SectionLabel className="mx-auto">From the founder</SectionLabel>

          {/* Avatar - initials circle with subtle primary ring.
              No imported photo to avoid mystery files; we can swap in
              a real portrait as a direct <Image /> later. */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mx-auto mt-6 flex h-16 w-16 items-center justify-center rounded-full border border-[color:var(--color-primary)]/40 bg-[color:color-mix(in_srgb,var(--color-primary)_12%,transparent)] font-heading text-[18px] font-semibold text-[color:var(--color-primary)] sm:h-20 sm:w-20 sm:text-[22px]"
          >
            AS
          </motion.div>

          <motion.blockquote
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.65, ease: EASE, delay: 0.08 }}
            className="mx-auto mt-8 max-w-[560px] font-serif italic text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(22px, 4vw, 34px)",
              lineHeight: 1.3,
              letterSpacing: "-0.015em",
            }}
          >
            &ldquo;I moved abroad and landed into a WhatsApp group of 487
            strangers. Nobody from my city. I started NexGen because that
            first week shouldn&rsquo;t be the loneliest one.&rdquo;
          </motion.blockquote>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
            className="mt-8 flex flex-col items-center gap-1"
          >
            {/* Signature line - thin hairline like a pen mark */}
            <span
              aria-hidden="true"
              className="h-[1px] w-12 bg-[color:var(--color-primary)]/50"
            />
            <p className="mt-3 font-heading text-[14px] font-semibold text-[color:var(--color-fg)] sm:text-[15px]">
              Aayush Shah
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-fg-subtle)] sm:text-[11px]">
              Founder · NexGen Connect
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
