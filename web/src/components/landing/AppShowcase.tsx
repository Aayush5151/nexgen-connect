"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * AppShowcase, "Verify. Match. Land together."
 *
 * v19c iteration: scroll-jacked horizontal carousel on mobile, but
 * with cards sized to fill exactly one viewport so neighbours never
 * peek. Desktop keeps the side-by-side 3-up grid.
 *
 * Layout history:
 *   - v19a: scroll-jack with 88vw cards. Neighbours peeked from both
 *     edges. User: "stupid and conjusted".
 *   - v19b: dropped scroll-jack, vertical stack on mobile. Removed
 *     the delightful "reveal" beat the user wanted.
 *   - v19c (this): scroll-jack restored with cards exactly w-screen,
 *     gap-0, padding inside the card. As the user scrolls down, the
 *     row translates left in 100vw increments — one full card visible
 *     at a time, no peek.
 *
 * Card pattern (consistent across all three):
 *   - mono header (STEP NN · DURATION)
 *   - sans heading with serif italic accent on the emphasis phrase
 *   - 2-3 line body explaining what happens
 *   - product mock UI inside the card, framed by a subtle inner
 *     border so the mock reads as a screenshot, not a fact list
 *
 * v10 alignment:
 *   - Step 01 · 90 seconds: three-check verification flow
 *   - Step 02 · 10 minutes: corridor unlock mechanic
 *   - Step 03 · day one: post-arrival group chat
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

type StepKey = "verify" | "match" | "land";

type Step = {
  key: StepKey;
  kicker: string;
  headline: React.ReactNode;
  body: string;
};

const STEPS: Step[] = [
  {
    key: "verify",
    kicker: "Step 01 · 90 seconds",
    headline: (
      <>
        Three checks.{" "}
        <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-fg)]">
          No fakes.
        </span>
      </>
    ),
    body: "Phone OTP, DigiLocker Aadhaar, and a human reading your admit letter. If anything doesn't match, you don't get in. Neither does anyone else.",
  },
  {
    key: "match",
    kicker: "Step 02 · 10 minutes",
    headline: (
      <>
        A real group,{" "}
        <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-fg)]">
          not a crowd of 500.
        </span>
      </>
    ),
    body: "Your home city, your destination, your intake month. DMs unlock when sixty verified students share that corridor, until then the group isn't real, and we tell you so.",
  },
  {
    key: "land",
    kicker: "Step 03 · Day one",
    headline: (
      <>
        Day one feels like{" "}
        <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-fg)]">
          week two.
        </span>
      </>
    ),
    body: "By the time you board, you've been talking for weeks. Flights, flats, what to actually pack. You land into people you already know.",
  },
];

/* ------------------------------------------------------------------ */
/* AppShowcase, scroll-jacked on mobile.                               */
/*                                                                     */
/* Mobile (<md): outer wrapper is 280vh tall. Inside, a sticky inner   */
/* container is pinned to the viewport. As the user scrolls vertically */
/* through the wrapper, scrollYProgress goes 0 → 1, and the cards row  */
/* translates horizontally from card 1 to card 3. Once scrollYProgress */
/* reaches 1, the user has fully revealed all 3 cards and natural      */
/* vertical scroll continues into the next section. Scrolling back up  */
/* reverses the horizontal animation. No CSS sticky-scroll-jacking     */
/* hack - pure useScroll + useTransform reading the wrapper's progress.*/
/*                                                                     */
/* Desktop (md+): all 3 cards visible at once in a 3-col grid, no      */
/* scroll jack needed. Single section, single layout, conditional      */
/* sticky+translate behavior.                                          */
/* ------------------------------------------------------------------ */

