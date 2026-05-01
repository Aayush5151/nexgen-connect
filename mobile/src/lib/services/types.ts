/**
 * Service contract types — shared between the mock and (future)
 * tRPC client implementations. Keep these in lockstep with the
 * Mobile Plan v5.1 §4.1 (auth) + §4.2 (verification) + §4.3 (admin)
 * procedures so a swap to the real backend is a one-line import
 * change in src/lib/services/index.ts.
 */

export type Phone = {
  /** ISO-3166-1 alpha-2 country code, e.g. "IN", "IE", "DE". */
  country: string;
  /** E.164 without the leading +. e.g., "919876543210". */
  e164: string;
};

export type RequestOtpInput = { phone: Phone };
export type RequestOtpResult = {
  otpSessionId: string;
  /** ISO timestamp when the OTP expires (typ. 5 min). */
  expiresAt: string;
  /** Show on UI: "Code sent to +91 ********10". */
  maskedPhone: string;
};

export type VerifyOtpInput = { otpSessionId: string; code: string };
export type VerifyOtpResult = {
  sessionToken: string;
  refreshToken: string;
  /** Minimal user shape returned post-OTP. */
  user: {
    id: string;
    phoneVerifiedAt: string;
  };
};

/* ------------------------------------------------------------------ */
/* Identity verification (DigiLocker / Aadhaar VID).                   */
/* ------------------------------------------------------------------ */

export type StartDigiLockerResult = {
  /** URL the WebView should load. State param is included by server. */
  authUrl: string;
  /** Opaque state string we'll get back at completion. */
  state: string;
};

export type CompleteDigiLockerInput = {
  state: string;
  code: string;
};

export type CompleteDigiLockerResult = {
  /** UI-display only — the masked composite identity hash, never the
   *  raw value. UI shows "Identity-bound: ****12af" so the user knows
   *  the device is now identity-anchored. */
  maskedHash: string;
  /** Human-friendly summary for the success screen. */
  summary: {
    nameFirstAndLast: string;
    yearMonthOfBirth: string;
  };
};

/**
 * One of four discrete reasons DigiLocker can fail. Mapped to S27/S28/
 * S29/S30 in Mobile Plan §4.2.2-§4.2.5. UI dispatches to the matching
 * fallback screen.
 */
export type DigiLockerFailureReason =
  | "aadhaar_not_linked"
  | "mobile_changed"
  | "deactivated"
  | "invisible_character";

/* ------------------------------------------------------------------ */
/* Admit-letter review.                                                */
/* ------------------------------------------------------------------ */

export type UploadAdmitInput = {
  /** "image/jpeg", "image/png", "application/pdf". */
  mimeType: string;
  fileSizeBytes: number;
};

export type UploadAdmitResult = {
  uploadUrl: string;
  /** Server-assigned doc id; the client passes it back to mark complete. */
  docId: string;
  /** Server keeps the PDF for at most 60 minutes after review per
   *  L12; UI displays this so the user knows what we don't keep. */
  retentionMinutesAfterReview: number;
};

export type CompleteAdmitInput = { docId: string };
export type CompleteAdmitResult = {
  /** ISO timestamp by which we promise a review decision. */
  reviewBy: string;
  queuePosition: number;
};

export type AdmitStatus =
  | { state: "not_uploaded" }
  | { state: "pending"; queuePosition: number; reviewBy: string }
  | { state: "approved"; reviewedAt: string }
  | { state: "rejected"; reason: string; canResubmit: boolean };

/* ------------------------------------------------------------------ */
/* Aggregate verification status.                                      */
/* ------------------------------------------------------------------ */

export type VerificationStatus = {
  phone: { state: "unverified" | "verified"; verifiedAt?: string };
  identity:
    | { state: "unstarted" }
    | { state: "in_progress" }
    | {
        state: "failed";
        reason: DigiLockerFailureReason;
      }
    | { state: "verified"; verifiedAt: string };
  admit: AdmitStatus;
};

