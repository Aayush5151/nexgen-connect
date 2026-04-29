import type { Metadata } from "next";
import Link from "next/link";
import { Lock } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AppStoreBadge } from "@/components/ui/AppStoreBadge";
import { PlayStoreBadge } from "@/components/ui/PlayStoreBadge";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { EmailWaitlistForm } from "@/components/landing/EmailWaitlistForm";

export const metadata: Metadata = {
  title: "Women-only · NexGen Connect",
  description:
    "What the first 72 hours look like in a women-only corridor. Mumbai to Galway, September 2026 intake, twenty-eight verified women. The safety-shape demo behind every NexGen women-only group.",
  alternates: { canonical: "/women-only" },
};

/**
 * /women-only - walkthrough of the §3.7a Mumbai → Galway women-only
 * first-72-hours simulation from Operating Plan v14. The deck-level
 * differentiator: this is what a women-only corridor actually looks
 * like minute-by-minute, not just a "Safeguard 02" bullet.
 *
 * Audience: anxious mothers of daughters going abroad. Tone: concrete,
 * specific, walked-through. No abstractions, no marketing softeners.
 *
 * Maps to v14 §3.7a, §9.4 women-only logic (six rules), §16.29 (WO1 to
 * WO20), L8 brand promise (women-only as hard filter).
 */

type Beat = {
  time: string;
  title: string;
  body: string;
};

const BEATS: Beat[] = [
  {
    time: "T = 0",
    title: "The unlock",
    body: "Twenty-eight verified women in the Mumbai → Galway → September 2026 women-only corridor get a synchronous push: 'Your corridor is live.' The app opens to a deliberate three-card surface: see who's here, your safety settings, today's prompt. No flat avatar shuffle. Profile photos are blurred until two-sided opt-in.",
  },
  {
    time: "Hours 0 - 4",
    title: "The opener",
    body: "One scripted prompt: 'What's the one thing you want to figure out before you land in Galway?' Four emoji buttons: Housing, Airport-to-Galway, Food and dietary, Roommates. Each tap auto-forms a six-person sub-circle by worry. The Airport-to-Galway sub-circle surfaces a check-in-buddy prompt with a three-way choice: yes-with-named-buddy, yes-with-anyone-arriving-same-day, no-thanks.",
  },
  {
    time: "Hours 4 - 18",
    title: "The second prompt",
    body: "Each sub-circle gets a worry-scoped prompt. Housing: what your parents asked you to figure out. Airport: drop your arrival date and flight number, in-circle only, never the wider corridor. Roommates: sleep schedule, deal-breakers. The Airport-to-Galway sub-circle is the safety-critical one - silence at T+18h triggers a T&S advisor outreach, not just a community-lead nudge.",
  },
  {
    time: "Hours 18 - 48",
    title: "The roommate cluster + the alumna",
    body: "If the Roommates sub-circle has four-plus active members at T+24h, it spawns a women-only roommate cluster with Aadhaar plus admit-letter verified on both sides and an in-app safety contract. No NexGen-mediated money flow - clusters route to the verified PBSA partner (Galway: Mezzino Queen Street). The first Saturday at 11am IST a verified Galway-2024 or Galway-2025 alumna joins for a one-hour Q&A. Co-hosted by the IST-shift T&S advisor for the first two weeks.",
  },
  {
    time: "Hours 48 - 72",
    title: "The friendship signal + airport buddies",
    body: "By T+48h we expect at least four of the twenty-eight women to have moved a sub-circle conversation into a one-to-one DM - the friendship signal that predicts retention. By T+72h the Airport-to-Galway sub-circle commits arrival-day buddy pairings, each pair with mutual Aadhaar plus admit verified, shared flight info in-circle only, an in-app emergency contact (mom or dad with the daughter's explicit consent, parent-side passcode-protected), and a T&S advisor on-call for the IE-timezone arrival-day window.",
  },
];

type Rule = {
  rule: string;
  body: string;
};

const RULES: Rule[] = [
  {
    rule: "Hard filter, never a preference",
    body: "Toggle the women-only switch on and no Aadhaar-male profile ever appears in your feed. They cannot search you. They cannot widen into your pool. Soft filters break trust the first time they fail.",
  },
  {
    rule: "Aadhaar gender is the source of truth",
    body: "We honour self-identification with NALSA documentation or community vouch. Catfishing is binary; it cannot be averaged out.",
  },
  {
    rule: "Privacy defaults are high for every woman, regardless of toggle",
    body: "Face blur in pre-match cards. Instagram hidden until a two-step mutual reveal - her tap, his tap, then a 24-hour cooling-off window. Safety-default beats safety-optional, every time.",
  },
  {
    rule: "One-tap report, named advisor inside four hours",
    body: "No auto-resolution. No bot triage. Every harassment report routes to a named in-house Trust and Safety advisor inside four business hours. One hour for Premium, twenty-four-seven. Thirty-minute outreach attempt for imminent-harm cases, any time of day.",
  },
  {
    rule: "Identity-tied bans, not email-tied",
    body: "When someone is removed for harassment, the ban is anchored on a stable composite - name, year-month of birth, phone hash, admit HEI. A new phone number, a new email, even a re-issued Aadhaar VID will not get them back in. Email-bans are theatre.",
  },
  {
    rule: "Parent visibility is status-level, never content-level",
    body: "The Premium parent dashboard shows group size, verification status, last-active timestamp. Never names. Never DMs. Never the member list. Daughter autonomy and parent reassurance, both, not one.",
  },
];

