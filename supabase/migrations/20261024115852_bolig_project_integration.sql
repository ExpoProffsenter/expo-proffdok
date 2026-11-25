-- Explicit integration. Existing projects, task engines and authorizers stay unchanged.
create table bolig_private.project_links(
 root_id uuid primary key references bolig_private.roots(id),project_id uuid unique references public.projects(id) on delete set null,
 revision bigint not null default 1,created_by uuid not null references auth.users(id),created_at timestamptz not null default now());
create index bolig_project_links_creator on bolig_private.project_links(created_by);
create table bolig_private.project_link_receipts(
 request_id uuid primary key,root_id uuid not null references bolig_private.roots(id),actor uuid not null references auth.users(id),
 action text not null,payload jsonb not null,created_at timestamptz not null default now());
create index bolig_project_link_receipts_root on bolig_private.project_link_receipts(root_id);
create index bolig_project_link_receipts_actor on bolig_private.project_link_receipts(actor);
alter table bolig_private.project_links enable row level security;
alter table bolig_private.project_link_receipts enable row level security;
revoke all on bolig_private.project_links,bolig_private.project_link_receipts from public,anon,authenticated,service_role;

create function bolig_private.project_integration(c uuid,root uuid,action text,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare ctx jsonb;r bolig_private.roots%rowtype;l bolig_private.project_links%rowtype;
 receipt bolig_private.project_link_receipts%rowtype;p public.projects%rowtype;rid uuid;pid uuid;ks jsonb;query text;
begin
 ctx:=bolig_private.context(c);
 if auth.uid() is null or not coalesce((ctx->>'enabled')::boolean,false) then raise exception 'Boligtilgang kreves.' using errcode='42501';end if;
 select * into r from bolig_private.roots where id=root and company_id=c for share;
 if not found then raise exception 'Prosjektet er ikke tilgjengelig i dette firmaet.' using errcode='42501';end if;
 if action is null or action not in('get','link','create') or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>4000 then raise exception 'Ugyldig prosjektkobling.' using errcode='22023';end if;
 query:=left(coalesce(payload->>'query',''),100);
 perform pg_advisory_xact_lock(hashtextextended('bolig-project-link:'||root::text,0));
 select * into l from bolig_private.project_links where root_id=root;
 if action<>'get' then
  if ctx->>'role'<>'manager' or r.archived then raise exception 'Et aktivt prosjekt og prosjektledertilgang kreves.' using errcode='42501';end if;
  rid:=(payload->>'request_id')::uuid;if rid is null then raise exception 'Lagrings-ID mangler.' using errcode='22023';end if;
  select * into receipt from bolig_private.project_link_receipts where request_id=rid;
  if found then
   if receipt.root_id<>root or receipt.actor<>auth.uid() or receipt.action<>action or receipt.payload is distinct from payload then raise exception 'Lagringsforsøket er endret.' using errcode='PT409';end if;
  else
   if coalesce(l.revision,0) is distinct from (payload->>'revision')::bigint then raise exception 'Prosjektkoblingen er endret. Hent siste kobling.' using errcode='PT409';end if;
   if l.project_id is not null then raise exception 'Prosjektet er allerede koblet. Dokumentasjon og timer skal beholde samme prosjekt.' using errcode='22023';end if;
   pid:=(payload->>'project_id')::uuid;if pid is null then raise exception 'Velg et prosjekt.' using errcode='22023';end if;
   if action='create' then
    insert into public.projects(id,user_id,company_scope_id,title,data,share_enabled,locked)
    values(pid,auth.uid(),c,r.title,jsonb_build_object('projectName',r.title,'projectNumber',r.reference,
     'project',jsonb_build_object('projectName',r.title,'projectNumber',r.reference),'checklist','{}'::jsonb,
     'access',jsonb_build_object('portalEnabled',false)),false,false);
   end if;
   select * into p from public.projects where id=pid and company_scope_id=c and not coalesce(locked,false)
    and public.project_row_access_allowed(company_scope_id,user_id) for share;
   if not found then raise exception 'Velg et åpent prosjekt du har tilgang til i samme firma.' using errcode='42501';end if;
   if exists(select 1 from bolig_private.units where project_id=pid)
    or exists(select 1 from bolig_private.project_links where project_id=pid) then raise exception 'Prosjektet er allerede koblet til en bolig eller et annet boligprosjekt.' using errcode='22023';end if;
   insert into bolig_private.project_links(root_id,project_id,revision,created_by) values(root,pid,coalesce(l.revision,0)+1,auth.uid())
   on conflict(root_id) do update set project_id=excluded.project_id,revision=excluded.revision,created_by=excluded.created_by,created_at=now();
   insert into bolig_private.project_link_receipts values(rid,root,auth.uid(),action,payload,now());
   select * into l from bolig_private.project_links where root_id=root;
  end if;
 end if;
 begin ks:=public.get_kshms_context();exception when insufficient_privilege then ks:=null;end;
 if ks->>'company_id' is distinct from c::text or ks->>'user_id' is distinct from auth.uid()::text or not coalesce((ks->>'enabled')::boolean,false) then ks:=null;end if;
 return jsonb_build_object('context',ctx,'root_id',root,'revision',coalesce(l.revision,0),'receipt_id',rid,'ks_context',ks,
 'has_link',l.project_id is not null,'project',(select jsonb_build_object('id',p2.id,'title',coalesce(nullif(p2.data#>>'{project,projectName}',''),nullif(p2.data->>'projectName',''),p2.title,'Prosjekt'),'locked',coalesce(p2.locked,false))
  from public.projects p2 where p2.id=l.project_id and p2.company_scope_id=c and public.project_row_access_allowed(p2.company_scope_id,p2.user_id)
  and not exists(select 1 from bolig_private.units where project_id=p2.id)),
 'candidates',case when ctx->>'role'='manager' and l.project_id is null then coalesce((select jsonb_agg(to_jsonb(q) order by q.title,q.id) from
  (select pr.id,coalesce(nullif(pr.data#>>'{project,projectName}',''),nullif(pr.data->>'projectName',''),pr.title,'Prosjekt') title
   from public.projects pr where pr.company_scope_id=c and not coalesce(pr.locked,false) and public.project_row_access_allowed(pr.company_scope_id,pr.user_id)
   and concat_ws(' ',pr.title,pr.data#>>'{project,projectName}',pr.data->>'projectName',pr.data#>>'{project,projectNumber}',pr.data->>'projectNumber') ilike '%'||query||'%'
   and not exists(select 1 from bolig_private.units where project_id=pr.id) and not exists(select 1 from bolig_private.project_links where project_id=pr.id)
   order by title,pr.id limit 50) q),'[]'::jsonb) else '[]'::jsonb end);
end$$;
revoke all on function bolig_private.project_integration(uuid,uuid,text,jsonb) from public,anon;
grant execute on function bolig_private.project_integration(uuid,uuid,text,jsonb) to authenticated;
create function public.bolig_project_integration(p_company_id uuid,p_root_id uuid,p_action text default 'get',p_payload jsonb default '{}') returns jsonb
language sql security invoker set search_path='' as $$select bolig_private.project_integration(p_company_id,p_root_id,p_action,p_payload)$$;
revoke all on function public.bolig_project_integration(uuid,uuid,text,jsonb) from public,anon;
grant execute on function public.bolig_project_integration(uuid,uuid,text,jsonb) to authenticated;

create function bolig_private.integrated_scopes(c uuid) returns table(root_id uuid,unit_id uuid,project_id uuid)
language sql stable set search_path='' as $$
 select r.id,null::uuid,l.project_id from bolig_private.project_links l join bolig_private.roots r on r.id=l.root_id
 join public.projects pr on pr.id=l.project_id where r.company_id=c and not r.archived and pr.company_scope_id=c
 and not exists(select 1 from bolig_private.units where project_id=pr.id)
 union all
 select u.root_id,u.id,u.project_id from bolig_private.units u join bolig_private.roots r on r.id=u.root_id
 join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id
 join public.projects pr on pr.id=u.project_id where r.company_id=c and pr.company_scope_id=c and not r.archived and not u.archived and not e.archived and not b.archived
$$;
revoke all on function bolig_private.integrated_scopes(uuid) from public,anon,authenticated,service_role;

create function bolig_private.my_project_tasks(c uuid,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare ctx jsonb;ks jsonb;rows jsonb;total bigint;cursor text;next_cursor text;selected_row jsonb;
begin
 ctx:=bolig_private.context(c);
 if auth.uid() is null or not coalesce((ctx->>'enabled')::boolean,false) then raise exception 'Boligtilgang kreves.' using errcode='42501';end if;
 if jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>2000 then raise exception 'Ugyldig oppgavelesing.' using errcode='22023';end if;
 cursor:=coalesce(payload->>'after','');if length(cursor)>150 then raise exception 'Ugyldig neste side.' using errcode='22023';end if;
 begin ks:=public.get_kshms_context();exception when insufficient_privilege then ks:=null;end;
 if ks->>'company_id' is distinct from c::text or ks->>'user_id' is distinct from auth.uid()::text or not coalesce((ks->>'enabled')::boolean,false) then ks:=null;end if;
 with scopes as(select s.* from bolig_private.integrated_scopes(c) s join public.projects p on p.id=s.project_id where public.project_row_access_allowed(p.company_scope_id,p.user_id)),
 tasks as(
  select t.id,'progress'::text kind,t.root_id,t.unit_id,t.room_id,null::uuid project_id,t.title,t.planned_end due_on,'Planlagt ferdig'::text date_label,t.status
  from bolig_private.progress_tasks t join bolig_private.roots r on r.id=t.root_id
  where r.company_id=c and t.owner_id=auth.uid() and t.status<>'done' and bolig_private.progress_active(t) and bolig_private.progress_member(c,auth.uid())
  union all
  select d.id,'deviation',s.root_id,s.unit_id,null::uuid,d.project_id,d.title,d.due_on,'Frist',d.status
  from public.kshms_deviations d join scopes s on s.project_id=d.project_id where ks is not null and d.company_id=c and d.responsible_id=auth.uid() and d.status<>'closed' and kshms_private.deviation_visible(d,ks)
  union all
  select e.id,e.kind,s.root_id,s.unit_id,null::uuid,e.project_id,e.content->>'title',nullif(e.content->>'planned_on','')::date,'Planlagt kontroll',e.status
  from public.kshms_executions e join scopes s on s.project_id=e.project_id where ks is not null and e.company_id=c and e.responsible_id=auth.uid() and e.status='draft' and kshms_private.execution_visible(e,ks)
 ),prepared as(
  select t.*,r.title project_title,u.number unit_number,room.name room_name,
   coalesce(t.due_on::text,'9999-12-31')||':'||t.kind||':'||t.id::text sort_key
  from tasks t join bolig_private.roots r on r.id=t.root_id left join bolig_private.units u on u.id=t.unit_id left join bolig_private.rooms room on room.id=t.room_id
 ),page as(select * from prepared where sort_key>cursor order by sort_key limit 101)
 select (select count(*) from prepared),coalesce((select jsonb_agg(to_jsonb(x) order by x.sort_key) from(select * from page order by sort_key limit 100)x),'[]'::jsonb),
  case when(select count(*) from page)>100 then(select sort_key from page order by sort_key offset 99 limit 1) else null end,(select to_jsonb(z) from prepared z where z.id::text=payload->>'selected_id' and z.kind=payload->>'selected_kind' limit 1) into total,rows,next_cursor,selected_row;
 return jsonb_build_object('context',ctx,'ks_context',ks,'as_of',(now() at time zone 'Europe/Oslo')::date,'count',total,'items',rows,'next',next_cursor,'selected',selected_row);
end$$;
revoke all on function bolig_private.my_project_tasks(uuid,jsonb) from public,anon;
grant execute on function bolig_private.my_project_tasks(uuid,jsonb) to authenticated;
create function public.bolig_my_project_tasks(p_company_id uuid,p_payload jsonb default '{}') returns jsonb
language sql security invoker set search_path='' as $$select bolig_private.my_project_tasks(p_company_id,p_payload)$$;
revoke all on function public.bolig_my_project_tasks(uuid,jsonb) from public,anon;
grant execute on function public.bolig_my_project_tasks(uuid,jsonb) to authenticated;
