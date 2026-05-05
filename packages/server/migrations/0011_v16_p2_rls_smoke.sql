-- 0011_v16_p2_rls_smoke.sql
--
-- P2 Row-Level Security smoke set — fills the gaps that 0005-0010 left:
--
--   - verified_user.self_read         (each user reads only their own row)
--   - corridor_member.self_or_corridor (a member sees their corridor's
--                                        roster, not foreign corridors)
--   - group_message.corridor_only     (chat is gated to fellow corridor
--                                        members; the unlock-threshold
--                                        check happens server-side via the
--                                        chat router, not at the RLS layer)
--
-- Policies use `auth.uid()` from the Supabase JWT.  The JWT is set on the
-- session cookie by the new /api/auth/establish-session route (P2.a),
-- which calls supabase.auth.admin.createUser({phone, phone_confirm:true})
-- after the upstream Meta-Cloud OTP succeeds.
--
-- Smoke gate: web/tests/e2e/rls-isolation.spec.ts creates two real users
-- via admin.createUser, verifies that user-A cannot read user-B's
-- verified_user / corridor_member / group_message rows even with a
-- fresh SSR session.
--
-- v16 web pivot §P2 / Build Prompt §RLS smoke.

-- ---------------------------------------------------------------------------
-- verified_user — every user can read their own row, no one can read
-- others.  Service-role bypasses RLS so the tRPC server (which runs with
-- the service role) can still read the full table for admin paths.
-- ---------------------------------------------------------------------------
alter table verified_user enable row level security;

drop policy if exists verified_user_self_read on verified_user;
create policy verified_user_self_read
  on verified_user
  for select
  using (auth_user_id = auth.uid());

drop policy if exists verified_user_self_update on verified_user;
create policy verified_user_self_update
  on verified_user
  for update
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- corridor_member — a user reads the full member list of any corridor
-- they themselves belong to (so they see their corridor's roster), but
-- never the roster of foreign corridors.
-- ---------------------------------------------------------------------------
alter table corridor_member enable row level security;

drop policy if exists corridor_member_self_or_same on corridor_member;
create policy corridor_member_self_or_same
  on corridor_member
  for select
  using (
    -- Always allow seeing your own row.
    user_id in (
      select id from verified_user where auth_user_id = auth.uid()
    )
    or
    -- Or any row where the corridor is one you also belong to.
    corridor_id in (
      select cm.corridor_id
      from corridor_member cm
      join verified_user vu on vu.id = cm.user_id
      where vu.auth_user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- group_message — read access only to messages in corridors the caller
-- is a member of.  Insert is similarly gated — RLS prevents posting into
-- a corridor you don't belong to even with a forged tRPC request.
-- ---------------------------------------------------------------------------
alter table group_message enable row level security;

drop policy if exists group_message_member_read on group_message;
create policy group_message_member_read
  on group_message
  for select
  using (
    corridor_id in (
      select cm.corridor_id
      from corridor_member cm
      join verified_user vu on vu.id = cm.user_id
      where vu.auth_user_id = auth.uid()
    )
  );

drop policy if exists group_message_member_insert on group_message;
create policy group_message_member_insert
  on group_message
  for insert
  with check (
    corridor_id in (
      select cm.corridor_id
      from corridor_member cm
      join verified_user vu on vu.id = cm.user_id
      where vu.auth_user_id = auth.uid()
    )
    and
    sender_id in (
      select id from verified_user where auth_user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- verified_user.auth_user_id — back-link from our internal user row to
-- the Supabase auth.users.id.  Set on insert by the establish-session
-- route after admin.createUser; nullable for legacy seed rows.
--
-- We add the column only if it doesn't already exist so re-running the
-- migration in a non-fresh DB is safe.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_name = 'verified_user'
      and column_name = 'auth_user_id'
  ) then
    alter table verified_user
      add column auth_user_id uuid references auth.users(id) on delete set null;
    create index if not exists verified_user_auth_user_id_idx
      on verified_user (auth_user_id);
  end if;
end $$;
