-- Deliberately NOT registered as db_pre_request here. Feature remains disabled.
-- Request-local effective identity; never changes auth.uid(), JWTs or user accounts.
alter table app_support_private.settings add column transport_ready boolean not null default false;

create function app_support_private.request_session() returns app_support_private.sessions
language plpgsql stable security definer set search_path=pg_catalog,public,pg_temp as $$
declare sid uuid; actor uuid; login_id uuid; s app_support_private.sessions;
begin
 sid:=nullif(current_setting('app.support.session_id',true),'')::uuid;
 actor:=nullif(current_setting('app.support.actor_id',true),'')::uuid;
 login_id:=nullif(coalesce(nullif(current_setting('request.jwt.claims',true),'')::jsonb,'{}')->>'session_id','')::uuid;
 if sid is null or actor is null then raise exception 'Supportkontekst mangler. Last appen på nytt.' using errcode='42501'; end if;
 select * into s from app_support_private.sessions where id=sid and actor_id=actor and actor_session_id=login_id and target_user_id=auth.uid() and ended_at is null and expires_at>clock_timestamp();
 if s.id is null or not exists(select 1 from app_support_private.settings where singleton and enabled and transport_ready) then
  raise exception 'Supportøkten er ikke gyldig.' using errcode='42501';
 end if;
 if not exists(select 1 from public.profiles p where p.id=actor and p.approved and not coalesce(p.deactivated,false) and p.system_role='systemadmin') or
 not exists(select 1 from auth.sessions x where x.id=login_id and x.user_id=actor) then
  raise exception 'Supportaktørens tilgang er tilbakekalt.' using errcode='42501';
 end if;
 perform app_support_private.assert_target(s.target_user_id,s.company_id);
 if public.current_active_company_scope_id() is distinct from s.company_id then
  raise exception 'Brukerens arbeidsfirma er endret. Start support på nytt.' using errcode='42501';
 end if;
 return s;
end $$;

create function app_support_private.prepare_request() returns void
language plpgsql security definer set search_path=pg_catalog,public,pg_temp as $$
declare sid text; path text; claims jsonb; s app_support_private.sessions;
begin
 sid:=coalesce(nullif(current_setting('request.headers',true),'')::jsonb,'{}')->>'x-expo-support-session';
 if nullif(sid,'') is null then return; end if;
 -- Storage can invoke the same setup through several policies in one statement.
 if nullif(current_setting('app.support.session_id',true),'') is not null then
  s:=app_support_private.request_session();
  if s.id<>sid::uuid then raise exception 'Supportkontekst samsvarer ikke.' using errcode='42501'; end if;
  return;
 end if;
 path:=coalesce(current_setting('request.path',true),'');
 -- Session commands always retain the authenticated administrator identity.
 if path in ('/rpc/app_support_session','rpc/app_support_session') then return; end if;
 if not exists(select 1 from app_support_private.settings where singleton and enabled and transport_ready) then
  raise exception 'Samlet supporttransport er ikke klar.' using errcode='42501';
 end if;
 s:=app_support_private.valid_session(sid::uuid);
 if current_setting('request.method',true)='DELETE' then raise exception 'Sletting er sperret i supportmodus.' using errcode='42501'; end if;
 -- A valid session never grants the actor's admin rights to customer requests.
 claims:=coalesce(nullif(current_setting('request.jwt.claims',true),'')::jsonb,'{}');
 claims:=jsonb_build_object('sub',s.target_user_id,'role','authenticated','aud','authenticated',
  'session_id',s.actor_session_id,'aal','aal1', 'exp',claims->'exp',
  'email',(select email from public.profiles where id=s.target_user_id));
 perform set_config('app.support.session_id',s.id::text,true);
 perform set_config('app.support.actor_id',s.actor_id::text,true);
 perform set_config('request.jwt.claim.sub',s.target_user_id::text,true);
 perform set_config('request.jwt.claims',claims::text,true);
 perform app_support_private.request_session();
end $$;
create function public.app_support_prepare_request() returns void
language sql security invoker set search_path=pg_catalog,public,pg_temp as $$select app_support_private.prepare_request()$$;

create function app_support_private.redact_audit(v jsonb) returns jsonb
language plpgsql immutable set search_path=pg_catalog,pg_temp as $$
declare result jsonb; k text; item jsonb;
begin
 if jsonb_typeof(v)='object' then
  result:='{}';
  for k,item in select * from jsonb_each(v) loop
   result:=result||jsonb_build_object(k,case when k ~* '(token|password|secret|authorization|access.?code|signed.?url)' then to_jsonb('[redacted]'::text) else app_support_private.redact_audit(item) end);
  end loop;
  return result;
 elsif jsonb_typeof(v)='array' then
  select coalesce(jsonb_agg(app_support_private.redact_audit(x)),'[]') into result from jsonb_array_elements(v) x;
  return result;
 end if;
 return v;
