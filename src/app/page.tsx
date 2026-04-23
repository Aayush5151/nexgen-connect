import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MarketingHero } from "@/components/landing/MarketingHero";
import { WaitlistProof } from "@/components/landing/WaitlistProof";
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
 * Eleven sections plus two MiniCTA bands. Narrative arc:
 *
 *   hook -> proof -> pain -> product -> [ask] -> scale ->
 *   parents -> voices -> [ask] -> pricing -> objections -> face -> ask
 *
 *   01  MarketingHero   - the promise, the phone, store + waitlist CTA
 *   02  WaitlistProof   - "waitlist open" live-dot + two-corridor caption
 *   03  ProblemMoments  - the Sunday-night pain of going alone
 *   04  AppShowcase     - sticky phone + what the app actually does
 *       MiniCTA         - first mid-page download nudge
 *   05  GlobeSection    - the planet, Dublin + Munich pulsing
 *   06  SafetyParents   - six pillars for the most skeptical reader
 *   07  TestimonialWall - student voices, infinite scroll
 *       MiniCTA         - second mid-page download nudge
 *   08  PricingTiers    - Free plus Premium one-time, no subscription
 *   09  FAQSection      - last-mile objection handling
 *   10  FounderSnippet  - a named face between objections and the ask
 *   11  FinalCTA        - single store + waitlist ask
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
