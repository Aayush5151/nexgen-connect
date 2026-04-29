"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * ProblemMoments, "Show, don't tell."
 *
 * v20 redesign: previous "auto-cycling beat carousel" was abstract
 * narration, beat phrases on a black field. The user correctly
 * called it stupid for not pressing on the actual pain point.
 *
 * The pain point is the WhatsApp group itself. So this section now
 * SHOWS one, a live, scrolling mock chat for "Indians → Dublin
 * Sept '26 · 487 members". Three agent-spam messages, a voice
 * note, and one buried real-student question that nobody answers.
 * The chat scrolls up every 3 seconds; new spam keeps arriving.
 *
 * On the right, four hard receipts annotate what the reader is
 * seeing: 487 members, 14 agents, 0 verified, 11 weeks to first
 * real friend (the v10 §2.3 survey number).
 *
 * The visual makes the case the previous narration only hinted at:
 * this is what you have now, and it doesn't work.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

type Msg = {
  who: string;
  initials: string;
  hue: string; // avatar bg color
  agent?: boolean;
  voice?: boolean;
  body?: string;
  time: string;
};

// 12-message spool. The chat advances by one message every 3 seconds
// so the spam always feels fresh and the buried real-student question
// gets pushed out of view exactly the way it does in real WhatsApp
// study-abroad groups.
const STREAM: Msg[] = [
  {
    who: "+91 98XXX 33421",
    initials: "VC",
    hue: "#E8A0AE",
    agent: true,
    body: "VISA + ACCOMMODATION combo deal ✈️ 12K only. Call now.",
    time: "11:42",
  },
  {
    who: "Forex Direct",
    initials: "FD",
    hue: "#E8B463",
    agent: true,
    body: "1 USD = 83.45, lowest rate in market. WhatsApp +91 98XXX 21100",
    time: "11:43",
  },
  {
    who: "+91 87XXX 09812",
    initials: "??",
    hue: "#9DC0F0",
    voice: true,
    time: "11:44",
  },
  {
    who: "Riya P.",
    initials: "RP",
    hue: "#A8E8C2",
    body: "Hi guys, anyone here from Pune going to UCD?",
    time: "11:46",
  },
  {
    who: "Dublin Stay",
    initials: "DS",
    hue: "#F2C870",
    agent: true,
    body: "AFFORDABLE ROOMS DUBLIN. Verified landlord. DM us 🏠",
    time: "11:47",
  },
  {
    who: "+91 99XXX 88110",
    initials: "??",
    hue: "#D4A8E8",
    voice: true,
    time: "11:48",
  },
  {
    who: "Visa Mantra",
    initials: "VM",
    hue: "#E8A0AE",
    agent: true,
    body: "Drop CV + 10th marksheet → we get your visa in 14 days. Tested.",
    time: "11:49",
  },
  {
    who: "+91 76XXX 41098",
    initials: "??",
    hue: "#E8B463",
    body: "JOIN MY OTHER DUBLIN GROUP, this one is dead",
    time: "11:50",
  },
  {
    who: "EduConnect",
    initials: "EC",
    hue: "#9DC0F0",
    agent: true,
    body: "Free profile evaluation 🎓 PG admits in IRE/UK/CA, DM",
    time: "11:51",
  },
  {
    who: "Riya P.",
    initials: "RP",
    hue: "#A8E8C2",
    body: "Bumping. Anyone real here?",
    time: "11:53",
  },
  {
    who: "+91 80XXX 55421",
    initials: "??",
    hue: "#F2C870",
    agent: true,
    body: "Cheap SIM 90GB Dublin Airport, message me 📱",
    time: "11:54",
  },
  {
    who: "Quick Forex",
    initials: "QF",
    hue: "#D4A8E8",
    agent: true,
    body: "Best EUR rate today, lock in before 6pm",
    time: "11:55",
  },
];

const CALLOUTS = [
  { value: "487", label: "members in this group" },
  { value: "14", label: "agents identified in 12 messages" },
  { value: "0", label: "verified peers from your city" },
  { value: "11 wks", label: "median time to first real friend" },
] as const;

