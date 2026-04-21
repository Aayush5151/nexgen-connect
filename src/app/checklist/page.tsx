import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Plane } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { EmailWaitlistForm } from "@/components/landing/EmailWaitlistForm";

/**
 * /checklist - a standalone content page. The twelve-point pre-flight
 * checklist every Indian student bound for Ireland should work through.
 * Exists to rank on long-tail search queries ("what to carry to Ireland
 * for a master&rsquo;s", "GNIB documents checklist", etc) and to give
 * visitors a reason to bookmark the site before the app ships.
 *
 * Voice: tactical, not aspirational. If we can explain it in one line,
 * we do. If it matters for a first-month survival, it is on the list.
 *
 * We do NOT sell anything here - the CTA at the bottom is a soft
 * waitlist save. This page earns trust, it doesn&rsquo;t convert.
 */

export const metadata: Metadata = {
  title:
    "Ireland arrival checklist for Indian students · NexGen Connect",
  description:
    "Twelve tactical things to sort before you land in Dublin. Visa, accommodation, GNIB, banking, phone, airport SIM - every practical thing that matters in week one.",
  alternates: { canonical: "/checklist" },
  openGraph: {
    title: "Ireland arrival checklist for Indian students",
    description:
      "Twelve tactical things to sort before you fly. A NexGen field guide for the September 2026 intake.",
    url: "/checklist",
    type: "article",
  },
};

type CheckItem = {
  n: string;
  title: string;
  body: string;
  bucket: "Before you fly" | "The flight" | "Week one";
};

const CHECKLIST: CheckItem[] = [
  {
    n: "01",
    title: "Confirm the stamp on your visa",
    bucket: "Before you fly",
    body: "Double-check the &ldquo;Stamp 2&rdquo; condition and the exact course date on your D-visa. Ireland&rsquo;s border officer will ask for three things: CAS/offer letter, proof of fees paid, and proof of funds. Print all of them.",
  },
  {
    n: "02",
    title: "Get your Bank of Ireland / AIB proof-of-funds letter",
    bucket: "Before you fly",
    body: "The INIS requirement is a minimum of &euro;10,000 held for the year. Many students lose visa weeks because their balance certificate is stale. Refresh it within 30 days of travel.",
  },
  {
    n: "03",
    title: "Lock a 2-week minimum accommodation before you fly",
    bucket: "Before you fly",
    body: "Dublin &amp; Cork housing is ferocious. Do not land with nothing. Book two weeks via university residence or a verified short-let - then use that window to find a long-term place you actually want.",
  },
  {
    n: "04",
    title: "Buy travel and health insurance that covers GNIB",
    bucket: "Before you fly",
    body: "GNIB registration requires private medical insurance covering the full course duration. Buy it in India - it is a third of the price and the same certificate works at GNIB.",
  },
  {
    n: "05",
    title: "Pack layers, not coats",
    bucket: "Before you fly",
    body: "Dublin is 10&deg;C in September, 3&deg;C in January, and wet 200 days a year. Thermals, a waterproof shell, and a good pair of shoes beat one heavy puffer every time. Buy the puffer in Penneys the week you land.",
  },
  {
    n: "06",
    title: "Carry eight weeks of critical medication",
    bucket: "Before you fly",
    body: "Your Indian prescriptions are not portable. Getting a GP appointment in your first month is slow. Bring eight weeks of anything you actually need and the prescription document with the generic name printed.",
  },
  {
    n: "07",
    title: "Download the Revolut, Transferwise, and GoCardless apps",
    bucket: "The flight",
    body: "Your first month runs on cards, not cash. Revolut accepts Indian passport sign-ups, gives you an IBAN in 48 hours, and is accepted everywhere a physical AIB debit is. Do this from the plane.",
  },
  {
    n: "08",
    title: "Buy a Three or Vodafone Ireland SIM at arrivals",
    bucket: "The flight",
    body: "Three has the best campus coverage; Vodafone the best rural. Both sell &euro;20 pre-paid SIMs at Dublin Airport with 80GB data. Swap the SIM before you leave the terminal - everything downstream needs a working Irish number.",
  },
  {
    n: "09",
    title: "Take the AirCoach or 747, not a taxi",
    bucket: "The flight",
    body: "Dublin&rsquo;s AirCoach runs to UCD Belfield, Trinity, DCU, and most city-centre student areas for &euro;10. A taxi is &euro;35+. Pre-book the AirCoach app before you board in Delhi - last-minute tickets run out on September Sundays.",
  },
  {
    n: "10",
    title: "Schedule GNIB registration within 5 working days",
    bucket: "Week one",
    body: "Non-EEA students have 90 days from arrival to register at GNIB - but the slots on the Immigration portal fill months out. Book the slot the hour you land. Burghquay, Dublin is slower than Blanchardstown or regional offices.",
  },
  {
    n: "11",
    title: "Open a PTSB / AIB student account in week one",
    bucket: "Week one",
    body: "Revolut handles daily spending, but your part-time wages, rent deposit, and HAP forms need an Irish IBAN from a brick bank. PTSB accepts student letters fastest. Bring passport, offer letter, proof of address.",
  },
  {
    n: "12",
    title: "Register with the Indian Embassy in Dublin",
    bucket: "Week one",
    body: "Free, five minutes, done online. In an emergency - lost passport, medical evacuation, family crisis at home - the embassy finds you faster if you are on the student register. Do it the weekend you arrive.",
  },
];

