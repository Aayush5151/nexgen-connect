/**
 * Audit-log middleware — writes to real `audit_log` table (Supabase)
 * when ctx.db is wired; falls back to stdout when not.
 *
 * v16 web pivot §3.2 + GDPR Art. 5(2) accountability + DPDP §10. Every
 * authed procedure call writes one row.
 *
 * Schema lives in:
 *   - 0001_v5_baseline.sql — original v15 audit_log table
 *   - 0006_audit_log_v16.sql — adds ip_hash, input_summary jsonb,
 *     output_status. Backward-compatible: existing v15 columns
 *     preserved.
 *
 * PII handling: input_summary is the input value passed through a
 * shallow PII scrubber (drops fields named `phone`, `email`, `name`,
 * `password`, `aadhaar*`, `otp`, `token`). The full input is never
 * written.
 *
 * v16 web pivot §3.2.
 */
import { middleware } from "../trpc-builder";

const PII_KEYS = new Set([
  "phone",
  "phoneE164",
  "email",
  "name",
  "firstName",
  "lastName",
  "fullName",
  "password",
  "passwd",
  "otp",
  "code",
  "token",
  "sessionToken",
  "refreshToken",
  "aadhaar",
  "aadhaarVid",
  "vid",
  "admit",
  "admitLetter",
]);

/** Shallow PII scrub — drops known-PII keys at the top level + 1
 *  level deep. Deeper structures get summarised as `{ depth_limit }`. */
export function scrubInput(input: unknown, depth = 0): unknown {
  if (depth > 1) return "[depth_limit]";
  if (input == null || typeof input !== "object") return input;
  if (Array.isArray(input)) {
    return input.length > 50 ? `[array length=${input.length}]` : input.map((v) => scrubInput(v, depth + 1));
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (PII_KEYS.has(k)) {
      out[k] = "[redacted]";
      continue;
    }
    out[k] = scrubInput(v, depth + 1);
  }
  return out;
}

export const withAuditLog = middleware(async ({ ctx, path, type, input, next }) => {
  const start = ctx.now.getTime();
  const result = await next();
  const elapsedMs = Date.now() - start;

  const record = {
    user_id: ctx.user?.id ?? null,
    procedure: path,
    req_id: ctx.reqId,
    request_id: ctx.reqId,
    type,
    success: result.ok,
    elapsed_ms: elapsedMs,
    duration_ms: elapsedMs,
    output_status: result.ok ? "ok" : "error",
    ts: ctx.now.toISOString(),
    input_hash: result.ok ? hashInput(input) : null,
    input_summary: result.ok ? scrubInput(input) : null,
    error_code: result.ok ? null : extractErrorCode(result.error?.message ?? ""),
    ip_hash: ctx.ipHash ?? null,
  };

  // Real DB write when ctx.db is wired (post-Bucket-3-followup
  // Supabase client wiring); otherwise stdout fallback so v15 + dev
  // behaviour is preserved.
  if (ctx.db && typeof (ctx.db as { auditLogInsert?: (r: unknown) => Promise<void> }).auditLogInsert === "function") {
    try {
      await (ctx.db as { auditLogInsert: (r: unknown) => Promise<void> }).auditLogInsert(record);
    } catch (e) {
      // Audit-log write failure is logged but does not propagate —
      // the request continues. Compliance writes are non-blocking by
      // design; missing rows are caught by the quarterly audit
      // reconciliation job.
      console.error("[audit_log] insert failed:", e instanceof Error ? e.message : String(e));
    }
  } else {
    console.log("[audit_log]", JSON.stringify(record));
  }

  return result;
});

function hashInput(input: unknown): string {
  if (input === undefined) return "";
  const s = typeof input === "string" ? input : JSON.stringify(input);
  return `${s.length}:${s.slice(0, 8)}:${s.slice(-8)}`;
}

function extractErrorCode(msg: string): string {
  const m = msg.match(/^(E\d{3}):/);
  return m?.[1] ?? "E500:unknown";
}
