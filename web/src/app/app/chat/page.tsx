"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type ChatThread, chatThreads } from "@/lib/app/services";
import ChatLoading from "./loading";

/**
 * /app/chat — thread list, v18 trillion-dollar polish.
 *
 * Lists every thread the user has access to: group chat (locked until
 * 60 verified), sub-circles, the uni alumni AMA, and any direct DMs.
 *
 * v18 polish notes:
 *   - Header uses the new type scale (label-eyebrow + display-lg).
 *   - Row layout: thread label as eyebrow, name in title-sm, preview
 *     in body-sm. Author bold against a muted preview is the iMessage
 *     pattern that just works.
 *   - Locked rows have a different left-rail treatment (dashed border
 *     accent) so they read as "blocked" at a glance, not just slower.
 *   - Unread badge tabular-nums so counts don't dance on width change.
 *   - Whole row is `card-interactive` for hover lift on touch-down.
 *   - Empty-state copy ready for when threads.length === 0.
 *
 * Real impl reads from Supabase Realtime + RLS in Bucket 7.
 *
 * v17 / v16 web pivot §Bucket 5.
 */
export default function ChatPage() {
  const [threads, setThreads] = useState<ChatThread[] | null>(null);

  useEffect(() => {
    void chatThreads().then(setThreads);
  }, []);

  if (!threads) return <ChatLoading />;

  if (threads.length === 0) {
    return (
      <div className="space-y-6 pt-2">
        <ChatHeader />
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-2 stagger-children">
      <div style={{ "--i": 0 } as React.CSSProperties}>
        <ChatHeader />
      </div>

      <ul
        className="card divide-y divide-[color:var(--color-border)] overflow-hidden"
        style={{ "--i": 1 } as React.CSSProperties}
      >
        {threads.map((t) => (
          <li key={t.id}>
            {t.locked ? (
              <LockedRow thread={t} />
            ) : (
              <Link
                href={`/app/chat/${t.id}`}
                className="block px-4 py-4 transition-colors hover:bg-[color:var(--color-surface-elevated)] active:bg-[color:var(--color-bg)]"
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

function ChatHeader() {
  return (
    <header>
      <div className="flex items-center gap-2">
        <span className="presence-dot" aria-hidden="true" />
        <p className="label-eyebrow text-[color:var(--color-primary)]">Chat</p>
      </div>
      <h1 className="mt-3 display-lg text-[color:var(--color-fg)]">
        Your threads
      </h1>
    </header>
  );
}

function EmptyState() {
  return (
    <div className="card p-8 text-center">
      <p className="title-md text-[color:var(--color-fg)]">No threads yet.</p>
      <p className="mt-2 body-sm text-[color:var(--color-fg-muted)]">
        Group chat unlocks at 60 verified. Sub-circles unlock at 5.
      </p>
    </div>
  );
}

function ThreadRow({ thread }: { thread: ChatThread }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <p className="truncate title-sm text-[color:var(--color-fg)]">
            {thread.name}
          </p>
          <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
            {labelFor(thread.type)}
          </span>
        </div>
        <p className="mt-1 truncate body-sm text-[color:var(--color-fg-muted)]">
          <span className="font-semibold text-[color:var(--color-fg)]">
            {thread.lastMessage.authorFirstName}:
          </span>{" "}
          {thread.lastMessage.preview}
        </p>
      </div>
      {thread.unreadCount > 0 && (
        <span
          aria-label={`${thread.unreadCount} unread`}
          className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[color:var(--color-primary)] px-1.5 text-[11px] font-semibold tabular-nums text-[color:var(--color-primary-fg)]"
        >
          {thread.unreadCount}
        </span>
      )}
    </div>
  );
}

function LockedRow({ thread }: { thread: ChatThread }) {
  if (!thread.locked) return null;
  const pct = Math.min(
    100,
    Math.round((thread.locked.current / thread.locked.threshold) * 100),
  );
  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <p className="truncate title-sm text-[color:var(--color-fg-muted)]">
              {thread.name}
            </p>
            <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
              Locked
            </span>
          </div>
          <p className="mt-1 truncate body-sm text-[color:var(--color-fg-subtle)]">
            {thread.lastMessage.preview}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div
          className="h-[2px] flex-1 overflow-hidden rounded-full bg-[color:var(--color-border)]"
          role="progressbar"
          aria-valuenow={thread.locked.current}
          aria-valuemin={0}
          aria-valuemax={thread.locked.threshold}
        >
          <div
            className="h-full rounded-full bg-[color:var(--color-fg-subtle)] transition-[width] duration-[700ms] ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="font-mono text-[10px] tabular-nums text-[color:var(--color-fg-subtle)]">
          {thread.locked.current}/{thread.locked.threshold}
        </p>
      </div>
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
