"use client";

import { useMemo, useSyncExternalStore } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * CorridorVisualizer — "the 60, visualized".
 *
 * The product mechanic is: 60 verified students from your corridor
 * (home city × destination × intake month) unlock the group chat.
 * This section shows that mechanic literally.
 *
 * A grid of 60 small dot-tiles fills in sequentially as you watch.
 * Each tile carries a tiny city tag (Mumbai, Delhi, Bengaluru, etc.)
 * — sampled from a realistic distribution of Indian metros. When the
 * 60th tile lands, an "Unlocked" pill animates in and the headline
 * shifts colour.
 *
 * The animation loops: fills up over ~8s, holds the "unlocked" state
 * for ~3s, fades back to empty, repeats.
 *
 * Trillion-dollar discipline:
 *   - One idea per surface: SHOW what 60 verified looks like.
 *   - Reduced-motion: holds the steady-state "60/60 unlocked" frame.
 *   - Loops forever — the user can sit and look.
 *
 * Implementation:
 *   - useSyncExternalStore drives `filled` from a rAF subscription.
 *     This is the React 19 idiom for "subscribe to an external time
 *     signal" — satisfies the `set-state-in-effect` purity rule
 *     because rAF is the external store, not an effect-driven state
 *     transition.
 *   - SSR snapshot returns 0 (empty grid) — first paint shows empty,
 *     animation kicks in on mount.
 *
 * v18 trillion-dollar polish.
 */

const TOTAL = 60;
const FILL_DURATION_MS = 8000;
const HOLD_DURATION_MS = 2800;
const RESET_DURATION_MS = 600;
const TOTAL_CYCLE_MS = FILL_DURATION_MS + HOLD_DURATION_MS + RESET_DURATION_MS;
const FILL_STEP_MS = FILL_DURATION_MS / TOTAL;

const CITIES = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Chandigarh",
  "Kochi",
  "Indore",
  "Surat",
  "Coimbatore",
] as const;

function cityForIndex(i: number): string {
  return CITIES[i % CITIES.length] ?? "Mumbai";
}

/**
 * Module-level animation start. All subscribers share the same start
 * time, so multiple instances of the visualizer on a page stay in
 * lockstep. Initialised lazily on first subscribe so SSR doesn't
 * fork the timeline.
 */
let animationStart: number | null = null;

function subscribeRaf(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  if (animationStart === null) animationStart = Date.now();
  let id = window.requestAnimationFrame(function loop() {
    callback();
    id = window.requestAnimationFrame(loop);
  });
  return () => window.cancelAnimationFrame(id);
}

function getFilledSnapshot(): number {
  if (typeof window === "undefined" || animationStart === null) return 0;
  const elapsed = (Date.now() - animationStart) % TOTAL_CYCLE_MS;
  if (elapsed < FILL_DURATION_MS) {
    return Math.min(TOTAL, Math.floor(elapsed / FILL_STEP_MS));
  }
  if (elapsed < FILL_DURATION_MS + HOLD_DURATION_MS) {
    return TOTAL;
  }
  return 0; // reset phase
}

function getServerSnapshot(): number {
  return 0;
}

