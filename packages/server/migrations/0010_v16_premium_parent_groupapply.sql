-- 0010_v16_premium_parent_groupapply.sql
--
-- Bucket 8: monetisation + parent trust surface.
--
-- Three independent additions:
--   user_premium           — premium-flag row, written by Razorpay webhook
--   parent_link            — single-use magic-links to /parent/[token]
--   group_apply            — 3..6-member shared housing application
--   y6_arrival             — arrival check-in row, drives parent notification
--
-- v16 web pivot §Bucket 8.

-- ---------------------------------------------------------------------
-- Premium
-- ---------------------------------------------------------------------
create type premium_status as enum ('active', 'refunded', 'pending');

create table if not exists user_premium (
  user_id uuid primary key,
  status premium_status not null default 'pending',
  razorpay_order_id text not null,
  razorpay_payment_id text,
  amount_paise int not null check (amount_paise = 99900),
  currency text not null default 'INR' check (currency = 'INR'),
  paid_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists user_premium_status on user_premium(status);

alter table user_premium enable row level security;
create policy user_premium_self_read on user_premium
  for select to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- Parent magic-link
-- ---------------------------------------------------------------------
-- Stores ONLY the SHA-256 of the token. The token itself only ever
-- lives in the email body. Single-use enforcement: setting `used_at`
-- to now() is the lookup gate; subsequent reads return rows where
-- used_at IS NULL AND expires_at > now().
create table if not exists parent_link (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  parent_email text not null,
  created_at timestamptz not null default now()
);
create index if not exists parent_link_token_hash on parent_link(token_hash);
create index if not exists parent_link_owner on parent_link(owner_user_id, created_at desc);

alter table parent_link enable row level security;
-- Service-role only — the parent magic-link surface verifies tokens
-- via the API route (server-side), and the student doesn't read this
-- table directly. They get freshness via /app/profile/parent UI.

-- ---------------------------------------------------------------------
-- Group apply
-- ---------------------------------------------------------------------
create type group_apply_status as enum (
  'forming',     -- members joining
  'submitted',   -- bundle sent to PBSA partner
  'offered',     -- partner offered housing
  'rejected',    -- partner declined
  'cancelled'
);
create type pbsa_partner as enum ('aparto', 'yugo', 'fresh', 'mezzino');

create table if not exists group_apply (
  id uuid primary key default gen_random_uuid(),
  partner_slug pbsa_partner not null,
  status group_apply_status not null default 'forming',
  group_size int not null check (group_size between 3 and 6),
  created_by uuid not null,
  created_at timestamptz not null default now(),
  submitted_at timestamptz,
  offered_at timestamptz,
  rejected_at timestamptz,
  partner_response jsonb
);

create table if not exists group_apply_member (
  group_id uuid not null references group_apply(id) on delete cascade,
  user_id uuid not null,
  role text not null default 'member' check (role in ('lead', 'member')),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);
create index if not exists group_apply_member_user on group_apply_member(user_id);

alter table group_apply enable row level security;
alter table group_apply_member enable row level security;

create policy group_apply_member_read on group_apply
  for select to authenticated
  using (exists (
    select 1 from group_apply_member m
    where m.group_id = id and m.user_id = auth.uid()
  ));

create policy group_apply_member_self_read on group_apply_member
  for select to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- Y6 arrival check-in
-- ---------------------------------------------------------------------
create type arrival_status as enum (
  'scheduled',   -- student set the time, parent NOT yet notified
  'arrived',     -- student tapped "I'm here", parent notified
  'cancelled'
);

create table if not exists y6_arrival (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  airport text,
  scheduled_at timestamptz not null,
  status arrival_status not null default 'scheduled',
  arrived_at timestamptz,
  parent_notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists y6_arrival_user on y6_arrival(user_id, scheduled_at desc);

alter table y6_arrival enable row level security;
create policy y6_arrival_self on y6_arrival
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
