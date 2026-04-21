import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MarketingHero } from "@/components/landing/MarketingHero";
import { WaitlistProof } from "@/components/landing/WaitlistProof";
import { ActivityTicker } from "@/components/landing/ActivityTicker";
import { ProblemMoments } from "@/components/landing/ProblemMoments";
import { AppShowcase } from "@/components/landing/AppShowcase";
import { GlobeSection } from "@/components/landing/GlobeSection";
import { VerificationTimeline } from "@/components/landing/VerificationTimeline";
import { IdCardPreview } from "@/components/landing/IdCardPreview";
import { BoardingPass } from "@/components/landing/BoardingPass";
import { DublinArrival } from "@/components/landing/DublinArrival";
import { SafetyParents } from "@/components/landing/SafetyParents";
import { TestimonialWall } from "@/components/landing/TestimonialWall";
import { FAQSection } from "@/components/landing/FAQSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { SectionReveal } from "@/components/shared/SectionReveal";

/**
 * Home - the tightened marketing surface for NexGen Connect.
 *
 * We trimmed hard: 26 sections → 13. Each block now earns its place by
 * doing exactly one job in the narrative. The spine is:
 *
 *   hook → proof → pain → product → scale → trust → artefact → payoff →
 *   parents → voices → objections → ask
 *
 *   01  MarketingHero        - the promise, the phone, the waitlist
 *   02  WaitlistProof        - "X students already in line" + avatar stack
 *   02b ActivityTicker       - thin rolling "just verified" band
 *   03  ProblemMoments       - the Sunday-night pain of going alone
 *   04  AppShowcase          - sticky phone + what the app actually does
 *   05  GlobeSection         - the planet, Ireland pulsing, the scale
 *   06  VerificationTimeline - four checks, demystified
 *   07  IdCardPreview        - parallax ID card, "every face on here is real"
 *   08  BoardingPass         - the interactive: mint your own ticket
 *   09  DublinArrival        - arrivals board, YOUR flight lit up
 *   10  SafetyParents        - for the most skeptical reader on the site
 *   11  TestimonialWall      - nine voices, lived-in, uneven
 *   12  FAQSection           - last-mile objection handling
 *   13  FinalCTA             - typewriter + store badges + waitlist
 *
 * What we cut, and why, so nobody tries to bring it back:
 *
 *   SplitCompare      → redundant with AppShowcase (same "before/after").
 *   MeetYourGroup     → the group idea already lives in AppShowcase +
 *                       Hero mockup. A third restatement dulls it.
 *   FlightPreview     → covered by BoardingPass, which is more tactile
 *                       and leaves the visitor with a downloadable artefact.
 *   ManifestoSection  → the emotional beat already lives in ProblemMoments.
 *                       Two manifestos is one manifesto too many.
 *   ScrollingMarquee  → pure decoration; earned no information.
 *   FlightArcMap      → geography is told better by GlobeSection alone.
 *   UniversitySelector→ university names aren't critical pre-launch.
 *   IrelandMap        → duplicated the "zoom to Ireland" that the Globe
 *                       already delivers.
 *   RoadmapSection    → premature; pre-launch visitors don't care yet.
 *   ReferralUnlock    → premature; nothing to refer until the app ships.
 *   BentoClose        → stats grid that double-closes before FinalCTA.
 *   FounderBand       → founder credibility is stronger inline in FinalCTA.
 *
 * Every surviving section is wrapped in <SectionReveal /> so the page
 * breathes as a single piece of choreography. Individual sections still
 * own their internal motion.
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

        {/* Thin rolling "just verified" social-proof band. */}
        <div className="border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-5">
          <div className="container-narrow flex justify-center">
            <ActivityTicker />
          </div>
        </div>

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
          <div id="verify" className="scroll-mt-24">
            <VerificationTimeline />
          </div>
        </SectionReveal>

        <SectionReveal>
          <IdCardPreview />
        </SectionReveal>

        <SectionReveal>
          <BoardingPass />
        </SectionReveal>

        <SectionReveal>
          <DublinArrival />
        </SectionReveal>

        <SectionReveal>
          <SafetyParents />
        </SectionReveal>

        <SectionReveal>
          <TestimonialWall />
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
