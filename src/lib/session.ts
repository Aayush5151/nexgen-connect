import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Verification session cookie.
 *
 * After a user completes phone OTP we need a way to link subsequent
 * steps (DigiLocker consent → government redirect → OAuth callback)
 * back to their waitlist row. A signed, short-lived httpOnly cookie
 * does this without standing up a full auth system.
 *
 * Payload: {waitlist_id, phone_hash, exp}
 * Sig:     HMAC-SHA256 over the base64url-encoded payload
 * TTL:     15 min (covers the DigiLocker round-trip with margin)
 *
 * SESSION_SECRET must be ≥ 32 random bytes. Rotating it invalidates
 * all in-flight verification sessions, which is desirable after a
 * suspected leak.
 */

const COOKIE_NAME = "ngc_verify";
const TTL_SECONDS = 15 * 60;

export type VerificationSession = {
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

export async function createVerificationSession(data: {
  waitlist_id: string;
  phone_hash: string;
}): Promise<void> {
  const payload: VerificationSession = {
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

export async function readVerificationSession(): Promise<VerificationSession | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const [encoded, sig] = token.split(".");
  if (!encoded || !sig) return null;

  // Timing-safe signature check - never shortcut on length mismatch without
  // allocating equal-length buffers first or we leak timing info.
  const expected = sign(encoded);
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expBuf)) return null;

  let payload: VerificationSession;
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

export async function clearVerificationSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}
