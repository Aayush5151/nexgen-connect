"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * VerificationTicker — ambient live-feel trust signal.
 *
 * A single line of text that rotates every ~3.2s through a short queue
 * of recent verifications. Three composed parts:
 *
 *   ● First name             — bold
 *   · Home city → Uni        — corridor identity
 *   · 3 min ago              — recency
 *
 * The pulsing green dot to the left is the same `.presence-dot` we use
 * on the corridor surface, so the trust signal reads continuously from
 * marketing → product.
 *
 * Design rationale:
 *   - One line, not a wall. Apple/NVIDIA never list testimonials in a
 *     wall; they show a small live signal in the right place. This is
 *     ours.
 *   - The data is shaped like the real corridorPreview feed so wiring
 *     to live data later is a one-line swap.
 *   - prefers-reduced-motion freezes on the first item, no rotation.
 *   - AnimatePresence + popLayout gives a smooth y-slide cycle without
 *     layout jump.
 *
 * v18 trillion-dollar polish.
 */

type VerificationEvent = {
  firstName: string;
  homeCity: string;
  uni: string;
  ago: string;
};

const DEFAULT_EVENTS: VerificationEvent[] = [
  { firstName: "Priya",  homeCity: "Mumbai",   uni: "UCD",      ago: "3 min ago" },
  { firstName: "Aditya", homeCity: "Pune",     uni: "Trinity",  ago: "just now" },
  { firstName: "Meera",  homeCity: "Hyderabad", uni: "TUM",      ago: "8 min ago" },
  { firstName: "Karan",  homeCity: "Delhi",    uni: "RWTH",     ago: "12 min ago" },
  { firstName: "Riya",   homeCity: "Bengaluru", uni: "LMU",     ago: "just now" },
  { firstName: "Sahil",  homeCity: "Ahmedabad", uni: "UCC",      ago: "6 min ago" },
  { firstName: "Nikhil", homeCity: "Chennai",  uni: "Humboldt", ago: "18 min ago" },
];

const INTERVAL_MS = 3200;

export function VerificationTicker({
  events = DEFAULT_EVENTS,
  className = "",
}: {
  events?: VerificationEvent[];
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduced) return;
    if (events.length <= 1) return;
    const id = window.setInterval(
      () => setI((n) => (n + 1) % events.length),
      INTERVAL_MS,
    );
    return () => window.clearInterval(id);
  }, [events.length, reduced]);

  const e = events[i] ?? events[0];
  if (!e) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={
        "inline-flex items-center gap-2 text-[12px] leading-none text-[color:var(--color-fg-muted)] sm:text-[13px] " +
        className
      }
    >
      <span className="presence-dot" aria-hidden="true" />
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)] sm:text-[10.5px]">
        Live
      </span>
      <span className="h-3 w-px shrink-0 bg-[color:var(--color-border)]" aria-hidden="true" />

      {/* AnimatePresence on the content side only — the chrome stays
          fixed, the line under it cycles. */}
      <span className="relative h-[1.2em] overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={`${e.firstName}-${i}`}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
            className="block whitespace-nowrap"
          >
            <span className="font-semibold text-[color:var(--color-fg)]">
              {e.firstName}
            </span>
            <span className="text-[color:var(--color-fg-subtle)]">
              {" · "}
              {e.homeCity} → {e.uni}
            </span>
            <span className="text-[color:var(--color-fg-subtle)]">
              {" · "}
              {e.ago}
            </span>
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  );
}
