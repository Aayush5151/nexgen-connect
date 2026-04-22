import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MarketingHero } from "@/components/landing/MarketingHero";
import { WaitlistProof } from "@/components/landing/WaitlistProof";
import { ActivityTicker } from "@/components/landing/ActivityTicker";
import { ProblemMoments } from "@/components/landing/ProblemMoments";
import { AppShowcase } from "@/components/landing/AppShowcase";
import { CorridorWidening } from "@/components/landing/CorridorWidening";
import { GlobeSection } from "@/components/landing/GlobeSection";
import { IdCardPreview } from "@/components/landing/IdCardPreview";
import { SafetyParents } from "@/components/landing/SafetyParents";
import { TestimonialWall } from "@/components/landing/TestimonialWall";
import { PricingTiers } from "@/components/landing/PricingTiers";
import { FAQSection } from "@/components/landing/FAQSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { SectionReveal } from "@/components/shared/SectionReveal";

/**
 * Home - the tightened marketing surface for NexGen Connect.
 *
 * Cut aggressively in v6: dropped AttentionCurve (meta philosophy,
 * no product), VerificationTimeline (redundant with AppShowcase step
 * 01 and SafetyParents pillar 1), BoardingPass (pattern fatigue with
 * IdCardPreview - both are the ticket/card metaphor), and
 * DublinArrival (duplicated FinalCTA's AirportMoment typewriter).
 *
 * Thirteen sections now, each showing something no other section
 * shows. Narrative arc:
 *
 *   hook -> proof -> pain -> product -> mechanics -> scale ->
 *   artefact -> parents -> voices -> pricing -> objections -> ask
 *
 *   01  MarketingHero        - the promise, the phone, the waitlist
 *   02  WaitlistProof        - &quot;waitlist open&quot; live-dot + TestFlight caption
 *   02b ActivityTicker       - thin rolling &quot;joined the waitlist&quot; band
 *   03  ProblemMoments       - the Sunday-night pain of going alone
 *   04  AppShowcase          - sticky phone + what the app actually does
 *   05  CorridorWidening     - the 5 widening axes, transparency promise
 *   06  GlobeSection         - the planet, Ireland pulsing, the scale
 *   07  IdCardPreview        - parallax ID card, the verified-member object
 *   08  SafetyParents        - six pillars for the most skeptical reader
 *   09  TestimonialWall      - nine research voices, lived-in, uneven
 *   10  PricingTiers         - Free plus Premium one-time, no subscription
 *   11  FAQSection           - last-mile objection handling
 *   12  FinalCTA             - typewriter + store badges + waitlist
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
          <IdCardPreview />
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
