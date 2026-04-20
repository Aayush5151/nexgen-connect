"use server";

import { timingSafeEqual } from "node:crypto";
import { z } from "zod";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { hashEmail, hashOtp, hashPhone } from "@/lib/hash";
import { MOCK_OTP_CODE, isMockOtp, sendOtp, verifyOtpUpstream } from "@/lib/msg91";
import { sendWaitlistWelcome } from "@/lib/resend";
import { createVerificationSession, readVerificationSession } from "@/lib/session";
import { writeAudit } from "@/lib/audit";
import {
  cohortQuerySchema,
  startWaitlistSchema,
  verifyOtpSchema,
  type CohortQueryInput,
  type StartWaitlistInput,
  type VerifyOtpInput,
  type RecentActivityRow,
  type MapCohortRow,
} from "@/lib/supabase/schema";

/**
 * Never forward raw Postgres / Supabase error messages to the client — they
 * leak schema. Log the detail server-side and return a generic message.
 */
function opaqueError(ctx: string, err: unknown): string {
  console.error(`[waitlist.${ctx}]`, err instanceof Error ? err.message : err);
  return "Something went wrong. Try again in a moment.";
}

/**
 * Timing-safe comparison of two equal-length hex strings. Required for
 * comparing OTP hashes: `===` on V8 is not constant-time on strings and
 * leaks byte-level progress under heavy attack.
 */
