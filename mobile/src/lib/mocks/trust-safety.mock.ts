/**
 * Mock T&S report service. The full Phase 4 surface (TS1-3, AD4-5,
 * graded SLA routing) lives elsewhere; for now we just need the
 * one-tap "Report" entry point that lands a row in the queue and
 * surfaces a graded SLA reassurance to the user.
 *
 * Per BP §9.5: free tier first-response in 4h business / 12h overnight,
 * Premium 1h 24/7, imminent harm 30m regardless of tier. The mock just
 * returns the matching reassurance text for the free tier — Phase 4
 * adds tier-aware routing.
 */

import { TS_SLA_BUSINESS_MIN } from "@nexgen-connect/shared";
import type { ReportInput, ReportResult } from "../services/types";

function delay<T>(ms: number, v: T): Promise<T> {
  return new Promise((r) => setTimeout(() => r(v), ms));
}
function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export const trustSafetyMock = {
  async report(_input: ReportInput): Promise<ReportResult> {
    await delay(700, null);
    const minutesAhead = TS_SLA_BUSINESS_MIN;
    return {
      reportId: "rpt_" + randomId(),
      firstResponseBy: new Date(
        Date.now() + minutesAhead * 60_000,
      ).toISOString(),
      ackText:
        "Routed to a named Trust & Safety advisor. They first-respond within 4 hours, business hours IST. Imminent harm cases get a 30-minute outreach attempt regardless of time of day.",
    };
  },
};
