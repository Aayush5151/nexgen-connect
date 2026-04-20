import "server-only";

import { headers } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { hashIp, hashUserAgent } from "@/lib/hash";

/**
 * Verification audit log. Every state-changing identity event (DigiLocker
 * init, callback, rate-limit, failure) writes a row here with hashed IP +
 * UA. Audit failures never break the user flow - logged and swallowed.
 */

export type AuditAction =
  | "digilocker_init"
  | "digilocker_callback_ok"
  | "digilocker_callback_fail"
  | "digilocker_rate_limited"
  | "digilocker_state_invalid"
  | "digilocker_pkce_fail"
  | "digilocker_name_mismatch"
  | "digilocker_session_expired"
  | "verification_session_issued"
  | "verification_session_expired";

export async function writeAudit(params: {
  action: AuditAction;
  waitlist_id?: string | null;
  meta?: Record<string, unknown>;
}): Promise<void> {
  try {
    const hdrs = await headers();
    const ip =
      hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      hdrs.get("x-real-ip") ||
      "unknown";
    const ua = hdrs.get("user-agent") || "unknown";

    const db = getSupabaseAdmin();
    await db.from("verification_audit_log").insert({
      waitlist_id: params.waitlist_id ?? null,
      action: params.action,
      ip_hash: hashIp(ip),
      user_agent_hash: hashUserAgent(ua),
      meta: params.meta ?? {},
    });
  } catch (err) {
    // Do NOT throw from an audit write - the user flow must continue
    // even if we can't log. We only log to server console.
    console.error("[audit] write failed:", err);
  }
}
