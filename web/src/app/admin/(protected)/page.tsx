import Link from "next/link";

import {
  getAdminStatsAction,
  listWaitlistForAdminAction,
} from "@/app/actions/admin";
import type { AdmissionStatus } from "@/lib/supabase/schema";
import { AdminReviewTable } from "./AdminReviewTable";

export const dynamic = "force-dynamic";

type AllowedStatus = "all" | AdmissionStatus;

function parseStatus(raw: string | undefined): AllowedStatus {
  if (
    raw === "all" ||
    raw === "pending_review" ||
    raw === "approved" ||
    raw === "declined"
  ) {
    return raw;
  }
  return "pending_review";
}

/**
 * Build an /admin URL that preserves the non-target filters but overrides one
 * or two specific keys. Used by the stat cards and the verified-only toggle
 * so clicking them never nukes the rest of the filter state.
 */
function buildHref(
  current: { status: AllowedStatus; q: string; verifiedOnly: boolean },
  patch: Partial<{ status: AllowedStatus; q: string; verifiedOnly: boolean }>,
): string {
  const next = { ...current, ...patch };
  const qs = new URLSearchParams();
  if (next.status !== "pending_review") qs.set("status", next.status);
  if (next.q) qs.set("q", next.q);
  if (!next.verifiedOnly) qs.set("verified", "all");
  const query = qs.toString();
  return query ? `/admin?${query}` : "/admin";
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; verified?: string }>;
}) {
  const sp = await searchParams;
  const status = parseStatus(sp.status);
  const q = sp.q?.trim() || "";
  const verifiedOnly = sp.verified !== "all";

  const [statsRes, listRes] = await Promise.all([
    getAdminStatsAction(),
    listWaitlistForAdminAction({
      status,
      q: q || undefined,
      verified_only: verifiedOnly,
    }),
  ]);

  const stats = statsRes.ok
    ? statsRes.stats
    : {
        total: 0,
        pending_review: 0,
        approved: 0,
        declined: 0,
        verified_phone: 0,
        identity_verified: 0,
      };
  const rows = listRes.ok ? listRes.rows : [];
  const listError = !listRes.ok ? listRes.error : null;
  const filterState = { status, q, verifiedOnly };

  return (
    <section className="container-narrow py-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
            Review queue
          </p>
          <h1 className="mt-2 font-heading text-[28px] font-semibold leading-tight text-[color:var(--color-fg)] md:text-[32px]">
            Admit the next 100.
          </h1>
          <p className="mt-2 max-w-[520px] text-[13px] text-[color:var(--color-fg-muted)]">
            {stats.pending_review === 0 ? (
              <>You&apos;re all caught up. No one waiting for review.</>
            ) : (
              <>
                <span className="font-medium text-[color:var(--color-fg)]">
                  {stats.pending_review}
                </span>{" "}
                {stats.pending_review === 1 ? "person is" : "people are"}{" "}
                waiting on you. Approve the ones whose city and university
                check out. Decline scams. Leave the rest.
              </>
            )}
          </p>
        </div>
      </div>

      <StatusCards stats={stats} filterState={filterState} />
      <SecondaryStats stats={stats} />

      <div className="mt-8">
        <FilterBar filterState={filterState} />
        {listError ? (
          <div className="mt-4 rounded-[12px] border border-[color:var(--color-danger)]/40 bg-[color:var(--color-danger)]/5 p-4 text-[13px] text-[color:var(--color-danger)]">
            {listError}
          </div>
        ) : (
          <AdminReviewTable
            rows={rows}
            currentStatus={status}
            verifiedOnly={verifiedOnly}
          />
        )}
      </div>
    </section>
  );
}

/**
 * Four primary filter cards - clicking one changes the status filter.
 * The active card is highlighted so the dashboard always tells you which
 * slice you're looking at. "All" lets the founder step through every row
 * in one tab.
 */
