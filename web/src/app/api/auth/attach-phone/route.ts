import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAuthedUser } from "@/lib/api-auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { SignupMetadata } from "@/lib/supabase/schema";

/**
 * POST /api/auth/attach-phone
 *
 * Sibling of /api/auth/establish-session for the OAuth-entry path.
 *
 * Phone-entry users hit /api/auth/establish-session, which CREATES a
 * new auth.users row with phone_confirm=true and seeds initial
 * metadata. OAuth-entry users already have a row (created when they
 * signed in with Google / email magic-link), so they can't go through
 * createUser — that would 422 on duplicate, and even if it didn't,
 * we'd end up with two auth.users rows for one human.
 *
 * This route:
 *   1. Requires an SSR-authed Supabase session (the one OAuth /
 *      magic-link minted on /auth/callback).
 *   2. Takes the verified phone E.164 — the upstream tRPC
 *      `auth.verifyOtp` has already proven the user controls that
 *      number via MSG91 / WhatsApp.
 *   3. Service-role updates the existing auth.users row to attach the
 *      phone AND stamp user_metadata.phone_verified_at +
 *      signup_step="corridor".
 *
 * v17 OAuth entry.
 */

const inputSchema = z.object({
  phoneE164: z.string().regex(/^\+91[6-9]\d{9}$/),
});

export async function POST(req: NextRequest) {
  const auth = await requireAuthedUser();
  if (!auth.user) return auth.response;

  let body: z.infer<typeof inputSchema>;
  try {
    body = inputSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "E022:invalid_phone" }, { status: 400 });
  }

  // Stub mode — Supabase service role not configured (dev / preview).
  // Return success so the funnel can walk forward in zustand-only mode
  // without crashing.
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({
      ok: true,
      mode: "stub",
      reason: "supabase_admin_not_configured",
    });
  }

  const admin = getSupabaseAdmin();

  // Load the current user via service role (the SSR cookie identified
  // them; admin-by-id lets us mutate without UA-cookie scope).
  const { data: userRes, error: getErr } = await admin.auth.admin.getUserById(
    auth.user.id,
  );
  if (getErr || !userRes?.user) {
    console.warn("[attach-phone] getUserById failed:", getErr?.message);
    return NextResponse.json(
      { error: "E099:user_lookup_failed" },
      { status: 500 },
    );
  }

  // If a different account already owns this phone, refuse — otherwise
  // we'd let an OAuth user "steal" the phone-binding of an existing
  // phone-OTP user and orphan their data.
  //
  // The phone we received is OTP-verified, so the only legitimate
  // collision is "user previously signed up with phone-only and is
  // now re-signing up via Google". For that case we'd ultimately want
  // to MERGE the two accounts, which is a separate workflow. For now
  // we fail loud and ask the user to use the original method.
  const { data: listRes } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  const phoneDigits = body.phoneE164.replace(/^\+/, "");
  const phoneOwner = (listRes?.users ?? []).find(
    (u) => u.phone === phoneDigits && u.id !== auth.user.id,
  );
  if (phoneOwner) {
    return NextResponse.json(
      { error: "E023:phone_belongs_to_other_account" },
      { status: 409 },
    );
  }

  const meta = (userRes.user.user_metadata ?? {}) as SignupMetadata;
  const next: SignupMetadata = {
    ...meta,
    phone_verified_at: new Date().toISOString(),
    // Advance the funnel: oauth_pending → profile is set by /signup/you;
    // attaching phone moves the user to "corridor" stage so the /admin
    // dashboard renders the right column.
    signup_step:
      meta.signup_step === "complete" ? "complete" : "corridor",
  };

  // updateUserById attaches the phone AND merges user_metadata in one
  // call. `phone_confirm: true` skips Supabase's own SMS verify step
  // (we already verified via MSG91 / WhatsApp upstream).
  const { error: updErr } = await admin.auth.admin.updateUserById(
    auth.user.id,
    {
      phone: body.phoneE164,
      phone_confirm: true,
      user_metadata: next,
    },
  );
  if (updErr) {
    console.error("[attach-phone] updateUser failed:", updErr.message);
    return NextResponse.json({ error: "E099:phone_attach_failed" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    nextStep: "corridor",
    phoneVerifiedAt: next.phone_verified_at,
  });
}