export default function WomenOnlyPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="flex-1">
        {/* Hero */}
        <section className="pt-24 pb-12 md:pt-32 md:pb-16">
          <div className="container-narrow">
            <SectionLabel>Women-only</SectionLabel>
            <h1
              className="mt-6 max-w-[920px] font-heading font-semibold text-balance text-[color:var(--color-fg)]"
              style={{
                fontSize: "clamp(40px, 7vw, 88px)",
                lineHeight: 0.96,
                letterSpacing: "-0.035em",
              }}
            >
              Twenty-eight women.{" "}
              <span className="font-serif font-normal italic tracking-[-0.02em] text-[color:var(--color-primary)]">
                Mumbai to Galway.
              </span>{" "}
              September 2026.
            </h1>
            <p className="mt-6 max-w-[680px] text-[18px] leading-[1.55] text-[color:var(--color-fg-muted)]">
              This is the safety-shape demo behind every women-only NexGen
              corridor. Not a checklist of safeguards, an actual
              minute-by-minute walk-through of what the first seventy-two
              hours look like for a daughter who toggled the women-only
              switch on, and the mother trusting her to land safely.
            </p>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--color-fg-subtle)]">
              For the most skeptical reader in the family
            </p>
          </div>
        </section>

        {/* Why women-only differs from the general corridor */}
        <section className="section-y border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)]">
          <div className="container-narrow">
            <div className="grid gap-10 md:grid-cols-12 md:gap-16">
              <div className="md:col-span-4">
                <SectionLabel>Why this section exists</SectionLabel>
                <h2
                  className="mt-4 font-heading font-semibold text-[color:var(--color-fg)]"
                  style={{
                    fontSize: "clamp(36px, 5vw, 56px)",
                    lineHeight: 1,
                    letterSpacing: "-0.03em",
                  }}
                >
                  The safety story{" "}
                  <span className="font-serif font-normal italic tracking-[-0.02em] text-[color:var(--color-fg-muted)]">
                    is structurally different.
                  </span>
                </h2>
              </div>
              <div className="md:col-span-8">
                <p className="text-[16px] leading-[1.65] text-[color:var(--color-fg-muted)]">
                  In Ireland, sixteen percent of women aged eighteen to
                  twenty-four reported sexual harassment in the past year
                  alone (RedC Research, 2025). Across Irish higher-ed
                  institutions between 2022 and 2024, anonymous national
                  surveys recorded 55 reports of rape, 106 of sexual
                  assault, and 108 of sexual harassment.
                </p>
                <p className="mt-4 text-[16px] leading-[1.65] text-[color:var(--color-fg-muted)]">
                  The product surface a woman lands into matters.
                  WhatsApp&apos;s default - five hundred strangers, zero
                  verification, sexualised DMs from numbers nobody
                  recognises - is not a neutral starting point. The
                  women-only corridor exists because the first seventy-two
                  hours after she lands are the highest-stakes window of
                  her year abroad, and the platform she walks into needs to
                  reflect that.
                </p>
                <p className="mt-4 text-[16px] leading-[1.65] text-[color:var(--color-fg-muted)]">
                  This page is the operating contract for that window -
                  not a reassurance, an itinerary.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* The 72-hour walkthrough */}
        <section className="section-y border-t border-[color:var(--color-border)]">
          <div className="container-narrow">
            <div className="mx-auto max-w-[860px] text-center">
              <SectionLabel className="mx-auto">
                The first seventy-two hours
              </SectionLabel>
              <h2
                className="mt-6 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
                style={{
                  fontSize: "clamp(36px, 5vw, 60px)",
                  lineHeight: 1.02,
                  letterSpacing: "-0.03em",
                }}
              >
                Five beats.{" "}
                <span className="font-serif font-normal italic tracking-[-0.02em] text-[color:var(--color-primary)]">
                  Each one specific.
                </span>
              </h2>
              <p className="mx-auto mt-5 max-w-[640px] text-[15.5px] leading-[1.6] text-[color:var(--color-fg-muted)]">
                The corridor unlocks at twenty-eight verified women, smaller
                than the sixty-verified mixed cohort by design. The cadence
                is paced for safety, not speed.
              </p>
            </div>

            <ol className="mx-auto mt-14 max-w-[820px] space-y-10 md:space-y-12">
              {BEATS.map((beat, i) => (
                <li
                  key={beat.time}
                  className="grid gap-4 md:grid-cols-[140px_1fr] md:gap-10"
                >
                  <div className="flex flex-col gap-1">
                    <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-primary)]">
                      Beat {String(i + 1).padStart(2, "0")}
                    </p>
                    <p className="font-heading text-[20px] font-semibold tabular-nums tracking-[-0.01em] text-[color:var(--color-fg)] md:text-[22px]">
                      {beat.time}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-heading text-[22px] font-semibold leading-tight tracking-[-0.015em] text-[color:var(--color-fg)] md:text-[26px]">
                      {beat.title}
                    </h3>
                    <p className="mt-3 text-[15.5px] leading-[1.65] text-[color:var(--color-fg-muted)]">
                      {beat.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* The six rules */}
        <section className="section-y border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)]">
          <div className="container-narrow">
            <div className="grid gap-10 md:grid-cols-12 md:gap-16">
              <div className="md:col-span-4">
                <SectionLabel>The contract</SectionLabel>
                <h2
                  className="mt-4 font-heading font-semibold text-[color:var(--color-fg)]"
                  style={{
                    fontSize: "clamp(36px, 5vw, 60px)",
                    lineHeight: 1,
                    letterSpacing: "-0.03em",
                  }}
                >
                  Six rules.{" "}
                  <span className="font-serif font-normal italic tracking-[-0.02em] text-[color:var(--color-fg-muted)]">
                    All hard, never soft.
                  </span>
                </h2>
                <p className="mt-5 text-[15px] leading-[1.6] text-[color:var(--color-fg-muted)]">
                  Each rule is in the operating plan and in the product.
                  Breaking any of them is a brand-level event with a
                  founder-signed public post-mortem.
                </p>
              </div>
              <div className="md:col-span-8">
                <ul className="divide-y divide-[color:var(--color-border)] border-y border-[color:var(--color-border)]">
                  {RULES.map((rule, i) => (
                    <li
                      key={rule.rule}
                      className="grid gap-4 py-7 md:grid-cols-[28px_1fr] md:gap-6"
                    >
                      <div className="flex items-start gap-2">
                        <Lock
                          className="mt-1 h-4 w-4 text-[color:var(--color-primary)]"
                          strokeWidth={2}
                        />
                        <span className="font-mono text-[11px] tabular-nums text-[color:var(--color-fg-subtle)] md:hidden">
                          0{i + 1}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-heading text-[18px] font-semibold leading-tight text-[color:var(--color-fg)] md:text-[19px]">
                          {rule.rule}
                        </h3>
                        <p className="mt-2 text-[15px] leading-[1.6] text-[color:var(--color-fg-muted)]">
                          {rule.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* What the corridor costs you, what it does not */}
        <section className="section-y border-t border-[color:var(--color-border)]">
          <div className="container-narrow">
            <div className="mx-auto max-w-[820px] text-center">
              <SectionLabel className="mx-auto">No catches</SectionLabel>
              <h2
                className="mt-6 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
                style={{
                  fontSize: "clamp(34px, 5vw, 54px)",
                  lineHeight: 1.02,
                  letterSpacing: "-0.03em",
                }}
              >
                The women-only corridor is{" "}
                <span className="font-serif font-normal italic tracking-[-0.02em] text-[color:var(--color-primary)]">
                  free, forever.
                </span>
              </h2>
              <p className="mx-auto mt-6 max-w-[680px] text-[16px] leading-[1.6] text-[color:var(--color-fg-muted)]">
                Verification, corridor placement, group DMs, the airport
                buddy flow, the Saturday alumna call, the women-only
                roommate cluster routing - all of it lives in the free
                tier. We pay for the floor. The floor is free because
                it&rsquo;s where you find each other. Premium and the PBSA
                operators pay our bills, never students. (See the{" "}
                <Link
                  href="/legal#privacy"
                  className="text-[color:var(--color-primary)] underline decoration-dotted underline-offset-4"
                >
                  privacy and pricing details
                </Link>{" "}
                for the receipts.)
              </p>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="section-y border-t border-[color:var(--color-border)]">
          <div className="container-narrow text-center">
            <h2
              className="mx-auto max-w-[760px] font-heading font-semibold text-balance text-[color:var(--color-fg)]"
              style={{
                fontSize: "clamp(36px, 5.5vw, 64px)",
                lineHeight: 0.98,
                letterSpacing: "-0.03em",
              }}
            >
              Reserve her spot in the{" "}
              <span className="font-serif font-normal italic tracking-[-0.02em] text-[color:var(--color-fg-muted)]">
                women-only corridor.
              </span>
            </h2>
            <p className="mx-auto mt-5 max-w-[520px] text-[15.5px] leading-[1.6] text-[color:var(--color-fg-muted)]">
              Free to verify. Free to be matched. Premium and PBSA pay our
              bills, never students. We email you the moment her corridor
              opens - Mumbai to Galway September 2026, Delhi to Munich
              October 2026, every Indian-city to Irish or German city
              corridor we run.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <AppStoreBadge size="md" />
              <PlayStoreBadge size="md" />
            </div>
            <div className="mt-10">
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
                Or reserve her spot - free
              </p>
              <div className="mx-auto w-full max-w-[420px]">
                <EmailWaitlistForm referrer="women-only" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
