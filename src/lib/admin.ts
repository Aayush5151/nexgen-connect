import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Admin session cookie.
 *
 * Issued only after a phone OTP succeeds AND the resulting waitlist row
 * has is_admin = true (checked via the is_admin_hash RPC). This is a
 * separate cookie from ngc_verify because its scope is different:
 *
 *   - ngc_verify ties one phone to one in-flight signup step
 *   - ngc_admin  ties one phone to admin-level control over every row
 *
 * Payload: {waitlist_id, phone_hash, exp}
 * Sig:     HMAC-SHA256 over the base64url-encoded payload
 * TTL:     8h (covers a working day; admin re-logs in next day)
 *
 * Rotating SESSION_SECRET invalidates every outstanding admin cookie,
 * which is exactly what you want after a suspected leak.
 *
 * DEFENSE IN DEPTH: every admin server action re-reads is_admin from
 * the DB on each call. Signing a cookie is not enough — if an admin
 * is demoted, the next action denies even with a still-valid cookie.
 */

const COOKIE_NAME = "ngc_admin";
const TTL_SECONDS = 8 * 60 * 60;

export type AdminSession = {
  waitlist_id: string;
  phone_hash: string;
  exp: number; // unix seconds
};

function getSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error("SESSION_SECRET must be set and >= 32 chars");
  }
  return s;
}

function b64urlEncode(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function b64urlDecode(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

function sign(payload: string): string {
  return b64urlEncode(
    createHmac("sha256", getSecret()).update(payload).digest(),
  );
}

export async function createAdminSession(data: {
  waitlist_id: string;
  phone_hash: string;
}): Promise<void> {
  const payload: AdminSession = {
    waitlist_id: data.waitlist_id,
    phone_hash: data.phone_hash,
    exp: Math.floor(Date.now() / 1000) + TTL_SECONDS,
  };
  const encoded = b64urlEncode(Buffer.from(JSON.stringify(payload)));
  const token = `${encoded}.${sign(encoded)}`;

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL_SECONDS,
  });
}

export async function readAdminSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const [encoded, sig] = token.split(".");
  if (!encoded || !sig) return null;

  // Timing-safe signature check — allocate equal-length buffers before
  // calling timingSafeEqual so a length mismatch doesn't leak.
  const expected = sign(encoded);
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expBuf)) return null;

  let payload: AdminSession;
  try {
    payload = JSON.parse(b64urlDecode(encoded).toString("utf8"));
  } catch {
    return null;
  }

  if (
    !payload ||
    typeof payload.waitlist_id !== "string" ||
    typeof payload.phone_hash !== "string" ||
    typeof payload.exp !== "number"
  ) {
    return null;
  }
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;

  return payload;
}

export async function clearAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}
