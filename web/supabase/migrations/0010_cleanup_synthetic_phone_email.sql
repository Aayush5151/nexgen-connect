-- 0010_cleanup_synthetic_phone_email.sql
--
-- M1 cleanup. /api/auth/establish-session writes a synthetic
-- `<phoneDigits>@phone.local` email into auth.users.email for phone-only
-- users (the synthetic email is REQUIRED by Supabase's generateLink
-- magiclink path, which won't issue a token without one).
--
-- The synthetic email pollutes auth.users in three ways:
--   1. `email` column shows a fake address — confusing in the Supabase
--      dashboard.
--   2. The user can never receive a real email at that address.
--   3. Future "find a user by email" admin scripts will return ghosts.
--
-- This migration is INTENTIONALLY a no-op SELECT — it documents the
-- known synthetic-email pattern but does NOT NULL the column, because:
--   (a) Supabase Auth requires email to be set for the magiclink flow
--       to continue working on returning users; NULLing breaks login.
--   (b) The longer-term fix is to move phone-only users to the
--       `signInWithOtp({phone})` flow which doesn't need an email at all.
--       That's Bucket 10 work — not a migration.
--
-- For now we leave the synthetic emails in place but flag the pattern
-- in the comment column so a future cleanup can find them easily.

-- Document the pattern via comment-on-column (no data change).
comment on column auth.users.email is
  'For phone-only signups via /api/auth/establish-session, this column '
  'contains a synthetic `<phoneDigits>@phone.local` address. Filter via '
  'WHERE email LIKE ''%@phone.local'' to find them. Bucket 10 will migrate '
  'these users to signInWithOtp({phone}) and NULL this column.';
