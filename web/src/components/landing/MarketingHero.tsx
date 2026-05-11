"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AppStoreBadge } from "@/components/ui/AppStoreBadge";
import { PlayStoreBadge } from "@/components/ui/PlayStoreBadge";
import { PhoneDevice, PhoneStatusBar } from "@/components/ui/PhoneDevice";
import { CursorGlow } from "@/components/shared/CursorGlow";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { LiveSignupCount } from "@/components/landing/LiveSignupCount";

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
    <section className="relative flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden py-4 sm:py-10 md:py-12">
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
        <div className="grid items-center gap-4 sm:gap-8 lg:grid-cols-12 lg:gap-12">
          {/* LEFT: copy + CTAs */}
          <div className="lg:col-span-7">
            <motion.p
              {...fadeIn(0)}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-[color:var(--color-primary)]/35 bg-[color:color-mix(in_srgb,var(--color-primary)_10%,transparent)] px-3 py-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-[color:var(--color-primary)] sm:text-[11px] sm:tracking-[0.1em]"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span
                  aria-hidden="true"
                  className="absolute inset-0 animate-ping rounded-full bg-[color:var(--color-primary)] opacity-75"
                />
                <span className="relative h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)]" />
              </span>
              {/* Mobile: short single-line variant. sm+: full text. */}
              <span className="sm:hidden">Waitlist &middot; Sept + Oct 2026</span>
              <span className="hidden sm:inline">
                Waitlist open &middot; Ireland Sept &middot; Germany Oct
              </span>
            </motion.p>

            <motion.h1
              {...fadeIn(0.05)}
              className="mt-3 font-heading font-semibold text-[color:var(--color-fg)] sm:mt-4 md:mt-5"
              style={{
                fontSize: "clamp(40px, 9.5vw, 84px)",
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
              className="mt-3 max-w-[520px] text-[14px] leading-[1.45] text-[color:var(--color-fg-muted)] sm:mt-4 sm:text-[16.5px] sm:leading-[1.5] md:mt-5 md:text-[17.5px]"
            >
              Find your verified corridor -{" "}
              <span className="text-[color:var(--color-fg)]">your home city</span>
              , going to{" "}
              <span className="text-[color:var(--color-fg)]">your destination</span>
              , in{" "}
              <span className="text-[color:var(--color-fg)]">your intake month</span>
              . Group DMs unlock when sixty verified.
            </motion.p>

            {/* Trust-pivot line. v14.1 / v5.1 patch language: the
                "free where it matters" promise is the brand's opening
                handshake. Smaller and quieter than the headline, but
                deliberately above the CTA cluster so a first-time
                reader internalises why the free tier is real before
                they see the store badges. */}
            <motion.p
              {...fadeIn(0.16)}
              className="mt-2 max-w-[520px] text-[12.5px] leading-[1.5] text-[color:var(--color-fg-subtle)] sm:mt-3 sm:text-[13.5px]"
            >
              Free to verify. Free to find your people. We earn our keep
              when your parents want the dashboard.
            </motion.p>

            {/* v16 web pivot — the web is now the primary surface, not
                a launch-notification page. The signup funnel at /signup
                does the full phone-OTP → identity → admit → corridor
                flow and can ship a real verified user without an app
                install. Primary CTA goes there. Store badges still
                appear as secondary "get notified when the app ships"
                affordances; tapping them still opens the original
                launch toast. */}
            <motion.div
              {...fadeIn(0.2)}
              className="mt-4 flex flex-col gap-3 sm:mt-6 sm:gap-4"
            >
              <MagneticButton strength={8}>
                <Link
                  href="/signup"
                  data-cta="hero-primary-signup"
                  className="inline-flex h-14 w-full items-center justify-center rounded-[12px] bg-[color:var(--color-primary)] px-6 text-[15px] font-semibold tracking-[-0.005em] text-[color:var(--color-primary-fg)] transition-[background-color,opacity,transform] hover:bg-[color:var(--color-primary-hover)] sm:h-12 sm:w-auto sm:text-[14px]"
                >
                  Verify your phone &nbsp;·&nbsp; start in 30s
                  <span aria-hidden className="ml-2 text-[16px]">
                    →
                  </span>
                </Link>
              </MagneticButton>

              {/* Secondary cluster — store badges keep their original
                  "notify me when the app launches" behaviour. Sized
                  smaller now that the funnel CTA is the primary
                  call-to-action. */}
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                <div className="flex w-full sm:hidden [&>*]:w-full [&_a]:w-full [&_a]:justify-center">
                  <MagneticButton strength={5}>
                    <AppStoreBadge size="sm" />
                  </MagneticButton>
                </div>
                <div className="flex w-full sm:hidden [&>*]:w-full [&_a]:w-full [&_a]:justify-center">
                  <MagneticButton strength={5}>
                    <PlayStoreBadge size="sm" />
                  </MagneticButton>
                </div>
                <span className="hidden sm:inline-flex">
                  <MagneticButton strength={5}>
                    <AppStoreBadge size="sm" />
                  </MagneticButton>
                </span>
                <span className="hidden sm:inline-flex">
                  <MagneticButton strength={5}>
                    <PlayStoreBadge size="sm" />
                  </MagneticButton>
                </span>
              </div>
            </motion.div>

            {/* Live trust badge — server-cached 60s tRPC count of
                phone-verified signups. Hides itself when count is 0
                or the query fails so a fresh deploy never shows "0
                verified" to a first visitor. Sits above the corridor
                line so a reader who scans for proof finds it before
                the structural detail. */}
            <LiveSignupCount />

            {/* Quiet line below the CTA cluster, names the launch
                corridors without an extra sub-section. The trust
                row + duplicate email form have been removed; trust
                claims belong in TrustPillars / SafetyParents and a
                second email field lives in FinalCTA. */}
            <motion.p
              {...fadeIn(0.28)}
              className="mt-3 font-mono text-[9.5px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)] sm:mt-5 sm:text-[11px] sm:tracking-[0.14em]"
            >
              {/* Mobile: one corridor per line so neither runs off-screen.
                  sm+: both on a single line separated by a centred middot. */}
              <span className="block sm:inline">
                India → Ireland · Sept 2026
              </span>
              <span aria-hidden="true" className="hidden sm:inline">
                {" "}
                &nbsp;·&nbsp;{" "}
              </span>
              <span className="block sm:inline">
                India → Germany · Oct 2026
              </span>
            </motion.p>
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

            {/* Mobile: 196px phone to keep hero in-viewport on small
                phones (375x667+). Desktop: 288px with ambient glow. */}
            <div className="md:hidden">
              <PhoneDevice width={196}>
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

      {/* Scroll-down affordance. Anchors the bottom of the hero so a
          first-time reader has an explicit invitation to keep going.
          A pulsing dot inside a thin pill, with "Scroll" text and a
          small chevron. Hidden on mobile (the hero is already short
          there and the Get-app pill in the header is the primary
          action). Desktop only because the affordance reads as
          editorial chrome — it should not crowd the main hero on a
          phone where every pixel of vertical space is contested. */}
      <motion.a
        href="#waitlist-proof"
        aria-label="Scroll to next section"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6, ease: EASE }}
        className="group absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-fg-subtle)] transition-colors hover:text-[color:var(--color-primary)] md:flex"
      >
        <span>Scroll</span>
        <motion.span
          aria-hidden="true"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-7 w-[18px] items-start justify-center rounded-full border border-[color:var(--color-fg-subtle)]/50 pt-1.5 transition-colors group-hover:border-[color:var(--color-primary)]/60"
        >
          <span className="block h-1.5 w-px rounded-full bg-[color:var(--color-fg-subtle)] transition-colors group-hover:bg-[color:var(--color-primary)]" />
        </motion.span>
      </motion.a>
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