const BUCKETS: Array<CheckItem["bucket"]> = [
  "Before you fly",
  "The flight",
  "Week one",
];

export default function ChecklistPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="flex-1">
        {/* Hero */}
        <section className="pt-24 pb-12 md:pt-32 md:pb-16">
          <div className="container-narrow">
            <div className="mx-auto max-w-[820px]">
              <SectionLabel>Ireland arrival · September 2026</SectionLabel>
              <h1
                className="mt-6 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
                style={{
                  fontSize: "clamp(36px, 7vw, 80px)",
                  lineHeight: 0.98,
                  letterSpacing: "-0.035em",
                }}
              >
                Twelve things to sort{" "}
                <span className="font-serif font-normal italic tracking-[-0.02em] text-[color:var(--color-primary)]">
                  before you fly.
                </span>
              </h1>
              <p className="mt-6 max-w-[600px] text-[17px] leading-[1.55] text-[color:var(--color-fg-muted)] sm:text-[18px]">
                A field guide for the Indian student flying to Ireland for the
                first time. No fluff, no affiliate links, no &ldquo;top 10
                best backpacks&rdquo; - just the tactical stuff that decides
                whether your first month is smooth or a scramble.
              </p>
              <p className="mt-6 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
                <Plane
                  className="h-3.5 w-3.5 text-[color:var(--color-primary)]"
                  strokeWidth={2}
                />
                Last reviewed · April 2026 · Ireland-bound intake
              </p>
            </div>
          </div>
        </section>

        {/* Checklist */}
        <section className="border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] pb-16 pt-12 md:pb-24 md:pt-16">
          <div className="container-narrow">
            <div className="mx-auto max-w-[820px]">
              {BUCKETS.map((bucket) => {
                const rows = CHECKLIST.filter((c) => c.bucket === bucket);
                return (
                  <div key={bucket} className="mb-12 last:mb-0">
                    <div className="mb-5 flex items-center gap-3">
                      <span className="h-px flex-1 bg-[color:var(--color-border)]" />
                      <SectionLabel>{bucket}</SectionLabel>
                      <span className="h-px flex-1 bg-[color:var(--color-border)]" />
                    </div>
                    <ul className="flex flex-col gap-3">
                      {rows.map((row) => (
                        <li
                          key={row.n}
                          className="rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 sm:p-6"
                        >
                          <div className="flex items-start gap-4">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--color-primary)_12%,transparent)] font-mono text-[11px] font-semibold text-[color:var(--color-primary)]">
                              {row.n}
                            </span>
                            <div className="flex-1">
                              <h3 className="font-heading text-[17px] font-semibold leading-[1.35] text-[color:var(--color-fg)] sm:text-[19px]">
                                {row.title}
                              </h3>
                              <p
                                className="mt-2 text-[14px] leading-[1.65] text-[color:var(--color-fg-muted)] sm:text-[15px]"
                                dangerouslySetInnerHTML={{ __html: row.body }}
                              />
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Soft CTA */}
        <section className="relative overflow-hidden border-t border-[color:var(--color-border)] py-20 md:py-28">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(45% 40% at 50% 30%, color-mix(in srgb, var(--color-primary) 10%, transparent) 0%, transparent 70%)",
            }}
          />
          <div className="container-narrow relative">
            <div className="mx-auto max-w-[640px] text-center">
              <SectionLabel className="mx-auto">
                <Check className="mr-1 inline h-3 w-3" strokeWidth={2.5} />
                Saved · checklist complete
              </SectionLabel>
              <h2
                className="mt-5 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
                style={{
                  fontSize: "clamp(28px, 5vw, 52px)",
                  lineHeight: 1.02,
                  letterSpacing: "-0.03em",
                }}
              >
                The thirteenth thing we cannot put{" "}
                <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-primary)]">
                  on a checklist.
                </span>
              </h2>
              <p className="mx-auto mt-5 max-w-[520px] text-[15px] leading-[1.6] text-[color:var(--color-fg-muted)] sm:text-[16px]">
                A pocket-sized group of eight to twelve verified friends
                waiting at Dublin Airport. We are building that on the
                NexGen app. Save your seat, and we ping you the moment it
                opens.
              </p>
              <div className="mx-auto mt-8 max-w-[420px]">
                <EmailWaitlistForm referrer="checklist" />
              </div>
              <Link
                href="/"
                className="mt-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-fg-muted)] transition-colors hover:text-[color:var(--color-primary)]"
              >
                Back to the app story
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
