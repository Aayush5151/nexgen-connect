/**
 * Hard-delete push_subscription rows that have been failing for ≥ 30 days.
 *
 * The push-fanout job soft-marks (`last_failure_at`, `last_failure_code`)
 * subscriptions whose endpoint returned 404/410 (Web Push spec for
 * "this endpoint is gone forever"). They're left in place so a debug
 * session can see the history; this cron sweeps them up.
 *
 * Runs daily at 03:30 UTC (low-traffic window, post-midnight in IST so
 * any in-flight Indian-corridor push fan-outs aren't competing for
 * write locks). Dry-run + delete-count are returned so the Inngest
 * dashboard shows what was reaped without anyone tailing logs.
 *
 * v16 web pivot Bucket 4 follow-up.
 */
import { inngest } from "../client";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const FAIL_TTL_DAYS = 30;

export const pushCleanup = inngest.createFunction(
  {
    id: "push-cleanup",
    retries: 1,
    triggers: [{ cron: "30 3 * * *" }],
  },
  async ({ step }) => {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { ok: true, action: "skipped-no-service-role" };
    }

    const cutoff = await step.run("compute-cutoff", async () => {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - FAIL_TTL_DAYS);
      return d.toISOString();
    });

    const result = await step.run("delete-expired", async () => {
      const admin = getSupabaseAdmin();
      const { data, error } = await admin
        .from("push_subscription")
        .delete()
        .lt("last_failure_at", cutoff)
        .not("last_failure_at", "is", null)
        .select("id");
      if (error) {
        // Don't throw — Inngest's retry would just hit the same error.
        // Log + return so the function lands in "completed with note".
        console.warn(`[inngest:push-cleanup] delete failed: ${error.message}`);
        return { deleted: 0, error: error.message };
      }
      return { deleted: data?.length ?? 0 };
    });

    return { ok: true, cutoff, ...result };
  },
);
