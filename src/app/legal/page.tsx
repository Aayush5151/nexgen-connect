import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

/**
 * /legal - a single page that bundles the old /privacy and /terms
 * content. Both sections are deep-linkable via #privacy and #terms,
 * and the old /privacy and /terms routes redirect here. One page
 * means one source of truth for policy updates.
 */

export const metadata: Metadata = {
  title: "Privacy & Terms",
  description:
    "What data we collect, how we use it, and the simple rules for using NexGen Connect during our pre-launch waitlist.",
  alternates: {
    canonical: "/legal",
  },
};

const TOC: { href: string; label: string }[] = [
  { href: "#privacy", label: "Privacy" },
  { href: "#privacy-collect", label: "1. What we collect" },
  { href: "#privacy-use", label: "2. What we do with it" },
  { href: "#privacy-share", label: "3. Who we share it with" },
  { href: "#privacy-security", label: "4. Security" },
  { href: "#privacy-rights", label: "5. Your rights" },
  { href: "#terms", label: "Terms" },
  { href: "#terms-audience", label: "1. Who this is for" },
  { href: "#terms-agree", label: "2. What we agree to" },
  { href: "#terms-ask", label: "3. What we ask of you" },
  { href: "#terms-money", label: "4. Money" },
  { href: "#terms-changes", label: "5. Changes" },
  { href: "#terms-questions", label: "6. Questions" },
];