// All members are from the same home city, Pune, going to
// different Dublin-corridor universities. This is the v10 §3.2
// corridor mechanic in product form: home-city × destination-city ×
// intake-month, so everyone visible to one Pune user is also from
// Pune. The destination uni is the differentiator within the
// corridor (UCD, Trinity, DCU all sit inside the Pune → Dublin
// cohort, with uni-specific subgroups spawning at 20+ verified per
// HEI per v10 §3.4).
const PEOPLE = [
  { initials: "AD", name: "Aditya", city: "Pune", uni: "UCD",       verifiedAgo: "2 min ago" },
  { initials: "PR", name: "Priya",  city: "Pune", uni: "Trinity",   verifiedAgo: "8 min ago" },
  { initials: "KR", name: "Karan",  city: "Pune", uni: "DCU",       verifiedAgo: "3 min ago" },
  { initials: "MH", name: "Meera",  city: "Pune", uni: "UCD",       verifiedAgo: "12 min ago" },
  { initials: "RV", name: "Riya",   city: "Pune", uni: "TU Dublin", verifiedAgo: "just now" },
  { initials: "SA", name: "Sahil",  city: "Pune", uni: "Maynooth",  verifiedAgo: "18 min ago" },
  { initials: "NK", name: "Nikhil", city: "Pune", uni: "Trinity",   verifiedAgo: "24 min ago" },
  { initials: "IS", name: "Isha",   city: "Pune", uni: "DCU",       verifiedAgo: "1 min ago" },
  { initials: "AR", name: "Arjun",  city: "Pune", uni: "UCD",       verifiedAgo: "31 min ago" },
];

