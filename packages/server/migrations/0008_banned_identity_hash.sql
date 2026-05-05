-- 0008_banned_identity_hash — identity-tied bans.
--
-- v15 BP §9.1 + L6 + v16 web pivot §3.1. Re-registration ban anchored
-- on the composite identity hash, NOT on phone or email. A banned
-- user who buys a new SIM and signs up again will hash to the same
-- composite (name + DOB-month + new-phone-hash + admit_HEI +
-- IDENTITY_PEPPER) — which is in this table — and the auth.requestOtp
-- procedure refuses to issue an OTP.
--
-- The pepper-rotation defence: when IDENTITY_PEPPER rotates, all
-- existing rows in this table become "stale." The lookup function
-- iterates over current + ROTATED_IDENTITY_PEPPERS to check membership.
-- See packages/server/src/server/lib/identity-hash.ts ::
-- computeAllIdentityHashes() for the lookup contract.
--
-- v16 web pivot §3.1.

create table banned_identity_hash (
  -- The composite identity hash, exact match. Primary key — no
  -- duplicates. 64 chars hex (sha256).
  hash text primary key check (hash ~ '^[0-9a-f]{64}$'),
  -- Why the ban exists. Free-text, set by Trust & Safety advisor or
  -- auto-cascade. Keep it short — this is internal, not user-facing.
  reason text not null,
  -- Who banned (T&S advisor uid) or 'system' for auto-cascade.
  banned_by text not null,
  -- When the ban took effect.
  banned_at timestamptz not null default now(),
  -- Optional unban timestamp. Null = permanent. The lookup function
  -- ignores rows with unbanned_at < now().
  unbanned_at timestamptz,
  -- Optional metadata — e.g., the ts_incident.id that caused the ban,
  -- or the harassment-pattern tag.
  metadata jsonb
);

-- Service-role only. Authenticated users have no business reading
-- this table.
alter table banned_identity_hash enable row level security;
-- (No policies defined → all access denied except via service role.)

-- Bonus: index on banned_by for "show me all bans by this advisor"
-- queries (used by T&S compliance review).
create index banned_identity_hash_banned_by_at
  on banned_identity_hash (banned_by, banned_at desc);
