/**
 * Twilio Voice Masked Number — mock client.
 *
 * v15 BP §6.4 / v6 build §5.18 — used by:
 *   1. admin.callFirstMover (CH6 first-mover commitment, founder calls
 *      first-verified user in women-only or tier-3 home cohorts)
 *   2. admin.callUserViaMasked (MH1 emergency-phone bridge, Y6 first-
 *      week-arrival "I need help" 1-tap button)
 *
 * Real implementation bridges via Twilio Voice — server decrypts the
 * user's phone in process memory (consent-gated), bridges call,
 * returns a masked number to the advisor. Plaintext wiped within 5
 * seconds. Audit-logged.
 *
 * Mock: returns a fake masked number, fires fake call-start /
 * call-end webhooks via in-memory event queue, audit_log entries
 * stored in module state for inspection.
 */

export type TwilioCallSession = {
  sessionId: string;
  maskedNumber: string;
  /** ISO timestamp of session creation. */
  startedAt: string;
  /** ISO timestamp of session expiry (default: 30 min). */
  expiresAt: string;
  /** ISO when call actually started (mock fakes 4s after session). */
  callStartedAt: string | null;
  /** ISO when call ended (mock fakes 90s after start). */
  callEndedAt: string | null;
  /** Duration in seconds (call_ended_at - call_started_at). */
  durationS: number | null;
  /** Status: queued -> ringing -> connected -> ended. */
  status: "queued" | "ringing" | "connected" | "ended";
};

export type TwilioWebhookEvent = {
  event: "call.start" | "call.end";
  sessionId: string;
  at: string;
  durationS?: number;
};

const sessions: Map<string, TwilioCallSession> = new Map();
const webhookLog: TwilioWebhookEvent[] = [];

function generateMaskedNumber(): string {
  const digits = Math.floor(1000 + Math.random() * 9000).toString();
  return `+1-415-555-${digits}`;
}

function randomId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function delay<T>(ms: number, v: T): Promise<T> {
  return new Promise((r) => setTimeout(() => r(v), ms));
}

export const twilioVoiceMock = {
  /** Mirrors admin.callFirstMover server-side — returns a session
   *  the admin app can show to the calling advisor. The advisor's
   *  app then dials the masked number. */
  async startMaskedCall(input: {
    userId: string;
    advisorId: string;
    purpose: "first_mover" | "mh1_emergency" | "y6_help";
  }): Promise<TwilioCallSession> {
    const sessionId = randomId("twses");
    const session: TwilioCallSession = {
      sessionId,
      maskedNumber: generateMaskedNumber(),
      startedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
      callStartedAt: null,
      callEndedAt: null,
      durationS: null,
      status: "queued",
    };
    sessions.set(sessionId, session);

    // Fake the call lifecycle in the background — ringing → connected
    // → ended after 4s + 90s. Real Twilio fires these via webhook.
    setTimeout(() => {
      const s = sessions.get(sessionId);
      if (!s) return;
      s.status = "connected";
      s.callStartedAt = new Date().toISOString();
      webhookLog.push({
        event: "call.start",
        sessionId,
        at: s.callStartedAt,
      });
    }, 4_000);

    setTimeout(() => {
      const s = sessions.get(sessionId);
      if (!s) return;
      s.status = "ended";
      s.callEndedAt = new Date().toISOString();
      s.durationS = 90;
      webhookLog.push({
        event: "call.end",
        sessionId,
        at: s.callEndedAt,
        durationS: 90,
      });
    }, 94_000);

    void input; // unused in mock; real impl uses for audit
    return delay(150, session);
  },

  /** Inspect the in-memory webhook log (test helper). */
  _webhookLog(): TwilioWebhookEvent[] {
    return [...webhookLog];
  },

  /** Inspect a session by id (admin / test helper). */
  _getSession(sessionId: string): TwilioCallSession | undefined {
    return sessions.get(sessionId);
  },

  /** Reset all in-memory state (test setup). */
  _reset(): void {
    sessions.clear();
    webhookLog.length = 0;
  },
};

export type TwilioVoiceClient = typeof twilioVoiceMock;
