"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type ProfileSnapshot, profileSnapshot } from "@/lib/app/services";
import ProfileLoading from "./loading";

/**
 * /app/profile — profile, plan, actions, v18 trillion-dollar polish.
 *
 * Sections:
 *   - Identity card (firstName, homeCity, uni, intake)
 *   - Plan (free vs premium ₹999)
 *   - Actions: parent view, group-apply, arrival check-in, settings
 *   - Account: data export, delete account (60min ACK / 30day cascade)
 *
 * v18 polish notes:
 *   - Real type hierarchy with semantic classes.
 *   - Plan card uses `card` + premium accent; CTA button has the
 *     standard active:scale-[0.98] press feedback.
 *   - Action rows use `card-interactive` so they read as "tap me"
 *     rather than "decoration around text".
 *   - Locked-premium rows: dashed border + "Premium" mono pill at
 *     end, not interrupting the title rhythm.
 *   - Section reveals are staggered via `.stagger-children`.
 *
 * v17 / v16 web pivot §Bucket 5.
 */
export default function ProfilePage() {
  const [data, setData] = useState<ProfileSnapshot | null>(null);

  useEffect(() => {
    void profileSnapshot().then(setData);
  }, []);

  if (!data) return <ProfileLoading />;

  return (
    <div className="space-y-8 pt-2 stagger-children">
      <header style={{ "--i": 0 } as React.CSSProperties}>
        <div className="flex items-center gap-2">
          <span className="presence-dot" aria-hidden="true" />
          {/* v18 green-tint trim: the "Profile" eyebrow doesn't need
              primary tint — the presence dot already carries the
              signal. Eyebrow demoted to fg-subtle so green stays
              meaningful (CTAs, verified states, primary statuses). */}
          <p className="label-eyebrow text-[color:var(--color-fg-subtle)]">
            Profile
          </p>
        </div>
        <h1 className="mt-3 display-lg text-[color:var(--color-fg)]">
          {data.firstName}
        </h1>
        <p className="mt-2 body-md text-[color:var(--color-fg-muted)]">
          {data.uni} · {data.intake}
        </p>
      </header>

      <div style={{ "--i": 1 } as React.CSSProperties}>
        <PlanCard premium={data.premium} />
      </div>

      {/* Verification badge — the externally-portable status mark.
          The single most-valuable status artifact the product
          produces. Downloads as a static SVG (320×320) the user can
          drop into their LinkedIn / Instagram bio / Twitter / email
          signature. Mechanism 1 — every external use is free
          advertising for the company. Yelp Elite pattern. */}
      <section
        className="card p-6"
        style={{ "--i": 1.5 } as React.CSSProperties}
      >
        <div className="flex items-start gap-5">
          {/* SVG inline preview, scaled small. The download is the
              same asset at full resolution. */}
          <div className="relative shrink-0">
            <span
              aria-hidden="true"
              className="block h-20 w-20 rounded-[12px] bg-[color:var(--color-primary)]"
            >
              <svg
                viewBox="0 0 12 12"
                className="absolute inset-0 m-auto h-10 w-10 text-[color:var(--color-primary-fg)]"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 9V3l6 6V3"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="label-eyebrow text-[color:var(--color-primary)]">
              Your verified badge
            </p>
            <h2 className="mt-2 title-md text-[color:var(--color-fg)]">
              Wear it where it matters.
            </h2>
            <p className="mt-2 body-sm text-[color:var(--color-fg-muted)]">
              A small badge for your LinkedIn, Instagram bio, or email
              signature. The mark identifies you as a verified member
              of a NexGen corridor.
            </p>
            <a
              href="/badge.svg"
              download="nexgen-verified-badge.svg"
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface-elevated)] px-4 text-[12.5px] font-semibold text-[color:var(--color-fg)] transition-colors hover:border-[color:var(--color-primary)]/55"
            >
              Download badge
              <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
      </section>

      <section
        className="space-y-3"
        style={{ "--i": 2 } as React.CSSProperties}
      >
        <p className="label-eyebrow text-[color:var(--color-fg-subtle)]">
          Premium actions
        </p>
        <Action
          href="/app/profile/parent"
          title="Parent view"
          sub={
            data.parentLinkedAt
              ? "Linked"
              : "Magic-link, single-use, expires in 1h"
          }
          locked={!data.premium}
        />
        <Action
          href="/app/profile/group-apply"
          title="Group apply"
          sub={
            data.groupApplyJoinedAt
              ? "In a group"
              : "3–6 verified students apply for housing together"
          }
          locked={!data.premium}
        />
        <Action
          href="/app/profile/y6"
          title="Arrival check-in"
          sub={
            data.arrivalCheckedInAt
              ? "Checked in"
              : "Y6, log arrival, parent gets a notification"
          }
          locked={!data.premium}
        />
      </section>

      <section
        className="space-y-3"
        style={{ "--i": 3 } as React.CSSProperties}
      >
        <p className="label-eyebrow text-[color:var(--color-fg-subtle)]">
          Account
        </p>
        <Action
          href="/app/profile/settings"
          title="Settings"
          sub="Notifications, language, reduce motion"
        />
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
      <section className="card relative overflow-hidden border border-[color:var(--color-primary)]/30 p-6">
        <p className="label-eyebrow text-[color:var(--color-primary)]">
          Plan · Premium
        </p>
        <p className="mt-3 body-md text-[color:var(--color-fg)]">
          Parent view, group apply, arrival check-in, 1h T&amp;S SLA.
        </p>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[color:var(--color-primary)]/[0.08] blur-2xl"
        />
      </section>
    );
  }
  return (
    <section className="card p-6">
      <p className="label-eyebrow text-[color:var(--color-fg-subtle)]">
        Plan · Free
      </p>
      <p className="mt-3 body-md text-[color:var(--color-fg)]">
        Verified corridor + chat. Always free.
      </p>
      <Link
        href="/app/profile/premium"
        className="mt-5 inline-flex h-11 items-center rounded-[10px] bg-[color:var(--color-primary)] px-4 text-[13px] font-semibold text-[color:var(--color-primary-fg)] transition-[background-color,transform] hover:bg-[color:var(--color-primary-hover)] active:scale-[0.98]"
      >
        Premium · ₹999 once
        <span aria-hidden="true" className="ml-1.5">→</span>
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
        className="card-interactive block border border-dashed border-[color:var(--color-border)] p-4"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="title-sm text-[color:var(--color-fg)]">{title}</p>
          <span className="rounded-full border border-[color:var(--color-primary)]/40 px-2 py-[2px] font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-primary)]">
            Premium
          </span>
        </div>
        <p className="mt-1 body-sm text-[color:var(--color-fg-muted)]">{sub}</p>
      </Link>
    );
  }
  return (
    <Link
      href={href}
      className="card-interactive group block p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="title-sm text-[color:var(--color-fg)]">
          {title}
        </p>
        <span
          aria-hidden="true"
          className="text-[color:var(--color-fg-subtle)] transition-[transform,color] group-hover:translate-x-0.5 group-hover:text-[color:var(--color-fg)]"
        >
          →
        </span>
      </div>
      <p className="mt-1 body-sm text-[color:var(--color-fg-muted)]">{sub}</p>
    </Link>
  );
}
