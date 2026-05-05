"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type CorridorState, corridorState } from "@/lib/app/services";

/**
 * /app/corridor — CH1 home.
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
 * v16 web pivot §Bucket 5.
 */
export default function CorridorPage() {
  const [data, setData] = useState<CorridorState | null>(null);

  useEffect(() => {
    void corridorState().then(setData);
  }, []);

  if (!data) return <Loading />;

  return (
    <div className="space-y-8 pt-2">
      <header>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-primary)]">
          Corridor · {data.uni}
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]">
          {data.intake}
        </h1>
        <p className="mt-1 text-[13px] text-[color:var(--color-fg-muted)]">
          {data.verifiedCount} verified ·{" "}
          {data.verifiedCount < data.threshold
            ? `${data.threshold - data.verifiedCount} more to unlock the group chat`
            : "group chat live"}
        </p>
      </header>

      {data.isColdStart ? <ColdStart /> : <Layered data={data} />}

      <SubCircles items={data.subCircles} />

      <Activity items={data.activity} />

      <ScamWarning />
    </div>
  );
}

function Loading() {
  return (
    <p className="pt-6 text-[15px] text-[color:var(--color-fg-muted)]">
      Loading your corridor…
    </p>
  );
}

function ColdStart() {
  return (
    <section className="rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-primary)]">
        First five
      </p>
      <h2 className="mt-2 font-heading text-2xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]">
        You&apos;re among the first.
      </h2>
      <p className="mt-2 text-[14px] leading-[1.6] text-[color:var(--color-fg-muted)]">
        This corridor is brand new. Aayush will personally call you within 48
        hours of admit-letter approval to introduce you to the first verified
        students as they sign up.
      </p>
    </section>
  );
}

function Layered({ data }: { data: CorridorState }) {
  return (
    <section className="space-y-4">
      <Layer
        title="Hometown crew · Layer 1"
        sub={data.layer1.length > 0 ? `${data.layer1.length} from your city` : "Nobody from your city yet"}
      >
        <div className="grid grid-cols-3 gap-2">
          {data.layer1.map((m) => (
            <MemberCard key={m.id} firstName={m.firstName} sub={m.homeCity} />
          ))}
        </div>
      </Layer>

      <Layer
        title="Verified group · Layer 2"
        sub={`${data.verifiedCount} verified across all home cities`}
        cta={
          data.groupChatLocked
            ? {
                href: "/app/chat",
                label: `Group chat unlocks at ${data.threshold} verified`,
                disabled: true,
              }
            : { href: "/app/chat", label: "Open group chat", disabled: false }
        }
      >
        <div className="flex flex-wrap gap-2">
          {data.layer2.slice(0, 8).map((m) => (
            <span
              key={m.id}
              className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-1 text-[12px] text-[color:var(--color-fg-muted)]"
            >
              {m.firstName}
            </span>
          ))}
          {data.verifiedCount > 8 && (
            <span className="rounded-full border border-dashed border-[color:var(--color-border)] px-3 py-1 text-[12px] text-[color:var(--color-fg-subtle)]">
              +{data.verifiedCount - 8} more
            </span>
          )}
        </div>
      </Layer>

      <Layer
        title="City ambient · Layer 3"
        sub={`${data.layer3Count} verified across the whole city`}
      >
        <p className="text-[13px] leading-[1.5] text-[color:var(--color-fg-muted)]">
          Whole-city vibes. No drilldown. We keep this layer ambient so you
          don&apos;t feel pressure to message strangers.
        </p>
      </Layer>
    </section>
  );
}

function Layer({
  title,
  sub,
  cta,
  children,
}: {
  title: string;
  sub: string;
  cta?: { href: string; label: string; disabled: boolean };
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
          {title}
        </p>
        <p className="text-[12px] text-[color:var(--color-fg-muted)]">{sub}</p>
      </div>
      <div className="mt-4">{children}</div>
      {cta && (
        <Link
          href={cta.disabled ? "#" : cta.href}
          aria-disabled={cta.disabled}
          className={
            "mt-4 inline-flex h-9 items-center rounded-md px-3 text-[12px] font-semibold transition-[background-color] " +
            (cta.disabled
              ? "cursor-not-allowed bg-[color:var(--color-surface-strong,var(--color-surface))] text-[color:var(--color-fg-subtle)]"
              : "bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)] hover:bg-[color:var(--color-primary-hover)]")
          }
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}

function MemberCard({ firstName, sub }: { firstName: string; sub: string }) {
  return (
    <div className="rounded-[12px] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-3 text-center">
      <p className="text-[14px] font-semibold text-[color:var(--color-fg)]">{firstName}</p>
      <p className="mt-1 text-[11px] text-[color:var(--color-fg-subtle)]">{sub}</p>
    </div>
  );
}

function SubCircles({ items }: { items: { name: string; memberCount: number; lastActive: string }[] }) {
  return (
    <section>
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
        Sub-circles
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {items.map((s) => (
          <Link
            key={s.name}
            href={`/app/corridor/sub-circles/${slug(s.name)}`}
            className="rounded-[12px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 transition-[border-color,transform] hover:border-[color:var(--color-primary)]/60 hover:translate-y-[-1px]"
          >
            <p className="text-[14px] font-semibold text-[color:var(--color-fg)]">{s.name}</p>
            <p className="mt-1 text-[11px] text-[color:var(--color-fg-subtle)]">
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

function Activity({ items }: { items: { id: string; kind: string; firstName: string; whenIso: string; text: string }[] }) {
  return (
    <section>
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
        Activity
      </p>
      <ul className="mt-3 divide-y divide-[color:var(--color-border)] rounded-[12px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
        {items.map((a) => (
          <li key={a.id} className="px-4 py-3">
            <p className="text-[13px] text-[color:var(--color-fg)]">
              <span className="font-semibold">{a.firstName}</span>{" "}
              <span className="text-[color:var(--color-fg-muted)]">{a.text}</span>
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
              {timeAgo(a.whenIso)}
            </p>
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

function ScamWarning() {
  return (
    <section className="rounded-[14px] border border-[color:var(--color-warning,#b45309)]/30 bg-[color:var(--color-warning,#b45309)]/[0.08] p-5">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-warning,#b45309)]">
        Scam alert
      </p>
      <p className="mt-2 text-[13px] leading-[1.5] text-[color:var(--color-fg)]">
        Anyone asking for a deposit before a tour is not a real landlord.
      </p>
      <Link
        href="/app/help/scams"
        className="mt-3 inline-flex text-[12px] font-semibold text-[color:var(--color-fg)] underline decoration-dotted underline-offset-4 hover:text-[color:var(--color-primary)]"
      >
        See the 5 patterns we&apos;ve seen
      </Link>
    </section>
  );
}
