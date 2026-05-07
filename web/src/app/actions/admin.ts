"use server";

import { randomInt, timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  clearAdminSession,
  createAdminSession,
  readAdminSession,
} from "@/lib/admin";
import { hashOtp, hashPhone } from "@/lib/hash";
import { MOCK_OTP_CODE, isMockOtp, sendOtp, verifyOtpUpstream } from "@/lib/msg91";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  phoneE164,
  updateAdmissionSchema,
  updateSignupAdmissionSchema,
  verifyOtpSchema,
  type AdminStats,
  type AdmissionAuditLogRow,
  type AdmissionStatus,
  type SignupMetadata,
  type SignupRow,
  type SignupStep,
  type UpdateAdmissionInput,
  type UpdateSignupAdmissionInput,
  type WaitlistRow,
} from "@/lib/supabase/schema";

/**
 * Admin server actions.
 *
 * Two trust gates run on every mutation:
 *   1. An admin session cookie signed with SESSION_SECRET (set only after
 *      a successful phone-OTP → is_admin_hash RPC path).
 *   2. A fresh DB read of waitlist.is_admin for the session's waitlist_id.
 *      A revoked admin can't keep acting on a stale cookie.
 *
 * All DB access here uses the service-role key. Never call these from the
 * browser with user-supplied IDs without going through these gates.
 */

const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;

type ActionError = { ok: false; error: string };

function safeEqualHex(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

function opaqueError(ctx: string, err: unknown): string {
  console.error(`[admin.${ctx}]`, err instanceof Error ? err.message : err);
  return "Something went wrong. Try again in a moment.";
}

/**
 * Confirm caller is still an admin. Reads the session cookie and then
 * re-checks is_admin in the DB - a cookie alone is not enough to mutate.
 * Returns the admin's waitlist row or null.
 */
async function requireAdmin(): Promise<{
  session: { waitlist_id: string; phone_hash: string };
  db: ReturnType<typeof getSupabaseAdmin>;
} | null> {
  const session = await readAdminSession();
  if (!session) return null;

  const db = getSupabaseAdmin();
  const { data } = await db
    .from("waitlist")
    .select("id, is_admin, verification_status")
    .eq("id", session.waitlist_id)
    .maybeSingle();

  if (!data || !data.is_admin || data.verification_status !== "verified") {
    return null;
  }

  return { session, db };
}

// ---------------------------------------------------------------------------
// Login flow
// Re-uses the same MSG91 OTP path as the user waitlist. What's different:
//   - startAdminLoginAction does NOT create a waitlist row.
//   - verifyAdminLoginAction gates on is_admin_hash(phone_hash) before
//     issuing ngc_admin. Non-admins who know the OTP still get no cookie.
// ---------------------------------------------------------------------------

const startAdminLoginSchema = z.object({
  phone: phoneE164,
});

export type StartAdminLoginResult =
  | { ok: true; mock: boolean }
  | (ActionError & { rate_limited?: boolean });

export async function startAdminLoginAction(input: {
  phone: string;
}): Promise<StartAdminLoginResult> {
  const parsed = startAdminLoginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid phone",
    };
  }

  try {
    const db = getSupabaseAdmin();
    const phone_hash = hashPhone(parsed.data.phone);

    // Leak-resistant: we don't tell the caller whether this phone is an
    // admin. We rate-limit equally for everyone and always "send" the OTP.
    // If the phone isn't an admin, verifyAdminLoginAction will deny later.
    const { data: recentCount, error: rateErr } = await db.rpc(
      "count_recent_otp_requests",
      { p_phone_hash: phone_hash },
    );
    if (rateErr) return { ok: false, error: opaqueError("rate", rateErr) };
    if (((recentCount as number) ?? 0) >= 3) {
      return {
        ok: false,
        error: "Too many codes requested. Wait ten minutes.",
        rate_limited: true,
      };
    }

    // Math.random() is xorshift128+ in V8 — not cryptographically
    // secure. randomInt is backed by libcrypto's CSPRNG.
    const code = isMockOtp() ? MOCK_OTP_CODE : String(randomInt(100000, 1000000));

    const sent = await sendOtp(parsed.data.phone);
    if (!sent.ok) return { ok: false, error: sent.error };

    const { error: otpErr } = await db.from("otp_codes").insert({
      phone_hash,
      code_hash: hashOtp(code),
      expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
    });
    if (otpErr) return { ok: false, error: opaqueError("otp.insert", otpErr) };

    return { ok: true, mock: sent.mock };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Login failed",
    };
  }
}

export type VerifyAdminLoginResult =
  | { ok: true; first_name: string }
  | ActionError;

