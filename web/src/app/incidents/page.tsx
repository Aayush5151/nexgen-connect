import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

/**
 * /incidents — the public incident log.
 *
 * The proactive-trust-posture move. Cloudflare publishes every
 * incident, every outage, every postmortem. Wise publishes every
 * fraud attempt blocked. Stripe publishes a status page. The act of
 * having this page — even when empty — signals: this company expects
 * to be transparent when bad things happen.
 *
 * Policy is stated up-front so future incidents land into a known
 * frame. The page becomes more credible *over time* because it tells
 * the truth, including the unflattering parts.
 *
 * v18 category-presence pass · Mechanism 4 (asymmetric vulnerability).
 */

export const metadata: Metadata = {
  title: "Incidents",
  description:
    "Public incident log for NexGen Connect. Scam attempts blocked, system outages, T&S response times. Updated as events happen.",
  alternates: { canonical: "/incidents" },
  openGraph: {
    title: "Incidents · NexGen Connect",
    description:
      "Public incident log. Scams blocked, outages, T&S response times. Transparency posture from day one.",
    url: "/incidents",
    type: "website",
  },
};

const POLICY = [
  {
    n: "01",
    title: "What we publish",
    body:
      "Every scam attempt our verification layer blocked, with the date, the pattern, and what we changed in response. Every system outage longer than 60 seconds. Every Trust & Safety incident that resulted in a member being removed, including the category (harassment, impersonation, agent-in-corridor). Every data-handling near-miss, even ones the user never noticed.",
  },
  {
    n: "02",
    title: "What we do not publish",
    body:
      "Individual members' personal information. The content of private messages. The identity of the user who reported an incident. Anything that would identify a victim. Aggregate patterns appear; specific people do not, unless they consent in writing.",
  },
  {
    n: "03",
    title: "Cadence",
    body:
      "Incidents are added to this page within 72 hours of resolution. If an incident is still active, a placeholder entry appears within 24 hours noting that we are aware and working on it. The quarterly founder letter summarises the quarter's incidents in plain English.",
  },
  {
    n: "04",
    title: "When we got it wrong",
    body:
      "If an incident was the result of our own failure — a verification gap, a missed report, a system mistake — we say so plainly. We do not soften, redirect, or attribute. The annual letter has a dedicated 'what we got wrong' section that lives forever.",
  },
] as const;

export default function IncidentsPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="flex-1 pb-32">
        {/* Hero */}
        <section className="pt-20 sm:pt-28 md:pt-32">
          <div className="container-narrow">
            <div className="mx-auto max-w-[760px]">
              <p className="label-eyebrow text-[color:var(--color-fg-subtle)]">
                Incidents
              </p>
              <h1 className="mt-6 display-xl text-[color:var(--color-fg)]">
                What happened, and{" "}
                <span className="font-serif font-normal italic tracking-[-0.02em] text-[color:var(--color-primary)]">
                  what we did about it.
                </span>
              </h1>
              <p className="mt-7 body-lg text-[color:var(--color-fg-muted)]">
                A public log of scam attempts our verification layer
                blocked, system outages longer than 60 seconds, and Trust
                &amp; Safety incidents that resulted in removals. Updated
                as events happen. This page is meant to age well, not to
                look empty.
              </p>
            </div>
          </div>
        </section>

        {/* Current state — the "empty page" treatment.
            Treated as a status, not as marketing. Mono uppercase,
            green presence dot. */}
        <section className="mt-16 sm:mt-24">
          <div className="container-narrow">
            <div className="mx-auto max-w-[760px]">
              <div className="card relative overflow-hidden p-8 sm:p-10">
                <div className="flex items-center gap-3">
                  <span className="presence-dot" aria-hidden="true" />
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-primary)]">
                    Status · operating
                  </p>
                </div>
                <p className="mt-6 title-xl text-[color:var(--color-fg)]">
                  No public incidents to date.
                </p>
                <p className="mt-4 body-md text-[color:var(--color-fg-muted)]">
                  The verification layer is live. The corridors are
                  filling. Pre-launch operations have logged zero member
                  incidents because there are not yet enough verified
                  members for incidents to occur. When the first one
                  happens, the entry appears here within 72 hours of
                  resolution. We expect this page to fill up — that is
                  what running a real product looks like — and we will
                  not be quiet when it does.
                </p>
                <p className="mt-6 font-mono text-[10.5px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
                  Last reviewed · 12 May 2026
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Policy — how the page works. The promises about transparency
            land here so future visitors arriving via Google ("nexgen
            incident", "nexgen outage") see the discipline up front. */}
        <section className="mt-20 sm:mt-28">
          <div className="container-narrow">
            <div className="mx-auto max-w-[820px]">
              <p className="label-eyebrow text-[color:var(--color-fg-subtle)]">
                How this page works
              </p>

              <ol className="mt-10 flex flex-col divide-y divide-[color:var(--color-border)]">
                {POLICY.map((p) => (
                  <li key={p.n} className="py-8 first:pt-0 sm:py-10">
                    <div className="grid gap-5 sm:grid-cols-[80px_1fr] sm:gap-10">
                      <p
                        className="font-mono text-[13px] font-semibold tracking-[0.08em] text-[color:var(--color-primary)] sm:text-[15px]"
                        aria-hidden="true"
                      >
                        No.&nbsp;{p.n}
                      </p>
                      <div>
                        <h2 className="title-lg text-[color:var(--color-fg)]">
                          {p.title}
                        </h2>
                        <p className="mt-4 body-md text-[color:var(--color-fg-muted)]">
                          {p.body}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Reporting line — what to do if you have something to report.
            Critical that this is reachable, not buried. */}
        <section className="mt-20 sm:mt-28">
          <div className="container-narrow">
            <div className="mx-auto max-w-[760px] border-t border-[color:var(--color-border)] pt-12">
              <p className="label-eyebrow text-[color:var(--color-fg-subtle)]">
                Reporting
              </p>
              <p className="mt-6 body-lg text-[color:var(--color-fg)]">
                If you experienced something inside a NexGen corridor
                that should be on this page, write to{" "}
                <a
                  href="mailto:safety@nexgenconnect.com"
                  className="text-[color:var(--color-primary)] underline decoration-dotted underline-offset-4 hover:text-[color:var(--color-primary-hover)]"
                >
                  safety@nexgenconnect.com
                </a>
                . The 1-hour SLA on harassment reports starts the moment
                we receive the message. You can also reach the founder
                at{" "}
                <a
                  href="mailto:hello@nexgenconnect.com"
                  className="text-[color:var(--color-primary)] underline decoration-dotted underline-offset-4 hover:text-[color:var(--color-primary-hover)]"
                >
                  hello@nexgenconnect.com
                </a>{" "}
                if the safety address is not the right channel.
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/promises"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-[color:var(--color-border-strong)] px-5 text-[14px] font-medium text-[color:var(--color-fg)] transition-colors hover:border-[color:var(--color-primary)]/55"
                >
                  Read the five promises
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
