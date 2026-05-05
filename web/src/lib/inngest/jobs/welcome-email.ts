/**
 * Welcome email — fires after phone OTP verification.
 *
 * The auth.verifyOtp procedure today fires a fire-and-forget Resend
 * email + admin alert (orphaned in web/src/lib/msg91.ts). Lifting
 * that to Inngest gives:
 *
 *   - Retries with exponential backoff if Resend rate-limits us
 *   - A durable record in the Inngest UI ("did the welcome go out?")
 *   - Easy A/B of email copy by gating the step on a flag
 *
 * v16 web pivot Bucket 4 follow-up (P4 work).
 */
import { inngest } from "../client";

export const welcomeEmail = inngest.createFunction(
  {
    id: "welcome-email",
    retries: 5,
    triggers: [{ event: "auth/phone.verified" }],
  },
  async ({ event, step }) => {
    const { verifiedUserId, phoneE164 } = event.data;

    await step.run("send-welcome", async () => {
      if (!process.env.RESEND_API_KEY) {
        console.log(
          `[inngest:welcome-email] skipped (no RESEND_API_KEY) user=${verifiedUserId}`,
        );
        return;
      }
      // Stub — wires to the existing parent-link / welcome-email helper
      // once react-email templates land. For now the send is logged so
      // the Inngest UI captures the run.
      console.log(
        `[inngest:welcome-email] would send to phone-derived address for user=${verifiedUserId}`,
      );
    });

    await step.run("admin-alert", async () => {
      if (!process.env.ADMIN_EMAIL) return;
      console.log(
        `[inngest:welcome-email] admin alert: new signup phone=${phoneE164.slice(0, 5)}… user=${verifiedUserId}`,
      );
    });

    return { ok: true, verifiedUserId };
  },
);
