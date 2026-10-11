-- Personal conversations use the existing private artifact/purge domain.
-- This migration does not enable content or change any existing release gate.
create table hr_private.conversations (
 id uuid primary key, company_id uuid not null, employee_id uuid not null,
 revision integer not null check(revision>0), current_artifact_id uuid not null,
 foreign key(company_id,employee_id) references hr_private.employees(company_id,id) on delete cascade,
 foreign key(company_id,employee_id,current_artifact_id) references hr_private.artifacts(company_id,employee_id,id) on delete cascade
);
create index hr_conversations_employee on hr_private.conversations(company_id,employee_id,id);
alter table hr_private.conversations enable row level security;
revoke all on hr_private.conversations from public,anon,authenticated,service_role;

create function hr_private.conversation_employee(c uuid,eid uuid) returns hr_private.employees
language plpgsql security definer set search_path='' as $$declare e hr_private.employees%rowtype;begin
 perform hr_private.require_context(c);
 perform hr_private.require_content_ready();
 select * into e from hr_private.employees where company_id=c and id=eid for share;
 if e.id is null or not hr_private.can_read(c,e,auth.uid()) then
  raise exception 'Samtalen er ikke tilgjengelig.' using errcode='42501';end if;
 return e;
end$$;

create function hr_private.conversation_visible(v jsonb,e hr_private.employees,historical boolean default false) returns jsonb
language plpgsql security definer set search_path='' as $$declare r jsonb:=v;begin
 -- Unshared employee preparation is never included for managers/admin/readers.
 if auth.uid()<>e.user_id and coalesce((v->>'shared')::boolean,false)=false then
  r:=jsonb_set(r,'{preparation}','{}'::jsonb);
 end if;
 -- A new current leader must confirm personally. Never inherit the old leader's signature.
 if not historical and v#>>'{confirmations,leader,user_id}' is distinct from e.leader_id::text then
  r:=jsonb_set(r,'{confirmations,leader}','null'::jsonb);
  if r->>'stage'='completed' then r:=jsonb_set(r,'{stage}','"awaiting"'::jsonb);end if;
 end if;
 return r;
end$$;

