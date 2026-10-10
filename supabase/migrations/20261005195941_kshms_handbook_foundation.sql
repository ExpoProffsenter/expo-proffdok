-- KS/HMS stage A. No activation/backfill, no production seed, no payment integration.
create schema if not exists kshms_private;
revoke all on schema kshms_private from public, anon, authenticated;
do $$ declare c record; begin
 for c in select conname from pg_constraint where conrelid='public.company_module_access'::regclass and contype='c' and pg_get_constraintdef(oid) like '%store_offers%' loop
  execute format('alter table public.company_module_access drop constraint %I',c.conname);
 end loop;
end $$;
alter table public.company_module_access add constraint company_module_access_supported_key check(module_key in ('store_offers','kshms'));

create table public.kshms_member_access (
 company_id uuid not null references public.sales_company_scopes(id), user_id uuid not null references public.profiles(id),
 role text not null check(role in ('reader','responsible')), enabled boolean not null default false,
 changed_by uuid not null references public.profiles(id), changed_at timestamptz not null default now(), primary key(company_id,user_id)
);
create table public.kshms_settings (
 company_id uuid primary key references public.sales_company_scopes(id), revision bigint not null default 1,
 trades text[] not null default '{}', activities text not null default '', responsibilities text not null default '', risks text not null default '',
 responsible_user_id uuid references public.profiles(id), next_review_on date not null default (current_date+interval '1 year'),
 updated_by uuid not null references public.profiles(id), updated_at timestamptz not null default now()
);
create table public.kshms_routines (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.sales_company_scopes(id),
 revision bigint not null default 1, draft jsonb not null check(jsonb_typeof(draft)='object'),
 archived boolean not null default false, created_by uuid not null references public.profiles(id), updated_by uuid not null references public.profiles(id),
 updated_at timestamptz not null default now(), unique(company_id,id)
);
create table public.kshms_versions (
 id uuid primary key default gen_random_uuid(), company_id uuid not null, routine_id uuid not null,
 number integer not null, content jsonb not null, content_hash text not null, change_summary text not null,
 published_by uuid not null references public.profiles(id), published_at timestamptz not null default now(),
 requires_ack boolean not null default true,
 foreign key(company_id,routine_id) references public.kshms_routines(company_id,id), unique(routine_id,number), unique(company_id,id)
);
create table public.kshms_assignments (
 company_id uuid not null, version_id uuid not null, user_id uuid not null references public.profiles(id),
 assigned_by uuid not null references public.profiles(id), assigned_at timestamptz not null default now(),
 primary key(version_id,user_id), foreign key(company_id,version_id) references public.kshms_versions(company_id,id)
);
create table public.kshms_acknowledgments (
 company_id uuid not null, version_id uuid not null, user_id uuid not null, acknowledged_at timestamptz not null default now(),
 statement text not null,
 primary key(version_id,user_id), foreign key(version_id,user_id) references public.kshms_assignments(version_id,user_id),
 foreign key(company_id,version_id) references public.kshms_versions(company_id,id)
);
create table public.kshms_reviews (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.sales_company_scopes(id),
 signed_by uuid not null references public.profiles(id), signed_at timestamptz not null default now(),
 version_snapshot jsonb not null, findings text not null, follow_up text not null, next_review_on date not null,
 statement text not null
);
create table public.kshms_audit (
 id bigint generated always as identity primary key, company_id uuid not null references public.sales_company_scopes(id),
 actor_id uuid not null references public.profiles(id), action text not null, object_id uuid, at timestamptz not null default now()
);
create index kshms_routines_company_idx on public.kshms_routines(company_id,archived);
create index kshms_versions_company_idx on public.kshms_versions(company_id,routine_id,number desc);
create index kshms_assignments_user_idx on public.kshms_assignments(company_id,user_id);
create index kshms_acknowledgments_company_idx on public.kshms_acknowledgments(company_id,user_id);
create index kshms_reviews_company_idx on public.kshms_reviews(company_id,signed_at desc);
create index kshms_audit_company_idx on public.kshms_audit(company_id,at desc);

