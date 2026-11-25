-- Private standalone controls and risk assessments; no project/portal JSON writes.
create table public.kshms_executions (
 id uuid primary key,company_id uuid not null references public.sales_company_scopes(id),kind text not null check(kind in('round','risk')),
 project_id uuid references public.projects(id),template_version_id uuid references public.kshms_checklist_versions(id),template_snapshot jsonb,
 content jsonb not null,revision bigint not null default 1 check(revision>0),status text not null default 'draft' check(status in('draft','completed')),
 responsible_id uuid not null references public.profiles(id),responsible_identity jsonb not null,
 created_by uuid not null references public.profiles(id),creator_identity jsonb not null,updated_by uuid not null references public.profiles(id),updated_identity jsonb not null,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),completed_by uuid references public.profiles(id),completed_identity jsonb,completed_at timestamptz,statement text,
 check((status='draft' and completed_by is null and completed_identity is null and completed_at is null and statement is null) or (status='completed' and completed_by=responsible_id and completed_by is not null and completed_identity is not null and completed_at is not null and statement is not null)),
 check(kind='round' or template_version_id is null),check((template_version_id is null)=(template_snapshot is null)),unique(company_id,id)
);
create index kshms_executions_company_kind_updated_idx on public.kshms_executions(company_id,kind,updated_at desc,id);
create index kshms_executions_project_idx on public.kshms_executions(project_id);
create index kshms_executions_template_idx on public.kshms_executions(template_version_id);
create index kshms_executions_creator_idx on public.kshms_executions(created_by);
create index kshms_executions_responsible_idx on public.kshms_executions(responsible_id);
create index kshms_executions_updater_idx on public.kshms_executions(updated_by);
create index kshms_executions_completer_idx on public.kshms_executions(completed_by);
create table public.kshms_execution_commands(company_id uuid not null references public.sales_company_scopes(id),request_id uuid not null,actor_id uuid not null references public.profiles(id),payload_hash text not null,result jsonb not null,created_at timestamptz not null default now(),primary key(company_id,request_id));
create index kshms_execution_commands_actor_idx on public.kshms_execution_commands(actor_id);
create table public.kshms_execution_deviations(execution_id uuid not null references public.kshms_executions(id),point_id uuid not null,deviation_id uuid not null unique references public.kshms_deviations(id),point_title text not null,primary key(execution_id,point_id));
alter table public.kshms_executions enable row level security;
alter table public.kshms_execution_commands enable row level security;
alter table public.kshms_execution_deviations enable row level security;
revoke all on public.kshms_executions,public.kshms_execution_commands,public.kshms_execution_deviations from public,anon,authenticated;
create trigger kshms_execution_command_immutable before update or delete on public.kshms_execution_commands for each row execute function kshms_private.immutable_record();
create trigger kshms_execution_link_immutable before update or delete on public.kshms_execution_deviations for each row execute function kshms_private.immutable_record();

create function kshms_private.execution_protect() returns trigger language plpgsql set search_path='' as $$
begin
 if old.status='completed' then raise exception 'Fullført dokumentasjon kan ikke endres eller slettes. Start en ny gjennomføring.' using errcode='42501';end if;
 if tg_op='DELETE' then return old;end if;
 if row(new.id,new.company_id,new.kind,new.project_id,new.template_version_id,new.template_snapshot,new.created_by,new.creator_identity,new.created_at) is distinct from row(old.id,old.company_id,old.kind,old.project_id,old.template_version_id,old.template_snapshot,old.created_by,old.creator_identity,old.created_at) then raise exception 'Identitet, prosjekt og malutgave er faste etter første lagring.' using errcode='42501';end if;
 return new;
end $$;
create trigger kshms_execution_protect before update or delete on public.kshms_executions for each row execute function kshms_private.execution_protect();
create function kshms_private.execution_visible(e public.kshms_executions,x jsonb) returns boolean language sql stable set search_path='' as $$
 select e.company_id=(x->>'company_id')::uuid and (e.status='completed' or e.created_by=auth.uid() or e.responsible_id=auth.uid() or (x->>'manage')::boolean)
 and (e.project_id is null or exists(select 1 from public.projects p where p.id=e.project_id and p.company_scope_id=e.company_id and public.project_row_access_allowed(p.company_scope_id,p.user_id)))
