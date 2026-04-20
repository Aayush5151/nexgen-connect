import { NextRequest, NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { readVerificationSession } from "@/lib/session";
import { hashAadhaarRef } from "@/lib/hash";
import {
  exchangeCodeForToken,
  fetchEAadhaar,
  isMockDigiLocker,
  namesMatch,
} from "@/lib/digilocker";
import { writeAudit } from "@/lib/audit";

/**
 * DigiLocker OAuth callback.
 *
 * DigiLocker redirects the user's browser to this URL with ?code&state
 * after consent. We:
 *   1. Validate the signed session cookie (links back to waitlist_id)
 *   2. Look up the digilocker_sessions row by {state, waitlist_id}
 *   3. Read the plaintext PKCE verifier from the per-state httpOnly cookie
 *   4. Exchange code → access_token
 *   5. Fetch eAadhaar, parse, run soft name-match against waitlist.first_name
 *   6. Persist only: hashed ref, last-4, name-match bool, timestamp
 *   7. Mark session row consumed + drop the PKCE cookie
 *   8. Redirect to success or error with a safe reason code in the query
 */

const SUCCESS_URL = "/verify/digilocker/success";
const ERROR_URL = "/verify/digilocker/error";

function redirectTo(path: string, params?: Record<string, string>) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const url = new URL(path, base);
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  }
  return NextResponse.redirect(url);
}

export async function GET(req: NextRequest) {
  try {
    return await handleCallback(req);
  } catch (err) {
    // Belt-and-suspenders: every individual stage already catches + audits,
    // but unexpected throws (DB connection drop, parser crash) must still
    // produce a clean redirect instead of a 500.
    console.error("[digilocker.callback] unexpected error:", err);
    await writeAudit({
      action: "digilocker_callback_fail",
      meta: {
        stage: "unexpected",
        error: err instanceof Error ? err.message : String(err),
      },
    });
    return redirectTo(ERROR_URL, { reason: "unexpected" });
  }
}

async function handleCallback(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const oauthError = req.nextUrl.searchParams.get("error");

  if (oauthError) {
    await writeAudit({
      action: "digilocker_callback_fail",
      meta: { stage: "oauth", error: oauthError },
    });
    return redirectTo(ERROR_URL, { reason: "denied" });
  }
  if (!code || !state) {
    return redirectTo(ERROR_URL, { reason: "malformed" });
  }

  const session = await readVerificationSession();
  if (!session) {
    return redirectTo(ERROR_URL, { reason: "session_expired" });
  }

  const db = getSupabaseAdmin();

  // State must exist, belong to this waitlist, be unconsumed, and unexpired.
  const { data: oauthRow, error: fetchErr } = await db
    .from("digilocker_sessions")
    .select("id, waitlist_id, expires_at, consumed")
    .eq("state", state)
    .eq("waitlist_id", session.waitlist_id)
    .eq("consumed", false)
    .maybeSingle();

  if (fetchErr || !oauthRow) {
    await writeAudit({
      action: "digilocker_state_invalid",
      waitlist_id: session.waitlist_id,
    });
    return redirectTo(ERROR_URL, { reason: "state" });
  }
  if (new Date(oauthRow.expires_at).getTime() < Date.now()) {
    await writeAudit({
      action: "digilocker_session_expired",
      waitlist_id: session.waitlist_id,
    });
    return redirectTo(ERROR_URL, { reason: "expired" });
  }

  // PKCE verifier is in a per-state cookie. Mock mode skips PKCE entirely.
  const verifierCookieName = `ngc_dl_pkce_${state}`;
  const verifier = isMockDigiLocker()
    ? "MOCK_VERIFIER"
    : req.cookies.get(verifierCookieName)?.value;

  if (!verifier) {
    await writeAudit({
      action: "digilocker_pkce_fail",
      waitlist_id: session.waitlist_id,
    });
    return redirectTo(ERROR_URL, { reason: "pkce" });
  }

  const tokenResult = await exchangeCodeForToken({
    code,
    codeVerifier: verifier,
  });
  if (!tokenResult.ok) {
    await writeAudit({
      action: "digilocker_callback_fail",
      waitlist_id: session.waitlist_id,
      meta: { stage: "token", error: tokenResult.error },
    });
    return redirectTo(ERROR_URL, { reason: "token" });
  }

  const aadhaarResult = await fetchEAadhaar(tokenResult.accessToken);
  if (!aadhaarResult.ok) {
    await writeAudit({
      action: "digilocker_callback_fail",
      waitlist_id: session.waitlist_id,
      meta: { stage: "eaadhaar", error: aadhaarResult.error },
    });
    return redirectTo(ERROR_URL, { reason: "fetch" });
  }

  // Soft name match — Aadhaar returns full legal name, waitlist has first name.
  // In mock mode we always succeed so the demo flow lands on the success page
  // regardless of what name the user typed during phone OTP.
  const { data: waitlistRow } = await db
    .from("waitlist")
    .select("first_name")
    .eq("id", session.waitlist_id)
    .maybeSingle();

  const nameMatch = isMockDigiLocker()
    ? true
    : waitlistRow
      ? namesMatch(aadhaarResult.data.name, waitlistRow.first_name)
      : false;

  if (!nameMatch) {
    await writeAudit({
      action: "digilocker_name_mismatch",
      waitlist_id: session.waitlist_id,
      meta: { last4: aadhaarResult.data.last4 },
    });
  }

  const { error: updateErr } = await db
    .from("waitlist")
    .update({
      digilocker_verified_at: new Date().toISOString(),
      digilocker_reference_id: hashAadhaarRef(aadhaarResult.data.referenceId),
      aadhaar_last4: aadhaarResult.data.last4,
      aadhaar_name_match: nameMatch,
      identity_status: nameMatch ? "verified" : "failed",
    })
    .eq("id", session.waitlist_id);

  if (updateErr) {
    await writeAudit({
      action: "digilocker_callback_fail",
      waitlist_id: session.waitlist_id,
      meta: { stage: "db_update", error: updateErr.message },
    });
    return redirectTo(ERROR_URL, { reason: "persist" });
  }

  await db
    .from("digilocker_sessions")
    .update({ consumed: true })
    .eq("id", oauthRow.id);

  await writeAudit({
    action: "digilocker_callback_ok",
    waitlist_id: session.waitlist_id,
    meta: { last4: aadhaarResult.data.last4, name_match: nameMatch },
  });

  // Never put PII (last4, name_match) in the redirect URL — it leaks into
  // server logs, referrer headers, browser history. The success page fetches
  // status server-side via getIdentityStatusAction().
  const response = redirectTo(SUCCESS_URL);
  response.cookies.delete(verifierCookieName);
  return response;
}