function StatusCards({
  stats,
  filterState,
}: {
  stats: {
    total: number;
    pending_review: number;
    approved: number;
    declined: number;
  };
  filterState: { status: AllowedStatus; q: string; verifiedOnly: boolean };
}) {
  const cards: Array<{
    key: AllowedStatus;
    label: string;
    value: number;
    tone: "primary" | "neutral" | "success" | "danger";
  }> = [
    {
      key: "pending_review",
      label: "Pending",
      value: stats.pending_review,
      tone: "primary",
    },
    {
      key: "approved",
      label: "Approved",
      value: stats.approved,
      tone: "success",
    },
    {
      key: "declined",
      label: "Declined",
      value: stats.declined,
      tone: "danger",
    },
    { key: "all", label: "All", value: stats.total, tone: "neutral" },
  ];

  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
      {cards.map((c) => {
        const active = c.key === filterState.status;
        const toneBase =
          c.tone === "primary"
            ? "text-[color:var(--color-primary)]"
            : c.tone === "success"
              ? "text-[color:var(--color-success,var(--color-primary))]"
              : c.tone === "danger"
                ? "text-[color:var(--color-danger)]"
                : "text-[color:var(--color-fg)]";
        return (
          <Link
            key={c.key}
            href={buildHref(filterState, { status: c.key })}
            className={`group block rounded-[14px] border p-4 transition-colors ${
              active
                ? "border-[color:var(--color-primary)]/60 bg-[color:var(--color-primary)]/5"
                : "border-[color:var(--color-border)] bg-[color:var(--color-surface)] hover:border-[color:var(--color-border-strong)]"
            }`}
          >
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
              {c.label}
              {active && (
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)]" />
              )}
            </p>
            <p
              className={`mt-2 font-heading text-[32px] font-semibold leading-none ${toneBase}`}
            >
              {c.value.toLocaleString()}
            </p>
          </Link>
        );
      })}
    </div>
  );
}

/**
 * Inline sub-stats below the filter cards: phone-verified count and
 * identity-verified count. Not clickable - they're context, not filters.
 */
function SecondaryStats({
  stats,
}: {
  stats: { verified_phone: number; identity_verified: number };
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-[color:var(--color-fg-subtle)]">
      <span>
        <span className="font-mono uppercase tracking-[0.08em]">
          Phone verified
        </span>
        <span className="ml-2 font-medium text-[color:var(--color-fg-muted)]">
          {stats.verified_phone}
        </span>
      </span>
      <span>
        <span className="font-mono uppercase tracking-[0.08em]">
          Identity verified
        </span>
        <span className="ml-2 font-medium text-[color:var(--color-fg-muted)]">
          {stats.identity_verified}
        </span>
      </span>
    </div>
  );
}

/**
 * Filter bar: search + verified-only toggle. No "Apply" button -
 *  - Search auto-submits the form on Enter or blur (native form behaviour).
 *  - The toggle is a Link that flips the `verified` query param in-place,
 *    preserving the search text and active status.
 */
function FilterBar({
  filterState,
}: {
  filterState: { status: AllowedStatus; q: string; verifiedOnly: boolean };
}) {
  const { q, verifiedOnly, status } = filterState;
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[12px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3">
      <form
        method="GET"
        action="/admin"
        className="flex flex-1 items-center gap-2 min-w-[240px]"
      >
        {/* Preserve current status + verified-only in the search form */}
        {status !== "pending_review" && (
          <input type="hidden" name="status" value={status} />
        )}
        {!verifiedOnly && <input type="hidden" name="verified" value="all" />}
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[11px] text-[color:var(--color-fg-subtle)]">
            /
          </span>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search name or city · press Enter"
            className="w-full rounded-[8px] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] pl-7 pr-3 py-2 text-[13px] text-[color:var(--color-fg)] placeholder:text-[color:var(--color-fg-placeholder)] focus:border-[color:var(--color-primary)] focus:outline-none"
          />
        </div>
        {q && (
          <Link
            href={buildHref(filterState, { q: "" })}
            className="text-[11px] text-[color:var(--color-fg-subtle)] underline-offset-2 hover:text-[color:var(--color-fg-muted)] hover:underline"
          >
            clear
          </Link>
        )}
      </form>
      <Link
        href={buildHref(filterState, { verifiedOnly: !verifiedOnly })}
        className={`inline-flex items-center gap-2 rounded-[8px] border px-3 py-2 text-[12px] font-medium transition-colors ${
          verifiedOnly
            ? "border-[color:var(--color-primary)]/40 bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)]"
            : "border-[color:var(--color-border)] bg-[color:var(--color-bg)] text-[color:var(--color-fg-muted)] hover:border-[color:var(--color-border-strong)]"
        }`}
        aria-pressed={verifiedOnly}
      >
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            verifiedOnly
              ? "bg-[color:var(--color-primary)]"
              : "bg-[color:var(--color-border-strong)]"
          }`}
        />
        Phone-verified only
      </Link>
    </div>
  );
}
