import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAuthedUser } from "@/lib/api-auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { SignupMetadata } from "@/lib/supabase/schema";
import { requireSameOrigin } from "@/lib/csrf";
import { consumeOtpNonce } from "@nexgen-connect/server/server/lib/otp-nonce";

export const runtime = "nodejs";

/**
 * POST /api/auth/attach-phone
 *
 * Sibling of /api/auth/establish-session for the OAuth-entry path.
 *
 * SECURITY (post-hardening May 2026):
 *   This route REQUIRES a `sessionNonce` minted by the tRPC `auth.verifyOtp`
 *   on a successful OTP verify. The nonce is consumed single-use and binds
 *   the verified phone to the attach. The request body MUST also carry the
 *   same phoneE164, and the two MUST match.
 *
 *   The previous design accepted any +91 phone from an authed OAuth user
 *   without any OTP proof — meaning an OAuth user could attach an arbitrary
 *   unattached number to their account. With the nonce gate, the only path
 *   to attach is "user successfully verified OTP for that exact phone".
 *
 * Flow:
 *   1. OAuth user has Supabase session via /auth/callback.
 *   2. User runs phone OTP via tRPC `auth.verifyOtp` → receives nonce.
 *   3. Client POSTs { sessionNonce, phoneE164 } here.
 *   4. We consume nonce, verify phoneE164 matches the bound phone, then
 *      attach to the existing auth.users row.
 *
 * v17 OAuth entry / security hardening §May2026.
 */

const inputSchema = z.object({
  phoneE164: z.string().regex(/^\+91[6-9]\d{9}$/),
  /** Single-use nonce from tRPC auth.verifyOtp. Required. */
  sessionNonce: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  // CSRF / origin guard.
  const origin = requireSameOrigin(req);
  if (!origin.ok) {
    return NextResponse.json({ error: "E001:bad_origin" }, { status: 403 });
  }

  const auth = await requireAuthedUser();
  if (!auth.user) return auth.response;

  let body: z.infer<typeof inputSchema>;
  try {
    body = inputSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "E022:invalid_input" }, { status: 400 });
  }

  // Consume nonce BEFORE any DB lookup. Same gate as establish-session.
  const nonce = await consumeOtpNonce(body.sessionNonce);
  if (!nonce) {
    return NextResponse.json(
      { error: "E025:nonce_invalid_or_used" },
      { status: 401 },
    );
  }
  if (nonce.phoneE164 !== body.phoneE164) {
    console.warn("[attach-phone] nonce phone mismatch — refused");
    return NextResponse.json(
      { error: "E026:nonce_phone_mismatch" },
      { status: 401 },
    );
  }

  // Stub mode — Supabase service role not configured (dev / preview).
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({
      ok: true,
      mode: "stub",
      reason: "supabase_admin_not_configured",
    });
  }

  const admin = getSupabaseAdmin();

  // Load the current user via service role.
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

  // If a different account already owns this phone, refuse. We use a
  // direct service-role query on auth.users (bypasses RLS) rather than
  // the listUsers pagination dead-end at 1000 users.
  const phoneDigits = body.phoneE164.replace(/^\+/, "");
  const { data: phoneOwner } = await admin
    .schema("auth")
    .from("users")
    .select("id")
    .eq("phone", phoneDigits)
    .neq("id", auth.user.id)
    .maybeSingle<{ id: string }>();
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
    signup_step:
      meta.signup_step === "complete" ? "complete" : "corridor",
  };

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