/* ------------------------------------------------------------------ */
/* Corridor + chat (Phase 2 → v6 layer-inverted, v15 BP §3.2).          */
/* ------------------------------------------------------------------ */

/**
 * v15 BP §3.2 layer-inverted corridor architecture.
 *
 *   Layer 1 — home_city × destination × intake. The AFFINITY sub-group:
 *             the hometown-crew thread (CH6) that nests inside an
 *             unlocked Layer 2. CORRIDOR_LAYER_1_UNLOCK = 8.
 *   Layer 2 — destination × intake. The user's PRIMARY surface.
 *             ~95 verified at unlock in practice; CORRIDOR_LAYER_2_UNLOCK
 *             = 30 floor protects the v14 cold-start "5 of 60 alone"
 *             failure mode.
 *   Layer 3 — destination-city ambient. FALLBACK feed for users whose
 *             Layer 2 hasn't unlocked. CORRIDOR_LAYER_3_FALLBACK_MIN = 50.
 */
export type CorridorLayer = 1 | 2 | 3;

/**
 * Unified Corridor shape. The `layer` discriminator is required; v6-aware
 * consumers branch on it to render the correct surface (CH1 Layer 2
 * primary, CH6 Layer 1 hometown crew, ambient Layer 3 footer).
 *
 * Layer-specific fields (parentCorridorId, memberCountL1,
 * womenOnlySubThreadActive) are optional so v5-era consumers (CH1, chat
 * list, parent dashboard) keep compiling without type-narrowing. P1
 * commits will introduce strict per-layer types as consumers migrate
 * screen-by-screen.
 */
export type Corridor = {
  /** v6 layer discriminator. v15 BP §3.2. */
  layer: CorridorLayer;
  id: string;
  /** Layer 1 only — FK to the parent Layer 2 corridor. */
  parentCorridorId?: string;
  /** Layer 1 = the affinity home-city. Layer 2 carries this only as a
   *  v5 transitional convenience (the user's home_city, surfaced for
   *  the "Pune → Dublin · Sept '26" header on CH1). Layer 3 has no
   *  home-city scope. P1 cleanup will move this off Layer 2 in favor
   *  of reading session.profile.homeCity. */
  homeCity: string;
  destination: string;
  destinationCountry: "Ireland" | "Germany";
  /** Layer 1 + Layer 2 only. Layer 3 is city-scope (no intake). */
  intakeMonth: string;
  /** Number of currently-verified students in this corridor. */
  verifiedCount: number;
  /** Layer 1 default 8, Layer 2 default 30, Layer 3 floor 50.
   *  Server-overridable per A3 retune (v15 BP §12.2). */
  unlockThreshold: number;
  /** True once verifiedCount >= unlockThreshold. UI uses this to flip
   *  the locked → unlocked surface, no separate field needed. */
  unlocked: boolean;
  /** ISO timestamp of unlock, if it's happened. Drives the "live for
   *  3 days" badge on the corridor home. */
  unlockedAt: string | null;
  /** Layer 2 only — rollup count of users in this Layer 2 sharing the
   *  current user's home_city (i.e., would join the same Layer 1
   *  hometown crew). Drives the pinned "your hometown crew" card on CH1.
   *  v15 BP §3.2 affinity surfacing. */
  memberCountL1?: number;
  /** Layer 2 only — auto-spawned women-only sub-thread is active when
   *  ≥4 verified women are present in this Layer 2 cohort. v15 BP §3.7b. */
  womenOnlySubThreadActive?: boolean;
};

export type CorridorMember = {
  id: string;
  initials: string;
  name: string;
  homeCity: string;
  uni: string;
  /** ISO timestamp. Newest at top of the feed. */
  verifiedAt: string;
  isYou: boolean;
};

export type SubCircle = {
  id: string;
  /** Worry-shaped per BP §3.7a: housing / airport / food / roommates. */
  topic: "housing" | "airport" | "food" | "roommates";
  /** Members count. Sub-circles auto-form to 6 max. */
  count: number;
  /** Last activity timestamp. */
  lastActivityAt: string;
  /** Whether the current user is a member. */
  joined: boolean;
};

