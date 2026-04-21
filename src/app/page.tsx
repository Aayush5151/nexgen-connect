import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MarketingHero } from "@/components/landing/MarketingHero";
import { WaitlistProof } from "@/components/landing/WaitlistProof";
import { ProblemMoments } from "@/components/landing/ProblemMoments";
import { AppShowcase } from "@/components/landing/AppShowcase";
import { SplitCompare } from "@/components/landing/SplitCompare";
import { MeetYourGroup } from "@/components/landing/MeetYourGroup";
import { ManifestoSection } from "@/components/landing/ManifestoSection";
import { ScrollingMarquee } from "@/components/landing/ScrollingMarquee";
import { GlobeSection } from "@/components/landing/GlobeSection";
import { UniversitySelector } from "@/components/landing/UniversitySelector";
import { IrelandMap } from "@/components/landing/IrelandMap";
import { VerificationTimeline } from "@/components/landing/VerificationTimeline";
import { DublinArrival } from "@/components/landing/DublinArrival";
import { SafetyParents } from "@/components/landing/SafetyParents";
import { TestimonialWall } from "@/components/landing/TestimonialWall";
import { RoadmapSection } from "@/components/landing/RoadmapSection";
import { BentoClose } from "@/components/landing/BentoClose";
import { FounderBand } from "@/components/landing/FounderBand";
import { FinalCTA } from "@/components/landing/FinalCTA";

/**
 * Home - the full marketing surface for the NexGen Connect app.
 *
 * Section rhythm is intentional. Each block earns its place by adding
 * either new information, new emotion, or new momentum - never both
 * rhythm-mates together. The pattern is: hook → pain → product → belief.
 *
 *   01  MarketingHero      - headline, mockup, store badges, waitlist
 *   02  WaitlistProof      - live count + avatar stack, one-liner trust
 *   03  ProblemMoments     - the Sunday-night pain of the pre-flight student
 *   04  AppShowcase        - sticky-phone + three scrolling story panels
 *   05  SplitCompare       - 487 spam vs 10 verified; the switch
 *   06  MeetYourGroup      - a preview card, "here is what YOUR 10 look like"
 *   07  ManifestoSection   - admit letter → app → arrival, three moments
 *   08  ScrollingMarquee   - keyword ribbon, cinematic pause
 *   09  GlobeSection       - the planet, seen from space, with Ireland pulsing
 *   10  UniversitySelector - tabs: UCD · Trinity · UCC
 *   11  IrelandMap         - zoom in: the actual geography of the launch
 *   12  VerificationTimeline - four checks, demystified
 *   13  DublinArrival      - airport arrivals board, EK 049 lit up green
 *   14  SafetyParents      - for the most skeptical reader on the site
 *   15  TestimonialWall    - nine voices, not three hero blocks
 *   16  RoadmapSection     - Ireland, then a second country, then every corridor
 *   17  BentoClose         - the numbers grid: 10, 100%, Ireland, 90s, 0
 *   18  FounderBand        - one-line credibility before the big button
 *   19  FinalCTA           - AirportMoment typewriter + store badges + waitlist
 *
 * No reservation flow on the public site any more - the product *is* the app.
 */

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main" className="flex-1">
        <MarketingHero />
        <WaitlistProof />
        <ProblemMoments />
        <AppShowcase />
        <SplitCompare />
        <MeetYourGroup />
        <ManifestoSection />
        <ScrollingMarquee />
        <GlobeSection />
        <UniversitySelector />
        <div id="ireland" className="scroll-mt-24">
          <IrelandMap />
        </div>
        <div id="verify" className="scroll-mt-24">
          <VerificationTimeline />
        </div>
        <DublinArrival />
        <SafetyParents />
        <TestimonialWall />
        <RoadmapSection />
        <BentoClose />
        <FounderBand />
        <div id="download" className="scroll-mt-24">
          <FinalCTA />
        </div>
      </main>
      <Footer />
    </>
  );
}
