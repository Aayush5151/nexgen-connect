"use server";

import { cookies } from "next/headers";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { readVerificationSession } from "@/lib/session";
import {
  buildAuthorizeUrl,
  codeChallengeS256,
  generateCodeVerifier,
  generateNonce,
  generateState,
  isDigiLockerEnabled,
} from "@/lib/digilocker";
import { writeAudit } from "@/lib/audit";

/**
 * DigiLocker OAuth init. Invoked from the consent page's client component.
 *
 * Flow:
 *   1. Read signed session cookie → waitlist_id
 *   2. Rate-limit check (3 inits per 10 min)
 *   3. Generate PKCE verifier + challenge, state, nonce
 *   4. Persist {state, nonce, expires_at, waitlist_id} in digilocker_sessions
 *   5. Set plaintext verifier in a per-state httpOnly cookie
 *   6. Return the authorize URL for the client to redirect to
 */

const SESSION_TTL_MS = 10 * 60 * 1000;
const MAX_INITS_PER_WINDOW = 3;

export type StartDigiLockerResult =
  | { ok: true; authorizeUrl: string }
  | { ok: false; error: string; rate_limited?: boolean };

export async function startDigiLockerAction(): Promise<StartDigiLockerResult> {
  if (!isDigiLockerEnabled()) {
    return {
      ok: false,
      error: "DigiLocker verification is not yet available.",
    };
  }

  const session = await readVerificationSession();
  if (!session) {
    return {
      ok: false,
      error: "Session expired. Verify your phone number again.",
    };
  }

  const db = getSupabaseAdmin();

  // Rate limit — same shape as phone OTP: 3 attempts per 10 min.
  const { data: recentCount, error: rateErr } = await db.rpc(
    "count_recent_digilocker_inits",
    { p_waitlist_id: session.waitlist_id },
  );
  if (rateErr) return { ok: false, error: rateErr.message };
  if (((recentCount as number) ?? 0) >= MAX_INITS_PER_WINDOW) {
    await writeAudit({
      action: "digilocker_rate_limited",
      waitlist_id: session.waitlist_id,
    });
    return {
      ok: false,
      error: "Too many attempts. Try again in ten minutes.",
      rate_limited: true,
    };
  }

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = codeChallengeS256(codeVerifier);
  const nonce = generateNonce();

  const { error: insErr } = await db.from("digilocker_sessions").insert({
    waitlist_id: session.waitlist_id,
    state,
    nonce,
    expires_at: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
  });
  if (insErr) return { ok: false, error: insErr.message };

  // PKCE verifier lives ONLY in a per-state httpOnly cookie. The DB holds
  // the state; the cookie holds the verifier. An attacker with either one
  // in isolation cannot complete the flow.
  const jar = await cookies();
  jar.set(`ngc_dl_pkce_${state}`, codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });

  await writeAudit({
    action: "digilocker_init",
    waitlist_id: session.waitlist_id,
    meta: { state_prefix: state.slice(0, 8) },
  });

  return {
    ok: true,
    authorizeUrl: buildAuthorizeUrl({ state, codeChallenge, nonce }),
  };
}

/**
 * Read-only status check for the success/error pages. Returns identity
 * verification status for the current session's waitlist row. No PII.
 */
export type GetIdentityStatusResult =
  | {
      ok: true;
      identity_status: "unverified" | "pending" | "verified" | "failed";
      aadhaar_last4: string | null;
      name_match: boolean | null;
    }
  | { ok: false; error: string };

export async function getIdentityStatusAction(): Promise<GetIdentityStatusResult> {
  const session = await readVerificationSession();
  if (!session) return { ok: false, error: "Session expired." };

  try {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("waitlist")
      .select("identity_status, aadhaar_last4, aadhaar_name_match")
      .eq("id", session.waitlist_id)
      .maybeSingle();
    if (error) return { ok: false, error: error.message };
    if (!data) return { ok: false, error: "Row not found" };
    return {
      ok: true,
      identity_status: data.identity_status,
      aadhaar_last4: data.aadhaar_last4,
      name_match: data.aadhaar_name_match,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Lookup failed",
    };
  }
}
