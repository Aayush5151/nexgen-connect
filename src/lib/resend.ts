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
        `We'll match you with verified students from ${homeCity} going to the same university — before your flight.\n\n` +
        `No WhatsApp chaos. No strangers.\n\n` +
        `— Aayush\nFounder, NexGen Connect`,
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
        `Got your admit letter. We'll verify it in 48 hours and drop you into your cohort.\n\n` +
        `— Aayush`,
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
