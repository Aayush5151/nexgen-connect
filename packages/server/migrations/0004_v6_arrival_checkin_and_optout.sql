-- 0004_v6_arrival_checkin_and_optout — v15 BP §5.2 + v6 §17 + §5.13.
--
-- Two tables:
--   arrival_checkin: Y6 first-week check-in entries (Premium-gated,
--                    Day 0 to Day 7 in destination).
--   women_only_sub_thread_optout: explicit opt-outs from the auto-spawn
--                                 women-only sub-thread (default-on for
--                                 women in mixed cohorts ≥4 women).
--
-- v6 build §17 / Build Prompt Bucket 4.

create table arrival_checkin (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references verified_user(id),
  day_post_arrival smallint not null check (day_post_arrival between 0 and 7),
  status text not null check (status in (
    'pending',
    'received_thumb_up',
    'received_thumb_down',
    'received_with_note',
    'i_need_help_triggered',
    'missed'
  )),
  user_note text,
  advisor_response text,
  advisor_id uuid,
  created_at timestamptz not null default now(),
  responded_at timestamptz
);

create index on arrival_checkin (user_id, day_post_arrival);

-- ABSENCE of a row means the user is opted-in by default. Per Build
-- Prompt §Bucket 3 / women-only sub-thread default-on principle.
create table women_only_sub_thread_optout (
  user_id uuid not null references verified_user(id) on delete cascade,
  corridor_id uuid not null references corridor(id) on delete cascade,
  opted_out_at timestamptz not null default now(),
  primary key (user_id, corridor_id)
);
