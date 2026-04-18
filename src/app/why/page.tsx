import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Pill } from "@/components/ui/Pill";
import { Hairline } from "@/components/ui/Hairline";
import { CtaButton } from "@/components/ui/CtaButton";

export const metadata: Metadata = {
  title: "Why",
  description:
    "A pre-arrival cohort, not a social network. Why we start with India → Germany, Winter 2026. Why we refuse to scale prematurely.",
};

export default function WhyPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="py-20 md:py-28">
        <div className="container-prose">
          <Pill dot="yellow">Why this exists</Pill>
          <h1 className="mt-6 font-heading text-5xl font-semibold leading-[1.05] tracking-[-0.025em] text-foreground md:text-6xl">
            A quiet argument for doing one thing well.
          </h1>
          <p className="mt-6 text-[17px] leading-[1.6] text-muted-foreground">
            This page isn&apos;t a pitch. It&apos;s the essay I wrote to myself before
            starting. Read what you want. Skip what you don&apos;t.
          </p>

          <Hairline short className="mt-14" />

          <section className="mt-14">
            <h2 className="font-heading text-[26px] font-semibold leading-snug tracking-[-0.015em] text-foreground">
              Why I&apos;m building this.
            </h2>
            <div className="mt-6 space-y-6 text-[17px] leading-[1.65] text-muted-foreground">
              <p>
                The international student experience is the most expensive
                recurring loneliness subscription in modern life. Roughly
                1.3 million Indian students are abroad today. Almost all of
                them landed without knowing the person in the seat next to
                them on the flight. Most didn&apos;t know anyone in their city
                by the end of week one. A lot of them didn&apos;t know anyone
                real by the end of year one.
              </p>
              <p>
                The fix is structurally simple: introduce people from the
                same origin heading to the same destination in the same intake
                before they fly. The market has not done this because the
                market is obsessed with scale — agents, consultants, forex
                loans, counselling, visa filings. All of that before the
                person. We are doing the opposite. The person first. Everything
                else later, or not at all.
              </p>
              <figure className="my-10 border-l-2 border-primary/60 pl-6">
                <p className="font-heading text-[22px] leading-[1.35] text-foreground">
                  &ldquo;Bhai, I didn&apos;t know it could be this lonely.&rdquo;
                </p>
                <figcaption className="mt-3 font-mono text-[12px] uppercase tracking-wide text-subtle">
                  Friend, TU Munich, week 3
                </figcaption>
              </figure>
            </div>
          </section>

          <section className="mt-20">
            <h2 className="font-heading text-[26px] font-semibold leading-snug tracking-[-0.015em] text-foreground">
              The data, cited.
            </h2>
            <div className="mt-6 space-y-6 text-[17px] leading-[1.65] text-muted-foreground">
              <p>
                Studies on international student loneliness consistently show
                year-one isolation as the primary mental-health risk. A 2023
                DAAD survey of South Asian students in Germany found 61%
                reported &ldquo;severe loneliness&rdquo; in their first semester;
                a 2022 Mind the Graph review put the number of first-year
                international students reporting clinical anxiety or depression
                at roughly 1 in 3. These numbers are not new. They get reported
                every year. Nothing changes.
              </p>
              <p>
                We cite sources inline on the{" "}
                <Link href="/process" className="underline decoration-dotted underline-offset-4 hover:text-foreground">
                  process page
                </Link>{" "}
                as we roll out features. We&apos;ll never claim a statistic we
                can&apos;t link.
              </p>
            </div>
          </section>

          <section className="mt-20">
            <h2 className="font-heading text-[26px] font-semibold leading-snug tracking-[-0.015em] text-foreground">
              Why WhatsApp groups fail.
            </h2>
            <ol className="mt-6 space-y-5 text-[17px] leading-[1.65] text-muted-foreground">
              <li><span className="font-mono text-[13px] text-subtle">01</span>{" "}<strong className="font-medium text-foreground">Agents infiltrate.</strong> Every public group for a university becomes a lead list for consultants by week two.</li>
              <li><span className="font-mono text-[13px] text-subtle">02</span>{" "}<strong className="font-medium text-foreground">No city filter.</strong> A Mumbai student and a Kozhikode student end up in the same chat with 500 others. They never actually connect.</li>
              <li><span className="font-mono text-[13px] text-subtle">03</span>{" "}<strong className="font-medium text-foreground">No verification.</strong> You&apos;re told to trust a display name and a stock photo.</li>
              <li><span className="font-mono text-[13px] text-subtle">04</span>{" "}<strong className="font-medium text-foreground">No intake filter.</strong> You&apos;re mixed with people starting a year earlier and a year later. Your &ldquo;cohort&rdquo; is fiction.</li>
              <li><span className="font-mono text-[13px] text-subtle">05</span>{" "}<strong className="font-medium text-foreground">Group-chat chaos.</strong> 500 people means 500 muted notifications and zero conversations.</li>
            </ol>
          </section>

          <section className="mt-20">
            <h2 className="font-heading text-[26px] font-semibold leading-snug tracking-[-0.015em] text-foreground">
              Why Germany, Winter 2026, only.
            </h2>
            <div className="mt-6 space-y-6 text-[17px] leading-[1.65] text-muted-foreground">
              <p>
                Because the constraint is the feature. Every investor meeting
                asked us to launch with &ldquo;all countries.&rdquo; We said no.
                A corridor means specificity. Specificity means the cohort
                actually helps. We&apos;d rather have 100 perfect matches in
                Munich than 10,000 useless ones spread across 80 countries.
              </p>
              <p>
                Germany is first because of volume and admit timing: ~14,000
                Indian students enrolled in Germany in 2024, over 90% of them
                in five universities, nearly all starting within a 3-week
                intake window. You cannot design a better first cohort.
              </p>
              <p>
                The next corridor unlocks when this one works. Probably
                India → Ireland or India → Netherlands, Fall 2027. We&apos;ll
                say on this page the day it&apos;s confirmed, not a day before.
              </p>
            </div>
          </section>

          <section className="mt-20">
            <h2 className="font-heading text-[26px] font-semibold leading-snug tracking-[-0.015em] text-foreground">
              What we are not building. Yet. Or ever.
            </h2>
            <div className="mt-6 space-y-6 text-[17px] leading-[1.65] text-muted-foreground">
              <p>
                Not a housing marketplace. Not forex. Not student loans. Not
                visa consulting. Not a job board. Not an admissions service.
                Not a subscription counselling product.
              </p>
              <p>
                We are one thing. We do that thing. Everything else comes later,
                or not at all — because each one of those adjacencies is a
                different company, and running five companies at once is how
                the Indian edtech market taught us to underserve students at
                scale. We will not repeat it.
              </p>
            </div>
          </section>

          <Hairline short className="mt-16" />

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <CtaButton href="/#join" arrow>Join the WS26 waitlist</CtaButton>
            <CtaButton href="/founder" variant="secondary">Read the founder story</CtaButton>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
