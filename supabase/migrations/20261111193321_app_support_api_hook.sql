-- Transport registration only. Feature switches remain off until verified.
-- Preserve any existing platform pre-request contract instead of replacing it.
do $$
declare prior text;
begin
 select substr(config,length('pgrst.db_pre_request=')+1) into prior
 from pg_db_role_setting s cross join lateral unnest(s.setconfig) config
 where s.setrole=(select oid from pg_roles where rolname='authenticator')
 and config like 'pgrst.db_pre_request=%' limit 1;
 if coalesce(prior,'') not in ('','public.app_support_prepare_request') then
  raise exception 'Existing pre-request hook must be reviewed before support registration';
 end if;
end $$;
alter role authenticator set pgrst.db_pre_request='public.app_support_prepare_request';
notify pgrst,'reload config';
notify pgrst,'reload schema';
