import Link from "next/link";

import {
  getSignupStatsAction,
  listSignupsForAdminAction,
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
 * /admin — minimal review surface.
 *
 * One H1, one inline counts strip, two tabs (Pending / All), and the
 * list. No motivational copy, no stat cards, no search, no
 * verified-only toggle. The unverified-phone filter (someone who
 * started OTP but never completed) is applied silently because those
 * rows have nothing actionable on them yet.
 *
 * Fits the beta cohort (single-digit signups/day) and stays clean as
 * the queue grows. Filtering, search, and detailed stats can come back
 * as a follow-up when the volume justifies them.
 */
export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const status = parseStatus(sp.status);

  const [statsRes, listRes] = await Promise.all([
    getSignupStatsAction(),
    listSignupsForAdminAction({
      status,
      verified_only: true,
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
    <section className="container-narrow py-8 md:py-12">
      <header className="flex items-end justify-between gap-4">
        <h1 className="font-heading text-[24px] font-semibold leading-tight text-[color:var(--color-fg)] md:text-[28px]">
          Review queue
        </h1>
        {stats.total > 0 && (
          <p className="text-[12px] text-[color:var(--color-fg-subtle)]">
            {stats.pending_review} pending · {stats.approved} approved ·{" "}
            {stats.declined} declined
          </p>
        )}
      </header>

      <Tabs current={status} stats={stats} />

      <div className="mt-6">
        {listError ? (
          <div className="rounded-[12px] border border-[color:var(--color-danger)]/40 bg-[color:var(--color-danger)]/5 p-4 text-[13px] text-[color:var(--color-danger)]">
            {listError}
          </div>
        ) : (
          <AdminReviewTable rows={rows} currentStatus={status} />
        )}
      </div>
    </section>
  );
}

/**
 * Two tabs: Pending (default) and All. Approved / Declined are
 * accessible from the All view via the row's status pill — splitting
 * them into separate tabs added zero signal for early volumes.
 */
function Tabs({
  current,
  stats,
}: {
  current: AllowedStatus;
  stats: { pending_review: number; total: number };
}) {
  const tabs: Array<{ key: AllowedStatus; label: string; count: number }> = [
    { key: "pending_review", label: "Pending", count: stats.pending_review },
    { key: "all", label: "All", count: stats.total },
  ];
  return (
    <nav className="mt-6 flex items-center gap-1 border-b border-[color:var(--color-border)]">
      {tabs.map((t) => {
        const active = t.key === current;
        const href = t.key === "pending_review" ? "/admin" : `/admin?status=${t.key}`;
        return (
          <Link
            key={t.key}
            href={href}
            className={`relative -mb-px inline-flex items-center gap-2 px-3 py-2 text-[13px] font-medium transition-colors ${
              active
                ? "border-b-2 border-[color:var(--color-primary)] text-[color:var(--color-fg)]"
                : "border-b-2 border-transparent text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]"
            }`}
          >
            {t.label}
            <span
              className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] ${
                active
                  ? "bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)]"
                  : "bg-[color:var(--color-surface)] text-[color:var(--color-fg-subtle)]"
              }`}
            >
              {t.count}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
