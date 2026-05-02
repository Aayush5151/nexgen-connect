import "server-only";

/**
 * Cloudflare Turnstile server-side siteverify.
 *
 * Two modes:
 *   - mock: when TURNSTILE_SECRET_KEY is unset (dev / preview without
 *     keys), accepts any non-empty token. Logs once that we're in
 *     mock mode.
 *   - real: POSTs to https://challenges.cloudflare.com/turnstile/v0/siteverify
 *     with the secret + token. Returns true only on success.
 *
 * Stop condition (v16 §Bucket 6 stop #5): can't verify without the
 * Turnstile keys. Production env without TURNSTILE_SECRET_KEY +
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY fails closed.
 *
 * v16 web pivot §Bucket 6.
 */

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const FETCH_TIMEOUT_MS = 5_000;

export function isMockTurnstile(): boolean {
  if (process.env.MOCK_TURNSTILE === "true") return true;
  const inProd = process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
  if (inProd) return false;
  if (!process.env.TURNSTILE_SECRET_KEY) {
    if (!warned) {
      warned = true;
      console.warn(
        "[turnstile] no TURNSTILE_SECRET_KEY — accepting any non-empty token. Set TURNSTILE_SECRET_KEY to verify.",
      );
    }
    return true;
  }
  return false;
}
let warned = false;

export type VerifyResult = { ok: true; mock: boolean } | { ok: false; error: string };

export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string,
): Promise<VerifyResult> {
  if (!token) return { ok: false, error: "E011:turnstile_missing" };
  if (isMockTurnstile()) return { ok: true, mock: true };

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return { ok: false, error: "E011:turnstile_not_configured" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const params = new URLSearchParams();
    params.set("secret", secret);
    params.set("response", token);
    if (remoteIp) params.set("remoteip", remoteIp);

    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    if (!res.ok) {
      console.error(`[turnstile] siteverify status=${res.status}`);
      return { ok: false, error: "E011:turnstile_upstream" };
    }
    const body = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    if (body.success === true) return { ok: true, mock: false };
    return { ok: false, error: "E011:turnstile_failed" };
  } catch (err) {
    console.error("[turnstile] threw:", err instanceof Error ? err.message : err);
    return { ok: false, error: "E011:turnstile_timeout" };
  } finally {
    clearTimeout(timer);
  }
}
