-- 0006_email_waitlist.sql
--
-- Lightweight pre-launch email waitlist used by the public marketing
-- site's "Notify me when the app launches" form. Separate from the
-- full `waitlist` table which captures phone + DigiLocker verified
-- signups; this one is a simple name/no-name email collector.
--
-- Schema:
--   id          uuid primary key, default gen_random_uuid()
--   email       citext not null unique (case-insensitive)
--   referrer    text null — which CTA they submitted from (hero/final/mobile)
--   created_at  timestamptz not null, default now()
--
-- RLS: enabled. No public insert — the row is written via a service-role
-- server action on the backend. Public read is disabled too; only the
-- admin dashboard (service-role) reads totals.

create extension if not exists "citext";

create table if not exists public.email_waitlist (
  id          uuid primary key default gen_random_uuid(),
  email       citext not null unique,
  referrer    text null,
  created_at  timestamptz not null default now()
);

create index if not exists email_waitlist_created_at_idx
  on public.email_waitlist (created_at desc);

alter table public.email_waitlist enable row level security;

-- Deny everything from anon/authenticated — only service_role touches this
-- table. The service-role key bypasses RLS in Supabase.
revoke all on public.email_waitlist from anon, authenticated;
