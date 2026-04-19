"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { Heart, X, RotateCcw } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";

type DemoProfile = {
  initials: string;
  name: string;
  city: string;
  university: "UCD" | "Trinity" | "UCC";
  program: string;
  blurb: string;
};

const PROFILES: DemoProfile[] = [
  {
    initials: "RM",
    name: "Rhea M.",
    city: "Mumbai",
    university: "UCD",
    program: "MSc Data Analytics · Sept 2026",
    blurb: "Andheri West. Podcasts, climbing, bad filter coffee.",
  },
  {
    initials: "KS",
    name: "Karthik S.",
    city: "Bangalore",
    university: "Trinity",
    program: "MA Economics · Sept 2026",
    blurb: "Koramangala. Arsenal FC, filter coffee, Murakami.",
  },
  {
    initials: "AP",
    name: "Aarav P.",
    city: "Pune",
    university: "UCC",
    program: "MSc Biotechnology · Sept 2026",
    blurb: "Kothrud. Trail running, strategy games, vegetarian.",
  },
  {
    initials: "MD",
    name: "Meera D.",
    city: "Delhi NCR",
    university: "UCD",
    program: "MBA · Sept 2026",
    blurb: "GK-II. Jazz piano, 5 am gym, yes actually.",
  },
];

export function SwipeDeck() {
  const [index, setIndex] = useState(0);
  const [matchFlash, setMatchFlash] = useState(false);

  const exhausted = index >= PROFILES.length;

  function advance(direction: "left" | "right") {
    if (direction === "right") {
      setMatchFlash(true);
      setTimeout(() => setMatchFlash(false), 800);
    }
    setIndex((i) => i + 1);
  }

  function reset() {
    setIndex(0);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (exhausted) return;
      if (e.key === "ArrowRight") advance("right");
      if (e.key === "ArrowLeft") advance("left");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [exhausted]);

  return (
    <section className="section-y border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)]">
      <div className="container-narrow">
        <div className="mx-auto max-w-[640px] text-center">
          <SectionLabel className="mx-auto">Matching demo</SectionLabel>
          <h2 className="mt-4 font-heading text-[36px] font-semibold leading-[1.05] tracking-[-0.02em] text-[color:var(--color-fg)] md:text-[44px]">
            This is what matching looks like.
          </h2>
          <p className="mx-auto mt-4 max-w-[480px] text-[15px] leading-[1.6] text-[color:var(--color-fg-muted)]">
            Drag the card, or tap the buttons. This is a demo. The real app
            only shows verified students from your city and university.
          </p>
        </div>

        <div className="relative mx-auto mt-12 h-[540px] w-full max-w-[380px]">
          <AnimatePresence>
            {matchFlash && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="pointer-events-none absolute inset-0 z-20 rounded-[20px] bg-[color:var(--color-primary)]"
              />
            )}
          </AnimatePresence>

          {PROFILES.map((profile, i) => {
            if (i < index) return null;
            const isTop = i === index;
            return (
              <Card
                key={profile.name}
                profile={profile}
                isTop={isTop}
                offset={i - index}
                onExit={advance}
              />
            );
          })}

          {exhausted && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[20px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                End of demo
              </p>
              <p className="mt-3 max-w-[260px] font-heading text-[20px] font-semibold leading-tight text-[color:var(--color-fg)]">
                In the real app, the next card is a verified student from your
                group.
              </p>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset demo"
                className="mt-6 inline-flex items-center gap-2 rounded-[10px] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-4 py-2 text-[13px] font-medium text-[color:var(--color-fg)] hover:border-[color:var(--color-border-strong)]"
              >
                <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
                Reset demo
              </button>
            </div>
          )}
        </div>

        <div className="mx-auto mt-8 flex max-w-[380px] items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => !exhausted && advance("left")}
            disabled={exhausted}
            aria-label="Pass"
            className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-fg-muted)] transition-colors hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-fg)] disabled:opacity-40"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => !exhausted && advance("right")}
            disabled={exhausted}
            aria-label="Match"
            className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)] transition-colors hover:bg-[color:var(--color-primary-hover)] disabled:opacity-40"
          >
            <Heart className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      </div>
    </section>
  );
}

function Card({
  profile,
  isTop,
  offset,
  onExit,
}: {
  profile: DemoProfile;
  isTop: boolean;
  offset: number;
  onExit: (dir: "left" | "right") => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const opacity = useTransform(x, [-240, 0, 240], [0.4, 1, 0.4]);
  const likeOpacity = useTransform(x, [40, 140], [0, 1]);
  const nopeOpacity = useTransform(x, [-140, -40], [1, 0]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (!isTop) return;
    const threshold = 120;
    if (info.offset.x > threshold || info.velocity.x > 500) {
      onExit("right");
    } else if (info.offset.x < -threshold || info.velocity.x < -500) {
      onExit("left");
    }
  }

  const scale = isTop ? 1 : 1 - offset * 0.04;
  const translateY = offset * 8;

  return (
    <motion.div
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      style={{ x: isTop ? x : 0, rotate: isTop ? rotate : 0, opacity: isTop ? opacity : 1 }}
      animate={{ scale, y: translateY }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="absolute inset-0 cursor-grab rounded-[20px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.1)] active:cursor-grabbing"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
          Demo
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
          {profile.city} → {profile.university}
        </span>
      </div>

      <div className="mt-6 flex flex-col items-center text-center">
        <div className="flex h-[160px] w-[160px] items-center justify-center rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)]">
          <span className="font-heading text-[48px] font-semibold leading-none tracking-[-0.02em] text-[color:var(--color-primary)]">
            {profile.initials}
          </span>
        </div>

        <p className="mt-6 font-heading text-[24px] font-semibold leading-tight text-[color:var(--color-fg)]">
          {profile.name}
        </p>
        <p className="mt-1 text-[14px] text-[color:var(--color-fg-muted)]">
          {profile.program}
        </p>

        <p className="mt-4 max-w-[280px] text-[14px] leading-[1.5] text-[color:var(--color-fg-muted)]">
          {profile.blurb}
        </p>
      </div>

      <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-[11px] text-[color:var(--color-fg-subtle)]">
        <span className="font-mono uppercase tracking-[0.08em]">
          Instagram · LinkedIn
        </span>
        <span className="font-mono uppercase tracking-[0.08em]">
          Revealed on match
        </span>
      </div>

      {isTop && (
        <>
          <motion.div
            style={{ opacity: likeOpacity }}
            className="pointer-events-none absolute left-6 top-6 rotate-[-12deg] rounded-[8px] border-2 border-[color:var(--color-primary)] px-3 py-1 font-heading text-[16px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-primary)]"
          >
            Match
          </motion.div>
          <motion.div
            style={{ opacity: nopeOpacity }}
            className="pointer-events-none absolute right-6 top-6 rotate-[12deg] rounded-[8px] border-2 border-[color:var(--color-fg-subtle)] px-3 py-1 font-heading text-[16px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]"
          >
            Skip
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
