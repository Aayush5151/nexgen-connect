/**
 * Welcome email — fires after phone OTP verification.
 *
 * Flow:
 *   1. Look up the verified user via Supabase admin (we only have
 *      the user id from the event data; the email + profile fields
 *      live in auth.users / user_metadata).
 *   2. If the user has no email on file, skip silently — phone-only
 *      signups can fill email at /signup/you and re-trigger isn't
 *      worth the complexity.
 *   3. If the profile + corridor metadata aren't both populated yet,
 *      skip — the welcome template references home city + uni +
 *      intake; firing it pre-corridor produces a stub-looking email.
 *      The job fires again at funnel-completion via a future
 *      `signup/funnel.completed` event (TODO).
 *   4. Send via Resend's existing sendWaitlistWelcome helper (which
 *      ships List-Unsubscribe headers + the founder voice copy).
 *
 * Always fires the admin "new signup" alert when ADMIN_EMAIL is set —
 * that beat is genuinely useful at phone-OTP time, even before the
 * user has filled the rest of the funnel.
 *
 * Inngest gives us:
 *   - Retries with exponential backoff if Resend rate-limits us
 *   - A durable record in the Inngest UI ("did the welcome go out?")
 *
 * v16 web pivot Bucket 4 follow-up (P4 work) / Bucket 7+8 wiring.
 */
import { inngest } from "../client";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { sendFounderAlertOnVerify, sendWaitlistWelcome } from "@/lib/resend";
import type { SignupMetadata } from "@/lib/supabase/schema";

type ProfileSnapshot = {
  email: string | null;
  firstName: string | null;
  homeCity: string | null;
  destinationUni: string | null;
  intake: string | null;
  createdAt: string;
};

export const welcomeEmail = inngest.createFunction(
  {
    id: "welcome-email",
    retries: 5,
    triggers: [{ event: "auth/phone.verified" }],
  },
  async ({ event, step }) => {
    const { verifiedUserId, phoneE164 } = event.data;

    const profile = await step.run("load-user", async (): Promise<ProfileSnapshot | null> => {
      const admin = getSupabaseAdmin();
      const { data, error } = await admin.auth.admin.getUserById(verifiedUserId);
      if (error || !data?.user) {
        console.warn(
          `[inngest:welcome-email] user not found id=${verifiedUserId}`,
          error?.message,
        );
        return null;
      }
      const meta = (data.user.user_metadata ?? {}) as SignupMetadata;
      return {
        email: meta.email ?? data.user.email ?? null,
        firstName: meta.first_name ?? null,
        homeCity: meta.home_city ?? null,
        destinationUni: meta.destination_uni ?? null,
        intake: meta.intake ?? null,
        createdAt: data.user.created_at,
      };
    });

    // Fire the admin alert first — it doesn't depend on profile fields
    // and the founder wants the ping at phone-OTP time even if the
    // full corridor info isn't set yet.
    await step.run("admin-alert", async () => {
      if (!process.env.ADMIN_EMAIL || !process.env.RESEND_API_KEY) return;
      const phoneTail = phoneE164.replace(/\D/g, "").slice(-4);
      const alert = await sendFounderAlertOnVerify({
        firstName: profile?.firstName ?? "(unset)",
        homeCity: profile?.homeCity ?? "(unset)",
        destinationUniversity: profile?.destinationUni ?? "(unset)",
        phoneHashTail: phoneTail,
        createdAt: profile?.createdAt ?? new Date().toISOString(),
      });
      if (!alert.ok) {
        console.warn(
          `[inngest:welcome-email] admin alert failed: ${alert.error}`,
        );
      }
    });

    if (!profile) {
      return { ok: false, reason: "user-not-found" };
    }

    if (!profile.email) {
      // Phone-only signup, no backup email yet. The user can fill it
      // at /signup/you; we don't re-fire welcome from a profile
      // update today (would need a new event). Skip silently.
      return { ok: true, action: "skipped-no-email" };
    }

    // The welcome template names the corridor verbatim ("on the
    // list for UCD, September 2026"). Firing pre-corridor would
    // produce "on the list for (unset), (unset)" — worse than
    // silence. Skip and let a future signup/funnel.completed
    // event re-fire when corridor is set.
    if (
      !profile.firstName ||
      !profile.homeCity ||
      !profile.destinationUni ||
      !profile.intake
    ) {
      return { ok: true, action: "skipped-profile-incomplete" };
    }

    const sent = await step.run("send-welcome", async () => {
      if (!process.env.RESEND_API_KEY) {
        return { ok: false, error: "RESEND_API_KEY not set" };
      }
      return sendWaitlistWelcome({
        to: profile.email!,
        firstName: profile.firstName!,
        homeCity: profile.homeCity!,
        destinationUniversity: profile.destinationUni!,
        intake: profile.intake!,
      });
    });

    if (!sent.ok) {
      // Throwing surfaces the failure to Inngest's retry policy.
      throw new Error(`welcome-email send failed: ${sent.error}`);
    }

    return { ok: true, action: "sent", verifiedUserId };
  },
);
