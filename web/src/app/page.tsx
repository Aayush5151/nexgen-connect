import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MarketingHero } from "@/components/landing/MarketingHero";
import { WaitlistProof } from "@/components/landing/WaitlistProof";
import { ProblemMoments } from "@/components/landing/ProblemMoments";
import { TrustPillars } from "@/components/landing/TrustPillars";
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
 * Nine stops. The reader leaves understanding.
 *
 *   01  Hero          , "What is this?"          → Find your people
 *                                                    before you land.
 *   02  WaitlistProof , "Why now?"               → 68,593 of us last year.
 *   03  ProblemMoments, "Why not WhatsApp?"      → 500 strangers, 0 verified.
 *   04  TrustPillars  , "How does it work?"      → 60 verified per
 *                                                    corridor before DMs.
 *   05  AppShowcase   , "What does the app do?"  → Verify, match, land.
 *   06  GlobeSection  , "Where is this live?"    → DUB Sept '26,
 *                                                    DE Oct '26.
 *   07  SafetyParents , "Is it actually safe?"   → Three independent
 *                                                    checks per person.
 *   08  PricingTiers  , "What does it cost?"     → Free core + ₹999
 *                                                    Premium, one-time.
 *   09  FinalCTA      , "How do I sign up?"      → You don't land alone.
 *
 * v18 a11y upgrade: every SectionReveal renders as a proper
 * `<section aria-label="...">` landmark so screen-reader users get a
 * full landmark navigation list for the landing page. The Hero stays
 * a top-level `<section>` rendered inside MarketingHero itself.
 *
 * Removed from landing: TestimonialWall (16 carousel quotes felt like
 * clutter rather than proof, the problem-stat in ProblemMoments now
 * carries that load), FAQSection (the most-asked questions are
 * answered inline across the nine stops; structured-data FAQ remains
 * in /lib/faq.ts for Google rich results, and the dedicated /how
 * route covers deep mechanics).
 */

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main" className="flex-1">
        <MarketingHero />

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
