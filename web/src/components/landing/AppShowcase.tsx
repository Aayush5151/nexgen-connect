"use client";

import { motion } from "framer-motion";

/**
 * AppShowcase, "Verify. Match. Land together."
 *
 * v19 redesign matching the reference architecture the user shipped:
 * three step cards, each carrying its own product mock UI inside the
 * card. Desktop renders all three side-by-side; mobile stacks them
 * vertically and lets native scroll handle the progression.
 *
 * Layout history:
 *   - v19a shipped a scroll-jacked horizontal carousel on mobile
 *     (cards translated horizontally as the user scrolled vertically
 *     through a 280vh sticky wrapper). The intent was a delightful
 *     reveal; in practice it felt cramped — neighbouring cards
 *     peeked from both edges, fighting touch-scroll momentum — and
 *     the user named it as a top cause of "stupid and conjusted"
 *     mobile feel. v19b drops the horizontal jack entirely and
 *     stacks the same three cards in a single responsive grid.
 *
 * Card pattern (consistent across all three):
 *   - mono header (STEP NN · DURATION)
 *   - sans heading with serif italic accent on the emphasis phrase
 *   - 2–3 line body explaining what happens
 *   - product mock UI inside the card, framed by a subtle inner
 *     border so the mock reads as a screenshot, not a fact list
 *
 * v10 alignment:
 *   - Step 01 · 90 seconds: three-check verification flow
 *     (Phone OTP, DigiLocker, admit letter, admit takes longer
 *      but the mock shows the live state of each step)
 *   - Step 02 · 10 minutes: corridor unlock mechanic, 8 faces in
 *     the avatar grid is the inner-circle visible-from-your-view
 *     slice; the 60-verified threshold is the system-level rule
 *   - Step 03 · day one: post-arrival group chat showing the
 *     intent of the product
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
    <section className="relative bg-[color:var(--color-bg)] py-16 md:flex md:min-h-[100dvh] md:items-center md:overflow-hidden md:py-24">
      <div className="container-narrow w-full">
        <div className="mx-auto max-w-[1280px]">
          <div className="mx-auto max-w-[860px] text-center">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="inline-flex items-center gap-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-primary)] md:text-[11px]"
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
              className="mt-4 font-heading font-semibold text-balance text-[color:var(--color-fg)] md:mt-6"
              style={{
                fontSize: "clamp(28px, 5.2vw, 64px)",
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

          {/* One responsive grid: stacked on mobile, three-up on md+.
              No scroll-jacking, no horizontal carousel — just native
              vertical scroll on phones so neighbouring cards never
              peek into the viewport. */}
          <ul className="mt-10 grid grid-cols-1 gap-5 md:mt-14 md:grid-cols-3 md:gap-4 lg:gap-6">
            {STEPS.map((step, i) => (
              <motion.li
                key={step.key}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: EASE, delay: i * 0.08 }}
                className="flex flex-col rounded-[18px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 md:p-7"
              >
                <p className="mx-auto inline-flex items-center justify-center rounded-full border border-[color:var(--color-primary)]/35 bg-[color:color-mix(in_srgb,var(--color-primary)_10%,transparent)] px-3 py-1.5 text-center font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-primary)] md:px-3.5 md:text-[11px]">
                  {step.kicker}
                </p>

                <h3
                  className="mt-6 font-heading font-semibold text-[color:var(--color-fg)] md:mt-10"
                  style={{
                    fontSize: "clamp(22px, 2.4vw, 30px)",
                    lineHeight: 1.15,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {step.headline}
                </h3>

                <p
                  className="mt-4 text-[color:var(--color-fg-muted)] md:mt-5"
                  style={{
                    fontSize: "clamp(13.5px, 1.05vw, 15px)",
                    lineHeight: 1.55,
                  }}
                >
                  {step.body}
                </p>

                <div className="flex-1" aria-hidden="true" />

                <div className="mt-6 md:mt-10">
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
        <ChatRow from="Aditya">Landed. Walking to T1 meet 🚶</ChatRow>
        <ChatRow from="Priya">Green jacket, blue cap. Near Costa.</ChatRow>
        <ChatRow from="You" self>
          On the airbridge. 3 minutes.
        </ChatRow>
        <ChatRow from="Karan">Got seats. Chais for the group ☕</ChatRow>
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
