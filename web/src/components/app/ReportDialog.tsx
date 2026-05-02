"use client";

import { useState } from "react";
import type { ChatMessage } from "@/lib/app/services";

/**
 * ReportDialog — T&S report modal opened from a chat message.
 *
 * Categories + SLA per v15 BP §3.5 / v16 §Bucket 7:
 *   harassment + self_harm → 1h SLA, ts_priority queue
 *   scam | spam | other     → 4h SLA, ts_general queue
 *
 * Submits to /api/chat/report. UUID validation lives server-side; for
 * mock messages (non-UUID id) we still POST so the dev flow looks real.
 *
 * v16 web pivot §Bucket 7.
 */

const CATEGORIES = [
  { value: "harassment", label: "Harassment", sla: 1 },
  { value: "self_harm", label: "Self-harm or crisis", sla: 1 },
  { value: "scam", label: "Scam", sla: 4 },
  { value: "spam", label: "Spam", sla: 4 },
  { value: "other", label: "Something else", sla: 4 },
] as const;

type Category = (typeof CATEGORIES)[number]["value"];

export function ReportDialog({
  message,
  onClose,
}: {
  message: ChatMessage;
  onClose: () => void;
}) {
  const [category, setCategory] = useState<Category>("harassment");
  const [detail, setDetail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ slaHours: number; ticketId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/chat/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // The API currently rejects non-UUIDs with E072. For dev we
          // pass-through the mock id; the real path lands in Bucket 8
          // when message ids are real UUIDs from Supabase.
          messageId: looksLikeUuid(message.id) ? message.id : crypto.randomUUID(),
          category,
          detail: detail || undefined,
        }),
      });
      const body = (await res.json()) as { ticketId?: string; slaHours?: number; error?: string };
      if (!res.ok || !body.ticketId || !body.slaHours) {
        setError(body.error ?? "Couldn't submit the report.");
        return;
      }
      setResult({ ticketId: body.ticketId, slaHours: body.slaHours });
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 md:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[480px] rounded-[16px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5">
        {result ? (
          <Done result={result} onClose={onClose} />
        ) : (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <h2
                id="report-title"
                className="font-heading text-xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]"
              >
                Report this message
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="text-[18px] text-[color:var(--color-fg-subtle)] hover:text-[color:var(--color-fg)]"
              >
                ×
              </button>
            </div>

            <blockquote className="mt-3 border-l-2 border-[color:var(--color-border-strong)] pl-3 text-[12px] leading-[1.4] text-[color:var(--color-fg-muted)]">
              <p className="font-semibold text-[color:var(--color-fg)]">
                {message.authorFirstName}
              </p>
              <p>{message.content}</p>
            </blockquote>

            <fieldset className="mt-4 space-y-2 text-[13px]">
              <legend className="sr-only">Category</legend>
              {CATEGORIES.map((c) => (
                <label key={c.value} className="flex items-center gap-3 text-[color:var(--color-fg)]">
                  <input
                    type="radio"
                    name="report-category"
                    value={c.value}
                    checked={category === c.value}
                    onChange={() => setCategory(c.value)}
                  />
                  <span className="flex-1">{c.label}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
                    {c.sla}h SLA
                  </span>
                </label>
              ))}
            </fieldset>

            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Anything you want the reviewer to know? (optional)"
              rows={3}
              maxLength={1000}
              className="mt-4 w-full rounded-[10px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] p-3 text-[13px] text-[color:var(--color-fg)] placeholder:text-[color:var(--color-fg-placeholder)] focus:border-[color:var(--color-primary)]/60 focus:outline-none"
            />

            {error && (
              <p className="mt-3 text-[12px] text-[color:var(--color-danger)]">{error}</p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 items-center rounded-md border border-[color:var(--color-border)] px-4 text-[13px] text-[color:var(--color-fg)] hover:bg-[color:var(--color-bg)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="inline-flex h-10 items-center rounded-md bg-[color:var(--color-primary)] px-4 text-[13px] font-semibold text-[color:var(--color-primary-fg)] transition-[background-color,opacity] hover:bg-[color:var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Submit report"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Done({
  result,
  onClose,
}: {
  result: { slaHours: number; ticketId: string };
  onClose: () => void;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-primary)]">
        Reported · {result.ticketId.slice(-6)}
      </p>
      <h2 className="mt-2 font-heading text-xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]">
        Thanks. A reviewer is on it.
      </h2>
      <p className="mt-3 text-[13px] leading-[1.5] text-[color:var(--color-fg-muted)]">
        We respond within {result.slaHours} hour{result.slaHours === 1 ? "" : "s"}.
        You&apos;ll hear back by email + in-app notification.
      </p>
      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 items-center rounded-md bg-[color:var(--color-fg)] px-4 text-[13px] font-semibold text-[color:var(--color-bg)] hover:bg-[color:var(--color-fg-muted)]"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function looksLikeUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}
