"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
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
          {/* AirportMoment: typed three-beat scene that plays once per
              viewport entry. A quiet dramatic setup before the CTA. */}
          <AirportMoment />

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

/* ------------------------------------------------------------------ */
/* AirportMoment. A tiny three-line typewriter that sets the scene     */
/* just above the final CTA. Plays once per viewport entry and respects */
/* prefers-reduced-motion. The typing rhythm is deliberate - fast for  */
/* the set-up lines, slightly slower on the punch so it lands.         */
/* ------------------------------------------------------------------ */

const AIRPORT_LINES = [
  "You land at Dublin Airport.",
  "Your phone buzzes.",
  "Nine people are waving at Gate 42.",
] as const;

function AirportMoment() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!inView || done) return;
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) {
      setDone(true);
      return;
    }
    const current = AIRPORT_LINES[lineIndex];
    if (charIndex < current.length) {
      // Slow the final punch line for emphasis.
      const speed = lineIndex === AIRPORT_LINES.length - 1 ? 45 : 28;
      const id = window.setTimeout(
        () => setCharIndex((c) => c + 1),
        speed,
      );
      return () => window.clearTimeout(id);
    }
    if (lineIndex < AIRPORT_LINES.length - 1) {
      const id = window.setTimeout(() => {
        setLineIndex((i) => i + 1);
        setCharIndex(0);
      }, 650);
      return () => window.clearTimeout(id);
    }
    setDone(true);
  }, [inView, lineIndex, charIndex, done]);

  return (
    <div
      ref={ref}
      aria-hidden={!done}
      className="mx-auto mb-14 max-w-[580px] font-mono text-[12px] leading-[1.7] tracking-[0.02em] text-[color:var(--color-fg-muted)] sm:mb-20 sm:text-[13px]"
    >
      {AIRPORT_LINES.map((line, i) => {
        const visible = i < lineIndex || (i === lineIndex && (done || charIndex > 0));
        const typedLength = i < lineIndex || done ? line.length : charIndex;
        const typed = line.slice(0, typedLength);
        const isLast = i === AIRPORT_LINES.length - 1;
        return (
          <p
            key={line}
            className={`min-h-[1.7em] ${
              isLast
                ? "font-heading text-[14px] font-semibold tracking-[-0.01em] text-[color:var(--color-fg)] sm:text-[16px]"
                : ""
            }`}
            style={{ opacity: visible ? 1 : 0, transition: "opacity 200ms" }}
          >
            <span>{typed}</span>
            {i === lineIndex && !done && (
              <span
                aria-hidden="true"
                className="ml-0.5 inline-block h-[1em] w-[6px] translate-y-[2px] animate-pulse bg-[color:var(--color-primary)]"
              />
            )}
          </p>
        );
      })}
    </div>
  );
}