// Silent loop script: each beat updates the pulsing avatar, the
// recent activity line, and the verified count. Stays inside the
// Pune → Dublin corridor so the home-city promise reads cleanly
//, we can rotate to other corridors elsewhere on the site.
// Counts mirror the 9 avatar tiles visible in the grid below - each
// LOOP_BEATS tick advances the verified count past the visible cohort
// (9 → 12) so the "Aditya just verified · 2 minutes ago" line reads
// as "another verified joiner in real time" rather than contradicting
// the 9 tiles already on screen.
const LOOP_BEATS = [
  { pulseIndex: 0, name: "Aditya", count: 9, ago: "2 minutes ago" },
  { pulseIndex: 4, name: "Riya",   count: 10, ago: "just now" },
  { pulseIndex: 7, name: "Isha",   count: 11, ago: "1 minute ago" },
  { pulseIndex: 2, name: "Karan",  count: 12, ago: "3 minutes ago" },
] as const;

type Tab = "home" | "group" | "chat" | "you";

function HeroAppScreen() {
  const [beat, setBeat] = useState(0);
  const [tab, setTab] = useState<Tab>("home");
  // While the user is exploring tabs manually, hold the auto-loop. After
  // a short idle the loop resumes so the phone stays alive for the next
  // visitor scrolling past.
  const manualUntilRef = useRef(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;
    const id = window.setInterval(() => {
      if (Date.now() < manualUntilRef.current) return;
      if (tab !== "home") return;
      setBeat((b) => (b + 1) % LOOP_BEATS.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, [tab]);

  const state = LOOP_BEATS[beat];

  const switchTab = (next: Tab) => {
    manualUntilRef.current = Date.now() + 6000;
    setTab(next);
  };

  const pauseAutoLoop = () => {
    manualUntilRef.current = Date.now() + 6000;
  };

  return (
    <div className="flex h-full w-full flex-col bg-[color:var(--color-bg)] text-white">
      <PhoneStatusBar />

      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {tab === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 flex flex-col"
            >
              <HomeScreen state={state} beat={beat} pauseAutoLoop={pauseAutoLoop} />
            </motion.div>
          )}
          {tab === "group" && (
            <motion.div
              key="group"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 flex flex-col"
            >
              <GroupScreen />
            </motion.div>
          )}
          {tab === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 flex flex-col"
            >
              <ChatScreen />
            </motion.div>
          )}
          {tab === "you" && (
            <motion.div
              key="you"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 flex flex-col"
            >
              <YouScreen />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom tab bar, clickable, drives screen swaps. */}
      <div className="mx-4 mb-5 flex items-center justify-around rounded-full border border-white/10 bg-black/80 px-2 py-2 backdrop-blur">
        <TabIcon
          label="Home"
          active={tab === "home"}
          onClick={() => switchTab("home")}
        />
        <TabIcon
          label="Group"
          active={tab === "group"}
          onClick={() => switchTab("group")}
        />
        <TabIcon
          label="Chat"
          active={tab === "chat"}
          onClick={() => switchTab("chat")}
        />
        <TabIcon
          label="You"
          active={tab === "you"}
          onClick={() => switchTab("you")}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* HOME tab, "Your group" with tappable members and an expandable     */
/* pinned card. Every interactive element in here resolves to an       */
/* actual product surface from v10:                                    */
/*   - tap an avatar → profile popover with destination uni and        */
/*     verification timestamp                                          */
/*   - tap the pinned card → expands inline showing detail + "I'm in"  */
/*   - tap RSVP inside the expanded card → button pulses, count ticks  */
/*   The auto-loop pauses for 6s when the user takes manual control.   */
/* ------------------------------------------------------------------ */
function HomeScreen({
  state,
  beat,
  pauseAutoLoop,
}: {
  state: typeof LOOP_BEATS[number];
  beat: number;
  pauseAutoLoop: () => void;
}) {
  // null = nobody manually selected, follow the auto-loop pulse
  // number = user tapped this index, lock it as the focused avatar
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [pinExpanded, setPinExpanded] = useState(false);
  const [rsvped, setRsvped] = useState(false);

  // Reset manual selection if the auto-loop runs through enough
  // beats (means the user has stopped interacting).
  useEffect(() => {
    if (selectedIdx === null) return;
    const id = window.setTimeout(() => setSelectedIdx(null), 6000);
    return () => window.clearTimeout(id);
  }, [selectedIdx, beat]);

  const focusedIdx = selectedIdx ?? state.pulseIndex;
  const focused = PEOPLE[focusedIdx];

  const handleAvatar = (i: number) => {
    pauseAutoLoop();
    setSelectedIdx(i);
  };

  const handlePin = () => {
    pauseAutoLoop();
    setPinExpanded((v) => !v);
  };

  const handleRsvp = () => {
    pauseAutoLoop();
    setRsvped(true);
  };

  return (
    <div className="flex h-full w-full flex-col">
      {/* Top app bar, corridor identity (home → dest · intake).
          The phone is 196px wide on mobile — content area ~148px after
          px-5 padding. Vertical stack keeps everything readable:
          kicker (single-line, truncated if long), title (full font
          size on its own row), then the verified-count pill below.
          Matches how a real chat app shows "group name + status pill"
          stacked without crowding the title. */}
      <div className="mt-3 px-5">
        <p className="truncate font-mono text-[9px] uppercase tracking-[0.12em] text-white/55">
          Pune → Dublin · Sept 2026
        </p>
        <h3 className="mt-0.5 truncate font-heading text-[18px] font-semibold tracking-[-0.01em]">
          Your group
        </h3>
        <span
          className="mt-1.5 inline-flex h-5 items-center gap-1 rounded-full border border-[color:var(--color-primary)]/40 bg-[color:color-mix(in_srgb,var(--color-primary)_10%,transparent)] px-2 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-primary)]"
        >
          <span className="h-1 w-1 rounded-full bg-[color:var(--color-primary)]" />
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={state.count}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.18 }}
              className="inline-block tabular-nums"
            >
              {state.count}
            </motion.span>
          </AnimatePresence>
          <span>verified</span>
        </span>
      </div>

      {/* Avatar grid, every cell is a tappable button */}
      <div className="mt-4 px-5">
        <ul className="grid grid-cols-3 gap-2">
          {PEOPLE.map((p, i) => {
            const isFocus = i === focusedIdx;
            const isManual = selectedIdx === i;
            return (
              <li key={p.name}>
                <button
                  type="button"
                  onClick={() => handleAvatar(i)}
                  aria-label={`${p.name}, Pune → ${p.uni}, verified ${p.verifiedAgo}`}
                  aria-pressed={isManual}
                  className={`relative flex w-full flex-col items-center rounded-[8px] border bg-white/[0.03] p-2 text-left transition-all duration-300 active:scale-[0.97] ${
                    isFocus
                      ? "border-[color:var(--color-primary)]/60"
                      : "border-white/8 hover:border-white/20"
                  }`}
                >
                  <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-primary)]/35 bg-[color:color-mix(in_srgb,var(--color-primary)_12%,transparent)] font-heading text-[11px] font-semibold text-[color:var(--color-primary)]">
                    {p.initials}
                    {isFocus && (
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
                    {p.uni}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Pinned activity card, tappable, expands inline */}
      <div className="mt-3 px-5">
        <button
          type="button"
          onClick={handlePin}
          aria-expanded={pinExpanded}
          aria-controls="pinned-detail"
          className="block w-full rounded-[10px] border border-white/8 bg-white/[0.04] p-3 text-left transition-colors hover:border-white/15"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M3 7v3h3M6 2h3v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M3 10l7-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
              <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-white/70">
                Pinned &middot; Terminal 1
              </p>
            </div>
            <span
              aria-hidden="true"
              className={`text-[10px] text-white/45 transition-transform duration-200 ${pinExpanded ? "rotate-90" : ""}`}
            >
              ›
            </span>
          </div>
          <p className="mt-2 text-[11.5px] leading-[1.4] text-white/90">
            Meeting at 6am before orientation. Green jackets.{" "}
            <span className="text-[color:var(--color-primary)]">
              {state.count + (rsvped ? 1 : 0)} in
            </span>
            .
          </p>

          <AnimatePresence initial={false}>
            {pinExpanded && (
              <motion.div
                id="pinned-detail"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="overflow-hidden"
              >
                <div className="mt-2 flex items-center justify-between gap-2 border-t border-white/8 pt-2 text-[9px] text-white/70">
                  <span>
                    <span className="font-mono uppercase tracking-[0.1em] text-white/45">
                      Where
                    </span>{" "}
                    DUB T1, Costa
                  </span>
                  <span>
                    <span className="font-mono uppercase tracking-[0.1em] text-white/45">
                      When
                    </span>{" "}
                    18 Sept, 6 am
                  </span>
                </div>

                <div
                  role="presentation"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!rsvped) handleRsvp();
                  }}
                  className={`mt-2 flex h-7 w-full cursor-pointer items-center justify-center rounded-[7px] text-[10.5px] font-semibold transition-colors ${
                    rsvped
                      ? "bg-[color:color-mix(in_srgb,var(--color-primary)_18%,transparent)] text-[color:var(--color-primary)]"
                      : "bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]"
                  }`}
                >
                  {rsvped ? "✓ You're in" : "I'm in"}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Activity row, names the focused member with full corridor */}
      <div className="mt-3 flex items-center gap-2 px-5">
        <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)]" />
        <div className="relative overflow-hidden text-[10px] leading-[1.2] text-white/70">
          <AnimatePresence mode="popLayout">
            <motion.p
              key={`${focused.name}-${selectedIdx ?? "auto"}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
            >
              <span className="font-semibold text-white">{focused.name}</span>
              {selectedIdx === null ? (
                <> just verified &middot; {focused.verifiedAgo}</>
              ) : (
                <>
                  {" "}
                  &middot; Pune → {focused.uni} &middot; verified {focused.verifiedAgo}
                </>
              )}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* GROUP tab, corridor stat block + member list + intro circles.      */
/* Shows the v10 mechanic in product form: corridor unlock counter     */
/* (9 of 60), an actual member list, and the auto-formed intro         */
/* circles by what users worry about.                                  */
/* ------------------------------------------------------------------ */
function GroupScreen() {
  const members = PEOPLE.slice(0, 5);
  return (
    <div className="flex h-full w-full flex-col">
      <div className="mt-3 flex items-center justify-between px-5">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/55">
            Corridor &middot; Pune → Dublin
          </p>
          <h3 className="mt-0.5 font-heading text-[18px] font-semibold tracking-[-0.01em]">
            Your corridor
          </h3>
        </div>
        <span className="flex h-6 items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-white/70">
          Sept 2026
        </span>
      </div>

      {/* Unlock counter */}
      <div className="mt-3 px-5">
        <div className="rounded-[10px] border border-[color:var(--color-primary)]/30 bg-[color:color-mix(in_srgb,var(--color-primary)_8%,transparent)] p-3">
          <div className="flex items-baseline justify-between">
            <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[color:var(--color-primary)]">
              Unlock at 60
            </p>
            <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-white/55">
              51 to go
            </p>
          </div>
          <p className="mt-1 font-heading text-[20px] font-semibold tabular-nums tracking-tight">
            <span className="text-[color:var(--color-primary)]">9</span>
            <span className="text-white/40"> / 60 verified</span>
          </p>
          <div
            aria-hidden="true"
            className="mt-2 h-1 overflow-hidden rounded-full bg-white/10"
          >
            <div
              className="h-full rounded-full bg-[color:var(--color-primary)]"
              style={{ width: "15%" }}
            />
          </div>
        </div>
      </div>

      {/* Member list */}
      <div className="mt-3 flex-1 overflow-hidden px-5">
        <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/55">
          Verified · 9
        </p>
        <ul className="mt-2 flex flex-col gap-1.5">
          {members.map((m, i) => (
            <li
              key={m.name}
              className="flex items-center gap-2 rounded-[8px] border border-white/8 bg-white/[0.03] px-2 py-1.5"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[color:var(--color-primary)]/35 bg-[color:color-mix(in_srgb,var(--color-primary)_12%,transparent)] font-heading text-[10px] font-semibold text-[color:var(--color-primary)]">
                {m.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-white">{m.name}</p>
                <p className="text-[9px] text-white/50">
                  {m.city} &middot; verified
                </p>
              </div>
              <span className="font-mono text-[8.5px] uppercase tracking-[0.08em] text-[color:var(--color-primary)]">
                ✓ {i === 0 ? "now" : i === 1 ? "1h" : `${i}d`}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Intro circles row */}
      <div className="mt-2 px-5 pb-2">
        <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/55">
          Intro circles
        </p>
        <ul className="mt-2 grid grid-cols-3 gap-1.5">
          {[
            { label: "Housing", count: "6" },
            { label: "Studies", count: "4" },
            { label: "Settling in", count: "5" },
          ].map((c) => (
            <li
              key={c.label}
              className="flex flex-col items-center rounded-[8px] border border-white/8 bg-white/[0.03] py-2"
            >
              <span className="font-heading text-[14px] font-semibold tabular-nums text-[color:var(--color-primary)]">
                {c.count}
              </span>
              <span className="mt-0.5 text-[8.5px] text-white/60">
                {c.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* CHAT tab, group chat preview with prompt-scaffolded openers.       */
/* Demonstrates the "no swipe, no read receipts" anti-dating-pattern   */
/* design from v10 §9 and the corridor-mate energy.                    */
/* ------------------------------------------------------------------ */
function ChatScreen() {
  const messages = [
    { from: "Aditya", initials: "AD", body: "Did anyone book through Visa Concierge yet?", time: "6m" },
    { from: "Priya", initials: "PR", body: "Found a 2BHK near Trinity. Anyone in?", time: "12m" },
    { from: "Karan", initials: "KR", body: "Flight booked for Sept 18. Who else?", time: "1h" },
    { from: "Meera", initials: "MH", body: "Mom finally said yes 🥹", time: "2h" },
  ];
  return (
    <div className="flex h-full w-full flex-col">
      <div className="mt-3 flex items-center justify-between px-5">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/55">
            Group chat &middot; Pune → Dublin
          </p>
          <h3 className="mt-0.5 font-heading text-[18px] font-semibold tracking-[-0.01em]">
            Chat
          </h3>
        </div>
        <span className="flex h-6 items-center gap-1 rounded-full border border-[color:var(--color-primary)]/40 bg-[color:color-mix(in_srgb,var(--color-primary)_10%,transparent)] px-2 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-primary)]">
          <span className="h-1 w-1 rounded-full bg-[color:var(--color-primary)]" />
          9 online
        </span>
      </div>

      {/* Prompt scaffold */}
      <div className="mt-3 px-5">
        <div className="rounded-[8px] border border-white/8 bg-white/[0.03] p-2">
          <p className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-white/55">
            Today&rsquo;s prompt
          </p>
          <p className="mt-1 text-[11px] leading-[1.35] text-white/90">
            One thing you already know about Dublin.
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="mt-3 flex-1 overflow-hidden px-5">
        <ul className="flex flex-col gap-2">
          {messages.map((m) => (
            <li key={m.from} className="flex gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-primary)]/35 bg-[color:color-mix(in_srgb,var(--color-primary)_12%,transparent)] font-heading text-[9.5px] font-semibold text-[color:var(--color-primary)]">
                {m.initials}
              </span>
              <div className="min-w-0 flex-1 rounded-[10px] border border-white/8 bg-white/[0.03] px-2 py-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[10px] font-semibold text-white">
                    {m.from}
                  </p>
                  <p className="font-mono text-[8px] uppercase tracking-[0.08em] text-white/45">
                    {m.time}
                  </p>
                </div>
                <p className="mt-0.5 text-[10.5px] leading-[1.4] text-white/85">
                  {m.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Compose mock */}
      <div className="mx-5 mb-2 mt-2 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
        <span className="flex-1 text-[10.5px] text-white/45">
          Reply to the group…
        </span>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]">
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 6h8M7 2l3 4-3 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* YOU tab, profile card with verification status, corridor info,     */
/* and the parent-view toggle (Premium feature). Shows the v10 §3.1    */
/* three-check verification stack as a real product surface.           */
/* ------------------------------------------------------------------ */
function YouScreen() {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="mt-3 px-5">
        <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/55">
          Your profile
        </p>
      </div>

      {/* Profile header */}
      <div className="mt-3 flex items-center gap-3 px-5">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--color-primary)]/40 bg-[color:color-mix(in_srgb,var(--color-primary)_14%,transparent)] font-heading text-[14px] font-semibold text-[color:var(--color-primary)]">
          AS
        </span>
        <div className="min-w-0">
          <p className="font-heading text-[15px] font-semibold leading-tight text-white">
            Aayush S.
          </p>
          <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-white/55">
            Pune → Dublin · UCD · Sept 2026
          </p>
        </div>
      </div>

      {/* Verification stack */}
      <div className="mt-4 px-5">
        <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/55">
          Verification &middot; 3 / 3
        </p>
        <ul className="mt-2 flex flex-col gap-1.5">
          {[
            { label: "Phone OTP", sub: "Number hashed on arrival" },
            { label: "DigiLocker Aadhaar", sub: "Token stored, never the number" },
            { label: "Admit letter", sub: "Human-reviewed within 48h" },
          ].map((v) => (
            <li
              key={v.label}
              className="flex items-center gap-2 rounded-[8px] border border-white/8 bg-white/[0.03] px-2 py-1.5"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]">
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path
                    d="M2 6l3 3 5-6"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10.5px] font-medium text-white">
                  {v.label}
                </p>
                <p className="text-[8.5px] text-white/50">{v.sub}</p>
              </div>
              <span className="font-mono text-[8.5px] uppercase tracking-[0.08em] text-[color:var(--color-primary)]">
                ✓
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Parent view toggle */}
      <div className="mt-3 px-5">
        <div className="flex items-center justify-between rounded-[10px] border border-[color:var(--color-primary)]/25 bg-[color:color-mix(in_srgb,var(--color-primary)_6%,transparent)] px-3 py-2">
          <div className="min-w-0">
            <p className="text-[10.5px] font-medium text-white">
              Parent view
            </p>
            <p className="mt-0.5 text-[8.5px] text-white/55">
              Premium &middot; Group + arrival only
            </p>
          </div>
          <span className="flex h-4 w-7 items-center rounded-full bg-[color:var(--color-primary)]/30 p-0.5">
            <span className="h-3 w-3 translate-x-3 rounded-full bg-[color:var(--color-primary)]" />
          </span>
        </div>
      </div>

      {/* Bottom system row */}
      <div className="mt-auto mb-2 flex items-center gap-2 px-5">
        <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)]" />
        <p className="text-[9.5px] text-white/55">
          Account active &middot; corridor secured
        </p>
      </div>
    </div>
  );
}

function TabIcon({
  label,
  active = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={`Switch to ${label} tab`}
      className={`flex flex-col items-center gap-0.5 rounded-md px-2 py-1 transition-colors ${
        active ? "text-white" : "text-white/45 hover:text-white/75"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full transition-colors ${
          active ? "bg-[color:var(--color-primary)]" : "bg-white/30"
        }`}
      />
      <span className="text-[8.5px] font-medium leading-none">{label}</span>
    </button>
  );
}
