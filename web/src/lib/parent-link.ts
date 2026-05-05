import "server-only";

import { createHmac, randomBytes } from "node:crypto";

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

export function isMockResend(): boolean {
  if (process.env.MOCK_RESEND === "true") return true;
  const inProd = process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
  if (inProd) return false;
  if (!process.env.RESEND_API_KEY) {
    if (!warned) {
      warned = true;
      console.warn(
        "[parent-link] no RESEND_API_KEY — falling back to mock email (link prints to console).",
      );
    }
    return true;
  }
  return false;
}
let warned = false;

export type SendInput = {
  email: string;
  studentFirstName: string;
  studentUni: string;
  ownerId: string;
};

export type SendResult =
  | { ok: true; mock: boolean; expiresAt: string; tokenPrefix: string }
  | { ok: false; error: string };

function signToken(ownerId: string, expiresAtMs: number): string {
  const secret = process.env.PARENT_LINK_SECRET;
  if (!secret) {
    throw new Error("Missing PARENT_LINK_SECRET");
  }
  const payload = `${ownerId}.${expiresAtMs}.${randomBytes(16).toString("base64url")}`;
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${Buffer.from(payload).toString("base64url")}.${sig}`;
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

  // Use the existing Resend client. We avoid adding a new template ID
  // by sending an inline-HTML email; Bucket 8 swaps to a managed
  // template with `react-email`.
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "Email not configured." };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_ADDRESS ?? "NexGen Connect <hello@nexgenconnect.com>",
        to: input.email,
        subject: `${input.studentFirstName}'s NexGen Connect — parent view`,
        html: parentTemplate({
          studentFirstName: input.studentFirstName,
          studentUni: input.studentUni,
          link,
          expiresAt,
        }),
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

function parentTemplate(args: {
  studentFirstName: string;
  studentUni: string;
  link: string;
  expiresAt: string;
}): string {
  // Plain inline HTML so we don't pin a templating library this early.
  // Bucket 8 swaps to react-email + managed template.
  const expires = new Date(args.expiresAt).toLocaleString();
  return `
    <p>Hi —</p>
    <p>${escapeHtml(args.studentFirstName)} added you as a parent on NexGen Connect (${escapeHtml(args.studentUni)}).</p>
    <p>The link below opens a read-only dashboard. It works once and expires at ${escapeHtml(expires)}.</p>
    <p><a href="${escapeHtml(args.link)}" style="background:#00DC82;color:#0B1A12;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:600;">Open the dashboard</a></p>
    <p style="color:#6b7280;font-size:12px;">No chats, no location, no ongoing tracking. Ask ${escapeHtml(args.studentFirstName)} for a fresh link any time.</p>
  `;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
