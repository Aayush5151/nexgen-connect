import "server-only";

import { createHash, createHmac, randomBytes } from "node:crypto";
import { render } from "@react-email/render";
import { ParentLink } from "@/emails/ParentLink";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Parent magic-link generator + Resend dispatcher.
 *
 * Two responsibilities:
 *   1. Sign + persist a single-use, 1h-TTL token bound to a student
 *   2. Email the parent via Resend
 *
 * Token format: `<base64url-random-32>.<HMAC-SHA256(secret, payload)>`
 *
 * The HMAC uses `PARENT_LINK_SECRET`. Rotate by adding a v2 secret and
 * accepting both during the rotation window (Bucket 8 wires that).
 *
 * Two modes:
 *   - mock: when RESEND_API_KEY is unset, returns a fake link without
 *     sending email. Dev still sees the link in console output.
 *   - real: posts to Resend with the parent template.
 *
 * v16 web pivot §Bucket 6.
 */

const TOKEN_TTL_MS = 60 * 60_000; // 1h

/**
 * Returns true when parent-link email should use a mock (console.log) path.
 * Production refuses mocking unconditionally — even MOCK_RESEND=true is
 * ignored. The previous design honored MOCK_RESEND=true everywhere, and
 * the /api/parent-link/verify route returned a real-looking parent
 * dashboard for ANY token of length ≥ 8 in that mode.
 */
export function isMockResend(): boolean {
  const inProd =
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production";
  if (inProd) {
    if (process.env.MOCK_RESEND === "true" && !mock_in_prod_warned) {
      mock_in_prod_warned = true;
      console.error(
        "[parent-link] MOCK_RESEND=true detected in production — IGNORING. " +
          "Mock email paths are refused in production regardless of env state.",
      );
    }
    return false;
  }
  if (process.env.MOCK_RESEND === "true") return true;
  if (!process.env.RESEND_API_KEY) {
    if (!warned) {
      warned = true;
      console.warn(
        "[parent-link] no RESEND_API_KEY, falling back to mock email (link prints to console).",
      );
    }
    return true;
  }
  return false;
}
let warned = false;
let mock_in_prod_warned = false;

export type SendInput = {
  email: string;
  studentFirstName: string;
  studentUni: string;
  ownerId: string;
};

export type SendResult =
  | { ok: true; mock: boolean; expiresAt: string; tokenPrefix: string }
  | { ok: false; error: string };

/**
 * Sign + emit a parent magic-link token.
 *
 * Format: `<base64url(payload)>.<HMAC-SHA256(secret, payload)>`
 *   payload = `<ownerId>.<expiresAtMs>.<random>`
 *
 * The verify route splits on the last `.`, base64-decodes the payload,
 * recomputes the HMAC, and timing-safe compares the two.
 */
function signToken(ownerId: string, expiresAtMs: number): string {
  const secret = process.env.PARENT_LINK_SECRET;
  if (!secret) {
    throw new Error("Missing PARENT_LINK_SECRET");
  }
  const payload = `${ownerId}.${expiresAtMs}.${randomBytes(16).toString("base64url")}`;
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${Buffer.from(payload).toString("base64url")}.${sig}`;
}

/**
 * Persist the SHA-256(token) into `parent_link` so the verify route can
 * atomically mark it used. Without this row, even a valid HMAC token can't
 * be redeemed — which is correct (single-use is enforced by DB state, not
 * by the HMAC alone).
 */
async function persistToken(
  ownerId: string,
  token: string,
  expiresAtMs: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = getSupabaseAdmin();
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const { error } = await admin.from("parent_link").insert({
    owner_id: ownerId,
    token_hash: tokenHash,
    expires_at: new Date(expiresAtMs).toISOString(),
  });
  if (error) {
    console.error("[parent-link] persist failed:", error.message);
    return { ok: false, error: "Couldn't issue parent link." };
  }
  return { ok: true };
}

export async function sendParentMagicLink(input: SendInput): Promise<SendResult> {
  const expiresAtMs = Date.now() + TOKEN_TTL_MS;
  const expiresAt = new Date(expiresAtMs).toISOString();

  // Mock path (dev / preview without keys): build a link without
  // signing. We don't want PARENT_LINK_SECRET to be a hard dependency
  // for first-time `npm run dev` either.
  if (isMockResend()) {
    const fakeToken = randomBytes(24).toString("base64url");
    const link = buildLink(fakeToken);
    console.log(
      `[parent-link.mock] would email ${redact(input.email)} → ${link}`,
    );
    return {
      ok: true,
      mock: true,
      expiresAt,
      tokenPrefix: fakeToken.slice(0, 6),
    };
  }

  const token = signToken(input.ownerId, expiresAtMs);
  const link = buildLink(token);

  // Persist BEFORE emailing — if the email send fails we can replay; if
  // we emailed first and the insert failed, the parent would receive a
  // working-looking link that never verifies (the old bug).
  const persisted = await persistToken(input.ownerId, token, expiresAtMs);
  if (!persisted.ok) return { ok: false, error: persisted.error };

  // Use the existing Resend client. We avoid adding a new template ID
  // by sending an inline-HTML email; Bucket 8 swaps to a managed
  // template with `react-email`.
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "Email not configured." };

  try {
    // Render the react-email template server-side. `render` returns a
    // Gmail-safe HTML string with all <style> rules inlined.
    const html = await render(
      ParentLink({
        studentFirstName: input.studentFirstName,
        studentUni: input.studentUni,
        link,
        expiresAt,
      }),
    );
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_ADDRESS ?? "NexGen Connect <hello@nexgenconnect.com>",
        to: input.email,
        subject: `${input.studentFirstName}'s NexGen Connect, parent view`,
        html,
      }),
    });
    if (!res.ok) {
      console.error(`[parent-link] resend status=${res.status}`);
      return { ok: false, error: "Couldn't send the email. Try again." };
    }
    return { ok: true, mock: false, expiresAt, tokenPrefix: token.slice(0, 6) };
  } catch (err) {
    console.error("[parent-link] threw:", err instanceof Error ? err.message : err);
    return { ok: false, error: "Email service timed out." };
  }
}

function buildLink(token: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${base}/parent/${token}`;
}

function redact(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return "***";
  return `${user.slice(0, 1)}***@${domain}`;
}

// `parentTemplate` was the inline-HTML stub that this file used to
// render. The cross-cut PR replaced it with the react-email template
// at `web/src/emails/ParentLink.tsx`. Keep this comment as a marker
// so the next reader knows where the rendering lives.
