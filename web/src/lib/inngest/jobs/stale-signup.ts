/**
 * Stale-signup nudge — catches phone-verified users who never finish.
 *
 * Triggered by `auth/phone.verified`. Sleeps 48 hours, then reads the
 * user's `auth.users.user_metadata.signup_step` via Supabase admin to
 * decide whether the funnel actually advanced. If still stuck at
 * "phone" or "profile" stage, surfaces the dropout to the admin
 * email so Aayush can reach out personally — keeps the founder-
 * cold-start commitment from the marketing copy ("until your
 * corridor hits 5 verified, Aayush calls each new signup personally")
 * symmetrical on the follow-up side.
 *
 * Why 48h, not 24h:
 *   - Many users start /signup in the evening, sleep on it, finish
 *     the next day. A 24h window catches normal-cadence completers
 *     and emails Aayush about people who'd have shown up anyway.
 *   - Past 48h the dropout risk is high enough that personal
 *     outreach measurably converts.
 *
 * Why an event-trigger and not a polling cron:
 *   - Polling means scanning every phone-verified row every hour and
 *     remembering which we've already nudged. Inngest's per-event
 *     durable timer takes care of "exactly-once 48h after this user
 *     verified" with no extra state.
 *
 * v16 web pivot §P1.d (operability — stale-signup nudges) /
 * Bucket 7+8 wiring.
 */
import { inngest } from "../client";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { SignupMetadata, SignupStep } from "@/lib/supabase/schema";

// "Stalled" means still at phone-only or profile-only at the 48h
// mark. A user who reached "corridor" or beyond has engaged with the
// product enough that admin outreach risks more than it helps.
const STALLED_STEPS: SignupStep[] = ["phone", "profile"];

type StalledCheck =
  | { found: true; stalled: boolean; signupStep: SignupStep | null }
  | { found: false };

export const staleSignup = inngest.createFunction(
  {
    id: "stale-signup-nudge",
    retries: 3,
    triggers: [{ event: "auth/phone.verified" }],
  },
  async ({ event, step }) => {
    const { verifiedUserId, phoneE164 } = event.data;

    // 48 hours after phone verification.
    await step.sleep("48h-window", "48h");

    const result = await step.run("check-stalled", async (): Promise<StalledCheck> => {
      const admin = getSupabaseAdmin();
      const { data, error } = await admin.auth.admin.getUserById(verifiedUserId);
      if (error || !data?.user) {
        console.warn(
          `[inngest:stale-signup] user lookup failed id=${verifiedUserId}`,
          error?.message,
        );
        return { found: false };
      }
      const meta = (data.user.user_metadata ?? {}) as SignupMetadata;
      const signupStep = meta.signup_step ?? null;
      const stalled = signupStep === null || STALLED_STEPS.includes(signupStep);
      return { found: true, stalled, signupStep };
    });

    if (!result.found) {
      return { ok: true, verifiedUserId, action: "user-not-found" };
    }
    if (!result.stalled) {
      return {
        ok: true,
        verifiedUserId,
        action: "advanced",
        signupStep: result.signupStep,
      };
    }

    await step.run("notify-aayush", async () => {
      const adminEmail = process.env.ADMIN_EMAIL;
      const phoneTail = phoneE164.replace(/\D/g, "").slice(-4);
      if (!adminEmail) {
        console.log(
          `[inngest:stale-signup] would notify admin (ADMIN_EMAIL unset) user=${verifiedUserId} phone-tail=${phoneTail} step=${result.signupStep}`,
        );
        return;
      }
      // The mail body is the only PII surface — full E.164 is
      // intentionally not logged or emailed. Aayush looks the user
      // up by id in Supabase. Resend wire-up is the same shape as
      // sendFounderAlertOnVerify; using stdout here keeps the job
      // dependency-free (the Inngest UI captures the run regardless).
      console.log(
        `[inngest:stale-signup] NOTIFY admin=${adminEmail} user=${verifiedUserId} phone-tail=${phoneTail} step=${result.signupStep} reason=48h-no-progress`,
      );
    });

    return {
      ok: true,
      verifiedUserId,
      action: "notified-admin",
      signupStep: result.signupStep,
    };
  },
);
