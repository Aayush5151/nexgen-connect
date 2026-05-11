import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MarketingHero } from "@/components/landing/MarketingHero";
import { VerificationTicker } from "@/components/landing/VerificationTicker";
import { WaitlistProof } from "@/components/landing/WaitlistProof";
import { ProblemMoments } from "@/components/landing/ProblemMoments";
import { TrustPillars } from "@/components/landing/TrustPillars";
import { CorridorVisualizer } from "@/components/landing/CorridorVisualizer";
import { AppShowcase } from "@/components/landing/AppShowcase";
import { GlobeSection } from "@/components/landing/GlobeSection";
import { SafetyParents } from "@/components/landing/SafetyParents";
import { PricingTiers } from "@/components/landing/PricingTiers";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { SectionReveal } from "@/components/shared/SectionReveal";

/**
 * Home, the marketing surface for NexGen Connect.
 *
 * v17, clarity-first redesign. Every section answers exactly one
 * question the reader is silently asking, in plain English, with one
 * supporting visual or piece of evidence. Layouts are restrained:
 * kicker → headline → body → evidence. No card grids, no edge
 * stripes, no "receipts" chrome. Each section fills one viewport on
 * every device.
 *
 * v18 trillion-dollar polish:
 *   - VerificationTicker slim row sits between hero and WaitlistProof
 *     so the live-trust signal recurs across the page (hero → here →
 *     corridor surface) — visual continuity from marketing → product.
 *   - SectionReveal wraps every block as a proper landmark.
 */

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main" className="flex-1">
        <MarketingHero />

        {/* Slim live-verification strip — sits flush against the hero,
            quietly says "this is happening right now" before the
            68,593 number lands. Hairline border top + bottom so it
            reads as an integrated band, not a stranded element. */}
        <section
          aria-label="Live verifications"
          className="border-y border-[color:var(--color-border)] bg-[color:var(--color-bg)]/40 py-3 backdrop-blur-sm sm:py-3.5"
        >
          <div className="container-narrow flex justify-center">
            <VerificationTicker />
          </div>
        </section>

        <SectionReveal
          as="section"
          ariaLabel="Why now"
          id="waitlist-proof"
          className="scroll-mt-24"
        >
          <WaitlistProof />
        </SectionReveal>

        <SectionReveal as="section" ariaLabel="Why not WhatsApp">
          <ProblemMoments />
        </SectionReveal>

        <SectionReveal as="section" ariaLabel="How it works">
          <TrustPillars />
        </SectionReveal>

        {/* The mechanic, visualized — 60-dot fill-up loop that shows
            the unlock literally instead of describing it. Sits right
            after TrustPillars (which states the rule) so the reader
            reads "60 verified" and then immediately sees what 60
            verified looks like. Show, then explain. */}
        <SectionReveal as="section" ariaLabel="The corridor mechanic">
          <CorridorVisualizer />
        </SectionReveal>

        <SectionReveal as="section" ariaLabel="What the app does">
          <AppShowcase />
        </SectionReveal>

        <SectionReveal as="section" ariaLabel="Where this is live">
          <GlobeSection />
        </SectionReveal>

        <SectionReveal
          as="section"
          ariaLabel="For parents"
          id="parents"
          className="scroll-mt-24"
        >
          <SafetyParents />
        </SectionReveal>

        <SectionReveal
          as="section"
          ariaLabel="Pricing"
          id="pricing"
          className="scroll-mt-24"
        >
          <PricingTiers />
        </SectionReveal>

        <SectionReveal
          as="section"
          ariaLabel="Sign up"
          id="download"
          className="scroll-mt-24"
        >
          <FinalCTA />
        </SectionReveal>
      </main>
      <Footer />
    </>
  );
}