create function public.hr_conversation_templates(p_company_id uuid,p_employee_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$declare x jsonb;e hr_private.employees%rowtype;rows jsonb;begin
 e:=hr_private.conversation_employee(p_company_id,p_employee_id);
 if auth.uid() is distinct from e.leader_id then raise exception 'Nærmeste leder starter samtalen.' using errcode='42501';end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',t.id,'revision',t.revision,'title',v.content->>'title') order by t.id),'[]'::jsonb)
 into rows from hr_private.conversation_templates t join hr_private.conversation_template_versions v
 on v.template_id=t.id and v.company_id=t.company_id and v.revision=t.revision
 where t.company_id=p_company_id and not t.archived and v.content->>'kind'<>'sickleave';
 x:=hr_private.require_context(p_company_id);
 return jsonb_build_object('context',x,'employee_revision',e.revision,'templates',rows);
end$$;

create function public.hr_conversation_get(p_company_id uuid,p_employee_id uuid,p_conversation_id uuid,p_version integer default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare x jsonb;e hr_private.employees%rowtype;t hr_private.conversations%rowtype;a hr_private.artifacts%rowtype;v jsonb;
begin
 e:=hr_private.conversation_employee(p_company_id,p_employee_id);
 select * into t from hr_private.conversations where company_id=p_company_id and employee_id=e.id and id=p_conversation_id;
 if t.id is null then raise exception 'Samtalen er ikke tilgjengelig.' using errcode='42501';end if;
 if p_version is null then select * into a from hr_private.artifacts where id=t.current_artifact_id;
 else
  if p_version<1 or p_version>t.revision then raise exception 'Utgaven finnes ikke.' using errcode='22023';end if;
  select * into a from hr_private.artifacts where company_id=p_company_id and employee_id=e.id
   and payload->>'type'='conversation' and payload->>'id'=t.id::text and payload->>'revision'=p_version::text;
 end if;
 if a.id is null then raise exception 'Utgaven finnes ikke.' using errcode='42501';end if;
 v:=hr_private.conversation_visible(a.payload,e,p_version is not null and p_version<>t.revision);
 x:=hr_private.require_context(p_company_id);
 return jsonb_build_object('context',x,'employee',hr_private.employee_json(e),
 'leader_email',(select email from public.profiles where id=case when p_version is not null and p_version<>t.revision then (a.payload->>'leader_id')::uuid else e.leader_id end),
 'current_revision',t.revision,'conversation',v,'historical',p_version is not null and p_version<>t.revision,
 'permissions',jsonb_build_object('prepare',auth.uid()=e.user_id and v->>'stage'='preparation',
 'meeting',auth.uid()=e.leader_id and v->>'stage' in ('meeting','awaiting'),
 'confirm',auth.uid() in(e.user_id,e.leader_id) and v->>'stage' in ('awaiting','completed'),
 'comment',auth.uid() in(e.user_id,e.leader_id) and coalesce((v->>'shared')::boolean,false)));
end$$;

create function public.hr_conversation_list(p_company_id uuid,p_employee_id uuid,p_after uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$declare x jsonb;e hr_private.employees%rowtype;rows jsonb;begin
 e:=hr_private.conversation_employee(p_company_id,p_employee_id);
 select coalesce(jsonb_agg(to_jsonb(q) order by q.id),'[]'::jsonb) into rows from(
  select t.id,t.revision,a.payload#>>'{template,title}' as title,a.payload->>'on' as on,
   hr_private.conversation_visible(a.payload,e)->>'stage' as stage,a.payload->>'saved_at' as saved_at
  from hr_private.conversations t join hr_private.artifacts a on a.id=t.current_artifact_id
  where t.company_id=p_company_id and t.employee_id=e.id and(p_after is null or t.id>p_after) order by t.id limit 30
 )q;
 x:=hr_private.require_context(p_company_id);
 return jsonb_build_object('context',x,'employee',hr_private.employee_json(e),'conversations',rows,
 'next',case when jsonb_array_length(rows)=30 then rows->29->>'id' else null end,'can_start',auth.uid()=e.leader_id);
end$$;

create function public.hr_conversation_start(p_company_id uuid,p_employee_id uuid,p_employee_revision integer,
 p_conversation_id uuid,p_template_id uuid,p_template_revision integer,p_on date) returns jsonb
language plpgsql security definer set search_path='' as $$
declare e hr_private.employees%rowtype;t hr_private.conversation_templates%rowtype;tpl jsonb;v jsonb;aid uuid:=gen_random_uuid();old hr_private.conversations%rowtype;
begin
 perform 1 from hr_private.firms where company_id=p_company_id for update;
 e:=hr_private.conversation_employee(p_company_id,p_employee_id);
 if auth.uid() is distinct from e.leader_id then raise exception 'Nærmeste leder starter samtalen.' using errcode='42501';end if;
 if p_employee_revision is distinct from e.revision then raise exception 'Medarbeiderens tilgang er endret.' using errcode='40001';end if;
 if p_conversation_id is null or p_on is null then raise exception 'Samtaleidentitet og dato kreves.' using errcode='22023';end if;
 select * into old from hr_private.conversations where id=p_conversation_id;
 if old.id is not null then
  if old.company_id<>p_company_id or old.employee_id<>e.id then raise exception 'Samtalen er ikke tilgjengelig.' using errcode='42501';end if;
  -- Unknown start responses are resolved by reading this ID, never by creating another case.
  return public.hr_conversation_get(p_company_id,e.id,old.id);
 end if;
 select * into t from hr_private.conversation_templates where company_id=p_company_id and id=p_template_id;
 if t.id is null or t.archived then raise exception 'Velg en aktiv samtalemal.' using errcode='22023';end if;
 if t.revision is distinct from p_template_revision then raise exception 'Malen er endret. Velg ny utgave.' using errcode='40001';end if;
 select content into tpl from hr_private.conversation_template_versions where template_id=t.id and revision=t.revision;
 if tpl->>'kind'='sickleave' then raise exception 'Velg en medarbeidersamtale, ikke sykefraværsplan.' using errcode='22023';end if;
 if(select count(*) from hr_private.conversations where company_id=p_company_id and employee_id=e.id)>=200 then
  raise exception 'Kontroller lagringsbehovet før flere samtaler opprettes.' using errcode='22023';end if;
 v:=jsonb_build_object('type','conversation','id',p_conversation_id,'revision',1,'content_version',1,
 'template_id',t.id,'template_revision',t.revision,'template',tpl,'leader_id',e.leader_id,'on',p_on,'stage','preparation','shared',false,
 'preparation','{}'::jsonb,'meeting','{}'::jsonb,'actions','[]'::jsonb,'next_on','',
 'comments',jsonb_build_object('employee','','leader',''),'confirmations',jsonb_build_object('employee',null,'leader',null),
 'saved_at',now(),'saved_by',auth.uid());
 insert into hr_private.artifacts(id,company_id,employee_id,employee_revision,kind,payload,review_on)
 values(aid,p_company_id,e.id,e.revision,'version',v,(select review_on from hr_private.firms where company_id=p_company_id));
 insert into hr_private.conversations values(p_conversation_id,p_company_id,e.id,1,aid);
 return public.hr_conversation_get(p_company_id,e.id,p_conversation_id);
end$$;

create function hr_private.validate_conversation_answers(answers jsonb,tpl jsonb,phase text,complete boolean) returns void
language plpgsql security definer set search_path='' as $$declare k text;q jsonb;begin
 if jsonb_typeof(answers) is distinct from 'object' or octet_length(answers::text)>110000 then
  raise exception 'Ugyldige samtalesvar.' using errcode='22023';end if;
 for k in select jsonb_object_keys(answers) loop
  if not exists(select 1 from jsonb_array_elements(tpl->'questions') as items(value) where items.value->>'id'=k and items.value->>'phase'=phase)
   or jsonb_typeof(answers->k) is distinct from 'string' or length(answers->>k)>4000 then
   raise exception 'Et svar har feil spørsmål eller er for langt.' using errcode='22023';end if;
 end loop;
 if complete then
  for q in select value from jsonb_array_elements(tpl->'questions') where value->>'phase'=phase and(value->>'required')::boolean loop
   if length(trim(coalesce(answers->>(q->>'id'),'')))=0 then raise exception 'Svar på de obligatoriske spørsmålene først.' using errcode='22023';end if;
  end loop;
 end if;
end$$;

create function public.hr_conversation_command(p_company_id uuid,p_employee_id uuid,p_employee_revision integer,
 p_conversation_id uuid,p_revision integer,p_action text,p_data jsonb default '{}'::jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare e hr_private.employees%rowtype;t hr_private.conversations%rowtype;v jsonb;a jsonb;q jsonb;keys text[];
 aid uuid:=gen_random_uuid();is_employee boolean;is_leader boolean;side text;changed boolean:=true;owner uuid;ids uuid[]:='{}';qid uuid;
begin
 perform 1 from hr_private.firms where company_id=p_company_id for update;
 e:=hr_private.conversation_employee(p_company_id,p_employee_id);
 if p_employee_revision is distinct from e.revision then raise exception 'Medarbeiderens tilgang er endret.' using errcode='40001';end if;
 select * into t from hr_private.conversations where company_id=p_company_id and employee_id=e.id and id=p_conversation_id for update;
 if t.id is null then raise exception 'Samtalen er ikke tilgjengelig.' using errcode='42501';end if;
 if p_revision is distinct from t.revision then raise exception 'Samtalen er endret. Arbeidet ditt er beholdt; hent ny utgave.' using errcode='40001';end if;
 select payload into v from hr_private.artifacts where id=t.current_artifact_id;
 -- Mutations retain the private preparation; redaction is only for responses.
 if v#>>'{confirmations,leader,user_id}' is distinct from e.leader_id::text then
  v:=jsonb_set(v,'{confirmations,leader}','null'::jsonb);
  if v->>'stage'='completed' then v:=jsonb_set(v,'{stage}','"awaiting"'::jsonb);end if;
 end if;
 is_employee:=coalesce(auth.uid()=e.user_id,false);is_leader:=coalesce(auth.uid()=e.leader_id,false);
 if p_action is null or p_action not in('preparation','share','meeting','ready','comment','confirm','revise')
 or jsonb_typeof(p_data) is distinct from 'object' or octet_length(p_data::text)>180000 then
  raise exception 'Ugyldig samtalehandling.' using errcode='22023';end if;
 keys:=case p_action when 'preparation' then array['answers'] when 'meeting' then array['answers','actions','next_on']
 when 'comment' then array['text'] else '{}'::text[] end;
 if exists(select 1 from jsonb_object_keys(p_data) k where not k=any(keys)) or not p_data ?& keys then
  raise exception 'Ukjente eller manglende samtalefelt.' using errcode='22023';end if;
 if p_action in('preparation','share') then
  if not is_employee or v->>'stage'<>'preparation' then raise exception 'Bare medarbeideren kan forberede sin åpne kladd.' using errcode='42501';end if;
  a:=case when p_action='preparation' then p_data->'answers' else v->'preparation' end;
  perform hr_private.validate_conversation_answers(a,v->'template','preparation',p_action='share');
  v:=jsonb_set(v,'{preparation}',a);
  if p_action='share' then v:=v||jsonb_build_object('stage','meeting','shared',true);end if;
 elsif p_action in('meeting','ready','revise') then
  if not is_leader then raise exception 'Bare nærmeste leder redigerer møtereferatet.' using errcode='42501';end if;
  if p_action='revise' then
   if v->>'stage' not in('awaiting','completed') then raise exception 'Referatet er allerede åpent.' using errcode='22023';end if;
   v:=jsonb_set(v,'{stage}','"meeting"'::jsonb);
  else
   if v->>'stage' not in('meeting','awaiting') then raise exception 'Medarbeideren må dele forberedelsen først.' using errcode='22023';end if;
   if p_action='meeting' then
    perform hr_private.validate_conversation_answers(p_data->'answers',v->'template','meeting',false);
    if jsonb_typeof(p_data->'actions') is distinct from 'array' or jsonb_array_length(p_data->'actions')>12
    or jsonb_typeof(p_data->'next_on') is distinct from 'string' then raise exception 'Ugyldige tiltak eller oppfølgingsdato.' using errcode='22023';end if;
    if p_data->>'next_on'<>'' then
     if p_data->>'next_on' !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'Ugyldig oppfølgingsdato.' using errcode='22023';end if;
     perform(p_data->>'next_on')::date;
    end if;
    for q in select value from jsonb_array_elements(p_data->'actions') loop
     if jsonb_typeof(q) is distinct from 'object' or not q ?& array['id','task','owner_id','due_on','done']
     or exists(select 1 from jsonb_object_keys(q) k where not k=any(array['id','task','owner_id','due_on','done']))
     or jsonb_typeof(q->'task') is distinct from 'string' or length(trim(q->>'task')) not between 1 and 600
     or jsonb_typeof(q->'done') is distinct from 'boolean' or jsonb_typeof(q->'due_on') is distinct from 'string'
     or q->>'due_on' !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'Hvert tiltak trenger oppgave, ansvarlig og frist.' using errcode='22023';end if;
     qid:=(q->>'id')::uuid;owner:=(q->>'owner_id')::uuid;
     if qid is null or qid=any(ids) or owner is null or (owner is distinct from e.user_id and owner is distinct from e.leader_id)
      or not hr_private.active_member(p_company_id,owner) then raise exception 'Velg medarbeideren eller lederen som ansvarlig.' using errcode='22023';end if;
     ids:=array_append(ids,qid);perform(q->>'due_on')::date;
    end loop;
    if jsonb_array_length(p_data->'actions')>0 and p_data->>'next_on'='' then raise exception 'Velg neste oppfølgingsdato når tiltak er avtalt.' using errcode='22023';end if;
    v:=v||jsonb_build_object('meeting',p_data->'answers','actions',p_data->'actions','next_on',p_data->>'next_on','stage','meeting');
   else
    perform hr_private.validate_conversation_answers(v->'meeting',v->'template','meeting',true);
    v:=jsonb_set(v,'{stage}','"awaiting"'::jsonb);
   end if;
  end if;
 elsif p_action='comment' then
  if not(is_employee or is_leader) or not(v->>'shared')::boolean then raise exception 'Bare partene kan legge til egne kommentarer.' using errcode='42501';end if;
  if jsonb_typeof(p_data->'text') is distinct from 'string' or length(p_data->>'text')>4000 then raise exception 'Kommentaren er for lang.' using errcode='22023';end if;
  side:=case when is_employee then 'employee' else 'leader' end;
  v:=jsonb_set(v,array['comments',side],p_data->'text');
  if v->>'stage'='completed' then v:=jsonb_set(v,'{stage}','"awaiting"'::jsonb);end if;
 else
  if not(is_employee or is_leader) or v->>'stage' not in('awaiting','completed') then raise exception 'Begge parter bekrefter selv etter gjennomgang.' using errcode='42501';end if;
  changed:=false;side:=case when is_employee then 'employee' else 'leader' end;
  if v#>>array['confirmations',side,'user_id']=auth.uid()::text then return public.hr_conversation_get(p_company_id,e.id,t.id);end if;
  v:=jsonb_set(v,array['confirmations',side],jsonb_build_object('user_id',auth.uid(),'at',now(),'content_version',v->'content_version'));
  if v#>>'{confirmations,employee,user_id}'=e.user_id::text and v#>>'{confirmations,leader,user_id}'=e.leader_id::text then
   v:=jsonb_set(v,'{stage}','"completed"'::jsonb);end if;
 end if;
 if changed then v:=v||jsonb_build_object('content_version',(v->>'content_version')::integer+1,
 'confirmations',jsonb_build_object('employee',null,'leader',null));end if;
 v:=v||jsonb_build_object('revision',t.revision+1,'leader_id',e.leader_id,'saved_at',now(),'saved_by',auth.uid());
 insert into hr_private.artifacts(id,company_id,employee_id,employee_revision,kind,payload,review_on)
 values(aid,p_company_id,e.id,e.revision,'version',v,(select review_on from hr_private.firms where company_id=p_company_id));
 update hr_private.conversations set revision=revision+1,current_artifact_id=aid where id=t.id;
 return public.hr_conversation_get(p_company_id,e.id,t.id);
end$$;

revoke all on function hr_private.conversation_employee(uuid,uuid),hr_private.conversation_visible(jsonb,hr_private.employees,boolean),hr_private.validate_conversation_answers(jsonb,jsonb,text,boolean) from public,anon,authenticated,service_role;
revoke all on function public.hr_conversation_templates(uuid,uuid),public.hr_conversation_get(uuid,uuid,uuid,integer),public.hr_conversation_list(uuid,uuid,uuid),public.hr_conversation_start(uuid,uuid,integer,uuid,uuid,integer,date),public.hr_conversation_command(uuid,uuid,integer,uuid,integer,text,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.hr_conversation_templates(uuid,uuid),public.hr_conversation_get(uuid,uuid,uuid,integer),public.hr_conversation_list(uuid,uuid,uuid),public.hr_conversation_start(uuid,uuid,integer,uuid,uuid,integer,date),public.hr_conversation_command(uuid,uuid,integer,uuid,integer,text,jsonb) to authenticated;

notify pgrst,'reload schema';
