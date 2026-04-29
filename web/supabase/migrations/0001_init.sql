-- NexGen Connect V3 — initial schema
-- Ireland launch: UCD, Trinity, UCC · Sept 2026 intake

create extension if not exists "uuid-ossp";

-- ===========================================================================
-- waitlist
-- ===========================================================================
create table public.waitlist (
  id uuid primary key default uuid_generate_v4(),
  phone_hash text not null unique,
  first_name text not null,
  home_city text not null,
  destination_university text not null
    check (destination_university in ('UCD', 'Trinity', 'UCC')),
  intake text not null default 'Sept 2026',
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified', 'pending', 'verified', 'rejected')),
  admit_letter_url text,
  consent_version text not null,
  email_hash text,
  created_at timestamptz not null default now(),
  verified_at timestamptz
);

create index waitlist_cohort_idx
  on public.waitlist (destination_university, home_city);

create index waitlist_created_at_idx
  on public.waitlist (created_at desc);

create index waitlist_status_idx
  on public.waitlist (verification_status);

-- ===========================================================================
-- otp_codes (ephemeral)
-- ===========================================================================
create table public.otp_codes (
  id uuid primary key default uuid_generate_v4(),
  phone_hash text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  consumed boolean not null default false,
  created_at timestamptz not null default now()
);

create index otp_codes_phone_idx
  on public.otp_codes (phone_hash, expires_at desc);

-- ===========================================================================
-- Row Level Security — default deny for anon/authenticated.
-- All writes go through service role via server actions / route handlers.
-- ===========================================================================
alter table public.waitlist enable row level security;
alter table public.otp_codes enable row level security;

create policy "waitlist_deny_anon"
  on public.waitlist
  for all
  to anon, authenticated
  using (false)
  with check (false);

create policy "otp_deny_anon"
  on public.otp_codes
  for all
  to anon, authenticated
  using (false)
  with check (false);

-- ===========================================================================
-- RPCs — publicly callable, return only aggregates / non-PII fields.
-- ===========================================================================

-- Cohort count for a given (home_city, destination_university).
create or replace function public.get_cohort_count(
  p_home_city text,
  p_destination_university text
)
returns int
language sql
security definer
set search_path = public
as $$
  select count(*)::int
  from public.waitlist
  where home_city ilike p_home_city
    and destination_university = p_destination_university
    and verification_status in ('verified', 'pending');
$$;

-- Total waitlist size (verified + pending).
create or replace function public.get_total_waitlist()
returns int
language sql
security definer
set search_path = public
as $$
  select count(*)::int
  from public.waitlist
  where verification_status in ('verified', 'pending');
$$;

-- Recent activity (first name + city + uni + timestamp — no phone, no email).
create or replace function public.get_recent_activity(p_limit int default 5)
returns table (
  first_name text,
  home_city text,
  destination_university text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select first_name, home_city, destination_university, created_at
  from public.waitlist
  where verification_status in ('verified', 'pending')
  order by created_at desc
  limit greatest(1, least(p_limit, 20));
$$;

-- Per-university totals for the Ireland map.
create or replace function public.get_map_cohort_breakdown()
returns table (
  destination_university text,
  cohort_size int
)
language sql
security definer
set search_path = public
as $$
  select destination_university, count(*)::int as cohort_size
  from public.waitlist
  where verification_status in ('verified', 'pending')
  group by destination_university;
$$;

grant execute on function public.get_cohort_count(text, text) to anon, authenticated;
grant execute on function public.get_total_waitlist() to anon, authenticated;
grant execute on function public.get_recent_activity(int) to anon, authenticated;
grant execute on function public.get_map_cohort_breakdown() to anon, authenticated;

-- ===========================================================================
-- Storage — admit-letters bucket (private; service role only).
-- ===========================================================================
insert into storage.buckets (id, name, public)
values ('admit-letters', 'admit-letters', false)
on conflict (id) do nothing;

create policy "admit_letters_deny_anon"
  on storage.objects
  for all
  to anon, authenticated
  using (bucket_id <> 'admit-letters')
  with check (bucket_id <> 'admit-letters');
