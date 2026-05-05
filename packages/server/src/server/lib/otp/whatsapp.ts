/**
 * WhatsApp OTP provider — direct Meta Cloud API.
 *
 * Why direct: BSP-mediated WhatsApp adds ~₹0.05–0.10/msg markup and
 * an extra layer of failure modes; Meta Cloud direct lands at ~₹0.115/msg
 * for the AUTHENTICATION category, with no DLT registration required
 * (DLT is SMS-only, doesn't apply to WA).
 *
 * Send shape (per https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages):
 *   POST https://graph.facebook.com/v18.0/{phone_number_id}/messages
 *   Authorization: Bearer {ACCESS_TOKEN}
 *   {
 *     messaging_product: "whatsapp",
 *     to: "<E.164 without +>",
 *     type: "template",
 *     template: {
 *       name: "<pre-approved AUTH template name>",
 *       language: { code: "<en|en_US|hi|...>" },
 *       components: [
 *         { type: "body",   parameters: [{ type: "text", text: "<otp>" }] },
 *         { type: "button", sub_type: "url", index: "0",
 *           parameters: [{ type: "text", text: "<otp>" }] }
 *       ]
 *     }
 *   }
 *
 * The template MUST be approved as AUTHENTICATION category — Meta
 * gates raw text messaging behind 24h sessions, so OTP delivery is
 * only allowed via approved templates.
 *
 * Mock mode: when META_WA_PHONE_NUMBER_ID is unset, returns
 * { ok: true, mock: true, channel: "whatsapp" } without hitting Meta.
 *
 * v16 web pivot §P0.
 */
import type { OtpProvider, SendOtpInput, SendOtpResult } from "./types";

const META_GRAPH_BASE = "https://graph.facebook.com/v18.0";
const FETCH_TIMEOUT_MS = 8_000;

/** Short, deterministic obfuscation so logs are safe to ship. */
function phoneTag(phoneE164: string): string {
  if (phoneE164.length < 6) return "***";
  return `${phoneE164.slice(0, 3)}***${phoneE164.slice(-2)}`;
}

let mockWarned = false;
function isMock(): boolean {
  if (process.env.MOCK_WHATSAPP === "true") return true;
  const inProd =
    process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
  if (inProd) return false;
  if (
    !process.env.META_WA_PHONE_NUMBER_ID ||
    !process.env.META_WA_ACCESS_TOKEN ||
    !process.env.META_WA_TEMPLATE_NAME
  ) {
    if (!mockWarned) {
      mockWarned = true;
      console.warn(
        "[whatsapp-otp] no META_WA_* credentials configured — falling back to mock send. " +
          "Set META_WA_PHONE_NUMBER_ID + META_WA_ACCESS_TOKEN + META_WA_TEMPLATE_NAME to send via Meta.",
      );
    }
    return true;
  }
  return false;
}

type MetaSendResponse = {
  messaging_product?: string;
  contacts?: Array<{ wa_id?: string }>;
  messages?: Array<{ id?: string }>;
  error?: { code?: number; message?: string; type?: string };
};

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export const whatsappProvider: OtpProvider = {
  channel: "whatsapp",
  async send({ phoneE164, code }: SendOtpInput): Promise<SendOtpResult> {
    if (isMock()) {
      console.log(
        `[mock-whatsapp] template OTP ${code} → ${phoneTag(phoneE164)}`,
      );
      return { ok: true, channel: "whatsapp", mock: true };
    }

    const phoneNumberId = process.env.META_WA_PHONE_NUMBER_ID;
    const accessToken = process.env.META_WA_ACCESS_TOKEN;
    const templateName = process.env.META_WA_TEMPLATE_NAME;
    const templateLang = process.env.META_WA_TEMPLATE_LANGUAGE ?? "en";

    if (!phoneNumberId || !accessToken || !templateName) {
      console.error("[whatsapp-otp] missing META_WA_* env in production");
      // retryable:true so the OTP router falls through to MSG91 SMS.
      // The user-visible failure mode without this is "OTP send failed
      // forever" any time WhatsApp creds are unset; with it, missing
      // creds simply route 100% of traffic to the SMS fallback (which
      // can still fail-loud on its own missing keys, surfacing a
      // clearer signal).
      return {
        ok: false,
        channel: "whatsapp",
        error: "E012:whatsapp_not_configured",
        retryable: true,
      };
    }

    // Strip leading "+" — Meta wants bare digits with country code.
    const to = phoneE164.replace(/^\+/, "");

    try {
      const res = await fetchWithTimeout(
        `${META_GRAPH_BASE}/${phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to,
            type: "template",
            template: {
              name: templateName,
              language: { code: templateLang },
              components: [
                {
                  type: "body",
                  parameters: [{ type: "text", text: code }],
                },
                {
                  type: "button",
                  sub_type: "url",
                  index: "0",
                  parameters: [{ type: "text", text: code }],
                },
              ],
            },
          }),
        },
      );

      const body = (await res.json().catch(() => ({}))) as MetaSendResponse;

      if (res.ok && body.messages?.[0]?.id) {
        return {
          ok: true,
          channel: "whatsapp",
          mock: false,
          requestId: body.messages[0].id,
        };
      }

      // Meta error semantics:
      //   131026 — recipient_not_on_whatsapp → fallback to SMS
      //   131047 — re-engagement required (24h window) → templates required (we use templates already, so unlikely)
      //   131056 — pair-rate-limit → retryable, but fallback is faster
      //   368    — temporarily blocked for policy → not retryable, fail fast
      const metaCode = body.error?.code;
      const retryable = res.status >= 500;
      const recipientNotOnWhatsApp = metaCode === 131026;

      console.error(
        `[whatsapp-otp] ${phoneTag(phoneE164)} status=${res.status} meta_code=${metaCode ?? "?"}`,
      );

      return {
        ok: false,
        channel: "whatsapp",
        error: recipientNotOnWhatsApp
          ? "E013:whatsapp_recipient_unreachable"
          : `E014:whatsapp_send_failed_${metaCode ?? res.status}`,
        retryable: retryable || recipientNotOnWhatsApp,
        // recipient_not_on_whatsapp is "retryable" in the sense that the
        // router should fall through to SMS — same boolean fits both
        // cases.
      };
    } catch (err) {
      console.error(
        `[whatsapp-otp] ${phoneTag(phoneE164)} threw:`,
        err instanceof Error ? err.message : err,
      );
      return {
        ok: false,
        channel: "whatsapp",
        error: "E015:whatsapp_timeout",
        retryable: true,
      };
    }
  },
};
