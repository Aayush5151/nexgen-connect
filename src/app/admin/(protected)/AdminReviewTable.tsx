"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Check,
  ChevronDown,
  Copy,
  FileText,
  RotateCcw,
  X,
} from "lucide-react";

import {
  getAdmissionHistoryAction,
  updateAdmissionAction,
  type AdmissionHistoryEntry,
} from "@/app/actions/admin";
import { track } from "@/lib/analytics";
import type { AdmissionStatus, WaitlistRow } from "@/lib/supabase/schema";

/**
 * AdminReviewTable
 *
 * Client island rendered below the server-computed review queue. Each row:
 *   - Approve / Decline / Reset buttons that call updateAdmissionAction
 *     (server action re-checks admin auth on every hit).
 *   - Expandable details panel that lazily loads the full admission audit
 *     log for that row via getAdmissionHistoryAction — shows who reviewed,
 *     when, what the previous state was, and any saved internal note.
 *   - Optional inline note field before an action (saved to audit log).
 *
 * UX:
 *   - Every successful approve/decline fires a sonner toast with an Undo
 *     action that reverts to the previous status in one click.
 *   - Optimistic: the button disables while the action is in flight; on
 *     success we router.refresh() so stats + the list stay consistent.
 *   - Mobile: rows stack into cards; the table header is hidden below md.
 */

const FALLBACK_EMPTY_COPY: Record<"all" | AdmissionStatus, string> = {
  pending_review:
    "No one waiting. You're caught up — or flip 'Phone-verified only' off to see unverified signups.",
  approved: "Nobody approved yet. Approve a pending row to get started.",
  declined: "Nothing declined. If someone looks like a scammer, flip them here.",
  all: "No rows match. Try flipping 'Phone-verified only' off, or clearing search.",
};

type HistoryState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; data: HistoryData }
  | { status: "error"; error: string };

type HistoryData = {
  entries: AdmissionHistoryEntry[];
  reviewerName: string | null;
  reviewedAt: string | null;
  latestNote: string | null;
};

