"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, RotateCcw, X } from "lucide-react";

import {
  computeTriageForRowAction,
  updateSignupAdmissionAction,
} from "@/app/actions/admin";
import { track } from "@/lib/analytics";
import type { AdmissionStatus, SignupRow } from "@/lib/supabase/schema";

/**
 * AdminReviewTable — minimal review queue.
 *
 * One row per signup. Each row shows just enough to decide:
 *   name · phone tail · home city · destination uni · status pill ·
 *   approve / decline / reset buttons.
 *
 * No expand panel, no internal-note composer, no audit-history panel.
 * Those existed for a "founder reviews 50 daily" world that doesn't
 * match early-beta cadence. They can come back as a route-level
 * `/admin/[id]` detail page when there's actual volume that justifies
 * them — a flat list reads faster than nested accordions when the
 * total is double-digit.
 *
 * Behaviour preserved:
 *   - Server action re-checks admin auth on every hit.
 *   - Undo via toast for misclicks.
 *   - router.refresh() after each action so counts stay consistent.
 */

const EMPTY_COPY: Record<"all" | AdmissionStatus, string> = {
  pending_review: "Nobody waiting. You're caught up.",
  approved: "Nobody approved yet.",
  declined: "Nothing declined.",
  all: "No signups yet.",
};

export function AdminReviewTable({
  rows,
  currentStatus,
}: {
  rows: SignupRow[];
  currentStatus: "all" | AdmissionStatus;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-[14px] border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-10 text-center text-[13px] text-[color:var(--color-fg-muted)]">
        {EMPTY_COPY[currentStatus]}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-[color:var(--color-border)] overflow-hidden rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
      {rows.map((row) => (
        <ReviewRow key={row.id} row={row} />
      ))}
    </ul>
  );
}

function ReviewRow({ row }: { row: SignupRow }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // Lazy-load the AI triage verdict when missing. The row paints
  // instantly with whatever was cached server-side; if nothing was
  // cached AND the AI lane is enabled, the action computes + persists,
  // and we splice the result into local state.
  const [triage, setTriage] = useState(row.triage_verdict ?? null);
  const triageRequested = useRef(false);
  useEffect(() => {
    if (triage || triageRequested.current) return;
    triageRequested.current = true;
    let cancelled = false;
    (async () => {
      const res = await computeTriageForRowAction({ user_id: row.id });
      if (cancelled) return;
      if (res.ok && res.verdict) setTriage(res.verdict);
    })();
    return () => {
      cancelled = true;
    };
  }, [row.id, triage]);

  const rowWithTriage: SignupRow = triage === row.triage_verdict
    ? row
    : { ...row, triage_verdict: triage };

  function applyStatus(next: AdmissionStatus) {
    const previous = row.admission_status;
    startTransition(async () => {
      const res = await updateSignupAdmissionAction({
        user_id: row.id,
        new_status: next,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      const verb =
        next === "approved" ? "Approved" : next === "declined" ? "Declined" : "Reset";
      if (next === "approved") track("Admin_Review_Approved");
      else if (next === "declined") track("Admin_Review_Declined");
      toast.success(`${verb} ${row.first_name ?? "signup"}.`, {
        action:
          previous === next
            ? undefined
            : { label: "Undo", onClick: () => undoToStatus(previous) },
      });
      router.refresh();
    });
  }

  function undoToStatus(previous: AdmissionStatus) {
    startTransition(async () => {
      const res = await updateSignupAdmissionAction({
        user_id: row.id,
        new_status: previous,
      });
      if (!res.ok) {
        toast.error(`Couldn't undo: ${res.error}`);
        return;
      }
      toast.message(`Reverted ${row.first_name ?? "signup"} to ${labelFor(previous)}.`);
      router.refresh();
    });
  }

  const createdLabel = new Date(row.created_at).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });

  return (
    <li
      className={`flex flex-wrap items-center gap-3 px-4 py-3 transition-opacity ${
        pending ? "opacity-60" : ""
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="font-heading text-[15px] font-semibold text-[color:var(--color-fg)]">
          {row.first_name ?? (
            <span className="text-[color:var(--color-fg-subtle)]">No name</span>
          )}
          <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
            ****{row.phone_tail}
          </span>
        </p>
        <p className="mt-0.5 text-[12px] text-[color:var(--color-fg-muted)]">
          {row.home_city ?? "—"}
          <span className="text-[color:var(--color-fg-subtle)]"> → </span>
          {row.destination_uni ?? "—"}
          {row.intake && (
            <span className="text-[color:var(--color-fg-subtle)]">
              {" "}
              · {row.intake}
            </span>
          )}
          <span className="text-[color:var(--color-fg-subtle)]"> · {createdLabel}</span>
        </p>
        <AISignals row={rowWithTriage} />
      </div>

      <StatusBadge status={row.admission_status} />

      <div className="flex items-center gap-1.5">
        {row.admission_status !== "approved" && (
          <ActionButton onClick={() => applyStatus("approved")} disabled={pending} tone="approve">
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            Approve
          </ActionButton>
        )}
        {row.admission_status !== "declined" && (
          <ActionButton onClick={() => applyStatus("declined")} disabled={pending} tone="decline">
            <X className="h-3.5 w-3.5" strokeWidth={2.5} />
            Decline
          </ActionButton>
        )}
        {row.admission_status !== "pending_review" && (
          <ActionButton
            onClick={() => applyStatus("pending_review")}
            disabled={pending}
            tone="neutral"
            title="Move back to pending review"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
          </ActionButton>
        )}
      </div>
    </li>
  );
}

/**
 * AI-derived signals for one row. Renders nothing if neither AI lane
 * has produced a result yet — the row falls back to the plain
 * pre-AI layout.
 *
 * Triage verdict (one-liner) sits at the top; extracted-letter
 * mismatches come below it as a tighter chip. Reviewer scans both at
 * a glance, then clicks Approve/Decline.
 */
function AISignals({ row }: { row: SignupRow }) {
  const verdict = row.triage_verdict;
  const extracted = row.admit_extracted;
  if (!verdict && !extracted) return null;

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
      {verdict && <TriageChip verdict={verdict} />}
      {extracted && extracted.mismatches.length > 0 && (
        <ExtractedMismatchChip mismatches={extracted.mismatches} />
      )}
      {extracted && extracted.red_flags.length > 0 && (
        <ExtractedFlagChip count={extracted.red_flags.length} />
      )}
      {extracted &&
        extracted.mismatches.length === 0 &&
        extracted.red_flags.length === 0 && (
          <ExtractedOkChip
            university={extracted.university_name}
            intake={extracted.intake_term}
          />
        )}
    </div>
  );
}

function TriageChip({
  verdict,
}: {
  verdict: NonNullable<SignupRow["triage_verdict"]>;
}) {
  const cls =
    verdict.label === "ok"
      ? "border-[color:var(--color-primary)]/40 bg-[color:var(--color-primary)]/5 text-[color:var(--color-primary)]"
      : verdict.label === "concerning"
        ? "border-[color:var(--color-danger)]/40 bg-[color:var(--color-danger)]/5 text-[color:var(--color-danger)]"
        : "border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] text-[color:var(--color-fg-muted)]";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] ${cls}`}
      title={`AI triage · confidence ${(verdict.confidence * 100).toFixed(0)}%`}
    >
      <span className="font-mono text-[9px] uppercase tracking-[0.12em] opacity-70">
        AI
      </span>
      {verdict.one_liner}
    </span>
  );
}

