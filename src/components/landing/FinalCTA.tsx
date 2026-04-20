"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CtaButton } from "@/components/ui/CtaButton";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { getTotalWaitlistAction } from "@/app/actions/waitlist";
import { track } from "@/lib/analytics";
import { COHORT_CAP } from "@/lib/cohort";

/**
 * FinalCTA. Visual scarcity: a literal 10×10 grid of spots where each
 * joined member lights a cell. Replaces the old text-heavy counter
 * with a single glance-legible seat map.
 *
 * COHORT_CAP is 100 — the grid assumes a 10×10. If the cap ever changes
 * we recompute rows/cols at module level rather than hard-coding 10.
 */

const GRID_SIDE = Math.ceil(Math.sqrt(COHORT_CAP));

export function FinalCTA() {
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getTotalWaitlistAction().then((res) => {
      if (cancelled) return;
      if (res.ok) setTotal(res.total);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const loaded = total !== null;
  const safeTotal = total ?? 0;
  const joined = Math.min(safeTotal, COHORT_CAP);
  const open = Math.max(0, COHORT_CAP - joined);
  const full = joined >= COHORT_CAP;

  return (
    <section className="border-t border-[color:var(--color-border)] py-20 md:py-28">
      <div className="container-narrow">
        <div className="mx-auto max-w-[880px] text-center">
          <SectionLabel className="mx-auto">
            {full ? "Group sealed" : "100 spots. Then we close."}
          </SectionLabel>
          <h2
            className="mx-auto mt-3 max-w-[780px] font-heading font-semibold text-balance text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(40px, 7vw, 80px)",
              lineHeight: 0.95,
              letterSpacing: "-0.035em",
            }}
          >
            {full ? (
              <>
                The September 2026 group is{" "}
                <span className="font-serif font-normal italic tracking-[-0.02em] text-[color:var(--color-fg-muted)]">
                  full.
                </span>
              </>
            ) : (
              <>
                Ireland, September 2026.
                <br />
                <span className="font-serif font-normal italic tracking-[-0.02em] text-[color:var(--color-fg-muted)]">
                  One island. 100 seats.
                </span>
              </>
            )}
          </h2>
        </div>

        {/* 10×10 seat map. Filled dots = taken; the "next" dot pulses. */}
        <div className="mx-auto mt-14 max-w-[360px]">
          <SeatGrid joined={joined} loaded={loaded} />

          <div className="mt-6 flex items-center justify-between gap-4 text-left">
            <Stat value={joined} label="taken" tone="primary" loaded={loaded} />
            <span className="h-8 w-px bg-[color:var(--color-border)]" />
            <Stat value={open} label="open" tone="muted" loaded={loaded} />
            <span className="h-8 w-px bg-[color:var(--color-border)]" />
            <Stat
              value={COHORT_CAP}
              label="total"
              tone="muted"
              loaded
              reveal={false}
            />
          </div>

          {/* Progress bar. Filled proportionally, capped at 100. */}
          <div
            className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--color-border)]"
            role="progressbar"
            aria-valuenow={joined}
            aria-valuemin={0}
            aria-valuemax={COHORT_CAP}
            aria-label={`${joined} of ${COHORT_CAP} spots taken`}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: loaded ? `${(joined / COHORT_CAP) * 100}%` : "0%",
              }}
              transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
              className="h-full rounded-full bg-[color:var(--color-primary)]"
            />
          </div>
        </div>

        <div className="mt-12 text-center">
          <CtaButton
            href="/#reserve"
            size="xl"
            arrow
            onClick={() => track("CTA_Clicked", { location: "final" })}
          >
            {full ? "Join the next corridor waitlist" : "Claim your seat"}
          </CtaButton>
          <p className="mx-auto mt-6 max-w-[440px] text-[13px] leading-[1.55] text-[color:var(--color-fg-subtle)]">
            Lifetime free for founding members. Zero cost unless you opt into
            premium matching after January 2027.
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * Seat grid. 10×10 dots; filled on the left, hollow on the right. The
 * first empty dot (at position `joined`) gets a ping ring to draw the
 * reader's eye to the next available seat.
 */
function SeatGrid({ joined, loaded }: { joined: number; loaded: boolean }) {
  // Precompute dot positions so the render loop stays tight.
  const dots = useMemo(
    () => Array.from({ length: GRID_SIDE * GRID_SIDE }),
    [],
  );

  return (
    <div
      role="img"
      aria-label={
        loaded
          ? `${joined} of ${GRID_SIDE * GRID_SIDE} spots taken`
          : "Loading spots"
      }
      className="grid gap-2"
      style={{
        gridTemplateColumns: `repeat(${GRID_SIDE}, minmax(0, 1fr))`,
      }}
    >
      {dots.map((_, i) => {
        const isTaken = loaded && i < joined;
        const isNext = loaded && i === joined && joined < GRID_SIDE * GRID_SIDE;
        return (
          <span
            key={i}
            aria-hidden="true"
            className={`relative block aspect-square w-full rounded-full transition-colors ${
              isTaken
                ? "bg-[color:var(--color-primary)]"
                : isNext
                  ? "bg-transparent ring-1 ring-[color:var(--color-primary)]"
                  : "border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)]"
            }`}
          >
            {isNext && (
              <span
                aria-hidden="true"
                className="absolute inset-0 animate-ping rounded-full ring-1 ring-[color:var(--color-primary)] opacity-40"
              />
            )}
          </span>
        );
      })}
    </div>
  );
}

function Stat({
  value,
  label,
  tone,
  loaded,
  reveal = true,
}: {
  value: number;
  label: string;
  tone: "primary" | "muted";
  loaded: boolean;
  reveal?: boolean;
}) {
  const color =
    tone === "primary"
      ? "text-[color:var(--color-primary)]"
      : "text-[color:var(--color-fg)]";
  const shown = loaded || !reveal;
  return (
    <div className="flex flex-1 flex-col items-start">
      <span
        className={`font-mono text-[26px] font-semibold leading-none tabular-nums md:text-[32px] ${color}`}
      >
        {shown ? value : "…"}
      </span>
      <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
        {label}
      </span>
    </div>
  );
}
