"use client";

import { motion } from "framer-motion";
import { AppStoreBadge } from "@/components/ui/AppStoreBadge";
import { PlayStoreBadge } from "@/components/ui/PlayStoreBadge";
import { MagneticButton } from "@/components/shared/MagneticButton";

/**
 * MiniCTA. A slim conversion band that sits between sections and
 * repeats the download ask so visitors don't have to scroll back to
 * the hero (or all the way down to FinalCTA) to act. Kept deliberately
 * lighter than either of those anchor moments so it reads as a quiet
 * prompt rather than a hard interruption:
 *   - Single row on sm+; stacked on mobile.
 *   - Lead-in copy is configurable per-instance via `lead` so the band
 *     can echo the section that immediately preceded it (e.g. "Sound
 *     like your group?" after AppShowcase, "Want in with them?" after
 *     TestimonialWall).
 *   - Store badges reuse the launch-toast behaviour from AppStoreBadge
 *     / PlayStoreBadge, so a tap still routes through the waitlist.
 *   - A small "or grab the waitlist" text link jumps to #download for
 *     visitors who prefer the inline email pill in the FinalCTA.
 * Intentionally has no email input of its own - we want exactly two
 * waitlist forms on the page (hero and FinalCTA) so conversion
 * analytics stay readable.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

type Props = {
  /** Short rhetorical line that leads into the CTA on the left. */
  lead: string;
  /** Optional subline in quieter text (e.g. launch timing reminder). */
  note?: string;
};

export function MiniCTA({ lead, note = "Launching Sept 2026" }: Props) {
  return (
    <section
      aria-label="Download NexGen"
      className="relative border-t border-[color:var(--color-border)] bg-[color:var(--color-surface)]/40 py-6 sm:py-7 md:py-8"
    >
      {/* Quiet primary bloom so the band doesn't read as a hard
          divider between the sections on either side. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(40% 70% at 50% 50%, color-mix(in srgb, var(--color-primary) 6%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="container-narrow relative">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:text-left"
        >
          <div className="min-w-0">
            <p className="font-heading text-[17px] font-semibold tracking-[-0.01em] text-[color:var(--color-fg)] sm:text-[18px]">
              {lead}
            </p>
            <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
              {note}
              <span aria-hidden="true" className="mx-2">
                &middot;
              </span>
              <a
                href="#download"
                className="text-[color:var(--color-primary)] transition-colors hover:text-[color:var(--color-fg)]"
              >
                or grab a waitlist spot &rarr;
              </a>
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-stretch gap-2.5 sm:flex-row sm:items-center sm:gap-3">
            <MagneticButton strength={5}>
              <AppStoreBadge size="sm" />
            </MagneticButton>
            <MagneticButton strength={5}>
              <PlayStoreBadge size="sm" />
            </MagneticButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
