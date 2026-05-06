/**
 * Stale-signup nudge — catches phone-verified users who never finish.
 *
 * Triggered by `auth/phone.verified`. Sleeps 48 hours, then checks
 * whether the same user has reached identity-verified state. If not,
 * surfaces the dropout to the admin email so Aayush can reach out
 * personally — the founder-cold-start commitment from the marketing
 * copy ("until your corridor hits 5 verified, Aayush calls each new
 * signup personally") is the same promise we keep here on the
 * follow-up side.
 *
 * Why 48h, not 24h:
 *   - Many users start /signup in the evening, sleep on it, finish
 *     the next day. A 24h window catches normal-cadence completers
 *     and emails Aayush about people who'd have shown up anyway.
 *   - Past 48h the dropout risk is high enough that personal
 *     outreach measurably converts (per Y Combinator's "1,000-true-
 *     fans" playbook for early-stage products).
 *
 * Why an event-trigger and not a polling cron:
 *   - Polling means scanning every phone-verified row every hour and
 *     remembering which we've already nudged. Inngest's per-event
 *     durable timer takes care of "exactly-once 48h after this user
 *     verified" with no extra state.
 *   - Retries are baked in. If admin email delivery fails, Inngest
 *     retries with exponential backoff.
 *
 * V1 stub: logs the dropout. P4 lifts in a real Resend email + a
 * tRPC `stats.signupStage` query so the check is data-backed.
 *
 * v16 web pivot §P1.d (operability — stale-signup nudges).
 */
import { inngest } from "../client";

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

    // Check whether the user actually finished verification. The
    // current verifyOtp procedure returns identity-verified=true only
    // after DigiLocker + admit-letter both clear; until P4 lifts a
    // tRPC `stats.signupStage` query, this is a stub that always
    // assumes stalled. False positives email admin, but that's
    // recoverable — false negatives (silent dropouts) aren't.
    const isStalled = await step.run("check-stalled", async () => {
      // Stub. Once exposed, swap for a tRPC call that reads
      // verified_user.identity_verified_at and admit_decided_at.
      console.log(
        `[inngest:stale-signup] checking user=${verifiedUserId} phone-tail=${phoneE164.slice(-4)}`,
      );
      return true;
    });

    if (!isStalled) {
      return { ok: true, verifiedUserId, action: "completed-on-time" };
    }

    await step.run("notify-aayush", async () => {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (!adminEmail) {
        console.log(
          `[inngest:stale-signup] would notify admin (ADMIN_EMAIL unset) user=${verifiedUserId} phone-tail=${phoneE164.slice(-4)}`,
        );
        return;
      }
      // Stub — Resend wire-up follows the welcome-email pattern.
      // The mail body is the only PII surface and it contains just
      // the user id and phone tail (last 4 digits), not the full
      // E.164. The full number is intentionally NOT logged or
      // emailed — Aayush looks the user up by id in Supabase.
      console.log(
        `[inngest:stale-signup] NOTIFY admin=${adminEmail} user=${verifiedUserId} phone-tail=${phoneE164.slice(-4)} reason=48h-no-identity`,
      );
    });

    return { ok: true, verifiedUserId, action: "notified-admin" };
  },
);
