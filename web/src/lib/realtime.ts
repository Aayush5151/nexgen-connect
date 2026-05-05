"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Supabase Realtime — chat_message subscription.
 *
 * Subscribes to INSERTs + UPDATEs for a given thread_id. The publication
 * is `supabase_realtime` (set up in migration 0009_v16_chat.sql).
 *
 * Mock fallback: when NEXT_PUBLIC_SUPABASE_URL is unset (dev / preview
 * without keys), `subscribe` is a no-op that returns a fake unsubscribe.
 *
 * v16 web pivot §Bucket 7.
 */

export type ChatMessageRow = {
  id: string;
  thread_id: string;
  user_id: string;
  content: string;
  created_at: string;
  edited_at: string | null;
  deleted_at: string | null;
  deleted_reason: string | null;
};

export type SubscribeArgs = {
  threadId: string;
  onInsert: (row: ChatMessageRow) => void;
  onUpdate: (row: ChatMessageRow) => void;
};

function isRealtimeWired(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_USE_REAL_REALTIME === "true");
}

export function subscribeToThread(args: SubscribeArgs): () => void {
  if (!isRealtimeWired()) {
    // Dev / preview: no-op. Page-level mock messages drive the UI.
    return () => {};
  }
  const client = createSupabaseBrowserClient();
  const channel = client
    .channel(`chat:${args.threadId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "chat_message",
        filter: `thread_id=eq.${args.threadId}`,
      },
      (payload) => args.onInsert(payload.new as unknown as ChatMessageRow),
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "chat_message",
        filter: `thread_id=eq.${args.threadId}`,
      },
      (payload) => args.onUpdate(payload.new as unknown as ChatMessageRow),
    )
    .subscribe();

  return () => {
    void client.removeChannel(channel);
  };
}