end $$;

create function app_support_private.guard_and_audit() returns trigger
language plpgsql security definer set search_path=pg_catalog,public,pg_temp as $$
declare sid text; s app_support_private.sessions; before_row jsonb; after_row jsonb; k text;
begin
 sid:=coalesce(nullif(current_setting('request.headers',true),'')::jsonb,'{}')->>'x-expo-support-session';
 if nullif(sid,'') is null and nullif(current_setting('app.support.session_id',true),'') is null then
  if tg_level='STATEMENT' then return null; end if;
  if tg_op='DELETE' then return old; else return new; end if;
 end if;
 s:=app_support_private.request_session();
 if sid::uuid is distinct from s.id then raise exception 'Supportøkten samsvarer ikke med forespørselen.' using errcode='42501'; end if;
 if tg_op in ('DELETE','TRUNCATE') then raise exception 'Sletting er sperret i supportmodus.' using errcode='42501'; end if;
 -- Membership, account/permission changes and external delivery are separate admin actions.
 if tg_table_schema='net' or tg_table_name ~* '(membership|module_access|supplier_access|user_access|profiles|active_company_scope|outbox|email|mail_settings|api_key|secret)' then
  raise exception 'Tilgangsendring eller utsending er ikke tillatt fra supportvisningen.' using errcode='42501';
 end if;
 after_row:=to_jsonb(new);
 if tg_op='UPDATE' then
  before_row:=to_jsonb(old);
  foreach k in array array['id','company_id','company_scope_id','user_id','created_by','owner_id'] loop
   if before_row ? k and before_row->k is distinct from after_row->k then raise exception 'Eier og firmatilknytning kan ikke flyttes i supportmodus.' using errcode='42501'; end if;
  end loop;
  if app_support_private.removes_content(before_row,after_row) then
   raise exception 'Endringen fjerner eksisterende innhold. Sletting er sperret i supportmodus.' using errcode='42501';
  end if;
 end if;
 insert into app_support_private.audit(session_id,actor_id,target_user_id,company_id,action,resource,before_value,after_value)
 values(s.id,s.actor_id,s.target_user_id,s.company_id,lower(tg_op),tg_table_schema||'.'||tg_table_name,
 app_support_private.redact_audit(before_row),app_support_private.redact_audit(after_row));
 return new;
end $$;

-- Existing business tables only. Auth/Storage/Realtime require separate adapters.
-- New tables must be added to coverage before support transport can be enabled.
do $$ declare t record; begin
 for t in select n.nspname,c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where c.relkind='r' and n.nspname=any(array['net','public','bolig_private','checklist_private','company_admin_private','controller_private','hr_private','kshms_private','org_private','pro_catalog_order_private','progress_private','sales_handler_private','stocktake_private','supplier_order_private','support_private','time_private'])
 loop
  execute format('create trigger app_support_write_guard before insert or update or delete on %I.%I for each row execute function app_support_private.guard_and_audit()',t.nspname,t.relname);
  execute format('create trigger app_support_truncate_guard before truncate on %I.%I for each statement execute function app_support_private.guard_and_audit()',t.nspname,t.relname);
 end loop;
end $$;
revoke all on function app_support_private.request_session(),app_support_private.prepare_request(),app_support_private.redact_audit(jsonb),app_support_private.guard_and_audit() from public,anon,authenticated;
revoke all on function public.app_support_prepare_request() from public,anon;
grant execute on function app_support_private.prepare_request() to authenticated;
grant execute on function public.app_support_prepare_request() to authenticated;

-- Bootstrap must prove the hook works before mounting any customer UI.
create function app_support_private.current_context() returns jsonb
language sql security definer set search_path=pg_catalog,public,pg_temp as $$
 select app_support_private.describe_session(app_support_private.request_session());
$$;
revoke all on function app_support_private.current_context() from public,anon;
grant execute on function app_support_private.current_context() to authenticated;
create function public.app_support_context() returns jsonb
language sql security invoker set search_path=pg_catalog,public,pg_temp as $$select app_support_private.current_context()$$;
revoke all on function public.app_support_context() from public,anon;
grant execute on function public.app_support_context() to authenticated;

-- The launcher stays hidden until the complete transport has been enabled.
create function public.app_support_available() returns boolean
language plpgsql stable security definer set search_path=pg_catalog,public,pg_temp as $$
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and approved and not coalesce(deactivated,false) and system_role='systemadmin') then return false; end if;
 return exists(select 1 from app_support_private.settings where singleton and enabled and transport_ready);
end $$;
revoke all on function public.app_support_available() from public,anon;
grant execute on function public.app_support_available() to authenticated;
