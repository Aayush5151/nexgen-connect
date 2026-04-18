import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Pill } from "@/components/ui/Pill";
import { Hairline } from "@/components/ui/Hairline";
import { FounderPhoto } from "@/components/shared/FounderPhoto";

export const metadata: Metadata = {
  title: "Aayush Shah — Founder",
  description:
    "Why I'm building NexGen Connect from Ahmedabad. One corridor, one intake, one cohort of ten.",
};

export default function FounderPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="section-y">
        <div className="container-narrow">
          <div className="max-w-[720px]">
            <Pill dot="mint">Founder</Pill>
            <h1 className="mt-6 font-heading text-5xl font-semibold leading-[1.05] tracking-[-0.025em] text-foreground md:text-6xl">
              Aayush Shah.
            </h1>
            <p className="mt-4 font-mono text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
              Founder · Ahmedabad, India · solo
            </p>
          </div>

          <div className="mt-14">
            <FounderPhoto
              src="/images/aayush.jpg"
              alt="Aayush Shah — Founder of NexGen Connect, Ahmedabad"
              initials="AS"
              size={280}
              className="mx-0"
              sizes="280px"
            />
          </div>

          <Hairline short className="mt-16" />

          <article className="mt-10 max-w-[680px] space-y-7 text-[17px] leading-[1.65] text-foreground">
            <h2 className="font-heading text-[22px] font-semibold leading-snug tracking-[-0.015em]">
              Why I&apos;m building this.
            </h2>
            <p className="text-muted-foreground">
              In the summer of 2024, three of my closest friends from Ahmedabad
              flew out to Germany. Two to TU Munich, one to RWTH. I was in the
              airport group chat. I watched them land excited. I watched them
              crash — not on week one, but week three. The honeymoon ended and
              the silence started. The WhatsApp groups they had joined for
              months turned out to be 500 strangers, agents, and parents of
              other students. Not one person from Ahmedabad. Not one person on
              their flight. Nobody to have chai with on a Sunday.
            </p>
            <p className="text-muted-foreground">
              I flew to see one of them in November. He was eating Maggi at
              midnight in a studio apartment. He had about four people he
              nominally &ldquo;knew&rdquo; in Munich and none of them were doing okay.
              He was fine on paper. His parents thought he was thriving. He
              told me, &ldquo;Bhai, I didn&apos;t know it could be this lonely.&rdquo;
              That sentence is what this company is.
            </p>

            <h2 className="mt-12 font-heading text-[22px] font-semibold leading-snug tracking-[-0.015em]">
              Why the constraints.
            </h2>
            <p className="text-muted-foreground">
              I could have built this for &ldquo;Indian students abroad.&rdquo; Eighty
              countries. A million users on a slide deck. Every investor I
              talked to wanted that. I said no. I&apos;d rather have 100 perfect
              matches in Munich than 10,000 useless ones spread across the
              world. So: one country. One intake. Five universities. Cohorts
              of ten. We earn the right to expand by making this one work.
            </p>
            <p className="text-muted-foreground">
              Every number on the site is real or not shown. The cohort widget
              on the home page queries our database every thirty seconds. If
              you&apos;re the first student from Mumbai to join, it says &ldquo;be the
              first.&rdquo; Not &ldquo;43 / 100.&rdquo; Real zero is honest. Fake forty-three
              is not. That is the whole philosophy, and it is the whole ethos
              of every line of copy and every design decision.
            </p>

            <h2 className="mt-12 font-heading text-[22px] font-semibold leading-snug tracking-[-0.015em]">
              How I&apos;m building this.
            </h2>
            <p className="text-muted-foreground">
              Solo founder. Next.js, React Native, a tiny Supabase instance,
              a Twilio OTP stub, and a Notion board with real admits from real
              WS26 applicants. I&apos;m closing first 100 verified WS26 users by
              July 2026. First ten cohorts fill by September. First IRL city
              meet in Mumbai in October. First cohort lands in Germany in
              October 2026.
            </p>
            <p className="text-muted-foreground">
              I&apos;m hiring one engineer and one person to run our India-side
              meet-ups, probably both contract for the beta. If that&apos;s you,
              email me.
            </p>

            <h2 className="mt-12 font-heading text-[22px] font-semibold leading-snug tracking-[-0.015em]">
              What I need from you.
            </h2>
            <p className="text-muted-foreground">
              If you&apos;re admitted to TU Munich, RWTH Aachen, TU Berlin, KIT,
              or TU Darmstadt for Winter 2026, join the waitlist. If you know
              one, forward this. If you&apos;re a parent of one, read the{" "}
              <Link href="/process" className="underline decoration-dotted underline-offset-4 hover:text-foreground">
                process page
              </Link>{" "}
              and tell me what worries you. I reply to every email.
            </p>
          </article>

          <Hairline short className="mt-16" />

          <div className="mt-10 max-w-[680px] space-y-3">
            <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
              How to reach me
            </p>
            <div className="flex flex-col gap-2 text-[15px] text-foreground">
              <a href="mailto:aayush@nexgenconnect.com" className="underline decoration-dotted underline-offset-4">
                aayush@nexgenconnect.com
              </a>
              <a
                href="https://linkedin.com/in/aayush-shah"
                className="text-muted-foreground underline decoration-dotted underline-offset-4 hover:text-foreground"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
