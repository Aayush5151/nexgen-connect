import "server-only";

import type { NextRequest } from "next/server";

/**
 * CSRF / same-origin guard for mutating REST route handlers.
 *
 * Server Actions get framework-level CSRF protection automatically; raw
 * `/api/*` route handlers do NOT. Without a check, a malicious site can
 * trigger state-changing requests in a logged-in victim's browser via
 * `fetch(url, { credentials: "include", method: "POST" })`.
 *
 * Defense strategy (matches OWASP recommendation for cookie-auth APIs):
 *   1. Require an Origin or Referer header. Modern browsers send Origin
 *      on POST/PUT/PATCH/DELETE. If absent, refuse — server-to-server
 *      callers (Razorpay, Inngest, DigiLocker) use webhook signatures,
 *      not this guard, so this is only consumed by browser-driven routes.
 *   2. Compare against an allowlist derived from NEXT_PUBLIC_SITE_URL
 *      plus the request's own host (covers preview deploys + custom
 *      domains automatically — the browser sends Origin = the page's
 *      own scheme://host, so request.url's host is the truth source).
 *
 * Webhook endpoints (Razorpay, Inngest, DigiLocker callbacks) MUST NOT
 * call this — they authenticate via signature, not Origin. The endpoint
 * lists are documented at each route.
 */

export type SameOriginResult = { ok: true } | { ok: false; reason: string };

export function requireSameOrigin(req: NextRequest): SameOriginResult {
  // Methods that are safe by spec (no body, no state change) don't need
  // CSRF protection. Browsers won't send Origin for GET in some cases.
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return { ok: true };
  }

  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const host = req.headers.get("host");

  // Build the allowlist:
  //   - request's own scheme://host (most precise — handles preview URLs)
  //   - NEXT_PUBLIC_SITE_URL (canonical domain)
  //   - VERCEL_URL (system-provided preview URL, https implied)
  const allowed = new Set<string>();
  if (host) {
    // The request itself: the browser only sends a same-origin request
    // when the page IS at this host, so accepting our own host is safe.
    allowed.add(`https://${host}`);
    allowed.add(`http://${host}`); // local dev fallback
  }
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (site) {
    try {
      const u = new URL(site);
      allowed.add(`${u.protocol}//${u.host}`);
    } catch {
      // ignore malformed
    }
  }
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    allowed.add(`https://${vercelUrl}`);
  }

  if (origin) {
    if (allowed.has(origin)) return { ok: true };
    return { ok: false, reason: "origin_mismatch" };
  }

  // Some browsers strip Origin on same-origin POST; fall back to Referer.
  if (referer) {
    try {
      const u = new URL(referer);
      const refOrigin = `${u.protocol}//${u.host}`;
      if (allowed.has(refOrigin)) return { ok: true };
      return { ok: false, reason: "referer_mismatch" };
    } catch {
      return { ok: false, reason: "referer_invalid" };
    }
  }

  return { ok: false, reason: "no_origin_or_referer" };
}
