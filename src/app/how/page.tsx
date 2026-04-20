import type { Metadata } from "next";
import Link from "next/link";
import { Lock } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AppStoreBadge } from "@/components/ui/AppStoreBadge";
import { PlayStoreBadge } from "@/components/ui/PlayStoreBadge";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { VerificationSteps } from "@/components/shared/VerificationSteps";
import { EmailWaitlistForm } from "@/components/landing/EmailWaitlistForm";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "Four verification checks. A human review. One verified group on the other side. This is exactly how NexGen Connect works, before the app ships.",
};

/**
 * /how - deep-dive page. Standalone story about verification and safety,
 * still readable as a marketing page. The CTA at the bottom is now the
 * app store row + email waitlist, matching the rest of the site.
 */

const SAFETY = [
  {
    title: "Phone numbers are stored as hashes.",
    body: "We never hold your mobile number in plain text. The OTP flow uses a separate pepper so leaked phone hashes can't be correlated with the OTP table.",
  },
  {
    title: "Social profiles reveal last.",
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
            <h1
              className="mt-6 max-w-[900px] font-heading font-semibold text-balance text-[color:var(--color-fg)]"
              style={{
                fontSize: "clamp(44px, 7vw, 88px)",
                lineHeight: 0.95,
                letterSpacing: "-0.035em",
              }}
            >
              Verified the way{" "}
              <span className="font-serif font-normal italic tracking-[-0.02em] text-[color:var(--color-fg-muted)]">
                your mom
              </span>{" "}
              would.
            </h1>
            <p className="mt-6 max-w-[620px] text-[18px] leading-[1.55] text-[color:var(--color-fg-muted)]">
              Four checks. Roughly forty-eight hours. No shortcuts. Here is
              exactly what happens between the moment you open the app and the
              moment your group opens up.
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
                <h2
                  className="mt-4 font-heading font-semibold text-[color:var(--color-fg)]"
                  style={{
                    fontSize: "clamp(40px, 5.5vw, 64px)",
                    lineHeight: 0.95,
                    letterSpacing: "-0.03em",
                  }}
                >
                  Built for parents.
                  <br />
                  <span className="font-serif font-normal italic tracking-[-0.02em] text-[color:var(--color-fg-muted)]">
                    Still fast for you.
                  </span>
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
            <h2
              className="mx-auto max-w-[760px] font-heading font-semibold text-balance text-[color:var(--color-fg)]"
              style={{
                fontSize: "clamp(40px, 6vw, 72px)",
                lineHeight: 0.95,
                letterSpacing: "-0.03em",
              }}
            >
              One hour between you and{" "}
              <span className="font-serif font-normal italic tracking-[-0.02em] text-[color:var(--color-fg-muted)]">
                your group.
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-[520px] text-[16px] leading-[1.55] text-[color:var(--color-fg-muted)]">
              The app ships to the App Store and Play Store before the first
              September 2026 flights take off. Download it the moment it&apos;s
              live.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <AppStoreBadge size="md" />
              <PlayStoreBadge size="md" />
            </div>
            <div className="mt-10">
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
                Or get notified the moment it launches
              </p>
              <div className="mx-auto w-full max-w-[420px]">
                <EmailWaitlistForm referrer="how" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
