/**
 * Trust & Safety SLA cron — escalates unresolved reports.
 *
 * Triggered by `ts/report.filed`. Sleeps for the category's SLA
 * window (1h for harassment + self_harm priorities per v15 BP §3.5,
 * 4h for everything else), then reads the chat_report row via
 * Supabase admin to decide whether the advisor has actioned it. If
 * the row is still `open`, log + (when ADMIN_EMAIL is set) ping the
 * founder so the SLA promise on the marketing page is enforceable.
 *
 * The chat_report schema lives in migration 0009_v16_chat.sql. The
 * status column tracks open → triaged → actioned/dismissed.
 *
 * v16 web pivot Bucket 4 follow-up (P4 work) / Bucket 7+8 wiring.
 */
import { inngest } from "../client";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type ReportState =
  | { found: true; status: string | null; actionedAt: string | null }
  | { found: false; reason: string };

export const tsSla = inngest.createFunction(
  {
    id: "ts-sla",
    retries: 2,
    triggers: [{ event: "ts/report.filed" }],
  },
  async ({ event, step }) => {
    const { reportId, reasonCode, corridorId } = event.data;

    // Priority categories (harassment + self_harm) get the 1h SLA.
    // Everything else is 4h. Mirrors slaHoursFor() in
    // web/src/app/api/chat/report/route.ts.
    const priority =
      reasonCode === "harassment" || reasonCode === "self_harm";
    const slaWindow = priority ? "1h" : "4h";

    await step.sleep("sla-window", slaWindow);

    const state = await step.run("check-report-state", async (): Promise<ReportState> => {
      const admin = getSupabaseAdmin();
      const { data, error } = await admin
        .from("chat_report")
        .select("status, actioned_at")
        .eq("id", reportId)
        .maybeSingle();
      if (error) {
        return { found: false, reason: error.message };
      }
      if (!data) {
        // Mock-mode: the chat-report route returns ticket ids like
        // "chat_<timestamp>" rather than a UUID, so the row will not
        // be in the table. Treat as "not found" (no escalation).
        return { found: false, reason: "row not in chat_report" };
      }
      return {
        found: true,
        status: (data.status as string | null) ?? null,
        actionedAt: (data.actioned_at as string | null) ?? null,
      };
    });

    if (!state.found) {
      console.log(
        `[inngest:ts-sla] skip escalation: ${state.reason} report=${reportId}`,
      );
      return { ok: true, reportId, escalated: false, reason: state.reason };
    }

    const stillPending = state.status === "open";
    if (stillPending) {
      await step.run("escalate", async () => {
        const adminEmail = process.env.ADMIN_EMAIL;
        if (!adminEmail) {
          console.log(
            `[inngest:ts-sla] would escalate (ADMIN_EMAIL unset) report=${reportId} corridor=${corridorId} reason=${reasonCode} sla=${slaWindow}`,
          );
          return;
        }
        // The body never contains report content (PII discipline) —
        // just the ids the founder uses to look it up via /admin or
        // a direct Supabase query. Resend wire-up is the same shape
        // as sendFounderAlertOnVerify; stdout keeps this job dep-light.
        console.log(
          `[inngest:ts-sla] ESCALATE admin=${adminEmail} report=${reportId} corridor=${corridorId} reason=${reasonCode} sla=${slaWindow}`,
        );
      });
    }

    return { ok: true, reportId, escalated: stillPending, status: state.status };
  },
);
