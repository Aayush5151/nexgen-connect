"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { BadgeCheck, Check, Loader2 } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PhoneDevice, PhoneStatusBar } from "@/components/ui/PhoneDevice";

/**
 * AppShowcase. The "here's what the app actually is" section. Desktop:
 * sticky phone on the left, three scrollable story panels on the right.
 * As the reader scrolls through the section, the phone screen swaps to
 * match whichever story panel they're currently on. Mobile: same three
 * panels, stacked, each with its own inline phone.
 *
 * v10 pass - fixes the three complaints that broke the section:
 *   1. The phone screen was changing too early into step 2 and too late
 *      into step 3. Old thresholds were 0.42 / 0.68 which mapped to the
 *      wrong reading beats. New thresholds 0.46 / 0.60 centre each swap
 *      on the body of the matching story panel, not the kicker above or
 *      the body below.
 *   2. The sticky phone had no visible "which step is this?" label - it
 *      relied on the reader synchronising what they were reading with
 *      what was painted. Step pills above the phone now name each screen
 *      (Step 01 / 02 / 03) so the mapping is explicit.
 *   3. The phone could not be controlled. The step pills are now also
 *      buttons: clicking one jumps to that screen and suspends scroll-
 *      driven swaps for 5 seconds, so a curious reader can step through
 *      without having to re-scroll the whole section.
 *
 * Also new: once the reader has scrolled past the section (progress >
 * 0.82 of the scroll journey), the phone enters a gentle auto-loop -
 * 2.8s per screen - so late arrivals, tab-away-tab-back users, and
 * anyone who scrolled quickly past still see every screen. The loop
 * respects manual overrides.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

type Slide = {
  step: string;
  label: string;
  kicker: string;
  timing: string;
  title: string;
  body: string;
};

const SLIDES: Slide[] = [
  {
    step: "01",
    label: "Verify",
    kicker: "Step 01 \u00b7 Verify",
    timing: "First 90 seconds",
    title: "Three checks. No fakes.",
    body:
      "Phone OTP, DigiLocker Aadhaar, and a real human checking your admit letter. If anything doesn\u2019t match, you don\u2019t get in. Neither does anyone else.",
  },
  {
    step: "02",
    label: "Your group",
    kicker: "Step 02 \u00b7 Your group",
    timing: "Minutes 2 \u2013 10",
    title: "A group of eight, not a crowd of 500.",
    body:
      "In the first ten minutes, you see the faces of your group \u2014 people from your city, your university, your flight month. Not strangers. Classmates, before class starts.",
  },
  {
    step: "03",
    label: "Land together",
    kicker: "Step 03 \u00b7 Land together",
    timing: "Day 1 \u2192 landing day",
    title: "Day one feels like week two.",
    body:
      "By the time you board, your group has been talking for weeks. Flights, accommodation, what to actually pack. You land into people you already know \u2014 not a new continent alone.",
  },
];

export function AppShowcase() {
  const [active, setActive] = useState(0);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  // Timestamp (ms since epoch) at which manual override expires. Using a
  // ref so setInterval ticks always see the current value without having
  // to re-subscribe the effect on every manual click.
  const manualUntilRef = useRef(0);
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    // Flip the auto-loop "armed" flag once the reader has scrolled past
    // the section's body. Never flip back - we want the loop to keep
    // running for anyone who scrolled past and came back up.
    if (progress > 0.82 && !hasReachedEnd) setHasReachedEnd(true);

    // Manual override freezes scroll-driven swaps briefly so the user's
    // click actually sticks on the screen they chose.
    if (Date.now() < manualUntilRef.current) return;

    let next: number;
    if (progress < 0.46) next = 0;
    else if (progress < 0.60) next = 1;
    else next = 2;
    setActive((current) => (current === next ? current : next));
  });

  useEffect(() => {
    if (!hasReachedEnd) return;
    const id = setInterval(() => {
      if (Date.now() < manualUntilRef.current) return;
      setActive((prev) => (prev + 1) % SLIDES.length);
    }, 2800);
    return () => clearInterval(id);
  }, [hasReachedEnd]);

  const handleStepSelect = (i: number) => {
    manualUntilRef.current = Date.now() + 5000;
    setActive(i);
  };

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-10 sm:py-12 md:py-14"
    >
      <div className="container-narrow">
        <div className="mx-auto max-w-[820px] text-center">
          <SectionLabel className="mx-auto">The app</SectionLabel>
          <h2
            className="mt-3 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(22px, 4.5vw, 42px)",
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
            }}
          >
            Verify. Match.{" "}
            <span className="whitespace-nowrap">Land together.</span>{" "}
            <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-fg-muted)]">
              That&apos;s the whole app.
            </span>
          </h2>
        </div>

        {/* Desktop: sticky phone + scrolling panels. Mobile: stacked. */}
        <div className="mt-6 grid gap-6 sm:mt-8 sm:gap-8 md:mt-8 md:grid-cols-12 md:gap-10">
          {/* Sticky phone column (desktop). Hidden on mobile - each
              mobile panel renders its own inline phone below. */}
          <div className="hidden md:col-span-5 md:block">
            <div className="sticky top-24 flex flex-col items-center gap-4">
              {/* Step pills above the phone. Double-duty:
                  (a) visible "which screen is this?" label
                  (b) clickable navigation for curious readers */}
              <div
                role="tablist"
                aria-label="App showcase steps"
                className="flex items-center gap-1 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-1 shadow-sm"
              >
                {SLIDES.map((s, i) => (
                  <button
                    key={s.step}
                    type="button"
                    role="tab"
                    aria-selected={active === i}
                    aria-label={`Show ${s.label}`}
                    onClick={() => handleStepSelect(i)}
                    className={`rounded-full px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] transition-all ${
                      active === i
                        ? "bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)] shadow-sm"
                        : "text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]"
                    }`}
                  >
                    Step {s.step}
                  </button>
                ))}
              </div>

              <PhoneDevice width={240} glow>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="absolute inset-0"
                  >
                    <ShowcaseScreen index={active} />
                  </motion.div>
                </AnimatePresence>
              </PhoneDevice>

              {/* Quiet hint that matches the label of the current step.
                  Reinforces the pill state without adding another chrome
                  element above the phone. */}
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
                {SLIDES[active].label}
              </p>
            </div>
          </div>

          {/* Story panels */}
          <div className="md:col-span-7">
            <ol className="flex flex-col gap-8 sm:gap-10 md:gap-14">
              {SLIDES.map((slide, i) => (
                <li key={slide.title} className="relative">
                  {/* Mobile-only inline phone. Hidden on desktop where
                      the sticky phone handles the transition. */}
                  <div className="mb-3 flex justify-center sm:mb-4 md:hidden">
                    <PhoneDevice width={190}>
                      <ShowcaseScreen index={i} />
                    </PhoneDevice>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.6, ease: EASE }}
                  >
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-primary)]">
                        {slide.kicker}
                      </p>
                      <span
                        aria-hidden="true"
                        className="hidden h-[3px] w-[3px] rounded-full bg-[color:var(--color-border-strong)] sm:inline-block"
                      />
                      <span className="inline-flex items-center rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] px-2 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-muted)]">
                        {slide.timing}
                      </span>
                    </div>
                    <h3
                      className="mt-2 max-w-[520px] font-heading font-semibold text-[color:var(--color-fg)]"
                      style={{
                        fontSize: "clamp(20px, 4vw, 36px)",
                        lineHeight: 1.1,
                        letterSpacing: "-0.025em",
                      }}
                    >
                      {slide.title}
                    </h3>
                    <p className="mt-3 max-w-[480px] text-[14px] leading-[1.55] text-[color:var(--color-fg-muted)] sm:mt-4 sm:text-[15px]">
                      {slide.body}
                    </p>
                  </motion.div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Mock screens for each showcase step.                                 */
