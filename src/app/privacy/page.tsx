import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "NexGen Connect privacy policy — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="bg-gradient-to-br from-navy via-[#1a2255] to-navy py-16 md:py-20">
          <div className="container-narrow text-center">
            <h1 className="text-4xl font-bold text-white sm:text-5xl">Privacy Policy</h1>
            <p className="mt-3 text-sm text-ice-blue/60">Last updated: April 2026</p>
          </div>
        </section>

        <section className="section-padding bg-white">
          <div className="container-narrow">
            <article className="prose prose-slate mx-auto max-w-3xl">
              <h2 className="text-2xl font-bold text-navy">1. Information We Collect</h2>
              <p className="text-text-secondary">
                When you create an account on NexGen Connect, we collect: your first name, email
                address, phone number, profile photo, origin city, destination country, university,
                intake period, hobbies, languages, and optional social handles (Instagram, LinkedIn).
              </p>
              <p className="text-text-secondary">
                For identity verification, we use a third-party KYC provider. We{" "}
                <strong>never store your government ID number</strong>. Only the verification status
                and a hashed reference from the KYC provider are retained. ID images are deleted
                immediately after verification.
              </p>

              <h2 className="mt-8 text-2xl font-bold text-navy">2. How We Use Your Information</h2>
              <p className="text-text-secondary">
                We use your information to: create and manage your account, place you in
                origin-based cohorts, enable the swipe and matching features, send you match
                notifications, and improve our service.
              </p>

              <h2 className="mt-8 text-2xl font-bold text-navy">3. Information Sharing</h2>
              <p className="text-text-secondary">
                Your profile information (name, photo, bio, hobbies, languages, university) is
                visible to other verified users in your cohort. Your Instagram handle and LinkedIn
                URL are{" "}
                <strong>only revealed to users you mutually match with</strong>.
              </p>
              <p className="text-text-secondary">
                We do not sell your personal data. We share data only with: our KYC verification
                provider (for identity verification), our payment processor (Razorpay, for
                processing payments), and our email service provider (for transactional emails).
              </p>

              <h2 className="mt-8 text-2xl font-bold text-navy">4. Data Security</h2>
              <p className="text-text-secondary">
                We use industry-standard security measures including HTTPS encryption, secure
                database hosting, and access controls. Passwords are not stored — we use phone OTP
                authentication.
              </p>

              <h2 className="mt-8 text-2xl font-bold text-navy">5. Your Rights</h2>
              <p className="text-text-secondary">
                You can: view and edit your profile at any time, delete your account and all
                associated data, request a copy of your data, and opt out of non-essential
                communications. To exercise these rights, contact us at support@nexgenconnect.com.
              </p>

              <h2 className="mt-8 text-2xl font-bold text-navy">6. Cookies &amp; Analytics</h2>
              <p className="text-text-secondary">
                We use essential cookies for authentication and session management. We use Mixpanel
                for anonymous analytics to understand how users interact with our platform. No
                advertising cookies are used.
              </p>

              <h2 className="mt-8 text-2xl font-bold text-navy">7. Contact</h2>
              <p className="text-text-secondary">
                For privacy-related questions, contact us at{" "}
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
