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

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; verified?: string }>;
}) {
  const params = await searchParams;
  const status = parseStatus(params.status);
  const q = params.q?.trim() || undefined;
  const verifiedOnly = params.verified !== "all";

  const [statsRes, listRes] = await Promise.all([
    getAdminStatsAction(),
    listWaitlistForAdminAction({
      status,
      q,
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

  return (
    <section className="container-narrow py-10 md:py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
            Review queue
          </p>
          <h1 className="mt-2 font-heading text-[28px] font-semibold leading-tight text-[color:var(--color-fg)] md:text-[32px]">
            Admit the next 100.
          </h1>
          <p className="mt-2 max-w-[520px] text-[13px] text-[color:var(--color-fg-muted)]">
            Every row here has verified their phone. Approve the ones whose city
            and university check out. Decline scams. Leave the rest.
          </p>
        </div>
      </div>

      <StatsGrid stats={stats} />

      <div className="mt-10">
        <Filters status={status} q={q ?? ""} verifiedOnly={verifiedOnly} />
        {listError ? (
          <div className="mt-6 rounded-[12px] border border-[color:var(--color-danger)]/40 bg-[color:var(--color-danger)]/5 p-4 text-[13px] text-[color:var(--color-danger)]">
            {listError}
          </div>
        ) : (
          <AdminReviewTable rows={rows} />
        )}
      </div>
    </section>
  );
}

function StatsGrid({
  stats,
}: {
  stats: {
    total: number;
    pending_review: number;
    approved: number;
    declined: number;
    verified_phone: number;
    identity_verified: number;
  };
}) {
  const items: Array<{ label: string; value: number; tone?: "primary" }> = [
    { label: "Pending", value: stats.pending_review, tone: "primary" },
    { label: "Approved", value: stats.approved },
    { label: "Declined", value: stats.declined },
    { label: "Phone verified", value: stats.verified_phone },
    { label: "Identity verified", value: stats.identity_verified },
    { label: "Total", value: stats.total },
  ];

  return (
    <div className="grid gap-3 rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 md:grid-cols-6 md:p-5">
      {items.map((it) => (
        <div key={it.label}>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
            {it.label}
          </p>
          <p
            className={
              "mt-1 font-heading text-[28px] font-semibold leading-none " +
              (it.tone === "primary"
                ? "text-[color:var(--color-primary)]"
                : "text-[color:var(--color-fg)]")
            }
          >
            {it.value.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}

function Filters({
  status,
  q,
  verifiedOnly,
}: {
  status: AllowedStatus;
  q: string;
  verifiedOnly: boolean;
}) {
  const options: Array<{ value: AllowedStatus; label: string }> = [
    { value: "pending_review", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "declined", label: "Declined" },
    { value: "all", label: "All" },
  ];

  return (
    <form
      method="GET"
      action="/admin"
      className="flex flex-wrap items-end gap-3 rounded-[12px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3 md:p-4"
    >
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = opt.value === status;
          return (
            <label
              key={opt.value}
              className={
                "cursor-pointer rounded-[8px] border px-3 py-1.5 text-[12px] font-medium transition-colors " +
                (active
                  ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)]"
                  : "border-[color:var(--color-border)] bg-[color:var(--color-bg)] text-[color:var(--color-fg-muted)] hover:border-[color:var(--color-border-strong)]")
              }
            >
              <input
                type="radio"
                name="status"
                value={opt.value}
                defaultChecked={active}
                className="sr-only"
              />
              {opt.label}
            </label>
          );
        })}
      </div>
      <label className="flex items-center gap-2 text-[12px] text-[color:var(--color-fg-muted)]">
        <input
          type="checkbox"
          name="verified"
          value="all"
          defaultChecked={!verifiedOnly}
          className="h-4 w-4 rounded border-[color:var(--color-border)] bg-[color:var(--color-bg)]"
        />
        Include unverified
      </label>
      <div className="min-w-[200px] flex-1">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search name or city"
          className="w-full rounded-[8px] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-3 py-2 text-[13px] text-[color:var(--color-fg)] placeholder:text-[color:var(--color-fg-placeholder)] focus:border-[color:var(--color-primary)] focus:outline-none"
        />
      </div>
      <button
        type="submit"
        className="rounded-[8px] bg-[color:var(--color-primary)] px-4 py-2 text-[12px] font-medium text-[color:var(--color-primary-fg)] transition-colors hover:bg-[color:var(--color-primary-hover)]"
      >
        Apply
      </button>
    </form>
  );
}
