import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Pill } from "@/components/ui/Pill";
import { Hairline } from "@/components/ui/Hairline";
import { ProcessStep } from "@/components/shared/ProcessStep";
import { CtaButton } from "@/components/ui/CtaButton";

export const metadata: Metadata = {
  title: "Process",
  description:
    "What actually happens between joining the waitlist and meeting your cohort. Step-by-step. Honest about what's built and what's coming.",
};

const steps = [
  {
    title: "You join the waitlist",
    timing: "~30 sec",
    description:
      "Name, phone, your city in India, the university you're going to, and your intake. That's the whole form. No essay. No pitch.",
  },
  {
    title: "We verify your phone",
    timing: "~30 sec",
    description:
      "One-time passcode via SMS. We need this so the accounts you match with are attached to real people, not scripts.",
    caveat: "OTP via Twilio/MSG91 in beta. Until the integration ships, we verify manually in under 24 hours.",
  },
  {
    title: "We verify your admit",
    timing: "~48 hr",
    description:
      "Upload your official admit letter PDF. A person reads it — not an AI. We cross-check against the university's admissions page.",
    caveat: "No MOUs yet. Manual review during beta. University partnerships are in progress.",
  },
  {
    title: "We verify your identity",
    timing: "~2 min",
    description:
      "DigiLocker-based Aadhaar match. Your Aadhaar number is never stored on our servers. We keep only the verification receipt.",
  },
  {
    title: "You wait for your cohort to fill",
    timing: "~2–6 weeks",
    description:
      "9 other verified students from your city, going to your university, in your intake. We'll be honest about fill times once we have real data.",
    caveat: "We don't have reliable fill-time data yet. Beta users get weekly status updates.",
  },
  {
    title: "Cohort unlocks",
    timing: "Instant",
    description:
      "In-app profile reveal for all 10 members. Names, photos, LinkedIn, Instagram, program, residence preference. Plus a one-time WhatsApp group invite.",
    caveat: "WhatsApp invites are sent manually in beta. A person creates the group and names it.",
  },
  {
    title: "You meet in India first",
    timing: "~1 evening",
    description:
      "Most cohorts do one IRL meet in their home city before flying out. We facilitate the first one — venue, time, a founder joins if possible.",
  },
  {
    title: "You land together",
    timing: "~same week",
    description:
      "Many cohorts end up booking flights in the same window. Many split an airport pickup or the first week of temporary housing. Some don't — and that's fine too.",
  },
];

const edgeCases = [
  {
    q: "What if my admit gets revoked?",
    a: "Full data deletion within 24 hours. If you've paid (you won't have during beta, but still), full refund.",
  },
  {
    q: "What if someone in my cohort behaves badly?",
    a: "One-tap report. Instant removal from your cohort. We rematch you with the next available slot in the same city × university.",
  },
  {
    q: "What if my cohort never fills?",
    a: "If your Mumbai → TUM cohort doesn't reach 10, we'll offer you the next closest — Mumbai → RWTH, or Delhi → TUM if you're open to it. If none works, full refund.",
  },
  {
    q: "Can my parent verify me on my behalf?",
    a: "Yes. A walkthrough will live at /parent-verification once we ship it. Until then, reply to any of our emails and a person helps.",
  },
  {
    q: "What data do you store?",
    a: "Name, phone, email (optional), city, university, intake, admit letter, Aadhaar verification receipt (not Aadhaar number). That's it. Full list in /privacy.",
  },
];

export default function ProcessPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="section-y">
        <div className="container-narrow">
          <div className="max-w-[720px]">
            <Pill dot="mint">How it actually works</Pill>
            <h1 className="mt-6 font-heading text-5xl font-semibold leading-[1.05] tracking-[-0.025em] text-foreground md:text-6xl">
              What happens between you joining and meeting your nine.
            </h1>
            <p className="mt-7 text-lg leading-[1.55] text-muted-foreground">
              Parents read this page top to bottom. It&apos;s written for them.
              Nothing hidden. Where a step isn&apos;t built yet, we say so.
            </p>
          </div>

          <Hairline short className="mt-14" />

          <div className="mt-14 max-w-[720px]">
            {steps.map((step, i) => (
              <ProcessStep
                key={step.title}
                number={i + 1}
                title={step.title}
                timing={step.timing}
                description={step.description}
                caveat={step.caveat}
                last={i === steps.length - 1}
              />
            ))}
          </div>

          <Hairline short className="mt-6" />

          <div className="mt-16 max-w-[720px]">
            <h2 className="font-heading text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-foreground md:text-4xl">
              What happens if…
            </h2>
            <div className="mt-8 space-y-7">
              {edgeCases.map((ec) => (
                <div key={ec.q} className="border-t border-border pt-7 first:border-t-0 first:pt-0">
                  <p className="font-heading text-[17px] font-semibold text-foreground">
                    {ec.q}
                  </p>
                  <p className="mt-2 text-[15px] leading-[1.6] text-muted-foreground">
                    {ec.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-20 max-w-[720px] rounded-2xl border border-border bg-[#121217] p-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Still have questions?
            </p>
            <p className="mt-3 text-[16px] leading-relaxed text-foreground">
              Reply to any email you get from us, or write directly to{" "}
              <a href="mailto:aayush@nexgenconnect.com" className="underline decoration-dotted underline-offset-4 hover:text-primary">
                aayush@nexgenconnect.com
              </a>
              . Aayush reads every message. A real person. Same-day reply.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <CtaButton href="/#join" arrow>Join the WS26 waitlist</CtaButton>
              <CtaButton href="/why" variant="secondary">Why we&apos;re building this</CtaButton>
            </div>
            <p className="mt-6">
              <Link href="/founder" className="text-[13px] text-muted-foreground underline decoration-dotted underline-offset-4 hover:text-foreground">
                Read the founder story →
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