export function CorridorVisualizer() {
  const reduced = useReducedMotion();
  // When reduced-motion is on, freeze at 60. Otherwise subscribe to
  // the rAF clock for the live cascade.
  const liveFilled = useSyncExternalStore(
    subscribeRaf,
    getFilledSnapshot,
    getServerSnapshot,
  );
  const filled = reduced ? TOTAL : liveFilled;

  const unlocked = filled >= TOTAL;
  const progressPct = Math.round((filled / TOTAL) * 100);

  return (
    <section className="relative bg-[color:var(--color-bg)] py-20 sm:py-28 md:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(45% 35% at 50% 35%, color-mix(in srgb, var(--color-primary) 6%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="container-narrow relative">
        <div className="mx-auto max-w-[720px] text-center">
          <p className="label-eyebrow text-[color:var(--color-fg-subtle)]">
            The mechanic, visualized
          </p>
          <h2 className="mt-5 display-lg text-[color:var(--color-fg)]">
            Sixty verified students.{" "}
            <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-primary)]">
              That&apos;s the unlock.
            </span>
          </h2>
          <p className="mt-5 body-lg text-[color:var(--color-fg-muted)]">
            Watch your group form. Each tile is one verified classmate from
            an Indian metro, going to your destination, in your intake
            month. When the sixtieth verifies, group DMs open.
          </p>
        </div>

        <div className="mx-auto mt-12 flex max-w-[560px] items-baseline justify-between gap-4">
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-[44px] font-semibold tabular-nums tracking-[-0.025em] text-[color:var(--color-fg)] sm:text-[56px]">
              {filled}
            </span>
            <span className="body-md text-[color:var(--color-fg-muted)]">
              of {TOTAL}
            </span>
          </div>

          <motion.span
            layout
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className={
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors duration-300 " +
              (unlocked
                ? "border border-[color:var(--color-primary)]/40 bg-[color:color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[color:var(--color-primary)]"
                : "border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-fg-muted)]")
            }
          >
            <span
              aria-hidden="true"
              className={
                "h-1.5 w-1.5 rounded-full transition-colors duration-300 " +
                (unlocked
                  ? "bg-[color:var(--color-primary)] shadow-[0_0_8px_color-mix(in_srgb,var(--color-primary)_60%,transparent)]"
                  : "bg-[color:var(--color-fg-subtle)]")
              }
            />
            {unlocked ? "Group chat unlocked" : "Verifying"}
          </motion.span>
        </div>

        <div
          className="mx-auto mt-3 h-[2px] w-full max-w-[560px] overflow-hidden rounded-full bg-[color:var(--color-border)]"
          role="progressbar"
          aria-valuenow={filled}
          aria-valuemin={0}
          aria-valuemax={TOTAL}
          aria-label="Verified students"
        >
          <div
            className="h-full rounded-full bg-[color:var(--color-primary)] transition-[width] duration-[300ms] ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <DotGrid filled={filled} unlocked={unlocked} />

        <p className="mx-auto mt-10 max-w-[560px] text-center font-serif italic text-[15px] leading-[1.5] tracking-[-0.005em] text-[color:var(--color-fg-subtle)]">
          {unlocked
            ? "The group is real now. Walk in."
            : "Your name lands in this grid the moment you verify."}
        </p>
      </div>
    </section>
  );
}

function DotGrid({ filled, unlocked }: { filled: number; unlocked: boolean }) {
  const tiles = useMemo(
    () =>
      Array.from({ length: TOTAL }, (_, i) => ({
        i,
        city: cityForIndex(i),
      })),
    [],
  );

  return (
    <div
      aria-hidden="true"
      className="mx-auto mt-10 grid max-w-[640px] gap-1.5 sm:gap-2"
      style={{
        gridTemplateColumns: "repeat(10, minmax(0, 1fr))",
      }}
    >
      {tiles.map((t) => (
        <DotTile
          key={t.i}
          index={t.i}
          city={t.city}
          filled={t.i < filled}
          unlocked={unlocked}
        />
      ))}
    </div>
  );
}

function DotTile({
  index,
  city,
  filled,
  unlocked,
}: {
  index: number;
  city: string;
  filled: boolean;
  unlocked: boolean;
}) {
  return (
    <div className="group relative aspect-square">
      <div
        className={
          "absolute inset-0 rounded-[4px] transition-[background-color,transform,box-shadow] duration-[280ms] ease-out " +
          (filled
            ? unlocked
              ? "scale-100 bg-[color:var(--color-primary)] shadow-[0_0_6px_color-mix(in_srgb,var(--color-primary)_45%,transparent)]"
              : "scale-100 bg-[color:var(--color-primary)]/85"
            : "scale-[0.65] bg-[color:var(--color-border)]")
        }
      />
      <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-[color:var(--color-fg)] opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        {city} · #{index + 1}
      </span>
    </div>
  );
}
