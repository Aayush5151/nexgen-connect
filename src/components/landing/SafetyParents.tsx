"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  HeartHandshake,
  Lock,
  PhoneCall,
  ShieldOff,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * SafetyParents. A section aimed at the most skeptical reader on the
 * site: the Indian parent weighing whether a daughter or son should
 * trust an app full of strangers. Fourth wall broken - copy speaks
 * directly to &ldquo;mum and dad&rdquo; and lists the safeguards in plain
 * English. Six pillars, one closing line.
 *
 * v11 rework: the previous pass read as a wall of text - six cards,
 * each with a two- or three-sentence body. Skeptical parents skim; a
 * wall reads as hand-waving. This pass cuts every body to a single
 * sharp line (average 12 words) and trades paragraph weight for
 * visual weight:
 *   - Each pillar is now numbered 01-06 so the sequence reads like a
 *     checklist, not a marketing brochure.
 *   - A primary-coloured edge strip on the left anchors every card so
 *     the grid reads as "six receipts", not "six paragraphs".
 *   - A &ldquo;Built in, day one&rdquo; stamp at the card foot carries
 *     the proof-of-commitment that used to be buried in the body.
 * The actual safeguards are unchanged. Fewer words, same promises.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

type Pillar = {
  icon: LucideIcon;
  index: string;
  title: string;
  body: string;
};

const PILLARS: Pillar[] = [
  {
    icon: Lock,
    index: "01",
    title: "Verified-only walls",
    body: "Phone OTP, DigiLocker Aadhaar, and a human-checked admit letter. No exceptions.",
  },
  {
    icon: Users,
    index: "02",
    title: "Women-only groups",
    body: "Opt in and you match only with verified women. Invisible to everyone else.",
  },
  {
    icon: ShieldOff,
    index: "03",
    title: "No dating patterns",
    body: "No swipe. No photo-first profiles. Instagram reveals only on mutual opt-in.",
  },
  {
    icon: AlertTriangle,
    index: "04",
    title: "One-tap report",
    body: "Every report reaches our named Trust & Safety advisor within 24 hours.",
  },
  {
    icon: PhoneCall,
    index: "05",
    title: "24/7 crisis line",
    body: "One number. A real human on call across every corridor, every time zone.",
  },
  {
    icon: HeartHandshake,
    index: "06",
    title: "Parent view (Premium)",
    body: "Group + airport arrival only. Never your chats. Never your Instagram.",
  },
];

export function SafetyParents() {
  return (
    <section className="relative overflow-hidden border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-10 sm:py-12 md:py-16">
      {/* Ambient primary bloom at the top so the section reads as a
          quiet statement, not a spec sheet. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 35% at 50% 0%, color-mix(in srgb, var(--color-primary) 10%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="container-narrow relative">
        <div className="mx-auto max-w-[720px] text-center">
          <SectionLabel className="mx-auto">
            For the most skeptical reader
          </SectionLabel>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="mt-3 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(24px, 5vw, 50px)",
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            If you&rsquo;re a parent{" "}
            <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-fg-muted)]">
              reading this.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.08 }}
            className="mx-auto mt-3 max-w-[520px] text-[14px] leading-[1.55] text-[color:var(--color-fg-muted)] sm:text-[15px]"
          >
            Six safeguards, one line each. Scannable, no jargon, no
            hand-waving.
          </motion.p>
        </div>

        {/* Receipt-style grid. sm+: 2 cols. md+: 3 cols so the set
            reads as two tidy rows, not a vertical wall of six. */}
        <ul className="mx-auto mt-8 grid max-w-[1040px] grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-3.5 md:grid-cols-3 md:gap-4">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.li
                key={p.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.05 * i }}
                className="group relative flex flex-col overflow-hidden rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 transition-colors hover:border-[color:var(--color-primary)]/45 sm:p-5"
              >
                {/* Left edge accent - reads as an index stripe on a
                    receipt. Stays primary-tinted so every card feels
                    stamped, not just bordered. */}
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 h-full w-[3px] bg-[color:var(--color-primary)] opacity-70 transition-opacity group-hover:opacity-100"
                />

                {/* Header row: mono index on the left, icon on the right */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-primary)]">
                    {p.index}
                  </span>
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-primary)]/30 bg-[color:color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
                  >
                    <Icon
                      className="h-[17px] w-[17px] text-[color:var(--color-primary)]"
                      strokeWidth={1.8}
                    />
                  </span>
                </div>

                <h3 className="mt-4 font-heading text-[16px] font-semibold text-[color:var(--color-fg)] sm:text-[17px]">
                  {p.title}
                </h3>
                <p className="mt-1.5 flex-1 text-[13px] leading-[1.5] text-[color:var(--color-fg-muted)]">
                  {p.body}
                </p>

                {/* Verified stamp at the foot. Replaces a paragraph of
                    "we promise this at launch" with a single visual
                    cue. */}
                <div className="mt-4 flex items-center gap-1.5 border-t border-[color:var(--color-border)] pt-3">
                  <span
                    aria-hidden="true"
                    className="flex h-3 w-3 items-center justify-center rounded-full bg-[color:var(--color-primary)]"
                  >
                    <svg
                      width="8"
                      height="8"
                      viewBox="0 0 12 12"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M2 6l3 3 5-6"
                        stroke="var(--color-primary-fg)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-[color:var(--color-fg-subtle)]">
                    Built in, day one
                  </span>
                </div>
              </motion.li>
            );
          })}
        </ul>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
          className="mx-auto mt-10 max-w-[520px] text-center font-serif italic text-[16px] leading-[1.4] tracking-[-0.01em] text-[color:var(--color-fg-muted)] sm:mt-12 sm:text-[19px]"
        >
          No hand-waving. Six promises, live from day one.
        </motion.p>
      </div>
    </section>
  );
}
