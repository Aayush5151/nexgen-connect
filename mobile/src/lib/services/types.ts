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
/* Corridor + chat (Phase 2).                                          */
/* ------------------------------------------------------------------ */

export type Corridor = {
  id: string;
  homeCity: string;
  destination: string;
  destinationCountry: "Ireland" | "Germany";
  intakeMonth: string;
  /** Number of currently-verified students in the corridor. */
  verifiedCount: number;
  /** Threshold at which DMs unlock (server-config, defaults to 60). */
  unlockThreshold: number;
  /** True once verifiedCount >= unlockThreshold. UI uses this to flip
   *  the locked → unlocked surface, no separate field needed. */
  unlocked: boolean;
  /** ISO timestamp of unlock, if it's happened. Drives the "live for
   *  3 days" badge on the corridor home. */
  unlockedAt: string | null;
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
/* The shape every service implementation must satisfy.                */
/* ------------------------------------------------------------------ */

export type Services = {
  auth: {
    requestOtp(input: RequestOtpInput): Promise<RequestOtpResult>;
    verifyOtp(input: VerifyOtpInput): Promise<VerifyOtpResult>;
  };
  verification: {
    startDigiLocker(): Promise<StartDigiLockerResult>;
    completeDigiLocker(
      input: CompleteDigiLockerInput,
    ): Promise<CompleteDigiLockerResult>;
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
  };
};
