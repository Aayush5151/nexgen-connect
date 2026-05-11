"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type CorridorState, corridorState } from "@/lib/app/services";
import { CorridorWelcome } from "@/components/app/CorridorWelcome";
import CorridorLoading from "./loading";

/**
 * /app/corridor — CH1 home, v18 trillion-dollar polish.
 *
 * Three layers per v15 BP §3.1.2 / v16 §Bucket 5:
 *   Layer 1 — hometown crew (the few people from your home city)
 *   Layer 2 — verified group (your intake, your university)
 *   Layer 3 — city ambient (whole-city vibes, no drilldown)
 *
 * Cold-start aware: when verifiedCount<5 we surface the "first five,
 * Aayush calls" story. When ≥5 but <60 we show the active group with
 * a locked-group-chat hint. When ≥60 the group chat unlocks (Bucket 7).
 *
 * v18 polish notes:
 *   - Real type hierarchy via semantic classes (display-lg / title-md / body-md).
 *   - Verified-count meter is a 1-pixel bar that fills toward 60 — Apple's
 *     "show, don't explain" school. Replaces the "X more to unlock" sentence
 *     as the primary status read.
 *   - Stagger reveals on the layered sections via `.stagger-children`.
 *     Pure CSS, prefers-reduced-motion neutralized at the globals level.
 *   - Presence dot beside the verified count = the small trust signal
 *     a wall of testimonials can never replace.
 *   - Member chips use `.card-interactive` so they read as touchable.
 *
 * v17 / v16 web pivot §Bucket 5.
 */
