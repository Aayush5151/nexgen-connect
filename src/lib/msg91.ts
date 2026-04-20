import "server-only";

import { z } from "zod";

/**
 * MSG91 SMS OTP client.
 *
 * Production hardening:
 *   - 10s fetch timeout so a hung upstream never pins a server worker
 *   - One retry on network / 5xx errors (MSG91's own retries are opaque)
 *   - Response parsed through a zod schema rather than trusted raw
 *   - Logs never contain the raw phone number; only a SHA-like phone prefix
 *   - Returns structured { ok, error, code? } so callers can branch on code
 *
 * Env:
 *   MOCK_OTP=true     → skip network entirely, accept 000000 in verify path
 *   MSG91_AUTH_KEY    → required for live sends
 *   MSG91_TEMPLATE_ID → required for live sends
 *   MSG91_SENDER_ID   → optional (defaults NXGNCN, must be whitelisted)
 *
 * MSG91 success shape:
 *   { type: "success", message: "<request_id>" }
 * MSG91 failure shape:
 *   { type: "error",   message: "<human readable>" }
 *
 * See https://docs.msg91.com/sms/send-otp
 */

const MSG91_URL = "https://control.msg91.com/api/v5/otp";
const MSG91_VERIFY_URL = "https://control.msg91.com/api/v5/otp/verify";
const FETCH_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 1;

export const MOCK_OTP_CODE = "000000";

// Short, deterministic obfuscation so logs are safe to ship to a hosted logger.
// Never stringify the full phone in production paths.
function phoneTag(phoneE164: string): string {
  if (phoneE164.length < 6) return "***";
  return `${phoneE164.slice(0, 3)}***${phoneE164.slice(-2)}`;
}

export function isMockOtp(): boolean {
  return process.env.MOCK_OTP === "true";
}

const msg91ResponseSchema = z.object({
  type: z.enum(["success", "error"]).optional(),
  message: z.string().optional(),
  request_id: z.string().optional(),
});

type SendOtpResult =
  | { ok: true; mock: boolean; requestId?: string }
  | { ok: false; error: string };

type VerifyOtpResult =
  | { ok: true; mock: boolean }
  | { ok: false; error: string };

/**
 * Fetch with an abort-based timeout. Retries once on network-layer failure
 * (AbortError, TypeError) or a 5xx response. 4xx (auth, rate limit) does
 * NOT retry — those would fail again and burn our rate-limit window.
 */
async function fetchWithRetry(
  url: string,
  init: RequestInit,
): Promise<Response> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timer);
      if (res.status >= 500 && attempt < MAX_RETRIES) {
        lastErr = new Error(`MSG91 5xx: ${res.status}`);
        // small jittered backoff
        await sleep(300 + Math.floor(Math.random() * 300));
        continue;
      }
      return res;
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      if (attempt < MAX_RETRIES) {
        await sleep(300 + Math.floor(Math.random() * 300));
        continue;
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("MSG91 fetch failed");
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function sendOtp(phoneE164: string): Promise<SendOtpResult> {
  if (isMockOtp()) {
    // Never print the full number, even in mock mode — dev logs still get
    // spot-checked in screen-shares, incident reviews, etc.
    console.log(`[mock-otp] sent to ${phoneTag(phoneE164)} (code=${MOCK_OTP_CODE})`);
    return { ok: true, mock: true };
  }

  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;
  const senderId = process.env.MSG91_SENDER_ID ?? "NXGNCN";

  if (!authKey || !templateId) {
    console.error(
      `[msg91.send] misconfigured: authKey=${Boolean(authKey)} templateId=${Boolean(templateId)}`,
    );
    return { ok: false, error: "SMS service temporarily unavailable." };
  }

  const mobile = phoneE164.replace(/^\+/, "");
  const url =
    `${MSG91_URL}?template_id=${encodeURIComponent(templateId)}` +
    `&mobile=${encodeURIComponent(mobile)}` +
    `&sender=${encodeURIComponent(senderId)}` +
    `&otp_length=6`;

  try {
    const res = await fetchWithRetry(url, {
      method: "POST",
      headers: {
        authkey: authKey,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      // Empty JSON body satisfies MSG91's content-type requirement.
      body: "{}",
    });

    const raw = await res.json().catch(() => ({}));
    const parsed = msg91ResponseSchema.safeParse(raw);
    if (!parsed.success) {
      console.error(
        `[msg91.send] ${phoneTag(phoneE164)} unparseable response status=${res.status}`,
      );
      return { ok: false, error: "SMS send failed. Try again." };
    }

    const body = parsed.data;
    if (body.type === "success") {
      return { ok: true, mock: false, requestId: body.request_id ?? body.message };
    }

    console.error(
      `[msg91.send] ${phoneTag(phoneE164)} status=${res.status} message=${body.message ?? "unknown"}`,
    );
    return {
      ok: false,
      // Never forward raw upstream messages to the client — they sometimes
      // echo the mobile back or leak template ids. Generic copy only.
      error: "Couldn't send the code. Check the number and try again.",
    };
  } catch (err) {
    console.error(
      `[msg91.send] ${phoneTag(phoneE164)} threw:`,
      err instanceof Error ? err.message : err,
    );
    return { ok: false, error: "SMS service timed out. Try again." };
  }
}

export async function verifyOtpUpstream(
  phoneE164: string,
  code: string,
): Promise<VerifyOtpResult> {
  if (isMockOtp()) {
    if (code === MOCK_OTP_CODE) return { ok: true, mock: true };
    return { ok: false, error: "Invalid code" };
  }

  const authKey = process.env.MSG91_AUTH_KEY;
  if (!authKey) {
    console.error("[msg91.verify] misconfigured: MSG91_AUTH_KEY missing");
    return { ok: false, error: "Verification unavailable." };
  }

  const mobile = phoneE164.replace(/^\+/, "");
  const url =
    `${MSG91_VERIFY_URL}?otp=${encodeURIComponent(code)}` +
    `&mobile=${encodeURIComponent(mobile)}`;

  try {
    const res = await fetchWithRetry(url, {
      method: "GET",
      headers: { authkey: authKey, accept: "application/json" },
    });

    const raw = await res.json().catch(() => ({}));
    const parsed = msg91ResponseSchema.safeParse(raw);
    if (!parsed.success) {
      console.error(
        `[msg91.verify] ${phoneTag(phoneE164)} unparseable status=${res.status}`,
      );
      return { ok: false, error: "Couldn't verify code. Try again." };
    }
    const body = parsed.data;
    if (body.type === "success") return { ok: true, mock: false };
    return { ok: false, error: "Invalid code" };
  } catch (err) {
    console.error(
      `[msg91.verify] ${phoneTag(phoneE164)} threw:`,
      err instanceof Error ? err.message : err,
    );
    return { ok: false, error: "Verification timed out. Try again." };
  }
}
