-- One composer, existing notice storage/portal/transport. No artificial Gantt tasks.
alter table bolig_private.progress_notices alter column task_id drop not null;
alter table bolig_private.progress_notices
 add column unit_id uuid,
 add column source_task_id uuid references bolig_private.progress_tasks(id),
 add column company_brand jsonb,
 add column group_id uuid,
 add column notice_title text,
 add column notice_start date,
 add column notice_end date,
 add column audience_label text,
 add column project_contact jsonb,
 add column paper_ready boolean not null default false,
 add column digital boolean not null default false,
 add foreign key(unit_id,root_id) references bolig_private.units(id,root_id),
 add check(task_id is not null or (unit_id is not null and group_id is not null and notice_title is not null and audience_label is not null and project_contact is not null and length(trim(notice_title)) between 2 and 120 and notice_start is not null and notice_end>=notice_start and notice_end<=notice_start+730 and length(audience_label) between 1 and 240 and jsonb_typeof(project_contact)='object'));
create index bolig_notice_unit on bolig_private.progress_notices(unit_id,root_id);
create index bolig_notice_source_task on bolig_private.progress_notices(source_task_id);
create index bolig_notice_group on bolig_private.progress_notices(group_id,root_id);
alter table bolig_private.progress_deliveries alter column task_id drop not null;
alter table bolig_private.progress_deliveries add check(task_id is not null or (kind='resident' and notice_id is not null));
create unique index bolig_notice_delivery_once on bolig_private.progress_deliveries(notice_id) where kind='resident';

-- Legacy activity notices retain their original basis. General notices carry their own dates.
create function bolig_private.progress_notice_task(n bolig_private.progress_notices) returns bolig_private.progress_tasks
language plpgsql stable set search_path='' as $$
declare t bolig_private.progress_tasks%rowtype;
begin
 if n.task_id is not null then select * into t from bolig_private.progress_tasks where id=n.task_id;return t;end if;
 t.root_id:=n.root_id;t.unit_id:=n.unit_id;t.title:=n.notice_title;t.planned_start:=n.notice_start;t.planned_end:=n.notice_end;t.archived:=false;return t;
end$$;
alter function bolig_private.progress_notice_basis(bolig_private.progress_tasks,bolig_private.progress_notices) rename to progress_notice_basis_activity;
create function bolig_private.progress_notice_basis(t bolig_private.progress_tasks,n bolig_private.progress_notices) returns text language sql stable set search_path='' as $$
 select case when n.task_id is not null then bolig_private.progress_notice_basis_activity(t,n) else md5(jsonb_build_array(n.unit_id,n.notice_title,n.notice_start,n.notice_end,n.body,n.publish_on,n.audience_label,n.project_contact,n.paper_ready,n.digital,(select jsonb_build_array(id,revision,title,planned_start,planned_end,archived) from bolig_private.progress_tasks where id=n.source_task_id),
 (select jsonb_build_array(u.contact_name,u.contact_email) from bolig_private.units u where u.id=n.unit_id))::text) end
$$;
alter function bolig_private.progress_notice_valid(bolig_private.progress_notices) rename to progress_notice_valid_activity;
create function bolig_private.progress_notice_valid(n bolig_private.progress_notices) returns boolean language sql stable set search_path='' as $$
 select case when n.task_id is not null then bolig_private.progress_notice_valid_activity(n) else
 not n.withdrawn and n.digital and coalesce(n.approved_basis=n.basis,false) and n.approved_by is not null
 and bolig_private.progress_active(bolig_private.progress_notice_task(n))
 and n.basis=bolig_private.progress_notice_basis(bolig_private.progress_notice_task(n),n)
 and exists(select 1 from bolig_private.roots r join public.sales_company_memberships m on m.company_id=r.company_id
 left join bolig_private.member_access a on a.company_id=m.company_id and a.user_id=m.user_id
 where r.id=n.root_id and m.user_id=n.approved_by and bolig_private.progress_member(r.company_id,n.approved_by) and (m.workspace_role='firmaadmin' or a.access_role='manager')) end
