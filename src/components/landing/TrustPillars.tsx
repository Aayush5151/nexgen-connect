"use client";

import { motion } from "framer-motion";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * TrustPillars. The product mechanic in one number.
 *
 * v15 redesign: the previous "four small receipts" grid was reading as
 * dashboard chrome — four numbers, four cards, four readers' worth of
 * effort. Replaced with the single most important number from v10 §3.1
 * (60 verified students share your corridor before DMs unlock), shown
 * at receipt-size that you can read across a room. Three supporting
 * lines hang off it with the rest of the v10 promises (3× verification,
 * 0 agents, ₹0 student bill).
 *
 * Designed to fit in one viewport on every device — `min-h-[100dvh]`
 * + flex-center, big-number type capped at 480px so it stays legible
 * on a 4K TV without overrunning a 14" laptop.
 *
 * v10 alignment: the four facts here come straight from v10 §3.1
 * "Three Promises" plus the §1.1 corridor unlock threshold. Nothing
 * fabricated.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

const SUPPORTS = [
  { num: "3×", label: "Verification per person" },
  { num: "0", label: "Agents inside" },
  { num: "₹0", label: "Cost to students" },
] as const;

export function TrustPillars() {
  return (
    <section className="relative flex min-h-[100dvh] items-center overflow-hidden border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-12 sm:py-16">
      {/* Single warm primary bloom behind the mega number, so the
          digit feels lit from within rather than stamped on a flat
          field. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(45% 45% at 50% 50%, color-mix(in srgb, var(--color-primary) 14%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="container-narrow relative w-full">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center text-center">
          {/* Section label — single mono kicker, replaces the
              previous "Four receipts" plate. */}
          <SectionLabel className="mx-auto">The mechanic</SectionLabel>

          {/* The mega number. clamp() so it scales from ~140px on a
              375px iPhone to ~380px on a 4K display without breaking
              line height. Tracks tight, leading 0.85 so the digit
              reads as a single object, not as text. */}
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="relative mt-6 flex flex-col items-center"
          >
            <span
              aria-hidden="true"
              className="font-heading font-semibold tabular-nums text-[color:var(--color-primary)]"
              style={{
                fontSize: "clamp(140px, 22vw, 380px)",
                lineHeight: 0.85,
                letterSpacing: "-0.06em",
              }}
            >
              60
            </span>
          </motion.div>

          {/* Single line of caption — the v10 §1.1 mechanic in
              twenty words. Serif italic on the verb so the line has a
              clear pivot, sans for the rest. */}
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.12 }}
            className="mt-6 max-w-[820px] font-heading font-semibold text-balance text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(20px, 3.4vw, 36px)",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            Verified classmates share your corridor before{" "}
            <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-primary)]">
              DMs unlock.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.2 }}
            className="mt-4 max-w-[560px] text-[14px] leading-[1.55] text-[color:var(--color-fg-muted)] sm:text-[15.5px]"
          >
            Your home city. Your destination. Your intake month. Until
            sixty share that corridor, nobody can DM. The group has to
            be real before the group can talk.
          </motion.p>

          {/* Three supporting facts laid out in one row. Each is its
              own mini-number, no card chrome — just a digit and a
              label. Reads as supporting evidence to the 60, not
              competing with it. */}
          <motion.ul
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.3 }}
            className="mt-10 grid w-full max-w-[820px] grid-cols-3 gap-3 border-t border-[color:var(--color-border)] pt-8 sm:gap-6 sm:pt-10"
          >
            {SUPPORTS.map((s) => (
              <li
                key={s.label}
                className="flex flex-col items-center text-center"
              >
                <span
                  className="font-heading font-semibold tabular-nums text-[color:var(--color-fg)]"
                  style={{
                    fontSize: "clamp(40px, 6vw, 80px)",
                    lineHeight: 0.95,
                    letterSpacing: "-0.04em",
                  }}
                >
                  {s.num}
                </span>
                <span className="mt-2 max-w-[180px] font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-fg-muted)] sm:text-[11px]">
                  {s.label}
                </span>
              </li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