export async function verifyAdminLoginAction(input: {
  phone: string;
  code: string;
}): Promise<VerifyAdminLoginResult> {
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

    // Mark the code consumed so it can't be replayed.
    await db.from("otp_codes").update({ consumed: true }).eq("id", otpRow.id);

    // Now the gate: only admins get a cookie.
    const { data: isAdmin, error: adminErr } = await db.rpc("is_admin_hash", {
      p_phone_hash: phone_hash,
    });
    if (adminErr) return { ok: false, error: opaqueError("is_admin", adminErr) };
    if (!isAdmin) {
      // Same copy whether the phone is on the waitlist or not - don't leak.
      return {
        ok: false,
        error: "This number isn't authorised for admin access.",
      };
    }

    // Admin confirmed. Fetch the row to build the session + stash name.
    const { data: row } = await db
      .from("waitlist")
      .select("id, first_name")
      .eq("phone_hash", phone_hash)
      .maybeSingle();

    if (!row?.id) {
      // Shouldn't happen: is_admin_hash only returns true for verified
      // waitlist rows. Still, defensive.
      return { ok: false, error: "Admin row not found." };
    }

    await createAdminSession({
      waitlist_id: row.id,
      phone_hash,
    });

    return { ok: true, first_name: row.first_name };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Verification failed",
    };
  }
}

export async function logoutAdminAction(): Promise<void> {
  await clearAdminSession();
  redirect("/admin/login");
}

// ---------------------------------------------------------------------------
// Read: list + stats
// ---------------------------------------------------------------------------

const listFilterSchema = z.object({
  status: z.enum(["all", "pending_review", "approved", "declined"]).optional(),
  verified_only: z.boolean().optional(),
  q: z.string().trim().max(80).optional(),
  limit: z.number().int().positive().max(200).optional(),
});

export type ListWaitlistResult =
  | { ok: true; rows: WaitlistRow[] }
  | ActionError;

export async function listWaitlistForAdminAction(input: {
  status?: "all" | AdmissionStatus;
  verified_only?: boolean;
  q?: string;
  limit?: number;
}): Promise<ListWaitlistResult> {
  const gate = await requireAdmin();
  if (!gate) return { ok: false, error: "Not authorised." };

  const parsed = listFilterSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid filter" };

  const { status = "pending_review", verified_only = true, q, limit = 100 } =
    parsed.data;

  try {
    let query = gate.db
      .from("waitlist")
      .select("*")
      .eq("is_admin", false) // never list admins themselves
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status !== "all") {
      query = query.eq("admission_status", status);
    }
    if (verified_only) {
      query = query.eq("verification_status", "verified");
    }
    if (q) {
      // Case-insensitive substring search on first_name + home_city.
      // Postgres `or()` + ilike. Don't expose phone_hash search via this
      // endpoint - we'd rather admins filter client-side on hash tails.
      const pattern = `%${q}%`;
      query = query.or(
        `first_name.ilike.${pattern},home_city.ilike.${pattern}`,
      );
    }

    const { data, error } = await query;
    if (error) return { ok: false, error: opaqueError("list", error) };

    return { ok: true, rows: (data as WaitlistRow[]) ?? [] };
  } catch (err) {
    return { ok: false, error: opaqueError("list.catch", err) };
  }
}

export type AdminStatsResult = { ok: true; stats: AdminStats } | ActionError;

export async function getAdminStatsAction(): Promise<AdminStatsResult> {
  const gate = await requireAdmin();
  if (!gate) return { ok: false, error: "Not authorised." };

  try {
    const { data, error } = await gate.db.rpc("admin_stats");
    if (error) return { ok: false, error: opaqueError("stats", error) };

    // The RPC returns `setof` with one row; supabase-js hands back an array.
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      return {
        ok: true,
        stats: {
          total: 0,
          pending_review: 0,
          approved: 0,
          declined: 0,
          verified_phone: 0,
          identity_verified: 0,
        },
      };
    }
    return { ok: true, stats: row as AdminStats };
  } catch (err) {
    return { ok: false, error: opaqueError("stats.catch", err) };
  }
}

// ---------------------------------------------------------------------------
// Write: approve / decline / reset
// One helper covers all three transitions. Every call writes an audit row.
// ---------------------------------------------------------------------------

export type UpdateAdmissionResult =
  | { ok: true; to_status: AdmissionStatus; from_status: AdmissionStatus }
  | ActionError;

