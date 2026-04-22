"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { FounderPhoto } from "@/components/shared/FounderPhoto";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * FounderSnippet. A compact credibility strip that puts a named,
 * visible human between the FAQ's last objection and the FinalCTA's
 * ask. Before this block existed, a first-time reader had no face and
 * no accountability signal on the landing page - the /founder page was
 * linked from the nav and footer but buried one click away.
 *
 * The copy is deliberately a single short quote - not a bio, not a
 * manifesto - so the section reads in under three seconds. Visitors
 * who care go to /founder; visitors who don't still absorb that the
 * app is built by one named person with a specific reason.
 *
 * Visual shape: left photo (88px mobile, 112px desktop), right quote
 * + attribution + a single arrow link. Mirrors the /founder page's
 * voice without duplicating its length. Belongs between FAQSection
 * and FinalCTA in the page.tsx narrative.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

export function FounderSnippet() {
  return (
    <section
      aria-labelledby="founder-snippet-heading"
      className="relative border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-10 sm:py-12 md:py-16"
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
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="mx-auto flex max-w-[820px] flex-col items-center gap-6 rounded-[18px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 text-center sm:flex-row sm:items-center sm:gap-7 sm:p-6 sm:text-left md:gap-8 md:p-8"
        >
          <div className="shrink-0">
            <FounderPhoto
              src="/images/aayush-founder.jpg"
              alt="Aayush Shah, founder of NexGen Connect"
              initials="AS"
              size={112}
              sizes="112px"
              className="ring-1 ring-[color:var(--color-primary)]/25"
            />
          </div>

          <div className="min-w-0 flex-1">
            <SectionLabel className="mx-auto sm:mx-0">
              Built by a name, not a brand
            </SectionLabel>

            <h2
              id="founder-snippet-heading"
              className="mt-2 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
              style={{
                fontSize: "clamp(18px, 2.8vw, 24px)",
                lineHeight: 1.25,
                letterSpacing: "-0.015em",
              }}
            >
              &ldquo;I landed abroad knowing zero people. I built NexGen{" "}
              <span className="font-serif font-normal italic tracking-[-0.01em] text-[color:var(--color-primary)]">
                so you don&rsquo;t.
              </span>
              &rdquo;
            </h2>

            <p className="mt-3 text-[13px] leading-[1.55] text-[color:var(--color-fg-muted)] sm:text-[13.5px]">
              Twelve WhatsApp groups, four hundred eighty-seven strangers, zero
              people from my home city. That was the pre-flight experience
              every student I spoke to also had. So we rebuilt it &mdash;
              government-verified, small by design, one price forever.
            </p>

            <div className="mt-4 flex flex-col items-center gap-3 sm:mt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
                Aayush Shah &middot; Founder &middot; Mumbai
              </p>

              <Link
                href="/founder"
                className="group inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-primary)] transition-colors hover:text-[color:var(--color-fg)]"
              >
                Read the full story
                <ArrowUpRight
                  className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={2.25}
                />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
