-- 0001_v5_baseline — v5 schema baseline.
--
-- Captures the v5 Mobile Plan §17 schema. v6 deltas (corridor layers,
-- first_mover_outreach, arrival_checkin, women_only_sub_thread_optout)
-- land in 0002+.
--
-- Status: documentary. Not run against any real Supabase per D1 of
-- decisions doc — schema migration is handled separately at staging
-- cut-over. The mock server uses these as the canonical shape contract.
--
-- v6 build §17 baseline / Build Prompt Bucket 4.

-- Identity hash: composite per v15 BP §9.1 — name + dob_month +
-- phone_hash + admit_HEI + identity_pepper. Stored ONLY as the hash;
-- the components are wiped post-computation.
create table identity_hash (
  hash text primary key,
  computed_at timestamptz not null default now(),
  banned bool not null default false,
  banned_at timestamptz,
  banned_reason text
);

create table verified_user (
  id uuid primary key default gen_random_uuid(),
  identity_hash text not null references identity_hash(hash),
  phone_hash text not null,
  -- Phone number is hashed (PHONE_PEPPER) before storage. Plaintext
  -- is wiped within 5 minutes per L11.
  phone_status text not null check (phone_status in ('unverified','verified')),
  phone_verified_at timestamptz,
  identity_status text not null check (identity_status in ('unstarted','in_progress','verified','failed')),
  identity_verified_at timestamptz,
  admit_status text not null check (admit_status in ('not_uploaded','pending','approved','rejected')),
  admit_uploaded_at timestamptz,
  admit_decided_at timestamptz,
  admit_letter_hash text, -- the only persisted reference to the PDF
  premium_unlock_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table corridor (
  id uuid primary key default gen_random_uuid(),
  -- v5: single-layer corridor. v6 0002 adds corridor_layer +
  -- parent_corridor_id columns.
  home_city text not null,
  destination_uni text not null,
  destination_city text not null,
  destination_country text not null check (destination_country in ('Ireland','Germany')),
  intake_month text not null,
  status text not null default 'forming' check (status in ('forming','unlocked','frozen')),
  unlock_threshold int not null default 60, -- v5 default; v6 retunes
  member_count int not null default 0,
  unlocked_at timestamptz,
  created_at timestamptz not null default now()
);

create table corridor_member (
  corridor_id uuid not null references corridor(id) on delete cascade,
  user_id uuid not null references verified_user(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (corridor_id, user_id)
);

create table group_message (
  id uuid primary key default gen_random_uuid(),
  channel_id text not null,
  author_id uuid not null references verified_user(id),
  body text not null,
  sent_at timestamptz not null default now(),
  seq_id bigserial not null,
  is_system_prompt bool not null default false
);

create index on group_message (channel_id, seq_id);

create table premium_unlock (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references verified_user(id),
  amount_inr int not null default 99900, -- v6: ₹999 in paise (was ₹1,499 in v5)
  razorpay_order_id text not null unique,
  activated_at timestamptz not null default now(),
  receipt_id text not null
);

create table ts_incident (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references verified_user(id),
  category text not null check (category in ('harassment','scam','hard_time','other')),
  reason text not null,
  context jsonb,
  status text not null default 'open' check (status in ('open','assigned','resolved','dismissed')),
  assigned_advisor_id uuid,
  first_response_by timestamptz not null,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  procedure text not null,
  req_id uuid not null,
  type text not null check (type in ('query','mutation','subscription')),
  success bool not null,
  elapsed_ms int not null,
  input_hash text,
  error_code text,
  ts timestamptz not null default now()
);

create index on audit_log (user_id, ts desc);
create index on audit_log (procedure, ts desc);

create table scm_incident (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references verified_user(id),
  pattern_id text not null,
  details text,
  amount_inr int,
  reported_at timestamptz not null default now(),
  status text not null default 'open'
);

create table digilocker_fallback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references verified_user(id),
  reason text not null check (reason in ('aadhaar_not_linked','mobile_changed','deactivated','invisible_character')),
  resolution text,
  created_at timestamptz not null default now()
);