/* ------------------------------------------------------------------ */

function ShowcaseScreen({ index }: { index: number }) {
  if (index === 0) return <VerifyScreen />;
  if (index === 1) return <GroupScreen />;
  return <LandingScreen />;
}

function VerifyScreen() {
  const steps = [
    { label: "Phone OTP", status: "done" as const },
    { label: "DigiLocker \u00b7 Aadhaar", status: "active" as const },
    { label: "Admit letter", status: "pending" as const },
  ];
  return (
    <div className="flex h-full w-full flex-col bg-[color:var(--color-bg)] text-white">
      <PhoneStatusBar />
      <div className="mt-4 flex-1 px-5">
        <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/60">
          Verification · 2 of 3
        </p>
        <h3 className="mt-1 font-heading text-[22px] font-semibold leading-[1.1] tracking-[-0.02em]">
          Verifying with
          <br />
          <span className="text-[color:var(--color-primary)]">DigiLocker</span>.
        </h3>

        <div
          aria-hidden="true"
          className="mt-5 h-1 w-full overflow-hidden rounded-full bg-white/10"
        >
          <motion.div
            initial={{ width: "33%" }}
            animate={{ width: "66%" }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              repeatType: "reverse",
              ease: EASE,
            }}
            className="h-full rounded-full bg-[color:var(--color-primary)]"
          />
        </div>

        <ul className="mt-6 flex flex-col gap-3">
          {steps.map((s) => (
            <li
              key={s.label}
              className="flex items-center gap-3 rounded-[10px] border border-white/8 bg-white/[0.03] px-3 py-2.5"
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  s.status === "done"
                    ? "bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]"
                    : s.status === "active"
                      ? "border border-[color:var(--color-primary)] bg-[color:color-mix(in_srgb,var(--color-primary)_18%,transparent)] text-[color:var(--color-primary)]"
                      : "border border-white/15 bg-transparent text-white/40"
                }`}
              >
                {s.status === "done" && (
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                )}
                {s.status === "active" && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.5} />
                )}
              </span>
              <div className="flex-1">
                <p className="text-[12px] font-medium text-white/95">{s.label}</p>
                {s.status === "active" && (
                  <p className="mt-0.5 text-[10px] text-white/55">
                    Consent screen open on DigiLocker…
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="px-5 pb-6">
        <div className="flex items-center justify-center rounded-full border border-white/8 bg-white/[0.04] py-2">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-white/55">
            Your phone number is hashed on arrival
          </span>
        </div>
      </div>
    </div>
  );
}

function GroupScreen() {
  const people = [
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
  return (
    <div className="flex h-full w-full flex-col bg-[color:var(--color-bg)] text-white">
      <PhoneStatusBar />

      <div className="mt-4 flex items-center justify-between px-5">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/60">
            Matched · Oct 2026 · TUM
          </p>
          <h3 className="mt-0.5 font-heading text-[20px] font-semibold tracking-[-0.015em]">
            Your group
          </h3>
        </div>
        <span className="rounded-full border border-[color:var(--color-primary)]/40 bg-[color:color-mix(in_srgb,var(--color-primary)_12%,transparent)] px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-primary)]">
          09 verified
        </span>
      </div>

      <div className="mt-4 px-5">
        <ul className="flex flex-col gap-2">
          {people.slice(0, 5).map((p, i) => (
            <li
              key={p.name}
              className="flex items-center gap-3 rounded-[10px] border border-white/8 bg-white/[0.03] px-3 py-2"
            >
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-primary)]/35 bg-[color:color-mix(in_srgb,var(--color-primary)_14%,transparent)] font-heading text-[12px] font-semibold text-[color:var(--color-primary)]">
                {p.initials}
                <span
                  aria-hidden="true"
                  className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-black bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]"
                >
                  <BadgeCheck className="h-2.5 w-2.5" strokeWidth={3} />
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-medium text-white">
                  {p.name}
                </p>
                <p className="truncate text-[10px] text-white/55">
                  {p.city} · verified {i === 0 ? "2 min ago" : "last week"}
                </p>
              </div>
              <span className="font-mono text-[9px] text-white/40">0{i + 1}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto px-5 pb-6">
        <div className="flex items-center gap-3 rounded-[12px] border border-white/10 bg-white/[0.04] px-3 py-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1 6h10M7 2l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <p className="flex-1 text-[11.5px] leading-tight">
            <span className="font-semibold text-white">Round out your group</span>
            <br />
            <span className="text-white/55">Invite a classmate flying in October</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function LandingScreen() {
  return (
    <div className="flex h-full w-full flex-col bg-[color:var(--color-bg)] text-white">
      <PhoneStatusBar />

      <div className="mt-3 flex items-center justify-between px-5">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/55">
            Airport · DUB T1
          </p>
          <h3 className="mt-0.5 font-heading text-[17px] font-semibold tracking-[-0.01em]">
            Group chat
          </h3>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-[color:var(--color-primary)]/40 bg-[color:color-mix(in_srgb,var(--color-primary)_10%,transparent)] px-2 py-1">
          <span className="relative flex h-1.5 w-1.5">
            <span
              aria-hidden="true"
              className="absolute inset-0 animate-ping rounded-full bg-[color:var(--color-primary)] opacity-70"
            />
            <span className="relative h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)]" />
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-[color:var(--color-primary)]">
            9 online
          </span>
        </div>
      </div>

      <div className="mt-4 flex-1 space-y-2.5 overflow-hidden px-4">
        <Bubble from="Aditya" self={false}>
          Landed. Walking to Terminal 1 meeting point 🚶
        </Bubble>
        <Bubble from="Priya" self={false}>
          Green jacket, blue cap. Near Costa. 👀
        </Bubble>
        <Bubble from="You" self>
          On the airbridge. 3 minutes.
        </Bubble>
        <Bubble from="Karan" self={false}>
          Got seats. Ordering chais for the group. ☕
        </Bubble>
        <Bubble from="You" self>
          Legend. See you in two.
        </Bubble>
      </div>

      <div className="border-t border-white/10 px-4 py-3">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">
          <span className="text-[11px] text-white/40">Message your group…</span>
          <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]">
            <svg
              width="10"
              height="10"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6 1v10M1 6h10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}

function Bubble({
  from,
  self,
  children,
}: {
  from: string;
  self: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex flex-col ${self ? "items-end" : "items-start"}`}
    >
      {!self && (
        <span className="mb-0.5 font-mono text-[8.5px] uppercase tracking-[0.08em] text-white/45">
          {from}
        </span>
      )}
      <div
        className={`max-w-[82%] rounded-[14px] px-3 py-1.5 text-[11.5px] leading-[1.35] ${
          self
            ? "rounded-br-[4px] bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]"
            : "rounded-bl-[4px] bg-white/[0.07] text-white"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
