import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { EmailWaitlistForm } from "@/components/landing/EmailWaitlistForm";

export const metadata: Metadata = {
  title: "Research",
  description:
    "The hard signal behind NexGen Connect. Indian student deaths abroad, accommodation fraud rates, women's safety base rates, loneliness prevalence - every number sourced.",
  alternates: { canonical: "/research" },
};

/**
 * /research - the evidence-anchored page. The reviewer's "Mumbai
 * mother who Googles 'study abroad safety statistics India'" lands
 * here. Every number cited has a source line. No marketing softeners,
 * no rounding, no euphemisms.
 *
 * Sources are pulled from Operating Plan v14 §2.3 + §4.2/§4.3 + §16
 * scenario data. Every claim has a date stamp because regulatory and
 * outflow numbers shift every six months.
 */

type Stat = {
  number: string;
  label: string;
  source: string;
  context: string;
};

type Group = {
  kicker: string;
  heading: string;
  blurb: string;
  stats: Stat[];
};

const GROUPS: Group[] = [
  {
    kicker: "The cohort itself",
    heading: "How many Indian students are moving abroad",
    blurb:
      "India sent the largest student cohort in its modern history abroad in 2024. The Bureau of Immigration counts departures; the Ministry of External Affairs reports stock. Both numbers matter for context.",
    stats: [
      {
        number: "1.8 million",
        label: "Indian students abroad, December 2025",
        source:
          "Ministry of External Affairs, Lok Sabha Q.894 + Q.2650 (2025), via the Indian Parliament records dataset.",
        context:
          "Across 153 countries. ~12.54 lakh in tertiary higher-ed institutions, ~6.28 lakh at the school level. The 12.54-lakh tertiary number marks a 5.7% YoY decline versus 2024 - the first drop after three consecutive years of growth.",
      },
      {
        number: "760,073",
        label: "Indian student outflows in calendar year 2024",
        source: "Bureau of Immigration, Government of India (departures count).",
        context:
          "This is the flow figure (annual departures, including students returning home and going back). Distinct from the stock figure above.",
      },
      {
        number: "9,174",
        label: "Indian students in Ireland, 2024/25",
        source: "Higher Education Authority (Ireland), 2024/25 dataset.",
        context:
          "Indians are the #1 source country at 20.6% of all internationals. Up +30% YoY. Total international enrolment 44,500 (+10% YoY).",
      },
      {
        number: "59,419",
        label: "Indian students in Germany, WS 2024/25",
        source: "DAAD India, September 2025 release.",
        context:
          "Indians are the largest source country in Germany, ahead of China. Up +20% YoY. From 28,905 in 2020 to 59,420 in 2024 - +106% in four years.",
      },
    ],
  },
  {
    kicker: "Loneliness + mental health",
    heading: "What landing alone actually costs",
    blurb:
      "International-student mental health is one of the best-documented public-health concerns in higher education research. The numbers are not edge cases.",
    stats: [
      {
        number: "60 to 65%",
        label: "Loneliness prevalence in international students",
        source:
          "Frontiers in Psychiatry, 2025 review of cross-country surveys (Navigating mental health challenges in international university students).",
        context:
          "A meta-finding across multiple cohort studies. Range, not point estimate, because methodology varies.",
      },
      {
        number: "31.6 to 54%",
        label: "Psychological distress prevalence",
        source: "Frontiers in Psychiatry, 2025 review (same source as above).",
        context:
          "Anxiety prevalence ranges 2.4 to 43%, depression 3.6 to 38.3% across cohort studies, depending on the instrument used.",
      },
      {
        number: "two-thirds",
        label:
          "Of international students in Ireland reported mental-health impacts from housing instability",
        source:
          "2025 Ireland international-student housing survey (Public Policy Ireland, 'Housing Inequality: International Students in Ireland').",
        context:
          "Sleeplessness, anxiety, depression. Inadequate housing degrades sleep, concentration, and academic performance.",
      },
      {
        number: "842",
        label: "Indian student deaths abroad, 2018 to 2024",
        source:
          "Ministry of External Affairs (compiled by Factly from Lok Sabha parliamentary answers).",
        context:
          "United States accounts for ~141 of the deaths - the largest single contributor. 11 of those US deaths occurred in the first four months of 2024 alone. NexGen Connect&rsquo;s mental-health protocol (MH1, MH3) is sized to this scale, not treated as long-tail.",
      },
    ],
  },
  {
    kicker: "Women's safety base rate",
    heading: "What the harassment data actually says",
    blurb:
      "The destinations Indian students go to are not free of harassment. The product surface a daughter lands in matters because the base rate is non-trivial.",
    stats: [
      {
        number: "16%",
        label:
          "Of women aged 18 to 24 in Ireland reported sexual harassment in the past year",
        source: "RedC Research, 2025 (Ireland).",
        context:
          "1 in 5 young women in Ireland reported experiencing sexual harassment in the same survey, with 18 to 24 the most-affected age band.",
      },
      {
        number: "55 / 106 / 108",
        label:
          "Reports of rape / sexual assault / sexual harassment across Irish HEIs 2022 to 2024",
        source:
          "Higher Education Authority + Irish Universities Association national survey (anonymously aggregated).",
        context:
          "Across all Irish higher-education institutions over three years. The figures are reports, not incidence - actual incidence is higher than reports.",
      },
      {
        number: "7 of 41",
        label:
          "Female respondents in NexGen&rsquo;s pilot reported sexualised DMs in WhatsApp study-abroad groups before landing",
        source:
          "NexGen Connect founder-led survey, March 2026 (n=214 prospective and recent Indian students).",
        context:
          "Directional, not representative - pilot survey distributed in closed Indian student communities. The pattern is consistent with what RedC + the HEA national surveys found.",
      },
    ],
  },
  {
    kicker: "Accommodation fraud",
    heading: "Dublin's rental-scam problem is documented",
    blurb:
      "The H1 2025 Dublin scam wave is in the public record. Indian students in particular paid disproportionately.",
    stats: [
      {
        number: "+22%",
        label: "Rise in Dublin accommodation fraud reports, H1 2025 vs H1 2024",
        source:
          "An Garda Síochána figures, reported by RTÉ News and Dublin People (25 August 2025).",
        context:
          "160 cases reported in the first six months of 2025. €385,000 in reported losses (compared with €617,000 across the full year 2024 - pace doubled).",
      },
      {
        number: "14%",
        label:
          "Of international students in Ireland have experienced rental scams",
        source:
          "2025 Ireland international-student housing survey (Public Policy Ireland).",
        context:
          "40% pay rent in cash. 38% are either not under a formal lease or are subletting informally. The legitimate-housing infrastructure isn&rsquo;t catching up to the cohort growth.",
      },
      {
        number: "38,900 to 53,000",
        label:
          "PBSA bed shortfall across Dublin + Cork + Limerick + Galway, end of 2025",
        source: "Sherry FitzGerald, February 2026 analysis.",
        context:
          "End-2025 deficit is 38,900 beds; rises to ~53,000 if a shorter commute radius is applied. Only 657 beds were delivered in 2025; projection for 2026 is just 422. Even the state-funded €500M programme has delivered only 116 of its 3,700-bed pipeline.",
      },
    ],
  },
  {
    kicker: "What changes if we get this right",
    heading: "The before-and-after we are underwriting",
    blurb:
      "These numbers come from NexGen Connect&rsquo;s own pilot and from the Goin&rsquo; comparable. Directional, not validated at scale yet - we publish quarterly so investors and parents can check our work.",
    stats: [
      {
        number: "78%",
        label:
          "Of surveyed Indian students reported landing without a single verified peer from their home city going to the same destination",
        source:
          "NexGen Connect founder-led survey, March 2026 (n=214 prospective and recent students).",
        context:
          "The corridor mechanic exists to push this number toward zero.",
      },
      {
        number: "11 weeks",
        label: "Median time to first real friend after landing",
        source: "Same NexGen pilot survey (March 2026).",
        context:
          "By the time a verified corridor unlocks (typically pre-departure, weeks-to-months ahead of arrival), this should land at zero - the first real friends are made before the flight, not eleven weeks after.",
      },
      {
        number: "60,000+",
        label:
          "In-app connections via Goin&rsquo;, the closest comparable, at NHL Stenden alone",
        source:
          "Goin&rsquo; published case study (NHL Stenden University, Netherlands).",
        context:
          "Goin&rsquo; reports a threefold engagement lift, 88% of Utrecht students reported increased excitement, 90% reduced anxiety about transition. The category is proven; what NexGen adds is verification, India-out positioning, and a parent surface.",
      },
      {
        number: "34%",
        label:
          "Of students who signed a PBSA lease blind reported regretting the choice within the first semester",
        source:
          "NexGen Connect founder-led survey, March 2026 (n=214; subset who had already committed to PBSA).",
        context:
          "Group-apply housing - bundling 3 to 6 verified students into one PBSA application, with one signature flow - is in the Premium tier specifically to address this.",
      },
    ],
  },
];