function ExtractedMismatchChip({ mismatches }: { mismatches: string[] }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-danger)]/40 bg-[color:var(--color-danger)]/5 px-2 py-0.5 text-[11px] text-[color:var(--color-danger)]"
      title={mismatches.join("\n")}
    >
      <span className="font-mono text-[9px] uppercase tracking-[0.12em] opacity-70">
        Letter
      </span>
      {mismatches.length === 1 ? "1 mismatch" : `${mismatches.length} mismatches`}
    </span>
  );
}

function ExtractedFlagChip({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-danger)]/40 bg-[color:var(--color-danger)]/5 px-2 py-0.5 text-[11px] text-[color:var(--color-danger)]">
      <span className="font-mono text-[9px] uppercase tracking-[0.12em] opacity-70">
        Letter
      </span>
      {count === 1 ? "1 red flag" : `${count} red flags`}
    </span>
  );
}

function ExtractedOkChip({
  university,
  intake,
}: {
  university: string | null;
  intake: string | null;
}) {
  if (!university && !intake) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-primary)]/30 bg-[color:var(--color-primary)]/5 px-2 py-0.5 text-[11px] text-[color:var(--color-primary)]">
      <span className="font-mono text-[9px] uppercase tracking-[0.12em] opacity-70">
        Letter
      </span>
      {university ?? "—"}
      {intake && <span className="opacity-70"> · {intake}</span>}
    </span>
  );
}

function StatusBadge({ status }: { status: AdmissionStatus }) {
  const map: Record<AdmissionStatus, { label: string; className: string }> = {
    pending_review: {
      label: "Pending",
      className:
        "border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] text-[color:var(--color-fg-muted)]",
    },
    approved: {
      label: "Approved",
      className:
        "border-[color:var(--color-primary)]/50 bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)]",
    },
    declined: {
      label: "Declined",
      className:
        "border-[color:var(--color-danger)]/40 bg-[color:var(--color-danger)]/5 text-[color:var(--color-danger)]",
    },
  };
  const cfg = map[status];
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  tone,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  tone: "approve" | "decline" | "neutral";
  title?: string;
}) {
  const toneClass =
    tone === "approve"
      ? "border-[color:var(--color-primary)]/60 bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/20"
      : tone === "decline"
        ? "border-[color:var(--color-danger)]/40 bg-[color:var(--color-danger)]/5 text-[color:var(--color-danger)] hover:bg-[color:var(--color-danger)]/10"
        : "border-[color:var(--color-border)] bg-[color:var(--color-bg)] text-[color:var(--color-fg-muted)] hover:border-[color:var(--color-border-strong)]";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex items-center gap-1.5 rounded-[8px] border px-2.5 py-1 text-[11px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${toneClass}`}
    >
      {children}
    </button>
  );
}

function labelFor(s: AdmissionStatus): string {
  return s === "pending_review" ? "Pending" : s === "approved" ? "Approved" : "Declined";
}
