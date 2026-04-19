import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { FounderPhoto } from "@/components/shared/FounderPhoto";

export const metadata: Metadata = {
  title: "Founder",
  description:
    "Aayush Shah on why NexGen Connect exists. Moving abroad shouldn't mean landing with five hundred strangers in a WhatsApp group and no one from your city.",
};

export default function FounderPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="flex-1">
        <section className="pt-24 pb-12 md:pt-32 md:pb-16">
          <div className="container-narrow">
            <div className="grid gap-10 md:grid-cols-12 md:gap-16">
              <div className="md:col-span-7">
                <SectionLabel>Founder</SectionLabel>
                <h1 className="mt-6 max-w-[620px] font-heading text-[40px] font-semibold leading-[1.04] tracking-[-0.025em] text-[color:var(--color-fg)] md:text-[56px]">
                  I&apos;m building NexGen because I moved abroad and had to
                  find my people from scratch.
                </h1>
                <p className="mt-6 max-w-[560px] text-[17px] leading-[1.6] text-[color:var(--color-fg-muted)]">
                  Nothing about the first month was hard because of the
                  weather. It was hard because I knew nobody, and the apps that
                  promised to fix that were run by immigration agents selling
                  things I hadn&apos;t asked for.
                </p>
              </div>

              <div className="md:col-span-5 md:flex md:justify-end">
                <div className="relative">
                  <FounderPhoto
                    src="/images/aayush-founder.jpg"
                    alt="Aayush Shah, founder of NexGen Connect"
                    initials="AS"
                    size={280}
                    className="border-[color:var(--color-border)]"
                  />
                  <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                    Aayush Shah · Founder
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-y border-t border-[color:var(--color-border)]">
          <div className="container-prose">
            <div className="space-y-6 text-[17px] leading-[1.7] text-[color:var(--color-fg-muted)]">
              <p>
                I grew up in India. I moved abroad on my own. The week before
                my flight, I joined twelve WhatsApp groups. One had four
                hundred and sixty-three people in it, and the top-pinned
                message was an ad for a currency exchange.
              </p>
              <p>
                I found exactly zero people from my city going to my
                university. Two agents messaged me privately trying to sell
                visa services. Three strangers sent me selfies without being
                asked. When I landed, I walked out of the airport into a place
                I knew by name and no one.
              </p>
              <p className="text-[color:var(--color-fg)]">
                That&apos;s the problem I&apos;m trying to fix. Not with a
                bigger group, but with a smaller, verified one.
              </p>
              <p>
                NexGen Connect is for every student moving abroad. We are
                starting with September 2026, Ireland, three universities:
                UCD, Trinity, and UCC. Not because they are the only places
                worth going. Because we would rather verify forty students
                from your city going to your campus than forty thousand people
                you will never meet.
              </p>
              <p>
                Every profile has a real admit letter, a real government ID,
                and a real human at our end that checked both. Your phone
                number is stored as a hash. Instagram only shows after a
                mutual match. Report anyone in one tap and a human looks at it
                within the hour.
              </p>
              <p>
                We will never take money from immigration agents. We will
                never sell your data. We will never let a recruiter slide
                into your DMs through our product. If any of that ever
                happens, email me personally at{" "}
                <a
                  href="mailto:hello@nexgenconnect.com"
                  className="text-[color:var(--color-fg)] underline underline-offset-2 hover:text-[color:var(--color-primary)]"
                >
                  hello@nexgenconnect.com
                </a>
                . I&apos;ll fix it that day.
              </p>
              <p>
                <span className="text-[color:var(--color-fg)]">Where this is going.</span>{" "}
                Ireland, September 2026, three universities. That is the
                first inch. If we earn it, the next corridors are the ones
                students already move to in the largest numbers: the UK,
                Canada, Australia, Germany, the US. After that, this is for
                anyone, anywhere, moving across a border to study. Every
                student landing somewhere new, knowing nine people. That is
                the company. But only if we earn it here first. One city, one
                campus, one September at a time.
              </p>
              <p>
                If you are moving abroad this September, I want you to land
                knowing nine people. Not four hundred strangers. Nine.
              </p>
            </div>
          </div>
        </section>

        <section className="section-y border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)]">
          <div className="container-narrow text-center">
            <h2 className="mx-auto max-w-[620px] font-heading text-[32px] font-semibold leading-[1.05] tracking-[-0.025em] text-[color:var(--color-fg)] md:text-[44px]">
              Your people. Before your flight.
            </h2>
            <Link
              href="/#reserve"
              className="mt-10 inline-flex h-14 items-center justify-center gap-2 rounded-[10px] bg-[color:var(--color-primary)] px-8 text-[15px] font-medium text-[color:var(--color-primary-fg)] transition-colors hover:bg-[color:var(--color-primary-hover)]"
            >
              Reserve my spot. Free.
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
