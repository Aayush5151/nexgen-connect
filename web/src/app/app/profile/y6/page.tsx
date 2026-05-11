"use client";

import { useState } from "react";
import Link from "next/link";
import { arrivalCheckIn } from "@/lib/app/services";

/**
 * /app/profile/y6 — arrival check-in (Y6).
 *
 * Y6 is the v15 BP nickname for the arrival-check-in feature: log when
 * you've landed, parent gets ONE notification ("Aayush landed safe"),
 * never location, never ongoing tracking.
 *
 * v16 web pivot §Bucket 5.
 */
export default function Y6Page() {
  const [airport, setAirport] = useState("");
  const [whenIso, setWhenIso] = useState(() => {
    // Default to "now" rounded to the next hour, in local-input format.
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
    const tz = d.getTimezoneOffset();
    return new Date(d.getTime() - tz * 60_000).toISOString().slice(0, 16);
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await arrivalCheckIn({ atIso: new Date(whenIso).toISOString(), airport });
      setResult(res.parentNotifiedAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 pt-2">
      <header>
        <Link
          href="/app/profile"
          className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)] hover:text-[color:var(--color-fg)]"
        >
          ← Profile
        </Link>
        <p className="mt-2 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-primary)]">
          Arrival check-in · Y6
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]">
          One ping. One parent. No GPS.
        </h1>
        <p className="mt-2 text-[15px] leading-[1.6] text-[color:var(--color-fg-muted)]">
          Tell us when you land. We send your parent one email, &ldquo;{`{firstName}`} landed
          safe&rdquo;, and we&apos;re done. No location, no ongoing tracking.
        </p>
      </header>

      {result ? (
        <section className="rounded-[14px] border border-[color:var(--color-primary)]/30 bg-[color:var(--color-surface)] p-5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-primary)]">
            Set
          </p>
          <p className="mt-3 text-[14px] text-[color:var(--color-fg)]">
            We&apos;ll email your parent at the time you set. You can edit it any time
            up to 1h before.
          </p>
        </section>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="airport"
              className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]"
            >
              Airport
            </label>
            <input
              id="airport"
              type="text"
              value={airport}
              onChange={(e) => setAirport(e.target.value)}
              placeholder="DUB / MUC / FRA"
              className="mt-2 h-12 w-full rounded-[10px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] px-4 text-[15px] text-[color:var(--color-fg)] placeholder:text-[color:var(--color-fg-placeholder)] focus:border-[color:var(--color-primary)]/60 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="when"
              className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]"
            >
              Landing time (local)
            </label>
            <input
              id="when"
              type="datetime-local"
              required
              value={whenIso}
              onChange={(e) => setWhenIso(e.target.value)}
              className="mt-2 h-12 w-full rounded-[10px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] px-4 text-[15px] text-[color:var(--color-fg)] focus:border-[color:var(--color-primary)]/60 focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-[12px] text-[color:var(--color-danger)]">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-12 w-full items-center justify-center rounded-[10px] bg-[color:var(--color-primary)] text-[14px] font-semibold text-[color:var(--color-primary-fg)] transition-[background-color,opacity] hover:bg-[color:var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Setting…" : "Set arrival check-in"}
          </button>
        </form>
      )}
    </div>
  );
}