export type Channel = {
  id: string;
  /** Display label, e.g. "Pune → Dublin · Sept '26" or "UCD · Class of 2026". */
  title: string;
  /** Subtitle below — verified count or sub-circle topic. */
  subtitle: string;
  /** Last message preview, used in the channel list. */
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  kind: "corridor" | "uni" | "subcircle" | "dm";
};

export type Message = {
  id: string;
  channelId: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  /** Plain text. Phase 2 doesn't ship rich formatting / links / media. */
  body: string;
  /** ISO timestamp. */
  sentAt: string;
  /** Server-assigned monotonic per-channel sequence id (for ordering). */
  seqId: number;
  /** Author is the current user — UI right-aligns and tints these. */
  isYou: boolean;
  /** Day-1 prompt seed messages get a small ribbon. Kept as data so
   *  the UI doesn't need to special-case author name for "NexGen". */
  isSystemPrompt?: boolean;
};

export type SendMessageInput = {
  channelId: string;
  body: string;
};

export type SendMessageResult = {
  message: Message;
};

/* ------------------------------------------------------------------ */
/* Premium (Phase 3).                                                  */
/* ------------------------------------------------------------------ */

export type PremiumStatus = {
  /** True once Razorpay confirms the one-time charge. */
  active: boolean;
  /** ISO timestamp of activation. */
  activatedAt: string | null;
  /** Receipt id for parent-view of receipts (PR4). */
  receiptId: string | null;
};

export type StartCheckoutResult = {
  /** Razorpay order id. UI passes this to the native Razorpay sheet. */
  razorpayOrderId: string;
  /** Display amount in INR rupees. */
  amountDisplay: string;
};

export type ParentDashboard = {
  groupSize: number;
  unlocked: boolean;
  verificationCounts: {
    phone: number;
    digilocker: number;
    admit: number;
  };
  /** Days until daughter / son's flight, if shared. */
  daysUntilArrival: number | null;
  /** Last time the dashboard was viewed by the parent. */
  lastViewedAt: string;
};

/* ------------------------------------------------------------------ */
/* Trust & Safety (touch-point shipped in Phase 1; full flow Phase 4). */
/* ------------------------------------------------------------------ */

export type ReportInput = {
  /** Free text from the user. */
  reason: string;
  /** Optional message id, channel id, or user id the report is about. */
  context?: { channelId?: string; messageId?: string; userId?: string };
};

export type ReportResult = {
  reportId: string;
  /** ISO timestamp by which a Trust & Safety advisor first-responds. */
  firstResponseBy: string;
  /** Reassurance text the UI can display verbatim. */
  ackText: string;
};

/* ------------------------------------------------------------------ */
/* Group-apply housing (Phase 3 GA1-4).                                */
/* ------------------------------------------------------------------ */

export type GroupApplyCluster = {
  id: string;
  /** PBSA partner the cluster routes to (per BP §5.2 + §3.7a R9). */
  partner: string;
  /** Destination city. */
  city: string;
  /** Number of verified students in the cluster (3-6). */
  size: number;
  /** Cluster phase: forming → submitted → accepted → declined. */
  phase: "forming" | "submitted" | "accepted" | "declined";
  /** Members in the cluster, by initials only (privacy). */
  members: { id: string; initials: string; firstName: string }[];
  /** Earliest move-in window. */
  moveInDate: string;
  /** ISO timestamp of last activity. */
  lastActivityAt: string;
};

export type GroupApplySubmission = {
  clusterId: string;
  submittedAt: string;
  /** ISO timestamp the partner is expected to respond by. */
  respondBy: string;
  /** Tracking ref the user can show their parents. */
  trackingRef: string;
};

/* ------------------------------------------------------------------ */
/* Mental health (Phase 4 MH-A/MH-B).                                  */
/* ------------------------------------------------------------------ */

