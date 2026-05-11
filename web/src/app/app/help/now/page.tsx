"use client";

import Link from "next/link";

/**
 * /app/help/now — talk-to-someone-now CTA.
 *
 * Mock on-call rotation: shows today's reviewer + a 24/7 crisis line.
 * Real impl reads from a Supabase rotation table and pages the on-call
 * advisor in Bucket 8 (T&S surface).
 *
 * v16 web pivot §Bucket 5.
 */
export default function HelpNowPage() {
  const today = new Date().toLocaleDateString("en-IE", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="space-y-6 pt-2">
      <header>
        <Link
          href="/app/help"
          className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)] hover:text-[color:var(--color-fg)]"
        >
          ← Help
        </Link>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]">
          Talk to someone now.
        </h1>
        <p className="mt-2 text-[15px] leading-[1.6] text-[color:var(--color-fg-muted)]">
          You don&apos;t have to figure this out alone. A reviewer is on call.
        </p>
      </header>

      <section className="rounded-[14px] border border-[color:var(--color-primary)]/30 bg-[color:var(--color-surface)] p-5">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-primary)]">
          On call · {today}
        </p>
        <p className="mt-3 text-[15px] font-semibold text-[color:var(--color-fg)]">
          Aayush (founder)
        </p>
        <p className="mt-1 text-[13px] text-[color:var(--color-fg-muted)]">
          Median pickup: 12 minutes. We&apos;re a small team, no scripts, no IVR.
        </p>
        <a
          href="tel:+919999999999"
          className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-[10px] bg-[color:var(--color-primary)] text-[14px] font-semibold text-[color:var(--color-primary-fg)] transition-[background-color] hover:bg-[color:var(--color-primary-hover)]"
        >
          Call now
        </a>
      </section>

      <section className="rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
          Crisis lines · 24/7
        </p>
        <ul className="mt-3 space-y-3 text-[13px] text-[color:var(--color-fg)]">
          <li>
            <p className="font-semibold">iCall (India) · 9152987821</p>
            <p className="text-[color:var(--color-fg-muted)]">
              Free, multi-lingual mental health helpline. Mon–Sat 8am–10pm IST.
            </p>
          </li>
          <li>
            <p className="font-semibold">Samaritans (Ireland) · 116 123</p>
            <p className="text-[color:var(--color-fg-muted)]">
              Free, 24/7. Listen, no advice unless you ask.
            </p>
          </li>
          <li>
            <p className="font-semibold">Telefonseelsorge (Germany) · 0800 111 0 111</p>
            <p className="text-[color:var(--color-fg-muted)]">
              Free, 24/7, confidential. German + English.
            </p>
          </li>
        </ul>
      </section>

      <p className="text-center text-[12px] text-[color:var(--color-fg-subtle)]">
        We never escalate without your permission.
      </p>
    </div>
  );
}
