-- Web Push subscriptions. Backs the chat / SLA push-fanout Inngest job
-- and the /app PWA's "we'll ping you when something needs your eyes"
-- signal. Stored per (user_id, endpoint) — a single user can have
-- multiple devices subscribed.
--
-- Auth model: user inserts/updates their own row via /api/push/subscribe
-- (SSR auth gate). The service role reads rows during fan-out via
-- web/src/lib/inngest/jobs/push-fanout.ts.
--
-- v16 web pivot Bucket 4 follow-up (P4 work) / Bucket 7+8 wiring.

create extension if not exists "pgcrypto";

create table if not exists public.push_subscription (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  endpoint      text not null,
  -- The two keys the Push API hands back: P-256 ECDH public key and the
  -- shared auth secret. Both are required to encrypt + sign the push
  -- payload server-side; without them we cannot deliver. Stored as text
  -- (base64url) since that's the wire format from the browser.
  p256dh        text not null,
  auth          text not null,
  -- Optional UA hint so a future "you have N devices subscribed"
  -- account screen can show meaningful labels. Truncated server-side.
  user_agent    text null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- Marked when web-push returns a 404/410 (subscription expired). The
  -- fan-out job soft-deletes by setting last_failure_at; a separate
  -- cleanup job (TODO) hard-deletes after 30d to keep the table small.
  last_failure_at  timestamptz null,
  last_failure_code int null,

  -- A user shouldn't be able to register the same endpoint twice. The
  -- endpoint URL is unique-per-device per the Push API spec.
  constraint push_subscription_user_endpoint_uniq unique (user_id, endpoint)
);

create index if not exists push_subscription_user_idx
  on public.push_subscription (user_id);

create index if not exists push_subscription_active_idx
  on public.push_subscription (user_id)
  where last_failure_at is null;

-- updated_at trigger so the fan-out job can see "last seen healthy".
create or replace function public.push_subscription_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists push_subscription_updated_at on public.push_subscription;
create trigger push_subscription_updated_at
before update on public.push_subscription
for each row
execute function public.push_subscription_set_updated_at();

-- RLS: only the service role reads / mutates. The /api/push/subscribe
-- route uses the service-role admin client (the SSR-auth'd user is the
-- subject, not the actor). Direct client-side inserts are rejected.
alter table public.push_subscription enable row level security;
