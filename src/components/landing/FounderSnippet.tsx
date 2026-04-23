"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { FounderPhoto } from "@/components/shared/FounderPhoto";

/**
 * FounderSnippet. A compact credibility strip that puts a named,
 * visible human between the FAQ's last objection and the FinalCTA's
 * ask. Before this block existed, a first-time reader had no face and
 * no accountability signal on the landing page - the /founder page was
 * linked from the nav and footer but buried one click away.
 *
 * v12 trim: the previous card wrapped a section label, a two-line
 * headline quote, a three-line paragraph, and a separate attribution
 * row in ~180px of vertical space. The paragraph was re-telling the
 * ProblemMoments section ("twelve WhatsApp groups, four hundred
 * eighty-seven strangers") which readers have already seen. Now it's
 * one strip: photo + quote + one-line attribution + link. Roughly
 * half the vertical footprint, same credibility payload.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

export function FounderSnippet() {
  return (
    <section
      aria-labelledby="founder-snippet-heading"
      className="relative border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-8 sm:py-10 md:py-12"
    >
      {/* Soft ambient wash - a single quiet primary bloom on the left
          so the photo feels lit without a hard border between columns. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(28% 38% at 18% 50%, color-mix(in srgb, var(--color-primary) 6%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="container-narrow relative">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="mx-auto flex max-w-[760px] flex-col items-center gap-4 rounded-[16px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 text-center sm:flex-row sm:items-center sm:gap-5 sm:p-5 sm:text-left"
        >
          <div className="shrink-0">
            <FounderPhoto
              src="/images/aayush-founder.jpg"
              alt="Aayush Shah, founder of NexGen Connect"
              initials="AS"
              size={72}
              sizes="72px"
              className="ring-1 ring-[color:var(--color-primary)]/25"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h2
              id="founder-snippet-heading"
              className="font-heading font-semibold text-balance text-[color:var(--color-fg)]"
              style={{
                fontSize: "clamp(15px, 2vw, 18px)",
                lineHeight: 1.3,
                letterSpacing: "-0.01em",
              }}
            >
              &ldquo;I landed abroad knowing zero people. I built NexGen{" "}
              <span className="font-serif font-normal italic tracking-[-0.01em] text-[color:var(--color-primary)]">
                so you don&rsquo;t.
              </span>
              &rdquo;
            </h2>

            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
              Aayush Shah &middot; Founder &middot; Mumbai
            </p>
          </div>

          <Link
            href="/founder"
            className="group inline-flex shrink-0 items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-primary)] transition-colors hover:text-[color:var(--color-fg)]"
          >
            Read the full story
            <ArrowUpRight
              className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              strokeWidth={2.25}
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
