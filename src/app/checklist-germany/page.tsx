import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Plane } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { EmailWaitlistForm } from "@/components/landing/EmailWaitlistForm";

/**
 * /checklist-germany - the Munich/Berlin/Aachen-bound sister of the
 * Ireland checklist. The twelve-point pre-flight checklist every Indian
 * student bound for Germany should work through before the October 2026
 * Wintersemester. Exists to rank on long-tail German-intake queries
 * ("what to carry to Germany for a master&rsquo;s", "Anmeldung checklist
 * Munich", "blocked account Fintiba vs Expatrio", etc) and to give
 * visitors a reason to bookmark the site before the app ships.
 *
 * This page is deliberately Germany-specific (Blocked account,
 * Anmeldung, TK, DKB, DB Navigator) and cannot be text-swapped to
 * Dublin. The Ireland version lives at /checklist.
 *
 * Voice matches /checklist: tactical, not aspirational. If we can
 * explain it in one line, we do. If it matters for a first-month
 * survival, it is on the list.
 */

export const metadata: Metadata = {
  title:
    "Germany arrival checklist for Indian students · NexGen Connect",
  description:
    "Twelve tactical things to sort before you land in Munich, Berlin, or Aachen. Blocked account, visa, Anmeldung, TK insurance, Deutsche Bahn - every practical thing that matters in week one.",
  alternates: { canonical: "/checklist-germany" },
  openGraph: {
    title: "Germany arrival checklist for Indian students",
    description:
      "Twelve tactical things to sort before you fly. A NexGen field guide for the October 2026 Wintersemester.",
    url: "/checklist-germany",
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
    title: "Fund the blocked account \u2014 Fintiba, Expatrio, or Coracle",
    bucket: "Before you fly",
    body: "Germany requires a Sperrkonto with \u20ac11,904 for 2026 (one year of living expenses). Fintiba is fastest for Indian applicants, Expatrio bundles insurance, Coracle is cheapest. Decide before you book the visa appointment \u2014 the confirmation letter is what the consulate wants to see.",
  },
  {
    n: "02",
    title: "Book the VFS visa appointment the moment you have your Zulassung",
    bucket: "Before you fly",
    body: "D-visa appointments (national student visa) at VFS Global centres in Delhi, Mumbai, Bangalore, Chennai, and Kolkata vanish within minutes of the August wave dropping. The Zulassung (admission letter) + blocked account proof + APS certificate + health insurance are your four anchor documents.",
  },
  {
    n: "03",
    title: "Get your APS certificate early if you haven\u2019t already",
    bucket: "Before you fly",
    body: "The Akademische Pr\u00fcfstelle certificate from the German embassy in Delhi verifies your Indian degree. It is mandatory for most Masters programmes and takes three to four weeks. If your admit is conditional on APS, start now \u2014 the consulate will not process the visa without it.",
  },
  {
    n: "04",
    title: "Pick health insurance: TK or AOK public, or Mawista private",
    bucket: "Before you fly",
    body: "Every student under 30 enrolled in a German uni needs statutory public health insurance (GKV) \u2014 Techniker Krankenkasse (TK) and AOK are the two big English-friendly ones at about \u20ac125/month. Private plans (Mawista, DR-WALTER) are cheaper but most universities will reject them at matriculation. Get the TK digital confirmation before you fly.",
  },
  {
    n: "05",
    title: "Lock a 2-week minimum accommodation before you fly",
    bucket: "Before you fly",
    body: "Munich and Berlin housing is ferocious. Do not land with nothing. Apply to the Studentenwerk (Studierendenwerk in Aachen) the day you accept your offer \u2014 then book a hostel or short-let for the first two weeks via Wunderflats or Homelike. Use that window to tour WG-gesucht listings you actually want.",
  },
  {
    n: "06",
    title: "Pack for 10\u00b0C wet, not \u201cwinter\u201d",
    bucket: "Before you fly",
    body: "Munich is 12\u00b0C in October, -2\u00b0C in January, and often wet. Thermals, a waterproof shell, and warm socks beat one heavy puffer every time. Buy the puffer at C&A or Uniqlo the first weekend you land \u2014 German winter kit costs a third of what it does in India.",
  },
  {
    n: "07",
    title: "Carry eight weeks of critical medication with a generic-name prescription",
    bucket: "Before you fly",
    body: "Indian prescriptions are not portable to German Apotheken. Getting a Hausarzt appointment in October is slow because every other international student is also looking. Bring eight weeks of anything you actually need and a typed prescription document with the generic (INN) name printed, not the Indian brand.",
  },
  {
    n: "08",
    title: "Install DB Navigator, Google Maps offline tiles, and the Deutschland-Ticket app",
    bucket: "The flight",
    body: "DB Navigator is the Deutsche Bahn app for ICE/IC/Regio trains \u2014 the backbone of getting around Germany. The Deutschland-Ticket (\u20ac58/month) covers all regional public transport. Download offline Munich / Berlin / Aachen map tiles in Google Maps before you board \u2014 Lufthansa Wi-Fi is patchy.",
  },
  {
    n: "09",
    title: "Buy an O2, Vodafone, or Congstar SIM at the airport or Mediamarkt",
    bucket: "The flight",
    body: "Munich Airport (MUC), Berlin Brandenburg (BER), and Frankfurt (FRA) all have O2 or Vodafone kiosks in arrivals selling pre-paid SIMs for \u20ac15\u201325 with 30GB data. Bring your passport \u2014 German SIM registration is strict. Swap the SIM before you leave the terminal \u2014 everything downstream (Anmeldung portal, banking OTP, Deutsche Bahn) needs a working German number.",
  },
  {
    n: "10",
    title: "Schedule your Anmeldung at the B\u00fcrgeramt / KVR within 14 days",
    bucket: "Week one",
    body: "Every resident in Germany has two weeks from arrival to register their address at the local B\u00fcrgeramt (Munich: KVR at Ruppertstra\u00dfe). Slots vanish within minutes of being posted at 6:00 Berlin time. Refresh the portal the morning you land. Your landlord must sign a Wohnungsgeberbest\u00e4tigung \u2014 do not leave the flat without it.",
  },
  {
    n: "11",
    title: "Open an N26 or DKB student account in week one",
    bucket: "Week one",
    body: "Your blocked account unlocks \u20ac992/month but you need a normal German account for rent, Rundfunkbeitrag, Strom, and part-time wages. N26 opens in 10 minutes with your passport once Anmeldung is done. DKB gives free ATM withdrawals worldwide if you want the paper-statement bank. Deutsche Bank works but charges for everything.",
  },
  {
    n: "12",
    title: "Register with the Indian Embassy / Consulate",
    bucket: "Week one",
    body: "Free, five minutes, done online. Berlin has the embassy; Munich and Frankfurt have consulates. In an emergency \u2014 lost passport, medical evacuation, family crisis at home \u2014 the consulate finds you faster if you are on the student register. Do it the weekend you arrive.",
  },
];

