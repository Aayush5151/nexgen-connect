import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MarketingHero } from "@/components/landing/MarketingHero";
import { WaitlistProof } from "@/components/landing/WaitlistProof";
import { ProblemMoments } from "@/components/landing/ProblemMoments";
import { TrustPillars } from "@/components/landing/TrustPillars";
import { AppShowcase } from "@/components/landing/AppShowcase";
import { SafetyParents } from "@/components/landing/SafetyParents";
import { PricingTiers } from "@/components/landing/PricingTiers";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { SectionReveal } from "@/components/shared/SectionReveal";

/**
 * Home — the marketing surface for NexGen Connect.
 *
 * v17 — clarity-first redesign. Every section answers exactly one
 * question the reader is silently asking, in plain English, with one
 * supporting visual or piece of evidence. Layouts are restrained:
 * kicker → headline → body → evidence. No card grids, no edge
 * stripes, no "receipts" chrome. Each section fills one viewport on
 * every device.
 *
 * Eight stops. The reader leaves understanding.
 *
 *   01  Hero           — "What is this?"          → Find your people
 *                                                    before you land.
 *   02  WaitlistProof  — "Why now?"               → 68,593 of us last year.
 *   03  ProblemMoments — "Why not WhatsApp?"      → 500 strangers, 0 verified.
 *   04  TrustPillars   — "How does it work?"      → 60 verified per
 *                                                    corridor before DMs.
 *   05  AppShowcase    — "What does the app do?"  → Verify, match, land.
 *   06  SafetyParents  — "Is it actually safe?"   → Three independent
 *                                                    checks per person.
 *   07  PricingTiers   — "What does it cost?"     → Free core + ₹1,499
 *                                                    Premium, one-time.
 *   08  FinalCTA       — "How do I sign up?"      → You don't land alone.
 *
 * Removed from landing: GlobeSection (decorative — the launch
 * corridors are already named in three other sections), TestimonialWall
 * (16 carousel quotes felt like clutter rather than proof — the
 * problem-stat in ProblemMoments now carries that load), FAQSection
 * (the most-asked questions are answered inline across the eight
 * stops; structured-data FAQ remains in /lib/faq.ts for Google rich
 * results, and the dedicated /how route covers deep mechanics).
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
          <TrustPillars />
        </SectionReveal>

        <SectionReveal>
          <AppShowcase />
        </SectionReveal>

        <SectionReveal>
          <div id="parents" className="scroll-mt-24">
            <SafetyParents />
          </div>
        </SectionReveal>

        <SectionReveal>
          <div id="pricing" className="scroll-mt-24">
            <PricingTiers />
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