-- RPC-only write/read model. RLS deny-by-default and no API table privileges.
do $$ declare t text; begin
 foreach t in array array['kshms_member_access','kshms_settings','kshms_routines','kshms_versions','kshms_assignments','kshms_acknowledgments','kshms_reviews','kshms_audit'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from public, anon, authenticated',t);
 end loop;
end $$;

create function kshms_private.immutable_record() returns trigger language plpgsql set search_path='' as $$
begin raise exception 'Signed/published records are immutable' using errcode='42501'; end $$;
create trigger kshms_version_immutable before update or delete on public.kshms_versions for each row execute function kshms_private.immutable_record();
create trigger kshms_ack_immutable before update or delete on public.kshms_acknowledgments for each row execute function kshms_private.immutable_record();
create trigger kshms_review_immutable before update or delete on public.kshms_reviews for each row execute function kshms_private.immutable_record();
create trigger kshms_audit_immutable before update or delete on public.kshms_audit for each row execute function kshms_private.immutable_record();

create function kshms_private.context() returns jsonb language plpgsql security definer set search_path='' as $$
declare c uuid; member_role text; grant_role text; is_enabled boolean; is_admin boolean; ok boolean;
begin
 if auth.uid() is null then return jsonb_build_object('enabled',false); end if;
 c:=public.current_active_company_scope_id();
 select m.workspace_role into member_role from public.sales_company_memberships m
 join public.profiles p on p.id=m.user_id where m.company_id=c and m.user_id=auth.uid()
 and p.approved and not coalesce(p.deactivated,false) and p.role in ('admin','member','ansatt','firmaadmin');
 is_admin:=coalesce(member_role='firmaadmin',false);
 select a.role into grant_role from public.kshms_member_access a where a.company_id=c and a.user_id=auth.uid() and a.enabled;
 select coalesce(a.enabled,false) into is_enabled from public.company_module_access a where a.company_id=c and a.module_key='kshms';
 ok:=member_role is not null and coalesce(is_enabled,false) and (is_admin or grant_role is not null);
 return jsonb_build_object('company_id',c,'company_name',(select display_name from public.sales_company_scopes where id=c),
 'user_id',auth.uid(),'enabled',ok,'manage',ok and (is_admin or grant_role='responsible'),
 'publish',ok and is_admin,'responsible',ok and exists(select 1 from public.kshms_settings s where s.company_id=c and s.responsible_user_id=auth.uid() and grant_role='responsible'));
end $$;
create function kshms_private.require_context(expected_company uuid, management boolean default false, approval boolean default false) returns jsonb
language plpgsql security definer set search_path='' as $$ declare x jsonb; begin
 x:=kshms_private.context();
 if not coalesce((x->>'enabled')::boolean,false) or expected_company is null or (x->>'company_id')::uuid<>expected_company
 or (management and not coalesce((x->>'manage')::boolean,false)) or (approval and not coalesce((x->>'publish')::boolean,false)) then
  raise exception 'KS/HMS access denied or work profile changed' using errcode='42501';
 end if; return x;
end $$;
create function public.get_kshms_context() returns jsonb language sql security definer set search_path='' as $$ select kshms_private.context() $$;
create function public.kshms_admin_firms() returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if not public.current_profile_is_systemadmin() then raise exception 'Systemadmin required' using errcode='42501'; end if;
 return (select coalesce(jsonb_agg(jsonb_build_object('id',s.id,'name',s.display_name,'enabled',coalesce(a.enabled,false)) order by s.display_name),'[]')
 from public.sales_company_scopes s left join public.company_module_access a on a.company_id=s.id and a.module_key='kshms');
end $$;
create function public.kshms_activate(p_company_id uuid,p_enabled boolean) returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.current_profile_is_systemadmin() then raise exception 'Systemadmin required' using errcode='42501'; end if;
 if p_enabled is null then raise exception 'Enabled required'; end if;
 insert into public.company_module_access(company_id,module_key,enabled,granted_by) values(p_company_id,'kshms',p_enabled,auth.uid())
 on conflict(company_id,module_key) do update set enabled=excluded.enabled,granted_by=excluded.granted_by,updated_at=now();
 insert into public.kshms_audit(company_id,actor_id,action) values(p_company_id,auth.uid(),case when p_enabled then 'activate' else 'deactivate' end);
end $$;

create function public.kshms_get_state(p_company_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb; mg boolean;
begin
 x:=kshms_private.require_context(p_company_id); mg:=(x->>'manage')::boolean;
 return jsonb_build_object('context',x,
 'settings',(select to_jsonb(s) from public.kshms_settings s where s.company_id=p_company_id),
 'routines',(select coalesce(jsonb_agg(case when mg then to_jsonb(r) else jsonb_build_object('id',r.id,'company_id',r.company_id,'archived',r.archived) end order by r.updated_at desc),'[]') from public.kshms_routines r where r.company_id=p_company_id and (mg or exists(select 1 from public.kshms_assignments a where a.company_id=p_company_id and a.user_id=auth.uid() and a.version_id in(select id from public.kshms_versions where routine_id=r.id)))),
 'versions',(select coalesce(jsonb_agg(to_jsonb(v) order by v.number desc),'[]') from public.kshms_versions v where v.company_id=p_company_id and (mg or exists(select 1 from public.kshms_assignments a where a.version_id=v.id and a.user_id=auth.uid()))),
 'assignments',(select coalesce(jsonb_agg(to_jsonb(a)),'[]') from public.kshms_assignments a where a.company_id=p_company_id and (mg or a.user_id=auth.uid())),
 'acknowledgments',(select coalesce(jsonb_agg(to_jsonb(a)),'[]') from public.kshms_acknowledgments a where a.company_id=p_company_id and (mg or a.user_id=auth.uid())),
 'reviews',(select coalesce(jsonb_agg(to_jsonb(r) order by r.signed_at desc),'[]') from public.kshms_reviews r where r.company_id=p_company_id and mg),
 'members',(select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'email',p.email,'workspace_role',m.workspace_role,'role',a.role,'enabled',coalesce(a.enabled,false)) order by p.email),'[]') from public.sales_company_memberships m join public.profiles p on p.id=m.user_id left join public.kshms_member_access a on a.company_id=m.company_id and a.user_id=m.user_id where m.company_id=p_company_id and p.approved and not coalesce(p.deactivated,false) and p.role in ('admin','member','ansatt','firmaadmin') and mg));
