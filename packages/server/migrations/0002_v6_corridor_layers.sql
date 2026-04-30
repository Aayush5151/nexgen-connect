-- 0002_v6_corridor_layers — v15 BP §3.2 + v6 §17 schema delta.
--
-- Inverts the corridor schema from a single layer (v5: home_city ×
-- destination × intake) to three layers per v15 BP §3.2:
--   Layer 1 — home_city × destination × intake (hometown crew, ~5-30)
--   Layer 2 — destination × intake (incoming class, ~30-150) — primary
--   Layer 3 — destination_city × intake (city ambient, ~100-500)
--
-- Layer 1 rows have parent_corridor_id pointing at the Layer 2 they
-- nest inside. Layer 2 rows have member_count_l1 (rollup of users
-- sharing the current user's home_city, drives the pinned hometown
-- card on CH1).
--
-- v6 build §17 schema delta / Build Prompt Bucket 4.

alter table corridor add column corridor_layer smallint not null default 2 check (corridor_layer between 1 and 3);
alter table corridor add column parent_corridor_id uuid references corridor(id);
alter table corridor add column member_count_l1 int not null default 0;
alter table corridor add column member_count_l2 int not null default 0;
alter table corridor add column women_only_sub_thread_active bool default false;

create index on corridor (corridor_layer, status);
create index on corridor (parent_corridor_id) where parent_corridor_id is not null;

-- Retune v5 default from 60 → Layer-2 30 / Layer-1 8 / Layer-3 50
-- (per v15 BP §3.3). Existing rows pick up the new threshold via
-- a one-shot update in the staging cut-over runbook (not in this
-- migration — schema only).

-- verified_user gains the v6 funnel signals that drive layered routing.
alter table verified_user add column scariest_thing_september text; -- O3a answer
alter table verified_user add column is_recovering_student bool default false;
alter table verified_user add column women_only_sub_thread_opt_in bool default true;
alter table verified_user add column corridor_layer_2_id uuid references corridor(id);
alter table verified_user add column corridor_layer_1_id uuid references corridor(id);
alter table verified_user add column emergency_phone_consent_first_week bool default false;
alter table verified_user add column arrival_date timestamptz;
