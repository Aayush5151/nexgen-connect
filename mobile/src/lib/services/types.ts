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
    /** Returns the failure reason if DigiLocker rejects the user. */
    forceFailure(reason: DigiLockerFailureReason): Promise<void>;
    uploadAdmit(input: UploadAdmitInput): Promise<UploadAdmitResult>;
    completeAdmit(input: CompleteAdmitInput): Promise<CompleteAdmitResult>;
    status(): Promise<VerificationStatus>;
  };
};
