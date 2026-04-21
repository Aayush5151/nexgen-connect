"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * MeetYourGroup. A "what a filled group actually looks like" preview card.
 * Ten mock students, all verified, all going to UCD for September 2026.
 * Sits between SplitCompare and Manifesto to take the abstract ("verified
 * group") and make it a concrete roster the reader can point at.
 *
 * The card intentionally has no CTA - it exists so the next section's
 * narrative ("Day 0 / -60 / 1") lands with a mental picture already formed.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

type Member = {
  initials: string;
  name: string;
  city: string;
  course: string;
  // `self` is the reader-avatar. Renders in primary tint to read as "you".
  self?: boolean;
};

const GROUP: Member[] = [
  { initials: "YOU", name: "You", city: "— your city", course: "— your course", self: true },
  { initials: "AD", name: "Aditya", city: "Mumbai", course: "MSc Data Science" },
  { initials: "PR", name: "Priya", city: "Bangalore", course: "MSc Finance" },
  { initials: "KR", name: "Karan", city: "Delhi", course: "MEng Software" },
  { initials: "MH", name: "Meera", city: "Pune", course: "MSc Marketing" },
  { initials: "RV", name: "Riya", city: "Hyderabad", course: "MSc AI" },
  { initials: "SA", name: "Sahil", city: "Chennai", course: "MSc Biotech" },
  { initials: "NK", name: "Nikhil", city: "Kolkata", course: "MSc Business" },
  { initials: "IS", name: "Isha", city: "Ahmedabad", course: "MSc Supply Chain" },
  { initials: "AR", name: "Arjun", city: "Jaipur", course: "MEng Civil" },
];

export function MeetYourGroup() {
  return (
    <section className="relative overflow-hidden border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-16 sm:py-20 md:py-28">
      <div className="container-narrow">
        <div className="mx-auto max-w-[680px] text-center">
          <SectionLabel className="mx-auto">The roster</SectionLabel>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="mt-4 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(28px, 6vw, 64px)",
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            Ten students.{" "}
            <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-fg-muted)]">
              One September.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.08 }}
            className="mx-auto mt-4 max-w-[460px] text-[14px] leading-[1.55] text-[color:var(--color-fg-muted)] sm:text-[15px]"
          >
            Here&rsquo;s what a full group for UCD, September 2026, looks like
            the day it closes. Ten verified Indian students. No agents, no
            forex spam, no strangers. Including you.
          </motion.p>
        </div>

        {/* The roster card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.12 }}
          className="mx-auto mt-10 max-w-[920px] sm:mt-12"
        >
          <div className="overflow-hidden rounded-[16px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-[var(--shadow-md)]">
            {/* Card header */}
            <div className="flex items-center justify-between border-b border-[color:var(--color-border)] px-4 py-3 sm:px-6">
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)]"
                />
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-muted)] sm:text-[11px]">
                  UCD · September 2026
                </p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full border border-[color:var(--color-primary)]/30 bg-[color:color-mix(in_srgb,var(--color-primary)_6%,transparent)] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-[color:var(--color-primary)] sm:text-[10px]">
                <CheckCircle2 className="h-3 w-3" strokeWidth={2.2} />
                10 / 10
              </span>
            </div>

            {/* Grid */}
            <ul className="grid grid-cols-2 gap-0 sm:grid-cols-5">
              {GROUP.map((m, i) => (
                <motion.li
                  key={m.name + i}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.35, ease: EASE, delay: 0.04 * i }}
                  className={`relative flex flex-col items-center gap-2 border-[color:var(--color-border)] p-4 text-center sm:p-5 ${
                    // grid lines - right + bottom except edges
                    "border-b sm:border-r [&:nth-child(5n)]:sm:border-r-0 [&:nth-last-child(-n+5)]:sm:border-b-0 [&:nth-child(2n)]:border-r-0 sm:[&:nth-child(2n)]:border-r [&:nth-last-child(-n+2)]:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b"
                  } ${m.self ? "bg-[color:color-mix(in_srgb,var(--color-primary)_5%,transparent)]" : ""}`}
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-full font-heading text-[11px] font-semibold sm:h-12 sm:w-12 sm:text-[12px] ${
                      m.self
                        ? "bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]"
                        : "border border-[color:var(--color-primary)]/30 bg-[color:color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[color:var(--color-primary)]"
                    }`}
                  >
                    {m.initials}
                  </span>
                  <span className="font-heading text-[12px] font-semibold text-[color:var(--color-fg)] sm:text-[13px]">
                    {m.name}
                  </span>
                  <span className="truncate text-[10px] text-[color:var(--color-fg-muted)] sm:text-[11px]">
                    {m.city}
                  </span>
                  <span className="truncate font-mono text-[9px] uppercase tracking-[0.06em] text-[color:var(--color-fg-subtle)] sm:text-[10px]">
                    {m.course}
                  </span>
                </motion.li>
              ))}
            </ul>

            {/* Card footer */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-4 py-3 sm:px-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)] sm:text-[11px]">
                All DigiLocker · Aadhaar / PAN / DL verified
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[color:var(--color-primary)] sm:text-[11px]">
                Group closes when full
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