export function AdminReviewTable({
  rows,
  currentStatus,
  verifiedOnly,
}: {
  rows: WaitlistRow[];
  currentStatus: "all" | AdmissionStatus;
  verifiedOnly: boolean;
}) {
  if (rows.length === 0) {
    return (
      <div className="mt-4 rounded-[14px] border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-10 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
          Empty
        </p>
        <p className="mx-auto mt-3 max-w-[460px] text-[14px] text-[color:var(--color-fg-muted)]">
          {FALLBACK_EMPTY_COPY[currentStatus]}
        </p>
        {!verifiedOnly && currentStatus === "pending_review" && (
          <p className="mx-auto mt-2 max-w-[460px] text-[11px] text-[color:var(--color-fg-subtle)]">
            Tip: unverified signups never show phone-verified badges and can&apos;t
            be trusted for identity.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-hidden rounded-[14px] border border-[color:var(--color-border)]">
      <HeaderRow />
      <div className="divide-y divide-[color:var(--color-border)]">
        {rows.map((row) => (
          <ReviewRow key={row.id} row={row} />
        ))}
      </div>
    </div>
  );
}

function HeaderRow() {
  return (
    <div className="hidden grid-cols-[1.3fr_1fr_1fr_0.9fr_0.8fr_auto] items-center gap-3 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated,var(--color-surface))] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)] md:grid">
      <span>Name</span>
      <span>Home city</span>
      <span>Destination</span>
      <span>Identity</span>
      <span>Status</span>
      <span className="pr-1 text-right">Action</span>
    </div>
  );
}

function ReviewRow({ row }: { row: WaitlistRow }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState(row.admission_note ?? "");
  const [history, setHistory] = useState<HistoryState>({ status: "idle" });

  // Reset note draft when the underlying row data changes (e.g. after
  // router.refresh() following an action on this row).
  const lastRefreshedAt = useRef(row.admission_reviewed_at);
  useEffect(() => {
    if (row.admission_reviewed_at !== lastRefreshedAt.current) {
      setNote(row.admission_note ?? "");
      lastRefreshedAt.current = row.admission_reviewed_at;
      // History is now stale — drop it so the next open re-fetches.
      setHistory({ status: "idle" });
    }
  }, [row.admission_reviewed_at, row.admission_note]);

  const refreshHistory = useCallback(async () => {
    setHistory({ status: "loading" });
    const res = await getAdmissionHistoryAction({ target_id: row.id });
    if (!res.ok) {
      setHistory({ status: "error", error: res.error });
      return;
    }
    setHistory({
      status: "ready",
      data: {
        entries: res.entries,
        reviewerName: res.reviewer_first_name,
        reviewedAt: res.target?.admission_reviewed_at ?? null,
        latestNote: res.target?.admission_note ?? null,
      },
    });
  }, [row.id]);

  function toggleExpanded() {
    setExpanded((prev) => {
      const next = !prev;
      if (next && history.status === "idle") {
        void refreshHistory();
      }
      return next;
    });
  }

  /**
   * One-shot status write with toast + undo. `previous` is used to build
   * the Undo action in the toast so the founder can revert a misclick in
   * one tap without hunting for the right filter tab.
   */
  function applyStatus(next: AdmissionStatus) {
    const previous = row.admission_status;
    const noteToSend = note.trim() || undefined;
    startTransition(async () => {
      const res = await updateAdmissionAction({
        target_id: row.id,
        new_status: next,
        note: noteToSend,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      const verb =
        next === "approved"
          ? "Approved"
          : next === "declined"
            ? "Declined"
            : "Reset";
      if (next === "approved") track("Admin_Review_Approved");
      else if (next === "declined") track("Admin_Review_Declined");

      toast.success(`${verb} ${row.first_name}.`, {
        action:
          previous === next
            ? undefined
            : {
                label: "Undo",
                onClick: () => undoToStatus(previous),
              },
      });
      setNoteOpen(false);
      // History for this row is now outdated — re-fetch if panel is open.
      if (expanded) void refreshHistory();
      router.refresh();
    });
  }

  function undoToStatus(previous: AdmissionStatus) {
    startTransition(async () => {
      const res = await updateAdmissionAction({
        target_id: row.id,
        new_status: previous,
      });
      if (!res.ok) {
        toast.error(`Couldn't undo: ${res.error}`);
        return;
      }
      toast.message(`Reverted ${row.first_name} to ${labelFor(previous)}.`);
      if (expanded) void refreshHistory();
      router.refresh();
    });
  }

  function copyHash() {
    navigator.clipboard
      .writeText(row.phone_hash)
      .then(() => toast.success("Phone hash copied."))
      .catch(() => toast.error("Copy failed."));
  }

  const createdLabel = new Date(row.created_at).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });

  return (
    <div
      className={`bg-[color:var(--color-surface)] ${
        pending ? "opacity-80" : ""
      } transition-opacity`}
    >
      <div className="grid grid-cols-1 items-start gap-3 px-4 py-4 md:grid-cols-[1.3fr_1fr_1fr_0.9fr_0.8fr_auto] md:items-center md:gap-3">
        {/* Name + meta, with expand chevron */}
        <div className="flex items-start gap-2">
          <button
            type="button"
            onClick={toggleExpanded}
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse row" : "Expand row"}
            className="mt-0.5 rounded-[6px] border border-transparent p-0.5 text-[color:var(--color-fg-subtle)] transition-colors hover:border-[color:var(--color-border)] hover:text-[color:var(--color-fg-muted)]"
          >
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${
                expanded ? "rotate-180" : ""
              }`}
              strokeWidth={2}
            />
          </button>
          <div className="min-w-0">
            <p className="font-heading text-[15px] font-semibold text-[color:var(--color-fg)]">
              {row.first_name}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
              {createdLabel} · …{row.phone_hash.slice(-6)}
            </p>
          </div>
        </div>

        {/* Mobile: label the next three fields so they read as rows of a card */}
        <MobileLabel label="Home city">
          <span className="text-[13px] text-[color:var(--color-fg-muted)]">
            {row.home_city}
          </span>
        </MobileLabel>

        <MobileLabel label="Destination">
          <span className="text-[13px] text-[color:var(--color-fg-muted)]">
            {row.destination_university}{" "}
            <span className="text-[color:var(--color-fg-subtle)]">
              · {row.intake}
            </span>
          </span>
        </MobileLabel>

        <MobileLabel label="Identity">
          <IdentityBadge status={row.identity_status} />
        </MobileLabel>

        <MobileLabel label="Status">
          <StatusBadge status={row.admission_status} />
        </MobileLabel>

        {/* Action cluster */}
        <div className="flex flex-wrap items-center justify-start gap-2 md:justify-end">
          {row.admission_status !== "approved" && (
            <ActionButton
              onClick={() => applyStatus("approved")}
              disabled={pending}
              tone="approve"
              title="Approve this applicant"
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
              title="Decline — adds an audit trail entry"
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
              title="Move back to pending review"
            >
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
              Reset
            </ActionButton>
          )}
          <ActionButton
            onClick={() => setNoteOpen((v) => !v)}
            disabled={pending}
            tone="ghost"
            title="Attach a note to the next action (saved to audit log)"
          >
            <FileText className="h-3.5 w-3.5" strokeWidth={2} />
            {noteOpen ? "Hide note" : "Note"}
          </ActionButton>
        </div>
      </div>

      {/* Note composer — sits above the expand panel so it's always in view */}
      {noteOpen && (
        <div className="border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)]/40 px-4 py-3">
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
              Internal note (max 500 chars · written to audit on next action)
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 500))}
              rows={2}
              className="mt-2 w-full rounded-[10px] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-3 py-2 text-[13px] text-[color:var(--color-fg)] placeholder:text-[color:var(--color-fg-placeholder)] focus:border-[color:var(--color-primary)] focus:outline-none"
              placeholder="Why are you approving/declining? Short, factual."
            />
          </label>
          <div className="mt-2 flex items-center justify-between text-[10px] text-[color:var(--color-fg-subtle)]">
            <span>{note.length}/500</span>
            {note !== (row.admission_note ?? "") && (
              <button
                type="button"
                onClick={() => setNote(row.admission_note ?? "")}
                className="underline underline-offset-2 hover:text-[color:var(--color-fg-muted)]"
              >
                reset
              </button>
            )}
          </div>
        </div>
      )}

      {/* Expandable details panel */}
      {expanded && (
        <ExpandedPanel
          row={row}
          history={history}
          onCopyHash={copyHash}
          onRefreshHistory={refreshHistory}
          createdLabel={createdLabel}
        />
      )}
    </div>
  );
}

function MobileLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 md:block">
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)] md:hidden">
        {label}
      </span>
      <span className="md:block">{children}</span>
    </div>
  );
}

function ExpandedPanel({
  row,
  history,
  onCopyHash,
  onRefreshHistory,
  createdLabel,
}: {
  row: WaitlistRow;
  history: HistoryState;
  onCopyHash: () => void;
  onRefreshHistory: () => void;
  createdLabel: string;
}) {
  return (
    <div className="border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)]/40 px-4 py-4">
      <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
            Metadata
          </p>
          <dl className="mt-3 space-y-2 text-[12px]">
            <MetaRow label="Signed up">{createdLabel}</MetaRow>
            <MetaRow label="Verified phone">
              {row.verified_at
                ? formatDateTime(row.verified_at)
                : "Not verified"}
            </MetaRow>
            <MetaRow label="Identity">
              {row.identity_status === "verified"
                ? `Verified · …${(row.aadhaar_last4 ?? "????").padStart(4, "?")}`
                : row.identity_status}
            </MetaRow>
            <MetaRow label="Phone hash">
              <span className="inline-flex items-center gap-2">
                <code className="rounded bg-[color:var(--color-surface)] px-1.5 py-0.5 font-mono text-[10px] text-[color:var(--color-fg-muted)]">
                  …{row.phone_hash.slice(-12)}
                </code>
                <button
                  type="button"
                  onClick={onCopyHash}
                  title="Copy full phone hash"
                  className="inline-flex items-center gap-1 text-[10px] text-[color:var(--color-fg-subtle)] underline-offset-2 hover:text-[color:var(--color-fg-muted)] hover:underline"
                >
                  <Copy className="h-3 w-3" strokeWidth={2} />
                  copy
                </button>
              </span>
            </MetaRow>
            <MetaRow label="Current note">
              {row.admission_note ? (
                <span className="text-[color:var(--color-fg-muted)]">
                  {row.admission_note}
                </span>
              ) : (
                <span className="text-[color:var(--color-fg-subtle)]">—</span>
              )}
            </MetaRow>
          </dl>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
              Audit history
            </p>
            <button
              type="button"
              onClick={onRefreshHistory}
              className="text-[10px] text-[color:var(--color-fg-subtle)] underline-offset-2 hover:text-[color:var(--color-fg-muted)] hover:underline"
            >
              refresh
            </button>
          </div>
          <div className="mt-3">
            {history.status === "idle" || history.status === "loading" ? (
              <p className="text-[12px] text-[color:var(--color-fg-subtle)]">
                Loading history…
              </p>
            ) : history.status === "error" ? (
              <p className="text-[12px] text-[color:var(--color-danger)]">
                {history.error}
              </p>
            ) : history.data.entries.length === 0 ? (
              <p className="text-[12px] text-[color:var(--color-fg-subtle)]">
                Nothing yet — this row hasn&apos;t been reviewed.
              </p>
            ) : (
              <ol className="space-y-2">
                {history.data.entries.map((e) => (
                  <li
                    key={e.id}
                    className="rounded-[10px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-2"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <TransitionBadge
                        from={e.from_status as AdmissionStatus}
                        to={e.to_status as AdmissionStatus}
                      />
                      <span className="text-[color:var(--color-fg-subtle)]">
                        {e.admin_first_name ?? "Admin"}
                      </span>
                      <span className="text-[color:var(--color-fg-subtle)]">
                        · {formatDateTime(e.created_at)}
                      </span>
                    </div>
                    {e.note && (
                      <p className="mt-1 text-[12px] text-[color:var(--color-fg-muted)]">
                        &ldquo;{e.note}&rdquo;
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="font-mono text-[10px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
        {label}
      </dt>
      <dd className="text-right text-[color:var(--color-fg)]">{children}</dd>
    </div>
  );
}

function IdentityBadge({
  status,
}: {
  status: WaitlistRow["identity_status"];
}) {
  const tone =
    status === "verified"
      ? "text-[color:var(--color-success,var(--color-primary))]"
      : status === "failed"
        ? "text-[color:var(--color-danger)]"
        : "text-[color:var(--color-fg-subtle)]";
  return (
    <p className={`font-mono text-[10px] uppercase tracking-[0.12em] ${tone}`}>
      {status}
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

function TransitionBadge({
  from,
  to,
}: {
  from: AdmissionStatus;
  to: AdmissionStatus;
}) {
  return (
    <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[color:var(--color-fg-muted)]">
      <span className="text-[color:var(--color-fg-subtle)]">
        {labelFor(from)}
      </span>
      <span>→</span>
      <span
        className={
          to === "approved"
            ? "text-[color:var(--color-primary)]"
            : to === "declined"
              ? "text-[color:var(--color-danger)]"
              : "text-[color:var(--color-fg-muted)]"
        }
      >
        {labelFor(to)}
      </span>
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
  tone: "approve" | "decline" | "neutral" | "ghost";
  title?: string;
}) {
  const toneClass =
    tone === "approve"
      ? "border-[color:var(--color-primary)]/60 bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/20"
      : tone === "decline"
        ? "border-[color:var(--color-danger)]/40 bg-[color:var(--color-danger)]/5 text-[color:var(--color-danger)] hover:bg-[color:var(--color-danger)]/10"
        : tone === "neutral"
          ? "border-[color:var(--color-border)] bg-[color:var(--color-bg)] text-[color:var(--color-fg-muted)] hover:border-[color:var(--color-border-strong)]"
          : "border-transparent bg-transparent text-[color:var(--color-fg-subtle)] hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-fg-muted)]";
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
  return s === "pending_review"
    ? "Pending"
    : s === "approved"
      ? "Approved"
      : "Declined";
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
