"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { type SubCircleDetail, subCircleDetail } from "@/lib/app/mock-services";

/**
 * /app/corridor/sub-circles/[name] — sub-circle detail.
 *
 * Sub-circles are scoped, opt-in groups inside a corridor (housing,
 * airport pickup, roommates, food). Lower threshold than group chat.
 *
 * v16 web pivot §Bucket 5.
 */
export default function SubCirclePage() {
  const params = useParams<{ name: string }>();
  const name = params?.name ?? "";
  const [data, setData] = useState<SubCircleDetail | null | undefined>(undefined);

  useEffect(() => {
    if (!name) return;
    void subCircleDetail(name).then(setData);
  }, [name]);

  if (data === undefined) {
    return <p className="pt-6 text-[15px] text-[color:var(--color-fg-muted)]">Loading…</p>;
  }
  if (data === null) {
    return <NotFound name={name} />;
  }

  return (
    <div className="space-y-6 pt-2">
      <header>
        <Link
          href="/app/corridor"
          className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)] hover:text-[color:var(--color-fg)]"
        >
          ← Corridor
        </Link>
        <h1 className="mt-3 font-heading text-3xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]">
          {data.name}
        </h1>
        <p className="mt-2 text-[15px] leading-[1.6] text-[color:var(--color-fg-muted)]">
          {data.description}
        </p>
        <p className="mt-2 text-[12px] text-[color:var(--color-fg-subtle)]">
          {data.memberCount} verified members
        </p>
      </header>

      <Link
        href={`/app/chat/${data.threadId}`}
        className="inline-flex h-12 w-full items-center justify-center rounded-[10px] bg-[color:var(--color-primary)] text-[14px] font-semibold text-[color:var(--color-primary-fg)] transition-[background-color] hover:bg-[color:var(--color-primary-hover)]"
      >
        Open thread
      </Link>

      {data.members.length > 0 && (
        <section>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
            Members
          </p>
          <ul className="mt-3 grid grid-cols-3 gap-2">
            {data.members.map((m) => (
              <li
                key={m.id}
                className="rounded-[12px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3 text-center"
              >
                <p className="text-[14px] font-semibold text-[color:var(--color-fg)]">{m.firstName}</p>
                <p className="mt-1 text-[11px] text-[color:var(--color-fg-subtle)]">{m.homeCity}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function NotFound({ name }: { name: string }) {
  return (
    <div className="space-y-4 pt-2">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
        Not found
      </p>
      <h1 className="font-heading text-3xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]">
        No sub-circle named &ldquo;{name}&rdquo;.
      </h1>
      <Link href="/app/corridor" className="text-[14px] text-[color:var(--color-primary)] underline">
        Back to corridor
      </Link>
    </div>
  );
}
