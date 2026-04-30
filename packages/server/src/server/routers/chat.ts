/**
 * Chat router — channels + messages.
 *
 * Real-time messaging arrives in Bucket 4 follow-up via Supabase
 * Realtime channel-pool sharding (v6 §22 — shard above 150
 * subscribers).
 *
 * v6 build §12, §18 / Build Prompt Bucket 4.
 */
import { z } from "zod";
import { router, fullyVerifiedProcedure } from "../trpc";

const Channel = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  lastMessage: z.string(),
  lastMessageAt: z.string(),
  unreadCount: z.number(),
  kind: z.enum(["corridor", "uni", "subcircle", "dm"]),
});

const Message = z.object({
  id: z.string(),
  channelId: z.string(),
  authorId: z.string(),
  authorName: z.string(),
  authorInitials: z.string(),
  body: z.string(),
  sentAt: z.string(),
  seqId: z.number(),
  isYou: z.boolean(),
  isSystemPrompt: z.boolean().optional(),
});

export const chatRouter = router({
  listChannels: fullyVerifiedProcedure
    .output(z.array(Channel))
    .query(async ({ ctx }) => [
      {
        id: "ch-l2",
        title: "UCD · Sept 2026",
        subtitle: "95 verified",
        lastMessage: "Anyone else in Belgrove tonight?",
        lastMessageAt: ctx.now.toISOString(),
        unreadCount: 3,
        kind: "corridor" as const,
      },
    ]),

  getMessages: fullyVerifiedProcedure
    .input(z.object({ channelId: z.string() }))
    .output(z.array(Message))
    .query(async ({ input, ctx }) => [
      {
        id: "m1",
        channelId: input.channelId,
        authorId: "u1",
        authorName: "Aayush S.",
        authorInitials: "AS",
        body: "Hey everyone — happy to be here.",
        sentAt: ctx.now.toISOString(),
        seqId: 1,
        isYou: true,
      },
    ]),

  sendMessage: fullyVerifiedProcedure
    .input(z.object({ channelId: z.string(), body: z.string().min(1).max(2000) }))
    .output(z.object({ message: Message }))
    .mutation(async ({ input, ctx }) => ({
      message: {
        id: crypto.randomUUID(),
        channelId: input.channelId,
        authorId: ctx.user.id,
        authorName: "You",
        authorInitials: "Y",
        body: input.body,
        sentAt: ctx.now.toISOString(),
        seqId: Date.now(),
        isYou: true,
      },
    })),
});
