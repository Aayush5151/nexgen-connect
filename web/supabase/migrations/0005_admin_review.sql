-- Admin review + admission status
--
-- Adds the founder/admin loop. A waitlist row goes:
--   verification_status:      unverified → pending → verified   (phone/OTP)
--   admission_status:         pending_review → approved|declined (human review)
--
-- An "admin" is any waitlist row with is_admin = true. Bootstrap by running
-- once in the Supabase SQL editor against your own row, e.g.:
--     update public.waitlist
--        set is_admin = true
--      where phone_hash = '<your hash from hashPhone(+91…)>';
--
-- The admin session cookie `ngc_admin` is issued only after a phone OTP
-- succeeds AND the resulting waitlist.is_admin is true. The DB also enforces
-- this: admission mutations run through the service-role key, but every
-- server action re-checks is_admin before calling them.

alter table public.waitlist
  add column if not exists is_admin boolean not null default false,
  add column if not exists admission_status text not null default 'pending_review'
    check (admission_status in ('pending_review', 'approved', 'declined')),
  add column if not exists admission_reviewed_at timestamptz,
  add column if not exists admission_reviewed_by uuid references public.waitlist(id),
  add column if not exists admission_note text;

create index if not exists waitlist_admission_idx
  on public.waitlist (admission_status, created_at desc);

create index if not exists waitlist_is_admin_idx
  on public.waitlist (is_admin)
  where is_admin = true;

-- ===========================================================================
-- admission_audit_log
-- Every approve/decline writes a row. Immutable from the app side.
-- ===========================================================================
create table if not exists public.admission_audit_log (
  id uuid primary key default uuid_generate_v4(),
  target_id uuid not null references public.waitlist(id) on delete cascade,
  admin_id uuid not null references public.waitlist(id) on delete restrict,
  from_status text not null,
  to_status text not null
    check (to_status in ('pending_review', 'approved', 'declined')),
  note text,
  created_at timestamptz not null default now()
);

create index if not exists admission_audit_target_idx
  on public.admission_audit_log (target_id, created_at desc);

create index if not exists admission_audit_admin_idx
  on public.admission_audit_log (admin_id, created_at desc);

alter table public.admission_audit_log enable row level security;

create policy "admission_audit_deny_anon"
  on public.admission_audit_log
  for all
  to anon, authenticated
  using (false)
  with check (false);

-- ===========================================================================
-- RPC: is_admin_hash
-- Cheap server-side check. Returns true iff there's a verified waitlist row
-- with that phone_hash AND is_admin = true. Exposed to authenticated (not
-- anon) so the admin-login server action can use it via the service role;
-- called with the service key it always succeeds regardless of the grant.
-- ===========================================================================
create or replace function public.is_admin_hash(p_phone_hash text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.waitlist
    where phone_hash = p_phone_hash
      and is_admin = true
      and verification_status = 'verified'
  );
$$;

grant execute on function public.is_admin_hash(text) to service_role;

-- ===========================================================================
-- RPC: admin_stats
-- Dashboard headline numbers in one round-trip. Safe for admin eyes only —
-- the service-role call path is the gate.
-- ===========================================================================
create or replace function public.admin_stats()
returns table (
  total int,
  pending_review int,
  approved int,
  declined int,
  verified_phone int,
  identity_verified int
)
language sql
security definer
set search_path = public
as $$
  select
    count(*)::int                                                  as total,
    count(*) filter (where admission_status = 'pending_review')::int as pending_review,
    count(*) filter (where admission_status = 'approved')::int        as approved,
    count(*) filter (where admission_status = 'declined')::int        as declined,
    count(*) filter (where verification_status = 'verified')::int     as verified_phone,
    count(*) filter (where identity_status = 'verified')::int         as identity_verified
  from public.waitlist
  where is_admin = false;
$$;

grant execute on function public.admin_stats() to service_role;
