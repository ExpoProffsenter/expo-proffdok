-- Recover a closed support tab only for the same actor login and target.
-- Reuse original expiry and namespace; switching customer still requires exit.
create or replace function app_support_private.session_command(p_action text,p_target_user_id uuid,p_company_id uuid,p_session_id uuid) returns jsonb
language plpgsql security definer set search_path=pg_catalog,public,pg_temp as $$
declare a uuid:=auth.uid(); login_id uuid; s app_support_private.sessions;
begin
 login_id:=app_support_private.actor_session();
 if p_action='end' then
  -- Ending remains possible after disabling feature or revoking target membership.
  update app_support_private.sessions set ended_at=clock_timestamp()
   where id=coalesce(p_session_id,(select x.id from app_support_private.sessions x where x.actor_id=a and x.actor_session_id=login_id and x.ended_at is null order by x.created_at desc limit 1)) and actor_id=a and actor_session_id=login_id and ended_at is null returning * into s;
  if s.id is not null then insert into app_support_private.audit(session_id,actor_id,target_user_id,company_id,action) values(s.id,a,s.target_user_id,s.company_id,'end'); end if;
  return jsonb_build_object('ended',true);
 elsif p_action='get' then
  return app_support_private.describe_session(app_support_private.valid_session(p_session_id));
 elsif p_action<>'start' then
  raise exception 'Ukjent supporthandling.' using errcode='22023';
 end if;
 if not exists(select 1 from app_support_private.settings where singleton and enabled) then
  raise exception 'Samlet supportmodus er ikke aktivert.' using errcode='42501';
 end if;
 if a=p_target_user_id then raise exception 'Velg kundens bruker.' using errcode='22023'; end if;
 perform app_support_private.assert_target(p_target_user_id,p_company_id);
 -- Serialize competing starts from this login; never silently change another tab's target.
 perform pg_advisory_xact_lock(hashtextextended(a::text||login_id::text,0));
 select * into s from app_support_private.sessions where actor_id=a and actor_session_id=login_id and ended_at is null and expires_at>clock_timestamp() order by created_at desc limit 1;
 if s.id is not null then
  if s.target_user_id=p_target_user_id and s.company_id=p_company_id then
   insert into app_support_private.audit(session_id,actor_id,target_user_id,company_id,action) values(s.id,a,s.target_user_id,s.company_id,'resume');
   return app_support_private.describe_session(s);
  end if;
  raise exception 'Avslutt gjeldende supportøkt før du velger en annen bruker.' using errcode='PT409';
 end if;
 insert into app_support_private.sessions(actor_id,actor_session_id,target_user_id,company_id)
 values(a,login_id,p_target_user_id,p_company_id) returning * into s;
 insert into app_support_private.audit(session_id,actor_id,target_user_id,company_id,action)
 values(s.id,a,s.target_user_id,s.company_id,'start');
 return app_support_private.describe_session(s);
end $$;

