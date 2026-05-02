-- 0006_audit_log_v16 — add v16 columns to the existing audit_log table.
--
-- Backward-compatible: existing v15 columns (req_id, type, success,
-- elapsed_ms, input_hash, error_code) preserved. New columns:
--   ip_hash       — sha256(IP_HASH_PEPPER || request-ip). Plain IP
--                   never stored. Used for rate-limit + anomaly
--                   detection.
--   input_summary — jsonb, PII-scrubbed shallow copy of the procedure
--                   input. Replaces the input_hash fingerprint with
--                   something queryable (e.g. find all auth.requestOtp
--                   calls with country=IN where success=false).
--   output_status — "ok" | "error" | "rate_limited". Easier to query
--                   than the success boolean.
--   request_id    — alias for req_id; v16 spec uses this name. Keep
--                   both for backward compat.
--
-- Indexes:
--   audit_log_user_id_ts (existing) — unchanged
--   audit_log_procedure_ts (existing) — unchanged
--   audit_log_ip_hash_ts (new) — anomaly detection by IP cluster
--
-- v16 web pivot §3.2 / Bucket 3.

alter table audit_log
  add column if not exists ip_hash text,
  add column if not exists input_summary jsonb,
  add column if not exists output_status text,
  add column if not exists request_id text;

create index if not exists audit_log_ip_hash_ts
  on audit_log (ip_hash, ts desc)
  where ip_hash is not null;

-- Per Privacy Policy §3 — audit_log is retained per legal obligation
-- (typically 6 years for financial records, 3 years for general). The
-- account-erasure cascade (0007_erasure_request) replaces user_id with
-- a deletion-token instead of deleting rows; the consent + audit
-- trail is itself a compliance artefact.