end $$;

create function kshms_private.validate_draft(d jsonb) returns void language plpgsql set search_path='' as $$ declare k text; ref jsonb; begin
 if jsonb_typeof(d) is distinct from 'object' or octet_length(d::text)>100000 then raise exception 'Invalid routine'; end if;
 foreach k in array array['title','chapter','goal','responsibility','procedure','documentation','confirmation'] loop
  if jsonb_typeof(d->k) is distinct from 'string' or length(trim(coalesce(d->>k,'')))=0 or length(d->>k)>20000 then raise exception 'Missing/invalid routine field: %',k; end if;
 end loop;
 if jsonb_typeof(d->'references') is distinct from 'array' then raise exception 'References must be an array'; end if;
 for ref in select value from jsonb_array_elements(d->'references') loop
  if coalesce(ref->>'url','') !~ '^https://' or coalesce(ref->>'kind','') not in ('law','professional','company','product') or coalesce(ref->>'checked_on','') !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'Invalid source reference'; end if;
  if (ref->>'checked_on')::date > current_date then raise exception 'Source cannot be checked in the future'; end if;
 end loop;
end $$;

create function public.kshms_command(p_company_id uuid,p_action text,p_payload jsonb default '{}') returns jsonb
language plpgsql security definer set search_path='' as $$
declare x jsonb; r public.kshms_routines%rowtype; v public.kshms_versions%rowtype; s public.kshms_settings%rowtype;
 target uuid; enabled boolean; access_role text; next_date date; result jsonb:='{}'; object_id uuid;