const BUCKETS: Array<CheckItem["bucket"]> = [
  "Before you fly",
  "The flight",
  "Week one",
];

export default function ChecklistGermanyPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="flex-1">
        {/* Hero */}
        <section className="pt-24 pb-12 md:pt-32 md:pb-16">
          <div className="container-narrow">
            <div className="mx-auto max-w-[820px]">
              <SectionLabel>Germany arrival &middot; October 2026</SectionLabel>
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
                  before Wintersemester.
                </span>
              </h1>
              <p className="mt-6 max-w-[600px] text-[17px] leading-[1.55] text-[color:var(--color-fg-muted)] sm:text-[18px]">
                A field guide for the Indian student flying to Germany for the
                first time. No fluff, no affiliate links, no &ldquo;top 10
                best backpacks&rdquo; - just the tactical stuff that decides
                whether your first month is smooth or a scramble.
              </p>
              <p className="mt-6 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
                <Plane
                  className="h-3.5 w-3.5 text-[color:var(--color-primary)]"
                  strokeWidth={2}
                />
                Last reviewed &middot; April 2026 &middot; Germany-bound intake
              </p>
              <div className="mt-5 inline-flex items-center gap-3 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-2 text-[12px] text-[color:var(--color-fg-muted)] sm:text-[13px]">
                <span
                  aria-hidden="true"
                  className="flex h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)]"
                />
                <span>
                  Ireland-bound for September 2026?{" "}
                  <Link
                    href="/checklist"
                    className="text-[color:var(--color-fg)] underline underline-offset-2 transition-colors hover:text-[color:var(--color-primary)]"
                  >
                    Read the Ireland checklist instead.
                  </Link>
                </span>
              </div>
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
                Saved &middot; checklist complete
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
                A verified group of classmates from your home city,
                already waiting at Munich Airport, Berlin Brandenburg,
                or Aachen Hauptbahnhof. We are building that on the
                NexGen app. Save your seat, and we ping you the moment
                it opens.
              </p>
              <div className="mx-auto mt-8 max-w-[420px]">
                <EmailWaitlistForm referrer="checklist-germany" />
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
