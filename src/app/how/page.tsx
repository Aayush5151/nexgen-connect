import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { VerificationSteps } from "@/components/shared/VerificationSteps";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "Four verification checks, a forty-eight-hour review, and no shortcuts. Here's exactly how NexGen Connect verifies every student before they land.",
};

const SAFETY = [
  {
    title: "Phone numbers are stored as hashes.",
    body: "We never hold your mobile number in plain text. The OTP flow uses a separate pepper so leaked phone hashes can't be correlated with the OTP table.",
  },
  {
    title: "Instagram is the last thing that gets shared.",
    body: "You don't pick a profile photo, you don't write a bio, and your socials don't reveal until both sides have tapped match. Verification proves you're real. We don't need you to perform.",
  },
  {
    title: "One report kills a profile.",
    body: "If someone misrepresents themselves or contacts you off-platform, tap report. We suspend the account within an hour and a human reviews within twenty-four.",
  },
];

export default function HowPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="flex-1">
        <section className="pt-24 pb-12 md:pt-32 md:pb-16">
          <div className="container-narrow">
            <SectionLabel>How it works</SectionLabel>
            <h1 className="mt-6 max-w-[820px] font-heading text-[44px] font-semibold leading-[1.02] tracking-[-0.025em] text-[color:var(--color-fg)] md:text-[64px]">
              Verified the way your mom would.
            </h1>
            <p className="mt-6 max-w-[620px] text-[18px] leading-[1.55] text-[color:var(--color-fg-muted)]">
              Four checks. Roughly forty-eight hours. No shortcuts. Here is
              exactly what happens between the moment you start and the moment
              your group opens up.
            </p>
          </div>
        </section>

        <section className="section-y border-t border-[color:var(--color-border)]">
          <div className="container-narrow">
            <VerificationSteps />
          </div>
        </section>

        <section className="section-y border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)]">
          <div className="container-narrow">
            <div className="grid gap-10 md:grid-cols-12 md:gap-16">
              <div className="md:col-span-4">
                <SectionLabel>Safety architecture</SectionLabel>
                <h2 className="mt-4 font-serif text-[40px] font-normal leading-[1.0] tracking-[-0.01em] text-[color:var(--color-fg)] md:text-[52px]">
                  Built for parents.
                  <br />
                  <em className="italic text-[color:var(--color-fg-muted)]">Still fast for you.</em>
                </h2>
              </div>
              <div className="md:col-span-8">
                <ul className="divide-y divide-[color:var(--color-border)] border-y border-[color:var(--color-border)]">
                  {SAFETY.map((item) => (
                    <li
                      key={item.title}
                      className="grid gap-4 py-6 md:grid-cols-[24px_1fr] md:gap-6"
                    >
                      <Lock
                        className="mt-1 h-4 w-4 text-[color:var(--color-primary)]"
                        strokeWidth={2}
                      />
                      <div>
                        <h3 className="font-heading text-[18px] font-semibold text-[color:var(--color-fg)]">
                          {item.title}
                        </h3>
                        <p className="mt-2 max-w-[560px] text-[15px] leading-[1.6] text-[color:var(--color-fg-muted)]">
                          {item.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-[13px] text-[color:var(--color-fg-subtle)]">
                  More detail in our{" "}
                  <Link
                    href="/privacy"
                    className="underline underline-offset-2 hover:text-[color:var(--color-fg-muted)]"
                  >
                    privacy policy
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-y border-t border-[color:var(--color-border)]">
          <div className="container-narrow text-center">
            <h2 className="mx-auto max-w-[620px] font-serif text-[40px] font-normal leading-[1.0] tracking-[-0.01em] text-[color:var(--color-fg)] md:text-[56px]">
              One hour between you and{" "}
              <em className="italic text-[color:var(--color-fg-muted)]">your group.</em>
            </h2>
            <Link
              href="/#reserve"
              className="mt-10 inline-flex h-14 items-center justify-center gap-2 rounded-[10px] bg-[color:var(--color-primary)] px-8 text-[15px] font-medium text-[color:var(--color-primary-fg)] transition-colors hover:bg-[color:var(--color-primary-hover)]"
            >
              Reserve my spot. Free.
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
