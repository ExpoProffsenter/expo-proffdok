-- Full-app support foundation. Disabled until all transport adapters and QA pass.
-- Does not change auth.uid(), existing RLS, roles, memberships or PostgREST config.
create schema if not exists app_support_private;
revoke all on schema app_support_private from public, anon, authenticated;
create table app_support_private.settings (
 singleton boolean primary key default true check(singleton), enabled boolean not null default false
);
insert into app_support_private.settings(singleton,enabled) values(true,false);
create table app_support_private.sessions (
 id uuid primary key default gen_random_uuid(), actor_id uuid not null references auth.users(id),
 actor_session_id uuid not null, target_user_id uuid not null references auth.users(id),
 company_id uuid not null references public.sales_company_scopes(id),
 created_at timestamptz not null default clock_timestamp(),
 expires_at timestamptz not null default (clock_timestamp()+interval '1 hour'),
 ended_at timestamptz, check(actor_id<>target_user_id)
);
create index app_support_sessions_actor on app_support_private.sessions(actor_id,actor_session_id) where ended_at is null;
create table app_support_private.audit (
 id bigint generated always as identity primary key,
 session_id uuid not null references app_support_private.sessions(id),
 actor_id uuid not null, target_user_id uuid not null, company_id uuid not null,
 happened_at timestamptz not null default clock_timestamp(), action text not null,
 resource text, before_value jsonb, after_value jsonb
);
alter table app_support_private.settings enable row level security;
alter table app_support_private.sessions enable row level security;
alter table app_support_private.audit enable row level security;
revoke all on all tables in schema app_support_private from public,anon,authenticated;
revoke all on all sequences in schema app_support_private from public,anon,authenticated;

create function app_support_private.actor_session() returns uuid
language plpgsql stable security definer set search_path=pg_catalog,public,pg_temp as $$
declare a uuid:=auth.uid(); s uuid;
begin
 if a is null or not exists(select 1 from public.profiles p where p.id=a and p.approved and not coalesce(p.deactivated,false) and p.system_role='systemadmin') then
  raise exception 'Kun aktiv systemadministrator kan bruke supportmodus.' using errcode='42501';
 end if;
 s:=nullif(coalesce(nullif(current_setting('request.jwt.claims',true),'')::jsonb,'{}')->>'session_id','')::uuid;
 if s is null or not exists(select 1 from auth.sessions x where x.id=s and x.user_id=a) then
  raise exception 'Support krever en gyldig innlogget økt.' using errcode='42501';
 end if;
 return s;
end $$;

create function app_support_private.assert_target(t uuid,c uuid) returns void
language plpgsql stable security definer set search_path=pg_catalog,public,pg_temp as $$
begin
 if not exists(select 1 from public.profiles p where p.id=t and p.approved and not coalesce(p.deactivated,false) and coalesce(p.system_role,'')<>'systemadmin') then
  raise exception 'Supportbrukeren er ikke aktiv eller kan ikke velges.' using errcode='42501';
 end if;
 if not exists(select 1 from public.sales_company_memberships m where m.user_id=t and m.company_id=c) then
  raise exception 'Supportbrukeren har ikke tilgang til valgt firma.' using errcode='42501';
 end if;
end $$;

create function app_support_private.valid_session(sid uuid) returns app_support_private.sessions
language plpgsql stable security definer set search_path=pg_catalog,public,pg_temp as $$
declare s app_support_private.sessions; a uuid:=auth.uid(); login_id uuid;
begin
 login_id:=app_support_private.actor_session();
 if not exists(select 1 from app_support_private.settings where singleton and enabled) then
  raise exception 'Samlet supportmodus er ikke aktivert.' using errcode='42501';
 end if;
 select * into s from app_support_private.sessions where id=sid and actor_id=a and actor_session_id=login_id and ended_at is null and expires_at>clock_timestamp();
 if s.id is null then raise exception 'Supportøkten er avsluttet eller utløpt.' using errcode='42501'; end if;
 perform app_support_private.assert_target(s.target_user_id,s.company_id);
 return s;
end $$;

create function app_support_private.describe_session(s app_support_private.sessions) returns jsonb
language sql stable security definer set search_path=pg_catalog,public,pg_temp as $$
 select jsonb_build_object('id',s.id,'actor_id',s.actor_id,'target_user_id',s.target_user_id,'company_id',s.company_id,
 'expires_at',s.expires_at,'company_name',c.display_name,
 'actor_email',a.email,'target_email',t.email,
 'target_user',jsonb_build_object('id',u.id,'email',u.email,'user_metadata',jsonb_build_object('full_name',u.raw_user_meta_data->>'full_name','name',u.raw_user_meta_data->>'name')),
 'capabilities',jsonb_build_object('read',true,'create',true,'update',true,'delete',false))
 from public.sales_company_scopes c join public.profiles a on a.id=s.actor_id
 join public.profiles t on t.id=s.target_user_id join auth.users u on u.id=s.target_user_id where c.id=s.company_id;
$$;

