"use client";

import { useState } from "react";
import Link from "next/link";
import { helpReport } from "@/lib/app/mock-services";

/**
 * /app/help — HN1 triage.
 *
 * Four primary paths:
 *   - Harassment (1h SLA, women-only paths flow through Bucket 7)
 *   - Scam       (links to /app/help/scams patterns)
 *   - Hard time  (links to /app/help/now talk-to-someone-now)
 *   - Something else (free-text, 4h SLA)
 *
 * v16 web pivot §Bucket 5.
 */
export default function HelpPage() {
  return (
    <div className="space-y-8 pt-2">
      <header>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-primary)]">
          Help
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]">
          What&apos;s happening?
        </h1>
        <p className="mt-2 text-[15px] leading-[1.6] text-[color:var(--color-fg-muted)]">
          A real human reads every report. Median response: 2 hours. Hard SLA: 4 hours
          (1 hour for harassment).
        </p>
      </header>

      <div className="space-y-3">
        <Tile
          title="Someone is harassing me"
          sub="Messages, photos, threats — anywhere. We act in 1 hour."
          accent="danger"
          href="#triage-harassment"
        />
        <Tile
          title="I think this is a scam"
          sub="Deposit upfront, fake landlord, ride-share spoof — see the 5 patterns."
          href="/app/help/scams"
        />
        <Tile
          title="I’m having a hard time"
          sub="Loneliness, anxiety, stuck. Talk to someone now."
          href="/app/help/now"
        />
        <Tile
          title="Something else"
          sub="Tell us what’s going on. Reviewer routes it within 4 hours."
          href="#triage-other"
        />
      </div>

      <ReportForm />
    </div>
  );
}

function Tile({
  title,
  sub,
  href,
  accent,
}: {
  title: string;
  sub: string;
  href: string;
  accent?: "danger";
}) {
  return (
    <Link
      href={href}
      className={
        "block rounded-[14px] border bg-[color:var(--color-surface)] p-5 transition-[border-color,transform] hover:translate-y-[-1px] " +
        (accent === "danger"
          ? "border-[color:var(--color-danger)]/40 hover:border-[color:var(--color-danger)]/70"
          : "border-[color:var(--color-border-strong)] hover:border-[color:var(--color-primary)]/60")
      }
    >
      <p
        className={
          "text-[15px] font-semibold " +
          (accent === "danger"
            ? "text-[color:var(--color-danger)]"
            : "text-[color:var(--color-fg)]")
        }
      >
        {title}
      </p>
      <p className="mt-1 text-[13px] leading-[1.5] text-[color:var(--color-fg-muted)]">{sub}</p>
    </Link>
  );
}

function ReportForm() {
  const [category, setCategory] = useState<
    "harassment" | "scam" | "hard_time" | "something_else"
  >("something_else");
  const [detail, setDetail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ticketId: string; slaHours: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!detail.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await helpReport({ category, detail });
      setResult(res);
      setDetail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <section
        id="triage-other"
        className="rounded-[14px] border border-[color:var(--color-primary)]/30 bg-[color:var(--color-surface)] p-5"
      >
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-primary)]">
          Reported · {result.ticketId.slice(-6)}
        </p>
        <p className="mt-3 text-[14px] leading-[1.5] text-[color:var(--color-fg)]">
          A human reviews this in {result.slaHours} hour{result.slaHours === 1 ? "" : "s"}.
          You&apos;ll hear back by email + in-app notification.
        </p>
      </section>
    );
  }

  return (
    <form
      id="triage-other"
      onSubmit={onSubmit}
      className="rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5"
    >
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
        Detail
      </p>
      <fieldset className="mt-3 space-y-2 text-[13px]">
        <legend className="sr-only">Category</legend>
        {(["harassment", "scam", "hard_time", "something_else"] as const).map((c) => (
          <label key={c} className="flex items-center gap-2 text-[color:var(--color-fg)]">
            <input
              type="radio"
              name="category"
              value={c}
              checked={category === c}
              onChange={() => setCategory(c)}
            />
            <span>{labelOf(c)}</span>
          </label>
        ))}
      </fieldset>

      <textarea
        value={detail}
        onChange={(e) => setDetail(e.target.value)}
        placeholder="What happened? Who, when, where. Plain words are fine."
        rows={4}
        className="mt-3 w-full rounded-[10px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] p-3 text-[14px] text-[color:var(--color-fg)] placeholder:text-[color:var(--color-fg-placeholder)] focus:border-[color:var(--color-primary)]/60 focus:outline-none"
      />

      {error && (
        <p className="mt-3 text-[12px] text-[color:var(--color-danger)]">{error}</p>
      )}

      <button
        type="submit"
        disabled={!detail.trim() || submitting}
        className="mt-4 inline-flex h-11 items-center rounded-[10px] bg-[color:var(--color-primary)] px-5 text-[13px] font-semibold text-[color:var(--color-primary-fg)] transition-[background-color,opacity] hover:bg-[color:var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Send to a reviewer"}
      </button>
    </form>
  );
}

function labelOf(c: "harassment" | "scam" | "hard_time" | "something_else"): string {
  return c === "harassment"
    ? "Harassment (1h SLA)"
    : c === "scam"
      ? "Scam"
      : c === "hard_time"
        ? "Hard time"
        : "Something else";
}
