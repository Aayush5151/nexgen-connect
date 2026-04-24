import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MarketingHero } from "@/components/landing/MarketingHero";
import { WaitlistProof } from "@/components/landing/WaitlistProof";
import { TrustPillars } from "@/components/landing/TrustPillars";
import { ProblemMoments } from "@/components/landing/ProblemMoments";
import { AppShowcase } from "@/components/landing/AppShowcase";
import { MiniCTA } from "@/components/landing/MiniCTA";
import { GlobeSection } from "@/components/landing/GlobeSection";
import { SafetyParents } from "@/components/landing/SafetyParents";
import { TestimonialWall } from "@/components/landing/TestimonialWall";
import { PricingTiers } from "@/components/landing/PricingTiers";
import { FAQSection } from "@/components/landing/FAQSection";
import { FounderSnippet } from "@/components/landing/FounderSnippet";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { SectionReveal } from "@/components/shared/SectionReveal";

/**
 * Home - the marketing surface for NexGen Connect.
 *
 * v10 editorial pass: cut four sections that were explaining product
 * mechanics in internal jargon before the reader had emotionally bought
 * in. ActivityTicker (staged "joined 2 min ago" feed - costs trust),
 * CorridorWidening (five cards of "axis / widen silently" - the
 * transparency promise now lives in the FAQ), FirstUnlock (redundant
 * with AppShowcase step 03), and IdCardPreview as a standalone scroll
 * stop (verification is already covered twice, once by AppShowcase
 * step 01 and once by SafetyParents pillar 1).
 *
 * Twelve sections plus two MiniCTA bands. Narrative arc:
 *
 *   hook -> proof -> receipts -> pain -> product -> [ask] -> scale ->
 *   parents -> voices -> [ask] -> pricing -> objections -> face -> ask
 *
 *   01  MarketingHero   - the promise, the phone, store + waitlist CTA
 *   02  WaitlistProof   - "waitlist open" live-dot + two-corridor caption
 *   03  TrustPillars    - four receipts that back the promise
 *   04  ProblemMoments  - the Sunday-night pain of going alone
 *   05  AppShowcase     - sticky phone + what the app actually does
 *       MiniCTA         - first mid-page download nudge
 *   06  GlobeSection    - the planet, Dublin + Munich pulsing
 *   07  SafetyParents   - six pillars for the most skeptical reader
 *   08  TestimonialWall - student voices, infinite scroll
 *       MiniCTA         - second mid-page download nudge
 *   09  PricingTiers    - Free plus Premium one-time, no subscription
 *   10  FAQSection      - last-mile objection handling
 *   11  FounderSnippet  - a named face between objections and the ask
 *   12  FinalCTA        - single store + waitlist ask
 *
 * v13 editorial pass: TrustPillars inserted between WaitlistProof and
 * ProblemMoments to give the reader four locked-in design facts (group
 * size, verification, zero-agents, data-exit) before they hit the pain
 * section. The page now opens with promise -> proof of commitment ->
 * receipts -> pain, which mirrors how a skeptical Indian parent or a
 * spooked 18-year-old actually decides whether to keep reading.
 *
 * v12 conversion rhythm: two MiniCTA bands added between AppShowcase /
 * GlobeSection and TestimonialWall / PricingTiers. Before this, a
 * visitor saw the download CTA in the hero then had to scroll through
 * seven sections before the next explicit ask in FinalCTA - long
 * enough for the intent to leak. The bands are light-weight (single
 * row, small badges, no email input of their own) so they prompt
 * without interrupting the read.
 *
 * Every section is wrapped in <SectionReveal /> so the page breathes as
 * a single piece of choreography. Individual sections still own their
 * internal motion.
 */

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main" className="flex-1">
        <MarketingHero />

        <SectionReveal>
          <WaitlistProof />
        </SectionReveal>

        <SectionReveal>
          <TrustPillars />
        </SectionReveal>

        <SectionReveal>
          <ProblemMoments />
        </SectionReveal>

        <SectionReveal>
          <AppShowcase />
        </SectionReveal>

        <SectionReveal>
          <MiniCTA lead="Sound like your group?" />
        </SectionReveal>

        <SectionReveal>
          <GlobeSection />
        </SectionReveal>

        <SectionReveal>
          <div id="parents" className="scroll-mt-24">
            <SafetyParents />
          </div>
        </SectionReveal>

        <SectionReveal>
          <TestimonialWall />
        </SectionReveal>

        <SectionReveal>
          <MiniCTA lead="Your people are already signing up." />
        </SectionReveal>

        <SectionReveal>
          <div id="pricing" className="scroll-mt-24">
            <PricingTiers />
          </div>
        </SectionReveal>

        <SectionReveal>
          <div id="faq" className="scroll-mt-24">
            <FAQSection />
          </div>
        </SectionReveal>

        <SectionReveal>
          <FounderSnippet />
        </SectionReveal>

        <SectionReveal>
          <div id="download" className="scroll-mt-24">
            <FinalCTA />
          </div>
        </SectionReveal>
      </main>
      <Footer />
    </>
  );
}
