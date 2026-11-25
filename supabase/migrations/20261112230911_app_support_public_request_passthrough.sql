-- Global Data API hook also runs for public portals and service requests.
-- No support header must be a no-op without access to the private schema.
create or replace function public.app_support_prepare_request() returns void
language plpgsql security invoker set search_path=pg_catalog,public,pg_temp as $$
begin
 if nullif(coalesce(nullif(current_setting('request.headers',true),'')::jsonb,'{}')->>'x-expo-support-session','') is null then
  return;
 end if;
 if current_user <> 'authenticated' then
  raise exception 'Supportmodus krever en innlogget bruker.' using errcode='42501';
 end if;
 perform app_support_private.prepare_request();
end $$;
revoke all on function public.app_support_prepare_request() from public;
grant execute on function public.app_support_prepare_request() to anon,authenticated,service_role;
notify pgrst,'reload schema';