export function AppShowcase() {
  return (
    <>
      <MobileCarousel />
      <DesktopGrid />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile (<md): scroll-jacked horizontal carousel.                    */
/*                                                                     */
/* Outer wrapper is 300vh tall. The inner container is `sticky top-0   */
/* h-screen` so it stays pinned while the user scrolls vertically      */
/* through the wrapper. scrollYProgress (0 → 1) drives the cards-row   */
/* translateX from 0vw → -200vw (each card is exactly 100vw, so this   */
/* slides card 2 in, then card 3). Each card has its OWN internal      */
/* padding — card outer is 100vw, content is `px-6`-bounded. No peek   */
/* because gap is 0 and width is exact.                                */
/* ------------------------------------------------------------------ */

function MobileCarousel() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });

  // 3 cards × 100vw = 300vw. To bring card 3 into the viewport we
  // translate by -200vw.
  //
  // v18 mobile-trim: previously the keyframes were [0, 0.05, 0.95, 1]
  // with values [0vw, 0vw, -200vw, -200vw] — a continuous slide from
  // card 1 to card 3 with only dwells at the very start and very end.
  // On a phone this caused the middle of the scroll journey to render
  // partial halves of cards 1+2 or 2+3 side-by-side (e.g. at 50%
  // scroll, x ≈ -111vw shows ~89% of card 2 plus ~11% of card 3 on
  // the right edge). User-visible bug.
  //
  // Fix: add explicit dwells on each card position so the user
  // actually rests on each card for the bulk of its scroll segment.
  // The transition windows are short (10% each) — fast enough to
  // feel snappy, with the rest of the scroll spent on a fully-
  // landed card.
  //
  //   0%   – 30%   card 1 (rest)
  //   30%  – 40%   transition 1 → 2
  //   40%  – 65%   card 2 (rest)
  //   65%  – 75%   transition 2 → 3
  //   75%  – 100%  card 3 (rest)
  const cardsX = useTransform(
    scrollYProgress,
    [0, 0.30, 0.40, 0.65, 0.75, 1],
    ["0vw", "0vw", "-100vw", "-100vw", "-200vw", "-200vw"],
  );

  // Active-step indicator (1/2/3). Drives the dot row under the H2.
  const activeStep = useTransform(scrollYProgress, (v) => {
    if (v < 0.34) return 1;
    if (v < 0.67) return 2;
    return 3;
  });

  return (
    <div
      ref={wrapRef}
      className="relative bg-[color:var(--color-bg)] md:hidden"
      style={{ height: "300vh" }}
      aria-label="The flow, scroll to advance"
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="px-6 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="inline-flex items-center gap-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-primary)]"
          >
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)]"
            />
            The flow
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
            className="mt-3 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(26px, 5.2vw, 48px)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            Verify. Match.{" "}
            <span className="font-serif font-normal italic tracking-[-0.02em] text-[color:var(--color-fg)]">
              Land together.
            </span>
          </motion.h2>

          <div
            aria-hidden="true"
            className="mt-3 flex items-center justify-center gap-2"
          >
            {[1, 2, 3].map((n) => (
              <StepDot key={n} active={activeStep} step={n} />
            ))}
          </div>
        </div>

        {/* Cards row. No gap, no padding on the row itself — every
            card is exactly 100vw with content padded internally. */}
        <motion.ul className="mt-6 flex" style={{ x: cardsX }}>
          {STEPS.map((step) => (
            <li
              key={step.key}
              className="flex w-screen shrink-0 px-4"
            >
              <div className="mx-auto flex w-full flex-col rounded-[18px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5">
                <p className="mx-auto inline-flex items-center justify-center rounded-full border border-[color:var(--color-primary)]/35 bg-[color:color-mix(in_srgb,var(--color-primary)_10%,transparent)] px-3 py-1.5 text-center font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-primary)]">
                  {step.kicker}
                </p>

                <h3
                  className="mt-5 font-heading font-semibold text-[color:var(--color-fg)]"
                  style={{
                    fontSize: "clamp(20px, 4.6vw, 26px)",
                    lineHeight: 1.15,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {step.headline}
                </h3>

                <p
                  className="mt-3 text-[color:var(--color-fg-muted)]"
                  style={{
                    fontSize: "clamp(13px, 3.4vw, 15px)",
                    lineHeight: 1.5,
                  }}
                >
                  {step.body}
                </p>

                <div className="flex-1" aria-hidden="true" />

                <div className="mt-5">
                  {step.key === "verify" && <VerifyMock />}
                  {step.key === "match" && <MatchMock />}
                  {step.key === "land" && <LandMock />}
                </div>
              </div>
            </li>
          ))}
        </motion.ul>

        <p
          aria-hidden="true"
          className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--color-fg-subtle)]"
        >
          Keep scrolling
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Desktop (md+): 3-up grid, no scroll-jack.                           */
/* ------------------------------------------------------------------ */

