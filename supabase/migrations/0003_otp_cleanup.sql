-- Nightly cleanup of expired OTPs. Schedule via Supabase cron
-- (Database → Cron) with expression `0 3 * * *` after deploy.

create or replace function public.cleanup_expired_otps()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted int;
begin
  delete from public.otp_codes
  where expires_at < now() - interval '24 hours';
  get diagnostics deleted = row_count;
  return deleted;
end;
$$;

grant execute on function public.cleanup_expired_otps() to service_role;
