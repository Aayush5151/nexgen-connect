"use client";

import { useState } from "react";
import Link from "next/link";
import { groupApplyJoin } from "@/lib/app/mock-services";

/**
 * /app/profile/group-apply — group housing application.
 *
 * 3-6 verified students apply for a single PBSA bundle. Real partner
 * webhooks land in Bucket 8.
 *
 * v16 web pivot §Bucket 5.
 */

const PARTNERS = [
  { slug: "aparto", label: "aparto", note: "Dublin · Cork · Galway. Largest PBSA in Ireland." },
  { slug: "yugo", label: "Yugo (formerly Hubs)", note: "Dublin · Limerick. International student tilt." },
  { slug: "fresh", label: "Fresh Student Living", note: "Dublin only. Smaller, well-run." },
  { slug: "mezzino", label: "Mezzino", note: "Dublin · Cork. Mid-tier price." },
];

export default function GroupApplyPage() {
  const [partner, setPartner] = useState<string | null>(null);
  const [groupSize, setGroupSize] = useState(4);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  async function onSubmit() {
    if (!partner || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await groupApplyJoin({ partnerSlug: partner, groupSize });
      setResult(res.groupId);
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
          Group apply
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]">
          3 to 6 of you, one application.
        </h1>
        <p className="mt-2 text-[15px] leading-[1.6] text-[color:var(--color-fg-muted)]">
          We bundle your application with up to five other verified students and
          send it to the partner. They reply once, to the group.
        </p>
      </header>

      {result ? (
        <section className="rounded-[14px] border border-[color:var(--color-primary)]/30 bg-[color:var(--color-surface)] p-5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-primary)]">
            Group started · {result.slice(-8)}
          </p>
          <p className="mt-3 text-[14px] text-[color:var(--color-fg)]">
            Invite your group from the corridor → Housing sub-circle.
          </p>
          <Link
            href="/app/corridor/sub-circles/housing"
            className="mt-4 inline-flex h-9 items-center rounded-md bg-[color:var(--color-fg)] px-3 text-[12px] font-semibold text-[color:var(--color-bg)] hover:bg-[color:var(--color-fg-muted)]"
          >
            Open Housing
          </Link>
        </section>
      ) : (
        <>
          <fieldset className="space-y-3">
            <legend className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
              Pick a partner
            </legend>
            {PARTNERS.map((p) => (
              <label
                key={p.slug}
                className={
                  "flex cursor-pointer items-start gap-3 rounded-[12px] border bg-[color:var(--color-surface)] p-4 transition-[border-color] " +
                  (partner === p.slug
                    ? "border-[color:var(--color-primary)]"
                    : "border-[color:var(--color-border)] hover:border-[color:var(--color-primary)]/60")
                }
              >
                <input
                  type="radio"
                  name="partner"
                  value={p.slug}
                  checked={partner === p.slug}
                  onChange={() => setPartner(p.slug)}
                  className="mt-1"
                />
                <span>
                  <span className="block text-[14px] font-semibold text-[color:var(--color-fg)]">
                    {p.label}
                  </span>
                  <span className="mt-1 block text-[12px] text-[color:var(--color-fg-muted)]">
                    {p.note}
                  </span>
                </span>
              </label>
            ))}
          </fieldset>

          <div>
            <label
              htmlFor="group-size"
              className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]"
            >
              Group size
            </label>
            <select
              id="group-size"
              value={groupSize}
              onChange={(e) => setGroupSize(Number(e.target.value))}
              className="mt-2 h-12 w-full rounded-[10px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] px-4 text-[15px] text-[color:var(--color-fg)] focus:border-[color:var(--color-primary)]/60 focus:outline-none"
            >
              {[3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} students
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-[12px] text-[color:var(--color-danger)]">{error}</p>
          )}

          <button
            type="button"
            onClick={onSubmit}
            disabled={!partner || submitting}
            className="inline-flex h-12 w-full items-center justify-center rounded-[10px] bg-[color:var(--color-primary)] text-[14px] font-semibold text-[color:var(--color-primary-fg)] transition-[background-color,opacity] hover:bg-[color:var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Starting group…" : "Start group"}
          </button>
        </>
      )}
    </div>
  );
}
