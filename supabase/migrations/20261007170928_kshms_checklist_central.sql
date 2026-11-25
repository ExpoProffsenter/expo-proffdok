-- Firm-managed templates; immutable published versions. Projects retain copies.
create table public.kshms_checklist_templates (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.sales_company_scopes(id),
 revision bigint not null default 1, draft jsonb not null, archived boolean not null default false,
 created_by uuid not null references public.profiles(id), updated_by uuid not null references public.profiles(id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(company_id,id)
);
create index kshms_checklist_templates_created_by_idx on public.kshms_checklist_templates(created_by);
create index kshms_checklist_templates_updated_by_idx on public.kshms_checklist_templates(updated_by);
create table public.kshms_checklist_versions (
 id uuid primary key default gen_random_uuid(), company_id uuid not null,
 template_id uuid not null, number integer not null check(number>0), content jsonb not null, content_hash text not null,
 published_by uuid not null references public.profiles(id), published_identity jsonb not null, published_at timestamptz not null default now(),
 foreign key(company_id,template_id) references public.kshms_checklist_templates(company_id,id), unique(template_id,number), unique(company_id,id)
);
create index kshms_checklist_versions_company_template_idx on public.kshms_checklist_versions(company_id,template_id);
create index kshms_checklist_versions_published_by_idx on public.kshms_checklist_versions(published_by);
create table public.kshms_checklist_commands (
 company_id uuid not null references public.sales_company_scopes(id), request_id uuid not null, actor_id uuid not null references public.profiles(id),
 payload_hash text not null, result jsonb not null, created_at timestamptz not null default now(), primary key(company_id,request_id)
);
create index kshms_checklist_commands_actor_idx on public.kshms_checklist_commands(actor_id);
alter table public.kshms_checklist_templates enable row level security;
alter table public.kshms_checklist_versions enable row level security;
alter table public.kshms_checklist_commands enable row level security;
revoke all on public.kshms_checklist_templates,public.kshms_checklist_versions,public.kshms_checklist_commands from public,anon,authenticated;
create trigger immutable_checklist_version before update or delete on public.kshms_checklist_versions for each row execute function kshms_private.immutable_record();
create trigger immutable_checklist_command before update or delete on public.kshms_checklist_commands for each row execute function kshms_private.immutable_record();

create function kshms_private.checklist_content(p_content jsonb) returns jsonb language plpgsql immutable set search_path='' as $$
declare result jsonb; point jsonb; clean jsonb; points jsonb:='[]'; titles text[]:='{}'; ids uuid[]:='{}'; point_id uuid; title text;
begin
 if jsonb_typeof(p_content) is distinct from 'object' or length(trim(coalesce(p_content->>'title',''))) not between 1 and 160
 or coalesce(p_content->>'trade','') not in ('Rørlegger','Tømrer','Elektriker','Murer/flislegger','Maler','Ventilasjon','Annet fag')
 or length(trim(coalesce(p_content->>'instructions','')))>4000 or jsonb_typeof(p_content->'points') is distinct from 'array' then raise exception 'Skriv navn, velg fag og legg inn sjekkpunkter.'; end if;
 if jsonb_array_length(p_content->'points') not between 1 and 100 then raise exception 'Legg inn 1–100 sjekkpunkter.'; end if;
 for point in select value from jsonb_array_elements(p_content->'points') loop
  point_id:=nullif(point->>'id','')::uuid;title:=trim(coalesce(point->>'title',''));
  if point_id is null or point_id=any(ids) or length(title) not between 1 and 600 or lower(title)=any(titles)
  or length(trim(coalesce(point->>'guidance','')))>2000
  or (point ? 'image_required' and jsonb_typeof(point->'image_required')<>'boolean')
  or (point ? 'comment_required' and jsonb_typeof(point->'comment_required')<>'boolean') then raise exception 'Hvert sjekkpunkt må ha egen tekst og gyldige felt.'; end if;
  clean:=jsonb_build_object('id',point_id,'title',title,'guidance',trim(coalesce(point->>'guidance','')),
   'image_required',coalesce((point->>'image_required')::boolean,false),'comment_required',coalesce((point->>'comment_required')::boolean,false));
  points:=points||jsonb_build_array(clean);ids:=array_append(ids,point_id);titles:=array_append(titles,lower(title));
 end loop;
 result:=jsonb_build_object('title',trim(p_content->>'title'),'trade',p_content->>'trade','instructions',trim(coalesce(p_content->>'instructions','')),'points',points);
 return result;
end $$;

create function public.kshms_checklist_state(p_company_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb;begin
 x:=kshms_private.require_context(p_company_id,true);
 return jsonb_build_object('context',x,'templates',coalesce((select jsonb_agg(to_jsonb(t) order by t.updated_at desc,t.id) from public.kshms_checklist_templates t where t.company_id=p_company_id),'[]'::jsonb),
 'versions',coalesce((select jsonb_agg(to_jsonb(v) order by v.published_at desc,v.id) from public.kshms_checklist_versions v where v.company_id=p_company_id and v.number=(select max(v2.number) from public.kshms_checklist_versions v2 where v2.template_id=v.template_id)),'[]'::jsonb));
end $$;

create function public.kshms_checklist_command(p_company_id uuid,p_action text,p_request_id uuid,p_payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb; t public.kshms_checklist_templates%rowtype; v public.kshms_checklist_versions%rowtype; receipt public.kshms_checklist_commands%rowtype;
 content jsonb; content_hash text; payload_hash text; template_id uuid; result jsonb;
begin
 x:=kshms_private.require_context(p_company_id,true,p_action='publish');
 perform 1 from public.company_module_access where company_id=p_company_id and module_key='kshms' for update;
 x:=kshms_private.require_context(p_company_id,true,p_action='publish');
 if p_request_id is null or p_action not in ('save','publish','archive') or jsonb_typeof(p_payload) is distinct from 'object' then raise exception 'Invalid checklist command'; end if;
 payload_hash:=encode(sha256(convert_to(p_action||p_payload::text,'UTF8')),'hex');
 select * into receipt from public.kshms_checklist_commands where company_id=p_company_id and request_id=p_request_id;
 if found then
  if receipt.actor_id<>auth.uid() or receipt.payload_hash<>payload_hash then raise exception 'Request reused with different content' using errcode='40001'; end if;
  return receipt.result;
 end if;
 template_id:=(p_payload->>'id')::uuid;
 if template_id is null then raise exception 'Missing checklist id'; end if;
 select * into t from public.kshms_checklist_templates where id=template_id and company_id=p_company_id for update;
 if not found then
  if p_action='archive' or coalesce((p_payload->>'revision')::bigint,-1)<>0 then raise exception 'Sjekklisten er endret. Oppdater og sammenlign teksten.' using errcode='40001'; end if;
  content:=kshms_private.checklist_content(p_payload->'content');
  insert into public.kshms_checklist_templates(id,company_id,draft,created_by,updated_by) values(template_id,p_company_id,content,auth.uid(),auth.uid()) returning * into t;
 else
  if t.archived or t.revision<>coalesce((p_payload->>'revision')::bigint,-1) then raise exception 'Sjekklisten er endret eller arkivert. Oppdater og sammenlign teksten.' using errcode='40001'; end if;
  if p_action='archive' then
   update public.kshms_checklist_templates set archived=true,revision=revision+1,updated_by=auth.uid(),updated_at=now() where id=t.id returning * into t;
  else
   content:=kshms_private.checklist_content(p_payload->'content');
   update public.kshms_checklist_templates set draft=content,revision=revision+1,updated_by=auth.uid(),updated_at=now() where id=t.id returning * into t;
  end if;
 end if;
 if p_action='publish' then
  content_hash:=encode(sha256(convert_to(content::text,'UTF8')),'hex');
  select * into v from public.kshms_checklist_versions where company_id=p_company_id and template_id=t.id order by number desc limit 1;
  if v.id is null or v.content_hash<>content_hash then
   insert into public.kshms_checklist_versions(company_id,template_id,number,content,content_hash,published_by,published_identity)
   values(p_company_id,t.id,coalesce(v.number,0)+1,content,content_hash,auth.uid(),kshms_private.identity_snapshot(auth.uid())) returning * into v;
  end if;
 end if;
 result:=jsonb_build_object('template',to_jsonb(t),'version',case when v.id is null then null else to_jsonb(v) end);
 insert into public.kshms_checklist_commands(company_id,request_id,actor_id,payload_hash,result) values(p_company_id,p_request_id,auth.uid(),payload_hash,result);
 insert into public.kshms_audit(company_id,actor_id,action,object_id) values(p_company_id,auth.uid(),'checklist-'||p_action,t.id);
 return result;
end $$;

-- Published intake follows company activation + existing project rights, not a personal KS/HMS grant.
create function public.kshms_project_checklists(p_company_id uuid,p_project_id uuid,p_version_id uuid default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare project_row public.projects%rowtype; enabled boolean; versions jsonb; x jsonb;begin
 select * into project_row from public.projects where id=p_project_id;
 if auth.uid() is null or p_company_id is null or project_row.id is null
 or p_company_id is distinct from public.current_active_company_scope_id() or project_row.company_scope_id is distinct from p_company_id
 or not public.project_row_access_allowed(project_row.company_scope_id,project_row.user_id)
 or not exists(select 1 from public.sales_company_memberships m join public.profiles p on p.id=m.user_id where m.user_id=auth.uid() and m.company_id=p_company_id and m.workspace_role in ('firmaadmin','ansatt','admin','member') and p.approved and not coalesce(p.deactivated,false) and p.role in ('admin','member','ansatt','firmaadmin')) then raise exception 'Prosjektet er ikke tilgjengelig i aktivt firma.' using errcode='42501'; end if;
 select coalesce(a.enabled,false) into enabled from public.company_module_access a where a.company_id=p_company_id and a.module_key='kshms';
 enabled:=coalesce(enabled,false);
 x:=jsonb_build_object('user_id',auth.uid(),'company_id',p_company_id,'project_id',p_project_id,'enabled',enabled);
 if not enabled then return jsonb_build_object('context',x,'versions','[]'::jsonb); end if;
 select coalesce(jsonb_agg(to_jsonb(v) order by v.content->>'trade',v.content->>'title',v.id),'[]'::jsonb) into versions
 from public.kshms_checklist_versions v join public.kshms_checklist_templates t on t.id=v.template_id and t.company_id=v.company_id
 where v.company_id=p_company_id and not t.archived and (p_version_id is null or v.id=p_version_id)
 and v.number=(select max(v2.number) from public.kshms_checklist_versions v2 where v2.template_id=v.template_id);
 if p_version_id is not null and jsonb_array_length(versions)=0 then raise exception 'Sjekklisten er endret eller arkivert. Oppdater listen og prøv igjen.'; end if;
 return jsonb_build_object('context',x,'versions',versions);
end $$;
revoke all on function kshms_private.checklist_content(jsonb) from public,anon,authenticated;
revoke all on function public.kshms_checklist_state(uuid),public.kshms_checklist_command(uuid,text,uuid,jsonb),public.kshms_project_checklists(uuid,uuid,uuid) from public,anon;
grant execute on function public.kshms_checklist_state(uuid),public.kshms_checklist_command(uuid,text,uuid,jsonb),public.kshms_project_checklists(uuid,uuid,uuid) to authenticated;
notify pgrst,'reload schema';
