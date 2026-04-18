import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Pill } from "@/components/ui/Pill";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What data we collect, what we don't, and what we'll never do with it.",
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="py-20 md:py-28">
        <div className="container-prose">
          <Pill dot="muted">Legal</Pill>
          <h1 className="mt-6 font-heading text-5xl font-semibold leading-[1.05] tracking-[-0.025em] text-foreground">
            Privacy
          </h1>
          <p className="mt-4 font-mono text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
            Last updated · April 2026
          </p>

          <div className="mt-10 space-y-10 text-[16px] leading-[1.65] text-muted-foreground">
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">1. What we collect</h2>
              <p className="mt-3">
                When you join the waitlist: name, phone, city, university, intake.
                Email if you gave it. Nothing else.
              </p>
              <p className="mt-3">
                After you verify in the app: your admit letter (we delete the PDF
                after review), your DigiLocker Aadhaar verification receipt (we
                never store your Aadhaar number itself).
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">2. What we do with it</h2>
              <p className="mt-3">
                Place you in the right cohort. Verify you&apos;re real. Email you
                when your cohort fills. That&apos;s it.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">3. Who we share it with</h2>
              <p className="mt-3">
                No one, by default. We use a phone OTP provider (Twilio/MSG91)
                and DigiLocker for Aadhaar — they see only what they need.
                We will never sell your data or share it with agents, consultancies,
                or recruiters.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">4. Security</h2>
              <p className="mt-3">
                HTTPS everywhere. Passwords aren&apos;t a thing — we use phone OTP.
                Admit letters are deleted after review. Aadhaar number is never
                stored.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">5. Your rights</h2>
              <p className="mt-3">
                You can request a copy of everything we have on you, or a complete
                deletion, by emailing{" "}
                <a href="mailto:aayush@nexgenconnect.com" className="text-primary underline decoration-dotted underline-offset-4">
                  aayush@nexgenconnect.com
                </a>
                . Same-day reply from a real person.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