export async function updateAdmissionAction(
  input: UpdateAdmissionInput,
): Promise<UpdateAdmissionResult> {
  const gate = await requireAdmin();
  if (!gate) return { ok: false, error: "Not authorised." };

  const parsed = updateAdmissionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { target_id, new_status, note } = parsed.data;

  try {
    // Load current row so we can log the transition + prevent no-op writes
    // from polluting the audit trail.
    const { data: current, error: readErr } = await gate.db
      .from("waitlist")
      .select("id, admission_status, is_admin")
      .eq("id", target_id)
      .maybeSingle();

    if (readErr) return { ok: false, error: opaqueError("read", readErr) };
    if (!current) return { ok: false, error: "User not found." };
    if (current.is_admin) {
      // Admins don't go through admission review.
      return { ok: false, error: "Cannot review an admin account." };
    }
    if (current.admission_status === new_status) {
      return {
        ok: true,
        to_status: new_status,
        from_status: current.admission_status,
      };
    }

    const { error: updErr } = await gate.db
      .from("waitlist")
      .update({
        admission_status: new_status,
        admission_reviewed_at: new Date().toISOString(),
        admission_reviewed_by: gate.session.waitlist_id,
        admission_note: note ?? null,
      })
      .eq("id", target_id);
    if (updErr) return { ok: false, error: opaqueError("update", updErr) };

    const { error: auditErr } = await gate.db
      .from("admission_audit_log")
      .insert({
        target_id,
        admin_id: gate.session.waitlist_id,
        from_status: current.admission_status,
        to_status: new_status,
        note: note ?? null,
      });
    if (auditErr) {
      // Don't roll back the update - the admission state is the source of
      // truth and the audit gap is recoverable from server logs.
      console.error("[admin.update] audit insert failed:", auditErr.message);
    }

    return {
      ok: true,
      to_status: new_status,
      from_status: current.admission_status,
    };
  } catch (err) {
    return { ok: false, error: opaqueError("update.catch", err) };
  }
}

// ---------------------------------------------------------------------------
// Read: per-user audit history
// Shown when a row is expanded. Includes the reviewer's name for each entry
// so the founder can see "who approved/declined this and when" without
// hitting the DB manually.
// ---------------------------------------------------------------------------

export type AdmissionHistoryEntry = AdmissionAuditLogRow & {
  admin_first_name: string | null;
};

export type AdmissionHistoryResult =
  | {
      ok: true;
      entries: AdmissionHistoryEntry[];
      target: Pick<
        WaitlistRow,
        | "admission_note"
        | "admission_reviewed_at"
        | "admission_reviewed_by"
      > | null;
      reviewer_first_name: string | null;
    }
  | ActionError;

// ===========================================================================
// v16 source-of-truth admin reads (Path C)
// ===========================================================================
//
// These actions are the v16 swap: /admin reads from auth.users + the
// `user_metadata` jsonb instead of the legacy `waitlist` table. The
// auth gate above (waitlist.is_admin) is unchanged — it stays the
// trust anchor for admin login. What changed is the data plane:
//
//   listSignupsForAdminAction      → auth.users + metadata projection
//   getSignupStatsAction           → counts derived from metadata
//   updateSignupAdmissionAction    → writes admission_status to metadata
//
// Phone-hash filter: we exclude rows whose phone matches a row in
// `waitlist` with is_admin = true so the founder's own auth.users entry
// doesn't appear in their review queue. The phone-to-hash mapping uses
// the same PHONE_PEPPER as the admin login flow.
// ===========================================================================

const SIGNUP_LIST_PAGE_SIZE = 200;
const SIGNUP_LIST_MAX_PAGES = 5;

const listSignupsFilterSchema = z.object({
  status: z.enum(["all", "pending_review", "approved", "declined"]).optional(),
  verified_only: z.boolean().optional(),
  q: z.string().trim().max(80).optional(),
  limit: z.number().int().positive().max(500).optional(),
});

export type ListSignupsResult =
  | { ok: true; rows: SignupRow[] }
  | ActionError;

/**
 * Internal: project one auth.users row + its metadata into the SignupRow
 * shape the dashboard renders. Coerces missing fields to null/sane
 * defaults so the table never has to test for `undefined`.
 */
