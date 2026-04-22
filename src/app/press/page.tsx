import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectionLabel } from "@/components/ui/SectionLabel";

export const metadata: Metadata = {
  title: "Press",
  description:
    "Press kit for NexGen Connect. Logo, boilerplate, founder bio, and press contact. Two launch corridors: Ireland (Sept 2026) and Germany (Oct 2026).",
};

/**
 * /press - the press kit surface.
 *
 * Structure is deliberately operational (editor-first), not decorative:
 *   01 Boilerplate - a single paragraph a journalist can paste verbatim
 *   02 Quick facts - dateline, stage, founder, launch, first corridor
 *   03 Founder bio - 100-word one-liner biography
 *   04 Brand pack - logo, wordmark, color, typography
 *   05 Press contact - email, quotes contact, socials
 *
 * No stock photography, no vanity metrics, no &ldquo;featured in&rdquo; logos.
 * A press page should be easy to quote, not easy to look at.
 */

const QUICK_FACTS = [
  { label: "Company", value: "NexGen Connect" },
  { label: "Founded", value: "2026" },
  { label: "Founder", value: "Aayush Shah" },
  { label: "HQ", value: "India" },
  { label: "Stage", value: "Pre-launch" },
  { label: "Launch corridors", value: "India → Ireland · India → Germany" },
  { label: "App launches", value: "Sept 2026 · Oct 2026" },
  { label: "Platforms", value: "iOS · Android" },
];

const BOILERPLATE_EN = `NexGen Connect is a mobile app that forms a pocket-sized group of eight to twelve verified students flying to the same country, in the same month. Every member is verified through three checks: phone OTP via MSG91, Aadhaar consent via DigiLocker (a one-way verification token - the Aadhaar number itself is never stored), and a human-reviewed admit letter. Group DMs unlock only once a corridor crosses sixty verified students. The app launches with two corridors: India - Ireland in September 2026, connecting students headed to University College Dublin, Trinity College Dublin, and University College Cork; and India - Germany in October 2026, connecting students headed to the Technical University of Munich, LMU Munich, RWTH Aachen, and Humboldt University of Berlin. NexGen Connect is students-only, with a free tier that covers matching, verification, and group DMs, and a one-time Premium unlock at rupees 1,499 that adds priority matching four months before intake, group-apply apartment tooling (a shared shortlist from our student-housing partners, country-specific lease-readiness checklists, co-signer coordination, and the Alumni Handover Board), and a read-only Parent view with priority 24/7 support. No immigration agents. No recruiters. No ads. No subscription.`;

const BOILERPLATE_SHORT = `NexGen Connect is a verified, students-only mobile app that forms a pocket-sized group of eight to twelve classmates flying the same corridor, before they land. Free to use. Premium one-time unlock for priority matching, apartment coordination, and parent peace of mind. Two launch corridors in 2026: India - Ireland (September) and India - Germany (October).`;

const FOUNDER_BIO = `Aayush Shah is the founder of NexGen Connect. Before starting the company, he was one of 487 strangers in a WhatsApp group of students flying to Ireland - and found zero people from his home city. NexGen Connect is the product he wished had existed on the flight over. Based in India. Building in public.`;

