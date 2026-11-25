-- Isolated, read-only controller links; existing customer/UE access is unchanged.
create schema if not exists controller_private;
revoke all on schema controller_private from public,anon,authenticated;
create table controller_private.links(
 id uuid primary key, project_id uuid not null references public.projects(id) on delete cascade,
 company_id uuid not null, name text not null check(length(name) between 1 and 160),
 code_hash bytea not null, expires_at timestamptz not null check(isfinite(expires_at)),
 revoked_at timestamptz, revision bigint not null default 1,
 created_at timestamptz not null default now(), created_by uuid not null references auth.users(id),
 updated_at timestamptz not null default now(), updated_by uuid not null references auth.users(id)
);
create index controller_links_project on controller_private.links(project_id,created_at desc);
alter table controller_private.links enable row level security;
revoke all on controller_private.links from public,anon,authenticated;
create function controller_private.project_access(pid uuid) returns public.projects
language plpgsql security definer set search_path='' as $$declare p public.projects%rowtype;begin
 select * into p from public.projects where id=pid;
 if auth.uid() is null or p.id is null or p.company_scope_id is distinct from public.current_active_company_scope_id()
 or not coalesce(public.project_row_access_allowed(p.company_scope_id,p.user_id),false)
 then raise exception 'Du har ikke tilgang til å dele dette prosjektet.' using errcode='42501';end if;
 return p;end;$$;
