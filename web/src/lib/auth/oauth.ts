"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Client-side OAuth + email-magic-link entry helpers.
 *
 * Routed through Supabase Auth, which handles the third-party round-
 * trip and lands the user back at our `/auth/callback` route. The
 * callback exchanges the code for a session, tags the user's
 * `user_metadata.signup_method`, and routes them into the funnel at
 * `/signup/you`.
 *
 * Trust-model note: OAuth never replaces phone verification in
 * NexGen. After /signup/you, OAuth-entry users are routed through
 * /signup/phone-verify before /signup/corridor — every member of a
 * corridor still has a phone-bound identity hash. Google / email
 * just lowers the click-cost to enter the funnel.
 *
 * v17 OAuth entry.
 */

function siteOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://nexgen-connect.vercel.app";
}

/**
 * Kick off Google OAuth. On success, the user is redirected away to
 * Google and bounced back to /auth/callback?code=…&state=… which
 * exchanges for a Supabase session.
 *
 * Errors here are pre-redirect (Supabase config issues, network).
 * Post-redirect errors land on the callback route.
 */
export async function signInWithGoogle(opts?: {
  redirectAfter?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createSupabaseBrowserClient();
  const next = opts?.redirectAfter ?? "/signup/you";
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteOrigin()}/auth/callback?next=${encodeURIComponent(next)}`,
      // We don't need offline access — Supabase manages the refresh
      // token lifecycle and doesn't expose Google's refresh token to
      // the browser. Defaulting to `select_account` is friendly when
      // the user has multiple Google accounts.
      queryParams: { prompt: "select_account", access_type: "online" },
    },
  });
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/**
 * Send a magic-link email. Supabase sends it via the project's
 * configured SMTP (we use Resend in production). The link target is
 * /auth/callback?token_hash=…&type=magiclink which signs the user in
 * and lands them at `next`.
 *
 * `shouldCreateUser: true` lets first-timers sign up via the link
 * (rather than 400-ing "user not found"); the email is the unique
 * identifier on subsequent visits.
 */
export async function signInWithEmail(
  email: string,
  opts?: { redirectAfter?: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createSupabaseBrowserClient();
  const next = opts?.redirectAfter ?? "/signup/you";
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteOrigin()}/auth/callback?next=${encodeURIComponent(next)}`,
      shouldCreateUser: true,
    },
  });
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