export default function LegalPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="py-20 md:py-28">
        <div className="container-prose">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
            LEGAL
          </p>
          <h1 className="mt-6 font-heading text-5xl font-semibold leading-[1.05] tracking-[-0.025em] text-[color:var(--color-fg)]">
            Privacy &amp; Terms
          </h1>
          <p className="mt-4 font-mono text-[12px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
            Last updated &middot; April 2026 &middot; Pre-launch
          </p>
          <p className="mt-6 max-w-[620px] text-[15.5px] leading-[1.6] text-[color:var(--color-fg-muted)]">
            One page, two sections. Skim the table of contents, or read
            straight through - it&apos;s short on purpose.
          </p>

          {/* Table of contents */}
          <nav
            aria-label="Table of contents"
            className="mt-10 rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5"
          >
            <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
              On this page
            </p>
            <ul className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {TOC.map((t) => (
                <li key={t.href}>
                  <a
                    href={t.href}
                    className="text-[13.5px] text-[color:var(--color-fg-muted)] transition-colors hover:text-[color:var(--color-primary)]"
                  >
                    {t.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* PRIVACY */}
          <section
            id="privacy"
            aria-labelledby="privacy-heading"
            className="mt-16 scroll-mt-24"
          >
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-primary)]">
              Part 1
            </p>
            <h2
              id="privacy-heading"
              className="mt-3 font-heading text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-[color:var(--color-fg)]"
            >
              Privacy
            </h2>
            <p className="mt-4 text-[15.5px] leading-[1.65] text-[color:var(--color-fg-muted)]">
              We collect the minimum we need to place you in a verified
              group, and nothing else. No marketing ad networks. No sold
              lists. Ever.
            </p>

            <div className="mt-10 space-y-10 text-[16px] leading-[1.65] text-[color:var(--color-fg-muted)]">
              <section id="privacy-collect" className="scroll-mt-24">
                <h3 className="font-heading text-xl font-semibold text-[color:var(--color-fg)]">
                  1. What we collect
                </h3>
                <p className="mt-3">
                  When you join the waitlist: name, phone, home city,
                  destination university, and the September 2026 group
                  you&apos;re joining. Email if you gave it. Admit status,
                  and the admit letter you upload so a human can review it.
                </p>
                <p className="mt-3">
                  We hash your phone number before storing it. We never store
                  your Aadhaar number. Once DigiLocker is live (Aug 2026), we
                  only receive a verification token.
                </p>
                <p className="mt-3">
                  You can sign up, verify your phone, and reserve your spot
                  today. Admit letter review and DigiLocker Aadhaar happen on
                  their own timelines, as described on{" "}
                  <Link
                    href="/how"
                    className="text-[color:var(--color-primary)] underline decoration-dotted underline-offset-4 hover:text-[color:var(--color-primary-hover)]"
                  >
                    /how
                  </Link>
                  .
                </p>
              </section>

              <section id="privacy-use" className="scroll-mt-24">
                <h3 className="font-heading text-xl font-semibold text-[color:var(--color-fg)]">
                  2. What we do with it
                </h3>
                <p className="mt-3">
                  Place you in the right group. Verify you&apos;re a real
                  person heading abroad. Email you when your group fills.
                  That&apos;s it.
                </p>
              </section>

              <section id="privacy-share" className="scroll-mt-24">
                <h3 className="font-heading text-xl font-semibold text-[color:var(--color-fg)]">
                  3. Who we share it with
                </h3>
                <p className="mt-3">
                  No one, by default. We use MSG91 for phone OTP, Resend for
                  email, and (from Aug 2026) DigiLocker for Aadhaar. Each
                  sees only what they need. We will never sell your data or
                  share it with agents, consultancies, or recruiters.
                </p>
              </section>

              <section id="privacy-security" className="scroll-mt-24">
                <h3 className="font-heading text-xl font-semibold text-[color:var(--color-fg)]">
                  4. Security
                </h3>
                <p className="mt-3">
                  HTTPS everywhere. Phones are hashed at rest. Admit letters
                  are stored in a private bucket and encrypted at rest. No
                  passwords - we use phone OTP.
                </p>
              </section>

              <section id="privacy-rights" className="scroll-mt-24">
                <h3 className="font-heading text-xl font-semibold text-[color:var(--color-fg)]">
                  5. Your rights
                </h3>
                <p className="mt-3">
                  You can request a copy of everything we have on you, or a
                  complete deletion within 1 hour, by emailing{" "}
                  <a
                    href="mailto:hello@nexgenconnect.com"
                    className="text-[color:var(--color-primary)] underline decoration-dotted underline-offset-4"
                  >
                    hello@nexgenconnect.com
                  </a>
                  . Same-day reply from a real person.
                </p>
              </section>
            </div>
          </section>

          {/* Divider between parts */}
          <div
            aria-hidden="true"
            className="mx-auto mt-20 h-px w-24 bg-[color:var(--color-border)]"
          />

          {/* TERMS */}
          <section
            id="terms"
            aria-labelledby="terms-heading"
            className="mt-20 scroll-mt-24"
          >
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-primary)]">
              Part 2
            </p>
            <h2
              id="terms-heading"
              className="mt-3 font-heading text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-[color:var(--color-fg)]"
            >
              Terms
            </h2>
            <p className="mt-4 text-[15.5px] leading-[1.65] text-[color:var(--color-fg-muted)]">
              We&apos;re in pre-launch. These terms cover the September 2026
              waitlist only. When the app ships, they&apos;ll expand.
              We&apos;ll email you before they do.
            </p>

            <div className="mt-10 space-y-10 text-[16px] leading-[1.65] text-[color:var(--color-fg-muted)]">
              <section id="terms-audience" className="scroll-mt-24">
                <h3 className="font-heading text-xl font-semibold text-[color:var(--color-fg)]">
                  1. Who this is for
                </h3>
                <p className="mt-3">
                  You&apos;re 18 or older. You&apos;re an Indian student,
                  admitted or applying to UCD, Trinity, or UCC for September
                  2026. You&apos;re joining the waitlist to be introduced to
                  other students like you.
                </p>
              </section>

              <section id="terms-agree" className="scroll-mt-24">
                <h3 className="font-heading text-xl font-semibold text-[color:var(--color-fg)]">
                  2. What we agree to
                </h3>
                <p className="mt-3">
                  We&apos;ll only email you about your group and updates on
                  the product. Never spam. Never sold lists. Unsubscribe any
                  time with a reply.
                </p>
              </section>

              <section id="terms-ask" className="scroll-mt-24">
                <h3 className="font-heading text-xl font-semibold text-[color:var(--color-fg)]">
                  3. What we ask of you
                </h3>
                <p className="mt-3">
                  Be real. Don&apos;t fake an admit. Don&apos;t sign up as
                  multiple people. Don&apos;t use the waitlist to sell
                  services to other students. If you do, we&apos;ll remove
                  you.
                </p>
              </section>

              <section id="terms-money" className="scroll-mt-24">
                <h3 className="font-heading text-xl font-semibold text-[color:var(--color-fg)]">
                  4. Money
                </h3>
                <p className="mt-3">
                  Founding members pay zero. Pricing, if any, will be
                  announced before launch and before you&apos;re ever
                  charged.
                </p>
              </section>

              <section id="terms-changes" className="scroll-mt-24">
                <h3 className="font-heading text-xl font-semibold text-[color:var(--color-fg)]">
                  5. Changes
                </h3>
                <p className="mt-3">
                  If these terms change in a way that affects you,
                  we&apos;ll email you. Silence is not consent.
                </p>
              </section>

              <section id="terms-questions" className="scroll-mt-24">
                <h3 className="font-heading text-xl font-semibold text-[color:var(--color-fg)]">
                  6. Questions
                </h3>
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
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
