/**
 * Mock chat: a small list of channels (corridor / uni subgroup /
 * sub-circle / DM), each with a seeded message thread. The corridor
 * channel is "locked" (DM-disabled) until corridor.unlocked === true,
 * matching the BP §3.4 behaviour. The other channels are open
 * (sub-circles form pre-unlock, DMs only post-unlock — but for the
 * mock we keep one always-on DM so the UI is testable end-to-end).
 *
 * Messages are persisted in-memory only. Sending appends; reloading
 * the app resets to seeds.
 */

import type {
  Channel,
  Message,
  SendMessageInput,
  SendMessageResult,
} from "../services/types";

function delay<T>(ms: number, v: T): Promise<T> {
  return new Promise((r) => setTimeout(() => r(v), ms));
}
function minutesAgo(m: number): string {
  return new Date(Date.now() - m * 60_000).toISOString();
}
function randomId(): string {
  return Math.random().toString(36).slice(2, 12);
}

const YOU = { id: "u_you", name: "You", initials: "YO" };

/* ------------------------------------------------------------------ */
/* Seed channels + messages.                                           */
/* ------------------------------------------------------------------ */

const channels: Channel[] = [
  {
    id: "ch_corridor",
    title: "Pune → Dublin · Sept '26",
    // v15 BP §3.2 layer inversion — Layer 2 unlocked at 95 verified.
    // P1 chat-list redesign will retitle this to a Layer 2 framing
    // (no home_city in the title) and surface a separate Layer 1
    // hometown-crew channel pinned above it.
    subtitle: "95 verified · group chat live",
    lastMessage:
      "If a sub-circle has 4+ active members, it spawns a roommate cluster…",
    lastMessageAt: minutesAgo(2),
    unreadCount: 0,
    kind: "corridor",
  },
  {
    id: "ch_ucd",
    title: "UCD · Class of 2026",
    subtitle: "11 verified at UCD",
    lastMessage: "Anyone moving to Belfield in mid-August?",
    lastMessageAt: minutesAgo(8),
    unreadCount: 2,
    kind: "uni",
  },
  {
    id: "ch_sc_roommates",
    title: "Roommates · sub-circle",
    subtitle: "6 verified women",
    lastMessage: "How are people thinking about Ranelagh vs Rathmines?",
    lastMessageAt: minutesAgo(2),
    unreadCount: 1,
    kind: "subcircle",
  },
  {
    id: "ch_dm_aditya",
    title: "Aditya R.",
    subtitle: "UCD · same intake",
    lastMessage: "Just confirmed my flight on Sep 8 morning!",
    lastMessageAt: minutesAgo(18),
    unreadCount: 0,
    kind: "dm",
  },
];

const messagesByChannel: Record<string, Message[]> = {
  ch_corridor: [
    {
      id: "m_c_1",
      channelId: "ch_corridor",
      authorId: "system",
      authorName: "NexGen",
      authorInitials: "NX",
      body: "Welcome to your corridor — Dublin · Sept '26 with 95 verified students. Group chat is live. Your Pune × UCD hometown crew is forming below at 5 of 8.",
      sentAt: minutesAgo(45),
      seqId: 1,
      isYou: false,
      isSystemPrompt: true,
    },
    {
      id: "m_c_2",
      channelId: "ch_corridor",
      authorId: "system",
      authorName: "NexGen",
      authorInitials: "NX",
      body: "If a sub-circle has 4+ active members at T+24h, it spawns a roommate cluster with both-sides Aadhaar + admit re-confirmed.",
      sentAt: minutesAgo(2),
      seqId: 2,
      isYou: false,
      isSystemPrompt: true,
    },
  ],
  ch_ucd: [
    {
      id: "m_u_1",
      channelId: "ch_ucd",
      authorId: "u_priya",
      authorName: "Priya M.",
      authorInitials: "PR",
      body: "Anyone moving to Belfield in mid-August?",
      sentAt: minutesAgo(8),
      seqId: 1,
      isYou: false,
    },
    {
      id: "m_u_2",
      channelId: "ch_ucd",
      authorId: "u_arjun",
      authorName: "Arjun T.",
      authorInitials: "AR",
      body: "Yes, landing 13 Aug. Already booked Roebuck — anyone else there?",
      sentAt: minutesAgo(7),
      seqId: 2,
      isYou: false,
    },
  ],
  ch_sc_roommates: [
    {
      id: "m_r_1",
      channelId: "ch_sc_roommates",
      authorId: "u_meera",
      authorName: "Meera H.",
      authorInitials: "MH",
      body: "How are people thinking about Ranelagh vs Rathmines? Hearing wildly different things.",
      sentAt: minutesAgo(2),
      seqId: 1,
      isYou: false,
    },
  ],
  ch_dm_aditya: [
    {
      id: "m_d_1",
      channelId: "ch_dm_aditya",
      authorId: "u_aditya",
      authorName: "Aditya R.",
      authorInitials: "AD",
      body: "Just confirmed my flight on Sep 8 morning!",
      sentAt: minutesAgo(18),
      seqId: 1,
      isYou: false,
    },
    {
      id: "m_d_2",
      channelId: "ch_dm_aditya",
      authorId: "u_aditya",
      authorName: "Aditya R.",
      authorInitials: "AD",
      body: "Want to share an Uber from the airport to UCD?",
      sentAt: minutesAgo(17),
      seqId: 2,
      isYou: false,
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Service.                                                            */
/* ------------------------------------------------------------------ */

export const chatMock = {
  async listChannels(): Promise<Channel[]> {
    return delay(250, [...channels]);
  },

  async getMessages({ channelId }: { channelId: string }): Promise<Message[]> {
    return delay(200, [...(messagesByChannel[channelId] ?? [])]);
  },

  async sendMessage(input: SendMessageInput): Promise<SendMessageResult> {
    const list = messagesByChannel[input.channelId] ?? [];
    const next: Message = {
      id: "m_" + randomId(),
      channelId: input.channelId,
      authorId: YOU.id,
      authorName: YOU.name,
      authorInitials: YOU.initials,
      body: input.body,
      sentAt: new Date().toISOString(),
      seqId: list.length + 1,
      isYou: true,
    };
    messagesByChannel[input.channelId] = [...list, next];

    // Update channel preview.
    const ch = channels.find((c) => c.id === input.channelId);
    if (ch) {
      ch.lastMessage = input.body;
      ch.lastMessageAt = next.sentAt;
    }

    return delay(150, { message: next });
  },
};
