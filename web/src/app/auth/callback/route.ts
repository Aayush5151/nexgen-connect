import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SignupMetadata, SignupMethod } from "@/lib/supabase/schema";

/**
 * GET /auth/callback
 *
 * Handles the redirect-back from a Supabase OAuth provider (Google) or
 * a magic-link email. Supabase puts the auth code in `?code=…` (OAuth
 * PKCE) or `?token_hash=…&type=magiclink` (email). We exchange
 * whichever is present for a real session, then:
 *
 *   1. Tag the user's `user_metadata.signup_method` with the entry
 *      channel (google / email). Phone-OTP entries get tagged via
 *      establish-session instead.
 *   2. Set `signup_step = "oauth_pending"` if the user has no profile
 *      yet, so the funnel knows to gate /signup/phone-verify after
 *      /signup/you.
 *   3. Redirect to `?next=…` (defaults to /signup/you).
 *
 * Failure handling: any error short-circuits to /signup with a
 * `?from=auth-error` flash so the user can retry. We never expose
 * raw Supabase error messages — they leak provider details.
 *
 * v17 OAuth entry.
 */

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const next = url.searchParams.get("next") ?? "/signup/you";
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");

  // Locate the absolute origin once; both the OAuth code-exchange and
  // the magic-link verification need it for the final redirect.
  const origin = url.origin;

  const supabase = await createSupabaseServerClient();

  // Path A — OAuth PKCE callback (Google).
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.warn("[auth.callback] exchangeCodeForSession:", error.message);
      return NextResponse.redirect(
        new URL("/signup?from=auth-error", origin),
      );
    }
  } else if (tokenHash && type) {
    // Path B — magic link verification (email).
    // M17 fix: validate `type` against a documented allowlist before
    // passing to Supabase. `type` is an attacker-controlled query string;
    // the previous unchecked cast let any value reach Supabase, which
    // would either fail with an opaque error or — if Supabase added
    // new auth flows — accidentally ride the wrong path.
    const validTypes = new Set([
      "magiclink",
      "email",
      "signup",
      "recovery",
      "invite",
      "email_change",
    ] as const);
    if (!validTypes.has(type as (typeof validTypes extends Set<infer T> ? T : never))) {
      return NextResponse.redirect(
        new URL("/signup?from=auth-error", origin),
      );
    }
    const { error } = await supabase.auth.verifyOtp({
      // Cast is now safe — validTypes guarded above.
      type: type as "magiclink" | "email" | "signup" | "recovery" | "invite" | "email_change",
      token_hash: tokenHash,
    });
    if (error) {
      console.warn("[auth.callback] verifyOtp:", error.message);
      return NextResponse.redirect(
        new URL("/signup?from=auth-error", origin),
      );
    }
  } else {
    // Neither path provided. Bounce back to /signup.
    return NextResponse.redirect(new URL("/signup", origin));
  }

  // Tag the entry method + initial signup_step in user_metadata so
  // /signup/you, /signup/phone-verify, and the /admin reviewer all
  // know how this user came in.
  try {
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes?.user;
    if (user) {
      const meta = (user.user_metadata ?? {}) as SignupMetadata;
      // Don't clobber a previously-set signup_method (e.g. user already
      // came in via phone and is now linking Google for convenience).
      // First-time OAuth/email entries get the freshly-detected method.
      const method: SignupMethod =
        meta.signup_method ?? (code ? "google" : "email");
      // If the user has no profile yet, set oauth_pending. If they
      // already have a profile (returning user signing in via OAuth),
      // we leave their existing step intact — they're not in the funnel
      // any more.
      const nextStep: SignupMetadata["signup_step"] = meta.signup_step
        ? meta.signup_step
        : "oauth_pending";
      const patch: SignupMetadata = {
        ...meta,
        signup_method: method,
        signup_step: nextStep,
        // Capture the email Supabase gives us so /signup/you can pre-
        // fill it without an extra round-trip.
        email: meta.email ?? user.email ?? null,
      };
      const { error: updErr } = await supabase.auth.updateUser({
        data: patch,
      });
      if (updErr) {
        // Non-fatal — the session is still good, the user can correct
        // the missing tag on the next page. Log so we can spot it.
        console.warn("[auth.callback] tag update failed:", updErr.message);
      }
    }
  } catch (err) {
    console.warn("[auth.callback] post-exchange tag failed:", err);
  }

  // Normalise the `next` target so a malicious caller can't redirect
  // off-site via `?next=https://evil.com/`. Only same-origin relative
  // paths are honoured.
  const safeNext =
    next.startsWith("/") && !next.startsWith("//") ? next : "/signup/you";
  return NextResponse.redirect(new URL(safeNext, origin));
}
