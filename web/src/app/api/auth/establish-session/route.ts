/**
 * POST /api/auth/establish-session
 *
 * Bridges the phone-only OTP flow to a real Supabase Auth session.
 *
 * The flow:
 *   1. Client has just succeeded `auth.verifyOtp` (tRPC). It received
 *      `{ sessionToken, refreshToken, user }` where sessionToken is the
 *      placeholder "demo-phone-only" string from packages/server.
 *   2. Client POSTs the verified phone E.164 here.
 *   3. We call `supabase.auth.admin.createUser({ phone, phone_confirm:
 *      true })` — idempotent: if the user already exists, the call
 *      returns 422 and we look them up via `listUsers`.
 *   4. We mint a single-use magic-link, then redirect-mode it client-
 *      side via `supabase.auth.verifyOtp({ token_hash, type: 'magiclink' })`.
 *      That sets the SSR cookie chain (sb-access-token + sb-refresh-token).
 *
 * Why not call admin.createUser directly from the tRPC procedure: the
 * Supabase admin client needs SERVICE_ROLE_KEY which we don't want to
 * import into packages/server (kept platform-agnostic for the future
 * mobile/admin clients). Web is the only consumer of admin.createUser.
 *
 * v16 web pivot §P2.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { inngest } from "@/lib/inngest/client";

const inputSchema = z.object({
  // E.164 (with leading +, e.g. +919876543210). The OTP procedure
  // already validated format upstream.
  phoneE164: z.string().regex(/^\+91[6-9]\d{9}$/),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof inputSchema>;
  try {
    body = inputSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "E022:invalid_phone" }, { status: 400 });
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

  // Step 1: idempotent createUser. Phone is already OTP-verified by Meta
  // Cloud upstream, so we set phone_confirm: true to skip Supabase's
  // own SMS verify step (saves a round-trip and keeps Meta as the
  // single source of truth for OTP).
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    phone: body.phoneE164,
    phone_confirm: true,
  });

  let userId: string | null = created?.user?.id ?? null;

  if (createErr) {
    // 422 / "User already registered" is expected on second sign-in.
    // Re-look them up by phone via listUsers (Supabase v2 doesn't expose
    // a direct getUserByPhone yet — listUsers + filter is the documented
    // pattern).
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

    const { data: list, error: listErr } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (listErr) {
      console.error("[establish-session] listUsers failed:", listErr);
      return NextResponse.json(
        { error: "E099:auth_failed" },
        { status: 500 },
      );
    }

    const phoneNoPlus = body.phoneE164.replace(/^\+/, "");
    const existing = list?.users.find((u) => u.phone === phoneNoPlus);
    userId = existing?.id ?? null;
  }

  if (!userId) {
    return NextResponse.json(
      { error: "E099:auth_failed" },
      { status: 500 },
    );
  }

  // Step 2: generate a magic-link that the browser can verify to
  // mint the SSR session. Returns an `action_link` and a `hashed_
  // token`; the client uses the latter with `auth.verifyOtp({...,
  // type: 'magiclink'})` to set cookies.
  //
  // NOTE: Supabase v2 generateLink for `magiclink` requires an email;
  // for phone-only users we issue a sign-in-with-phone OTP instead and
  // return its hashed token. Wiring on the client is identical
  // (auth.verifyOtp with type: 'sms').
  //
  // `redirectTo` carries the canonical site origin so the action_link
  // points at production rather than the Supabase project's default
  // (which Supabase fills with whatever was set during project init —
  // typically localhost). The hashed_token path doesn't follow this
  // redirect, but we set it correctly for the action_link form too.
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
  const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: `${userId}@phone.local`, // dummy — Supabase requires email for magiclink even when user is phone-only
    options: {
      redirectTo: `${siteUrl}/signup`,
    },
  });
  // Emit the durable `auth/phone.verified` event so the Inngest
  // welcome-email job sends the Resend welcome + admin alert with
  // retries. Non-fatal if the emit itself fails — establish-session
  // is the source of truth for "user is now in Supabase auth".
  try {
    await inngest.send({
      name: "auth/phone.verified",
      data: { verifiedUserId: userId, phoneE164: body.phoneE164 },
    });
  } catch (err) {
    console.warn("[establish-session] inngest emit failed:", err);
  }

  if (linkErr || !link?.properties?.hashed_token) {
    // Fall back to no-link mode: the establish-session call still
    // succeeded in creating the user; the client can re-trigger an
    // OTP via `auth.signInWithOtp({phone})` if needed.
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
    /** Client should call:
     *    supabase.auth.verifyOtp({ token_hash: hashedToken, type: 'magiclink' })
     * which will set the sb-access-token + sb-refresh-token cookies via
     * the @supabase/ssr browser client.
     */
  });
}

export const runtime = "nodejs";
