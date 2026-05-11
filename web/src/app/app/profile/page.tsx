"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type ProfileSnapshot, profileSnapshot } from "@/lib/app/services";

/**
 * /app/profile — profile, plan, actions.
 *
 * Sections:
 *   - Identity card (firstName, homeCity, uni, intake)
 *   - Plan (free vs premium ₹999)
 *   - Actions: parent view, group-apply, arrival check-in, settings
 *   - Account: data export, delete account (60min ACK / 30day cascade)
 *
 * v16 web pivot §Bucket 5.
 */
export default function ProfilePage() {
  const [data, setData] = useState<ProfileSnapshot | null>(null);

  useEffect(() => {
    void profileSnapshot().then(setData);
  }, []);

  if (!data) {
    return <p className="pt-6 text-[15px] text-[color:var(--color-fg-muted)]">Loading…</p>;
  }

  return (
    <div className="space-y-6 pt-2">
      <header>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-primary)]">
          Profile
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]">
          {data.firstName}
        </h1>
        <p className="mt-1 text-[13px] text-[color:var(--color-fg-muted)]">
          {data.uni} · {data.intake}
        </p>
      </header>

      <PlanCard premium={data.premium} />

      <section className="space-y-3">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
          Premium actions
        </p>
        <Action
          href="/app/profile/parent"
          title="Parent view"
          sub={data.parentLinkedAt ? "Linked" : "Magic-link, single-use, expires in 1h"}
          locked={!data.premium}
        />
        <Action
          href="/app/profile/group-apply"
          title="Group apply"
          sub={data.groupApplyJoinedAt ? "In a group" : "3–6 verified students apply for housing together"}
          locked={!data.premium}
        />
        <Action
          href="/app/profile/y6"
          title="Arrival check-in"
          sub={data.arrivalCheckedInAt ? "Checked in" : "Y6, log arrival, parent gets a notification"}
          locked={!data.premium}
        />
      </section>

      <section className="space-y-3">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
          Account
        </p>
        <Action href="/app/profile/settings" title="Settings" sub="Notifications, language, reduce motion" />
        <Action
          href="/app/profile/settings#data"
          title="Export my data"
          sub="JSON download. Delivered by email."
        />
        <Action
          href="/app/profile/settings#delete"
          title="Delete account"
          sub="60-min ACK, 30-day cascade. GDPR Art. 17 + DPDP §13."
        />
      </section>
    </div>
  );
}

function PlanCard({ premium }: { premium: boolean }) {
  if (premium) {
    return (
      <section className="rounded-[14px] border border-[color:var(--color-primary)]/30 bg-[color:var(--color-surface)] p-5">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-primary)]">
          Plan · Premium
        </p>
        <p className="mt-3 text-[14px] text-[color:var(--color-fg)]">
          Parent view, group apply, arrival check-in, 1h T&amp;S SLA.
        </p>
      </section>
    );
  }
  return (
    <section className="rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
        Plan · Free
      </p>
      <p className="mt-3 text-[14px] text-[color:var(--color-fg)]">
        Verified corridor + chat. Always free.
      </p>
      <Link
        href="/app/profile/premium"
        className="mt-4 inline-flex h-11 items-center rounded-[10px] bg-[color:var(--color-primary)] px-4 text-[13px] font-semibold text-[color:var(--color-primary-fg)] transition-[background-color] hover:bg-[color:var(--color-primary-hover)]"
      >
        Premium · ₹999 once
      </Link>
    </section>
  );
}

function Action({
  href,
  title,
  sub,
  locked,
}: {
  href: string;
  title: string;
  sub: string;
  locked?: boolean;
}) {
  if (locked) {
    return (
      <Link
        href="/app/profile/premium"
        className="block rounded-[12px] border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 transition-colors hover:border-[color:var(--color-primary)]/60"
      >
        <p className="text-[14px] font-semibold text-[color:var(--color-fg)]">
          {title}{" "}
          <span className="ml-1 align-middle font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-primary)]">
            Premium
          </span>
        </p>
        <p className="mt-1 text-[12px] text-[color:var(--color-fg-muted)]">{sub}</p>
      </Link>
    );
  }
  return (
    <Link
      href={href}
      className="block rounded-[12px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 transition-colors hover:bg-[color:var(--color-bg)]"
    >
      <p className="text-[14px] font-semibold text-[color:var(--color-fg)]">{title}</p>
      <p className="mt-1 text-[12px] text-[color:var(--color-fg-muted)]">{sub}</p>
    </Link>
  );
}
