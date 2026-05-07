-- AI fields on chat_report — populated by the chat-scam-detect Inngest
-- job when AI_SCAM_DETECT_ENABLED is on. The columns are nullable so
-- user-filed reports continue to work unchanged; only AI-filed rows
-- carry these fields.
--
-- The existing `category` column stays the source-of-truth for SLA
-- routing (harassment + self_harm → 1h, scam/spam/other → 4h). The new
-- `ai_category` is the FINER-grained classification (e.g.
-- 'payment_advance', 'off_platform_contact') that maps to category=scam
-- — useful for analytics and for the T&S advisor to know the specific
-- scam pattern the message matched.
--
-- v16 web pivot Bucket 4 follow-up.

alter table public.chat_report
  add column if not exists auto_filed boolean not null default false,
  add column if not exists ai_category text,
  add column if not exists ai_confidence real
    check (ai_confidence is null or (ai_confidence >= 0 and ai_confidence <= 1)),
  add column if not exists ai_reason text
    check (ai_reason is null or length(ai_reason) <= 200);

-- Hot path for the T&S queue: surface auto-filed rows first if the
-- advisor wants to triage AI-flagged before user-filed.
create index if not exists chat_report_auto_filed_idx
  on public.chat_report (auto_filed, reported_at desc)
  where auto_filed = true;
