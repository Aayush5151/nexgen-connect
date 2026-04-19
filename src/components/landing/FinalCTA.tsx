"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { getTotalWaitlistAction } from "@/app/actions/waitlist";
import { track } from "@/lib/analytics";
import { COHORT_CAP } from "@/lib/cohort";

const COHORT_TARGET = COHORT_CAP;

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

  const safeTotal = total ?? 0;
  const full = safeTotal >= COHORT_TARGET;
  const joined = Math.min(safeTotal, COHORT_TARGET);
  const open = Math.max(0, COHORT_TARGET - joined);

  return (
    <section className="border-t border-[color:var(--color-border)] py-32 md:py-56">
      <div className="container-narrow text-center">
        <SectionLabel className="mx-auto">
          The cohort closes when it closes
        </SectionLabel>
        <h2 className="mx-auto mt-5 max-w-[820px] font-heading text-[40px] font-semibold leading-[1.03] tracking-[-0.025em] text-[color:var(--color-fg)] md:text-[72px]">
          {full
            ? "The Sept 2026 cohort is full."
            : `The Sept 2026 cohort fills at ${COHORT_TARGET}.`}
        </h2>

        {!full && (
          <div className="mx-auto mt-10 flex max-w-[520px] items-center justify-center gap-8">
            <CounterBlock label="joined" value={joined} loaded={total !== null} />
            <span className="h-10 w-px bg-[color:var(--color-border)]" />
            <CounterBlock label="spots open" value={open} loaded={total !== null} muted />
          </div>
        )}

        <div className="mt-12">
          <Link
            href="/#reserve"
            onClick={() => track("CTA_Clicked", { location: "final" })}
            className="inline-flex h-14 items-center justify-center gap-2 rounded-[10px] bg-[color:var(--color-primary)] px-8 text-[15px] font-medium text-[color:var(--color-primary-fg)] transition-colors hover:bg-[color:var(--color-primary-hover)]"
          >
            {full ? "Join Jan 2027 waitlist" : "Reserve my spot"}
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>

        <p className="mx-auto mt-8 max-w-[480px] text-[13px] leading-[1.55] text-[color:var(--color-fg-subtle)]">
          Lifetime free for founding members. You pay zero unless you opt into
          premium matching after January 2027.
        </p>
      </div>
    </section>
  );
}

function CounterBlock({
  value,
  label,
  loaded,
  muted = false,
}: {
  value: number;
  label: string;
  loaded: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-baseline gap-0.5 font-mono text-[44px] font-semibold leading-none tabular-nums tracking-[-0.02em] md:text-[56px]">
        {loaded ? (
          String(value)
            .padStart(String(COHORT_TARGET).length, " ")
            .trim()
            .split("")
            .map((d, i) => (
              <SlotDigit
                key={`${label}-${i}-${d}`}
                digit={d}
                color={muted ? "muted" : "primary"}
              />
            ))
        ) : (
          <span className="text-[color:var(--color-fg-subtle)]">…</span>
        )}
      </div>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
        {label}
      </p>
    </div>
  );
}

function SlotDigit({
  digit,
  color,
}: {
  digit: string;
  color: "primary" | "muted";
}) {
  const cls =
    color === "primary"
      ? "text-[color:var(--color-primary)]"
      : "text-[color:var(--color-fg)]";
  return (
    <span className={`relative inline-block overflow-hidden ${cls}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={digit}
          initial={{ y: "60%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-60%", opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
          className="inline-block"
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
