import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MarketingHero } from "@/components/landing/MarketingHero";
import { ProblemMoments } from "@/components/landing/ProblemMoments";
import { AppShowcase } from "@/components/landing/AppShowcase";
import { SplitCompare } from "@/components/landing/SplitCompare";
import { ManifestoSection } from "@/components/landing/ManifestoSection";
import { IrelandMap } from "@/components/landing/IrelandMap";
import { VerificationTimeline } from "@/components/landing/VerificationTimeline";
import { RoadmapSection } from "@/components/landing/RoadmapSection";
import { FinalCTA } from "@/components/landing/FinalCTA";

/**
 * Home — the full marketing surface for the NexGen Connect app.
 *
 * Section rhythm is intentional:
 *   01  MarketingHero      — headline, mockup, store badges, waitlist
 *   02  ProblemMoments     — the Sunday-night pain of the pre-flight student
 *   03  AppShowcase        — sticky-phone + three scrolling story panels
 *   04  SplitCompare       — 487 spam vs 10 verified; the switch
 *   05  ManifestoSection   — admit letter → app → arrival, three moments
 *   06  IrelandMap         — Phase 01 proof: the actual geography of the launch
 *   07  VerificationTimeline — four checks, demystified
 *   08  RoadmapSection     — Ireland, then a second country, then every corridor
 *   09  FinalCTA           — download the app + waitlist + socials
 *
 * No reservation flow on the public site any more — the product *is* the app.
 */

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main" className="flex-1">
        <MarketingHero />
        <ProblemMoments />
        <AppShowcase />
        <SplitCompare />
        <ManifestoSection />
        <div id="ireland" className="scroll-mt-24">
          <IrelandMap />
        </div>
        <div id="verify" className="scroll-mt-24">
          <VerificationTimeline />
        </div>
        <RoadmapSection />
        <div id="download" className="scroll-mt-24">
          <FinalCTA />
        </div>
      </main>
      <Footer />
    </>
  );
}
