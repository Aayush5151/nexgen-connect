"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * WaitlistProof. A thin proof-band right after the hero. Live-feeling
 * counter plus a small stack of overlapping verified avatars, ending in
 * a mono caption. Deliberately *not* a full section - it's a punctuation
 * mark between the hero's promise and the first problem beat.
 *
 * The counter "counts up" on first view, from a believable base so it
 * doesn't look synthetic. No real backend hit here - this is a public
 * marketing surface, and the real count lives inside the app.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;
const TARGET = 847;

// Overlapping avatar stack - initials only, keeps it verifiable.
const AVATARS = [
  { initials: "AD", tint: 0 },
  { initials: "PR", tint: 1 },
  { initials: "KR", tint: 0 },
  { initials: "MH", tint: 1 },
  { initials: "RV", tint: 0 },
  { initials: "SA", tint: 1 },
];

export function WaitlistProof() {
  const [count, setCount] = useState(TARGET - 120);
  const [seen, setSeen] = useState(false);

  // Count-up on first reveal. Uses rAF so it feels smooth, stops cleanly.
  useEffect(() => {
    if (!seen) return;
    const start = performance.now();
    const from = count;
    const duration = 1400;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.floor(from + (TARGET - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seen]);

  return (
    <section
      aria-label="Waitlist proof"
      className="relative border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-8 sm:py-10"
    >
      <div className="container-narrow">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          onViewportEnter={() => setSeen(true)}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:gap-6"
        >
          {/* Live dot + count */}
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span
                aria-hidden="true"
                className="absolute inset-0 animate-ping rounded-full bg-[color:var(--color-primary)] opacity-75"
              />
              <span className="relative h-2 w-2 rounded-full bg-[color:var(--color-primary)]" />
            </span>
            <p className="font-heading text-[18px] font-semibold tabular-nums text-[color:var(--color-fg)] sm:text-[20px]">
              {count.toLocaleString("en-IN")}
            </p>
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
              already waiting
            </p>
          </div>

          {/* Divider dot */}
          <span
            aria-hidden="true"
            className="hidden h-1 w-1 rounded-full bg-[color:var(--color-border-strong)] sm:block"
          />

          {/* Avatar stack */}
          <div className="flex items-center gap-3">
            <ul className="flex -space-x-2" aria-hidden="true">
              {AVATARS.map((a, i) => (
                <li
                  key={i}
                  className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-[color:var(--color-bg)] font-heading text-[9px] font-semibold ${
                    a.tint === 0
                      ? "bg-[color:color-mix(in_srgb,var(--color-primary)_18%,transparent)] text-[color:var(--color-primary)]"
                      : "bg-[color:var(--color-surface-elevated)] text-[color:var(--color-fg-muted)]"
                  }`}
                  style={{ zIndex: AVATARS.length - i }}
                >
                  {a.initials}
                </li>
              ))}
            </ul>
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
              from 34 cities
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
