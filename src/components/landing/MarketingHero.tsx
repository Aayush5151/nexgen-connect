"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BadgeCheck, Globe2, ShieldCheck } from "lucide-react";
import { AppStoreBadge } from "@/components/ui/AppStoreBadge";
import { PlayStoreBadge } from "@/components/ui/PlayStoreBadge";
import { PhoneDevice, PhoneStatusBar } from "@/components/ui/PhoneDevice";
import { EmailWaitlistForm } from "@/components/landing/EmailWaitlistForm";
import { CursorGlow } from "@/components/shared/CursorGlow";
import { MagneticButton } from "@/components/shared/MagneticButton";

/**
 * MarketingHero. Anchor section for the marketing site. Two-column on
 * desktop (copy + CTAs on the left, phone mockup on the right), stacked
 * on mobile. The phone is a full PhoneDevice with a bespoke "Your group"
 * home-screen mock so visitors see what the app actually looks like.
 *
 * v12.1 conversion pass - graded against the hard rules from the
 * conversion brief:
 *   - "Time to understand product: < 3 seconds."
 *   - "Time to find download button: < 1 second."
 *   - "No long paragraphs. No buzzwords. Clear outcomes."
 *
 * Current block order above the fold:
 *   1. Status pill   - "Waitlist open - Launching Sept 2026" (honest
 *      pre-launch signal, primary-tinted so store badges below read as
 *      a real future-tense CTA rather than a broken link).
 *   2. H1            - "Find your people before you land." The primary
 *      v9 tagline, verbatim. Serif italic echo on the second line is
 *      the only ornamental move on the page.
 *   3. Subhead       - ONE sentence, benefit-first, no jargon. Names the
 *      mechanism without listing numbers that are not in v9.
 *   4. Store badges  - App Store + Play Store. Primary CTA cluster.
 *   5. Email waitlist- "or jump the line" divider + pre-launch email
 *      pill for visitors who read the pill and want the honest path.
 *   6. Trust row     - DigiLocker / Aadhaar / Students only. Sits
 *      below the ask so it supports, doesn't gate.
 *
 * Six scannable blocks. Store badges land inside 1s of page paint on
 * desktop, and above the fold on a 375x812 mobile viewport.
 *
 * v9 alignment (business plan v9.0 - Apr 22, 2026):
 *   - Primary tagline "Find your people before you land" - H1 ✓
 *   - Secondary tagline "You don't land alone" - lives in FinalCTA as
 *     the emotional bookend, not in the Hero (keeps the Hero ruthlessly
 *     focused on the functional ask + download action).
 *   - No mention of "8-12" anywhere - that number was a website
 *     invention; v9's real numbers (60 corridor unlock, 20+ uni
 *     subgroup, 3,000 Y1 verified target) appear where they belong
 *     (phone mockup preview counts, FAQ, pricing).
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

function fadeIn(delay = 0) {
  return {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: EASE, delay },
  };
}

export function MarketingHero() {
  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden py-8 sm:py-10 md:py-12">
      {/* Ambient background: two very soft radial washes, one primary
          behind the phone, one neutral on the left. No hard gradients. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 40% at 72% 30%, color-mix(in srgb, var(--color-primary) 8%, transparent) 0%, transparent 60%), radial-gradient(40% 30% at 15% 85%, color-mix(in srgb, #ffffff 3%, transparent) 0%, transparent 70%)",
        }}
      />

      {/* Cursor-following highlight. Desktop only; renders nothing on touch. */}
      <CursorGlow size={520} opacity={0.08} />

      <div className="container-narrow relative w-full">
        <div className="grid items-center gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-12">
          {/* LEFT: copy + CTAs */}
          <div className="lg:col-span-7">
            <motion.p
              {...fadeIn(0)}
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-primary)]/35 bg-[color:color-mix(in_srgb,var(--color-primary)_10%,transparent)] px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-primary)]"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span
                  aria-hidden="true"
                  className="absolute inset-0 animate-ping rounded-full bg-[color:var(--color-primary)] opacity-75"
                />
                <span className="relative h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)]" />
              </span>
              Waitlist open &middot; Ireland Sept &middot; Germany Oct
            </motion.p>

            <motion.h1
              {...fadeIn(0.05)}
              className="mt-4 font-heading font-semibold text-[color:var(--color-fg)] md:mt-5"
              style={{
                fontSize: "clamp(36px, 7.2vw, 84px)",
                lineHeight: 0.95,
                letterSpacing: "-0.035em",
              }}
            >
              <span className="block whitespace-nowrap">Find your people</span>
              <span className="block font-serif font-normal italic tracking-[-0.02em] text-[color:var(--color-primary)]">
                before you land.
              </span>
            </motion.h1>

            {/* Supporting line. Graded against the conversion brief:
                one sentence, no jargon, outcome-first, parseable inside
                3 seconds. It names WHO it's for (students) and WHAT the
                match criteria are (city + country + month). No numbers
                here - the phone mockup on the right carries the "x
                verified" count so a reader who wants proof sees it in
                the product, not in paragraph prose. The corridor detail
                (Ireland Sept / Germany Oct) lives one scroll down in
                WaitlistProof where a reader who wants specifics can
                find it on a dedicated line. */}
            <motion.p
              {...fadeIn(0.12)}
              className="mt-4 max-w-[520px] text-[15px] leading-[1.5] text-[color:var(--color-fg-muted)] sm:text-[16.5px] md:mt-5 md:text-[17.5px]"
            >
              Match with verified students from{" "}
              <span className="text-[color:var(--color-fg)]">your home city</span>
              , going to{" "}
              <span className="text-[color:var(--color-fg)]">your destination</span>
              , in{" "}
              <span className="text-[color:var(--color-fg)]">your intake month</span>
              .
            </motion.p>

            {/* Primary CTA cluster: store badges + parallel email field.
                Badges remain the visually prominent call (per the
                conversion brief: "focused on CTA buttons like App Store
                and Google Play") and tapping them still opens the
                launch toast with a jump to the waitlist. The email
                field sits alongside so visitors who want the honest
                pre-launch path don't have to scroll looking for it. */}
            <motion.div
              {...fadeIn(0.2)}
              className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
            >
              <MagneticButton strength={6}>
                <AppStoreBadge />
              </MagneticButton>
              <MagneticButton strength={6}>
                <PlayStoreBadge />
              </MagneticButton>
            </motion.div>

            <motion.div {...fadeIn(0.28)} className="mt-4 max-w-[460px]">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-px flex-1 bg-[color:var(--color-border)]"
                />
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[color:var(--color-fg-subtle)]">
                  or jump the line
                </span>
                <span
                  aria-hidden="true"
                  className="h-px flex-1 bg-[color:var(--color-border)]"
                />
              </div>
              <div className="mt-3">
                <EmailWaitlistForm
                  referrer="hero"
                  submitLabel="Notify me on launch"
                />
              </div>
            </motion.div>

            {/* Trust row. Kept compact and set below the CTAs so the
                ask comes first; these exist to reassure, not to gate. */}
            <motion.ul
              {...fadeIn(0.36)}
              className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-muted)]"
            >
              <li className="inline-flex items-center gap-1.5">
                <ShieldCheck
                  className="h-3.5 w-3.5 text-[color:var(--color-primary)]"
                  strokeWidth={2.25}
                />
                DigiLocker verified
              </li>
              <li className="inline-flex items-center gap-1.5">
                <BadgeCheck
                  className="h-3.5 w-3.5 text-[color:var(--color-primary)]"
                  strokeWidth={2.25}
                />
                Aadhaar-backed
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Globe2
                  className="h-3.5 w-3.5 text-[color:var(--color-primary)]"
                  strokeWidth={2}
                />
                Students only
              </li>
            </motion.ul>
          </div>

          {/* RIGHT: phone mockup */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
            className="relative flex justify-center lg:col-span-5 lg:justify-end"
          >
            {/* Faint grid backdrop behind the phone - Linear/Arc vibe. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-[-8%] top-[-4%] hidden h-[110%] w-[110%] opacity-[0.18] md:block"
              style={{
                backgroundImage:
                  "linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
                maskImage:
                  "radial-gradient(closest-side, black 40%, transparent 75%)",
              }}
            />

            {/* Mobile: 232px phone to keep hero in-viewport on 667-812px
                mobile heights. Desktop: 288px with ambient glow. */}
            <div className="md:hidden">
              <PhoneDevice width={232}>
                <HeroAppScreen />
              </PhoneDevice>
            </div>
            <div className="hidden md:block">
              <PhoneDevice width={288} glow>
                <HeroAppScreen />
              </PhoneDevice>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* HeroAppScreen. A plausible "Your group" home screen. Pure HTML/CSS  */
/* so it scales with the PhoneDevice width and keeps crisp type at     */
/* any pixel density. Not fetched from the backend - this is a marketing  */
/* surface, and real data is only shown inside the actual app.         */
/*                                                                      */
/* The screen runs a silent 4-state loop every ~3s so the phone feels   */
/* alive without being a heavy video: new member joins → counter ticks  */
/* → latest-activity line rotates. prefers-reduced-motion disables it.  */
/* ------------------------------------------------------------------ */

const PEOPLE = [
  { initials: "AD", name: "Aditya", city: "Mumbai" },
  { initials: "PR", name: "Priya", city: "Bangalore" },
  { initials: "KR", name: "Karan", city: "Delhi" },
  { initials: "MH", name: "Meera", city: "Pune" },
  { initials: "RV", name: "Riya", city: "Hyderabad" },
  { initials: "SA", name: "Sahil", city: "Chennai" },
  { initials: "NK", name: "Nikhil", city: "Kolkata" },
  { initials: "IS", name: "Isha", city: "Ahmedabad" },
  { initials: "AR", name: "Arjun", city: "Jaipur" },
];

// Silent loop script: four beats that repeat. Each beat updates the
// pulsing avatar, the activity line, the verified count, and the
// corridor kicker. The kicker alternates between the two launch
// beachheads (Sept 2026 · Ireland, Oct 2026 · Germany) so the phone
// never makes a reader feel that Germany is a second-class corridor.
const LOOP_BEATS = [
  { pulseIndex: 0, name: "Aditya", count: 8, kicker: "Sept 2026 · Ireland" },
  { pulseIndex: 4, name: "Riya", count: 9, kicker: "Oct 2026 · Germany" },
  { pulseIndex: 7, name: "Isha", count: 10, kicker: "Sept 2026 · Ireland" },
  { pulseIndex: 2, name: "Karan", count: 11, kicker: "Oct 2026 · Germany" },
] as const;

function HeroAppScreen() {
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;
    const id = window.setInterval(() => {
      setBeat((b) => (b + 1) % LOOP_BEATS.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, []);

  const state = LOOP_BEATS[beat];

  return (
    <div className="flex h-full w-full flex-col bg-[color:var(--color-bg)] text-white">
      <PhoneStatusBar />

      {/* Top app bar */}
      <div className="mt-3 flex items-center justify-between px-5">
        <div>
          <AnimatePresence mode="popLayout">
            <motion.p
              key={state.kicker}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.25 }}
              className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/55"
            >
              {state.kicker}
            </motion.p>
          </AnimatePresence>
          <h3 className="mt-0.5 font-heading text-[18px] font-semibold tracking-[-0.01em]">
            Your group
          </h3>
        </div>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={state.count}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.25 }}
            className="flex h-6 items-center gap-1 rounded-full border border-[color:var(--color-primary)]/40 bg-[color:color-mix(in_srgb,var(--color-primary)_10%,transparent)] px-2 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-primary)]"
          >
            <span className="h-1 w-1 rounded-full bg-[color:var(--color-primary)]" />
            {state.count} verified
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Avatar grid */}
      <div className="mt-4 px-5">
        <ul className="grid grid-cols-3 gap-2">
          {PEOPLE.map((p, i) => {
            const pulsing = i === state.pulseIndex;
            return (
              <li
                key={p.name}
                className={`relative flex flex-col items-center rounded-[8px] border bg-white/[0.03] p-2 transition-colors duration-300 ${
                  pulsing
                    ? "border-[color:var(--color-primary)]/60"
                    : "border-white/8"
                }`}
              >
                <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-primary)]/35 bg-[color:color-mix(in_srgb,var(--color-primary)_12%,transparent)] font-heading text-[11px] font-semibold text-[color:var(--color-primary)]">
                  {p.initials}
                  {pulsing && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 animate-ping rounded-full bg-[color:var(--color-primary)] opacity-30"
                    />
                  )}
                </span>
                <span className="mt-1.5 font-heading text-[10px] font-medium leading-none text-white">
                  {p.name}
                </span>
                <span className="mt-1 text-[8px] leading-none text-white/50">
                  {p.city}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Pinned activity card */}
      <div className="mt-3 px-5">
        <div className="rounded-[10px] border border-white/8 bg-white/[0.04] p-3">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]">
              <svg
                width="10"
                height="10"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 7v3h3M6 2h3v3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M3 10l7-8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-white/70">
              Pinned &middot; Terminal 1
            </p>
          </div>
          <p className="mt-2 text-[11.5px] leading-[1.4] text-white/90">
            Meeting at 6am before orientation. Green jackets.{" "}
            <span className="text-[color:var(--color-primary)]">
              {state.count} in
            </span>
            .
          </p>
        </div>
      </div>

      {/* Latest activity row - rotates with the beat */}
      <div className="mt-3 flex items-center gap-2 px-5">
        <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)]" />
        <div className="relative overflow-hidden text-[10px] leading-[1.2] text-white/70">
          <AnimatePresence mode="popLayout">
            <motion.p
              key={state.name}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
            >
              <span className="font-semibold text-white">{state.name}</span>{" "}
              just verified &middot; now
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom tab bar */}
      <div className="mt-auto">
        <div className="mx-4 mb-5 flex items-center justify-around rounded-full border border-white/10 bg-black/80 px-2 py-2 backdrop-blur">
          <TabIcon label="Home" active />
          <TabIcon label="Group" />
          <TabIcon label="Chat" />
          <TabIcon label="You" />
        </div>
      </div>
    </div>
  );
}

function TabIcon({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <span
      className={`flex flex-col items-center gap-0.5 px-2 ${
        active ? "text-white" : "text-white/45"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-[color:var(--color-primary)]" : "bg-white/30"
        }`}
      />
      <span className="text-[8.5px] font-medium leading-none">{label}</span>
    </span>
  );
}