begin
 x:=kshms_private.require_context(p_company_id,p_action<>'ack',p_action in ('access','publish','archive'));
 -- Serialize firm permission/assignment/settings changes and snapshots, including activation races.
 perform 1 from public.company_module_access where company_id=p_company_id and module_key='kshms' for update;
 x:=kshms_private.require_context(p_company_id,p_action<>'ack',p_action in ('access','publish','archive'));
 if p_action='access' then
  target:=(p_payload->>'user_id')::uuid; enabled:=(p_payload->>'enabled')::boolean; access_role:=p_payload->>'role';
  if enabled is null or access_role not in ('reader','responsible') or not exists(select 1 from public.sales_company_memberships m join public.profiles p on p.id=m.user_id where m.company_id=p_company_id and m.user_id=target and p.approved and not coalesce(p.deactivated,false) and p.role in ('admin','member','ansatt','firmaadmin')) then raise exception 'Invalid internal member'; end if;
  insert into public.kshms_member_access(company_id,user_id,role,enabled,changed_by) values(p_company_id,target,access_role,enabled,auth.uid())
  on conflict(company_id,user_id) do update set role=excluded.role,enabled=excluded.enabled,changed_by=excluded.changed_by,changed_at=now();
  object_id:=target;
 elsif p_action='settings' then
  select * into s from public.kshms_settings where company_id=p_company_id for update;
  if coalesce(s.revision,0)<>coalesce((p_payload->>'revision')::bigint,0) then raise exception 'Settings changed; reload' using errcode='40001'; end if;
  target:=(p_payload->>'responsible_user_id')::uuid;
  if not (x->>'publish')::boolean and (s.company_id is null or s.responsible_user_id is distinct from target) then raise exception 'Firmaadmin appoints KS/HMS responsible' using errcode='42501'; end if;
  if not exists(select 1 from public.kshms_member_access a join public.sales_company_memberships m on m.company_id=a.company_id and m.user_id=a.user_id join public.profiles p on p.id=m.user_id where a.company_id=p_company_id and a.user_id=target and a.enabled and a.role='responsible' and p.approved and not coalesce(p.deactivated,false)) then raise exception 'Choose an enabled KS/HMS responsible'; end if;
  if jsonb_typeof(p_payload->'trades') is distinct from 'array' or jsonb_array_length(p_payload->'trades')=0 or exists(select 1 from jsonb_array_elements_text(p_payload->'trades') t where t not in ('mur_flis','tomrer','maler','vvs')) then raise exception 'Choose supported trades'; end if;
  insert into public.kshms_settings(company_id,trades,activities,responsibilities,risks,responsible_user_id,updated_by)
  values(p_company_id,array(select jsonb_array_elements_text(p_payload->'trades')),coalesce(p_payload->>'activities',''),coalesce(p_payload->>'responsibilities',''),coalesce(p_payload->>'risks',''),target,auth.uid())
  on conflict(company_id) do update set revision=public.kshms_settings.revision+1,trades=excluded.trades,activities=excluded.activities,responsibilities=excluded.responsibilities,risks=excluded.risks,responsible_user_id=excluded.responsible_user_id,updated_by=excluded.updated_by,updated_at=now();
 elsif p_action='save' then
  perform kshms_private.validate_draft(p_payload->'draft');
  object_id:=nullif(p_payload->>'id','')::uuid;
  if object_id is null then
   insert into public.kshms_routines(company_id,draft,created_by,updated_by) values(p_company_id,p_payload->'draft',auth.uid(),auth.uid()) returning * into r;
  else
   select * into r from public.kshms_routines where id=object_id and company_id=p_company_id for update;
   if r.id is null or r.revision<>coalesce((p_payload->>'revision')::bigint,-1) then raise exception 'Routine changed; reload before saving' using errcode='40001'; end if;
   if r.archived then raise exception 'Archived routine: copy it to create a new draft'; end if;
   update public.kshms_routines set draft=p_payload->'draft',revision=revision+1,updated_by=auth.uid(),updated_at=now() where id=r.id returning * into r;
  end if;
  object_id:=r.id; result:=to_jsonb(r);
 elsif p_action in ('publish','archive') then
  object_id:=(p_payload->>'id')::uuid;
  select * into r from public.kshms_routines where id=object_id and company_id=p_company_id for update;
  if r.id is null or r.revision<>coalesce((p_payload->>'revision')::bigint,-1) then raise exception 'Routine changed; reload' using errcode='40001'; end if;
  if p_action='archive' then
   update public.kshms_routines set archived=true,revision=revision+1,updated_by=auth.uid(),updated_at=now() where id=r.id;
  else
   if r.archived then raise exception 'Archived routine'; end if;
   perform kshms_private.validate_draft(r.draft);
   if length(trim(coalesce(p_payload->>'change_summary','')))<5 then raise exception 'Explain the publication/change'; end if;
   if not exists(select 1 from public.kshms_settings where company_id=p_company_id) then raise exception 'Complete company setup first'; end if;
   insert into public.kshms_versions(company_id,routine_id,number,content,content_hash,change_summary,published_by,requires_ack)
   select p_company_id,r.id,coalesce(max(number),0)+1,r.draft,encode(sha256(convert_to(r.draft::text,'UTF8')),'hex'),p_payload->>'change_summary',auth.uid(),coalesce(max(number),0)=0 or coalesce((p_payload->>'requires_ack')::boolean,true) from public.kshms_versions where routine_id=r.id returning * into v;
   -- Initial/significant versions require fresh acknowledgments; old records remain immutable.
   insert into public.kshms_assignments(company_id,version_id,user_id,assigned_by)
   select p_company_id,v.id,m.user_id,auth.uid() from public.sales_company_memberships m join public.profiles p on p.id=m.user_id
   left join public.kshms_member_access a on a.company_id=m.company_id and a.user_id=m.user_id
   where m.company_id=p_company_id and p.approved and not coalesce(p.deactivated,false) and p.role in ('admin','member','ansatt','firmaadmin')
   and (m.workspace_role='firmaadmin' or a.enabled);
   update public.kshms_routines set revision=revision+1,updated_at=now(),updated_by=auth.uid() where id=r.id;
   result:=to_jsonb(v);
  end if;
 elsif p_action='assign' then
  object_id:=(p_payload->>'version_id')::uuid; target:=(p_payload->>'user_id')::uuid;
  if not exists(select 1 from public.kshms_versions dbv join public.kshms_routines dbr on dbr.id=dbv.routine_id where dbv.company_id=p_company_id and dbv.id=object_id and not dbr.archived) or not exists(select 1 from public.sales_company_memberships m join public.profiles p on p.id=m.user_id left join public.kshms_member_access a on a.company_id=m.company_id and a.user_id=m.user_id where m.company_id=p_company_id and m.user_id=target and p.approved and not coalesce(p.deactivated,false) and p.role in ('admin','member','ansatt','firmaadmin') and (a.enabled or m.workspace_role='firmaadmin')) then raise exception 'Invalid assignment'; end if;
  insert into public.kshms_assignments(company_id,version_id,user_id,assigned_by) values(p_company_id,object_id,target,auth.uid()) on conflict do nothing;
 elsif p_action='ack' then
  object_id:=(p_payload->>'version_id')::uuid;
  if p_payload->>'statement'<>'Jeg har gjennomgått denne rutineversjonen, forstår mitt ansvar og vil følge rutinen. Jeg ber om forklaring eller nødvendig opplæring dersom noe er uklart, og melder fra om farlige forhold og avvik. Bekreftelsen dokumenterer gjennomgang; den erstatter ikke opplæring eller faktisk utførelse.' then raise exception 'Confirmation statement required'; end if;
  if not exists(select 1 from public.kshms_assignments a where a.company_id=p_company_id and a.user_id=auth.uid() and a.version_id=object_id) then raise exception 'Version not assigned to you' using errcode='42501'; end if;
  insert into public.kshms_acknowledgments(company_id,version_id,user_id,statement) values(p_company_id,object_id,auth.uid(),p_payload->>'statement') on conflict do nothing;
 elsif p_action='review' then
  if not coalesce((x->>'responsible')::boolean,false) then raise exception 'Designated KS/HMS responsible signs the annual review' using errcode='42501'; end if;
  next_date:=(p_payload->>'next_review_on')::date;
  if next_date is null or next_date<=current_date or next_date>(current_date+interval '1 year')::date or length(trim(coalesce(p_payload->>'findings','')))<10 or length(trim(coalesce(p_payload->>'follow_up','')))<10 then raise exception 'Review findings, follow-up and next date (within one year) required'; end if;
  if not exists(select 1 from public.kshms_versions dbv join public.kshms_routines dbr on dbr.id=dbv.routine_id where dbv.company_id=p_company_id and not dbr.archived) then raise exception 'No active published handbook to review'; end if;
  if coalesce((p_payload->>'settings_revision')::bigint,-1)<>(select revision from public.kshms_settings where company_id=p_company_id) or coalesce(p_payload->'version_snapshot','null')<>(select coalesce(jsonb_agg(jsonb_build_object('id',dbv.id,'hash',dbv.content_hash) order by dbv.id),'[]') from public.kshms_versions dbv join public.kshms_routines dbr on dbr.id=dbv.routine_id where dbv.company_id=p_company_id and not dbr.archived and dbv.number=(select max(number) from public.kshms_versions where routine_id=dbv.routine_id)) then raise exception 'Handbook changed during review; reload' using errcode='40001'; end if;
  insert into public.kshms_reviews(company_id,signed_by,version_snapshot,findings,follow_up,next_review_on,statement)
  values(p_company_id,auth.uid(),p_payload->'version_snapshot',p_payload->>'findings',p_payload->>'follow_up',next_date,'Jeg har gjennomgått de oppførte rutineversjonene, vurdert relevans, endringer og etterlevelse, og registrert funn og videre oppfølging. Revisjonen er ikke en godkjenning fra myndighetene.') returning id into object_id;
  update public.kshms_settings set next_review_on=next_date,revision=revision+1,updated_at=now(),updated_by=auth.uid() where company_id=p_company_id;
 else raise exception 'Unsupported KS/HMS action'; end if;
 insert into public.kshms_audit(company_id,actor_id,action,object_id) values(p_company_id,auth.uid(),p_action,object_id);
 return result;
end $$;

revoke all on all functions in schema kshms_private from public,anon,authenticated;
revoke all on function public.get_kshms_context(),public.kshms_admin_firms(),public.kshms_activate(uuid,boolean),public.kshms_get_state(uuid),public.kshms_command(uuid,text,jsonb) from public,anon;
grant execute on function public.get_kshms_context(),public.kshms_admin_firms(),public.kshms_activate(uuid,boolean),public.kshms_get_state(uuid),public.kshms_command(uuid,text,jsonb) to authenticated;
