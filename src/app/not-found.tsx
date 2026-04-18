import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CtaButton } from "@/components/ui/CtaButton";
import { Pill } from "@/components/ui/Pill";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main id="main" className="flex flex-1 items-center py-32 md:py-40">
        <div className="container-narrow">
          <div className="max-w-[560px]">
            <Pill dot="coral">404</Pill>
            <h1 className="mt-6 font-heading text-5xl font-semibold leading-[1.05] tracking-[-0.025em] text-foreground md:text-6xl">
              This page doesn&apos;t exist.
            </h1>
            <p className="mt-6 text-lg leading-[1.55] text-muted-foreground">
              Probably a link we removed during the pre-launch rebuild, or a
              URL from the old site. No panic. The waitlist is still open.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <CtaButton href="/" arrow>Back to home</CtaButton>
              <CtaButton href="/#join" variant="secondary">Join the WS26 waitlist</CtaButton>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
