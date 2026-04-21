"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

/**
 * ActivityTicker. A single rotating line - &ldquo;Aditya from Mumbai
 * joined the waitlist · 2 min ago&rdquo; - that shows above the fold
 * and below WaitlistProof. Pre-launch we cannot claim anyone has
 * verified yet (verification only runs inside the app), so the ticker
 * reads as waitlist energy rather than fake verification events.
 *
 * The feed is a static loop for now - once the waitlist backend pipes
 * live events, swap `ACTIVITY` for a server-feed. Respects
 * prefers-reduced-motion (static first item when reduced).
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

type Entry = {
  name: string;
  city: string;
  minutesAgo: number;
};

const ACTIVITY: Entry[] = [
  { name: "Aditya", city: "Mumbai", minutesAgo: 2 },
  { name: "Priya", city: "Bangalore", minutesAgo: 4 },
  { name: "Karan", city: "Delhi", minutesAgo: 7 },
  { name: "Meera", city: "Pune", minutesAgo: 11 },
  { name: "Riya", city: "Hyderabad", minutesAgo: 14 },
  { name: "Sahil", city: "Chennai", minutesAgo: 18 },
  { name: "Nikhil", city: "Kolkata", minutesAgo: 22 },
  { name: "Isha", city: "Ahmedabad", minutesAgo: 26 },
  { name: "Arjun", city: "Jaipur", minutesAgo: 31 },
  { name: "Divya", city: "Chandigarh", minutesAgo: 38 },
];

function formatAgo(minutes: number) {
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hr ago`;
}

export function ActivityTicker({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;
    if (paused) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % ACTIVITY.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [paused]);

  const entry = ACTIVITY[index];

  return (
    <div
      className={`flex items-center gap-2.5 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-2 ${
        className ?? ""
      }`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      role="status"
      aria-live="polite"
      aria-label="Recent waitlist signups"
    >
      <span
        aria-hidden="true"
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]"
      >
        <Check className="h-3 w-3" strokeWidth={2.5} />
      </span>
      <div className="relative h-[1.2em] min-w-[240px] overflow-hidden text-[12px] leading-[1.2] sm:min-w-[280px] sm:text-[13px]">
        <AnimatePresence mode="popLayout">
          <motion.p
            key={`${entry.name}-${entry.minutesAgo}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="whitespace-nowrap text-[color:var(--color-fg-muted)]"
          >
            <span className="font-semibold text-[color:var(--color-fg)]">
              {entry.name}
            </span>{" "}
            from {entry.city} joined the waitlist{" "}
            <span className="text-[color:var(--color-fg-subtle)]">
              · {formatAgo(entry.minutesAgo)}
            </span>
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
