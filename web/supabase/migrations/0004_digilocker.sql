-- DigiLocker (Aadhaar) identity verification.
--
-- Data minimisation: we NEVER persist the raw Aadhaar number. We store only
-- the last 4 digits (legal under UIDAI circulars) and a SHA256 hash of the
-- DigiLocker reference key, peppered so rainbow-table attacks are infeasible.
--
-- Flow:
--   1. User completes phone OTP  → waitlist.verification_status = 'verified'
--   2. Server issues signed session cookie                 (SESSION_SECRET)
--   3. User visits /verify/digilocker, accepts consent
--   4. startDigiLockerAction() creates a digilocker_sessions row (state + nonce,
--      PKCE verifier held in per-state httpOnly cookie)
--   5. Government redirects back to /api/digilocker/callback?code&state
--   6. Handler exchanges code + updates waitlist.identity_status

-- ===========================================================================
-- waitlist: new identity fields
-- ===========================================================================
alter table public.waitlist
  add column digilocker_verified_at timestamptz,
  add column digilocker_reference_id text,
  add column aadhaar_last4 text check (aadhaar_last4 ~ '^[0-9]{4}$'),
  add column aadhaar_name_match boolean,
  add column identity_status text not null default 'unverified'
    check (identity_status in ('unverified', 'pending', 'verified', 'failed'));

create index waitlist_identity_status_idx
  on public.waitlist (identity_status);

-- Unique constraint on the hashed reference prevents the same Aadhaar from
-- being used to "verify" two different waitlist rows.
create unique index waitlist_digilocker_ref_uniq
  on public.waitlist (digilocker_reference_id)
  where digilocker_reference_id is not null;

-- ===========================================================================
-- digilocker_sessions — ephemeral OAuth state (mirrors otp_codes pattern)
-- ===========================================================================
create table public.digilocker_sessions (
  id uuid primary key default uuid_generate_v4(),
  waitlist_id uuid not null references public.waitlist(id) on delete cascade,
  state text not null unique,
  nonce text not null,
  consumed boolean not null default false,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index digilocker_sessions_waitlist_idx
  on public.digilocker_sessions (waitlist_id, created_at desc);

create index digilocker_sessions_expires_idx
  on public.digilocker_sessions (expires_at);

alter table public.digilocker_sessions enable row level security;

create policy "digilocker_sessions_deny_anon"
  on public.digilocker_sessions
  for all
  to anon, authenticated
  using (false)
  with check (false);

-- ===========================================================================
-- verification_audit_log — forensic trail for identity events
-- ===========================================================================
create table public.verification_audit_log (
  id uuid primary key default uuid_generate_v4(),
  waitlist_id uuid references public.waitlist(id) on delete set null,
  action text not null,
  ip_hash text,
  user_agent_hash text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_waitlist_idx
  on public.verification_audit_log (waitlist_id, created_at desc);

create index audit_action_idx
  on public.verification_audit_log (action, created_at desc);

alter table public.verification_audit_log enable row level security;

create policy "audit_deny_anon"
  on public.verification_audit_log
  for all
  to anon, authenticated
  using (false)
  with check (false);

-- ===========================================================================
-- Rate limit: cap DigiLocker inits per waitlist to 3 per 10 minutes
-- (same shape as count_recent_otp_requests in 0002).
-- ===========================================================================
create or replace function public.count_recent_digilocker_inits(p_waitlist_id uuid)
returns int
language sql
security definer
set search_path = public
as $$
  select count(*)::int
  from public.digilocker_sessions
  where waitlist_id = p_waitlist_id
    and created_at > now() - interval '10 minutes';
$$;

grant execute on function public.count_recent_digilocker_inits(uuid)
  to anon, authenticated;

-- ===========================================================================
-- Daily cleanup of expired OAuth sessions (schedule alongside OTP cleanup).
-- ===========================================================================
create or replace function public.cleanup_expired_digilocker_sessions()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted int;
begin
  delete from public.digilocker_sessions
  where expires_at < now() - interval '24 hours';
  get diagnostics deleted = row_count;
  return deleted;
end;
$$;

grant execute on function public.cleanup_expired_digilocker_sessions()
  to service_role;

-- ===========================================================================
-- Per-university identity counts — surfaces on the map once DigiLocker is live.
-- ===========================================================================
create or replace function public.get_identity_verified_count()
returns int
language sql
security definer
set search_path = public
as $$
  select count(*)::int
  from public.waitlist
  where identity_status = 'verified';
$$;

grant execute on function public.get_identity_verified_count() to anon, authenticated;
