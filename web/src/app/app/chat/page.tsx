"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type ChatThread, chatThreads } from "@/lib/app/services";

/**
 * /app/chat — thread list.
 *
 * Lists every thread the user has access to: group chat (locked until
 * 60 verified), sub-circles, the uni alumni AMA, and any direct DMs.
 *
 * Real impl reads from Supabase Realtime + RLS in Bucket 7.
 *
 * v16 web pivot §Bucket 5.
 */
export default function ChatPage() {
  const [threads, setThreads] = useState<ChatThread[] | null>(null);

  useEffect(() => {
    void chatThreads().then(setThreads);
  }, []);

  if (!threads) {
    return <p className="pt-6 text-[15px] text-[color:var(--color-fg-muted)]">Loading threads…</p>;
  }

  return (
    <div className="space-y-6 pt-2">
      <header>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-primary)]">
          Chat
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]">
          Your threads
        </h1>
      </header>

      <ul className="divide-y divide-[color:var(--color-border)] rounded-[12px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
        {threads.map((t) => (
          <li key={t.id}>
            {t.locked ? (
              <LockedRow thread={t} />
            ) : (
              <Link
                href={`/app/chat/${t.id}`}
                className="block px-4 py-4 transition-colors hover:bg-[color:var(--color-bg)]"
              >
                <ThreadRow thread={t} />
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ThreadRow({ thread }: { thread: ChatThread }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <p className="truncate text-[14px] font-semibold text-[color:var(--color-fg)]">
            {thread.name}
          </p>
          <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
            {labelFor(thread.type)}
          </span>
        </div>
        <p className="mt-1 truncate text-[12px] text-[color:var(--color-fg-muted)]">
          <span className="font-semibold text-[color:var(--color-fg)]">
            {thread.lastMessage.authorFirstName}:
          </span>{" "}
          {thread.lastMessage.preview}
        </p>
      </div>
      {thread.unreadCount > 0 && (
        <span className="rounded-full bg-[color:var(--color-primary)] px-2 py-[1px] text-[11px] font-semibold tabular-nums text-[color:var(--color-primary-fg)]">
          {thread.unreadCount}
        </span>
      )}
    </div>
  );
}

function LockedRow({ thread }: { thread: ChatThread }) {
  if (!thread.locked) return null;
  return (
    <div className="px-4 py-4">
      <ThreadRow thread={thread} />
      <p className="mt-2 rounded-md bg-[color:var(--color-bg)] px-3 py-2 text-[12px] text-[color:var(--color-fg-muted)]">
        Locked: needs {thread.locked.threshold} verified, currently{" "}
        {thread.locked.current}.
      </p>
    </div>
  );
}

function labelFor(type: ChatThread["type"]): string {
  return type === "group"
    ? "GROUP"
    : type === "sub_circle"
      ? "SUB-CIRCLE"
      : type === "uni"
        ? "UNI"
        : "DM";
}