function safeEqualHex(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

// RPCs count (verified + pending). UI labels this as "joined", never "reserved",
// because pending = someone who started OTP but hasn't confirmed. See 2.3 in
// NEXGEN-V3-POLISH-PROMPT.md.

const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;

type ActionError = { ok: false; error: string };

export type CohortCountResult =
  | { ok: true; count: number; total: number }
  | ActionError;

export async function getCohortCountAction(
  input: CohortQueryInput,
): Promise<CohortCountResult> {
  const parsed = cohortQuerySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  try {
    const db = getSupabaseAdmin();
    const [cohort, total] = await Promise.all([
      db.rpc("get_cohort_count", {
        p_home_city: parsed.data.home_city,
        p_destination_university: parsed.data.destination_university,
      }),
      db.rpc("get_total_waitlist"),
    ]);

    if (cohort.error) return { ok: false, error: opaqueError("cohort", cohort.error) };
    if (total.error) return { ok: false, error: opaqueError("cohort.total", total.error) };

    return {
      ok: true,
      count: (cohort.data as number) ?? 0,
      total: (total.data as number) ?? 0,
    };
  } catch (err) {
    return { ok: false, error: opaqueError("cohort.catch", err) };
  }
}

export type TotalResult = { ok: true; total: number } | ActionError;

export async function getTotalWaitlistAction(): Promise<TotalResult> {
  try {
    const db = getSupabaseAdmin();
    const { data, error } = await db.rpc("get_total_waitlist");
    if (error) return { ok: false, error: opaqueError("total", error) };
    return { ok: true, total: (data as number) ?? 0 };
  } catch (err) {
    return { ok: false, error: opaqueError("total.catch", err) };
  }
}

export type RecentActivityResult =
  | { ok: true; rows: RecentActivityRow[] }
  | ActionError;

export async function getRecentActivityAction(
  limit = 5,
): Promise<RecentActivityResult> {
  // Cap the client-supplied limit — RPC also caps at 20 but belt + braces.
  const safeLimit = Math.max(1, Math.min(limit, 20));
  try {
    const db = getSupabaseAdmin();
    const { data, error } = await db.rpc("get_recent_activity", {
      p_limit: safeLimit,
    });
    if (error) return { ok: false, error: opaqueError("recent", error) };
    return { ok: true, rows: (data as RecentActivityRow[]) ?? [] };
  } catch (err) {
    return { ok: false, error: opaqueError("recent.catch", err) };
  }
}

export type MapBreakdownResult =
  | { ok: true; rows: MapCohortRow[] }
  | ActionError;

export async function getMapBreakdownAction(): Promise<MapBreakdownResult> {
  try {
    const db = getSupabaseAdmin();
    const { data, error } = await db.rpc("get_map_cohort_breakdown");
    if (error) return { ok: false, error: opaqueError("map", error) };
    return { ok: true, rows: (data as MapCohortRow[]) ?? [] };
  } catch (err) {
    return { ok: false, error: opaqueError("map.catch", err) };
  }
}

export type StartWaitlistResult =
  | { ok: true; mock: boolean }
  | (ActionError & { rate_limited?: boolean; phone_hash_prefix?: string });

export async function startWaitlistAction(
  input: StartWaitlistInput,
): Promise<StartWaitlistResult> {
  const parsed = startWaitlistSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    const db = getSupabaseAdmin();
    const phone_hash = hashPhone(parsed.data.phone);
    const email_hash = parsed.data.email ? hashEmail(parsed.data.email) : null;

    const { data: existing } = await db
      .from("waitlist")
      .select("id, verification_status")
      .eq("phone_hash", phone_hash)
      .maybeSingle();

    if (existing?.verification_status === "verified") {
      return {
        ok: false,
        error: "This number is already on the list.",
      };
    }

    const { data: recentCount, error: rateErr } = await db.rpc(
      "count_recent_otp_requests",
      { p_phone_hash: phone_hash },
    );
    if (rateErr) return { ok: false, error: opaqueError("rate", rateErr) };
    if (((recentCount as number) ?? 0) >= 3) {
      return {
        ok: false,
        error:
          "Too many codes requested. Try again in ten minutes, or email hello@nexgenconnect.com if you're stuck.",
        rate_limited: true,
        phone_hash_prefix: phone_hash.slice(0, 8),
      };
    }

    const code = isMockOtp()
      ? MOCK_OTP_CODE
      : String(Math.floor(100000 + Math.random() * 900000));

    // Send OTP FIRST. If MSG91 is down we never burn a rate-limit slot in
    // otp_codes for a code that was never delivered. Only after a successful
    // upstream send do we record the hashed code + start the TTL clock.
    const sent = await sendOtp(parsed.data.phone);
    if (!sent.ok) return { ok: false, error: sent.error };

    const code_hash = hashOtp(code);
    const expires_at = new Date(Date.now() + OTP_TTL_MS).toISOString();

    const { error: otpErr } = await db.from("otp_codes").insert({
      phone_hash,
      code_hash,
      expires_at,
    });
    if (otpErr) return { ok: false, error: opaqueError("otp.insert", otpErr) };

    if (existing) {
      await db
        .from("waitlist")
        .update({
          first_name: parsed.data.first_name,
          home_city: parsed.data.home_city,
          destination_university: parsed.data.destination_university,
          intake: parsed.data.intake,
          consent_version: parsed.data.consent_version,
          email_hash,
        })
        .eq("phone_hash", phone_hash);
    } else {
      await db.from("waitlist").insert({
        phone_hash,
        first_name: parsed.data.first_name,
        home_city: parsed.data.home_city,
        destination_university: parsed.data.destination_university,
        intake: parsed.data.intake,
        consent_version: parsed.data.consent_version,
        email_hash,
        verification_status: "unverified",
      });
    }

    return { ok: true, mock: sent.mock };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not start waitlist",
    };
  }
}

export type VerifyOtpResult =
  | {
      ok: true;
      first_name: string;
      home_city: string;
      destination_university: string;
    }
  | ActionError;