$$;
create function kshms_private.execution_text(c jsonb,k text,n integer default 5000) returns text language plpgsql immutable set search_path='' as $$
declare v text;
begin
 if c?k and jsonb_typeof(c->k) not in('string','null') then raise exception 'Ugyldig tekstfelt: %',k;end if;
 v:=btrim(coalesce(c->>k,''),E' \t\n\r');if length(v)>n then raise exception 'Tekstfeltet % er for langt (maks % tegn).',k,n;end if;return v;
end $$;
create function kshms_private.execution_content(c jsonb,kind text,finished boolean) returns jsonb language plpgsql set search_path='' as $$
declare clean jsonb;arr jsonb:='[]';answers jsonb:='{}';p jsonb;a jsonb;r jsonb;photo jsonb;photos jsonb;k text;v text;pid uuid;ids uuid[]:='{}';answer_status text;low integer;medium integer;before_p integer;before_c integer;after_p integer;after_c integer;decision text;effect text;
begin
 if jsonb_typeof(c) is distinct from 'object' or octet_length(c::text)>3500000 then raise exception 'Gjennomføringen er for stor eller ugyldig.';end if;
 clean:=jsonb_build_object('points','[]'::jsonb,'answers','{}'::jsonb,'risks','[]'::jsonb);
 foreach k in array array['title','workplace','planned_on','responsible_id','participants','review','reference','routines','basis'] loop
  v:=kshms_private.execution_text(c,k,case k when 'title' then 160 when 'workplace' then 600 when 'reference' then 600 when 'planned_on' then 10 when 'responsible_id' then 36 when 'routines' then 4000 else 5000 end);
  if k='title' and v='' then raise exception 'Skriv et navn før du lagrer.';end if;
  if finished and k in('workplace','planned_on','responsible_id','participants','review') and v='' then raise exception 'Fyll ut arbeidssted, dato, ansvarlig, deltakere og gjennomgang før fullføring.';end if;
  if k='planned_on' and v<>'' then if v!~'^\d{4}-\d{2}-\d{2}$' or to_char(v::date,'YYYY-MM-DD')<>v then raise exception 'Velg en gyldig dato.';end if;end if;
  if k='responsible_id' and v<>'' then perform v::uuid;end if;
  clean:=clean||jsonb_build_object(k,v);
 end loop;
 if jsonb_typeof(c->'acceptance') is distinct from 'object' then raise exception 'Oppgi vurderingsgrenser.';end if;
 low:=nullif(c#>>'{acceptance,low_max}','')::integer;medium:=nullif(c#>>'{acceptance,medium_max}','')::integer;
 if kind='risk' and (low is null or medium is null or low<1 or low>=medium or medium>=25) then raise exception 'Lav grense må være mindre enn moderat grense. Bruk 1–24.';end if;
 clean:=clean||jsonb_build_object('acceptance',jsonb_build_object('low_max',low,'medium_max',medium,'description',kshms_private.execution_text(c->'acceptance','description',2000),'confirmed',coalesce(c#>'{acceptance,confirmed}'='true'::jsonb,false)));
 if kind='round' then
  if jsonb_typeof(c->'points') is distinct from 'array' or jsonb_array_length(c->'points') not between 1 and 100 or jsonb_typeof(c->'answers') is distinct from 'object' then raise exception 'Legg til 1–100 sjekkpunkter.';end if;
  for p in select value from jsonb_array_elements(c->'points') loop
   pid:=(p->>'id')::uuid;if pid is null or pid=any(ids) then raise exception 'Sjekkpunktene må ha ulike ID-er.';end if;ids:=array_append(ids,pid);
   p:=jsonb_build_object('id',pid,'title',kshms_private.execution_text(p,'title',600),'guidance',kshms_private.execution_text(p,'guidance',2000),'image_required',coalesce(p->'image_required'='true'::jsonb,false),'comment_required',coalesce(p->'comment_required'='true'::jsonb,false));
   a:=coalesce(c->'answers'->pid::text,'{}');answer_status:=coalesce(a->>'status','');if answer_status not in('','ok','deviation','na') then raise exception 'Velg OK, avvik eller ikke aktuelt.';end if;
   photos:=coalesce(a->'photos','[]');if jsonb_typeof(photos) is distinct from 'array' or jsonb_array_length(photos)>3 then raise exception 'Bruk inntil tre bilder per sjekkpunkt.';end if;
   for photo in select value from jsonb_array_elements(photos) loop
    if nullif(photo->>'id','')::uuid is null or jsonb_typeof(photo->'data') is distinct from 'string' or length(photo->>'data')>400000 or photo->>'data'!~'^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$' then raise exception 'Ugyldig dokumentasjonsbilde.';end if;
   end loop;
   a:=jsonb_build_object('status',answer_status,'comment',kshms_private.execution_text(a,'comment'),'responsible_id',kshms_private.execution_text(a,'responsible_id',36),'due_on',kshms_private.execution_text(a,'due_on',10),'photos',photos);
   if a->>'responsible_id'<>'' then perform (a->>'responsible_id')::uuid;end if;
   if a->>'due_on'<>'' then if a->>'due_on'!~'^\d{4}-\d{2}-\d{2}$' or to_char((a->>'due_on')::date,'YYYY-MM-DD')<>a->>'due_on' then raise exception 'Velg en gyldig frist.';end if;end if;
   if finished then
    if p->>'title'='' or answer_status='' then raise exception 'Hvert sjekkpunkt må ha tekst og svar.';end if;
    if ((p->>'comment_required')::boolean or answer_status in('deviation','na')) and a->>'comment'='' then raise exception 'Skriv påkrevd kommentar eller begrunnelse.';end if;
    if (p->>'image_required')::boolean and answer_status<>'na' and jsonb_array_length(photos)=0 then raise exception 'Legg til påkrevd bilde.';end if;
    if answer_status='deviation' and (a->>'responsible_id'='' or a->>'due_on'='') then raise exception 'Velg ansvarlig og frist for hvert avvik.';end if;
   end if;
   arr:=arr||jsonb_build_array(p);answers:=answers||jsonb_build_object(pid::text,a);
  end loop;
  return clean||jsonb_build_object('points',arr,'answers',answers);
 elsif kind='risk' then
  if jsonb_typeof(c->'risks') is distinct from 'array' or jsonb_array_length(c->'risks') not between 1 and 100 then raise exception 'Legg til 1–100 farer.';end if;
  if finished and (clean->>'basis'='' or clean#>>'{acceptance,description}'='' or clean#>'{acceptance,confirmed}' is distinct from 'true'::jsonb) then raise exception 'Beskriv vurderingsgrunnlag og bekreft firmaets grenser og akseptkrav.';end if;
  for r in select value from jsonb_array_elements(c->'risks') loop
   pid:=(r->>'id')::uuid;if pid is null or pid=any(ids) then raise exception 'Farene må ha ulike ID-er.';end if;ids:=array_append(ids,pid);
   p:=jsonb_build_object('id',pid);
   foreach k in array array['activity','hazard','consequence','existing_measures','planned_measures','follow_up','reason','owner_id','due_on','verified_on'] loop
    v:=kshms_private.execution_text(r,k,case when k='owner_id' then 36 when k in('due_on','verified_on') then 10 else 5000 end);
    if finished and k<>'verified_on' and v='' then raise exception 'Dokumenter fare, konsekvens, tiltak, ansvarlig, frist, oppfølging og begrunnelse.';end if;
    if k='owner_id' and v<>'' then perform v::uuid;end if;
    if k in('due_on','verified_on') and v<>'' then if v!~'^\d{4}-\d{2}-\d{2}$' or to_char(v::date,'YYYY-MM-DD')<>v then raise exception 'Velg gyldige tiltaksdatoer.';end if;end if;
    p:=p||jsonb_build_object(k,v);
   end loop;
   foreach k in array array['probability_before','consequence_before','probability_after','consequence_after'] loop
    v:=r->>k;if v is not null and (v!~'^[1-5]$') then raise exception 'Sannsynlighet og konsekvens må være 1–5.';end if;
    if finished and v is null then raise exception 'Vurder risiko før og etter tiltak.';end if;p:=p||jsonb_build_object(k,v::integer);
   end loop;
   decision:=coalesce(r->>'decision','');effect:=coalesce(r->>'effect_status','planned');if decision not in('','accepted','needs_action','stop') or effect not in('planned','verified') then raise exception 'Velg gyldig beslutning og tiltaksstatus.';end if;
   if finished and (decision='' or (effect='verified' and p->>'verified_on'='') or (decision='accepted' and (effect<>'verified' or p->>'verified_on'='' or (p->>'probability_after')::integer*(p->>'consequence_after')::integer>medium))) then raise exception 'Aksept krever kontrollert effekt og begrunnelse. Høy eller forventet risiko må ha videre tiltak eller stans.';end if;
   arr:=arr||jsonb_build_array(p||jsonb_build_object('decision',decision,'effect_status',effect));
  end loop;
  return clean||jsonb_build_object('risks',arr);
 else raise exception 'Ukjent gjennomføring.';end if;
end $$;

create function public.kshms_execution_detail(p_company_id uuid,p_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb;e public.kshms_executions%rowtype;links jsonb;
begin
 x:=kshms_private.require_context(p_company_id);select * into e from public.kshms_executions where id=p_id and company_id=p_company_id;
 if e.id is null or not kshms_private.execution_visible(e,x) then raise exception 'Gjennomføringen er ikke tilgjengelig.' using errcode='42501';end if;
 select coalesce(jsonb_agg(jsonb_build_object('point_id',l.point_id,'point_title',l.point_title,'case',case when kshms_private.deviation_visible(d,x) then to_jsonb(d) else null end)),'[]') into links from public.kshms_execution_deviations l join public.kshms_deviations d on d.id=l.deviation_id and d.company_id=p_company_id where l.execution_id=e.id;
 return jsonb_build_object('context',x,'record',to_jsonb(e)||jsonb_build_object('project_name',(select coalesce(p.data#>>'{project,projectName}',p.title) from public.projects p where p.id=e.project_id)),'links',links);
end $$;
create function public.kshms_execution_state(p_company_id uuid,p_kind text,p_status text default 'all',p_query text default '',p_before timestamptz default null,p_before_id uuid default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb;records jsonb;members jsonb;templates jsonb;choices jsonb;cursor jsonb;
begin
 x:=kshms_private.require_context(p_company_id);
 if p_kind not in('round','risk') or p_status not in('all','draft','completed') or length(coalesce(p_query,''))>160 or (p_before is null)<>(p_before_id is null) then raise exception 'Ugyldig søk etter gjennomføringer.';end if;
 with page as (select e.* from public.kshms_executions e where e.company_id=p_company_id and e.kind=p_kind and kshms_private.execution_visible(e,x) and (p_status='all' or e.status=p_status) and (coalesce(p_query,'')='' or strpos(lower(e.content->>'title'),lower(p_query))>0) and (p_before is null or (e.updated_at,e.id)<(p_before,p_before_id)) order by e.updated_at desc,e.id desc limit 101),shown as (select * from page order by updated_at desc,id desc limit 100)
 select (select coalesce(jsonb_agg(jsonb_build_object('id',id,'title',content->>'title','workplace',content->>'workplace','planned_on',content->>'planned_on','status',status,'revision',revision,'updated_at',updated_at,'completed_at',completed_at,'completed_identity',completed_identity) order by updated_at desc,id desc),'[]') from shown),case when (select count(*) from page)>100 then (select jsonb_build_object('updated_at',updated_at,'id',id) from shown order by updated_at,id limit 1) else null end into records,cursor;
 select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'identity',kshms_private.identity_snapshot(p.id)) order by p.email),'[]') into members from public.sales_company_memberships m join public.profiles p on p.id=m.user_id where m.company_id=p_company_id and kshms_private.deviation_member(p_company_id,p.id);
 with current_editions as(select distinct on(v.template_id) v.* from public.kshms_checklist_versions v join public.kshms_checklist_templates t on t.id=v.template_id and not t.archived where v.company_id=p_company_id order by v.template_id,v.number desc)
 select coalesce(jsonb_agg(jsonb_build_object('id',id,'number',number,'content',content) order by content->>'title'),'[]') into templates from current_editions;
 choices:=public.kshms_job_choices(p_company_id);
 return jsonb_build_object('context',x,'records',records,'next',cursor,'members',members,'templates',templates,'projects',choices->'projects','project_total',choices->'project_total');
end $$;
create function public.kshms_execution_command(p_company_id uuid,p_action text,p_request_id uuid,p_payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare x jsonb;e public.kshms_executions%rowtype;receipt public.kshms_execution_commands%rowtype;version_row public.kshms_checklist_versions%rowtype;p public.projects%rowtype;id uuid;project uuid;version uuid;kind text;c jsonb;target uuid;digest text;statement_value text:='Jeg bekrefter at jeg har gjennomført og kontrollert dokumentasjonen sammen med de oppgitte deltakerne.';point jsonb;answer jsonb;risk jsonb;cases jsonb;case_row jsonb;response jsonb;
begin
 x:=kshms_private.require_context(p_company_id);
 if p_action is null or p_action not in('save','complete') or p_request_id is null or jsonb_typeof(p_payload) is distinct from 'object' or octet_length(p_payload::text)>3500000 then raise exception 'Ugyldig lagringsforespørsel.';end if;
 perform 1 from public.company_module_access where company_id=p_company_id and module_key='kshms' for update;x:=kshms_private.require_context(p_company_id);
 id:=(p_payload->>'id')::uuid;kind:=p_payload->>'kind';project:=nullif(p_payload->>'project_id','')::uuid;version:=nullif(p_payload->>'template_version_id','')::uuid;
 if id is null or kind not in('round','risk') then raise exception 'Ugyldig gjennomføring.';end if;
 if project is not null then p:=kshms_private.project_checklist_access(p_company_id,project,true);end if;
 digest:=encode(extensions.digest(convert_to(jsonb_build_object('action',p_action,'payload',p_payload)::text,'UTF8'),'sha256'),'hex');
 select * into receipt from public.kshms_execution_commands where company_id=p_company_id and request_id=p_request_id;
 if receipt.request_id is not null then if receipt.actor_id<>auth.uid() or receipt.payload_hash<>digest then raise exception 'Forespørselen er brukt med annen tekst eller bruker.' using errcode='40001';end if;return receipt.result;end if;
 select * into e from public.kshms_executions where kshms_executions.id=id and company_id=p_company_id for update;
 if e.id is not null then
  if not kshms_private.execution_visible(e,x) then raise exception 'Gjennomføringen er ikke tilgjengelig.' using errcode='42501';end if;
  if e.status='completed' then raise exception 'Fullført dokumentasjon kan ikke endres. Start en ny gjennomføring.' using errcode='42501';end if;
  if e.revision is distinct from (p_payload->>'revision')::bigint then raise exception 'En annen person har lagret endringer. Sammenlign med lagret utgave.' using errcode='40001';end if;
  if row(e.kind,e.project_id,e.template_version_id) is distinct from row(kind,project,version) then raise exception 'Prosjekt og malutgave er faste etter første lagring.';end if;
 else
  if (p_payload->>'revision')::bigint is distinct from 0::bigint or exists(select 1 from public.kshms_executions existing where existing.id=id) then raise exception 'Gjennomføringen er ikke tilgjengelig.' using errcode='42501';end if;
  if version is not null then
   if kind<>'round' then raise exception 'Risikovurdering bruker egne jobbspesifikke farer.';end if;
   select v.* into version_row from public.kshms_checklist_versions v join public.kshms_checklist_templates t on t.id=v.template_id and not t.archived where v.id=version and v.company_id=p_company_id;
   if version_row.id is null then raise exception 'Velg en tilgjengelig publisert firmamal.' using errcode='42501';end if;
   e.template_snapshot:=jsonb_build_object('id',version_row.id,'template_id',version_row.template_id,'number',version_row.number,'content_hash',version_row.content_hash,'content',version_row.content);
  end if;
 end if;
 c:=kshms_private.execution_content(p_payload->'content',kind,p_action='complete');
 if version is not null and c->'points' is distinct from e.template_snapshot#>'{content,points}' then raise exception 'En publisert malutgave kan ikke omskrives i gjennomføringen.';end if;
 target:=nullif(c->>'responsible_id','')::uuid;if not kshms_private.deviation_member(p_company_id,target) then raise exception 'Velg en aktiv ansvarlig med KS/HMS-tilgang.' using errcode='42501';end if;
 if p_action='complete' and (target<>auth.uid() or p_payload->'confirmed' is distinct from 'true'::jsonb or p_payload->>'statement' is distinct from statement_value) then raise exception 'Bare valgt ansvarlig kan fullføre med egen bekreftelse.' using errcode='42501';end if;
 if kind='round' then
  cases:=c->'answers';for point in select value from jsonb_array_elements(c->'points') loop answer:=cases->(point->>'id');
   if answer->>'responsible_id'<>'' then
    if not kshms_private.deviation_member(p_company_id,(answer->>'responsible_id')::uuid) then raise exception 'Velg en aktiv tiltaksansvarlig med KS/HMS-tilgang.' using errcode='42501';end if;
    answer:=answer||jsonb_build_object('responsible_identity',kshms_private.identity_snapshot((answer->>'responsible_id')::uuid));cases:=cases||jsonb_build_object(point->>'id',answer);
   end if;
  end loop;c:=c||jsonb_build_object('answers',cases);
 else
  cases:='[]';for risk in select value from jsonb_array_elements(c->'risks') loop
   if risk->>'owner_id'<>'' then if not kshms_private.deviation_member(p_company_id,(risk->>'owner_id')::uuid) then raise exception 'Velg en aktiv tiltaksansvarlig med KS/HMS-tilgang.' using errcode='42501';end if;risk:=risk||jsonb_build_object('owner_identity',kshms_private.identity_snapshot((risk->>'owner_id')::uuid));end if;cases:=cases||jsonb_build_array(risk);
  end loop;c:=c||jsonb_build_object('risks',cases);
 end if;
 if e.id is null then
  insert into public.kshms_executions(id,company_id,kind,project_id,template_version_id,template_snapshot,content,responsible_id,responsible_identity,created_by,creator_identity,updated_by,updated_identity)
  values(id,p_company_id,kind,project,version,e.template_snapshot,c,target,kshms_private.identity_snapshot(target),auth.uid(),kshms_private.identity_snapshot(auth.uid()),auth.uid(),kshms_private.identity_snapshot(auth.uid())) returning * into e;
 else update public.kshms_executions set content=c,responsible_id=target,responsible_identity=kshms_private.identity_snapshot(target),updated_by=auth.uid(),updated_identity=kshms_private.identity_snapshot(auth.uid()),updated_at=now(),revision=revision+1 where kshms_executions.id=e.id returning * into e;end if;
 if p_action='complete' then
  if kind='round' then for point in select value from jsonb_array_elements(c->'points') loop answer:=c->'answers'->(point->>'id');if answer->>'status'='deviation' then
   case_row:=public.kshms_deviation_command(p_company_id,'create',jsonb_build_object('request_id',gen_random_uuid(),'title',left('Kontrollavvik: '||(point->>'title'),160),'event','Fra vernerunde/kontroll «'||(c->>'title')||'», punkt «'||(point->>'title')||'».'||E'\n'||(answer->>'comment'),'category','hms','responsible_id',answer->>'responsible_id','due_on',answer->>'due_on','project_id',project,'source_kind','company','source_key','execution:'||e.id::text||':'||(point->>'id'),'immediate_action',''));
   insert into public.kshms_execution_deviations(execution_id,point_id,deviation_id,point_title) values(e.id,(point->>'id')::uuid,(case_row->>'id')::uuid,point->>'title');
  end if;end loop;end if;
  update public.kshms_executions set status='completed',completed_by=auth.uid(),completed_identity=kshms_private.identity_snapshot(auth.uid()),completed_at=now(),statement=statement_value where kshms_executions.id=e.id returning * into e;
 end if;
 response:=jsonb_build_object('record',jsonb_build_object('id',e.id,'company_id',e.company_id,'revision',e.revision,'status',e.status));insert into public.kshms_execution_commands(company_id,request_id,actor_id,payload_hash,result) values(p_company_id,p_request_id,auth.uid(),digest,response);return response;
end $$;
revoke all on function kshms_private.execution_protect(),kshms_private.execution_visible(public.kshms_executions,jsonb),kshms_private.execution_text(jsonb,text,integer),kshms_private.execution_content(jsonb,text,boolean) from public,anon,authenticated;
revoke all on function public.kshms_execution_state(uuid,text,text,text,timestamptz,uuid),public.kshms_execution_detail(uuid,uuid),public.kshms_execution_command(uuid,text,uuid,jsonb) from public,anon;
grant execute on function public.kshms_execution_state(uuid,text,text,text,timestamptz,uuid),public.kshms_execution_detail(uuid,uuid),public.kshms_execution_command(uuid,text,uuid,jsonb) to authenticated;
