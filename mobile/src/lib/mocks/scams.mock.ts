/**
 * Mock accommodation-scam patterns. Five canonical patterns from
 * BP §16.30 (SCM1-5). UI surfaces these as a "what to look out for"
 * card list inside the corridor. Each pattern includes the ask,
 * the red flag, and the safer path.
 */

import type { ScamPattern } from "../services/types";

function delay<T>(ms: number, v: T): Promise<T> {
  return new Promise((r) => setTimeout(() => r(v), ms));
}

const PATTERNS: ScamPattern[] = [
  {
    id: "scm_1",
    title: "Off-platform deposit request",
    ask: "Pay a deposit via UPI / Western Union before viewing.",
    redFlag:
      "Real PBSA partners hold the room with a credit-card auth, not a personal-account transfer.",
    saferPath:
      "Use the in-app group-apply flow. NexGen-mediated money flow is built so the deposit only releases on confirmed move-in.",
  },
  {
    id: "scm_2",
    title: "Lease that won't translate",
    ask: "Sign a lease in a language you don't read fluently, today.",
    redFlag:
      "Legitimate PBSAs publish lease templates in English well before your offer.",
    saferPath:
      "Ask for the English template. Cross-check on the partner's website. Sit with it for a day before signing.",
  },
  {
    id: "scm_3",
    title: "Cash-only key-handover",
    ask: "Pay 3 months' rent cash on key handover, no receipt.",
    redFlag:
      "No legitimate landlord refuses a paper trail. Cash-only is a red flag for unregistered sub-letting.",
    saferPath:
      "Bank transfer with a written rent receipt. Verified PBSA partners never ask for cash.",
  },
  {
    id: "scm_4",
    title: "Fake landlord identity",
    ask: "Send Aadhaar / passport scan + advance to a stranger from a Facebook group.",
    redFlag:
      "Real landlord identity verifies via the platform, not an attachment in DM.",
    saferPath:
      "Use NexGen's group-apply. Identity is platform-verified before any document exchange.",
  },
  {
    id: "scm_5",
    title: "Pressure-cooker urgency",
    ask: "Decide today, room goes tomorrow, deposit doubles next week.",
    redFlag:
      "Manufactured urgency is the hallmark of every accommodation scam in the H1 2025 Dublin spike.",
    saferPath:
      "Share the listing in your sub-circle. Sleep on it. A real opportunity is rarely time-bound to the hour.",
  },
];

export const scamsMock = {
  async patterns(): Promise<ScamPattern[]> {
    return delay(150, [...PATTERNS]);
  },
};
