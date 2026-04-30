/**
 * Mock verification service. Three flows:
 *
 *   1. DigiLocker happy path:
 *      startDigiLocker → returns a fake authUrl + state.
 *      The (mocked) WebView screen confirms in-app and calls
 *      completeDigiLocker which returns a maskedHash + summary.
 *
 *   2. DigiLocker failure path:
 *      Calls forceFailure(reason) so the next status() returns the
 *      matching failure state. The UI uses this in Expo dev
 *      builds to test the four S27/S28/S29/S30 fallbacks without
 *      needing a real-world Aadhaar issue. Removed in production.
 *
 *   3. Admit-letter:
 *      uploadAdmit returns a stub URL + docId; completeAdmit returns
 *      a 48h reviewBy + a queue position. status() flips through
 *      pending → approved automatically after 30 seconds in the
 *      mock so the funnel can be exercised end-to-end without
 *      manual intervention.
 */

import type {
  AdmitStatus,
  CompleteAdmitInput,
  CompleteAdmitResult,
  CompleteDigiLockerInput,
  CompleteDigiLockerResult,
  DigiLockerFailureReason,
  StartDigiLockerResult,
  UploadAdmitInput,
  UploadAdmitResult,
  VerificationStatus,
} from "../services/types";

function delay<T>(ms: number, v: T): Promise<T> {
  return new Promise((r) => setTimeout(() => r(v), ms));
}
function randomId(): string {
  return Math.random().toString(36).slice(2, 12);
}

/* ------------------------------------------------------------------ */
/* In-memory state. Resets on app reload — that's intentional for     */
/* the mock; the real client-side state of truth is the secure-store  */
/* session + the (future) /verification/status endpoint.               */
/* ------------------------------------------------------------------ */

type InternalState = {
  identityState: VerificationStatus["identity"];
  forcedFailure: DigiLockerFailureReason | null;
  admitState: AdmitStatus;
  admitFlipsAtMs: number | null;
};

const state: InternalState = {
  identityState: { state: "unstarted" },
  forcedFailure: null,
  admitState: { state: "not_uploaded" },
  admitFlipsAtMs: null,
};

/* ------------------------------------------------------------------ */
/* Service.                                                            */
/* ------------------------------------------------------------------ */

export const verificationMock = {
  async startDigiLocker(): Promise<StartDigiLockerResult> {
    state.identityState = { state: "in_progress" };
    return delay(400, {
      authUrl: "mock://digilocker/authorise",
      state: "mock_state_" + randomId(),
    });
  },

  async completeDigiLocker(_input: CompleteDigiLockerInput): Promise<CompleteDigiLockerResult> {
    await delay(900, null);

    if (state.forcedFailure) {
      const reason = state.forcedFailure;
      state.identityState = { state: "failed", reason };
      state.forcedFailure = null;
      throw new DigiLockerFailureError(reason);
    }

    state.identityState = {
      state: "verified",
      verifiedAt: new Date().toISOString(),
    };

    return {
      maskedHash: "****" + randomId().slice(0, 4),
      summary: {
        nameFirstAndLast: "A**** Sh**",
        yearMonthOfBirth: "20**-**",
      },
    };
  },

  async forceFailure(reason: DigiLockerFailureReason): Promise<void> {
    state.forcedFailure = reason;
  },

  async uploadAdmit(input: UploadAdmitInput): Promise<UploadAdmitResult> {
    await delay(700, null);
    if (input.fileSizeBytes > 12 * 1024 * 1024) {
      throw new Error("File too large. Keep it under 12 MB.");
    }
    return {
      uploadUrl: "mock://admit/upload",
      docId: "mock_doc_" + randomId(),
      retentionMinutesAfterReview: 60,
    };
  },

  async completeAdmit(_input: CompleteAdmitInput): Promise<CompleteAdmitResult> {
    await delay(500, null);
    const reviewBy = new Date(Date.now() + 48 * 3600_000).toISOString();
    state.admitState = {
      state: "pending",
      queuePosition: Math.floor(Math.random() * 8) + 1,
      reviewBy,
    };
    // Auto-flip to approved after 30s so the funnel reaches O11
    // without a human reviewer in dev.
    state.admitFlipsAtMs = Date.now() + 30_000;
    return {
      reviewBy,
      queuePosition: (state.admitState as { queuePosition: number }).queuePosition,
    };
  },

  async status(): Promise<VerificationStatus> {
    // Auto-flip admit to approved after the timer.
    if (
      state.admitFlipsAtMs &&
      Date.now() >= state.admitFlipsAtMs &&
      state.admitState.state === "pending"
    ) {
      state.admitState = {
        state: "approved",
        reviewedAt: new Date().toISOString(),
      };
      state.admitFlipsAtMs = null;
    }

    return {
      phone: { state: "verified", verifiedAt: new Date().toISOString() },
      identity: state.identityState,
      admit: state.admitState,
    };
  },
};

export class DigiLockerFailureError extends Error {
  constructor(public reason: DigiLockerFailureReason) {
    super(`DigiLocker failed: ${reason}`);
    this.name = "DigiLockerFailureError";
  }
}
