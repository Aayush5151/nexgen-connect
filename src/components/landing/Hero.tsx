import Link from "next/link";
import { Pill } from "@/components/ui/Pill";
import { CtaButton } from "@/components/ui/CtaButton";
import { CohortWidget } from "@/components/shared/CohortWidget";

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-24 pt-28 md:pb-32 md:pt-36">
      <div className="container-narrow">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start lg:gap-14">
          {/* Left column — copy */}
          <div className="fade-up max-w-[640px]">
            <Pill dot="yellow">Winter 2026 · India → Germany · Waitlist open</Pill>

            <h1 className="mt-7 font-heading text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-foreground text-balance">
              The friend from your city you don&apos;t know yet.
            </h1>

            <p className="mt-7 max-w-[620px] text-lg leading-[1.55] text-muted-foreground md:text-xl">
              Before you land at TU Munich, RWTH Aachen, or TU Berlin, meet
              verified students from Mumbai, Delhi, Pune, Bangalore, and
              Hyderabad heading to the same university, same intake. One
              cohort. One city. One flight you won&apos;t take alone.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <CtaButton href="#join" arrow variant="primary">
                Join the WS26 Waitlist
              </CtaButton>
              <CtaButton href="/process" variant="ghost">
                How verification works
              </CtaButton>
            </div>

            <p className="mt-7 font-mono text-[12px] text-subtle">
              DigiLocker-verified &nbsp;·&nbsp; Built in India &nbsp;·&nbsp; No agents, ever
            </p>
          </div>

          {/* Right column — live cohort widget (desktop only) */}
          <div className="lg:sticky lg:top-24">
            <CohortWidget className="fade-up" />
            <p className="mt-3 px-1 font-mono text-[11px] leading-relaxed text-subtle">
              Live count, no faking. Each cohort opens at 10 and caps at 10.
              <br />
              <Link href="#join" className="underline decoration-dotted hover:text-muted-foreground">
                Be the first from your city →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
