import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { StatsCounter } from "@/components/landing/StatsCounter";
import { SocialProofTicker } from "@/components/landing/SocialProofTicker";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { InsightSection } from "@/components/landing/InsightSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { ForYouSection } from "@/components/landing/ForYouSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { PricingPreview } from "@/components/landing/PricingPreview";
import { FAQSection } from "@/components/landing/FAQSection";
import { FounderSnippet } from "@/components/landing/FounderSnippet";
import { DownloadCTA } from "@/components/landing/DownloadCTA";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <StatsCounter />
        <SocialProofTicker />
        <ProblemSection />
        <InsightSection />
        <HowItWorks />
        <FeaturesGrid />
        <ForYouSection />
        <TestimonialsSection />
        <PricingPreview />
        <FAQSection />
        <FounderSnippet />
        <DownloadCTA />
      </main>
      <Footer />
    </>
  );
}
