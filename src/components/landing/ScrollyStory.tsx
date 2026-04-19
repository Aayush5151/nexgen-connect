"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { track } from "@/lib/analytics";

type Frame = {
  eyebrow: string;
  title: string;
  phone: "offer" | "whatsapp" | "search" | "cohort";
};

const FRAMES: Frame[] = [
  { eyebrow: "Day 1", title: "The offer lands.", phone: "offer" },
  {
    eyebrow: "Week 2",
    title: "487 strangers. None from your city.",
    phone: "whatsapp",
  },
  {
    eyebrow: "Week 6",
    title: "2:41 AM. You are googling it.",
    phone: "search",
  },
  {
    eyebrow: "Week 7",
    title: "Ten verified students. Your city. Your university.",
    phone: "cohort",
  },
];

export function ScrollyStory() {
  const ref = useRef<HTMLDivElement>(null);
  const firedRef = useRef(false);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (firedRef.current) return;
    if (v > 0.8) {
      firedRef.current = true;
      track("Scrollytelling_Complete");
    }
  });

  return (
    <section
      ref={ref}
      className="relative border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)]"
      style={{ height: "400vh" }}
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="container-narrow grid w-full gap-12 md:grid-cols-12 md:items-center md:gap-16">
          <div className="order-2 md:order-1 md:col-span-5">
            <SectionLabel>Seven weeks</SectionLabel>
            <div className="relative mt-6 h-[220px] md:h-[280px]">
              {FRAMES.map((frame, i) => (
                <FrameCaption
                  key={i}
                  frame={frame}
                  index={i}
                  progress={scrollYProgress}
                />
              ))}
            </div>
            <div className="mt-8 flex items-center gap-2">
              {FRAMES.map((_, i) => (
                <Dot key={i} index={i} progress={scrollYProgress} />
              ))}
            </div>
          </div>

          <div className="order-1 md:order-2 md:col-span-7">
            <div className="relative mx-auto h-[540px] w-[280px] md:h-[600px] md:w-[320px]">
              {FRAMES.map((frame, i) => (
                <FramePhone
                  key={i}
                  frame={frame}
                  index={i}
                  progress={scrollYProgress}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function useFrameOpacity(progress: MotionValue<number>, index: number) {
  // Each frame owns 1/4 of scroll, with ~5% crossfade at edges.
  const start = index / FRAMES.length;
  const end = (index + 1) / FRAMES.length;
  const fadeIn = start === 0 ? start : start - 0.05;
  const fadeOut = end === 1 ? end : end + 0.05;
  const plateauIn = start + 0.02;
  const plateauOut = end - 0.02;
  return useTransform(progress, (v) => {
    if (v <= fadeIn) return 0;
    if (v >= fadeOut) return 0;
    if (v < plateauIn) return (v - fadeIn) / (plateauIn - fadeIn);
    if (v > plateauOut) return (fadeOut - v) / (fadeOut - plateauOut);
    return 1;
  });
}

function FrameCaption({
  frame,
  index,
  progress,
}: {
  frame: Frame;
  index: number;
  progress: MotionValue<number>;
}) {
  const opacity = useFrameOpacity(progress, index);
  return (
    <motion.div style={{ opacity }} className="absolute inset-0">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-primary)]">
        {frame.eyebrow}
      </p>
      <h2 className="mt-4 max-w-[420px] font-heading text-[32px] font-semibold leading-[1.05] tracking-[-0.02em] text-[color:var(--color-fg)] md:text-[40px]">
        {frame.title}
      </h2>
    </motion.div>
  );
}

function Dot({
  index,
  progress,
}: {
  index: number;
  progress: MotionValue<number>;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const start = index / FRAMES.length;
  const end = (index + 1) / FRAMES.length;
  const center = (start + end) / 2;
  const half = (end - start) / 2 + 0.04;

  const apply = (v: number) => {
    if (!ref.current) return;
    const dist = Math.abs(v - center);
    const t = Math.max(0, Math.min(1, 1 - dist / half));
    ref.current.style.width = `${10 + t * 22}px`;
    ref.current.style.opacity = String(0.25 + t * 0.75);
  };

  useMotionValueEvent(progress, "change", apply);

  const initialT = Math.max(
    0,
    Math.min(1, 1 - Math.abs(progress.get() - center) / half),
  );

  return (
    <span
      ref={ref}
      className="inline-block h-1 rounded-full bg-[color:var(--color-primary)]"
      style={{
        width: 10 + initialT * 22,
        opacity: 0.25 + initialT * 0.75,
      }}
    />
  );
}

function FramePhone({
  frame,
  index,
  progress,
}: {
  frame: Frame;
  index: number;
  progress: MotionValue<number>;
}) {
  const opacity = useFrameOpacity(progress, index);
  const y = useTransform(opacity, [0, 1], [16, 0]);

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-0 overflow-hidden rounded-[36px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
    >
      {/* Status bar */}
      <div className="flex items-center justify-between px-6 pt-5 font-mono text-[10px] font-semibold text-[color:var(--color-fg-muted)]">
        <span>
          {frame.phone === "search" ? "2:41" : frame.phone === "whatsapp" ? "9:14" : "11:02"}
        </span>
        <span className="h-1.5 w-16 rounded-full bg-[color:var(--color-border-strong)]" />
        <span>•••</span>
      </div>

      <div className="px-5 pb-6 pt-4">
        {frame.phone === "offer" && <OfferPanel />}
        {frame.phone === "whatsapp" && <WhatsappPanel />}
        {frame.phone === "search" && <SearchPanel />}
        {frame.phone === "cohort" && <CohortPanel />}
      </div>
    </motion.div>
  );
}

function OfferPanel() {
  return (
    <div className="space-y-3">
      <div className="rounded-[10px] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-4 py-3">
        <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
          PDF · Letter-of-Offer.pdf
        </p>
      </div>
      <div className="rounded-[10px] bg-[color:var(--color-bg)] p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
          University College Dublin
        </p>
        <p className="mt-3 font-heading text-[18px] font-semibold leading-tight text-[color:var(--color-fg)]">
          Letter of Offer
        </p>
        <p className="mt-2 text-[11px] text-[color:var(--color-fg-muted)]">
          15 December 2025
        </p>
        <div className="mt-4 space-y-1.5">
          <div className="h-1 w-full rounded-full bg-[color:var(--color-border)]" />
          <div className="h-1 w-[90%] rounded-full bg-[color:var(--color-border)]" />
          <div className="h-1 w-[85%] rounded-full bg-[color:var(--color-border)]" />
          <div className="h-1 w-[70%] rounded-full bg-[color:var(--color-border)]" />
        </div>
        <div className="mt-5 rounded-md border border-[color:var(--color-primary)]/30 bg-[color:var(--color-primary)]/10 px-3 py-2">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-primary)]">
            Congratulations, you are admitted.
          </p>
        </div>
      </div>
    </div>
  );
}

function WhatsappPanel() {
  const messages = [
    { from: "Forex Deals", text: "96.5 INR/EUR best rate DM now" },
    { from: "Ballsbridge Rent", text: "Studio avail from 1 Sept, €1400" },
    { from: "Unknown +91", text: "Hi all anyone from Indore???" },
    { from: "AgentPro", text: "FREE visa consultation limited slots" },
    { from: "Forex Deals", text: "DM for 97.1 rate guaranteed" },
  ];
  return (
    <div>
      <div className="rounded-[10px] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-3 py-2">
        <p className="font-heading text-[13px] font-semibold text-[color:var(--color-fg)]">
          India → Ireland Sept 2026
        </p>
        <p className="mt-0.5 text-[10px] text-[color:var(--color-fg-subtle)]">
          487 members · 18 typing…
        </p>
      </div>
      <div className="mt-3 space-y-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className="rounded-md bg-[color:var(--color-bg)] px-3 py-2"
          >
            <p className="text-[10px] font-semibold text-[color:var(--color-fg-muted)]">
              {m.from}
            </p>
            <p className="mt-0.5 text-[11px] leading-[1.4] text-[color:var(--color-fg)]">
              {m.text}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-md bg-[color:var(--color-primary)]/10 px-3 py-1.5 text-center">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-primary)]">
          487 new messages
        </p>
      </div>
    </div>
  );
}

function SearchPanel() {
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] text-[color:var(--color-fg-subtle)]">
        <span>Wed, 18 Nov</span>
        <span>Battery 9%</span>
      </div>
      <p className="mt-12 text-center font-heading text-[56px] font-semibold leading-none text-[color:var(--color-fg)]">
        2:41
      </p>
      <p className="text-center text-[11px] text-[color:var(--color-fg-subtle)]">
        No new notifications
      </p>
      <div className="mt-12 rounded-[12px] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-3 py-2.5">
        <p className="text-[10px] text-[color:var(--color-fg-subtle)]">
          Safari search
        </p>
        <p className="mt-1 text-[12px] text-[color:var(--color-fg)]">
          how to make friends when you move abroad
        </p>
      </div>
      <div className="mt-6 h-[140px] rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-bg)]" />
    </div>
  );
}

function CohortPanel() {
  const avatars = [
    { initials: "RM", name: "Rhea" },
    { initials: "KS", name: "Karthik" },
    { initials: "AP", name: "Aarav" },
    { initials: "MD", name: "Meera" },
    { initials: "PV", name: "Priya" },
    { initials: "IR", name: "Ishaan" },
    { initials: "SK", name: "Sanya" },
    { initials: "RG", name: "Rohan" },
    { initials: "NL", name: "Nikita" },
    { initials: "AD", name: "Aryan" },
  ];
  return (
    <div>
      <div className="rounded-[10px] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-3 py-2.5">
        <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
          Your group
        </p>
        <p className="mt-1 font-heading text-[14px] font-semibold text-[color:var(--color-fg)]">
          Mumbai → UCD · Sept 2026
        </p>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2.5">
        {avatars.map((a) => (
          <div
            key={a.name}
            className="flex flex-col items-center rounded-[8px] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] font-heading text-[11px] font-semibold text-[color:var(--color-primary)]">
              {a.initials}
            </div>
            <p className="mt-1.5 text-[9px] text-[color:var(--color-fg-muted)]">
              {a.name}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-primary)]">
        All 10 verified
      </p>
    </div>
  );
}
