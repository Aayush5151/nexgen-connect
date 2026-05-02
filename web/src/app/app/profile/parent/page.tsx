"use client";

import { useState } from "react";
import Link from "next/link";
import { parentGenerateMagicLink } from "@/lib/app/mock-services";

/**
 * /app/profile/parent — parent-view setup.
 *
 * Premium feature. Generates a single-use magic-link, mailed to the
 * parent's email, expires in 1h, refreshable here.
 *
 * v16 web pivot §Bucket 5.
 */
export default function ProfileParentPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ expiresAt: string; emailSentTo: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await parentGenerateMagicLink({ email });
      setResult(res);
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
          Parent view
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]">
          One link. Read-only. Single use.
        </h1>
        <p className="mt-2 text-[15px] leading-[1.6] text-[color:var(--color-fg-muted)]">
          Your parent gets an email with a magic-link. They see your group size,
          verification status, and arrival time — never your chats. Link expires
          in 1 hour. They can ask you for a fresh one any time.
        </p>
      </header>

      {result ? (
        <section className="rounded-[14px] border border-[color:var(--color-primary)]/30 bg-[color:var(--color-surface)] p-5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-primary)]">
            Sent
          </p>
          <p className="mt-3 text-[14px] text-[color:var(--color-fg)]">
            We emailed a magic-link to {result.emailSentTo}. Expires{" "}
            {new Date(result.expiresAt).toLocaleString()}.
          </p>
          <button
            type="button"
            onClick={() => setResult(null)}
            className="mt-4 inline-flex h-9 items-center rounded-md bg-[color:var(--color-fg)] px-3 text-[12px] font-semibold text-[color:var(--color-bg)] hover:bg-[color:var(--color-fg-muted)]"
          >
            Send a new one
          </button>
        </section>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="parent-email"
              className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]"
            >
              Parent email
            </label>
            <input
              id="parent-email"
              type="email"
              required
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="amma@example.com"
              className="mt-2 h-12 w-full rounded-[10px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] px-4 text-[15px] text-[color:var(--color-fg)] placeholder:text-[color:var(--color-fg-placeholder)] focus:border-[color:var(--color-primary)]/60 focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-[12px] text-[color:var(--color-danger)]">{error}</p>
          )}

          <button
            type="submit"
            disabled={!email.trim() || submitting}
            className="inline-flex h-12 w-full items-center justify-center rounded-[10px] bg-[color:var(--color-primary)] text-[14px] font-semibold text-[color:var(--color-primary-fg)] transition-[background-color,opacity] hover:bg-[color:var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Generating…" : "Generate magic-link"}
          </button>
        </form>
      )}
    </div>
  );
}