function DesktopGrid() {
  return (
    <section className="relative hidden bg-[color:var(--color-bg)] md:flex md:min-h-[100dvh] md:items-center md:overflow-hidden md:py-24">
      <div className="container-narrow w-full">
        <div className="mx-auto max-w-[1280px]">
          <div className="mx-auto max-w-[860px] text-center">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-primary)]"
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)]"
              />
              The flow
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
              className="mt-6 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
              style={{
                fontSize: "clamp(34px, 5.2vw, 64px)",
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
              }}
            >
              Verify. Match.{" "}
              <span className="font-serif font-normal italic tracking-[-0.02em] text-[color:var(--color-fg)]">
                Land together.
              </span>
            </motion.h2>
          </div>

          <ul className="mt-14 grid grid-cols-3 gap-4 lg:gap-6">
            {STEPS.map((step, i) => (
              <motion.li
                key={step.key}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: EASE, delay: i * 0.08 }}
                className="flex flex-col rounded-[18px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-7"
              >
                <p className="mx-auto inline-flex items-center justify-center rounded-full border border-[color:var(--color-primary)]/35 bg-[color:color-mix(in_srgb,var(--color-primary)_10%,transparent)] px-3.5 py-1.5 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-primary)]">
                  {step.kicker}
                </p>

                <h3
                  className="mt-10 font-heading font-semibold text-[color:var(--color-fg)]"
                  style={{
                    fontSize: "clamp(22px, 2.4vw, 30px)",
                    lineHeight: 1.15,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {step.headline}
                </h3>

                <p
                  className="mt-5 text-[color:var(--color-fg-muted)]"
                  style={{
                    fontSize: "clamp(13.5px, 1.05vw, 15px)",
                    lineHeight: 1.55,
                  }}
                >
                  {step.body}
                </p>

                <div className="flex-1" aria-hidden="true" />

                <div className="mt-10">
                  {step.key === "verify" && <VerifyMock />}
                  {step.key === "match" && <MatchMock />}
                  {step.key === "land" && <LandMock />}
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* Step indicator dot — reads the live activeStep MotionValue and
   animates its width + opacity when its number matches. */
function StepDot({
  active,
  step,
}: {
  active: { get: () => number };
  step: number;
}) {
  const isActive = useTransform(active as never, (v: number) => v === step);
  const width = useTransform(isActive, (a: boolean) => (a ? "20px" : "6px"));
  const opacity = useTransform(isActive, (a: boolean) => (a ? 1 : 0.4));
  return (
    <motion.span
      style={{ width, opacity }}
      className="h-1.5 rounded-full bg-[color:var(--color-primary)] transition-[width] duration-300 ease-out"
    />
  );
}

/* ------------------------------------------------------------------ */
/* MOCKS, embedded product UI panels for each step card.              */
/* ------------------------------------------------------------------ */

function VerifyMock() {
  return (
    <div className="rounded-[14px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] p-3.5 sm:p-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--color-fg-subtle)]">
          Verification
        </p>
        <p className="font-mono text-[10px] tabular-nums uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
          2 / 3
        </p>
      </div>

      <ul className="mt-3 flex flex-col gap-2">
        {/* Done */}
        <li className="flex items-center justify-between gap-3 rounded-[10px] border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] px-3 py-2.5">
          <span className="text-[12.5px] text-[color:var(--color-fg)]">
            Phone OTP
          </span>
          <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-primary)]">
            <span aria-hidden="true">✓</span>
            Done
          </span>
        </li>

        {/* Live, primary tinted */}
        <li className="flex items-center justify-between gap-3 rounded-[10px] border border-[color:var(--color-primary)]/45 bg-[color:color-mix(in_srgb,var(--color-primary)_10%,transparent)] px-3 py-2.5">
          <span className="text-[12.5px] text-[color:var(--color-fg)]">
            DigiLocker · Aadhaar
          </span>
          <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-primary)]">
            <span
              aria-hidden="true"
              className="relative flex h-1.5 w-1.5"
            >
              <span className="absolute inset-0 animate-ping rounded-full bg-[color:var(--color-primary)] opacity-75" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)]" />
            </span>
            Live
          </span>
        </li>

        {/* Pending */}
        <li className="flex items-center justify-between gap-3 rounded-[10px] border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] px-3 py-2.5">
          <span className="text-[12.5px] text-[color:var(--color-fg)]">
            Admit letter · human review
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full border border-[color:var(--color-fg-subtle)]"
            />
            Pending
          </span>
        </li>
      </ul>
    </div>
  );
}

