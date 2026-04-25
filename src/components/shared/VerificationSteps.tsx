"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileCheck, Phone, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * VerificationSteps. Compact, visual, interactive 3-step timeline.
 * Replaces the previous text-heavy card grid.
 *
 * Order: Phone → DigiLocker → Admit letter.
 * DigiLocker runs before admit-letter review, so the chain starts with
 * identity before credential. Group formation is a separate product
 * phase (not a verification check) and lives outside this component.
 */

type Step = {
  idx: string;
  icon: LucideIcon;
  title: string;
  duration: string;
  body: string;
  status?: string;
};

const STEPS: Step[] = [
  {
    idx: "01",
    icon: Phone,
    title: "Phone OTP",
    duration: "30 sec",
    body: "Six-digit code via MSG91. Your number is hashed on arrival.",
  },
  {
    idx: "02",
    icon: ShieldCheck,
    title: "DigiLocker Aadhaar",
    duration: "2 min",
    body: "Government consent flow. We only receive a verification token - never the Aadhaar number itself.",
  },
  {
    idx: "03",
    icon: FileCheck,
    title: "Admit letter",
    duration: "Within 48h",
    body: "A real human reviews your admit PDF — Ireland (UCD, Trinity, UCC) or Germany (TUM, LMU, RWTH Aachen, Humboldt). No bots, never auto-approve.",
  },
];

export function VerificationSteps() {
  const [active, setActive] = useState(0);
  const step = STEPS[active];
  const Icon = step.icon;

  return (
    <div className="flex flex-col gap-6">
      {/* Horizontal timeline. 4 medallion nodes connected by a dashed
          track. On mobile the track wraps under the row; on desktop it
          sits behind the medallions at their vertical center. */}
      <div className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[6%] right-[6%] top-[28px] hidden border-t border-dashed border-[color:var(--color-border-strong)] md:block"
        />

        <ol className="relative grid grid-cols-3 gap-y-4 md:grid-cols-3 md:gap-0">
          {STEPS.map((s, i) => {
            const isActive = i === active;
            const isPast = i < active;
            const NodeIcon = s.icon;
            return (
              <li
                key={s.idx}
                className="flex flex-col items-center text-center"
              >
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-pressed={isActive}
                  aria-label={`Step ${s.idx}: ${s.title}`}
                  className="group flex flex-col items-center focus:outline-none"
                >
                  <span
                    className={`relative flex h-[56px] w-[56px] items-center justify-center rounded-full border transition-all ${
                      isActive
                        ? "scale-105 border-[color:var(--color-primary)] bg-[color:var(--color-primary)] shadow-[0_0_0_5px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]"
                        : isPast
                          ? "border-[color:var(--color-primary)]/60 bg-[color:color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
                          : "border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] group-hover:border-[color:var(--color-primary)]/50"
                    }`}
                  >
                    <NodeIcon
                      className={`h-5 w-5 transition-colors ${
                        isActive
                          ? "text-[color:var(--color-primary-fg)]"
                          : isPast
                            ? "text-[color:var(--color-primary)]"
                            : "text-[color:var(--color-fg-muted)]"
                      }`}
                      strokeWidth={1.8}
                    />
                    {/* Step number chip, bottom-right of the medallion */}
                    <span
                      className={`absolute -bottom-1 -right-1 flex h-5 min-w-[22px] items-center justify-center rounded-full border px-1 font-mono text-[9px] font-bold tabular-nums ${
                        isActive
                          ? "border-[color:var(--color-primary)] bg-[color:var(--color-surface)] text-[color:var(--color-primary)]"
                          : "border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] text-[color:var(--color-fg-muted)]"
                      }`}
                    >
                      {s.idx}
                    </span>
                  </span>
                  <span
                    className={`mt-3 font-heading text-[13px] font-semibold leading-tight transition-colors md:text-[14px] ${
                      isActive
                        ? "text-[color:var(--color-fg)]"
                        : "text-[color:var(--color-fg-muted)]"
                    }`}
                  >
                    {s.title}
                  </span>
                  <span className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-[color:var(--color-primary)]">
                    {s.duration}
                  </span>
                  {s.status && (
                    <span className="mt-1.5 rounded-full border border-[color:var(--color-warning)]/30 bg-[color:var(--color-warning)]/10 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-[color:var(--color-warning)]">
                      {s.status}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Detail panel. Single compact card that swaps with animation. */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step.idx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
          className="mx-auto flex w-full max-w-[620px] items-start gap-3.5 rounded-[12px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 md:p-5"
        >
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-[color:var(--color-primary)]/30 bg-[color:color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
          >
            <Icon
              className="h-[18px] w-[18px] text-[color:var(--color-primary)]"
              strokeWidth={1.8}
            />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
              Step {step.idx} &middot; {step.duration}
            </p>
            <p className="mt-0.5 font-heading text-[15px] font-semibold text-[color:var(--color-fg)]">
              {step.title}
            </p>
            <p className="mt-1.5 text-[13.5px] leading-[1.5] text-[color:var(--color-fg-muted)]">
              {step.body}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
