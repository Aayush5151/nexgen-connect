-- Feedback table. Captures footer FAQ form submissions (questions,
-- feedback, bug reports). Kept intentionally minimal so the table can
-- absorb pre-launch noise without leaking PII beyond what the user types.
--
-- Shape aligns with the rest of the pre-launch tables: uuid primary
-- key, timestamptz insert time, a narrow referrer tag to know which
-- surface the submission came from.

create extension if not exists "pgcrypto";

create table if not exists public.feedback (
  id            uuid primary key default gen_random_uuid(),
  name          text null,
  email         text null,
  message       text not null,
  topic         text null,
  referrer      text null,
  user_agent    text null,
  created_at    timestamptz not null default now()
);

-- Hot path for the admin dashboard (most recent first).
create index if not exists feedback_created_at_idx
  on public.feedback (created_at desc);

-- RLS is always on; only the service role inserts / reads via the
-- server action in src/app/actions/feedback.ts.
alter table public.feedback enable row level security;
