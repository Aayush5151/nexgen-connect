/**
 * Mock parent-view service. Parent dashboard surfaces the read-only
 * status the daughter / son shares with their parent (BP §9 L4): group
 * size, verification stats, days until arrival. Never DMs, never
 * member names.
 *
 * Passcode is stored in-memory for the mock; in prod it's hashed +
 * salted + persisted server-side under a separate JWT signing key
 * from the main session (Mobile Plan §11).
 */

import type { ParentDashboard } from "../services/types";

let passcode: string | null = null;

function delay<T>(ms: number, v: T): Promise<T> {
  return new Promise((r) => setTimeout(() => r(v), ms));
}

export const parentMock = {
  async dashboard(): Promise<ParentDashboard> {
    return delay(300, {
      groupSize: 47,
      unlocked: false,
      verificationCounts: {
        phone: 47,
        digilocker: 41,
        admit: 38,
      },
      daysUntilArrival: 134,
      lastViewedAt: new Date().toISOString(),
    });
  },

  async setPasscode(input: { passcode: string }): Promise<void> {
    if (!/^\d{4}$/.test(input.passcode)) {
      throw new Error("Passcode must be exactly 4 digits.");
    }
    passcode = input.passcode;
    return delay(300, undefined);
  },

  async verifyPasscode(input: { passcode: string }): Promise<{ ok: boolean }> {
    return delay(300, { ok: passcode === input.passcode });
  },
};
