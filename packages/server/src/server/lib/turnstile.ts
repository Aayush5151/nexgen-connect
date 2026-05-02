/**
 * Cloudflare Turnstile verification — server-side.
 *
 * v16 web pivot §3.5 + post-Bucket-10 review item 9. Replaces the
 * deferred App Attest / Play Integrity work for the web target.
 *
 * Usage:
 *   1. Client renders a Turnstile widget (sitekey from
 *      NEXT_PUBLIC_TURNSTILE_SITE_KEY) on signup, premium-purchase,
 *      and account-erasure forms.
 *   2. Form submit includes the resolved token in the request body.
 *   3. tRPC procedure (or middleware) calls verifyTurnstileToken()
 *      before doing anything sensitive. On failure → reject with
 *      `BAD_REQUEST` + `E_TURNSTILE_FAILED`.
 *
 * Fail-closed: missing TURNSTILE_SECRET_KEY in production env makes
 * verification THROW. Dev / test environments can opt-in to the
 * dev-bypass token "XXXX.DUMMY.TOKEN.XXXX" which always verifies.
 *
 * v16 web pivot §3.5.
 */

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const DEV_BYPASS_TOKEN = "XXXX.DUMMY.TOKEN.XXXX";

export type TurnstileResult =
  | { ok: true; hostname: string; action: string | null }
  | { ok: false; reason: string; errorCodes: string[] };

/**
 * Verify a Turnstile token by POST'ing it to Cloudflare's siteverify
 * endpoint. Returns a typed result; never throws on bad tokens (the
 * caller decides how to respond).
 *
 * Network failures DO throw — those are server-side problems, not
 * "user submitted a bad token."
 */
export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string,
): Promise<TurnstileResult> {
  // Dev bypass — only when explicitly requested + not in production.
  if (
    token === DEV_BYPASS_TOKEN &&
    process.env.NODE_ENV !== "production" &&
    process.env.TURNSTILE_DEV_BYPASS === "true"
  ) {
    return { ok: true, hostname: "dev.localhost", action: null };
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || secret.length < 10) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "turnstile: TURNSTILE_SECRET_KEY missing in production. " +
          "Configure in Vercel env. Bot-protection is non-negotiable for sensitive endpoints.",
      );
    }
    // Non-production: degrade to "ok" with a warning so dev flows
    // don't block when Turnstile isn't configured locally.
    if (process.env.TURNSTILE_DEV_BYPASS === "true") {
      return { ok: true, hostname: "dev.localhost", action: null };
    }
    return {
      ok: false,
      reason: "TURNSTILE_SECRET_KEY not configured",
      errorCodes: ["missing-input-secret"],
    };
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  if (remoteIp) body.set("remoteip", remoteIp);

  const res = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) {
    throw new Error(`turnstile: siteverify HTTP ${res.status}`);
  }
  const json = (await res.json()) as {
    success: boolean;
    hostname?: string;
    action?: string;
    "error-codes"?: string[];
  };
  if (json.success) {
    return { ok: true, hostname: json.hostname ?? "", action: json.action ?? null };
  }
  return {
    ok: false,
    reason: "siteverify failed",
    errorCodes: json["error-codes"] ?? [],
  };
}
