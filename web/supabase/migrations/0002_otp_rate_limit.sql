-- Cap OTP requests per phone to 3 in any 10-minute window.

create or replace function public.count_recent_otp_requests(p_phone_hash text)
returns int
language sql
security definer
set search_path = public
as $$
  select count(*)::int
  from public.otp_codes
  where phone_hash = p_phone_hash
    and created_at > now() - interval '10 minutes';
$$;

grant execute on function public.count_recent_otp_requests(text)
  to anon, authenticated;
