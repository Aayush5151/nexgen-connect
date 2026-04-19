import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectionLabel } from "@/components/ui/SectionLabel";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "Four verification checks, a forty-eight-hour review, and no shortcuts. Here's exactly how NexGen Connect verifies every student before they land in Ireland.",
};

const STEPS = [
  {
    idx: "01",
    duration: "Under a minute",
    title: "Your admit letter",
    body: "You upload the PDF from UCD, Trinity College Dublin, or University College Cork. Those are the only three we accept for September 2026. The file is encrypted the moment it leaves your phone and stored in a private bucket only our verification team can read.",
  },
  {
    idx: "02",
    duration: "Under a minute",
    title: "A government ID",
    body: "Aadhaar, PAN, driver's licence, or passport — whichever you already have handy. DigiLocker auto-fetch is landing in August 2026; until then, you upload the image yourself and we compare the name against your admit letter.",
  },
  {
    idx: "03",
    duration: "Within 48 hours",
    title: "A human review",
    body: "A real person on our team cross-checks your admit letter, your ID, and your university-issued email address. If anything doesn't line up, we email you before anything else happens. No auto-approvals, no bots signing off on documents they can't actually read.",
  },
  {
    idx: "04",
    duration: "The moment it's done",
    title: "Your cohort unlocks",
    body: "You see the verified students from your city going to your university. They see you. You exchange Instagrams only after a mutual match. You report anyone in one tap. Nothing is ever forwarded to a WhatsApp group.",
  },
];

const SAFETY = [
  {
    title: "Phone numbers are stored as hashes.",
    body: "We never hold your mobile number in plain text. The OTP flow uses a separate pepper so leaked phone hashes can't be correlated with the OTP table.",
  },
  {
    title: "Instagram is the last thing that gets shared.",
    body: "You don't pick a profile photo, you don't write a bio, and your socials don't reveal until both sides have tapped match. Verification proves you're real — we don't need you to perform.",
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
              Verified the way your mother would.
            </h1>
            <p className="mt-6 max-w-[620px] text-[18px] leading-[1.55] text-[color:var(--color-fg-muted)]">
              Four checks. Roughly forty-eight hours. No shortcuts. Here is
              exactly what happens between the moment you start and the moment
              your cohort opens up.
            </p>
          </div>
        </section>

        <section className="section-y border-t border-[color:var(--color-border)]">
          <div className="container-narrow">
            <ol className="grid gap-10">
              {STEPS.map((s) => (
                <li
                  key={s.idx}
                  className="grid gap-6 border-t border-[color:var(--color-border)] pt-8 md:grid-cols-[140px_1fr] md:gap-12 md:pt-10"
                >
                  <div>
                    <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                      Step {s.idx}
                    </p>
                    <p className="mt-1 font-mono text-[13px] text-[color:var(--color-fg-muted)]">
                      {s.duration}
                    </p>
                  </div>
                  <div className="max-w-[640px]">
                    <h2 className="font-heading text-[24px] font-semibold leading-tight text-[color:var(--color-fg)] md:text-[28px]">
                      {s.title}
                    </h2>
                    <p className="mt-3 text-[16px] leading-[1.65] text-[color:var(--color-fg-muted)]">
                      {s.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section-y border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)]">
          <div className="container-narrow">
            <div className="grid gap-10 md:grid-cols-12 md:gap-16">
              <div className="md:col-span-4">
                <SectionLabel>Safety architecture</SectionLabel>
                <h2 className="mt-4 font-heading text-[32px] font-semibold leading-[1.05] tracking-[-0.02em] text-[color:var(--color-fg)] md:text-[40px]">
                  Built for parents.
                  <br />
                  Still fast for you.
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
            <h2 className="mx-auto max-w-[620px] font-heading text-[32px] font-semibold leading-[1.05] tracking-[-0.025em] text-[color:var(--color-fg)] md:text-[44px]">
              Forty-eight hours between you and your cohort.
            </h2>
            <Link
              href="/#reserve"
              className="mt-10 inline-flex h-14 items-center justify-center gap-2 rounded-[10px] bg-[color:var(--color-primary)] px-8 text-[15px] font-medium text-[color:var(--color-primary-fg)] transition-colors hover:bg-[color:var(--color-primary-hover)]"
            >
              Reserve my spot — free
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
