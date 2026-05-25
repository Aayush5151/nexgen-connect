-- 0009_parent_link.sql
--
-- Single-use, HMAC-signed magic links that a verified student emails to
-- their parent. The parent loads /parent/<token>, which calls
-- POST /api/parent-link/verify; that route HMAC-verifies, then atomically
-- UPDATEs used_at=now() WHERE used_at IS NULL — guaranteeing single-use.
--
-- We persist:
--   - SHA-256(token) as the lookup key (never plaintext)
--   - owner_id (the student) so we can fetch their snapshot
--   - expires_at (1h TTL, set at issue time)
--   - used_at (null until first verify, then set atomically)
--
-- Why server-side single-use even though the HMAC alone proves authenticity:
-- a parent who forwards their inbox to multiple recipients would otherwise
-- let everyone in. The DB row is the canonical "this token has been used."
--
-- Indexes:
--   - token_hash (unique) — the primary lookup key
--   - expires_at — for the cleanup cron (drops rows past TTL + 24h)

create table if not exists public.parent_link (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references auth.users(id) on delete cascade,
  token_hash   text not null unique,
  expires_at   timestamptz not null,
  used_at      timestamptz,
  created_at   timestamptz not null default now()
);

create index if not exists parent_link_expires_at_idx
  on public.parent_link (expires_at);

create index if not exists parent_link_owner_id_idx
  on public.parent_link (owner_id);

-- RLS: service-role only. The parent-link flow never runs in user context;
-- the API routes use the service-role client and enforce semantics in code.
alter table public.parent_link enable row level security;

-- Deny-all default policy. Service-role bypasses RLS, so the API works;
-- regular authenticated users (including the student who minted the token)
-- can never read parent_link rows directly — eliminates "leak token by
-- enumerating my own rows" as a concern.
create policy parent_link_deny_all on public.parent_link
  for all
  using (false)
  with check (false);

comment on table public.parent_link is
  'Single-use HMAC-signed magic links shared by students with parents. '
  'Lookup by SHA-256(token); single-use enforced via atomic UPDATE.';
