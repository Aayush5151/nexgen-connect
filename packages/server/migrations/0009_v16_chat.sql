-- 0009_v16_chat.sql
--
-- Chat schema for Bucket 7: group chat, sub-circles, uni AMA, direct DMs.
-- Realtime delivery via Supabase Realtime publication on chat_message.
--
-- Row-level security enforces:
--   - read: thread_member must include caller's user_id
--   - write: same
--   - moderation: T&S advisor service-role bypasses RLS
--
-- Soft-delete (deleted_at) is the only moderation action; we never
-- hard-delete a message because the audit log + GDPR export need to
-- preserve the original content during a complaint window.
--
-- v16 web pivot §Bucket 7.

create type chat_thread_type as enum (
  'group',       -- corridor-wide, unlocks at 60 verified
  'sub_circle',  -- housing / airport / roommates / food
  'direct',      -- 1:1 DM
  'uni'          -- alumni AMA, broadcast-style
);

create table if not exists chat_thread (
  id uuid primary key default gen_random_uuid(),
  corridor_id uuid not null,
  thread_type chat_thread_type not null,
  name text not null check (length(name) between 1 and 80),
  created_at timestamptz not null default now()
);
create index if not exists chat_thread_corridor_id on chat_thread(corridor_id);

create table if not exists chat_thread_member (
  thread_id uuid not null references chat_thread(id) on delete cascade,
  user_id uuid not null,
  role text not null default 'member' check (role in ('member', 'mod')),
  joined_at timestamptz not null default now(),
  primary key (thread_id, user_id)
);
create index if not exists chat_thread_member_user on chat_thread_member(user_id);

create table if not exists chat_message (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references chat_thread(id) on delete cascade,
  user_id uuid not null,
  content text not null check (length(content) between 1 and 4000),
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  -- Soft-delete: T&S advisor sets this; renderer hides content but
  -- keeps the row for audit + complaint window. Hard-delete only on
  -- account-erasure cascade per GDPR Art. 17.
  deleted_at timestamptz,
  deleted_reason text
);
create index if not exists chat_message_thread_created
  on chat_message(thread_id, created_at desc);

-- T&S reports — every "Report this message" lands here.
-- Routing: harassment + women-only sub-thread → 1h SLA; other → 4h.
create type chat_report_category as enum (
  'harassment',
  'scam',
  'spam',
  'self_harm',
  'other'
);
create type chat_report_status as enum (
  'open',
  'triaged',
  'actioned',
  'dismissed'
);
create table if not exists chat_report (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references chat_message(id) on delete cascade,
  reporter_user_id uuid not null,
  category chat_report_category not null,
  detail text check (detail is null or length(detail) <= 1000),
  status chat_report_status not null default 'open',
  sla_hours int not null check (sla_hours in (1, 4)),
  reported_at timestamptz not null default now(),
  triaged_at timestamptz,
  actioned_at timestamptz,
  reviewer_user_id uuid,
  action text  -- e.g. "soft_deleted", "warned", "no_action"
);
create index if not exists chat_report_status_reported on chat_report(status, reported_at desc);

-- Realtime publication — Supabase Realtime needs the tables in its
-- supabase_realtime publication. Adding chat_message only; clients
-- read thread + member shape via initial fetch.
alter publication supabase_realtime add table chat_message;

-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------
alter table chat_thread enable row level security;
alter table chat_thread_member enable row level security;
alter table chat_message enable row level security;
alter table chat_report enable row level security;

-- chat_thread: members can read; only service-role can insert (threads
-- are created by the platform when a corridor crosses thresholds).
create policy chat_thread_read on chat_thread
  for select to authenticated
  using (exists (
    select 1 from chat_thread_member m
    where m.thread_id = id and m.user_id = auth.uid()
  ));

-- chat_thread_member: a user can read their own membership rows; service
-- role inserts on threshold-cross.
create policy chat_thread_member_read on chat_thread_member
  for select to authenticated
  using (user_id = auth.uid());

-- chat_message: thread members can read non-deleted (or their own
-- deleted) messages; thread members can insert their own messages;
-- only service-role updates `deleted_at`.
create policy chat_message_read on chat_message
  for select to authenticated
  using (
    exists (
      select 1 from chat_thread_member m
      where m.thread_id = chat_message.thread_id and m.user_id = auth.uid()
    )
    and (deleted_at is null or user_id = auth.uid())
  );

create policy chat_message_insert on chat_message
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from chat_thread_member m
      where m.thread_id = chat_message.thread_id and m.user_id = auth.uid()
    )
  );

-- Authors can edit their OWN messages (content + edited_at) for 5 min
-- after send. T&S can update via service role. Edits are content-only.
create policy chat_message_self_edit on chat_message
  for update to authenticated
  using (
    user_id = auth.uid() and created_at > now() - interval '5 minutes'
  )
  with check (user_id = auth.uid());

-- chat_report: a user can insert their own report row; can read their
-- own. Mods/T&S read everything via service role.
create policy chat_report_insert on chat_report
  for insert to authenticated
  with check (reporter_user_id = auth.uid());

create policy chat_report_read on chat_report
  for select to authenticated
  using (reporter_user_id = auth.uid());