revoke all on function controller_private.project_access(uuid) from public,anon,authenticated;
create function public.controller_access_list(p_project_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$declare p public.projects%rowtype;result jsonb;begin
 p:=controller_private.project_access(p_project_id);
 select coalesce(jsonb_agg(jsonb_build_object('id',l.id,'name',l.name,'expires_at',l.expires_at,'revoked_at',l.revoked_at,'revision',l.revision) order by l.created_at desc),'[]') into result from controller_private.links l where l.project_id=p.id and l.company_id=p.company_scope_id;
 return result;end;$$;
create function public.controller_access_command(p_project_id uuid,p_action text,p_id uuid,p_code text,p_name text,p_expires_at timestamptz,p_revision bigint) returns jsonb
language plpgsql security definer set search_path='' as $$declare p public.projects%rowtype;l controller_private.links%rowtype;begin
 p:=controller_private.project_access(p_project_id);
 if p_id is null or p_action not in ('create','extend','rotate','revoke') then raise exception 'Ugyldig handling.';end if;
 if p_action in ('create','extend') and (p_expires_at is null or not isfinite(p_expires_at) or p_expires_at<=clock_timestamp()) then raise exception 'Velg en utløpsdato i fremtiden.';end if;
 if p_action in ('create','rotate') and (p_code is null or p_code !~ '^[A-F0-9]{32}$') then raise exception 'Tilgangskoden må genereres på nytt.';end if;
 if p_action='create' then
  if nullif(trim(p_name),'') is null or length(trim(p_name))>160 or p_revision is distinct from 0 then raise exception 'Skriv kontrollørens navn eller firma.';end if;
  insert into controller_private.links(id,project_id,company_id,name,code_hash,expires_at,created_by,updated_by)
  values(p_id,p.id,p.company_scope_id,trim(p_name),sha256(convert_to(p_code,'UTF8')),p_expires_at,auth.uid(),auth.uid()) on conflict(id) do nothing;
  select * into l from controller_private.links where id=p_id for update;
  if l.project_id<>p.id or l.company_id<>p.company_scope_id or l.created_by<>auth.uid() or l.code_hash<>sha256(convert_to(p_code,'UTF8')) or l.name<>trim(p_name) or l.expires_at<>p_expires_at or l.revoked_at is not null then raise exception 'Tilgangen er endret. Oppdater siden.' using errcode='40001';end if;
 else
  select * into l from controller_private.links where id=p_id and project_id=p.id and company_id=p.company_scope_id for update;
  if l.id is null then raise exception 'Tilgangen finnes ikke i dette prosjektet.' using errcode='42501';end if;
  if l.revision is distinct from p_revision or l.revoked_at is not null then raise exception 'Tilgangen er endret. Oppdater siden.' using errcode='40001';end if;
  update controller_private.links set expires_at=case when p_action='extend' then p_expires_at else expires_at end,
   code_hash=case when p_action='rotate' then sha256(convert_to(p_code,'UTF8')) else code_hash end,
   revoked_at=case when p_action='revoke' then clock_timestamp() else revoked_at end,
   revision=revision+1,updated_at=clock_timestamp(),updated_by=auth.uid() where id=p_id returning * into l;
 end if;
 return jsonb_build_object('id',l.id,'revision',l.revision);end;$$;
create function public.controller_project_read(p_link_id uuid,p_code text) returns jsonb
language plpgsql security definer set search_path='' as $$declare l controller_private.links%rowtype;p public.projects%rowtype;d jsonb;pr jsonb;cp jsonb;wr jsonb;runs jsonb;products jsonb;controls jsonb;begin
 select * into l from controller_private.links where id=p_link_id and revoked_at is null and expires_at>clock_timestamp() and code_hash=sha256(convert_to(upper(regexp_replace(coalesce(p_code,''),'\s+','','g')),'UTF8'));
 if l.id is null then return jsonb_build_object('ok',false,'error','invalid_or_expired');end if;
 select * into p from public.projects where id=l.project_id and company_scope_id=l.company_id;
 if p.id is null or not exists(select 1 from public.profiles where id=l.created_by and approved and not coalesce(deactivated,false)) then return jsonb_build_object('ok',false,'error','invalid_or_expired');end if;
 d:=coalesce(p.data,'{}');
 select coalesce(jsonb_object_agg(key,value),'{}') into pr from jsonb_each(coalesce(d->'project','{}')) where key in ('projectName','address','postnr','city','workflowType','simpleOrder','fall','fallDusj','fallUtenfor','sluk','terskel','membran','prosjekteringKommentar','prosjekteringPunkter','customChecklistGroups','kshmsChecklistInstances');
 select coalesce(jsonb_object_agg(key,value),'{}') into cp from jsonb_each(coalesce(d->'company','{}')) where key in ('name','companyName','logoUrl');
 select coalesce(jsonb_object_agg(key,value),'{}') into wr from jsonb_each(coalesce(d->'warranty','{}')) where key in ('enabled','system','durationYears','issued');
 select coalesce(jsonb_agg(jsonb_build_object('id',r.id,'category',r.category,'definition',r.definition,'answers',r.answers,'status',r.status,'updated_at',r.updated_at,'completed_at',r.completed_at) order by r.sequence desc),'[]') into runs from kshms_private.project_checklist_runs r where r.project_id=p.id and r.company_id=l.company_id;
 select coalesce(jsonb_agg(x.definition),'[]') into products from (
 select jsonb_build_object('category','Sopro garantikontrollpunkter – '||coalesce(nullif(trim(m.app_match_name),''),m.product_name),'items',jsonb_agg(c.checkpoint_text order by c.sort_order,c.id)) as definition
 from public.product_document_master m join public.product_master_checkpoints c on c.product_no=m.product_no
 where coalesce((wr->>'enabled')::boolean,false) and nullif(wr->>'system','') is not null
 and coalesce(c.checkpoint_type,'garanti')='garanti' and coalesce(c.guarantee_system,'all') in ('all',wr->>'system')
 and exists(select 1 from jsonb_each(coalesce(d->'checked','{}')) v where v.value='true'::jsonb and v.key in (m.app_match_name,m.product_name,m.product_family))
 group by m.product_no,m.app_match_name,m.product_name) x;
 select coalesce(jsonb_agg(jsonb_build_object('id',e.id,'status',e.status,'updated_at',e.updated_at,'completed_at',e.completed_at,'content',jsonb_build_object('title',e.content->'title','points',e.content->'points','answers',e.content->'answers','review',e.content->'review','reference',e.content->'reference')) order by e.updated_at desc),'[]') into controls from public.kshms_executions e where e.project_id=p.id and e.company_id=l.company_id and e.kind='round';
 return jsonb_build_object('ok',true,'expires_at',l.expires_at,'server_now',clock_timestamp(),'name',l.name,'data',jsonb_build_object('company',cp,'project',pr,'warranty',wr,'checklist',coalesce(d->'checklist','{}'),'photos',coalesce(d->'photos','[]'),'files',coalesce(d->'files','[]'),'runs',runs,'product_checklists',products,'controls',controls));end;$$;
revoke all on function public.controller_access_list(uuid),public.controller_access_command(uuid,text,uuid,text,text,timestamptz,bigint),public.controller_project_read(uuid,text) from public,anon,authenticated;
grant execute on function public.controller_access_list(uuid),public.controller_access_command(uuid,text,uuid,text,text,timestamptz,bigint) to authenticated;
-- Intentionally public, capability-gated read endpoint. No write endpoint for controllers.
grant execute on function public.controller_project_read(uuid,text) to anon,authenticated;
