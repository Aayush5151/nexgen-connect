-- 0003_v6_first_mover_outreach — v15 BP §3.7a W16 + v6 §17.
--
-- Surfaces the founder/T&S-head outreach queue for the first-mover
-- commitment. A row lands when corridor.member_count_l1 = 1 AND user
-- is F-women-only or first-from-tier-3-home-city. Admin AD13 console
-- reads this table; admin.callFirstMover procedure inserts an outcome
-- row when the call completes.
--
-- v6 build §17 / Build Prompt Bucket 4.

create table first_mover_outreach (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references verified_user(id),
  corridor_id uuid not null references corridor(id),
  trigger text not null check (trigger in (
    'first_woman_in_women_only',
    'first_user_tier3_home_city'
  )),
  status text not null default 'queued' check (status in (
    'queued',
    'in_progress',
    'completed_call_picked_up',
    'completed_text_sent',
    'completed_user_unreachable'
  )),
  assigned_advisor_id uuid,
  target_sla_at timestamptz not null,
  call_started_at timestamptz,
  call_ended_at timestamptz,
  call_duration_s int,
  outcome_notes text,
  created_at timestamptz not null default now()
);

create index on first_mover_outreach (status, target_sla_at)
  where status in ('queued', 'in_progress');
