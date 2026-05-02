import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

/**
 * /privacy — Privacy Policy. Standalone, distinct from /terms. The
 * Bucket 2 split per v16 web pivot §2 turns the previously-merged
 * /legal page into two distinct, regulator-defensible documents.
 *
 * GDPR Art. 13 + DPDP Act 2023 §6-§11 require that a privacy notice
 * tells the user, at minimum:
 *   - what personal data is collected
 *   - the lawful basis for each processing purpose
 *   - retention period per category
 *   - third parties with whom data is shared
 *   - DPO (or named contact) for queries
 *   - the right to access, rectify, erase, port, object, restrict
 *   - regulator complaint right
 *   - international transfer mechanism
 *   - children's data (if applicable)
 *   - cookie policy
 *
 * Every item above is in the document below. Lawyer review pre-launch
 * per the v16 outstanding-items list.
 *
 * v16 web pivot §2.1 + §2.2.
 */

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What data NexGen Connect collects, why, how long we keep it, and the rights you have under GDPR and India's DPDP Act 2023.",
  alternates: { canonical: "/privacy" },
};

const LAST_UPDATED = "2 May 2026";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="py-20 md:py-28">
        <div className="container-prose">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
            Privacy Policy &middot; Last updated {LAST_UPDATED}
          </p>
          <h1 className="mt-6 font-heading text-5xl font-semibold leading-[1.05] tracking-[-0.025em] text-[color:var(--color-fg)]">
            Privacy Policy
          </h1>
          <p className="mt-6 max-w-[640px] text-[16px] leading-[1.6] text-[color:var(--color-fg-muted)]">
            What we collect, the lawful basis for collecting it, how long we
            keep it, who else sees it, and the rights you have. Plain English.
            See{" "}
            <Link
              href="/terms"
              className="text-[color:var(--color-primary)] underline decoration-dotted underline-offset-4"
            >
              /terms
            </Link>{" "}
            for the binding-agreement document.
          </p>

          <div className="mt-12 space-y-8 text-[16px] leading-[1.7] text-[color:var(--color-fg-muted)]">
            {/* 1. WHAT WE COLLECT */}
            <section aria-labelledby="what-we-collect" className="scroll-mt-24" id="what-we-collect">
              <h2
                id="what-we-collect"
                className="font-heading text-2xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]"
              >
                1. What we collect
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">Phone number</strong>{" "}
                  — required for OTP verification and account anchor.
                </li>
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">Name + year-month of birth</strong>{" "}
                  — used as inputs to a one-way composite identity hash.
                  Never stored as plaintext after the hash is computed.
                </li>
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">DigiLocker verification token</strong>{" "}
                  — a signed handshake confirming you own a valid Aadhaar.
                  <strong className="font-semibold text-[color:var(--color-fg)]">
                    {" "}
                    The 12-digit Aadhaar number itself never reaches our servers.
                  </strong>
                </li>
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">Admit letter</strong>{" "}
                  — uploaded image or PDF, used by a human reviewer for
                  authenticity. Auto-deleted within 60 minutes of decision.
                </li>
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">Home city + destination + intake</strong>{" "}
                  — used to match you into the right corridor.
                </li>
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">Optional email</strong>{" "}
                  — for OTP backup, premium receipts, parent-view links.
                </li>
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">Chat content</strong>{" "}
                  — your messages inside corridors and sub-circles, until
                  you delete them.
                </li>
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">Premium payment metadata</strong>{" "}
                  — order ID, last-4 of card or UPI ID, payment timestamp.
                  No card numbers, never. Razorpay (India) holds the actual
                  payment instrument.
                </li>
              </ul>
            </section>

            {/* 2. LAWFUL BASIS */}
            <section aria-labelledby="lawful-basis" className="scroll-mt-24" id="lawful-basis">
              <h2
                id="lawful-basis"
                className="font-heading text-2xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]"
              >
                2. Lawful basis for each purpose
              </h2>
              <p className="mt-4">
                Per GDPR Art. 6 and DPDP Act §7, we identify the lawful basis
                for every processing operation:
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">Phone OTP</strong>:
                  consent + contract performance (we cannot ship the service
                  without verifying the phone owner).
                </li>
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">DigiLocker hash</strong>:
                  consent (you actively start the handshake) + legitimate
                  interest (verification anchors trust for every other user).
                </li>
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">Admit letter</strong>:
                  consent (you upload it) + legitimate interest (verification).
                </li>
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">Corridor placement data</strong>:
                  contract performance.
                </li>
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">Premium payment</strong>:
                  contract performance + legal obligation (tax records).
                </li>
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">Chat content</strong>:
                  contract performance.
                </li>
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">Trust &amp; Safety reports</strong>:
                  legitimate interest (protect the community) + legal obligation
                  in serious cases.
                </li>
              </ul>
            </section>

            {/* 3. RETENTION */}
            <section aria-labelledby="retention" className="scroll-mt-24" id="retention">
              <h2
                id="retention"
                className="font-heading text-2xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]"
              >
                3. Retention
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">Phone hash</strong>:
                  for the lifetime of your account, plus 30 days after deletion
                  for fraud prevention (re-registration ban anchored on the
                  composite identity hash).
                </li>
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">Admit letter image</strong>:
                  60 minutes after the human reviewer's decision. Hard delete.
                </li>
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">DigiLocker token</strong>:
                  the verification timestamp is preserved; the token itself is
                  deleted within 24 hours of the handshake.
                </li>
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">Chat messages</strong>:
                  90 days, or until you delete them. After your account is
                  deleted, your message body is anonymised (author shows as
                  "[deleted user]") so the conversation context for other users
                  is preserved.
                </li>
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">Audit log</strong>:
                  retained per legal obligation (typically 6 years for
                  financial records, 3 years for general). Personal identifiers
                  are replaced with a deletion token after account erasure.
                </li>
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">Premium payment records</strong>:
                  7 years (Indian Income Tax Act + GST requirements).
                </li>
              </ul>
            </section>

            {/* 4. SHARING */}
            <section aria-labelledby="sharing" className="scroll-mt-24" id="sharing">
              <h2
                id="sharing"
                className="font-heading text-2xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]"
              >
                4. Who we share data with
              </h2>
              <p className="mt-4">
                We share the minimum data necessary with these processors:
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">Supabase</strong>{" "}
                  — primary database. Hosted in Mumbai (India) for Indian users
                  and EU regions for EU users.
                </li>
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">Vercel</strong>{" "}
                  — application hosting + privacy-preserving Vercel Analytics
                  (no cookies, no personal data, no third-party tracking).
                </li>
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">MSG91</strong>{" "}
                  — SMS OTP delivery (India).
                </li>
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">DigiLocker (UIDAI / Government of India)</strong>{" "}
                  — Aadhaar verification handshake.
                </li>
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">Razorpay</strong>{" "}
                  — Premium payment processing (India).
                </li>
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">Cloudflare Images + Cloudflare Turnstile</strong>{" "}
                  — admit-letter upload and bot protection.
                </li>
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">Resend</strong>{" "}
                  — transactional email (OTP backup, receipts, parent links).
                </li>
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">Sentry</strong>{" "}
                  — error tracking, with PII scrubbed before send.
                </li>
              </ul>
              <p className="mt-4">
                We never sell data. We never share with immigration consultancies,
                recruiters, advertising networks, or universities.
              </p>
            </section>

            {/* 5. INTERNATIONAL TRANSFER */}
            <section
              aria-labelledby="international"
              className="scroll-mt-24"
              id="international"
            >
              <h2
                id="international"
                className="font-heading text-2xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]"
              >
                5. International transfers
              </h2>
              <p className="mt-4">
                EU users' data may be processed in India as part of the
                primary product (matching you with Indian-origin students). We
                use the EU's Standard Contractual Clauses (or applicable
                adequacy mechanism) as the transfer basis. India was added to
                the EU's Adequacy review queue in 2024; we will move to that
                basis when it is finalised.
              </p>
            </section>

            {/* 6. YOUR RIGHTS */}
            <section
              aria-labelledby="your-rights"
              className="scroll-mt-24"
              id="your-rights"
            >
              <h2
                id="your-rights"
                className="font-heading text-2xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]"
              >
                6. Your rights (GDPR + DPDP)
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">Access.</strong>{" "}
                  Request a complete export of your data via the in-app
                  Data Export action (post-launch) or by emailing the DPO. We
                  acknowledge within 60 minutes and deliver within 30 days.
                </li>
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">Rectification.</strong>{" "}
                  Edit your name, phone, home city, destination, intake from
                  Settings.
                </li>
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">Erasure.</strong>{" "}
                  In-app Account Deletion. Acknowledgement within 60 minutes;
                  cascade across analytics, payments, backups, and third-party
                  processors completes within 30 days (GDPR Art. 12(3) ceiling).
                </li>
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">Portability.</strong>{" "}
                  Data export delivered as a JSON archive via time-limited
                  Resend link, 24-hour expiry.
                </li>
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">Object / restrict.</strong>{" "}
                  Email the DPO. We restrict processing within 72 hours
                  pending review.
                </li>
                <li>
                  <strong className="font-semibold text-[color:var(--color-fg)]">Withdraw consent.</strong>{" "}
                  Same as Erasure for the data captured under consent.
                </li>
              </ul>
            </section>

            {/* 7. DPO */}
            <section aria-labelledby="dpo" className="scroll-mt-24" id="dpo">
              <h2
                id="dpo"
                className="font-heading text-2xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]"
              >
                7. Data Protection Officer
              </h2>
              <p className="mt-4">
                <a
                  href="mailto:dpo@nexgenconnect.com"
                  className="text-[color:var(--color-primary)] underline decoration-dotted underline-offset-4"
                >
                  dpo@nexgenconnect.com
                </a>{" "}
                — until the org grows to a size that warrants a dedicated DPO,
                Aayush Shah (founder) acts as the named contact. Real person,
                same-day reply on weekdays.
              </p>
            </section>

            {/* 8. REGULATOR COMPLAINT */}
            <section aria-labelledby="regulator" className="scroll-mt-24" id="regulator">
              <h2
                id="regulator"
                className="font-heading text-2xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]"
              >
                8. Regulator complaint right
              </h2>
              <p className="mt-4">
                You have the right to lodge a complaint with a supervisory
                authority. India: the Data Protection Board (post-DPDP
                operationalisation). EU users: your national DPA.
              </p>
            </section>

            {/* 9. CHILDREN */}
            <section aria-labelledby="children" className="scroll-mt-24" id="children">
              <h2
                id="children"
                className="font-heading text-2xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]"
              >
                9. Children
              </h2>
              <p className="mt-4">
                NexGen Connect is for users 18 and over. We do not knowingly
                collect data from anyone under 18. If we learn that a minor's
                data has been collected, we delete it immediately. No exceptions.
              </p>
            </section>

            {/* 10. COOKIES */}
            <section aria-labelledby="cookies" className="scroll-mt-24" id="cookies">
              <h2
                id="cookies"
                className="font-heading text-2xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]"
              >
                10. Cookies
              </h2>
              <p className="mt-4">
                Minimal. We use one HTTP-only authentication cookie when you
                log in. No third-party tracking, no advertising cookies, no
                analytics cookies. Vercel Analytics is privacy-preserving by
                design (no cookies, no personal data). Vercel Speed Insights
                is anonymized.
              </p>
            </section>

            {/* 11. CHANGES */}
            <section aria-labelledby="changes" className="scroll-mt-24" id="changes">
              <h2
                id="changes"
                className="font-heading text-2xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]"
              >
                11. Changes
              </h2>
              <p className="mt-4">
                If we change this policy in a way that affects you, we email
                you with the diff before it takes effect. Silence is not
                consent — you must opt in to material changes.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