// Per v10 §3.2 the corridor is home-city × destination-city ×
// intake-month, so a real Pune user's group is all Pune
// students. The differentiator inside the group is the destination
// university (UCD, Trinity, DCU, etc. all sit inside the Pune →
// Dublin corridor).
const AVATAR_PALETTE = [
  { initials: "AD", uni: "UCD",       color: "#E8B463" },
  { initials: "PR", uni: "Trinity",   color: "#E8A0AE" },
  { initials: "KR", uni: "DCU",       color: "#00DC82" },
  { initials: "MH", uni: "UCD",       color: "#9DC0F0" },
  { initials: "RV", uni: "TU Dublin", color: "#F2C870" },
  { initials: "SA", uni: "Maynooth",  color: "#A8E8C2" },
  { initials: "NK", uni: "Trinity",   color: "#D4A8E8" },
];

function MatchMock() {
  return (
    <div className="rounded-[14px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] p-3.5 sm:p-4">
      <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-[color:var(--color-fg-subtle)]">
        Pune → Dublin · Sept 2026
      </p>
      <ul className="mt-3 grid grid-cols-4 gap-x-2 gap-y-3">
        {AVATAR_PALETTE.map((a) => (
          <li key={a.initials + a.uni} className="flex flex-col items-center">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full font-heading text-[11.5px] font-semibold sm:h-11 sm:w-11 sm:text-[12px]"
              style={{
                background: a.color,
                color: "#0A0A0A",
              }}
            >
              {a.initials}
            </span>
            <span className="mt-1.5 font-mono text-[8.5px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
              {a.uni}
            </span>
          </li>
        ))}
        {/* Invite slot */}
        <li className="flex flex-col items-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-[color:var(--color-fg-subtle)] text-[14px] font-light text-[color:var(--color-fg-subtle)] sm:h-11 sm:w-11">
            +
          </span>
          <span className="mt-1.5 font-mono text-[8.5px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
            Invite
          </span>
        </li>
      </ul>
    </div>
  );
}

function LandMock() {
  return (
    <div className="rounded-[14px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] p-3.5 sm:p-4">
      <ul className="flex flex-col gap-2.5">
        <ChatRow from="Aditya">Landed. Walking to T1 meet.</ChatRow>
        <ChatRow from="Priya">Green jacket, blue cap. Near Costa.</ChatRow>
        <ChatRow from="You" self>
          On the airbridge. 3 minutes.
        </ChatRow>
        <ChatRow from="Karan">Got seats. Chais for the group.</ChatRow>
      </ul>
    </div>
  );
}

function ChatRow({
  from,
  self = false,
  children,
}: {
  from: string;
  self?: boolean;
  children: React.ReactNode;
}) {
  return (
    <li className={`flex flex-col ${self ? "items-end" : "items-start"}`}>
      <span className="mb-1 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
        {from}
      </span>
      <div
        className={`max-w-[90%] rounded-[10px] px-3 py-1.5 text-[12px] leading-[1.45] ${
          self
            ? "bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]"
            : "border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] text-[color:var(--color-fg)]"
        }`}
      >
        {children}
      </div>
    </li>
  );
}
