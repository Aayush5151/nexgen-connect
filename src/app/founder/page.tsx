import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CtaButton } from "@/components/ui/CtaButton";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { FounderPhoto } from "@/components/shared/FounderPhoto";

export const metadata: Metadata = {
  title: "Founder",
  description:
    "Aayush Shah, founder. Built because landing abroad with 500 strangers in a WhatsApp group and zero people from your city is not a solution.",
};

const NUMBERS = [
  { value: "12", label: "WhatsApp groups I joined" },
  { value: "487", label: "Strangers in the biggest one" },
  { value: "0", label: "People from my city" },
];

const SWITCH = [
  {
    before: "Immigration agents in your DMs",
    after: "Students only. Zero agents.",
  },
  {
    before: "Forex spam and rent scams",
    after: "DigiLocker-verified classmates",
  },
  {
    before: "No one from your home city",
    after: "Your city, your campus, your flight",
  },
];

export default function FounderPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="flex-1">
        <section className="pt-24 pb-16 md:pt-32 md:pb-20">
          <div className="container-narrow">
            <div className="grid gap-12 md:grid-cols-12 md:items-center md:gap-16">
              <div className="md:col-span-7">
                <SectionLabel>Founder</SectionLabel>
                <h1
                  className="mt-6 max-w-[760px] font-heading font-semibold text-balance text-[color:var(--color-fg)]"
                  style={{
                    fontSize: "clamp(48px, 8vw, 96px)",
                    lineHeight: 0.95,
                    letterSpacing: "-0.035em",
                  }}
                >
                  I landed abroad{" "}
                  <span className="font-serif font-normal italic tracking-[-0.02em] text-[color:var(--color-fg-muted)]">
                    knowing zero people.
                  </span>
                </h1>
                <p className="mt-8 max-w-[520px] text-[19px] leading-[1.55] text-[color:var(--color-fg-muted)]">
                  NexGen exists so you don&apos;t.
                </p>
              </div>

              <div className="md:col-span-5 md:flex md:justify-end">
                <div className="relative">
                  <FounderPhoto
                    src="/images/aayush-founder.jpg"
                    alt="Aayush Shah, founder of NexGen Connect"
                    initials="AS"
                    size={260}
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

        <section className="border-y border-[color:var(--color-border)] bg-[color:var(--color-surface)] py-16 md:py-24">
          <div className="container-narrow">
            <p className="text-center font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
              The week before my flight
            </p>
            <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-6">
              {NUMBERS.map((n) => (
                <div key={n.label} className="text-center">
                  <p className="font-heading text-[72px] font-semibold leading-none tracking-[-0.03em] text-[color:var(--color-primary)] md:text-[104px]">
                    {n.value}
                  </p>
                  <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-fg-muted)]">
                    {n.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-y">
          <div className="container-narrow">
            <div className="max-w-[560px]">
              <SectionLabel>What we swap</SectionLabel>
              <h2
                className="mt-4 font-heading font-semibold text-[color:var(--color-fg)]"
                style={{
                  fontSize: "clamp(40px, 6vw, 72px)",
                  lineHeight: 0.95,
                  letterSpacing: "-0.03em",
                }}
              >
                Three bad things out.
                <br />
                <span className="font-serif font-normal italic tracking-[-0.02em] text-[color:var(--color-fg-muted)]">
                  Three real things in.
                </span>
              </h2>
            </div>

            <ul className="mt-16 divide-y divide-[color:var(--color-border)] border-y border-[color:var(--color-border)]">
              {SWITCH.map((row) => (
                <li
                  key={row.before}
                  className="grid gap-4 py-8 md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-10"
                >
                  <p className="text-[16px] leading-[1.45] text-[color:var(--color-fg-subtle)] line-through decoration-[color:var(--color-fg-subtle)]/50 md:text-[20px]">
                    {row.before}
                  </p>
                  <div className="hidden justify-center md:flex">
                    <ArrowRight
                      className="h-5 w-5 text-[color:var(--color-primary)]"
                      strokeWidth={2}
                    />
                  </div>
                  <p className="font-heading text-[18px] font-semibold leading-[1.3] text-[color:var(--color-fg)] md:text-[22px]">
                    {row.after}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-20 md:py-32">
          <div className="container-narrow">
            <div className="mx-auto max-w-[720px] space-y-10">
              <p
                className="font-serif italic text-[color:var(--color-fg)]"
                style={{
                  fontSize: "clamp(28px, 4vw, 48px)",
                  lineHeight: 1.25,
                  letterSpacing: "-0.015em",
                }}
              >
                &ldquo;We&apos;d rather verify 40 students from your city going
                to your campus than 40,000 people you will never meet.&rdquo;
              </p>
              <p className="text-[17px] leading-[1.7] text-[color:var(--color-fg-muted)]">
                <span className="text-[color:var(--color-fg)]">Where this is going.</span>{" "}
                Ireland, September 2026, three universities &mdash; that&apos;s
                the first inch. If we earn it, the next corridors are the ones
                Indian students already move to in the largest numbers: the UK,
                Canada, Australia, Germany, the US. After that, this isn&apos;t
                just for Indian students anymore &mdash; it&apos;s for anyone,
                anywhere, moving across a border to study. Every student
                landing somewhere new, knowing nine people. That&apos;s the
                company. But only if we earn it here first. One city, one
                campus, one September at a time.
              </p>
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                Aayush Shah · hello@nexgenconnect.com
              </p>
            </div>
          </div>
        </section>

        <section className="section-y border-t border-[color:var(--color-border)]">
          <div className="container-narrow text-center">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-primary)]">
              Phase 01 · Ireland · September 2026
            </p>
            <h2
              className="mx-auto mt-4 max-w-[760px] font-heading font-semibold text-balance text-[color:var(--color-fg)]"
              style={{
                fontSize: "clamp(40px, 6vw, 72px)",
                lineHeight: 0.95,
                letterSpacing: "-0.03em",
              }}
            >
              Land in Ireland.{" "}
              <span className="font-serif font-normal italic tracking-[-0.02em] text-[color:var(--color-fg-muted)]">
                Know 99 people.
              </span>
            </h2>
            <div className="mt-10">
              <CtaButton href="/#reserve" size="xl" arrow>
                Reserve my spot. Free.
              </CtaButton>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
