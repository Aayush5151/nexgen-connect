import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

/**
 * /terms — Terms of Service. Standalone, distinct from /privacy. The
 * Bucket 2 split per v16 web pivot §2 turns the previously-merged
 * /legal page into two distinct, regulator-defensible documents.
 *
 * Required binding-language items per v16 §2.3:
 *   - Acceptance
 *   - Eligibility
 *   - Account behaviour
 *   - Premium (payment terms, refund policy, auto-renew status)
 *   - Termination
 *   - Liability cap
 *   - Governing law
 *   - Dispute resolution
 *
 * Lawyer review pre-launch per v16 outstanding-items.
 *
 * v16 web pivot §2.1 + §2.3.
 */

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The binding agreement for using NexGen Connect — eligibility, payment terms, refund policy, liability cap, and governing law.",
  alternates: { canonical: "/terms" },
};

const LAST_UPDATED = "2 May 2026";

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="py-20 md:py-28">
        <div className="container-prose">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
            Terms of Service &middot; Last updated {LAST_UPDATED}
          </p>
          <h1 className="mt-6 font-heading text-5xl font-semibold leading-[1.05] tracking-[-0.025em] text-[color:var(--color-fg)]">
            Terms of Service
          </h1>
          <p className="mt-6 max-w-[640px] text-[16px] leading-[1.6] text-[color:var(--color-fg-muted)]">
            The binding agreement between you and NexGen Connect. Plain English,
            not 40 pages. See{" "}
            <Link
              href="/privacy"
              className="text-[color:var(--color-primary)] underline decoration-dotted underline-offset-4"
            >
              /privacy
            </Link>{" "}
            for what we collect and your rights.
          </p>

          <div className="mt-12 space-y-8 text-[16px] leading-[1.7] text-[color:var(--color-fg-muted)]">
            {/* 1. ACCEPTANCE */}
            <section aria-labelledby="acceptance" className="scroll-mt-24" id="acceptance">
              <h2
                id="acceptance"
                className="font-heading text-2xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]"
              >
                1. Acceptance
              </h2>
              <p className="mt-4">
                By creating an account or signing the waitlist, you agree to
                these terms. If you don't agree, don't sign up. The terms in
                effect at the time of your action bind you.
              </p>
            </section>

            {/* 2. ELIGIBILITY */}
            <section aria-labelledby="eligibility" className="scroll-mt-24" id="eligibility">
              <h2
                id="eligibility"
                className="font-heading text-2xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]"
              >
                2. Eligibility
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li>You are at least 18 years old.</li>
                <li>
                  You are an Indian student admitted (or in process of being
                  admitted) to one of our launch corridors — Ireland (Sept
                  2026 intake) or Germany (Oct 2026 intake).
                </li>
                <li>
                  You will pass the three-check verification: phone OTP,
                  DigiLocker handshake, admit-letter human review.
                </li>
              </ul>
            </section>

            {/* 3. ACCOUNT BEHAVIOUR */}
            <section
              aria-labelledby="account-behaviour"
              className="scroll-mt-24"
              id="account-behaviour"
            >
              <h2
                id="account-behaviour"
                className="font-heading text-2xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]"
              >
                3. Account behaviour
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">One account per person.</strong>{" "}
                  Identity-tied bans (anchored on the composite identity hash)
                  prevent re-registration with a different phone or email.
                </li>
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">No impersonation.</strong>{" "}
                  Faking an admit, masquerading as another person, or
                  registering under a name you don't own results in immediate
                  removal.
                </li>
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">No resale.</strong>{" "}
                  You cannot sell, lease, or transfer your account.
                </li>
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">No solicitation.</strong>{" "}
                  Don't use the corridor or sub-circles to sell services to
                  other students. Immigration consultants, recruiters, and
                  agents are not welcome.
                </li>
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">Be decent.</strong>{" "}
                  Harassment, threats, or abusive behaviour against other
                  users routes through Trust &amp; Safety with up to 1-hour SLA
                  (women-only sub-thread) or 4-hour SLA (general).
                </li>
              </ul>
            </section>

            {/* 4. PREMIUM */}
            <section aria-labelledby="premium" className="scroll-mt-24" id="premium">
              <h2
                id="premium"
                className="font-heading text-2xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]"
              >
                4. Premium (₹999, one-time)
              </h2>
              <p className="mt-4">
                The core product is free, forever — corridor matching, three-
                check verification, group DMs once 60 verified students share
                your corridor, uni subgroups, and the pre-flight countdown.
              </p>
              <p className="mt-4">
                Premium is a <strong className="font-semibold text-[color:var(--color-fg)]">one-time
                ₹999 unlock</strong>. Never a subscription. Never auto-renewed.
                You'll always see the charge before it's placed. It adds:
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li>
                  Priority matching — first seat when your corridor unlocks.
                </li>
                <li>
                  Group-apply apartment tooling — bundled 3-6 student PBSA
                  application in one signature flow.
                </li>
                <li>
                  Read-only Parent view — group size, verification status,
                  arrival time. Never your chats.
                </li>
                <li>
                  30-minute human call within 24 hours of any question.
                </li>
              </ul>

              <h3 className="mt-8 font-heading text-xl font-semibold tracking-[-0.01em] text-[color:var(--color-fg)]">
                4.1 Refund policy
              </h3>
              <p className="mt-4">
                Premium is refundable in five situations, no fine-print games:
              </p>
              <ol className="mt-4 list-decimal space-y-2 pl-6">
                <li>
                  Within 7 days of payment, no questions asked, full ₹999 refund.
                </li>
                <li>
                  If a Trust &amp; Safety review confirms harassment by another
                  user against you, full refund regardless of when you paid.
                </li>
                <li>
                  If your corridor never unlocks within 8 weeks of payment,
                  full refund plus a free bridge to the nearest viable corridor.
                </li>
                <li>
                  Compassionate refund (full or prorated, our discretion in
                  your favour) for visa rejection, documented medical emergency,
                  family emergency, or a clinically reviewed mental-health
                  concern that prevents travel.
                </li>
                <li>
                  Prorated refund if you used Premium for less than 30 days
                  and your corridor disbanded.
                </li>
              </ol>
              <p className="mt-4">
                Email{" "}
                <a
                  href="mailto:hello@nexgenconnect.com"
                  className="text-[color:var(--color-primary)] underline decoration-dotted underline-offset-4"
                >
                  hello@nexgenconnect.com
                </a>
                . Refund processed via the original payment method (Razorpay
                India), typically 5-7 working days. We never auto-renew, so
                there is nothing to cancel; you simply ask for a refund.
              </p>
            </section>

            {/* 5. TERMINATION */}
            <section aria-labelledby="termination" className="scroll-mt-24" id="termination">
              <h2
                id="termination"
                className="font-heading text-2xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]"
              >
                5. Termination
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">By you:</strong>{" "}
                  delete your account at any time via Settings → Account →
                  Delete (post-launch) or by emailing the DPO. 60-minute
                  acknowledgement, 30-day cascade deletion across analytics,
                  payment processors, and backups.
                </li>
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">By us:</strong>{" "}
                  we can suspend or terminate your account for breach of these
                  terms, with notice when feasible and immediately for
                  imminent harm. Premium refund applies per §4.1 if termination
                  was not for cause.
                </li>
              </ul>
            </section>

            {/* 6. LIABILITY CAP */}
            <section aria-labelledby="liability" className="scroll-mt-24" id="liability">
              <h2
                id="liability"
                className="font-heading text-2xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]"
              >
                6. Liability cap
              </h2>
              <p className="mt-4">
                Our aggregate liability to you for any cause whatsoever is
                limited to the fees you paid us in the 12 months preceding the
                claim. For free-tier users that's ₹0. For Premium users that's
                ₹999. Nothing in these terms limits liability for fraud, gross
                negligence, or anything else that cannot be limited by law.
              </p>
            </section>

            {/* 7. GOVERNING LAW */}
            <section
              aria-labelledby="governing-law"
              className="scroll-mt-24"
              id="governing-law"
            >
              <h2
                id="governing-law"
                className="font-heading text-2xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]"
              >
                7. Governing law
              </h2>
              <p className="mt-4">
                These terms are governed by the laws of India. Mumbai courts
                have exclusive jurisdiction (subject to §8 below).
              </p>
            </section>

            {/* 8. DISPUTE RESOLUTION */}
            <section
              aria-labelledby="disputes"
              className="scroll-mt-24"
              id="disputes"
            >
              <h2
                id="disputes"
                className="font-heading text-2xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]"
              >
                8. Dispute resolution
              </h2>
              <p className="mt-4">
                Any dispute that cannot be resolved by good-faith negotiation
                within 30 days will be referred to arbitration under the Indian
                Arbitration and Conciliation Act 1996, before a sole arbitrator
                appointed mutually. Seat: Mumbai. Language: English. The
                arbitrator's award is final and binding.
              </p>
            </section>

            {/* 9. CHANGES */}
            <section aria-labelledby="changes" className="scroll-mt-24" id="changes">
              <h2
                id="changes"
                className="font-heading text-2xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]"
              >
                9. Changes
              </h2>
              <p className="mt-4">
                If these terms change in a way that affects you, we email you
                with the diff before it takes effect. Silence is not consent —
                you must opt in to material changes.
              </p>
            </section>

            {/* 10. CONTACT */}
            <section aria-labelledby="contact" className="scroll-mt-24" id="contact">
              <h2
                id="contact"
                className="font-heading text-2xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]"
              >
                10. Contact
              </h2>
              <p className="mt-4">
                <a
                  href="mailto:hello@nexgenconnect.com"
                  className="text-[color:var(--color-primary)] underline decoration-dotted underline-offset-4"
                >
                  hello@nexgenconnect.com
                </a>{" "}
                — a real person reads every message.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
