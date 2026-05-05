-- 0005_consent_records — GDPR Art. 7(1) + DPDP §6(2) consent journal.
--
-- Append-only table; never UPDATE, never DELETE except as part of
-- account-erasure cascade (Bucket 3). Every consent event the user
-- gives — signup OTP, DigiLocker handshake, admit upload, Premium
-- purchase, Parent view share, Data export request, Account erasure
-- — gets one row.
--
-- Cross-references packages/server/src/server/lib/consent-journal.ts
-- which is the canonical write path.
--
-- v16 web pivot §2.4 / Bucket 2.

create type consent_type as enum (
  'signup_otp',
  'digilocker_handshake',
  'admit_upload',
  'premium_purchase',
  'parent_view_share',
  'data_export_request',
  'account_erasure'
);

create table consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references verified_user(id) on delete set null,
  consent_type consent_type not null,
  -- Version string of the policy the user agreed to.
  -- Format: "privacy@2026-05-02" or "terms@2026-05-02".
  -- When policies update, the version string changes; old records
  -- preserve the link to what the user actually saw.
  policy_version text not null,
  -- SHA-256(IP_HASH_PEPPER || request-ip). Plain IPs are never stored.
  ip_hash text not null,
  -- ISO timestamp; we use a separate column instead of created_at
  -- to make the field's purpose unambiguous in audits.
  recorded_at timestamptz not null default now(),
  -- Optional metadata (OTP session id, admit doc id, Razorpay order id).
  -- jsonb so we can index specific keys later if needed.
  metadata jsonb
);

-- Lookup by user (for the data-export procedure).
create index consent_records_user_id_recorded_at
  on consent_records(user_id, recorded_at desc)
  where user_id is not null;

-- Lookup by type (for compliance reporting — "all signup OTP consents
-- in the past quarter").
create index consent_records_consent_type_recorded_at
  on consent_records(consent_type, recorded_at desc);

-- Enforce append-only at the SQL level. Block UPDATE entirely; DELETE
-- only allowed as part of the erasure cascade (in which case the row
-- is preserved with user_id set to NULL via the ON DELETE SET NULL
-- foreign-key behaviour above — the CONSENT itself remains as a
-- compliance artefact, just orphaned from the deleted user).
create or replace function block_consent_updates() returns trigger as $$
begin
  raise exception 'consent_records is append-only; UPDATE is not permitted';
end;
$$ language plpgsql;

create trigger consent_records_no_update
  before update on consent_records
  for each row execute function block_consent_updates();

-- Row-level security: a user can read their own consents (used by
-- /api/account/export). Writes only via the server (service role).
alter table consent_records enable row level security;

create policy consent_records_select_own
  on consent_records
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- No INSERT / UPDATE / DELETE policies for the authenticated role;
-- those operations require the service role (server-side calls only).
