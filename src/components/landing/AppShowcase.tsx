"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BadgeCheck, Check, Loader2 } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PhoneDevice, PhoneStatusBar } from "@/components/ui/PhoneDevice";

/**
 * AppShowcase. The "here's what the app actually is" section. Desktop:
 * sticky phone on the left, three scrollable story panels on the right.
 * As each panel enters the viewport the phone screen swaps to that
 * panel's mock. Mobile: same three panels, stacked, each with its own
 * phone.
 *
 * Keeping the transition logic to a simple index-in-state (set from
 * onViewportEnter) avoids the weight of a useScroll + useTransform
 * chain for what reads as a three-step story. Feels instantaneous.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

type Slide = {
  kicker: string;
  title: string;
  body: string;
};

const SLIDES: Slide[] = [
  {
    kicker: "Step 01 · Verify",
    title: "Four checks. Under an hour.",
    body:
      "Phone OTP. DigiLocker. Admit letter. A real human reviewer. If anything doesn't match, you don't get in. Neither does anyone else.",
  },
  {
    kicker: "Step 02 · Your group",
    title: "Ten students. Your corridor.",
    body:
      "The app matches you with students going to the same country, the same month. Not 500 strangers. Ten people you'll actually meet.",
  },
  {
    kicker: "Step 03 · Land together",
    title: "Day one feels like day ten.",
    body:
      "Pinned meet-up at the airport. A group chat that's been live for months. You land into people, not a new continent.",
  },
];

export function AppShowcase() {
  const [active, setActive] = useState(0);

  return (
    <section className="relative overflow-hidden border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-24 md:py-40">
      <div className="container-narrow">
        <div className="mx-auto max-w-[820px] text-center">
          <SectionLabel className="mx-auto">The app</SectionLabel>
          <h2
            className="mt-4 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(36px, 5.5vw, 68px)",
              lineHeight: 0.98,
              letterSpacing: "-0.03em",
            }}
          >
            Verify. Match. Land together.{" "}
            <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-fg-muted)]">
              That&apos;s the whole app.
            </span>
          </h2>
        </div>

        {/* Desktop: sticky phone + scrolling panels. Mobile: stacked. */}
        <div className="mt-16 grid gap-12 md:mt-24 md:grid-cols-12 md:gap-16">
          {/* Sticky phone column (desktop). Hidden on mobile - each
              mobile panel renders its own inline phone below. */}
          <div className="hidden md:col-span-5 md:block">
            <div className="sticky top-24 flex items-center justify-center">
              <PhoneDevice width={320} glow>
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
            </div>
          </div>

          {/* Story panels */}
          <div className="md:col-span-7">
            <ol className="flex flex-col gap-24 md:gap-48">
              {SLIDES.map((slide, i) => (
                <motion.li
                  key={slide.title}
                  onViewportEnter={() => setActive(i)}
                  viewport={{ amount: 0.6, margin: "-20% 0px -20% 0px" }}
                  className="relative"
                >
                  {/* Mobile-only inline phone. Hidden on desktop where
                      the sticky phone handles the transition. */}
                  <div className="mb-8 flex justify-center md:hidden">
                    <PhoneDevice width={280}>
                      <ShowcaseScreen index={i} />
                    </PhoneDevice>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.6, ease: EASE }}
                  >
                    <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-primary)]">
                      {slide.kicker}
                    </p>
                    <h3
                      className="mt-3 max-w-[520px] font-heading font-semibold text-[color:var(--color-fg)]"
                      style={{
                        fontSize: "clamp(28px, 3.8vw, 44px)",
                        lineHeight: 1.05,
                        letterSpacing: "-0.025em",
                      }}
                    >
                      {slide.title}
                    </h3>
                    <p className="mt-5 max-w-[480px] text-[16px] leading-[1.6] text-[color:var(--color-fg-muted)]">
                      {slide.body}
                    </p>
                  </motion.div>
                </motion.li>
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
    { label: "DigiLocker · Aadhaar", status: "active" as const },
    { label: "Admit letter", status: "pending" as const },
    { label: "Group unlocks", status: "pending" as const },
  ];
  return (
    <div className="flex h-full w-full flex-col bg-[color:var(--color-bg)] text-white">
      <PhoneStatusBar />
      <div className="mt-4 flex-1 px-5">
        <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/60">
          Verification · 2 of 4
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
            initial={{ width: "25%" }}
            animate={{ width: "50%" }}
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
            Matched · Sept 2026
          </p>
          <h3 className="mt-0.5 font-heading text-[20px] font-semibold tracking-[-0.015em]">
            Your group
          </h3>
        </div>
        <span className="rounded-full border border-[color:var(--color-primary)]/40 bg-[color:color-mix(in_srgb,var(--color-primary)_12%,transparent)] px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-primary)]">
          9 / 10
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
            <span className="font-semibold text-white">Meet your 10th member</span>
            <br />
            <span className="text-white/55">Invite a classmate going in Sept</span>
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
          Got seats. Ordering chais for 9. ☕
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
