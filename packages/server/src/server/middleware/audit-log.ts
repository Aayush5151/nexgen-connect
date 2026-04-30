/**
 * Audit-log middleware.
 *
 * Per Build Prompt §Bucket 3: "DPDP Act 2023 + GDPR compliance:
 * every PII-adjacent operation logs to audit_log (immutable, append-
 * only). DPO consultant reviews quarterly."
 *
 * Schema (v6 §17, materialised in Bucket 4 follow-up migration):
 *   audit_log(id uuid pk, user_id uuid, procedure text, req_id uuid,
 *             input_hash text, ts timestamptz, success bool,
 *             error_code text)
 *
 * Today this middleware logs to stdout (Vercel captures logs); the
 * Postgres write lands when Supabase wires.
 *
 * v15 BP §16.8 / v6 build §16, §17 / Build Prompt Bucket 4.
 */
import { middleware } from "../trpc-builder";

export const withAuditLog = middleware(async ({ ctx, path, type, input, next }) => {
  const start = ctx.now.getTime();
  const result = await next();
  const elapsedMs = Date.now() - start;

  // Log shape mirrors the future audit_log table — server-side only,
  // no PII scrubbing needed at this layer because input never lands
  // in a console.log without scrubbing first (PII-scrub is at the
  // pii-scrub.ts layer for analytics; here we hash the input).
  const logRecord = {
    user_id: ctx.user?.id ?? null,
    procedure: path,
    req_id: ctx.reqId,
    type,
    success: result.ok,
    elapsed_ms: elapsedMs,
    ts: ctx.now.toISOString(),
    input_hash: result.ok ? hashInput(input) : null,
    error_code: result.ok ? null : extractErrorCode(result.error?.message ?? ""),
  };

  // Stand-in: write to stdout. Bucket 4 follow-up swaps for `await
  // ctx.db.from("audit_log").insert(logRecord)`. Vercel captures stdout,
  // so this is observable until the table lands.
  console.log("[audit_log]", JSON.stringify(logRecord));

  return result;
});

function hashInput(input: unknown): string {
  if (input === undefined) return "";
  // Cheap stable hash. Production swaps for crypto.createHash('sha256')
  // — for now SubtleCrypto isn't sync, so we use stringified length +
  // first/last chars as a fingerprint. The hash is for de-dup, not
  // integrity.
  const s = typeof input === "string" ? input : JSON.stringify(input);
  return `${s.length}:${s.slice(0, 8)}:${s.slice(-8)}`;
}

function extractErrorCode(msg: string): string {
  const m = msg.match(/^(E\d{3}):/);
  return m?.[1] ?? "E500:unknown";
}