export default function CorridorPage() {
  const [data, setData] = useState<CorridorState | null>(null);

  useEffect(() => {
    void corridorState().then(setData);
  }, []);

  if (!data) return <CorridorLoading />;

  return (
    <div className="space-y-10 pt-2 stagger-children">
      {/* One-time celebration: fires exactly once per browser on
          first corridor visit. Self-gates via localStorage; mounting
          this on every visit is safe. */}
      <CorridorWelcome />

      <CorridorHeader data={data} style={{ "--i": 0 } as React.CSSProperties} />

      <div style={{ "--i": 1 } as React.CSSProperties}>
        {data.isColdStart ? <ColdStart /> : <Layered data={data} />}
      </div>

      <div style={{ "--i": 2 } as React.CSSProperties}>
        <SubCircles items={data.subCircles} />
      </div>

      <div style={{ "--i": 3 } as React.CSSProperties}>
        <Activity items={data.activity} />
      </div>

      <div style={{ "--i": 4 } as React.CSSProperties}>
        <ScamWarning />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Header — identity + meter                                            */
/* ------------------------------------------------------------------ */

function CorridorHeader({
  data,
  style,
}: {
  data: CorridorState;
  style?: React.CSSProperties;
}) {
  const pct = Math.min(100, Math.round((data.verifiedCount / data.threshold) * 100));
  const unlocked = data.verifiedCount >= data.threshold;

  return (
    <header style={style}>
      <div className="flex items-center gap-2">
        <span className="presence-dot" aria-hidden="true" />
        <p className="label-eyebrow text-[color:var(--color-primary)]">
          Corridor · {data.uni}
        </p>
      </div>

      <h1 className="mt-3 display-lg text-[color:var(--color-fg)]">
        {data.intake}
      </h1>

      <div className="mt-5 flex items-baseline gap-2">
        <span className="font-heading text-[28px] font-semibold tabular-nums tracking-[-0.02em] text-[color:var(--color-fg)]">
          {data.verifiedCount}
        </span>
        <span className="body-md text-[color:var(--color-fg-muted)]">
          verified {unlocked ? "" : `of ${data.threshold}`}
        </span>
      </div>

      {/* The meter. 1px tall, fills from 0% to (verifiedCount / threshold).
          When unlocked, the fill turns fully green and the track fades. */}
      <div
        className="mt-3 h-[2px] w-full overflow-hidden rounded-full bg-[color:var(--color-border)]"
        role="progressbar"
        aria-valuenow={data.verifiedCount}
        aria-valuemin={0}
        aria-valuemax={data.threshold}
        aria-label={`${data.verifiedCount} of ${data.threshold} verified`}
      >
        <div
          className="h-full rounded-full bg-[color:var(--color-primary)] transition-[width] duration-[700ms] ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="mt-3 body-sm text-[color:var(--color-fg-muted)]">
        {unlocked
          ? "Group chat is live. Walk in."
          : `${data.threshold - data.verifiedCount} more to unlock the group chat.`}
      </p>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Cold start                                                           */
/* ------------------------------------------------------------------ */

function ColdStart() {
  return (
    <section className="card p-6">
      <p className="label-eyebrow text-[color:var(--color-primary)]">
        First five
      </p>
      <h2 className="mt-3 title-xl text-[color:var(--color-fg)]">
        You&apos;re among the first.
      </h2>
      <p className="mt-3 body-md text-[color:var(--color-fg-muted)]">
        This corridor is brand new. Aayush will personally call you within
        48 hours of admit-letter approval to introduce you to the first
        verified students as they sign up.
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Layered (Layer 1 / 2 / 3)                                            */
/* ------------------------------------------------------------------ */

function Layered({ data }: { data: CorridorState }) {
  return (
    <section className="space-y-4">
      <Layer
        depth={1}
        title="Hometown crew"
        sub={
          data.layer1.length > 0
            ? `${data.layer1.length} from your city`
            : "Nobody from your city yet"
        }
      >
        {data.layer1.length > 0 ? (
          <div className="grid grid-cols-3 gap-2.5">
            {data.layer1.map((m) => (
              <MemberCard key={m.id} firstName={m.firstName} sub={m.homeCity} />
            ))}
          </div>
        ) : (
          <p className="body-sm text-[color:var(--color-fg-muted)]">
            We&apos;ll notify you the moment someone from your city joins this
            corridor.
          </p>
        )}
      </Layer>

      <Layer
        depth={2}
        title="Verified group"
        sub={`${data.verifiedCount} verified across all home cities`}
        cta={
          data.groupChatLocked
            ? {
                href: "/app/chat",
                label: `Group chat unlocks at ${data.threshold}`,
                disabled: true,
              }
            : { href: "/app/chat", label: "Open group chat", disabled: false }
        }
      >
        <div className="flex flex-wrap gap-2">
          {data.layer2.slice(0, 8).map((m) => (
            <MemberChip key={m.id} firstName={m.firstName} />
          ))}
          {data.verifiedCount > 8 && (
            <span className="inline-flex items-center rounded-full border border-dashed border-[color:var(--color-border)] px-3 py-1 text-[12px] text-[color:var(--color-fg-subtle)]">
              +{data.verifiedCount - 8} more
            </span>
          )}
        </div>
      </Layer>

      <Layer
        depth={3}
        title="City ambient"
        sub={`${data.layer3Count} across the whole city`}
      >
        <p className="body-sm text-[color:var(--color-fg-muted)]">
          Whole-city vibes. No drilldown. We keep this layer ambient so you
          don&apos;t feel pressure to message strangers.
        </p>
      </Layer>
    </section>
  );
}

function Layer({
  depth,
  title,
  sub,
  cta,
  children,
}: {
  depth: 1 | 2 | 3;
  title: string;
  sub: string;
  cta?: { href: string; label: string; disabled: boolean };
  children: React.ReactNode;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[10px] font-semibold tabular-nums text-[color:var(--color-fg-subtle)]">
            L{depth}
          </span>
          <p className="title-sm text-[color:var(--color-fg)]">{title}</p>
        </div>
        <p className="body-sm text-[color:var(--color-fg-muted)]">{sub}</p>
      </div>
      <div className="mt-4">{children}</div>
      {cta && (
        <Link
          href={cta.disabled ? "#" : cta.href}
          aria-disabled={cta.disabled}
          className={
            "mt-5 inline-flex h-10 items-center rounded-md px-4 text-[13px] font-semibold transition-[background-color,transform] active:scale-[0.98] " +
            (cta.disabled
              ? "cursor-not-allowed bg-[color:var(--color-surface-elevated)] text-[color:var(--color-fg-subtle)]"
              : "bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)] hover:bg-[color:var(--color-primary-hover)]")
          }
        >
          {cta.label}
          {!cta.disabled && <span aria-hidden="true" className="ml-1.5">→</span>}
        </Link>
      )}
    </div>
  );
}

function MemberCard({ firstName, sub }: { firstName: string; sub: string }) {
  return (
    <div className="card-interactive border border-[color:var(--color-border)] p-3 text-center">
      <p className="title-sm text-[color:var(--color-fg)]">{firstName}</p>
      <p className="mt-1 body-sm text-[color:var(--color-fg-subtle)]">{sub}</p>
    </div>
  );
}

function MemberChip({ firstName }: { firstName: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-3 py-1 text-[12px] text-[color:var(--color-fg-muted)] transition-[border-color,color] hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-fg)]">
      <span
        aria-hidden="true"
        className="h-1 w-1 rounded-full bg-[color:var(--color-primary)]"
      />
      {firstName}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-circles                                                          */
/* ------------------------------------------------------------------ */

function SubCircles({
  items,
}: {
  items: { name: string; memberCount: number; lastActive: string }[];
}) {
  return (
    <section>
      <p className="label-eyebrow text-[color:var(--color-fg-subtle)]">
        Sub-circles
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {items.map((s) => (
          <Link
            key={s.name}
            href={`/app/corridor/sub-circles/${slug(s.name)}`}
            className="card-interactive group block p-4"
          >
            <p className="title-sm text-[color:var(--color-fg)] transition-colors group-hover:text-[color:var(--color-primary)]">
              {s.name}
              <span
                aria-hidden="true"
                className="ml-1 inline-block translate-x-0 opacity-0 transition-[transform,opacity] group-hover:translate-x-0.5 group-hover:opacity-100"
              >
                →
              </span>
            </p>
            <p className="mt-1 body-sm text-[color:var(--color-fg-subtle)]">
              {s.memberCount} verified · {s.lastActive}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function slug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

/* ------------------------------------------------------------------ */
/* Activity feed                                                        */
/* ------------------------------------------------------------------ */

function Activity({
  items,
}: {
  items: { id: string; kind: string; firstName: string; whenIso: string; text: string }[];
}) {
  return (
    <section>
      <p className="label-eyebrow text-[color:var(--color-fg-subtle)]">
        Activity
      </p>
      <ul className="card mt-4 divide-y divide-[color:var(--color-border)] overflow-hidden">
        {items.map((a) => (
          <li key={a.id} className="flex items-start gap-3 px-4 py-3.5">
            <span
              aria-hidden="true"
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--color-primary)]"
            />
            <div className="min-w-0 flex-1">
              <p className="body-sm text-[color:var(--color-fg)]">
                <span className="font-semibold">{a.firstName}</span>{" "}
                <span className="text-[color:var(--color-fg-muted)]">{a.text}</span>
              </p>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                {timeAgo(a.whenIso)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function timeAgo(iso: string) {
  const min = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60_000));
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  return `${h}h ago`;
}

/* ------------------------------------------------------------------ */
/* Scam warning                                                         */
/* ------------------------------------------------------------------ */

function ScamWarning() {
  return (
    <section className="card border border-[color:var(--color-warning)]/25 bg-[color:var(--color-warning)]/[0.06] p-5">
      <p className="label-eyebrow text-[color:var(--color-warning)]">
        Scam alert
      </p>
      <p className="mt-3 body-md text-[color:var(--color-fg)]">
        Anyone asking for a deposit before a tour is not a real landlord.
      </p>
      <Link
        href="/app/help/scams"
        className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[color:var(--color-fg)] underline decoration-dotted underline-offset-4 hover:text-[color:var(--color-primary)]"
      >
        See the 5 patterns we&apos;ve seen
        <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
