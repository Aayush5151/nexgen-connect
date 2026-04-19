import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

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
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
            LEGAL
          </p>
          <h1 className="mt-6 font-heading text-5xl font-semibold leading-[1.05] tracking-[-0.025em] text-[color:var(--color-fg)]">
            Privacy
          </h1>
          <p className="mt-4 font-mono text-[12px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
            Last updated · April 2026
          </p>

          <div className="mt-10 space-y-10 text-[16px] leading-[1.65] text-[color:var(--color-fg-muted)]">
            <section>
              <h2 className="font-heading text-xl font-semibold text-[color:var(--color-fg)]">1. What we collect</h2>
              <p className="mt-3">
                When you join the waitlist: name, phone, home city, destination
                university, and the September 2026 cohort you&apos;re joining.
                Email if you gave it. Admit status, and the admit letter you
                upload so a human can review it.
              </p>
              <p className="mt-3">
                We hash your phone number before storing it. We never store your
                Aadhaar number — once DigiLocker is live (Aug 2026), we only
                receive a verification token.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-[color:var(--color-fg)]">2. What we do with it</h2>
              <p className="mt-3">
                Place you in the right cohort. Verify you&apos;re a real person
                heading to Ireland. Email you when your cohort fills. That&apos;s it.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-[color:var(--color-fg)]">3. Who we share it with</h2>
              <p className="mt-3">
                No one, by default. We use MSG91 for phone OTP, Resend for email,
                and (from Aug 2026) DigiLocker for Aadhaar — each sees only what
                they need. We will never sell your data or share it with agents,
                consultancies, or recruiters.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-[color:var(--color-fg)]">4. Security</h2>
              <p className="mt-3">
                HTTPS everywhere. Phones are hashed at rest. Admit letters are
                stored in a private bucket and encrypted at rest. No passwords — we
                use phone OTP.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-[color:var(--color-fg)]">5. Your rights</h2>
              <p className="mt-3">
                You can request a copy of everything we have on you, or a complete
                deletion within 48 hours, by emailing{" "}
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
        </div>
      </main>
      <Footer />
    </>
  );
}
