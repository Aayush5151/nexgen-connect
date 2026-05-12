import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

/**
 * /for-parents — the parent-purchase landing surface.
 *
 * Indian student migration is parent-funded in 70-80% of cases.
 * Parents are a distinct buyer with a distinct purchase journey:
 * longer, more anxious, requires more evidence, weighted toward
 * safety over social. The /#parents anchor on the home page is
 * one section of nine — that's not enough surface area.
 *
 * This page exists for parents specifically. Hero is loss-aversion
 * framed (the parent's actual anxiety: their child landing alone in
 * a city they've never seen). Trust signals are parent-tier
 * (verification stack, T&S response times, what the Parent View
 * actually shows + what it doesn't). Pricing reframed as a
 * peace-of-mind purchase against named alternatives (migration
 * agents, housing brokers).
 *
 * v18 category-presence pass — final completeness batch.
 */

export const metadata: Metadata = {
  title: "For parents",
  description:
    "Your child is landing in a city you've never seen. NexGen Connect is the verified arrival corridor that makes the first 30 days safe. For parents funding their child's migration.",
  alternates: { canonical: "/for-parents" },
  openGraph: {
    title: "For parents · NexGen Connect",
    description:
      "Your child is landing in a city you've never seen. NexGen Connect is the verified arrival corridor.",
    url: "/for-parents",
    type: "website",
  },
};

const PARENT_ANXIETIES = [
  {
    n: "01",
    title: "The airport scam",
    body:
      "Self-styled migration helpers, fake SIM-card sellers, fake landlord-deposits. Indian students lose ~₹15,000 on average in the first 72 hours, according to the Embassy of Ireland's 2024 advisory. Our three-check verification gate makes sure none of those people exist inside a corridor.",
  },
  {
    n: "02",
    title: "The empty WhatsApp group",
    body:
      "Most students join a WhatsApp group of 400+ strangers months before they fly. There is no way to tell who's a real classmate, who's a recruiter, and who's a scammer. We tell you: nobody is in the corridor until they pass Phone OTP, DigiLocker Aadhaar, and human admit-letter review.",
  },
  {
    n: "03",
    title: "The first 30 days alone",
    body:
      "The hardest emotional window in the entire migration. Bureaucracy in a foreign language, no nearby family, jet lag, and an empty room. Your child's corridor — sixty verified classmates from your home city — is what they walk into instead.",
  },
  {
    n: "04",
    title: "Knowing they landed safe",
    body:
      "Premium parents get a one-line confirmation when your child arrives. Not a tracking app. Not their messages. Just: \"Aanya checked in at Dublin Airport at 14:32 IST. They're home.\" Then the dashboard goes quiet.",
  },
] as const;

const WHAT_PARENT_VIEW_SHOWS = [
  "Whether your child has verified through all three checks",
  "Their corridor's verification count (e.g. \"47 of 60 verified\")",
  "Their arrival check-in confirmation when they land",
  "T&S incidents involving their corridor (with their consent)",
  "Their group-apply housing status",
];

const WHAT_PARENT_VIEW_NEVER_SHOWS = [
  "Their messages, chats, or DMs",
  "Their location after arrival",
  "Their friends, social activity, or who they spend time with",
  "Their grades, attendance, or academic records",
  "Their photos or media of any kind",
];

