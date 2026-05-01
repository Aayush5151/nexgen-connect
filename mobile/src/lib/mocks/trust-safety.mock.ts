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

type DialogueMessage = {
  id: string;
  from: "advisor" | "you" | "system";
  body: string;
  sentAt: string;
  advisorName?: string;
};

const dialogueByReport: Record<string, DialogueMessage[]> = {};

const ADVISOR_NAME = "Aanya Krishnan";

function seedDialogue(reportId: string): DialogueMessage[] {
  const seed: DialogueMessage[] = [
    {
      id: "d_sys_1",
      from: "system",
      body: "Report received. Routed to a named Trust & Safety advisor. First response within 4 hours.",
      sentAt: new Date().toISOString(),
    },
    {
      id: "d_a_1",
      from: "advisor",
      advisorName: ADVISOR_NAME,
      body: "Hi — I'm Aanya, the on-shift T&S advisor. I've read your report and want to make sure I have the full picture before I act. Two questions: (1) is the user still able to message you? (2) would you like me to mute them while we look into it?",
      sentAt: new Date(Date.now() + 8 * 60_000).toISOString(),
    },
  ];
  dialogueByReport[reportId] = seed;
  return seed;
}

export const trustSafetyMock = {
  async report(_input: ReportInput): Promise<ReportResult> {
    await delay(700, null);
    const minutesAhead = TS_SLA_BUSINESS_MIN;
    const reportId = "rpt_" + randomId();
    seedDialogue(reportId);
    return {
      reportId,
      firstResponseBy: new Date(Date.now() + minutesAhead * 60_000).toISOString(),
      ackText:
        "Routed to a named Trust & Safety advisor. They first-respond within 4 hours, business hours IST. Imminent harm cases get a 30-minute outreach attempt regardless of time of day.",
    };
  },

  async dialogue({ reportId }: { reportId: string }): Promise<{
    messages: DialogueMessage[];
  }> {
    const list = dialogueByReport[reportId] ?? seedDialogue(reportId);
    return delay(150, { messages: [...list] });
  },

  async replyToReport({ reportId, body }: { reportId: string; body: string }): Promise<void> {
    const list = dialogueByReport[reportId] ?? seedDialogue(reportId);
    list.push({
      id: "d_y_" + randomId(),
      from: "you",
      body,
      sentAt: new Date().toISOString(),
    });
    // Mock advisor follow-up after 4 seconds.
    setTimeout(() => {
      list.push({
        id: "d_a_" + randomId(),
        from: "advisor",
        advisorName: ADVISOR_NAME,
        body: "Got it. I'm muting them now and reviewing the recent thread. I'll come back to you within the next hour.",
        sentAt: new Date().toISOString(),
      });
    }, 4_000);
    return delay(150, undefined);
  },
};
