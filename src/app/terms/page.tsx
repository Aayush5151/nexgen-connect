import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "The simple rules for using NexGen Connect during our pre-launch waitlist.",
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="py-20 md:py-28">
        <div className="container-prose">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
            LEGAL
          </p>
          <h1 className="mt-6 font-heading text-5xl font-semibold leading-[1.05] tracking-[-0.025em] text-[color:var(--color-fg)]">
            Terms
          </h1>
          <p className="mt-4 font-mono text-[12px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
            Last updated · April 2026 · Pre-launch
          </p>

          <p className="mt-8 text-[16px] leading-[1.6] text-[color:var(--color-fg-muted)]">
            We&apos;re in pre-launch. These terms cover the Sept 2026 waitlist only.
            When the app ships, they&apos;ll expand — and we&apos;ll email you before
            they do.
          </p>

          <div className="mt-10 space-y-10 text-[16px] leading-[1.65] text-[color:var(--color-fg-muted)]">
            <section>
              <h2 className="font-heading text-xl font-semibold text-[color:var(--color-fg)]">1. Who this is for</h2>
              <p className="mt-3">
                You&apos;re 18 or older. You&apos;re an Indian student, admitted or
                applying to UCD, Trinity, or UCC for September 2026. You&apos;re
                joining the waitlist to be introduced to other students like you.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-[color:var(--color-fg)]">2. What we agree to</h2>
              <p className="mt-3">
                We&apos;ll only email you about your cohort and updates on the
                product. Never spam. Never sold lists. Unsubscribe any time with
                a reply.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-[color:var(--color-fg)]">3. What we ask of you</h2>
              <p className="mt-3">
                Be real. Don&apos;t fake an admit. Don&apos;t sign up as multiple
                people. Don&apos;t use the waitlist to sell services to other
                students. If you do, we&apos;ll remove you.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-[color:var(--color-fg)]">4. Money</h2>
              <p className="mt-3">
                Founding cohort members pay zero. Pricing, if any, will be
                announced before launch and before you&apos;re ever charged.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-[color:var(--color-fg)]">5. Changes</h2>
              <p className="mt-3">
                If these terms change in a way that affects you, we&apos;ll email
                you. Silence is not consent.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-[color:var(--color-fg)]">6. Questions</h2>
              <p className="mt-3">
                Email{" "}
                <a
                  href="mailto:hello@nexgenconnect.com"
                  className="text-[color:var(--color-primary)] underline decoration-dotted underline-offset-4"
                >
                  hello@nexgenconnect.com
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
