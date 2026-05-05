/**
 * Trust & Safety SLA cron — escalates unresolved reports.
 *
 * Triggered by `ts/report.filed`. The function schedules a 4-hour
 * delayed step that checks if the report is still in `pending` state;
 * if so, fires an admin email + a Slack-style escalation event.
 *
 * SLA target: every report acknowledged in <4h (per v15 BP §safety).
 *
 * v16 web pivot Bucket 4 follow-up (P4 work).
 */
import { inngest } from "../client";

export const tsSla = inngest.createFunction(
  {
    id: "ts-sla",
    retries: 2,
    triggers: [{ event: "ts/report.filed" }],
  },
  async ({ event, step }) => {
    const { reportId, reasonCode, corridorId } = event.data;

    // Wait 4h, then re-check the report state.
    await step.sleep("sla-window", "4h");

    const stillPending = await step.run("check-report-state", async () => {
      // Stub — once P1.c lifts trustSafety.* through tRPC we fetch the
      // report row and inspect status.
      console.log(
        `[inngest:ts-sla] checking report=${reportId} corridor=${corridorId} reason=${reasonCode}`,
      );
      return false;
    });

    if (stillPending) {
      await step.run("escalate", async () => {
        // Email admin, post to escalation channel, etc.
        console.log(`[inngest:ts-sla] ESCALATE report=${reportId}`);
      });
    }

    return { ok: true, reportId, escalated: stillPending };
  },
);
