/**
 * POST /api/auth/establish-session
 *
 * Bridges the phone-only OTP flow to a real Supabase Auth session.
 *
 * SECURITY (post-hardening May 2026):
 *   This route REQUIRES a `sessionNonce` that was minted server-side by
 *   the tRPC `auth.verifyOtp` procedure on a successful OTP verify. The
 *   nonce is consumed single-use and carries the verified phone E.164.
 *   The request body MUST also carry the same phoneE164, and the two
 *   MUST match — otherwise we'd let a caller mint a session for one phone
 *   using a nonce from another.
 *
 *   The previous design accepted any `phoneE164` from any caller and
 *   minted a Supabase magic-link for that phone. That was a complete
 *   phone-OTP bypass — anyone on the public internet could mint a real
 *   session for any +91 number with a single curl.
 *
 * Flow:
 *   1. Client succeeds `auth.verifyOtp` (tRPC) → receives `sessionNonce`
 *      + verified `phoneE164`.
 *   2. Client POSTs { sessionNonce, phoneE164 } here.
 *   3. We consume the nonce (single-use), verify phoneE164 matches, and
 *      proceed with Supabase user create/lookup.
 *   4. We issue Supabase's phone OTP (signInWithOtp.shouldCreateUser=false
 *      via admin.createUser idempotent + admin.generateLink with type
 *      "phone_change"/"sms") OR — if phone-only is not yet supported by
 *      the Supabase project — we use the legacy synthetic-email path with
 *      a clear marker so future cleanup can remove the @phone.local rows.
 *
 * v16 web pivot §P2 / security hardening §May2026.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { inngest } from "@/lib/inngest/client";
import { requireSameOrigin } from "@/lib/csrf";
import { consumeOtpNonce } from "@nexgen-connect/server/server/lib/otp-nonce";

export const runtime = "nodejs";

const inputSchema = z.object({
  /** E.164 (with leading +, e.g. +919876543210). MUST match the phone
   *  bound to sessionNonce. */
  phoneE164: z.string().regex(/^\+91[6-9]\d{9}$/),
  /** Single-use nonce minted by tRPC `auth.verifyOtp`. Required. */
  sessionNonce: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  // CSRF / origin guard. This route mints sessions; never accept x-origin.
  const origin = requireSameOrigin(req);
  if (!origin.ok) {
    return NextResponse.json(
      { error: "E001:bad_origin" },
      { status: 403 },
    );
  }

  let body: z.infer<typeof inputSchema>;
  try {
    body = inputSchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { error: "E022:invalid_input" },
      { status: 400 },
    );
  }

  // CRITICAL: Consume the nonce BEFORE any Supabase mutation. Nonce
  // missing / expired / phone-mismatch → refuse. Single-use guarantees
  // that a leaked nonce can be redeemed at most once.
  const nonce = await consumeOtpNonce(body.sessionNonce);
  if (!nonce) {
    return NextResponse.json(
      { error: "E025:nonce_invalid_or_used" },
      { status: 401 },
    );
  }
  if (nonce.phoneE164 !== body.phoneE164) {
    // Phone in body doesn't match phone bound to nonce. This is a clear
    // attack signature (try to mint a session for a different phone) —
    // log and refuse. We've already consumed the nonce above so the
    // attacker can't retry with the correct phone.
    console.warn(
      "[establish-session] nonce phone mismatch — refused",
    );
    return NextResponse.json(
      { error: "E026:nonce_phone_mismatch" },
      { status: 401 },
    );
  }

  // Stub mode — Supabase env not configured (dev without Mumbai project).
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json({
      mode: "stub",
      reason: "supabase_admin_not_configured",
      phoneE164: body.phoneE164,
    });
  }

  const admin = getSupabaseAdmin();

  // Initial signup metadata. Stamped on first verify; /signup/you and
  // subsequent steps merge their own keys in via auth.updateUser. The
  // admin dashboard reads this to render the stage column.
  const initialMetadata = {
    signup_step: "phone" as const,
    phone_verified_at: new Date().toISOString(),
    admission_status: "pending_review" as const,
    identity_status: "unverified" as const,
    admit_status: "not_uploaded" as const,
  };

  // Step 1: idempotent createUser. Phone is already OTP-verified by Meta
  // Cloud / MSG91 upstream, so we set phone_confirm: true.
  //
  // NOTE: synthetic `@phone.local` email is intentional — Supabase
  // generateLink with type="magiclink" requires an email column even when
  // the user is phone-only. We mark the synthetic email with a stable
  // suffix so a future cleanup migration can NULL these out without
  // affecting users who later add a real email via /signup/you.
  const syntheticEmail = `${body.phoneE164.replace(/^\+/, "")}@phone.local`;
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    phone: body.phoneE164,
    phone_confirm: true,
    email: syntheticEmail,
    email_confirm: true,
    user_metadata: initialMetadata,
  });

  let userId: string | null = created?.user?.id ?? null;

  if (createErr) {
    const isDuplicate =
      createErr.status === 422 ||
      /already registered|exists/i.test(createErr.message ?? "");
    if (!isDuplicate) {
      console.error("[establish-session] createUser failed:", createErr);
      return NextResponse.json(
        { error: "E099:auth_failed" },
        { status: 500 },
      );
    }

    // Returning user: look them up. We've removed the listUsers
    // pagination dead-end at 1000 users. Instead we use the documented
    // direct admin query on auth.users via service-role (bypasses RLS).
    const phoneNoPlus = body.phoneE164.replace(/^\+/, "");
    const { data: existingRow } = await admin
      .schema("auth")
      .from("users")
      .select("id, user_metadata")
      .eq("phone", phoneNoPlus)
      .maybeSingle<{ id: string; user_metadata: Record<string, unknown> | null }>();

    userId = existingRow?.id ?? null;

    // Stamp phone_verified_at if missing, preserving any richer profile
    // fields the user may have set previously via /signup/you.
    if (userId) {
      const meta = (existingRow?.user_metadata ?? {}) as Record<string, unknown>;
      const patched: Record<string, unknown> = {
        ...meta,
        phone_verified_at:
          meta.phone_verified_at ?? initialMetadata.phone_verified_at,
        signup_step: meta.signup_step ?? initialMetadata.signup_step,
        admission_status:
          meta.admission_status ?? initialMetadata.admission_status,
        identity_status: meta.identity_status ?? initialMetadata.identity_status,
        admit_status: meta.admit_status ?? initialMetadata.admit_status,
      };
      try {
        await admin.auth.admin.updateUserById(userId, { user_metadata: patched });
      } catch (mergeErr) {
        console.warn("[establish-session] metadata merge failed:", mergeErr);
      }
    }
  }

  if (!userId) {
    return NextResponse.json(
      { error: "E099:auth_failed" },
      { status: 500 },
    );
  }

  // Step 2: mint a magic-link the browser can verify to set cookies.
  // The synthetic email + hashedToken pair is short-lived (Supabase
  // default 1h) and single-use.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    // Refuse Host-header-injection path. The previous fallback to
    // `new URL(req.url).origin` was risky in front of a misconfigured
    // proxy.
    console.error("[establish-session] NEXT_PUBLIC_SITE_URL unset");
    return NextResponse.json(
      { error: "E099:site_url_unset" },
      { status: 500 },
    );
  }

  const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: syntheticEmail,
    options: { redirectTo: `${siteUrl}/signup` },
  });

  // Emit auth/phone.verified for downstream jobs (welcome email, admin
  // alert). Non-fatal — establish-session is the source of truth that
  // the user is now in Supabase auth.
  try {
    await inngest.send({
      name: "auth/phone.verified",
      data: { verifiedUserId: userId, phoneE164: body.phoneE164 },
    });
  } catch (err) {
    console.warn("[establish-session] inngest emit failed:", err);
  }

  if (linkErr || !link?.properties?.hashed_token) {
    return NextResponse.json({
      mode: "user-created-no-magic-link",
      userId,
      reason: linkErr?.message ?? "no hashed_token returned",
    });
  }

  return NextResponse.json({
    mode: "magic-link-ready",
    userId,
    hashedToken: link.properties.hashed_token,
    actionLink: link.properties.action_link,
    email: syntheticEmail,
  });
}