create function app_support_private.session_command(p_action text,p_target_user_id uuid,p_company_id uuid,p_session_id uuid) returns jsonb
language plpgsql security definer set search_path=pg_catalog,public,pg_temp as $$
declare a uuid:=auth.uid(); login_id uuid; s app_support_private.sessions;
begin
 login_id:=app_support_private.actor_session();
 if p_action='end' then
  -- Ending remains possible after disabling feature or revoking target membership.
  update app_support_private.sessions set ended_at=clock_timestamp()
   where id=p_session_id and actor_id=a and actor_session_id=login_id and ended_at is null returning * into s;
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
 if exists(select 1 from app_support_private.sessions where actor_id=a and actor_session_id=login_id and ended_at is null and expires_at>clock_timestamp()) then
  raise exception 'Avslutt gjeldende supportøkt før du velger en annen bruker.' using errcode='PT409';
 end if;
 insert into app_support_private.sessions(actor_id,actor_session_id,target_user_id,company_id)
 values(a,login_id,p_target_user_id,p_company_id) returning * into s;
 insert into app_support_private.audit(session_id,actor_id,target_user_id,company_id,action)
 values(s.id,a,s.target_user_id,s.company_id,'start');
 return app_support_private.describe_session(s);
end $$;

create function public.app_support_session(p_action text,p_target_user_id uuid default null,p_company_id uuid default null,p_session_id uuid default null) returns jsonb
language sql security invoker set search_path=pg_catalog,public,pg_temp as $$
 select app_support_private.session_command(p_action,p_target_user_id,p_company_id,p_session_id);
$$;
revoke all on all functions in schema app_support_private from public,anon,authenticated;
revoke all on function public.app_support_session(text,uuid,uuid,uuid) from public,anon;
grant usage on schema app_support_private to authenticated;
grant execute on function app_support_private.session_command(text,uuid,uuid,uuid) to authenticated;
grant execute on function public.app_support_session(text,uuid,uuid,uuid) to authenticated;

-- Pure deletion detection, used by scoped write gateways before committing/auditing.
-- Stable IDs in nested JSON lists are preserved across reordering and editing.
create function app_support_private.removes_content(old_value jsonb,new_value jsonb) returns boolean
language plpgsql immutable set search_path=pg_catalog,pg_temp as $$
declare k text; v jsonb; replacement jsonb; identity_key text; identity_value jsonb; pos int; remaining jsonb; match_pos int;
begin
 if old_value is null or old_value='null'::jsonb then return false; end if;
 if jsonb_typeof(old_value)='object' then
  if jsonb_typeof(new_value) is distinct from 'object' then return true; end if;
  if lower(coalesce(new_value->>'status','')) in ('deleted','removed','archived')
   and new_value->>'status' is distinct from old_value->>'status' then return true; end if;
  foreach k in array array['path','storagePath','filePath','objectPath'] loop
   if nullif(old_value->>k,'') is not null and old_value->k is distinct from new_value->k then return true; end if;
  end loop;
  foreach k in array array['deleted_at','deletedAt','archived_at','archivedAt'] loop
   if coalesce(old_value->k,'null'::jsonb)='null'::jsonb and coalesce(new_value->k,'null'::jsonb)<>'null'::jsonb then return true; end if;
  end loop;
  foreach k in array array['deleted','is_deleted','isDeleted','archived','is_archived','isArchived'] loop
   if old_value->k is distinct from 'true'::jsonb and new_value->k='true'::jsonb then return true; end if;
  end loop;
  for k,v in select * from jsonb_each(old_value) loop
   if k in ('deleted_at','deletedAt','archived_at','archivedAt') and v='null'::jsonb and coalesce(new_value->k,'null'::jsonb)<>'null'::jsonb then return true; end if;
   if k in ('deleted','is_deleted','isDeleted','archived','is_archived','isArchived') and v is distinct from 'true'::jsonb and new_value->k='true'::jsonb then return true; end if;
   if not new_value ? k then return true; end if;
   if jsonb_typeof(v) in ('array','object') and app_support_private.removes_content(v,new_value->k) then return true; end if;
  end loop;
 elsif jsonb_typeof(old_value)='array' then
  if jsonb_typeof(new_value) is distinct from 'array' or jsonb_array_length(new_value)<jsonb_array_length(old_value) then return true; end if;
  pos:=0; remaining:=new_value;
  for v in select * from jsonb_array_elements(old_value) loop
   identity_key:=null;
   if jsonb_typeof(v)='object' then
    foreach k in array array['id','uuid','key','path','storagePath','filePath','objectPath'] loop
     if nullif(v->>k,'') is not null then identity_key:=k; exit; end if;
    end loop;
   end if;
   if identity_key is not null then
    identity_value:=v->identity_key;
    select value,(ordinality-1)::int into replacement,match_pos from jsonb_array_elements(remaining) with ordinality
     where value->identity_key=identity_value limit 1;
    if replacement is null then return true; end if;
    remaining:=remaining-match_pos;
   elsif jsonb_typeof(v) not in ('object','array') then
    select value,(ordinality-1)::int into replacement,match_pos from jsonb_array_elements(remaining) with ordinality
     where value=v limit 1;
    if replacement is null then return true; end if;
    remaining:=remaining-match_pos;
   else replacement:=new_value->pos;
   end if;
   if jsonb_typeof(v) in ('array','object') and app_support_private.removes_content(v,replacement) then return true; end if;
   pos:=pos+1;
  end loop;
 end if;
 return false;
end $$;
revoke all on function app_support_private.removes_content(jsonb,jsonb) from public,anon,authenticated;
