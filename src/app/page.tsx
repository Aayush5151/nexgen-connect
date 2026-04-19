import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CohortCard } from "@/components/landing/CohortCard";
import { ActivityTicker } from "@/components/landing/ActivityTicker";
import { SwipeDeck } from "@/components/landing/SwipeDeck";
import { ScrollyStory } from "@/components/landing/ScrollyStory";
import { ManifestoSection } from "@/components/landing/ManifestoSection";
import { IrelandMap } from "@/components/landing/IrelandMap";
import { VerificationTimeline } from "@/components/landing/VerificationTimeline";
import { FinalCTA } from "@/components/landing/FinalCTA";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main" className="flex-1">
        {/* 4.1. Hero. Interactive cohort builder. */}
        <section
          id="reserve"
          className="relative scroll-mt-24 pt-24 pb-20 md:pt-32 md:pb-28"
        >
          <div className="container-narrow grid gap-12 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-5">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                PHASE 01 · IRELAND · SEPT 2026
              </p>
              <h1 className="mt-8 font-heading text-[44px] font-semibold leading-[1.02] tracking-[-0.025em] text-[color:var(--color-fg)] sm:text-[48px] md:text-[44px] lg:text-[64px] xl:text-[72px]">
                Your people.
                <br />
                Before your flight.
              </h1>
              <p className="mt-6 max-w-[460px] text-[18px] leading-[1.55] text-[color:var(--color-fg-muted)]">
                For every student moving abroad. Ireland first. Every corridor next.
              </p>
              <p className="mt-8 max-w-[460px] font-mono text-[12px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                Aadhaar verified · DigiLocker · 3 universities · 100 spots
              </p>
            </div>
            <div className="md:col-span-7 md:self-center">
              <CohortCard />
            </div>
          </div>
        </section>

        {/* 4.2. Live activity ticker. Auto-hidden below 3 signups. */}
        <ActivityTicker />

        {/* 4.3. Swipeable match demo. */}
        <SwipeDeck />

        {/* 4.4. 4-frame scrollytelling. */}
        <ScrollyStory />

        {/* 4.5. Manifesto. */}
        <ManifestoSection />

        {/* 4.6. Interactive Ireland map. */}
        <IrelandMap />

        {/* 4.7. Verification flow visualized. */}
        <VerificationTimeline />

        {/* 4.8. Final CTA with live counter. */}
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
