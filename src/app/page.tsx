import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
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
              <h1 className="mt-8 font-heading text-[44px] font-semibold leading-[1.02] tracking-[-0.025em] text-[color:var(--color-fg)] sm:text-[48px] md:text-[44px] lg:text-[64px] xl:text-[72px]">
                Land in Ireland.
                <br />
                <span className="text-[color:var(--color-fg-muted)]">
                  Knowing 99 people.
                </span>
              </h1>
              <p className="mt-6 max-w-[480px] text-[18px] leading-[1.55] text-[color:var(--color-fg-muted)]">
                We verify 100 Indian students flying to UCD, Trinity, or UCC
                this September. You meet your group online. Before you land
                in Dublin.
              </p>
              <p className="mt-8 max-w-[460px] font-mono text-[12px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                DigiLocker verified · UCD · Trinity · UCC
              </p>
            </div>
            <div className="md:col-span-7 md:self-center">
              <CohortCard />
            </div>
          </div>
        </section>

        <ActivityTicker />
        <SwipeDeck />
        <SplitCompare />
        <ManifestoSection />
        <IrelandMap />
        <VerificationTimeline />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
