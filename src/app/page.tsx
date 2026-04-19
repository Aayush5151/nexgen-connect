import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProgressRail } from "@/components/layout/ProgressRail";
import { CohortCard } from "@/components/landing/CohortCard";
import { ActivityTicker } from "@/components/landing/ActivityTicker";
import { SwipeDeck } from "@/components/landing/SwipeDeck";
import { SplitCompare } from "@/components/landing/SplitCompare";
import { ManifestoSection } from "@/components/landing/ManifestoSection";
import { IrelandMap } from "@/components/landing/IrelandMap";
import { VerificationTimeline } from "@/components/landing/VerificationTimeline";
import { FinalCTA } from "@/components/landing/FinalCTA";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <ProgressRail />
      <main id="main" className="flex-1">
        <section
          id="reserve"
          className="relative scroll-mt-24 pt-24 pb-20 md:pt-32 md:pb-28"
        >
          <div className="container-narrow grid gap-12 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-5">
              <p className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-primary)]">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)]" />
                Ireland · September 2026
              </p>
              <h1 className="mt-8 font-serif text-[56px] font-normal leading-[0.98] tracking-[-0.015em] text-[color:var(--color-fg)] sm:text-[64px] md:text-[60px] lg:text-[84px] xl:text-[96px]">
                You are not
                <br />
                <em className="italic text-[color:var(--color-primary-hover)]">flying alone.</em>
              </h1>
              <p className="mt-8 max-w-[480px] text-[19px] leading-[1.55] text-[color:var(--color-fg-muted)]">
                100 Indian students. One September flight to Ireland.
                We verify each one, then put you in the same group. Months
                before you land in Dublin.
              </p>
              <p className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                <span>UCD</span>
                <span className="h-[3px] w-[3px] rounded-full bg-[color:var(--color-fg-subtle)]" />
                <span>Trinity</span>
                <span className="h-[3px] w-[3px] rounded-full bg-[color:var(--color-fg-subtle)]" />
                <span>UCC</span>
                <span className="h-[3px] w-[3px] rounded-full bg-[color:var(--color-fg-subtle)]" />
                <span>DigiLocker verified</span>
              </p>
            </div>
            <div className="md:col-span-7 md:self-center">
              <CohortCard />
            </div>
          </div>
        </section>

        <ActivityTicker />
        <div id="matching" className="scroll-mt-24">
          <SwipeDeck />
        </div>
        <SplitCompare />
        <ManifestoSection />
        <div id="ireland" className="scroll-mt-24">
          <IrelandMap />
        </div>
        <div id="verify" className="scroll-mt-24">
          <VerificationTimeline />
        </div>
        <div id="close" className="scroll-mt-24">
          <FinalCTA />
        </div>
      </main>
      <Footer />
    </>
  );
}
