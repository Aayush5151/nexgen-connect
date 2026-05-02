-- 0007_erasure_request — GDPR Art. 17 + DPDP §13 right-to-erasure.
--
-- v16 web pivot §3.4 + pre-launch-blockers.md §4. Account-deletion
-- cascade with 60-min ACK + 30-day completion SLA.
--
-- One row per erasure (or data-export) request. The cascade worker
-- reads pending rows and walks the deletion list (chat anonymisation,
-- verified_user delete, third-party API calls, etc.); when all
-- targets confirm, the worker UPDATEs status='completed'.
--
-- Idempotency: enforced at the application layer via the request's
-- idempotency_key. A retry within 24h returns the existing row.

create type request_type as enum (
  'erasure',
  'data_export'
);

create type erasure_status as enum (
  'acknowledged',     -- request received, cascade not yet started
  'in_progress',      -- cascade worker is running
  'completed',        -- all deletions confirmed
  'failed'            -- worker hit an unrecoverable error; manual review
);

create table erasure_request (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references verified_user(id) on delete set null,
  request_type request_type not null,
  -- ISO timestamp of request acknowledgement. SLA: ≤60min after
  -- /api/account/requestErasure resolves.
  acknowledged_at timestamptz not null default now(),
  -- Hard SLA: 30 days from acknowledged_at per GDPR Art. 12(3).
  completion_deadline timestamptz not null
    default (now() + interval '30 days'),
  -- Set by the cascade worker on completion.
  completed_at timestamptz,
  status erasure_status not null default 'acknowledged',
  -- Optional free-text reason (the user may decline to give one).
  reason text,
  -- For data_export: the signed URL the worker generated, plus its
  -- expiry. For erasure: null.
  export_signed_url text,
  export_expires_at timestamptz
);

-- Cascade worker reads by status + deadline.
create index erasure_request_status_deadline
  on erasure_request (status, completion_deadline)
  where status in ('acknowledged', 'in_progress');

-- User-facing /app/profile/settings reads by user.
create index erasure_request_user_id_acknowledged_at
  on erasure_request (user_id, acknowledged_at desc)
  where user_id is not null;

-- RLS: the user can read their own requests (used by erasureStatus
-- query). Writes only via service role.
alter table erasure_request enable row level security;

create policy erasure_request_select_own
  on erasure_request
  for select
  to authenticated
  using (user_id = (select auth.uid()));
