"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { type ChatMessage, chatMessages, chatSendMessage } from "@/lib/app/mock-services";

/**
 * /app/chat/[threadId] — chat thread view.
 *
 * Mock-only: messages persist in component state. Bucket 7 wires
 * Supabase Realtime so messages stream in across clients with RLS
 * enforced on read + write.
 *
 * Long-press → report flow lives in Bucket 7. Here we just render the
 * thread + a send box.
 *
 * v16 web pivot §Bucket 5.
 */
export default function ChatThreadPage() {
  const params = useParams<{ threadId: string }>();
  const threadId = params?.threadId ?? "";

  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    if (!threadId) return;
    void chatMessages(threadId).then(setMessages);
  }, [threadId]);

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
    return <p className="pt-6 text-[15px] text-[color:var(--color-fg-muted)]">Loading…</p>;
  }

  return (
    <div className="flex h-[calc(100vh-220px)] flex-col gap-3 pt-2">
      <header>
        <Link
          href="/app/chat"
          className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)] hover:text-[color:var(--color-fg)]"
        >
          ← Threads
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]">
          {labelForThread(threadId)}
        </h1>
      </header>

      <ul
        ref={listRef}
        className="flex-1 space-y-3 overflow-y-auto rounded-[12px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4"
      >
        {messages.map((m) => (
          <li key={m.id} className={m.isOwn ? "flex justify-end" : "flex"}>
            <div
              className={
                "max-w-[80%] rounded-[12px] px-3 py-2 text-[13px] leading-[1.4] " +
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
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a message…"
          aria-label="Message"
          className="h-12 flex-1 rounded-[10px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] px-4 text-[14px] text-[color:var(--color-fg)] placeholder:text-[color:var(--color-fg-placeholder)] focus:border-[color:var(--color-primary)]/60 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!draft.trim() || sending}
          className="inline-flex h-12 items-center rounded-[10px] bg-[color:var(--color-primary)] px-5 text-[13px] font-semibold text-[color:var(--color-primary-fg)] transition-[background-color,opacity] hover:bg-[color:var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending ? "Sending…" : "Send"}
        </button>
      </form>
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