export async function verifyOtpAction(
  input: VerifyOtpInput,
): Promise<VerifyOtpResult> {
  const parsed = verifyOtpSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    const db = getSupabaseAdmin();
    const phone_hash = hashPhone(parsed.data.phone);
    const code_hash = hashOtp(parsed.data.code);

    const { data: otpRow, error: fetchErr } = await db
      .from("otp_codes")
      .select("*")
      .eq("phone_hash", phone_hash)
      .eq("consumed", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchErr) return { ok: false, error: opaqueError("otp.fetch", fetchErr) };
    if (!otpRow) return { ok: false, error: "Request a new code." };

    if (new Date(otpRow.expires_at).getTime() < Date.now()) {
      return { ok: false, error: "Code expired. Request a new one." };
    }
    if (otpRow.attempts >= OTP_MAX_ATTEMPTS) {
      return { ok: false, error: "Too many attempts. Request a new code." };
    }

    // Constant-time comparison of the hashed OTP prevents per-byte timing
    // attacks. With a 6-digit code and a 5-attempt cap this is largely
    // belt-and-suspenders, but it's the right default.
    const hashMatch = safeEqualHex(otpRow.code_hash, code_hash);
    const upstream = await verifyOtpUpstream(parsed.data.phone, parsed.data.code);

    if (!hashMatch || !upstream.ok) {
      await db
        .from("otp_codes")
        .update({ attempts: otpRow.attempts + 1 })
        .eq("id", otpRow.id);
      return {
        ok: false,
        error: upstream.ok ? "Invalid code" : upstream.error,
      };
    }

    await db.from("otp_codes").update({ consumed: true }).eq("id", otpRow.id);
    await db
      .from("waitlist")
      .update({
        verification_status: "verified",
        verified_at: new Date().toISOString(),
      })
      .eq("phone_hash", phone_hash);

    const { data: row } = await db
      .from("waitlist")
      .select("id, first_name, home_city, destination_university")
      .eq("phone_hash", phone_hash)
      .maybeSingle();

    // Issue a signed short-lived verification cookie so the user can walk
    // through subsequent steps (DigiLocker, admit letter) without
    // re-entering their phone. See src/lib/session.ts for the token shape.
    //
    // Best-effort: if SESSION_SECRET isn't set in this env, phone-OTP still
    // succeeds — the user just can't walk into /verify/digilocker until the
    // secret is deployed. Avoids a deployment-order footgun.
    if (row?.id) {
      try {
        await createVerificationSession({
          waitlist_id: row.id,
          phone_hash,
        });
        await writeAudit({
          action: "verification_session_issued",
          waitlist_id: row.id,
        });
      } catch (err) {
        console.warn(
          "[waitlist.verify] session issuance skipped:",
          err instanceof Error ? err.message : err,
        );
      }
    }

    return {
      ok: true,
      first_name: row?.first_name ?? "",
      home_city: row?.home_city ?? "",
      destination_university: row?.destination_university ?? "",
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Verification failed",
    };
  }
}

/**
 * Welcome email trigger.
 *
 * Gated behind the verification session cookie so an unauthenticated caller
 * can't abuse this endpoint as a free way to spam Resend sends. Without the
 * cookie (issued only after a successful phone OTP), every call errors.
 */
const welcomeEmailSchema = z.object({
  email: z.string().trim().email().max(254),
  firstName: z.string().trim().min(1).max(40),
  homeCity: z.string().trim().min(2).max(60),
  destinationUniversity: z.enum(["UCD", "Trinity", "UCC"]),
});

export async function sendWelcomeEmailAction(input: {
  email: string;
  firstName: string;
  homeCity: string;
  destinationUniversity: string;
}): Promise<{ ok: boolean; error?: string }> {
  const session = await readVerificationSession();
  if (!session) {
    return { ok: false, error: "Verify your phone number first." };
  }

  const parsed = welcomeEmailSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    const res = await sendWaitlistWelcome({
      to: parsed.data.email,
      firstName: parsed.data.firstName,
      homeCity: parsed.data.homeCity,
      destinationUniversity: parsed.data.destinationUniversity,
    });
    return res.ok ? { ok: true } : { ok: false, error: opaqueError("email", res.error) };
  } catch (err) {
    return { ok: false, error: opaqueError("email.catch", err) };
  }
}
