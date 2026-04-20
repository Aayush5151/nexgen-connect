"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X, RotateCcw } from "lucide-react";

import { updateAdmissionAction } from "@/app/actions/admin";
import { track } from "@/lib/analytics";
import type { AdmissionStatus, WaitlistRow } from "@/lib/supabase/schema";

/**
 * AdminReviewTable
 *
 * Client island rendered below the server-computed review queue. Each row
 * has approve/decline/reset actions that:
 *   1. Optimistically mark the row "pending…" so the button can't double-fire.
 *   2. Call updateAdmissionAction (server action, re-checks admin auth).
 *   3. router.refresh() on success so stats + list stay consistent.
 *
 * Optional note field: click "with note" to attach a reason before writing.
 * Kept deliberately small — a short explanation is enough for audit.
 */
export function AdminReviewTable({ rows }: { rows: WaitlistRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="mt-6 rounded-[12px] border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-8 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
          Empty
        </p>
        <p className="mt-2 text-[14px] text-[color:var(--color-fg-muted)]">
          No rows match this filter. Good.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-hidden rounded-[14px] border border-[color:var(--color-border)]">
      <div className="divide-y divide-[color:var(--color-border)]">
        <HeaderRow />
        {rows.map((row) => (
          <ReviewRow key={row.id} row={row} />
        ))}
      </div>
    </div>
  );
}

function HeaderRow() {
  return (
    <div className="hidden grid-cols-[1.2fr_1fr_1fr_0.9fr_0.8fr_1.2fr] items-center gap-3 bg-[color:var(--color-surface-elevated)] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)] md:grid">
      <span>Name</span>
      <span>Home city</span>
      <span>Destination</span>
      <span>Identity</span>
      <span>Status</span>
      <span className="text-right">Action</span>
    </div>
  );
}

function ReviewRow({ row }: { row: WaitlistRow }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState(row.admission_note ?? "");

  function applyStatus(next: AdmissionStatus) {
    startTransition(async () => {
      const res = await updateAdmissionAction({
        target_id: row.id,
        new_status: next,
        note: note.trim() || undefined,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      if (next === "approved") {
        track("Admin_Review_Approved");
        toast.success(`Approved ${row.first_name}.`);
      } else if (next === "declined") {
        track("Admin_Review_Declined");
        toast.success(`Declined ${row.first_name}.`);
      } else {
        toast.success(`Reset ${row.first_name} to pending.`);
      }
      setNoteOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="grid grid-cols-1 gap-3 bg-[color:var(--color-surface)] px-4 py-4 md:grid-cols-[1.2fr_1fr_1fr_0.9fr_0.8fr_1.2fr] md:items-center md:gap-3">
      <div>
        <p className="font-heading text-[15px] font-semibold text-[color:var(--color-fg)]">
          {row.first_name}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
          {new Date(row.created_at).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
          })}{" "}
          · …{row.phone_hash.slice(-6)}
        </p>
      </div>
      <p className="text-[13px] text-[color:var(--color-fg-muted)]">
        {row.home_city}
      </p>
      <p className="text-[13px] text-[color:var(--color-fg-muted)]">
        {row.destination_university}{" "}
        <span className="text-[color:var(--color-fg-subtle)]">
          · {row.intake}
        </span>
      </p>
      <IdentityBadge row={row} />
      <StatusBadge status={row.admission_status} />
      <div className="flex flex-wrap items-center justify-start gap-2 md:justify-end">
        {row.admission_status !== "approved" && (
          <ActionButton
            onClick={() => applyStatus("approved")}
            disabled={pending}
            tone="approve"
          >
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            Approve
          </ActionButton>
        )}
        {row.admission_status !== "declined" && (
          <ActionButton
            onClick={() => applyStatus("declined")}
            disabled={pending}
            tone="decline"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.5} />
            Decline
          </ActionButton>
        )}
        {row.admission_status !== "pending_review" && (
          <ActionButton
            onClick={() => applyStatus("pending_review")}
            disabled={pending}
            tone="neutral"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
            Reset
          </ActionButton>
        )}
        <button
          type="button"
          onClick={() => setNoteOpen((v) => !v)}
          className="text-[11px] text-[color:var(--color-fg-subtle)] underline underline-offset-2 hover:text-[color:var(--color-fg-muted)]"
        >
          {noteOpen ? "hide note" : "note"}
        </button>
      </div>

      {noteOpen && (
        <div className="md:col-span-6">
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
              Internal note (max 500 chars)
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 500))}
              rows={2}
              className="mt-2 w-full rounded-[10px] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-3 py-2 text-[13px] text-[color:var(--color-fg)] placeholder:text-[color:var(--color-fg-placeholder)] focus:border-[color:var(--color-primary)] focus:outline-none"
              placeholder="Why are you approving/declining? (saved to audit log)"
            />
          </label>
          {row.admission_note && (
            <p className="mt-2 text-[11px] text-[color:var(--color-fg-subtle)]">
              Last note: {row.admission_note}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function IdentityBadge({ row }: { row: WaitlistRow }) {
  const tone =
    row.identity_status === "verified"
      ? "text-[color:var(--color-success)]"
      : row.identity_status === "failed"
        ? "text-[color:var(--color-danger)]"
        : "text-[color:var(--color-fg-subtle)]";
  return (
    <p
      className={`font-mono text-[10px] uppercase tracking-[0.12em] ${tone}`}
    >
      {row.identity_status}
    </p>
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
      className={`inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${cfg.className}`}
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
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  tone: "approve" | "decline" | "neutral";
}) {
  const toneClass =
    tone === "approve"
      ? "border-[color:var(--color-primary)]/40 bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/15"
      : tone === "decline"
        ? "border-[color:var(--color-danger)]/40 bg-[color:var(--color-danger)]/5 text-[color:var(--color-danger)] hover:bg-[color:var(--color-danger)]/10"
        : "border-[color:var(--color-border)] bg-[color:var(--color-bg)] text-[color:var(--color-fg-muted)] hover:border-[color:var(--color-border-strong)]";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1 rounded-[8px] border px-2.5 py-1 text-[11px] font-medium transition-colors disabled:opacity-50 ${toneClass}`}
    >
      {children}
    </button>
  );
}