function projectSignupRow(
  user: {
    id: string;
    phone?: string | null;
    created_at: string;
    last_sign_in_at?: string | null;
    user_metadata?: Record<string, unknown> | null;
  },
): SignupRow {
  const meta = (user.user_metadata ?? {}) as SignupMetadata;
  const phoneE164 = user.phone ? `+${user.phone}` : null;
  const phoneTail = user.phone ? user.phone.slice(-4) : "";
  return {
    id: user.id,
    phone_e164: phoneE164,
    phone_tail: phoneTail,
    first_name: meta.first_name ?? null,
    email: meta.email ?? null,
    home_city: meta.home_city ?? null,
    dob_month: typeof meta.dob_month === "number" ? meta.dob_month : null,
    destination_country: meta.destination_country ?? null,
    destination_city: meta.destination_city ?? null,
    destination_uni: meta.destination_uni ?? null,
    intake: meta.intake ?? null,
    signup_step: (meta.signup_step ?? "phone") as SignupStep,
    verification_status: meta.phone_verified_at ? "verified" : "unverified",
    identity_status: meta.identity_status ?? "unverified",
    admit_status: meta.admit_status ?? "not_uploaded",
    admission_status: meta.admission_status ?? "pending_review",
    admission_reviewed_at: meta.admission_reviewed_at ?? null,
    admission_reviewed_by: meta.admission_reviewed_by ?? null,
    admission_note: meta.admission_note ?? null,
    created_at: user.created_at,
    last_sign_in_at: user.last_sign_in_at ?? null,
  };
}

/** Internal: collect every admin's phone hash so we can hide their own
 *  rows from the review queue. Returns a Set for O(1) membership tests. */
async function getAdminPhoneHashes(
  db: ReturnType<typeof getSupabaseAdmin>,
): Promise<Set<string>> {
  const { data } = await db
    .from("waitlist")
    .select("phone_hash")
    .eq("is_admin", true);
  return new Set((data ?? []).map((r) => r.phone_hash as string));
}

