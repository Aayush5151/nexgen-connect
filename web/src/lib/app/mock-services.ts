/**
 * Mock product-surface services — used by `/app/*` routes until Bucket 6
 * wires real Supabase + tRPC.
 *
 * Each function mirrors the shape of the corresponding tRPC procedure
 * in `packages/server/src/server/routers/`. When real wiring lands, the
 * call site changes ONE import line:
 *
 *   import { corridorState } from "@/lib/app/mock-services";
 *   //                       ^^^ swap to:
 *   import { trpc } from "@/lib/trpc";
 *   const corridorState = () => trpc.corridor.state.query();
 *
 * v16 web pivot §Bucket 5.
 */

const SLEEP_MS = 350;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type CorridorMember = {
  id: string;
  firstName: string;
  homeCity: string;
  intake: string;
  verifiedAt: string;
  /** "layer1" hometown crew, "layer2" verified group, "layer3" city ambient. */
  layer: "layer1" | "layer2" | "layer3";
};

export type ChatThread = {
  id: string;
  type: "group" | "sub_circle" | "direct" | "uni";
  name: string;
  lastMessage: { authorFirstName: string; preview: string; sentAt: string };
  unreadCount: number;
  /** Group chat is gated to verifiedCount>=60 per v16 §Bucket 7. */
  locked?: { reason: "below_threshold"; threshold: number; current: number };
};

export type ChatMessage = {
  id: string;
  threadId: string;
  authorId: string;
  authorFirstName: string;
  content: string;
  sentAt: string;
  isOwn: boolean;
};

export type CorridorState = {
  uni: string;
  intake: string;
  verifiedCount: number;
  threshold: number;
  /** True if verifiedCount<5. Aayush calls personally. */
  isColdStart: boolean;
  /** True if verifiedCount<60. Group chat locked. */
  groupChatLocked: boolean;
  layer1: CorridorMember[];
  layer2: CorridorMember[];
  layer3Count: number;
  subCircles: { name: string; memberCount: number; lastActive: string }[];
  activity: { id: string; kind: string; firstName: string; whenIso: string; text: string }[];
};

export async function corridorState(): Promise<CorridorState> {
  await sleep(SLEEP_MS);
  // Mock cohort: 47 verified at UCD (a populated corridor), enough to
  // unlock the Layer 2 hero but not yet the group-chat threshold (60).
  return {
    uni: "University College Dublin",
    intake: "September 2026",
    verifiedCount: 47,
    threshold: 60,
    isColdStart: false,
    groupChatLocked: true,
    layer1: [
      mockMember("u1", "Aanya", "Mumbai", "layer1"),
      mockMember("u2", "Rohan", "Mumbai", "layer1"),
      mockMember("u3", "Saanvi", "Mumbai", "layer1"),
    ],
    // Layer 2 = verified group across all home cities. Real first
    // names + real Indian metros so the chips read as "people you
    // could meet" not "filler". 8 visible chips; the "+39 more" pill
    // on the corridor page surfaces the remainder.
    layer2: [
      mockMember("v0", "Aditi",   "Bengaluru", "layer2"),
      mockMember("v1", "Karthik", "Hyderabad", "layer2"),
      mockMember("v2", "Priya",   "Delhi",     "layer2"),
      mockMember("v3", "Ishaan",  "Pune",      "layer2"),
      mockMember("v4", "Meera",   "Chennai",   "layer2"),
      mockMember("v5", "Vihaan",  "Kolkata",   "layer2"),
      mockMember("v6", "Riya",    "Ahmedabad", "layer2"),
      mockMember("v7", "Arjun",   "Jaipur",    "layer2"),
    ],
    layer3Count: 312,
    subCircles: [
      { name: "Housing", memberCount: 18, lastActive: "12 min ago" },
      { name: "Airport pickup", memberCount: 9, lastActive: "1h ago" },
      { name: "Roommates", memberCount: 22, lastActive: "today" },
      { name: "Food scene", memberCount: 14, lastActive: "yesterday" },
    ],
    activity: [
      { id: "a1", kind: "verified", firstName: "Aanya", whenIso: nowMinusMin(8), text: "joined the corridor from Mumbai" },
      { id: "a2", kind: "subcircle", firstName: "Rohan", whenIso: nowMinusMin(34), text: "started Housing sub-circle" },
      { id: "a3", kind: "scam", firstName: "T&S", whenIso: nowMinusMin(120), text: "flagged a deposit-up-front rental scam, see /app/help/scams" },
    ],
  };
}