export function ProblemMoments() {
  const [head, setHead] = useState(0);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = window.setInterval(() => {
      setHead((h) => (h + 1) % STREAM.length);
    }, 3000);
    return () => window.clearInterval(id);
  }, []);

  // Show 4 messages on the rolling head; on mobile the 4th hides via
  // CSS (3 visible) so the section fits one phone viewport. On sm+
  // the 4th is visible and the chat gives the full WhatsApp horror.
  const visible: Msg[] = [];
  for (let i = 0; i < 4; i++) {
    visible.push(STREAM[(head + i) % STREAM.length]);
  }

  return (
    <section className="relative flex items-center overflow-hidden bg-[color:var(--color-bg)] py-12 sm:py-20 md:min-h-[100dvh] md:py-24">
      <div className="container-narrow w-full">
        <div className="mx-auto max-w-[1280px]">
          {/* Header, kicker + serif-italic headline */}
          <div className="flex flex-col items-start">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="inline-flex items-center gap-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-primary)] sm:text-[11px]"
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)]"
              />
              The problem
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
              className="mt-4 font-heading font-semibold text-balance text-[color:var(--color-fg)] sm:mt-6"
              style={{
                fontSize: "clamp(26px, 5vw, 64px)",
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                maxWidth: "20ch",
              }}
            >
              This is the WhatsApp group{" "}
              <span className="font-serif font-normal italic tracking-[-0.02em] text-[color:var(--color-fg)]">
                you have right now.
              </span>
            </motion.h2>
          </div>

          {/* Two-up: mock chat on the left, callouts on the right.
              On mobile the receipts column collapses to a tight 2x2
              grid below the chat so the section fits one viewport. */}
          <div className="mt-5 grid gap-4 sm:mt-12 sm:gap-8 md:grid-cols-12 md:gap-12 lg:gap-16">
            {/* Left, the mock chat */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
              className="md:col-span-7"
            >
              <div className="overflow-hidden rounded-[14px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] sm:rounded-[18px]">
                {/* WhatsApp-style group header */}
                <div className="flex items-center justify-between gap-2.5 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
                  <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                    <span
                      aria-hidden="true"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#25D366] font-heading text-[11px] font-semibold text-black sm:h-9 sm:w-9 sm:text-[12px]"
                    >
                      IN
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-heading text-[12.5px] font-semibold text-[color:var(--color-fg)] sm:text-[13.5px]">
                        Indians → Dublin Sept &rsquo;26
                      </p>
                      <p className="truncate font-mono text-[9px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)] sm:text-[10px] sm:tracking-[0.1em]">
                        487 members &middot; 12 online
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)] sm:text-[9.5px] sm:tracking-[0.14em]">
                    Live
                  </span>
                </div>

                {/* Messages stream, scrolls upward as new spam arrives.
                    Mobile shows 3 messages (4th hidden) so the section
                    fits one viewport on phones. */}
                <ul className="flex flex-col gap-2 p-3 sm:gap-2.5 sm:p-5">
                  {visible.map((m, i) => (
                    <ChatItem
                      key={`${head}-${i}`}
                      m={m}
                      index={i}
                      hiddenOnMobile={i >= 3}
                    />
                  ))}
                </ul>

                {/* Compose mock, shows what's broken about replying */}
                <div className="flex items-center gap-2 border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-3 py-2.5 sm:px-4 sm:py-3">
                  <span className="flex-1 truncate text-[11px] text-[color:var(--color-fg-subtle)] sm:text-[12px]">
                    Type a message to 487 strangers…
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)] sm:text-[9.5px] sm:tracking-[0.12em]">
                    Disabled
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Right, receipts column. Four hard numbers that name
                what the chat on the left is showing the reader.
                Mobile: tight 2x2 grid (compact). md+: 2x2 grid of
                bordered cards on the right of the chat - each card
                stacks the value above its label so the column reads
                as four equal receipts, not a long vertical list. */}
            <motion.ul
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.32 }}
              className="grid grid-cols-2 gap-x-3 gap-y-2 md:col-span-5 md:content-center md:gap-3 lg:gap-4"
            >
              {CALLOUTS.map((c) => (
                <li
                  key={c.label}
                  className="flex flex-col items-baseline gap-0.5 rounded-[10px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-2.5 md:gap-2 md:rounded-[14px] md:p-5 lg:p-6"
                >
                  <span
                    className="font-heading font-semibold tabular-nums leading-none text-[color:var(--color-fg)]"
                    style={{
                      fontSize: "clamp(22px, 4.4vw, 56px)",
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {c.value}
                  </span>
                  <span
                    className="text-[color:var(--color-fg-muted)]"
                    style={{
                      fontSize: "clamp(10.5px, 1.05vw, 14.5px)",
                      lineHeight: 1.35,
                    }}
                  >
                    {c.label}
                  </span>
                </li>
              ))}
            </motion.ul>
          </div>

          {/* Pivot line at the foot, the resolution. Hidden on mobile
              so ProblemMoments fits one viewport; the next section
              (TrustPillars) already does the resolution. */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.45 }}
            className="hidden max-w-[860px] border-t border-[color:var(--color-border)] font-serif italic tracking-[-0.02em] text-[color:var(--color-fg)] sm:mt-14 sm:block sm:pt-10"
            style={{
              fontSize: "clamp(20px, 3vw, 38px)",
              lineHeight: 1.2,
            }}
          >
            So we built the group chat{" "}
            <span className="text-[color:var(--color-primary)]">
              that actually works.
            </span>
          </motion.p>
        </div>
      </div>
    </section>
  );
}

