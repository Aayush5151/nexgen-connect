import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MarketingHero } from "@/components/landing/MarketingHero";
import { WaitlistProof } from "@/components/landing/WaitlistProof";
import { TrustPillars } from "@/components/landing/TrustPillars";
import { ProblemMoments } from "@/components/landing/ProblemMoments";
import { AppShowcase } from "@/components/landing/AppShowcase";
import { GlobeSection } from "@/components/landing/GlobeSection";
import { SafetyParents } from "@/components/landing/SafetyParents";
import { TestimonialWall } from "@/components/landing/TestimonialWall";
import { PricingTiers } from "@/components/landing/PricingTiers";
import { FAQSection } from "@/components/landing/FAQSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { SectionReveal } from "@/components/shared/SectionReveal";

/**
 * Home — the marketing surface for NexGen Connect.
 *
 * v15 redesign: every section now fills exactly one viewport
 * (`min-h-[100dvh]` + flex-center) so the reader lands cleanly on a
 * single deliberate stop with each scroll, on every device — phone,
 * laptop, desktop, TV. The MiniCTA bands have been removed from the
 * landing arc because they fragmented the rhythm — Get-the-App lives
 * permanently in the navbar and as a final-section ask. FounderSnippet
 * is also removed as a standalone stop and is folded into the FinalCTA
 * for the closing voice.
 *
 * Eleven viewports, narrative arc:
 *
 *   01  MarketingHero    — the promise, the phone, the launch pill
 *   02  WaitlistProof    — magnitude: 68,593 Indians, the largest
 *                          cohort ever in Ireland + Germany
 *   03  TrustPillars     — the mechanic: 60 verified before DMs unlock
 *   04  ProblemMoments   — the Sunday-night pain of going alone
 *   05  AppShowcase      — verify, match, land together
 *   06  GlobeSection     — the planet, two corridors live
 *   07  SafetyParents    — for parents: 3× verification per person
 *   08  TestimonialWall  — student voices, what they wished existed
 *   09  PricingTiers     — Free plus Premium ₹1,499 one-time
 *   10  FAQSection       — last-mile objections, accordion
 *   11  FinalCTA         — the closing ask + founder face
 *
 * Each section is wrapped in <SectionReveal /> so motion is choreographed
 * as one piece. Individual sections still own their internal animations.
 *
 * Magnitude language: every section anchors on a single mega-number
 * (60, 68,593, 3×, ₹0) instead of receipt grids of small ones. People
 * read numbers; people skim copy.
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
          <div id="download" className="scroll-mt-24">
            <FinalCTA />
          </div>
        </SectionReveal>
      </main>
      <Footer />
    </>
  );
}