export type CrisisResource = {
  name: string;
  phone: string | null;
  url?: string;
  /** Lower = higher in the list. */
  priority: number;
  /** "IN" | "IE" | "DE" — same shape as packages/shared CRISIS_RESOURCES. */
  region: "IN" | "IE" | "DE";
  /** True if calling this number is generally free (helpline). */
  freeCall?: boolean;
};

/* ------------------------------------------------------------------ */
/* Accommodation scams (Phase 4 SCM-A/SCM-B).                          */
/* ------------------------------------------------------------------ */

export type ScamPattern = {
  id: string;
  title: string;
  /** What the scammer typically asks for. */
  ask: string;
  /** Why it's a red flag. */
  redFlag: string;
  /** What to do instead. */
  saferPath: string;
};

/* ------------------------------------------------------------------ */
/* The shape every service implementation must satisfy.                */
/* ------------------------------------------------------------------ */

export type Services = {
  auth: {
    requestOtp(input: RequestOtpInput): Promise<RequestOtpResult>;
    verifyOtp(input: VerifyOtpInput): Promise<VerifyOtpResult>;
  };
  verification: {
    startDigiLocker(): Promise<StartDigiLockerResult>;
    completeDigiLocker(input: CompleteDigiLockerInput): Promise<CompleteDigiLockerResult>;
    forceFailure(reason: DigiLockerFailureReason): Promise<void>;
    uploadAdmit(input: UploadAdmitInput): Promise<UploadAdmitResult>;
    completeAdmit(input: CompleteAdmitInput): Promise<CompleteAdmitResult>;
    status(): Promise<VerificationStatus>;
  };
  corridor: {
    /** Returns the current user's corridor + state. */
    me(): Promise<Corridor>;
    members(): Promise<CorridorMember[]>;
    subCircles(): Promise<SubCircle[]>;
    /** Toggle membership in a sub-circle. */
    toggleSubCircle(input: { subCircleId: string }): Promise<SubCircle>;
  };
  chat: {
    listChannels(): Promise<Channel[]>;
    getMessages(input: { channelId: string }): Promise<Message[]>;
    sendMessage(input: SendMessageInput): Promise<SendMessageResult>;
  };
  premium: {
    status(): Promise<PremiumStatus>;
    startCheckout(): Promise<StartCheckoutResult>;
    /** Stand-in for Razorpay's payment-success webhook. Mock fakes it. */
    confirmCheckout(input: { razorpayOrderId: string }): Promise<PremiumStatus>;
  };
  parent: {
    dashboard(): Promise<ParentDashboard>;
    /** Sets/changes the parent-view passcode. */
    setPasscode(input: { passcode: string }): Promise<void>;
    /** Validates a passcode without exposing it. */
    verifyPasscode(input: { passcode: string }): Promise<{ ok: boolean }>;
  };
  trustSafety: {
    report(input: ReportInput): Promise<ReportResult>;
    /** Subscribe-and-poll the advisor dialogue thread for a report. */
    dialogue(input: { reportId: string }): Promise<{
      messages: {
        id: string;
        from: "advisor" | "you" | "system";
        body: string;
        sentAt: string;
        advisorName?: string;
      }[];
    }>;
    /** Send a follow-up message into the dialogue thread. */
    replyToReport(input: { reportId: string; body: string }): Promise<void>;
  };
  groupApply: {
    /** Returns the user's current cluster, if any. */
    myCluster(): Promise<GroupApplyCluster | null>;
    /** Form a new cluster (mock returns a 4-person seed). */
    formCluster(): Promise<GroupApplyCluster>;
    /** Submit the cluster to the PBSA partner. */
    submit(input: { clusterId: string }): Promise<GroupApplySubmission>;
    leaveCluster(input: { clusterId: string }): Promise<void>;
  };
  mentalHealth: {
    /** Region-aware list of crisis resources. */
    resources(input: { region: "IN" | "IE" | "DE" }): Promise<CrisisResource[]>;
  };
  scams: {
    /** Five canonical accommodation-scam patterns from BP §16.30. */
    patterns(): Promise<ScamPattern[]>;
  };
};