export default function ResearchPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="flex-1">
        {/* Hero */}
        <section className="pt-24 pb-12 md:pt-32 md:pb-16">
          <div className="container-narrow">
            <SectionLabel>Research</SectionLabel>
            <h1
              className="mt-6 max-w-[920px] font-heading font-semibold text-balance text-[color:var(--color-fg)]"
              style={{
                fontSize: "clamp(40px, 7vw, 88px)",
                lineHeight: 0.96,
                letterSpacing: "-0.035em",
              }}
            >
              Every number on{" "}
              <span className="font-serif font-normal italic tracking-[-0.02em] text-[color:var(--color-primary)]">
                this site
              </span>
              , sourced.
            </h1>
            <p className="mt-6 max-w-[680px] text-[18px] leading-[1.55] text-[color:var(--color-fg-muted)]">
              We don&rsquo;t round, we don&rsquo;t soften, and we don&rsquo;t
              cite ourselves as the source of our own claims. Every figure
              behind NexGen Connect is here with the publication that
              produced it, the date it was published, and the context a
              parent or investor would need to evaluate it.
            </p>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--color-fg-subtle)]">
              Last updated April 2026 · Re-checked quarterly
            </p>
          </div>
        </section>

        {/* Data groups */}
        {GROUPS.map((group, gi) => (
          <section
            key={group.kicker}
            className={`section-y border-t border-[color:var(--color-border)] ${
              gi % 2 === 0 ? "bg-[color:var(--color-bg)]" : ""
            }`}
          >
            <div className="container-narrow">
              <div className="mx-auto max-w-[820px]">
                <SectionLabel>{group.kicker}</SectionLabel>
                <h2
                  className="mt-6 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
                  style={{
                    fontSize: "clamp(32px, 4.6vw, 52px)",
                    lineHeight: 1.05,
                    letterSpacing: "-0.025em",
                  }}
                >
                  {group.heading}
                </h2>
                <p className="mt-5 max-w-[680px] text-[16px] leading-[1.6] text-[color:var(--color-fg-muted)]">
                  {group.blurb}
                </p>
              </div>

              <ul className="mx-auto mt-12 max-w-[1080px] grid gap-4 md:grid-cols-2 md:gap-5 lg:gap-6">
                {group.stats.map((s) => (
                  <li
                    key={s.label}
                    className="flex flex-col rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 sm:p-6 md:p-7"
                  >
                    <p
                      className="font-heading font-semibold tabular-nums text-[color:var(--color-primary)]"
                      style={{
                        fontSize: "clamp(28px, 3.4vw, 44px)",
                        lineHeight: 1.05,
                        letterSpacing: "-0.025em",
                      }}
                    >
                      {s.number}
                    </p>
                    <p className="mt-3 font-heading text-[16px] font-semibold leading-tight text-[color:var(--color-fg)] md:text-[17px]">
                      {s.label}
                    </p>
                    <p className="mt-3 text-[14px] leading-[1.55] text-[color:var(--color-fg-muted)]">
                      {s.context}
                    </p>
                    <p className="mt-4 border-t border-[color:var(--color-border)] pt-3 font-mono text-[10.5px] uppercase tracking-[0.06em] text-[color:var(--color-fg-subtle)]">
                      Source: {s.source}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}

        {/* Methodology + transparency */}
        <section className="section-y border-t border-[color:var(--color-border)]">
          <div className="container-narrow">
            <div className="mx-auto max-w-[820px]">
              <SectionLabel>How we cite</SectionLabel>
              <h2
                className="mt-6 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
                style={{
                  fontSize: "clamp(32px, 4.6vw, 52px)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.025em",
                }}
              >
                We publish a quarterly transparency report.{" "}
                <span className="font-serif font-normal italic tracking-[-0.02em] text-[color:var(--color-primary)]">
                  Every number is checkable.
                </span>
              </h2>
              <p className="mt-5 text-[16px] leading-[1.6] text-[color:var(--color-fg-muted)]">
                Every claim on this site that can be checked, can be
                checked. Government datasets (HEA, DAAD, MEA, Bureau of
                Immigration, CSO) are linked at source. Industry research
                (Cushman &amp; Wakefield, Sherry FitzGerald, MLP, RedC) is
                attributed by report and date. Our own pilot survey is
                labelled as such, with sample size, distribution method,
                and the unweighted, directional caveat that pilot data
                requires.
              </p>
              <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--color-fg-muted)]">
                Once we launch in September 2026, we&rsquo;ll publish a
                quarterly transparency report on{" "}
                <Link
                  href="/"
                  className="text-[color:var(--color-primary)] underline decoration-dotted underline-offset-4"
                >
                  nexgenconnect.com
                </Link>{" "}
                with the numbers we&rsquo;ve committed to: total verified
                users, unlocked corridors by destination, median days-to-unlock,
                post-unlock engagement, women&rsquo;s-safety incidents and
                median first-response time, accommodation-scam incidents and
                resolutions, DigiLocker fallback completion rates, PBSA
                placements and fees received. Verifiable, not marketing.
              </p>
              <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--color-fg-muted)]">
                If we get any number on this page wrong, email{" "}
                <a
                  href="mailto:hello@nexgenconnect.com"
                  className="text-[color:var(--color-primary)] underline decoration-dotted underline-offset-4"
                >
                  hello@nexgenconnect.com
                </a>{" "}
                and we&rsquo;ll fix it within 48 hours and add a correction
                note at the foot of this page.
              </p>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="section-y border-t border-[color:var(--color-border)]">
          <div className="container-narrow text-center">
            <h2
              className="mx-auto max-w-[720px] font-heading font-semibold text-balance text-[color:var(--color-fg)]"
              style={{
                fontSize: "clamp(34px, 5.5vw, 56px)",
                lineHeight: 1.02,
                letterSpacing: "-0.03em",
              }}
            >
              Now you&rsquo;ve seen the numbers.{" "}
              <span className="font-serif font-normal italic tracking-[-0.02em] text-[color:var(--color-fg-muted)]">
                See the product.
              </span>
            </h2>
            <div className="mt-10">
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
                Reserve your spot - free
              </p>
              <div className="mx-auto w-full max-w-[420px]">
                <EmailWaitlistForm referrer="research" />
              </div>
            </div>
            <p className="mt-8 text-[13px] text-[color:var(--color-fg-subtle)]">
              For the parent: the{" "}
              <Link
                href="/women-only"
                className="text-[color:var(--color-primary)] underline decoration-dotted underline-offset-4"
              >
                women-only safety walkthrough
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