function mockMember(id: string, firstName: string, homeCity: string, layer: CorridorMember["layer"]): CorridorMember {
  return {
    id,
    firstName,
    homeCity,
    intake: "September 2026",
    verifiedAt: nowMinusMin(Math.floor(Math.random() * 60)),
    layer,
  };
}

function nowMinusMin(m: number) {
  return new Date(Date.now() - m * 60_000).toISOString();
}

export async function chatThreads(): Promise<ChatThread[]> {
  await sleep(SLEEP_MS);
  return [
    {
      id: "thread_group_ucd_sept26",
      type: "group",
      name: "UCD · Sept 2026",
      lastMessage: {
        authorFirstName: ", ",
        preview: "Group chat unlocks at 60 verified.",
        sentAt: nowMinusMin(0),
      },
      unreadCount: 0,
      locked: { reason: "below_threshold", threshold: 60, current: 47 },
    },
    {
      id: "thread_sub_housing",
      type: "sub_circle",
      name: "Housing",
      lastMessage: {
        authorFirstName: "Aanya",
        preview: "Anyone toured the Mater Dei dorm? Worth the price?",
        sentAt: nowMinusMin(12),
      },
      unreadCount: 3,
    },
    {
      id: "thread_sub_airport",
      type: "sub_circle",
      name: "Airport pickup",
      lastMessage: {
        authorFirstName: "Rohan",
        preview: "Landing 6 Aug · LH 760 · DM if your flight is close.",
        sentAt: nowMinusMin(64),
      },
      unreadCount: 0,
    },
    {
      id: "thread_uni_alumni",
      type: "uni",
      name: "UCD alumni AMA",
      lastMessage: {
        authorFirstName: "Priya '23",
        preview: "Best banks for students: AIB student account, no fees.",
        sentAt: nowMinusMin(180),
      },
      unreadCount: 1,
    },
  ];
}

export async function chatMessages(threadId: string): Promise<ChatMessage[]> {
  await sleep(SLEEP_MS);
  if (threadId === "thread_sub_housing") {
    return [
      mockMsg("m1", threadId, "u1", "Aanya", "Anyone toured the Mater Dei dorm? Worth the price?", 12, false),
      mockMsg("m2", threadId, "u2", "Rohan", "I went last week. Rooms are tight but laundry is free. €1,150/mo.", 9, false),
      mockMsg("m3", threadId, "u3", "Saanvi", "Worth checking Roebuck Hall too. Slightly cheaper.", 6, false),
    ];
  }
  return [
    mockMsg("m1", threadId, "u1", ", ", "No messages yet.", 0, false),
  ];
}

function mockMsg(
  id: string,
  threadId: string,
  authorId: string,
  authorFirstName: string,
  content: string,
  minutesAgo: number,
  isOwn: boolean,
): ChatMessage {
  return {
    id,
    threadId,
    authorId,
    authorFirstName,
    content,
    sentAt: nowMinusMin(minutesAgo),
    isOwn,
  };
}

export async function chatSendMessage(input: { threadId: string; content: string }): Promise<ChatMessage> {
  await sleep(SLEEP_MS);
  return {
    id: crypto.randomUUID(),
    threadId: input.threadId,
    authorId: "demo-user-1",
    authorFirstName: "You",
    content: input.content,
    sentAt: new Date().toISOString(),
    isOwn: true,
  };
}

export type SubCircleDetail = {
  name: string;
  memberCount: number;
  threadId: string;
  description: string;
  members: CorridorMember[];
};