export async function listSignupsForAdminAction(input: {
  status?: "all" | AdmissionStatus;
  verified_only?: boolean;
  q?: string;
  limit?: number;
}): Promise<ListSignupsResult> {
  const gate = await requireAdmin();
  if (!gate) return { ok: false, error: "Not authorised." };

  const parsed = listSignupsFilterSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid filter" };

  const { status = "pending_review", verified_only = true, q, limit = 200 } =
    parsed.data;

  try {
    const adminHashes = await getAdminPhoneHashes(gate.db);

    // listUsers paginates 200/page. We walk up to MAX_PAGES = 1000
    // users which is far above launch volume; bumping the cap is a
    // one-line change once /admin needs to support more.
    const collected: SignupRow[] = [];
    for (let page = 1; page <= SIGNUP_LIST_MAX_PAGES; page++) {
      const { data, error } = await gate.db.auth.admin.listUsers({
        page,
        perPage: SIGNUP_LIST_PAGE_SIZE,
      });
      if (error) return { ok: false, error: opaqueError("list", error) };
      const users = data?.users ?? [];
      for (const u of users) {
        // Hide admins from the queue: hash this user's phone with
        // PHONE_PEPPER and skip if it matches an is_admin waitlist row.
        if (u.phone && adminHashes.size > 0) {
          const phoneE164Plus = `+${u.phone}`;
          const userHash = hashPhone(phoneE164Plus);
          if (adminHashes.has(userHash)) continue;
        }
        collected.push(projectSignupRow(u));
      }
      if (users.length < SIGNUP_LIST_PAGE_SIZE) break;
    }

    // Apply filters in-memory. listUsers doesn't support metadata filters
    // server-side; with launch-cohort sizes (~10s of users) this is fine.
    // The `verified_only` filter maps to "phone_verified_at metadata is set"
    // which we fold into verification_status === 'verified'.
    let rows = collected;
    if (verified_only) {
      rows = rows.filter((r) => r.verification_status === "verified");
    }
    if (status !== "all") {
      rows = rows.filter((r) => r.admission_status === status);
    }
    if (q) {
      const needle = q.toLowerCase();
      rows = rows.filter((r) => {
        const hay = [
          r.first_name ?? "",
          r.home_city ?? "",
          r.destination_city ?? "",
          r.destination_uni ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(needle);
      });
    }

    rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
    rows = rows.slice(0, limit);
    return { ok: true, rows };
  } catch (err) {
    return { ok: false, error: opaqueError("list.catch", err) };
  }
}

export type SignupStatsResult = { ok: true; stats: AdminStats } | ActionError;

export async function getSignupStatsAction(): Promise<SignupStatsResult> {
  const gate = await requireAdmin();
  if (!gate) return { ok: false, error: "Not authorised." };

  try {
    // Same pagination as the list path; aggregates all rows once.
    const all: SignupRow[] = [];
    for (let page = 1; page <= SIGNUP_LIST_MAX_PAGES; page++) {
      const { data, error } = await gate.db.auth.admin.listUsers({
        page,
        perPage: SIGNUP_LIST_PAGE_SIZE,
      });
      if (error) return { ok: false, error: opaqueError("stats", error) };
      const users = data?.users ?? [];
      for (const u of users) all.push(projectSignupRow(u));
      if (users.length < SIGNUP_LIST_PAGE_SIZE) break;
    }

    const stats: AdminStats = {
      total: all.length,
      pending_review: all.filter((r) => r.admission_status === "pending_review").length,
      approved: all.filter((r) => r.admission_status === "approved").length,
      declined: all.filter((r) => r.admission_status === "declined").length,
      verified_phone: all.filter((r) => r.verification_status === "verified").length,
      identity_verified: all.filter((r) => r.identity_status === "verified").length,
    };
    return { ok: true, stats };
  } catch (err) {
    return { ok: false, error: opaqueError("stats.catch", err) };
  }
}

export type UpdateSignupAdmissionResult =
  | { ok: true; to_status: AdmissionStatus; from_status: AdmissionStatus }
  | ActionError;

export async function updateSignupAdmissionAction(
  input: UpdateSignupAdmissionInput,
): Promise<UpdateSignupAdmissionResult> {
  const gate = await requireAdmin();
  if (!gate) return { ok: false, error: "Not authorised." };

  const parsed = updateSignupAdmissionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { user_id, new_status, note } = parsed.data;

  try {
    // Read the current metadata so we can capture the from_status and
    // skip no-op writes.
    const { data: userRes, error: getErr } = await gate.db.auth.admin.getUserById(
      user_id,
    );
    if (getErr || !userRes?.user) {
      return { ok: false, error: opaqueError("getUser", getErr ?? "not found") };
    }
    const meta = (userRes.user.user_metadata ?? {}) as SignupMetadata;
    const fromStatus = (meta.admission_status ?? "pending_review") as AdmissionStatus;

    if (fromStatus === new_status) {
      return { ok: true, to_status: new_status, from_status: fromStatus };
    }

    const next: SignupMetadata = {
      ...meta,
      admission_status: new_status,
      admission_reviewed_at: new Date().toISOString(),
      admission_reviewed_by: gate.session.waitlist_id,
      admission_note: note ?? null,
    };

    const { error: updErr } = await gate.db.auth.admin.updateUserById(user_id, {
      user_metadata: next,
    });
    if (updErr) return { ok: false, error: opaqueError("updateUser", updErr) };

    return { ok: true, to_status: new_status, from_status: fromStatus };
  } catch (err) {
    return { ok: false, error: opaqueError("update.catch", err) };
  }
}

export async function getAdmissionHistoryAction(input: {
  target_id: string;
}): Promise<AdmissionHistoryResult> {
  const gate = await requireAdmin();
  if (!gate) return { ok: false, error: "Not authorised." };

  const id = z.string().uuid().safeParse(input.target_id);
  if (!id.success) return { ok: false, error: "Invalid id" };

  try {
    const [logRes, targetRes] = await Promise.all([
      gate.db
        .from("admission_audit_log")
        .select("id, target_id, admin_id, from_status, to_status, note, created_at")
        .eq("target_id", id.data)
        .order("created_at", { ascending: false })
        .limit(20),
      gate.db
        .from("waitlist")
        .select(
          "admission_note, admission_reviewed_at, admission_reviewed_by",
        )
        .eq("id", id.data)
        .maybeSingle(),
    ]);

    if (logRes.error) return { ok: false, error: opaqueError("history", logRes.error) };
    const baseEntries = (logRes.data ?? []) as AdmissionAuditLogRow[];

    // Resolve admin names in one batch so the caller sees "Aayush" not a UUID.
    const adminIds = Array.from(new Set(baseEntries.map((e) => e.admin_id)));
    const target = (targetRes.data as {
      admission_note: string | null;
      admission_reviewed_at: string | null;
      admission_reviewed_by: string | null;
    } | null) ?? null;
    if (target?.admission_reviewed_by) {
      adminIds.push(target.admission_reviewed_by);
    }

    let nameById: Record<string, string> = {};
    if (adminIds.length > 0) {
      const { data: admins } = await gate.db
        .from("waitlist")
        .select("id, first_name")
        .in("id", adminIds);
      nameById = Object.fromEntries(
        (admins ?? []).map((a) => [a.id as string, a.first_name as string]),
      );
    }

    const entries: AdmissionHistoryEntry[] = baseEntries.map((e) => ({
      ...e,
      admin_first_name: nameById[e.admin_id] ?? null,
    }));

    return {
      ok: true,
      entries,
      target,
      reviewer_first_name: target?.admission_reviewed_by
        ? (nameById[target.admission_reviewed_by] ?? null)
        : null,
    };
  } catch (err) {
    return { ok: false, error: opaqueError("history.catch", err) };
  }
}
