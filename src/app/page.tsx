import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { Manifesto } from "@/components/landing/Manifesto";
import { CohortSection } from "@/components/landing/CohortSection";
import { Verification } from "@/components/landing/Verification";
import { NotThis } from "@/components/landing/NotThis";
import { FounderBlock } from "@/components/landing/FounderBlock";
import { FinalCTA } from "@/components/landing/FinalCTA";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <Problem />
        <Manifesto />
        <CohortSection />
        <Verification />
        <NotThis />
        <FounderBlock />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