$$;
-- Functions compiled before a rename bind by OID; replace dependent legacy body
-- to resolve the new dispatching basis helper as well.
do $$declare body text;begin
 body:=pg_get_functiondef('bolig_private.progress_notice_valid_activity(bolig_private.progress_notices)'::regprocedure);execute body;
end$$;

alter function bolig_private.progress_workspace(uuid,uuid,uuid,text,jsonb) rename to progress_workspace_before_notice_composer;
create function bolig_private.progress_workspace(c uuid,root uuid,unit uuid,action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare ctx jsonb;r bolig_private.roots%rowtype;rev bigint;rid uuid;fp text;receipt bolig_private.progress_receipts%rowtype;result jsonb;
 target uuid;gid uuid;mode text;n bolig_private.progress_notices%rowtype;t bolig_private.progress_tasks%rowtype;entries jsonb:='[]';
begin
 -- Authorize and lock through the established gateway even for exact retries.
 result:=bolig_private.progress_workspace_before_notice_composer(c,root,unit,'get','{}');ctx:=result->'context';rev:=(result->>'revision')::bigint;
 if action in ('resident_notice','notice_group_withdraw') then
  select * into r from bolig_private.roots where id=root and company_id=c;
  if ctx->>'role' is distinct from 'manager' or r.archived then raise exception 'Prosjektleder og aktivt prosjekt kreves.' using errcode='42501';end if;
  if jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>180000 then raise exception 'Ugyldig varsel.' using errcode='22023';end if;
  rid:=(payload->>'request_id')::uuid;fp:=md5(jsonb_build_array(unit,action,payload)::text);
  if rid is null then raise exception 'Forsøksreferanse mangler.' using errcode='22023';end if;
  select * into receipt from bolig_private.progress_receipts where root_id=root and actor_id=auth.uid() and request_id=rid;
  if found then if receipt.fingerprint<>fp then raise exception 'Forsøket har annet innhold.' using errcode='PT409';end if;return receipt.result;end if;
  if (payload->>'revision')::bigint is distinct from rev then raise exception 'Varseloversikten er endret. Kladden er beholdt. Hent siste status før du prøver igjen.' using errcode='PT409';end if;
  gid:=(payload->>'id')::uuid;
  if gid is null then raise exception 'Varselreferanse mangler.' using errcode='22023';end if;
  if action='notice_group_withdraw' then
   if not exists(select 1 from bolig_private.progress_notices where root_id=root and group_id=gid and (unit is null or unit_id=unit)) then raise exception 'Varselet er ikke tilgjengelig.' using errcode='42501';end if;
   -- Unit scope may never withdraw other apartments in the same batch.
   update bolig_private.progress_notices set withdrawn=true where root_id=root and group_id=gid and (unit is null or unit_id=unit);
  else
   mode:=payload->>'mode';
   if mode is null or mode not in ('draft','paper','publish') or jsonb_typeof(payload->'unit_ids') is distinct from 'array' then raise exception 'Velg boliger og hva du vil gjøre med varselet.' using errcode='22023';end if;
   if jsonb_array_length(payload->'unit_ids') not between 1 and 4000 or (select count(distinct v) from jsonb_array_elements_text(payload->'unit_ids') v)<>jsonb_array_length(payload->'unit_ids') then raise exception 'Velg 1–4000 forskjellige boliger.' using errcode='22023';end if;
   if exists(select 1 from bolig_private.progress_notices where group_id=gid) then raise exception 'Lag en ny varselutgave. Historikken beholdes.' using errcode='PT409';end if;
   if length(trim(coalesce(payload->>'title',''))) not between 2 and 120 or length(trim(coalesce(payload->>'body',''))) not between 3 and 2000 or length(trim(coalesce(payload->>'audience_label',''))) not between 1 and 240
   or jsonb_typeof(payload->'contact') is distinct from 'object' or length(coalesce(payload#>>'{contact,name}',''))>120 or length(coalesce(payload#>>'{contact,phone}',''))>40 or length(coalesce(payload#>>'{contact,email}',''))>254
   or nullif(payload->>'start','') is null or nullif(payload->>'end','') is null or nullif(payload->>'publish_on','') is null
   or (payload->>'end')::date<(payload->>'start')::date or (payload->>'end')::date>(payload->>'start')::date+730 then raise exception 'Kontroller overskrift, tekst, datoer og kontaktinformasjon.' using errcode='22023';end if;
   if mode<>'draft' and (length(trim(coalesce(payload#>>'{contact,name}','')))<2 or (trim(coalesce(payload#>>'{contact,phone}',''))='' and trim(coalesce(payload#>>'{contact,email}',''))='')) then raise exception 'Oppgi kontaktperson og telefon eller e-post.' using errcode='22023';end if;
   for target in select v::uuid from jsonb_array_elements_text(payload->'unit_ids') v loop
    if unit is not null and target<>unit then raise exception 'Velg boligen du har åpnet.' using errcode='42501';end if;
    if not exists(select 1 from bolig_private.units u join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id where u.id=target and u.root_id=root and not u.archived and not e.archived and not b.archived) then raise exception 'En bolig i utvalget er ikke tilgjengelig.' using errcode='42501';end if;
    if payload#>>array['recipient_basis',target::text] is distinct from (select md5(jsonb_build_array(u.contact_name,u.contact_email,u.archived,e.archived,b.archived)::text) from bolig_private.units u join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id where u.id=target) then raise exception 'Kontakt eller bolig er endret. Hent siste status og se over utvalget.' using errcode='PT409';end if;
    if mode='publish' and not exists(select 1 from bolig_private.units u where u.id=target and length(trim(u.contact_name))>=2 and u.contact_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$') then raise exception 'En valgt bolig mangler beboernavn eller e-post. Rett kontakten eller bruk PDF/oppslag.' using errcode='22023';end if;
    if nullif(payload->>'source_task_id','') is not null and not exists(select 1 from bolig_private.progress_tasks p where p.id=(payload->>'source_task_id')::uuid and p.root_id=root and p.unit_id=target and bolig_private.progress_active(p)) then raise exception 'Aktiviteten er endret eller utilgjengelig.' using errcode='42501';end if;
    if nullif(payload->>'source_task_id','') is not null and (payload->>'source_task_revision')::bigint is distinct from (select p.revision from bolig_private.progress_tasks p where p.id=(payload->>'source_task_id')::uuid) then raise exception 'Aktiviteten er endret. Hent siste aktivitetsdatoer og se over varselet.' using errcode='PT409';end if;
    n:=null;n.source_task_id:=nullif(payload->>'source_task_id','')::uuid;n.company_brand:=public.work_profile_company_profile(c);n.id:=gen_random_uuid();n.root_id:=root;n.unit_id:=target;n.group_id:=gid;n.notice_title:=trim(payload->>'title');n.body:=trim(payload->>'body');n.notice_start:=(payload->>'start')::date;n.notice_end:=(payload->>'end')::date;n.publish_on:=(payload->>'publish_on')::date;n.audience_label:=trim(payload->>'audience_label');n.project_contact:=jsonb_build_object('name',trim(payload#>>'{contact,name}'),'phone',trim(payload#>>'{contact,phone}'),'email',trim(payload#>>'{contact,email}'));n.paper_ready:=mode<>'draft';n.digital:=mode='publish';
    t:=bolig_private.progress_notice_task(n);n.basis:=bolig_private.progress_notice_basis(t,n);
    insert into bolig_private.progress_notices(id,root_id,task_id,unit_id,group_id,notice_title,body,notice_start,notice_end,publish_on,audience_label,project_contact,paper_ready,digital,basis,approved_basis,approved_by,approved_at,published_at,source_task_id,company_brand)
    values(n.id,root,null,target,gid,n.notice_title,n.body,n.notice_start,n.notice_end,n.publish_on,n.audience_label,n.project_contact,n.paper_ready,n.digital,n.basis,case when n.digital then n.basis end,case when n.digital then auth.uid() end,case when n.digital then now() end,case when n.digital and n.publish_on<=(now() at time zone 'Europe/Oslo')::date then now() end,n.source_task_id,jsonb_build_object('companyName',n.company_brand->>'companyName','logoUrl',n.company_brand->>'logoUrl'));
    entries:=entries||jsonb_build_array(jsonb_build_object('unit_id',target,'notice_id',n.id));
   end loop;
   if nullif(payload->>'replaces','') is not null then
    if not exists(select 1 from bolig_private.progress_notices where root_id=root and group_id=(payload->>'replaces')::uuid and (unit is null or unit_id=unit)) then raise exception 'Forrige varselutgave er ikke tilgjengelig.' using errcode='42501';end if;
    update bolig_private.progress_notices set withdrawn=true where root_id=root and group_id=(payload->>'replaces')::uuid and (unit is null or unit_id=unit) and (not digital or mode='publish');
   end if;
  end if;
  insert into bolig_private.progress_states values(root,rev+1) on conflict(root_id) do update set revision=excluded.revision;
  -- Do not put a campaign's full audience into a unit-scoped history projection.
  insert into bolig_private.progress_history(root_id,revision,actor_id,action,snapshot) values(root,rev+1,auth.uid(),action,jsonb_build_object('group_id',gid,'mode',mode,'tasks',entries));
  result:=bolig_private.progress_workspace_before_notice_composer(c,root,unit,'get','{}');
 else
  result:=bolig_private.progress_workspace_before_notice_composer(c,root,unit,action,payload);
 end if;
 -- General notices share the original overview; no second inbox or approval area.
 result:=jsonb_set(result,'{notices}',(result->'notices')||coalesce((select jsonb_agg(to_jsonb(x)||jsonb_build_object('title',x.notice_title,'planned_start',x.notice_start,'planned_end',x.notice_end,'unit_number',u.number,'address',e.address,'recipient',u.contact_email,'current',bolig_private.progress_active(bolig_private.progress_notice_task(x)) and x.basis=bolig_private.progress_notice_basis(bolig_private.progress_notice_task(x),x),'valid',bolig_private.progress_notice_valid(x)) order by x.created_at desc)
 from bolig_private.progress_notices x join bolig_private.units u on u.id=x.unit_id join bolig_private.entrances e on e.id=u.entrance_id where x.root_id=root and x.task_id is null and (unit is null or x.unit_id=unit)),'[]'));
 result:=jsonb_set(result,'{deliveries}',(result->'deliveries')||coalesce((select jsonb_agg(jsonb_build_object('id',d.id,'notice_id',d.notice_id,'kind',d.kind,'status',d.status,'accepted_at',d.accepted_at)) from bolig_private.progress_deliveries d join bolig_private.progress_notices n on n.id=d.notice_id where d.root_id=root and d.task_id is null and (unit is null or n.unit_id=unit)),'[]'));
 -- A basis is shown next to each recipient and returned by the composer. Creation
 -- binds recipient identities through the workspace revision plus this fresh basis.
 result:=jsonb_set(result,'{units}',coalesce((select jsonb_agg(v||jsonb_build_object('contact_name',u.contact_name,'contact_email',u.contact_email,'notice_basis',md5(jsonb_build_array(u.contact_name,u.contact_email,u.archived,e.archived,b.archived)::text))) from jsonb_array_elements(result->'units') v join bolig_private.units u on u.id=(v->>'id')::uuid join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id),'[]'));
 if action in ('resident_notice','notice_group_withdraw') then insert into bolig_private.progress_receipts values(root,auth.uid(),rid,fp,result);end if;
 return result;
end$$;
-- Contact changes also invalidate new general notices, including A→B→A.
do $$declare body text;anchor text;begin
 body:=pg_get_functiondef('bolig_private.revoke_contact_links()'::regprocedure);
 anchor:='where n.task_id in(select id from bolig_private.progress_tasks where unit_id=new.id) and approved_basis is not null';
 if position(anchor in body)=0 then raise exception 'Contact revocation anchor missing';end if;
 execute replace(body,anchor,'where (n.unit_id=new.id or n.task_id in(select id from bolig_private.progress_tasks where unit_id=new.id)) and approved_basis is not null');
end$$;
-- Add general notices to the existing portal projection and worker. The same
-- freshness/access checks still run at reservation and immediately before send.
do $$declare body text;anchor text;begin
 body:=pg_get_functiondef('bolig_private.portal_state(bolig_private.resident_portals)'::regprocedure);
 anchor:='join bolig_private.progress_tasks t on t.id=n.task_id';
 if position(anchor in body)=0 then raise exception 'Portal notice anchor missing';end if;
 execute replace(body,anchor,'cross join lateral bolig_private.progress_notice_task(n) t');
 body:=pg_get_functiondef('bolig_private.progress_tick()'::regprocedure);
 if position(anchor in body)=0 then raise exception 'Worker notice anchor missing';end if;
 body:=replace(body,anchor,'cross join lateral bolig_private.progress_notice_task(n) t');
 body:=replace(body,'select t.root_id,t.id,n.id,','select n.root_id,n.task_id,n.id,');execute body;
 body:=pg_get_functiondef('bolig_private.reserve_before_dialogue()'::regprocedure);
 if position(anchor in body)=0 then raise exception 'Worker reserve anchor missing';end if;
 body:=replace(body,anchor,'cross join lateral bolig_private.progress_notice_task(n) t');
 body:=replace(body,'''end'',t.planned_end)', '''end'',t.planned_end,''brand'',n.company_brand,''contact'',n.project_contact,''audience'',n.audience_label)');execute body;
end$$;
alter function bolig_private.progress_delivery_valid(bolig_private.progress_deliveries) rename to progress_delivery_valid_activity;
create function bolig_private.progress_delivery_valid(d bolig_private.progress_deliveries) returns boolean language sql stable set search_path='' as $$
 select case when d.task_id is not null then bolig_private.progress_delivery_valid_activity(d) else exists(
 select 1 from bolig_private.progress_notices n join bolig_private.units u on u.id=n.unit_id cross join bolig_private.progress_mail_settings cfg
 where n.id=d.notice_id and n.root_id=d.root_id and cfg.singleton and cfg.enabled and cfg.enabled_since is not null and n.published_at>=cfg.enabled_since and bolig_private.progress_notice_valid(n) and d.kind='resident' and d.recipient=u.contact_email) end
$$;
-- Public gateway stays SECURITY INVOKER; all new helpers remain private.
create or replace function public.bolig_progress(p_company_id uuid,p_root_id uuid,p_unit_id uuid default null,p_action text default 'get',p_payload jsonb default '{}') returns jsonb language sql security invoker set search_path='' as $$select bolig_private.progress_workspace(p_company_id,p_root_id,p_unit_id,p_action,p_payload)$$;
revoke all on function bolig_private.progress_workspace_before_notice_composer(uuid,uuid,uuid,text,jsonb),bolig_private.progress_notice_task(bolig_private.progress_notices),bolig_private.progress_notice_basis_activity(bolig_private.progress_tasks,bolig_private.progress_notices),bolig_private.progress_notice_basis(bolig_private.progress_tasks,bolig_private.progress_notices),bolig_private.progress_notice_valid_activity(bolig_private.progress_notices),bolig_private.progress_notice_valid(bolig_private.progress_notices),bolig_private.progress_delivery_valid_activity(bolig_private.progress_deliveries),bolig_private.progress_delivery_valid(bolig_private.progress_deliveries) from public,anon,authenticated,service_role;
revoke all on function bolig_private.progress_workspace(uuid,uuid,uuid,text,jsonb) from public,anon,authenticated,service_role;
grant execute on function bolig_private.progress_workspace(uuid,uuid,uuid,text,jsonb) to authenticated;
notify pgrst,'reload schema';

do $$declare body text;begin body:=pg_get_functiondef('bolig_private.validate_before_dialogue(uuid,uuid)'::regprocedure);execute body;end$$;
