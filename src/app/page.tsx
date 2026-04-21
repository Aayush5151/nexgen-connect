import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MarketingHero } from "@/components/landing/MarketingHero";
import { WaitlistProof } from "@/components/landing/WaitlistProof";
import { ActivityTicker } from "@/components/landing/ActivityTicker";
import { ProblemMoments } from "@/components/landing/ProblemMoments";
import { AppShowcase } from "@/components/landing/AppShowcase";
import { CorridorWidening } from "@/components/landing/CorridorWidening";
import { GlobeSection } from "@/components/landing/GlobeSection";
import { AttentionCurve } from "@/components/landing/AttentionCurve";
import { VerificationTimeline } from "@/components/landing/VerificationTimeline";
import { IdCardPreview } from "@/components/landing/IdCardPreview";
import { BoardingPass } from "@/components/landing/BoardingPass";
import { DublinArrival } from "@/components/landing/DublinArrival";
import { SafetyParents } from "@/components/landing/SafetyParents";
import { TestimonialWall } from "@/components/landing/TestimonialWall";
import { PricingTiers } from "@/components/landing/PricingTiers";
import { FAQSection } from "@/components/landing/FAQSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { SectionReveal } from "@/components/shared/SectionReveal";

/**
 * Home - the tightened marketing surface for NexGen Connect.
 *
 * We trimmed hard in v1 (26 -> 13). In v4 we add back three surgical
 * sections - CorridorWidening, AttentionCurve, PricingTiers - because
 * the business model changes (8-12 group band, widening axes, Free
 * plus Premium one-time) had no home on the old page.
 *
 * Sixteen sections now, each earning its place in the narrative.
 * The spine is:
 *
 *   hook -> proof -> pain -> product -> mechanics -> scale ->
 *   timeline -> trust -> artefact -> payoff -> parents -> voices ->
 *   pricing -> objections -> ask
 *
 *   01  MarketingHero        - the promise, the phone, the waitlist
 *   02  WaitlistProof        - &quot;waitlist open&quot; live-dot + TestFlight caption
 *   02b ActivityTicker       - thin rolling &quot;joined the waitlist&quot; band
 *   03  ProblemMoments       - the Sunday-night pain of going alone
 *   04  AppShowcase          - sticky phone + what the app actually does
 *   05  CorridorWidening     - the 5 widening axes, transparency promise
 *   06  GlobeSection         - the planet, Ireland pulsing, the scale
 *   07  AttentionCurve       - 5-phase pre-flight timeline (answers
 *                              &quot;180 days is too long&quot;)
 *   08  VerificationTimeline - three checks, demystified
 *   09  IdCardPreview        - parallax ID card, &quot;every face on here is real&quot;
 *   10  BoardingPass         - the interactive: mint your own ticket
 *   11  DublinArrival        - arrivals board, YOUR flight lit up
 *   12  SafetyParents        - six pillars for the most skeptical reader
 *   13  TestimonialWall      - nine research voices, lived-in, uneven
 *   14  PricingTiers         - Free plus Premium one-time, no subscription
 *   15  FAQSection           - last-mile objection handling
 *   16  FinalCTA             - typewriter + store badges + waitlist
 *
 * Every surviving section is wrapped in &lt;SectionReveal /&gt; so the page
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

        {/* Thin rolling "joined the waitlist" social-proof band. */}
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
          <CorridorWidening />
        </SectionReveal>

        <SectionReveal>
          <GlobeSection />
        </SectionReveal>

        <SectionReveal>
          <AttentionCurve />
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
