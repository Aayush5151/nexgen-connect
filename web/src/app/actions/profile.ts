"use server";

/**
 * Profile actions for the v16 funnel.
 *
 * Persistence layer: auth.users.user_metadata (jsonb on the Supabase Auth
 * row). The shape is captured by `SignupMetadata` in lib/supabase/schema.ts.
 *
 * Why metadata, not a Drizzle table:
 *   - The v16 funnel is staged: phone → profile → corridor → identity →
 *     admit → complete. A normalised table would force every step to
 *     either accept nullable fields or write to a holding queue. Metadata
 *     gives us a flat key-value space that grows with the user without
 *     schema migrations.
 *   - The /admin dashboard reads the same row + metadata (no joins), so
 *     the admin Server Actions stay simple.
 *   - When the funnel completes, a future P1.f migration can flatten this
 *     into verified_user with the now-populated values.
 *
 * Auth: every action is gated on a valid Supabase Auth SSR session. The
 * SSR session is established at /signup/otp via the establish-session
 * route + supabase.auth.verifyOtp({type:'magiclink'}) handshake.
 *
 * v16 web pivot §P1.e (signup persistence + /admin source-of-truth swap).
 */
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  updateProfileSchema,
  type SignupMetadata,
  type UpdateProfileInput,
} from "@/lib/supabase/schema";

type ActionError = { ok: false; error: string };
type UpdateProfileResult =
  | { ok: true; userId: string; signup_step: SignupMetadata["signup_step"] }
  | ActionError;

export async function updateProfileAction(
  input: UpdateProfileInput,
): Promise<UpdateProfileResult> {
  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  // SSR session — set by supabase.auth.verifyOtp on the client after
  // /api/auth/establish-session returned a hashed_token. If absent here,
  // either the user navigated to /signup/you directly or the session
  // bridge in /signup/otp didn't run.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return {
      ok: false,
      error: "Session expired. Refresh and try again.",
    };
  }

  // Merge into existing metadata so we don't clobber phone_verified_at
  // or any later-step fields. updateUser writes to the user's OWN row
  // (not admin path) — Supabase enforces this server-side via JWT.
  const existing = (user.user_metadata ?? {}) as SignupMetadata;
  const next: SignupMetadata = {
    ...existing,
    first_name: parsed.data.first_name,
    email: parsed.data.email ?? null,
    home_city: parsed.data.home_city,
    dob_month: parsed.data.dob_month,
    // Only advance the step marker forward — never regress.
    signup_step:
      existing.signup_step === "corridor" ||
      existing.signup_step === "identity" ||
      existing.signup_step === "admit" ||
      existing.signup_step === "complete"
        ? existing.signup_step
        : "profile",
  };

  const { error: updateErr } = await supabase.auth.updateUser({ data: next });
  if (updateErr) {
    console.error("[profile.updateProfile]", updateErr.message);
    return { ok: false, error: "Couldn't save profile. Try again." };
  }

  return { ok: true, userId: user.id, signup_step: next.signup_step };
}