export default function ForParentsPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="flex-1 pb-32">
        {/* Hero — loss-aversion frame. The parent's specific anxiety
            named directly. */}
        <section className="pt-20 sm:pt-28 md:pt-32">
          <div className="container-narrow">
            <div className="mx-auto max-w-[820px]">
              <p className="label-eyebrow text-[color:var(--color-fg-subtle)]">
                For parents
              </p>
              <h1
                className="mt-6 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
                style={{
                  fontSize: "clamp(32px, 5.4vw + 0.5rem, 60px)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.028em",
                }}
              >
                Your child is landing in a city{" "}
                <span className="font-serif font-normal italic tracking-[-0.02em] text-[color:var(--color-primary)]">
                  you have never seen.
                </span>
              </h1>
              <p className="mt-7 body-lg text-[color:var(--color-fg-muted)]">
                NexGen Connect is the verified arrival corridor — sixty
                classmates from your home city, going to the same
                destination, in the same intake month. Three independent
                checks confirm every member is real. Group chat opens
                only when sixty have verified. By the time your child
                flies, they walk into people who already know their name.
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-[color:var(--color-primary)] px-6 text-[14px] font-semibold text-[color:var(--color-primary-fg)] transition-[background-color] hover:bg-[color:var(--color-primary-hover)]"
                >
                  Get your child verified
                </Link>
                <Link
                  href="/promises"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-[color:var(--color-border)] px-6 text-[14px] font-medium text-[color:var(--color-fg)] transition-colors hover:border-[color:var(--color-border-strong)]"
                >
                  Read our five promises
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* The four anxieties — addresses parent worries by name */}
        <section className="mt-20 sm:mt-28">
          <div className="container-narrow">
            <div className="mx-auto max-w-[820px]">
              <p className="label-eyebrow text-[color:var(--color-fg-subtle)]">
                What you are worried about
              </p>
              <p className="mt-3 body-md text-[color:var(--color-fg-muted)]">
                Four things every parent of an outbound Indian student
                worries about. What we do about each.
              </p>

              <ol className="mt-12 flex flex-col divide-y divide-[color:var(--color-border)]">
                {PARENT_ANXIETIES.map((a) => (
                  <li key={a.n} className="py-10 first:pt-0 sm:py-12">
                    <div className="grid gap-5 sm:grid-cols-[80px_1fr] sm:gap-10">
                      <p
                        className="font-mono text-[14px] font-semibold tracking-[0.08em] text-[color:var(--color-primary)] sm:text-[15px]"
                        aria-hidden="true"
                      >
                        No.&nbsp;{a.n}
                      </p>
                      <div>
                        <h2 className="title-xl text-[color:var(--color-fg)]">
                          {a.title}
                        </h2>
                        <p className="mt-4 body-lg text-[color:var(--color-fg-muted)]">
                          {a.body}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Parent View transparency block — what the dashboard shows
            AND what it doesn't show. The trust move is naming the
            limits explicitly. Parents respect this more than a
            feature list. */}
        <section className="mt-20 sm:mt-28">
          <div className="container-narrow">
            <div className="mx-auto max-w-[820px]">
              <p className="label-eyebrow text-[color:var(--color-fg-subtle)]">
                Parent View · transparency
              </p>
              <h2
                className="mt-6 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
                style={{
                  fontSize: "clamp(26px, 3.6vw + 0.5rem, 42px)",
                  lineHeight: 1.1,
                  letterSpacing: "-0.022em",
                }}
              >
                You see what matters,{" "}
                <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-fg-muted)]">
                  not what doesn&apos;t.
                </span>
              </h2>
              <p className="mt-6 body-lg text-[color:var(--color-fg-muted)]">
                The Parent View dashboard is intentionally narrow. We
                designed the limits in writing because the trust
                contract with your child matters more than the feature
                count.
              </p>

              <div className="mt-12 grid gap-6 md:grid-cols-2 md:gap-8">
                <div className="card p-6">
                  <p className="label-eyebrow text-[color:var(--color-primary)]">
                    What you see
                  </p>
                  <ul className="mt-5 space-y-3">
                    {WHAT_PARENT_VIEW_SHOWS.map((line) => (
                      <li key={line} className="flex items-start gap-3 body-md text-[color:var(--color-fg)]">
                        <span
                          aria-hidden="true"
                          className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--color-primary)]"
                        />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="card p-6">
                  <p className="label-eyebrow text-[color:var(--color-fg-subtle)]">
                    What you never see
                  </p>
                  <ul className="mt-5 space-y-3">
                    {WHAT_PARENT_VIEW_NEVER_SHOWS.map((line) => (
                      <li key={line} className="flex items-start gap-3 body-md text-[color:var(--color-fg-muted)]">
                        <span
                          aria-hidden="true"
                          className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--color-fg-subtle)]"
                        />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <p className="mt-8 font-serif italic text-[16px] leading-[1.55] tracking-[-0.005em] text-[color:var(--color-fg-muted)] sm:text-[17px]">
                We refuse to ship surveillance disguised as care.
                Parental oversight that breaks a child&apos;s trust is
                not oversight — it is the start of a different problem.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing reframe for parents — peace of mind, anchored
            against migration agent / housing broker / parent SaaS. */}
        <section className="mt-20 sm:mt-28">
          <div className="container-narrow">
            <div className="mx-auto max-w-[820px]">
              <p className="label-eyebrow text-[color:var(--color-fg-subtle)]">
                What it costs
              </p>
              <h2
                className="mt-6 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
                style={{
                  fontSize: "clamp(26px, 3.6vw + 0.5rem, 42px)",
                  lineHeight: 1.1,
                  letterSpacing: "-0.022em",
                }}
              >
                ₹999.{" "}
                <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-fg-muted)]">
                  Once. Forever.
                </span>
              </h2>
              <p className="mt-6 body-lg text-[color:var(--color-fg-muted)]">
                One purchase, no renewal, no subscription. Free tier
                covers the corridor, the verification, the group chat.
                Premium adds Parent View, group-apply housing, arrival
                check-in, and a one-hour Trust &amp; Safety response.
              </p>

              <div className="mt-10 card p-6 sm:p-8">
                <p className="label-eyebrow text-[color:var(--color-fg-subtle)]">
                  What you would otherwise pay
                </p>
                <ul className="mt-5 space-y-3 text-[14px] leading-[1.55] sm:text-[15px]">
                  <li className="flex items-baseline justify-between gap-3">
                    <span className="text-[color:var(--color-fg)]">
                      Migration agent — paperwork, visa prep
                    </span>
                    <span className="shrink-0 font-mono tabular-nums text-[color:var(--color-fg-subtle)] line-through">
                      ₹20–50k
                    </span>
                  </li>
                  <li className="flex items-baseline justify-between gap-3">
                    <span className="text-[color:var(--color-fg)]">
                      Housing broker, Ireland or Germany
                    </span>
                    <span className="shrink-0 font-mono tabular-nums text-[color:var(--color-fg-subtle)] line-through">
                      €800–1,500
                    </span>
                  </li>
                  <li className="flex items-baseline justify-between gap-3">
                    <span className="text-[color:var(--color-fg)]">
                      Parent oversight dashboard SaaS
                    </span>
                    <span className="shrink-0 font-mono tabular-nums text-[color:var(--color-fg-subtle)] line-through">
                      ₹3k / year
                    </span>
                  </li>
                </ul>
                <div className="mt-5 flex items-baseline justify-between gap-3 border-t border-[color:var(--color-border)] pt-4">
                  <span className="text-[15px] font-semibold text-[color:var(--color-fg)] sm:text-[16px]">
                    NexGen Premium
                  </span>
                  <span className="font-mono text-[14px] font-semibold tabular-nums text-[color:var(--color-primary)] sm:text-[15px]">
                    ₹999 · once
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Founder anchor — who you are trusting */}
        <section className="mt-20 sm:mt-28">
          <div className="container-narrow">
            <div className="mx-auto max-w-[820px] border-t border-[color:var(--color-border)] pt-12">
              <p className="label-eyebrow text-[color:var(--color-fg-subtle)]">
                Who you are trusting
              </p>
              <p className="mt-6 font-serif italic text-[18px] leading-[1.55] tracking-[-0.005em] text-[color:var(--color-fg)] sm:text-[20px]">
                &ldquo;I built NexGen because three of my friends got
                scammed at the airport on their way to Ireland in 2024.
                I will personally call the first five verified students
                in every corridor. If anything goes wrong with your
                child&apos;s arrival, you can reach me directly.&rdquo;
              </p>
              <div className="mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-2">
                <p className="title-md text-[color:var(--color-fg)]">
                  Aayush Shah
                </p>
                <p className="body-sm text-[color:var(--color-fg-muted)]">
                  Founder · Mumbai
                </p>
                <a
                  href="mailto:hello@nexgenconnect.com"
                  className="font-mono text-[12px] text-[color:var(--color-primary)] underline decoration-dotted underline-offset-4 hover:text-[color:var(--color-primary-hover)]"
                >
                  hello@nexgenconnect.com
                </a>
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-[color:var(--color-primary)] px-6 text-[14px] font-semibold text-[color:var(--color-primary-fg)] transition-[background-color] hover:bg-[color:var(--color-primary-hover)]"
                >
                  Get started
                </Link>
                <Link
                  href="/stories/founding"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-[color:var(--color-border)] px-6 text-[14px] font-medium text-[color:var(--color-fg)] transition-colors hover:border-[color:var(--color-border-strong)]"
                >
                  Read the founder letter
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
