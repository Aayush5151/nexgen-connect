import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { InsightSection } from "@/components/landing/InsightSection";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { StatsCounter } from "@/components/landing/StatsCounter";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { PricingPreview } from "@/components/landing/PricingPreview";
import { DownloadCTA } from "@/components/landing/DownloadCTA";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <FeaturesGrid />
        <HowItWorks />
        <InsightSection />
        <StatsCounter />
        <TestimonialsSection />
        <PricingPreview />
        <DownloadCTA />
      </main>
      <Footer />
    </>
  );
}