export async function subCircleDetail(name: string): Promise<SubCircleDetail | null> {
  await sleep(SLEEP_MS);
  const known: Record<string, SubCircleDetail> = {
    housing: {
      name: "Housing",
      memberCount: 18,
      threadId: "thread_sub_housing",
      description: "Real listings, real rents. Verified students sharing what they actually paid.",
      members: [
        mockMember("u1", "Aanya", "Mumbai", "layer1"),
        mockMember("u2", "Rohan", "Mumbai", "layer1"),
        mockMember("u3", "Saanvi", "Mumbai", "layer1"),
      ],
    },
    "airport-pickup": {
      name: "Airport pickup",
      memberCount: 9,
      threadId: "thread_sub_airport",
      description: "Coordinate landings + shared cabs from DUB. No middlemen.",
      members: [mockMember("u2", "Rohan", "Mumbai", "layer1")],
    },
    roommates: {
      name: "Roommates",
      memberCount: 22,
      threadId: "thread_sub_roommates",
      description: "Find verified people who actually want to live with you.",
      members: [],
    },
    "food-scene": {
      name: "Food scene",
      memberCount: 14,
      threadId: "thread_sub_food",
      description: "Indian groceries, halal-cert, late-night spots that don't gouge.",
      members: [],
    },
  };
  return known[name] ?? null;
}

export type ProfileSnapshot = {
  firstName: string;
  homeCity: string;
  uni: string;
  intake: string;
  premium: boolean;
  parentLinkedAt: string | null;
  groupApplyJoinedAt: string | null;
  arrivalCheckedInAt: string | null;
};

export async function profileSnapshot(): Promise<ProfileSnapshot> {
  await sleep(SLEEP_MS);
  return {
    firstName: "Demo",
    homeCity: "Mumbai",
    uni: "University College Dublin",
    intake: "September 2026",
    premium: false,
    parentLinkedAt: null,
    groupApplyJoinedAt: null,
    arrivalCheckedInAt: null,
  };
}

export async function premiumStartCheckout(): Promise<{ orderId: string; amount: number; currency: "INR" }> {
  await sleep(SLEEP_MS);
  // Mock — Bucket 6 wires Razorpay test mode. Throws if env says we
  // must use real Razorpay but the key is unset (fail-closed).
  if (process.env.NEXT_PUBLIC_USE_REAL_RAZORPAY === "true") {
    throw new Error("E061:razorpay_not_configured");
  }
  return { orderId: `mock_order_${Date.now()}`, amount: 99900, currency: "INR" };
}

export async function parentGenerateMagicLink(input: { email: string }): Promise<{
  expiresAt: string;
  emailSentTo: string;
}> {
  await sleep(SLEEP_MS);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.email)) {
    throw new Error("E081:invalid_parent_email");
  }
  return {
    expiresAt: new Date(Date.now() + 60 * 60_000).toISOString(),
    emailSentTo: input.email,
  };
}

export async function groupApplyJoin(input: { partnerSlug: string; groupSize: number }): Promise<{ groupId: string }> {
  await sleep(SLEEP_MS);
  if (input.groupSize < 3 || input.groupSize > 6) {
    throw new Error("E082:group_size_out_of_range");
  }
  return { groupId: crypto.randomUUID() };
}

export async function arrivalCheckIn(input: { atIso: string; airport?: string }): Promise<{
  parentNotifiedAt: string;
}> {
  await sleep(SLEEP_MS);
  if (Number.isNaN(new Date(input.atIso).getTime())) {
    throw new Error("E083:invalid_arrival_time");
  }
  return { parentNotifiedAt: new Date().toISOString() };
}

export async function helpReport(input: {
  category: "harassment" | "scam" | "hard_time" | "something_else";
  detail: string;
}): Promise<{ ticketId: string; slaHours: number }> {
  await sleep(SLEEP_MS);
  // SLA per v16 §Bucket 7 — women-only paths land in Bucket 7 with their
  // own routing. Default SLA is 4h; harassment routes faster.
  const slaHours = input.category === "harassment" ? 1 : 4;
  return { ticketId: `ticket_${Date.now()}`, slaHours };
}
