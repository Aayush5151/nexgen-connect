"use client";

import { motion } from "framer-motion";
import {
  Building2,
  CalendarRange,
  MapPin,
  ScrollText,
  UserCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * CorridorWidening. A transparency-first explainer of what happens when
 * the ideal corridor (your home city + your destination uni + your
 * intake month) has fewer than sixty verified students.
 *
 * Rather than silently backfilling with randoms, we widen the match
 * boundary along one of five axes - and we always tell the user which
 * one widened, and by how much. Users can opt any axis out.
 *
 * v4 business-rule alignment:
 *   - Home city               -> State / region neighbour
 *   - Destination university  -> Sibling university in the same city
 *   - Intake month            -> Adjacent quarter (e.g. Sept <-> Jan)
 *   - Gender preference       -> Opt to include a wider pool
 *   - Religious / dietary     -> Optional preference, never required
 *
 * Visual intent: five horizontal &quot;before -&gt; after&quot; rows, each with
 * a subtle animated arrow. A closing promise: &ldquo;We never widen silently.&rdquo;
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

type Axis = {
  icon: LucideIcon;
  label: string;
  from: string;
  to: string;
  note: string;
};

const AXES: Axis[] = [
  {
    icon: MapPin,
    label: "Home city",
    from: "Pune",
    to: "Maharashtra neighbours",
    note: "If your city hasn&rsquo;t hit sixty verified students yet, we widen to the next tier of your home state - and show you every city it now includes.",
  },
  {
    icon: Building2,
    label: "Destination university",
    from: "UCD only",
    to: "UCD + Trinity + UCC",
    note: "Sibling universities in the same city share your first week. You can mute any one of them and stay strictly single-uni.",
  },
  {
    icon: CalendarRange,
    label: "Intake month",
    from: "September 2026",
    to: "Aug - Oct 2026",
    note: "Adjacent-quarter intakes get stitched in when a single month is too thin. The Jan 2027 intake only enters if you tick the box.",
  },
  {
    icon: UserCircle2,
    label: "Gender preference",
    from: "Women-only group",
    to: "Stays women-only",
    note: "If you&rsquo;ve opted in to women-only matching, your group is never widened to mixed. We&rsquo;d rather delay your group than break that wall.",
  },
  {
    icon: ScrollText,
    label: "Religion &amp; diet",
    from: "Optional filter",
    to: "Optional filter",
    note: "This axis exists only if you turned it on. We never widen to add or remove a preference you didn&rsquo;t set yourself.",
  },
];

export function CorridorWidening() {
  return (
    <section
      id="corridor"
      aria-labelledby="corridor-heading"
      className="relative overflow-hidden border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-10 sm:py-12 md:py-16"
    >
      {/* A single quiet primary wash across the top, so the section reads
          as calm and explanatory - not a sales pitch. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(38% 38% at 50% 0%, color-mix(in srgb, var(--color-primary) 6%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="container-narrow relative">
        <div className="mx-auto max-w-[720px] text-center">
          <SectionLabel className="mx-auto">How matching widens</SectionLabel>
          <motion.h2
            id="corridor-heading"
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
            Your corridor can widen.{" "}
            <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-primary)]">
              We always tell you how.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.08 }}
            className="mx-auto mt-3 max-w-[560px] text-[13.5px] leading-[1.55] text-[color:var(--color-fg-muted)] sm:text-[14.5px]"
          >
            If your ideal corridor has fewer than sixty verified students,
            we widen on exactly one axis at a time - and you see the change
            the moment it happens. No silent backfills. No random strangers
            slipped in.
          </motion.p>
        </div>

        <ul className="mx-auto mt-6 grid max-w-[1120px] grid-cols-1 gap-2.5 sm:mt-8 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
          {AXES.map((axis, i) => {
            const Icon = axis.icon;
            return (
              <motion.li
                key={axis.label}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.06 * i }}
                className="flex flex-col rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 transition-colors hover:border-[color:var(--color-border-strong)]"
              >
                {/* Icon + axis label */}
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-primary)]/30 bg-[color:color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
                  >
                    <Icon
                      className="h-3.5 w-3.5 text-[color:var(--color-primary)]"
                      strokeWidth={1.8}
                    />
                  </span>
                  <p
                    className="font-heading text-[13.5px] font-semibold text-[color:var(--color-fg)]"
                    dangerouslySetInnerHTML={{ __html: axis.label }}
                  />
                </div>

                {/* from -> to pair */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="min-w-0 flex-1 rounded-[8px] border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-bg)]/60 px-2.5 py-1.5">
                    <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
                      Your pick
                    </p>
                    <p className="mt-0.5 truncate font-heading text-[12.5px] font-semibold text-[color:var(--color-fg)]">
                      {axis.from}
                    </p>
                  </div>

                  <ArrowRight
                    aria-hidden="true"
                    className="h-3.5 w-3.5 shrink-0 text-[color:var(--color-fg-subtle)]"
                    strokeWidth={1.8}
                  />

                  <div className="min-w-0 flex-1 rounded-[8px] border border-[color:var(--color-primary)]/35 bg-[color:color-mix(in_srgb,var(--color-primary)_7%,transparent)] px-2.5 py-1.5">
                    <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[color:var(--color-primary)]">
                      If widened
                    </p>
                    <p className="mt-0.5 truncate font-heading text-[12.5px] font-semibold text-[color:var(--color-fg)]">
                      {axis.to}
                    </p>
                  </div>
                </div>

                <p
                  className="mt-3 text-[12.5px] leading-[1.5] text-[color:var(--color-fg-muted)]"
                  dangerouslySetInnerHTML={{ __html: axis.note }}
                />
              </motion.li>
            );
          })}
        </ul>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
          className="mx-auto mt-8 max-w-[560px] text-center font-serif italic text-[15px] leading-[1.45] tracking-[-0.01em] text-[color:var(--color-fg-muted)] sm:mt-10 sm:text-[17px]"
        >
          Every widen shows up in your feed with the exact reason. One tap
          to roll it back.
        </motion.p>
      </div>
    </section>
  );
}
