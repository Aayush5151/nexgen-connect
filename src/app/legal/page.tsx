import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

/**
 * /legal - privacy + terms on one page. Plain prose, no TOC, no
 * "Part 1/Part 2" ceremony. Each topic is one paragraph with a bold
 * lead-in, so the page reads like a founder note, not a contract.
 * The old /privacy and /terms routes redirect here.
 */

export const metadata: Metadata = {
  title: "Privacy & Terms",
  description:
    "What data we collect, how we use it, and the simple rules for the NexGen Connect waitlist.",
  alternates: {
    canonical: "/legal",
  },
};

export default function LegalPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="py-20 md:py-28">
        <div className="container-prose">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
            Legal &middot; April 2026
          </p>
          <h1 className="mt-6 font-heading text-5xl font-semibold leading-[1.05] tracking-[-0.025em] text-[color:var(--color-fg)]">
            Privacy &amp; Terms
          </h1>
          <p className="mt-6 max-w-[560px] text-[16px] leading-[1.6] text-[color:var(--color-fg-muted)]">
            Short on purpose. Written in plain English, so it actually says
            what we mean.
          </p>

          {/* PRIVACY */}
          <section
            id="privacy"
            aria-labelledby="privacy-heading"
            className="mt-16 scroll-mt-24"
          >
            <h2
              id="privacy-heading"
              className="font-heading text-3xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]"
            >
              Privacy
            </h2>

            <div className="mt-6 space-y-5 text-[16px] leading-[1.7] text-[color:var(--color-fg-muted)]">
              <p>
                <strong className="font-semibold text-[color:var(--color-fg)]">
                  What we collect.
                </strong>{" "}
                Name, phone, home city, destination university, and the
                intake you&apos;re joining - September 2026 for the Ireland
                corridor, October 2026 for Germany. Email if you gave it.
                Your admit letter if you uploaded one.
              </p>

              <p>
                <strong className="font-semibold text-[color:var(--color-fg)]">
                  What we do with it.
                </strong>{" "}
                Place you in the right group. Check you&apos;re a real person
                heading abroad. Email you when your group fills. Nothing
                else.
              </p>

              <p>
                <strong className="font-semibold text-[color:var(--color-fg)]">
                  What we never do.
                </strong>{" "}
                Sell your data. Share it with agents, consultancies, or
                recruiters. Send you marketing you didn&apos;t ask for.
              </p>

              <p>
                <strong className="font-semibold text-[color:var(--color-fg)]">
                  How we protect it.
                </strong>{" "}
                Phone numbers are hashed. Admit letters are encrypted. HTTPS
                everywhere. No passwords - we use phone OTP. When DigiLocker
                goes live, we only store a verification token; we never
                store your Aadhaar number.
              </p>

              <p>
                <strong className="font-semibold text-[color:var(--color-fg)]">
                  Your rights.
                </strong>{" "}
                Email{" "}
                <a
                  href="mailto:hello@nexgenconnect.com"
                  className="text-[color:var(--color-primary)] underline decoration-dotted underline-offset-4"
                >
                  hello@nexgenconnect.com
                </a>{" "}
                for a copy of everything we have on you, or a full deletion.
                Same-day reply from a real person.
              </p>

              <p>
                <strong className="font-semibold text-[color:var(--color-fg)]">
                  How signup works.
                </strong>{" "}
                You can sign up, verify your phone, and reserve your spot
                today. Admit letter review and DigiLocker run on their own
                timelines - see{" "}
                <Link
                  href="/how"
                  className="text-[color:var(--color-primary)] underline decoration-dotted underline-offset-4"
                >
                  /how
                </Link>
                .
              </p>
            </div>
          </section>

          {/* Divider */}
          <div
            aria-hidden="true"
            className="mx-auto mt-16 h-px w-24 bg-[color:var(--color-border)]"
          />

          {/* TERMS */}
          <section
            id="terms"
            aria-labelledby="terms-heading"
            className="mt-16 scroll-mt-24"
          >
            <h2
              id="terms-heading"
              className="font-heading text-3xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]"
            >
              Terms
            </h2>
            <p className="mt-4 max-w-[560px] text-[15px] leading-[1.6] text-[color:var(--color-fg-subtle)]">
              Pre-launch. These cover the 2026 waitlist for both launch
              corridors - Ireland (September) and Germany (October).
              We&apos;ll email you before they expand.
            </p>

            <div className="mt-6 space-y-5 text-[16px] leading-[1.7] text-[color:var(--color-fg-muted)]">
              <p>
                <strong className="font-semibold text-[color:var(--color-fg)]">
                  Who this is for.
                </strong>{" "}
                You&apos;re 18 or older, an Indian student admitted or
                applying for one of our launch corridors - UCD, Trinity, or
                UCC for September 2026; TUM, LMU, RWTH Aachen, or Humboldt
                for October 2026.
              </p>

              <p>
                <strong className="font-semibold text-[color:var(--color-fg)]">
                  What we agree to.
                </strong>{" "}
                Only email you about your group and product updates. Never
                spam. Unsubscribe any time with a reply.
              </p>

              <p>
                <strong className="font-semibold text-[color:var(--color-fg)]">
                  What we ask of you.
                </strong>{" "}
                Be real. Don&apos;t fake an admit. Don&apos;t sign up as
                multiple people. Don&apos;t use the waitlist to sell
                services to other students. If you do, we&apos;ll remove
                you.
              </p>

              <p>
                <strong className="font-semibold text-[color:var(--color-fg)]">
                  Money.
                </strong>{" "}
                The core product is free, forever — corridor matching,
                three-check verification, group DMs once 60 verified
                students share your corridor, uni subgroups, and the
                pre-flight countdown. Premium is a one-time &#8377;1,499
                unlock, at your option. It adds four things: priority
                matching (first seat when your corridor unlocks),
                group-apply apartment tooling (a bundled 3–6 student PBSA
                application), a read-only Parent view (group size,
                verification, arrival time — never your chats), and a
                30-minute human call within 24 hours of any question.
                Never a subscription. Never auto-renewed. You&apos;ll
                always see the charge before it&apos;s placed.
              </p>

              <p>
                <strong className="font-semibold text-[color:var(--color-fg)]">
                  Changes.
                </strong>{" "}
                If these terms change in a way that affects you, we&apos;ll
                email you. Silence is not consent.
              </p>

              <p>
                <strong className="font-semibold text-[color:var(--color-fg)]">
                  Questions.
                </strong>{" "}
                <a
                  href="mailto:hello@nexgenconnect.com"
                  className="text-[color:var(--color-primary)] underline decoration-dotted underline-offset-4"
                >
                  hello@nexgenconnect.com
                </a>
                . A real person reads every message.
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
