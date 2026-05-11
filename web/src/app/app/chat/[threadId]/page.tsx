"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { type ChatMessage, chatMessages, chatSendMessage } from "@/lib/app/services";
import { subscribeToThread } from "@/lib/realtime";
import { ReportDialog } from "@/components/app/ReportDialog";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import ChatThreadLoading from "./loading";

/**
 * /app/chat/[threadId] — chat thread view.
 *
 * Bucket 7 wires Supabase Realtime: subscribe to INSERTs on chat_message
 * filtered to this thread_id. RLS guards membership server-side.
 *
 * Report flow: long-press / right-click on a message opens the
 * categorise dialog. T&S routes via /api/chat/report (1h SLA for
 * harassment + self-harm, 4h for everything else).
 *
 * v16 web pivot §Bucket 7.
 */
export default function ChatThreadPage() {
  const params = useParams<{ threadId: string }>();
  const threadId = params?.threadId ?? "";

  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [reportTarget, setReportTarget] = useState<ChatMessage | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  // The authenticated Supabase user id. Used by the Realtime onInsert
  // handler to decide whether an incoming message is from the local
  // user (shown right-aligned as "You") or a peer (left-aligned).
  // Falls back to the legacy "demo-user-1" sentinel when Supabase
  // isn't wired (dev / preview), so the mock-mode chat still labels
  // self-sent messages correctly.
  const [currentUserId, setCurrentUserId] = useState<string>("demo-user-1");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase.auth.getUser();
        if (cancelled) return;
        if (data?.user?.id) setCurrentUserId(data.user.id);
      } catch {
        // No Supabase env in dev — stick with the demo sentinel.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!threadId) return;
    void chatMessages(threadId).then(setMessages);
  }, [threadId]);

  // Subscribe to Realtime once we have the thread id. The hook is a
  // no-op if NEXT_PUBLIC_USE_REAL_REALTIME != "true" — mocks still
  // drive the UI in dev. Re-subscribes when currentUserId resolves
  // from "demo-user-1" → the real Supabase uid so the isOwn check
  // works for messages received post-mount.
  useEffect(() => {
    if (!threadId) return;
    return subscribeToThread({
      threadId,
      onInsert: (row) => {
        setMessages((prev) => {
          const existing = prev ?? [];
          if (existing.some((m) => m.id === row.id)) return existing;
          return [
            ...existing,
            {
              id: row.id,
              threadId: row.thread_id,
              authorId: row.user_id,
              authorFirstName: row.user_id === currentUserId ? "You" : "Member",
              content: row.content,
              sentAt: row.created_at,
              isOwn: row.user_id === currentUserId,
            },
          ];
        });
      },
      onUpdate: (row) => {
        setMessages((prev) =>
          (prev ?? []).map((m) =>
            m.id === row.id
              ? { ...m, content: row.deleted_at ? "[message removed by moderator]" : row.content }
              : m,
          ),
        );
      },
    });
  }, [threadId, currentUserId]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  async function send() {
    const trimmed = draft.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      const msg = await chatSendMessage({ threadId, content: trimmed });
      setMessages((prev) => [...(prev ?? []), msg]);
      setDraft("");
    } finally {
      setSending(false);
    }
  }

  if (!messages) {
    return <ChatThreadLoading />;
  }

  return (
    <div className="flex h-[calc(100vh-220px)] flex-col gap-3 pt-2">
      <header>
        <Link
          href="/app/chat"
          className="label-eyebrow inline-flex items-center gap-1 text-[color:var(--color-fg-subtle)] transition-colors hover:text-[color:var(--color-fg)]"
        >
          <span aria-hidden="true">←</span>
          Threads
        </Link>
        <div className="mt-2 flex items-center justify-between gap-3">
          <h1 className="title-xl text-[color:var(--color-fg)]">
            {labelForThread(threadId)}
          </h1>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-2.5 py-1 text-[11px] text-[color:var(--color-fg-muted)]">
            <span className="presence-dot" aria-hidden="true" />
            <span className="font-mono text-[10px] uppercase tracking-[0.12em]">
              Live
            </span>
          </span>
        </div>
      </header>

      <ul
        ref={listRef}
        className="card flex-1 space-y-3 overflow-y-auto p-4"
      >
        {messages.map((m) => (
          <li key={m.id} className={m.isOwn ? "flex justify-end" : "flex"}>
            <div
              onContextMenu={
                m.isOwn
                  ? undefined
                  : (e) => {
                      e.preventDefault();
                      setReportTarget(m);
                    }
              }
              className={
                "group relative max-w-[80%] rounded-[12px] px-3 py-2 text-[13px] leading-[1.4] " +
                (m.isOwn
                  ? "bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]"
                  : "bg-[color:var(--color-bg)] text-[color:var(--color-fg)]")
              }
            >
              {!m.isOwn && (
                <p className="text-[11px] font-semibold text-[color:var(--color-fg-muted)]">
                  {m.authorFirstName}
                </p>
              )}
              <p>{m.content}</p>
              {!m.isOwn && (
                <button
                  type="button"
                  onClick={() => setReportTarget(m)}
                  aria-label={`Report message from ${m.authorFirstName}`}
                  className="absolute -right-1 -top-1 hidden h-6 w-6 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg)] text-[color:var(--color-fg-subtle)] hover:text-[color:var(--color-danger)] group-hover:flex"
                >
                  ⋯
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
        className="flex gap-2"
      >
        <Input
          inputSize="lg"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a message…"
          aria-label="Message"
          className="flex-1"
        />
        <button
          type="submit"
          disabled={!draft.trim() || sending}
          className="inline-flex h-12 items-center rounded-[10px] bg-[color:var(--color-primary)] px-5 text-[13px] font-semibold text-[color:var(--color-primary-fg)] transition-[background-color,opacity,transform] hover:bg-[color:var(--color-primary-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending ? "Sending…" : "Send"}
        </button>
      </form>

      {reportTarget && (
        <ReportDialog
          message={reportTarget}
          onClose={() => setReportTarget(null)}
        />
      )}
    </div>
  );
}

function labelForThread(id: string): string {
  if (id.startsWith("thread_sub_")) {
    return id.replace("thread_sub_", "").replace(/_/g, " ");
  }
  if (id === "thread_uni_alumni") return "UCD alumni AMA";
  if (id === "thread_group_ucd_sept26") return "UCD · Sept 2026";
  return "Thread";
}
