import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CohortCard } from "@/components/landing/CohortCard";
import { ActivityTicker } from "@/components/landing/ActivityTicker";
import { ManifestoSection } from "@/components/landing/ManifestoSection";
import { VerificationTimeline } from "@/components/landing/VerificationTimeline";
import { IrelandMap } from "@/components/landing/IrelandMap";
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
            <div className="md:col-span-7">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                SEPT 2026 · INDIA → IRELAND · WAITLIST OPEN
              </p>
              <h1 className="mt-8 font-heading text-[44px] font-semibold leading-[1.02] tracking-[-0.025em] text-[color:var(--color-fg)] sm:text-[56px] md:text-[72px]">
                Land in Dublin.
                <br />
                Know 9 people.
              </h1>
              <p className="mt-6 max-w-[480px] text-[18px] leading-[1.55] text-[color:var(--color-fg-muted)]">
                Meet verified students from your city going to UCD, Trinity, or
                UCC — before your September 2026 flight.
              </p>
              <p className="mt-6 max-w-[460px] text-[14px] leading-[1.55] text-[color:var(--color-fg-subtle)]">
                One matched profile at a time. No WhatsApp groups. No
                immigration agents.
              </p>
            </div>
            <div className="md:col-span-5 md:self-end">
              <CohortCard />
            </div>
          </div>
        </section>

        <ActivityTicker />
        <ManifestoSection />
        <VerificationTimeline />
        <IrelandMap />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