function ChatItem({
  m,
  index,
  hiddenOnMobile = false,
}: {
  m: Msg;
  index: number;
  hiddenOnMobile?: boolean;
}) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE, delay: index * 0.04 }}
      className={`gap-2 sm:gap-2.5 ${hiddenOnMobile ? "hidden sm:flex" : "flex"}`}
    >
      <span
        aria-hidden="true"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-heading text-[9px] font-semibold sm:h-7 sm:w-7 sm:text-[10px]"
        style={{ background: m.hue, color: "#0A0A0A" }}
      >
        {m.initials}
      </span>
      <div className="min-w-0 flex-1 rounded-[8px] border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] px-2.5 py-1.5 sm:rounded-[10px] sm:px-3">
        <div className="flex items-baseline justify-between gap-2">
          <span className="flex items-center gap-1 truncate text-[10px] font-semibold text-[color:var(--color-fg)] sm:gap-1.5 sm:text-[10.5px]">
            {m.who}
            {m.agent && (
              <span className="rounded-sm bg-[color:var(--color-danger)]/15 px-1 font-mono text-[8px] uppercase tracking-[0.06em] text-[color:var(--color-danger)] sm:text-[8.5px] sm:tracking-[0.08em]">
                Agent
              </span>
            )}
          </span>
          <span className="font-mono text-[8px] uppercase tracking-[0.06em] text-[color:var(--color-fg-subtle)] sm:text-[8.5px] sm:tracking-[0.08em]">
            {m.time}
          </span>
        </div>
        {m.voice ? (
          <div className="mt-1 flex items-center gap-2 sm:mt-1.5">
            <span
              aria-hidden="true"
              className="flex h-4 w-4 items-center justify-center rounded-full bg-[color:var(--color-fg-subtle)]/20 text-[9px] text-[color:var(--color-fg-muted)] sm:h-5 sm:w-5 sm:text-[10px]"
            >
              ▶
            </span>
            {/* Voice waveform, flat dashes, no playback. */}
            <span
              aria-hidden="true"
              className="flex flex-1 items-end gap-[2px]"
            >
              {Array.from({ length: 22 }).map((_, k) => (
                <span
                  key={k}
                  className="w-[2px] rounded-full bg-[color:var(--color-fg-subtle)]/55"
                  style={{ height: 5 + ((k * 13) % 12) }}
                />
              ))}
            </span>
            <span className="font-mono text-[8.5px] tabular-nums text-[color:var(--color-fg-subtle)] sm:text-[9px]">
              0:{(20 + (index % 4) * 7).toString().padStart(2, "0")}
            </span>
          </div>
        ) : (
          <p className="mt-0.5 text-[11px] leading-[1.35] text-[color:var(--color-fg)] sm:mt-1 sm:text-[11.5px] sm:leading-[1.4]">
            {m.body}
          </p>
        )}
      </div>
    </motion.li>
  );
}
