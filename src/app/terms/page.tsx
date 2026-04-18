import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Pill } from "@/components/ui/Pill";

export const metadata: Metadata = {
  title: "Terms",
  description: "The simple rules for using NexGen Connect during our pre-launch beta.",
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="py-20 md:py-28">
        <div className="container-prose">
          <Pill dot="muted">Legal</Pill>
          <h1 className="mt-6 font-heading text-5xl font-semibold leading-[1.05] tracking-[-0.025em] text-foreground">
            Terms
          </h1>
          <p className="mt-4 font-mono text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
            Last updated · April 2026 · Pre-launch beta
          </p>

          <p className="mt-8 text-[16px] leading-[1.6] text-muted-foreground">
            We&apos;re in pre-launch. These terms cover the waitlist only. When the
            app ships, they&apos;ll expand — and we&apos;ll email you before they do.
          </p>

          <div className="mt-10 space-y-10 text-[16px] leading-[1.65] text-muted-foreground">
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">1. Who this is for</h2>
              <p className="mt-3">
                You&apos;re 18 or older. You&apos;re a student, admitted or applying, planning
                to study abroad. You&apos;re joining the waitlist to be introduced to
                other students like you. That&apos;s the whole scope.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">2. What we agree to</h2>
              <p className="mt-3">
                We&apos;ll only email you about your cohort, updates on the beta, and
                things you&apos;d miss if we didn&apos;t tell you. Never spam. Never sold
                lists. Unsubscribe any time with a reply.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">3. What we ask of you</h2>
              <p className="mt-3">
                Be real. Don&apos;t fake an admit. Don&apos;t sign up as 5 people.
                Don&apos;t use the waitlist to sell anything to other students.
                If you do, we&apos;ll remove you and you won&apos;t get into the beta.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">4. Money</h2>
              <p className="mt-3">
                The first 1,000 students join free during beta. Pricing will be
                announced before launch and before you&apos;re ever charged. We&apos;ll
                email you well before that.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">5. Changes</h2>
              <p className="mt-3">
                If these terms change in a way that affects you, we&apos;ll email
                you. Silence is not consent for us.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">6. Questions</h2>
              <p className="mt-3">
                Email{" "}
                <a href="mailto:aayush@nexgenconnect.com" className="text-primary underline decoration-dotted underline-offset-4">
                  aayush@nexgenconnect.com
                </a>
                . A real person reads every message.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
