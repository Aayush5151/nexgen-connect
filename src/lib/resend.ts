import "server-only";

import { Resend } from "resend";

let cached: Resend | null = null;

function getClient(): Resend {
  if (cached) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("Missing RESEND_API_KEY");
  cached = new Resend(key);
  return cached;
}

function fromAddress(): string {
  return (
    process.env.RESEND_FROM_ADDRESS ??
    "NexGen Connect <hello@nexgenconnect.com>"
  );
}

type SendResult = { ok: true; id: string } | { ok: false; error: string };

export async function sendWaitlistWelcome(params: {
  to: string;
  firstName: string;
  destinationUniversity: string;
  homeCity: string;
}): Promise<SendResult> {
  const { to, firstName, destinationUniversity, homeCity } = params;

  try {
    const { data, error } = await getClient().emails.send({
      from: fromAddress(),
      to,
      subject: "You're on the NexGen Connect waitlist",
      text:
        `Hey ${firstName},\n\n` +
        `You're on the list for ${destinationUniversity}, September 2026.\n` +
        `We'll match you with verified students from ${homeCity} going to the same university, before your flight.\n\n` +
        `No WhatsApp chaos. No strangers.\n\n` +
        `Aayush\nFounder, NexGen Connect`,
      headers: {
        "List-Unsubscribe":
          "<mailto:hello@nexgenconnect.com?subject=Unsubscribe>, <https://nexgen-connect.vercel.app/unsubscribe>",
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });

    if (error) return { ok: false, error: error.message };
    return { ok: true, id: data?.id ?? "" };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Resend send failed",
    };
  }
}

export async function sendAdmitReceivedEmail(params: {
  to: string;
  firstName: string;
}): Promise<SendResult> {
  try {
    const { data, error } = await getClient().emails.send({
      from: fromAddress(),
      to: params.to,
      subject: "Admit letter received",
      text:
        `Hey ${params.firstName},\n\n` +
        `Got your admit letter. We'll verify it in 1 hour and drop you into your group.\n\n` +
        `Aayush`,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, id: data?.id ?? "" };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Resend send failed",
    };
  }
}

/**
 * Founder alert: fires every time a signup completes phone OTP.
 *
 * Design notes:
 *   - Fire-and-forget from verifyOtpAction (never block the user on SMTP).
 *   - Requires ADMIN_EMAIL to be set; silently no-ops if missing (dev).
 *   - Skips entirely if RESEND_API_KEY is missing so dev doesn't crash.
 *   - Body is terse on purpose: you read it on your phone in 2 seconds and
 *     click straight into /admin.
 *   - Never include raw phone / email — only first name + cohort info + the
 *     last 4 chars of the phone_hash as a disambiguator.
 *
 * If you haven't verified a sender domain with Resend yet, Resend only
 * delivers to the email on your own account. That is fine here because
 * ADMIN_EMAIL should be that same address.
 */
export async function sendFounderAlertOnVerify(params: {
  firstName: string;
  homeCity: string;
  destinationUniversity: string;
  phoneHashTail: string;
  createdAt: string;
}): Promise<SendResult> {
  const to = process.env.ADMIN_EMAIL;
  if (!to) return { ok: false, error: "ADMIN_EMAIL not set" };
  if (!process.env.RESEND_API_KEY) {
    return { ok: false, error: "RESEND_API_KEY not set" };
  }

  const reviewUrl =
    (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "") + "/admin";

  try {
    const { data, error } = await getClient().emails.send({
      from: fromAddress(),
      to,
      subject: `New signup: ${params.firstName} → ${params.destinationUniversity}`,
      text:
        `${params.firstName} from ${params.homeCity} just verified their phone.\n\n` +
        `Destination: ${params.destinationUniversity}\n` +
        `Signed up: ${params.createdAt}\n` +
        `Phone hash tail: …${params.phoneHashTail}\n\n` +
        `Review + approve → ${reviewUrl}\n`,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, id: data?.id ?? "" };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Resend send failed",
    };
  }
}
