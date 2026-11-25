-- Return an explicit HTTP conflict; PostgREST 14 retries SQLSTATE 40001 indefinitely.
create or replace function bolig_private.workspace(c uuid,action text,root uuid,expected bigint,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare ctx jsonb;r bolig_private.roots%rowtype;id uuid;parent uuid;target uuid;nr bigint;role_name text;
 v_counts jsonb;item jsonb;f int;pos int;cnt int;count_total int;addr text;linked uuid;result jsonb;begin
 ctx:=bolig_private.context(c);
 if jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>200000 then raise exception 'Ugyldig innhold.' using errcode='22023';end if;
 if action='context' then return ctx;end if;
 if action in ('access','license','member') then
  if not (ctx->>'manage_access')::boolean then raise exception 'Bare firmaadmin kan tildele tilgang.' using errcode='42501';end if;
  perform pg_advisory_xact_lock(hashtextextended('bolig-access:'||c::text,0));
  if action='license' then
   if not (ctx->>'system_admin')::boolean then raise exception 'Bare systemadmin aktiverer firmamodulen.' using errcode='42501';end if;
   if expected is distinct from (ctx->>'license_revision')::bigint then raise exception 'Tilgangen er endret. Hent på nytt.' using errcode='PT409';end if;
   if jsonb_typeof(payload->'enabled') is distinct from 'boolean' then raise exception 'Velg aktivering.' using errcode='22023';end if;
   insert into bolig_private.firms(company_id,enabled,changed_by) values(c,(payload->>'enabled')::boolean,auth.uid())
   on conflict(company_id) do update set enabled=excluded.enabled,revision=bolig_private.firms.revision+1,changed_by=auth.uid(),changed_at=now();
   insert into bolig_private.audit(company_id,actor_id,action,revision) values(c,auth.uid(),'license',(select revision from bolig_private.firms where company_id=c));
  elsif action='member' then
   if not (ctx->>'licensed')::boolean then raise exception 'Modulen må aktiveres på firmaet først.' using errcode='42501';end if;
   target:=(payload->>'user_id')::uuid;role_name:=payload->>'role';
   if role_name is null or role_name not in ('none','reader','manager') then raise exception 'Ugyldig rolle.' using errcode='22023';end if;
   if not exists(select 1 from public.sales_company_memberships m join public.profiles p on p.id=m.user_id
    where m.company_id=c and m.user_id=target and m.workspace_role='ansatt' and p.approved and not coalesce(p.deactivated,false) and p.role in ('admin','member','ansatt','firmaadmin') and coalesce(p.system_role,'')<>'systemadmin')
   then raise exception 'Velg en aktiv intern medarbeider. Firmaadmins tilgang følger firmarollen.' using errcode='42501';end if;
   if expected is distinct from coalesce((select revision from bolig_private.member_access where company_id=c and user_id=target),0) then raise exception 'Brukertilgangen er endret. Hent på nytt.' using errcode='PT409';end if;
   insert into bolig_private.member_access(company_id,user_id,access_role,changed_by) values(c,target,role_name,auth.uid())
   on conflict(company_id,user_id) do update set access_role=excluded.access_role,revision=bolig_private.member_access.revision+1,changed_by=auth.uid(),changed_at=now();
   insert into bolig_private.audit(company_id,actor_id,action,entity_id) values(c,auth.uid(),'member',target);
  end if;
  return jsonb_build_object('context',bolig_private.context(c),'members',coalesce((select jsonb_agg(jsonb_build_object('user_id',m.user_id,'name',coalesce(nullif(to_jsonb(p)->>'full_name',''),p.email),'firmaadmin',m.workspace_role='firmaadmin','role',case when m.workspace_role='firmaadmin' then 'manager' else coalesce(g.access_role,'none') end,'revision',coalesce(g.revision,0)) order by p.email) from public.sales_company_memberships m join public.profiles p on p.id=m.user_id left join bolig_private.member_access g on g.company_id=c and g.user_id=m.user_id where m.company_id=c and m.workspace_role in ('firmaadmin','ansatt') and p.approved and not coalesce(p.deactivated,false) and p.role in ('admin','member','ansatt','firmaadmin')),'[]'::jsonb));
 end if;
 if not (ctx->>'enabled')::boolean then raise exception 'Boligprosjekter er ikke tilgjengelig i aktivt firma.' using errcode='42501';end if;
 if action='list' then
  return jsonb_build_object('context',ctx,'roots',coalesce((select jsonb_agg(to_jsonb(x) order by x.updated_at desc,x.id) from (select listed_root.*,(select count(*) from bolig_private.units u where u.root_id=listed_root.id and not u.archived and exists(select 1 from bolig_private.entrances e join bolig_private.blocks b on b.id=e.block_id where e.id=u.entrance_id and not e.archived and not b.archived)) unit_count from bolig_private.roots listed_root where listed_root.company_id=c) x),'[]'::jsonb));
 end if;
 if action='create' then
  if ctx->>'role'<>'manager' then raise exception 'Prosjektledertilgang kreves.' using errcode='42501';end if;
  insert into bolig_private.roots(company_id,title,reference,created_by) values(c,trim(payload->>'title'),coalesce(trim(payload->>'reference'),''),auth.uid()) returning * into r;
  insert into bolig_private.audit(company_id,root_id,actor_id,action,revision) values(c,r.id,auth.uid(),'create',r.revision);
  root:=r.id;
 else
  select * into r from bolig_private.roots where roots.id=root and company_id=c for update;
  if not found then raise exception 'Boligprosjektet er ikke tilgjengelig i aktivt firma.' using errcode='42501';end if;
 end if;
 if action not in ('get','create','projects') then
  if ctx->>'role'<>'manager' then raise exception 'Prosjektledertilgang kreves.' using errcode='42501';end if;
  if expected is distinct from r.revision then raise exception 'Strukturen er endret av en annen bruker. Kladden er beholdt. Hent siste versjon.' using errcode='PT409';end if;
  if r.archived and action<>'archive' then raise exception 'Gjenopprett boligprosjektet før endring.' using errcode='22023';end if;
  if action='block' then
   insert into bolig_private.blocks(root_id,name) values(root,trim(payload->>'name')) returning blocks.id into id;
  elsif action in ('entrance','resize') then
   v_counts:=payload->'counts';
   if jsonb_typeof(v_counts) is distinct from 'array' then raise exception 'Angi leiligheter per etasje.' using errcode='22023';end if;
   if jsonb_array_length(v_counts) not between 1 and 30 then raise exception 'Velg 1–30 etasjer.' using errcode='22023';end if;
   count_total:=0;
   for item in select value from jsonb_array_elements(v_counts) loop
    if jsonb_typeof(item)<>'number' or item::text !~ '^[0-9]{1,2}$' or (item::text)::int not between 1 and 20 then raise exception 'Velg 1–20 leiligheter per etasje.' using errcode='22023';end if;
    count_total:=count_total+(item::text)::int;
   end loop;
   if action='entrance' then
    parent:=(payload->>'block_id')::uuid;
    if not exists(select 1 from bolig_private.blocks where blocks.id=parent and root_id=root and not archived) then raise exception 'Velg en aktiv blokk i dette prosjektet.' using errcode='42501';end if;
    insert into bolig_private.entrances(root_id,block_id,address,counts) values(root,parent,trim(payload->>'address'),v_counts) returning entrances.id into id;
   else
    id:=(payload->>'id')::uuid;
    perform 1 from bolig_private.entrances e join bolig_private.blocks b on b.id=e.block_id where e.id=id and e.root_id=root and not e.archived and not b.archived;
    if not found then raise exception 'Oppgangen er ikke tilgjengelig.' using errcode='42501';end if;
    update bolig_private.entrances set counts=v_counts,address=trim(payload->>'address') where entrances.id=id;
    update bolig_private.units set archived=true where entrance_id=id;
   end if;
   for f in 1..jsonb_array_length(v_counts) loop
    cnt:=(v_counts->>(f-1))::int;
    for pos in 1..cnt loop
     insert into bolig_private.units(root_id,entrance_id,floor,position,number) values(root,id,f,pos,'H'||lpad(f::text,2,'0')||lpad(pos::text,2,'0'))
     on conflict(entrance_id,floor,position) do update set archived=false;
    end loop;
   end loop;
   if (select count(*) from bolig_private.units where root_id=root)>2000 then raise exception 'Denne etappen støtter inntil 2000 boliger per hovedprosjekt, inkludert skjulte.' using errcode='22023';end if;
  elsif action='unit' then
   id:=(payload->>'id')::uuid;linked:=nullif(payload->>'project_id','')::uuid;
   perform 1 from bolig_private.units u join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id where u.id=id and u.root_id=root and not u.archived and not e.archived and not b.archived;
   if not found then raise exception 'Boligen er ikke tilgjengelig.' using errcode='42501';end if;
   if linked is not null then
    perform 1 from public.projects pr where pr.id=linked and pr.company_scope_id=c and not coalesce(pr.locked,false) and public.project_row_access_allowed(pr.company_scope_id,pr.user_id) for key share;
    if not found then raise exception 'Velg et tilgjengelig, ulåst ProffDok-prosjekt i aktivt firma.' using errcode='42501';end if;
   end if;
   update bolig_private.units set number=trim(payload->>'number'),contact_name=coalesce(trim(payload->>'contact_name'),''),project_id=linked where units.id=id;
  elsif action='archive' then
   if jsonb_typeof(payload->'archived') is distinct from 'boolean' then raise exception 'Velg visning.' using errcode='22023';end if;
   id:=(payload->>'id')::uuid;
   case payload->>'kind'
    when 'root' then update bolig_private.roots set archived=(payload->>'archived')::boolean where roots.id=root;id:=root;
    when 'block' then update bolig_private.blocks set archived=(payload->>'archived')::boolean where blocks.id=id and root_id=root;
    when 'entrance' then update bolig_private.entrances set archived=(payload->>'archived')::boolean where entrances.id=id and root_id=root;
    else raise exception 'Ugyldig byggdel.' using errcode='22023';
   end case;
   if not found then raise exception 'Byggdelen finnes ikke i prosjektet.' using errcode='42501';end if;
  else raise exception 'Ukjent handling.' using errcode='22023';end if;
  update bolig_private.roots set revision=revision+1,updated_at=now() where roots.id=root returning * into r;
  insert into bolig_private.audit(company_id,root_id,actor_id,action,entity_id,revision) values(c,root,auth.uid(),action,id,r.revision);
 end if;
 if action='projects' then
  return jsonb_build_object('context',ctx,'projects',coalesce((select jsonb_agg(jsonb_build_object('id',pr.id,'title',pr.title) order by pr.updated_at desc) from public.projects pr where pr.company_scope_id=c and not coalesce(pr.locked,false) and public.project_row_access_allowed(pr.company_scope_id,pr.user_id)),'[]'::jsonb));
 end if;
 return jsonb_build_object('context',ctx,'root',to_jsonb(r),'blocks',coalesce((select jsonb_agg(to_jsonb(b) order by b.name) from bolig_private.blocks b where b.root_id=root),'[]'::jsonb),
 'entrances',coalesce((select jsonb_agg(to_jsonb(e) order by e.address) from bolig_private.entrances e where e.root_id=root),'[]'::jsonb),
 'units',coalesce((select jsonb_agg((to_jsonb(u)-'project_id')||jsonb_build_object('project_id',case when pr.id is not null and public.project_row_access_allowed(pr.company_scope_id,pr.user_id) then u.project_id else null end,'has_project',u.project_id is not null) order by u.entrance_id,u.floor,u.position) from bolig_private.units u left join public.projects pr on pr.id=u.project_id where u.root_id=root),'[]'::jsonb));
end$$;