export default function PressPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="flex-1">
        {/* Hero */}
        <section className="pt-24 pb-16 md:pt-32 md:pb-20">
          <div className="container-narrow">
            <SectionLabel>Press</SectionLabel>
            <h1
              className="mt-6 max-w-[760px] font-heading font-semibold text-balance text-[color:var(--color-fg)]"
              style={{
                fontSize: "clamp(36px, 7.5vw, 80px)",
                lineHeight: 1,
                letterSpacing: "-0.035em",
              }}
            >
              Press kit and{" "}
              <span className="font-serif font-normal italic tracking-[-0.02em] text-[color:var(--color-primary)]">
                boilerplate.
              </span>
            </h1>
            <p className="mt-6 max-w-[560px] text-[16px] leading-[1.55] text-[color:var(--color-fg-muted)] sm:text-[17px]">
              Everything a journalist, podcast host, or newsroom editor needs
              to quote us correctly. Paste the boilerplate, lift the facts,
              and reach out if you need more.
            </p>
          </div>
        </section>

        {/* Boilerplate */}
        <section className="border-t border-[color:var(--color-border)] py-16 md:py-20">
          <div className="container-narrow">
            <div className="grid gap-10 md:grid-cols-12 md:gap-16">
              <div className="md:col-span-4">
                <SectionLabel>01 Boilerplate</SectionLabel>
                <p className="mt-4 max-w-[320px] text-[14px] leading-[1.55] text-[color:var(--color-fg-muted)]">
                  A single paragraph any editor can paste verbatim. A shorter
                  one for headlines.
                </p>
              </div>
              <div className="md:col-span-8">
                <div className="rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 sm:p-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
                    Long · ~150 words
                  </p>
                  <p className="mt-3 text-[15px] leading-[1.7] text-[color:var(--color-fg)]">
                    {BOILERPLATE_EN}
                  </p>
                </div>
                <div className="mt-4 rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 sm:p-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
                    Short · ~45 words
                  </p>
                  <p className="mt-3 text-[15px] leading-[1.7] text-[color:var(--color-fg)]">
                    {BOILERPLATE_SHORT}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick facts */}
        <section className="border-t border-[color:var(--color-border)] py-16 md:py-20">
          <div className="container-narrow">
            <div className="grid gap-10 md:grid-cols-12 md:gap-16">
              <div className="md:col-span-4">
                <SectionLabel>02 Quick facts</SectionLabel>
                <p className="mt-4 max-w-[320px] text-[14px] leading-[1.55] text-[color:var(--color-fg-muted)]">
                  The dateline row. Every data point here is on-the-record
                  and citation-safe.
                </p>
              </div>
              <div className="md:col-span-8">
                <dl className="grid grid-cols-1 divide-y divide-[color:var(--color-border)] overflow-hidden rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] sm:grid-cols-2 sm:divide-y-0">
                  {QUICK_FACTS.map((fact, i) => (
                    <div
                      key={fact.label}
                      className={`flex items-baseline justify-between gap-6 p-5 sm:block ${
                        i % 2 === 1
                          ? "sm:border-l sm:border-[color:var(--color-border)]"
                          : ""
                      } ${
                        i >= 2
                          ? "sm:border-t sm:border-[color:var(--color-border)]"
                          : ""
                      }`}
                    >
                      <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
                        {fact.label}
                      </dt>
                      <dd className="font-heading text-[16px] font-semibold text-[color:var(--color-fg)] sm:mt-1">
                        {fact.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </section>

        {/* Founder bio */}
        <section className="border-t border-[color:var(--color-border)] py-16 md:py-20">
          <div className="container-narrow">
            <div className="grid gap-10 md:grid-cols-12 md:gap-16">
              <div className="md:col-span-4">
                <SectionLabel>03 Founder bio</SectionLabel>
                <p className="mt-4 max-w-[320px] text-[14px] leading-[1.55] text-[color:var(--color-fg-muted)]">
                  A 70-word paragraph you can drop into an author bio slot
                  or a speaker page.
                </p>
              </div>
              <div className="md:col-span-8">
                <div className="flex items-start gap-5 rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 sm:p-8">
                  <span
                    aria-hidden="true"
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-primary)]/40 bg-[color:color-mix(in_srgb,var(--color-primary)_10%,transparent)] font-heading text-[18px] font-semibold text-[color:var(--color-primary)]"
                  >
                    AS
                  </span>
                  <div>
                    <p className="font-heading text-[17px] font-semibold text-[color:var(--color-fg)]">
                      Aayush Shah
                    </p>
                    <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
                      Founder · NexGen Connect
                    </p>
                    <p className="mt-4 text-[15px] leading-[1.65] text-[color:var(--color-fg)]">
                      {FOUNDER_BIO}
                    </p>
                    <Link
                      href="/founder"
                      className="mt-5 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-primary)] transition-colors hover:text-[color:var(--color-primary-hover)]"
                    >
                      Read the longer story
                      <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Brand pack */}
        <section className="border-t border-[color:var(--color-border)] py-16 md:py-20">
          <div className="container-narrow">
            <div className="grid gap-10 md:grid-cols-12 md:gap-16">
              <div className="md:col-span-4">
                <SectionLabel>04 Brand pack</SectionLabel>
                <p className="mt-4 max-w-[320px] text-[14px] leading-[1.55] text-[color:var(--color-fg-muted)]">
                  Use the full wordmark whenever you have room. The mark
                  alone works for avatars and tiny placements.
                </p>
              </div>
              <div className="md:col-span-8">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Full wordmark swatch */}
                  <div className="flex flex-col items-start justify-between gap-6 rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 sm:p-8">
                    <div className="flex items-center gap-2 font-heading text-[22px] font-semibold tracking-[-0.01em] text-[color:var(--color-fg)]">
                      <span
                        aria-hidden="true"
                        className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]"
                      >
                        <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                          <path
                            d="M2 9V3l8 6V3"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <span>NexGen</span>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
                        Full wordmark
                      </p>
                      <p className="mt-1 text-[13px] text-[color:var(--color-fg-muted)]">
                        Primary lockup. Default on light or dark.
                      </p>
                    </div>
                  </div>

                  {/* Mark-only swatch */}
                  <div className="flex flex-col items-start justify-between gap-6 rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 sm:p-8">
                    <span
                      aria-hidden="true"
                      className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]"
                    >
                      <svg width="22" height="22" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2 9V3l8 6V3"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
                        Mark only
                      </p>
                      <p className="mt-1 text-[13px] text-[color:var(--color-fg-muted)]">
                        Use in avatars, favicons, 32-128px placements.
                      </p>
                    </div>
                  </div>

                  {/* Primary color swatch */}
                  <div className="rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 sm:p-8">
                    <div
                      aria-hidden="true"
                      className="h-16 w-full rounded-[8px]"
                      style={{ background: "var(--color-primary)" }}
                    />
                    <div className="mt-5 space-y-1">
                      <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
                        Primary
                      </p>
                      <p className="font-heading text-[16px] font-semibold text-[color:var(--color-fg)]">
                        #00DC82
                      </p>
                      <p className="font-mono text-[11px] text-[color:var(--color-fg-muted)]">
                        NexGen Green
                      </p>
                    </div>
                  </div>

                  {/* Typography */}
                  <div className="rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 sm:p-8">
                    <p className="font-heading text-[28px] font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]">
                      Inter Tight
                    </p>
                    <p className="mt-1 font-serif italic text-[22px] text-[color:var(--color-fg-muted)]">
                      Instrument Serif
                    </p>
                    <p className="mt-1 font-mono text-[13px] text-[color:var(--color-fg-muted)]">
                      JetBrains Mono
                    </p>
                    <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
                      Typography
                    </p>
                  </div>
                </div>

                <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
                  High-res SVG + PNG pack on request.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Press contact */}
        <section className="border-t border-[color:var(--color-border)] py-16 md:py-24">
          <div className="container-narrow">
            <div className="mx-auto max-w-[680px] text-center">
              <SectionLabel className="mx-auto">05 Press contact</SectionLabel>
              <h2
                className="mt-5 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
                style={{
                  fontSize: "clamp(28px, 5vw, 52px)",
                  lineHeight: 1.04,
                  letterSpacing: "-0.03em",
                }}
              >
                Writing a piece?{" "}
                <span className="font-serif font-normal italic text-[color:var(--color-fg-muted)]">
                  Say hello.
                </span>
              </h2>
              <p className="mx-auto mt-5 max-w-[480px] text-[15px] leading-[1.6] text-[color:var(--color-fg-muted)] sm:text-[16px]">
                Replies within 24 hours, Monday through Friday. Faster if it
                is time-sensitive - add &ldquo;urgent&rdquo; to the subject line.
              </p>

              <a
                href="mailto:press@nexgenconnect.com"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[color:var(--color-primary)] px-6 py-3 font-heading text-[14px] font-semibold text-[color:var(--color-primary-fg)] transition-colors hover:bg-[color:var(--color-primary-hover)]"
              >
                <Mail className="h-4 w-4" strokeWidth={2} />
                press@nexgenconnect.com
              </a>

              <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
                For founder quotes, put &ldquo;FOUNDER QUOTE&rdquo; in the subject.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
