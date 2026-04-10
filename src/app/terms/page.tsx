import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "NexGen Connect terms of service: rules and guidelines for using our platform.",
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="bg-gradient-to-br from-navy via-[#1a2255] to-navy py-16 md:py-20">
          <div className="container-narrow text-center">
            <h1 className="text-4xl font-bold text-white sm:text-5xl">Terms of Service</h1>
            <p className="mt-3 text-sm text-ice-blue/60">Last updated: April 2026</p>
          </div>
        </section>

        <section className="section-padding bg-white">
          <div className="container-narrow">
            <article className="prose prose-slate mx-auto max-w-3xl">
              <h2 className="text-2xl font-bold text-navy">1. Acceptance of Terms</h2>
              <p className="text-text-secondary">
                By accessing or using NexGen Connect, you agree to be bound by these Terms of
                Service. If you do not agree, you may not use our platform.
              </p>

              <h2 className="mt-8 text-2xl font-bold text-navy">2. Eligibility</h2>
              <p className="text-text-secondary">
                You must be at least 18 years old and an Indian student (or prospective student)
                planning to study abroad to use NexGen Connect. You must provide accurate information
                during registration and verification.
              </p>

              <h2 className="mt-8 text-2xl font-bold text-navy">3. Account &amp; Verification</h2>
              <p className="text-text-secondary">
                You must complete phone, email, and government ID verification to access the
                platform. You are responsible for maintaining the security of your account. You may
                not create multiple accounts or impersonate others.
              </p>

              <h2 className="mt-8 text-2xl font-bold text-navy">4. Acceptable Use</h2>
              <p className="text-text-secondary">You agree not to:</p>
              <ul className="text-text-secondary">
                <li>Use the platform for any illegal purpose</li>
                <li>Harass, bully, or threaten other users</li>
                <li>Upload inappropriate, offensive, or misleading content</li>
                <li>Create fake profiles or misrepresent your identity</li>
                <li>Use automated tools to access the platform</li>
                <li>Attempt to circumvent verification or payment systems</li>
                <li>Solicit users for commercial purposes (agents, consultants, etc.)</li>
              </ul>

              <h2 className="mt-8 text-2xl font-bold text-navy">5. Payments &amp; Refunds</h2>
              <p className="text-text-secondary">
                The unlock fee is a one-time payment that grants lifetime access to your intake
                cohort. Refunds are available within 7 days of payment if you have not used the
                swipe feature. After 7 days or first swipe, all payments are final.
              </p>

              <h2 className="mt-8 text-2xl font-bold text-navy">6. Content &amp; Conduct</h2>
              <p className="text-text-secondary">
                You retain ownership of content you upload (photos, bio, etc.). By uploading, you
                grant NexGen Connect a non-exclusive license to display it within the platform.
                We reserve the right to remove any content that violates these terms.
              </p>

              <h2 className="mt-8 text-2xl font-bold text-navy">7. Termination</h2>
              <p className="text-text-secondary">
                We may suspend or terminate your account for violating these terms. You may delete
                your account at any time through the settings page. Upon deletion, your profile data
                is permanently removed.
              </p>

              <h2 className="mt-8 text-2xl font-bold text-navy">8. Limitation of Liability</h2>
              <p className="text-text-secondary">
                NexGen Connect is provided &quot;as is&quot;. We do not guarantee specific outcomes
                from using the platform. We are not liable for interactions between users outside the
                platform.
              </p>

              <h2 className="mt-8 text-2xl font-bold text-navy">9. Contact</h2>
              <p className="text-text-secondary">
                For questions about these terms, contact us at{" "}
                <a href="mailto:support@nexgenconnect.com" className="text-coral hover:underline">
                  support@nexgenconnect.com
                </a>
                .
              </p>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
