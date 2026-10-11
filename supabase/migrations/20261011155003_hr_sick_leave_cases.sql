-- Additive private sick-leave case family. Reuses private artifacts/access/purge; opens no gates.
-- Calendar deadlines are operator tracking, not automated NAV decisions or submissions.
create table hr_private.sick_leave_cases (
 id uuid primary key, company_id uuid not null,employee_id uuid not null,revision integer not null check(revision>0),current_artifact_id uuid not null,
 foreign key(company_id,employee_id) references hr_private.employees(company_id,id) on delete cascade,
 foreign key(company_id,employee_id,current_artifact_id) references hr_private.artifacts(company_id,employee_id,id) on delete cascade
);
create index hr_sick_leave_employee on hr_private.sick_leave_cases(company_id,employee_id,id);
alter table hr_private.sick_leave_cases enable row level security;
revoke all on hr_private.sick_leave_cases from public,anon,authenticated,service_role;
create function hr_private.validate_sick_followup(data jsonb,old jsonb) returns void
language plpgsql security definer set search_path='' as $$declare key text;item jsonb;begin
 if jsonb_typeof(data->'on') is distinct from 'string' or data->>'on' !~ '^\d{4}-\d{2}-\d{2}$' or (data->>'on')::date>'9998-06-01'::date or (data->>'on')::date<'1000-01-01'::date or (data->>'on')::date>(now() at time zone 'Europe/Oslo')::date
 or jsonb_typeof(data->'absence_mode') is distinct from 'string' or data->>'absence_mode' not in('full','partial') or jsonb_typeof(data->'correction_reason') is distinct from 'string' or length(data->>'correction_reason')>1000
 or (data->>'on' is distinct from old->>'on' and length(trim(data->>'correction_reason'))<10)
 or jsonb_typeof(data->'milestones') is distinct from 'object' or not (data->'milestones') ?& array['plan','meeting1','activity','meeting2']
 or exists(select 1 from jsonb_object_keys(data->'milestones') k where not k=any(array['plan','meeting1','activity','meeting2'])) then raise exception 'Kontroller startdato, fraværstype og alle oppfølgingstrinn. Begrunn endret startdato.' using errcode='22023';end if;
 foreach key in array array['plan','meeting1','activity','meeting2'] loop
  item:=data#>array['milestones',key];
  if jsonb_typeof(item) is distinct from 'object' or not item ?& array['status','on','note'] or exists(select 1 from jsonb_object_keys(item) k where not k=any(array['status','on','note']))
   or jsonb_typeof(item->'status') is distinct from 'string' or item->>'status' not in('open','review','done','exempt') or jsonb_typeof(item->'note') is distinct from 'string' or length(item->>'note')>1000 or jsonb_typeof(item->'on') is distinct from 'string'
   or(item->>'status' in('done','exempt') and (length(trim(item->>'note'))<10 or item->>'on'=''))
   or(item->>'on'<>'' and (item->>'on' !~ '^\d{4}-\d{2}-\d{2}$' or (item->>'on')::date<(data->>'on')::date or (item->>'on')::date>(now() at time zone 'Europe/Oslo')::date))
  then raise exception 'Hvert håndtert trinn eller vurdert unntak trenger dato og kort begrunnelse uten diagnose.' using errcode='22023';end if;
 end loop;
end$$;
revoke all on function hr_private.validate_sick_followup(jsonb,jsonb) from public,anon,authenticated,service_role;

create function public.hr_sick_leave_templates(p_company_id uuid,p_employee_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$declare x jsonb;e hr_private.employees%rowtype;rows jsonb;begin
 e:=hr_private.conversation_employee(p_company_id,p_employee_id);
 if auth.uid() is distinct from e.leader_id then raise exception 'Nærmeste leder starter samtalen.' using errcode='42501';end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',t.id,'revision',t.revision,'title',v.content->>'title') order by t.id),'[]'::jsonb)
 into rows from hr_private.conversation_templates t join hr_private.conversation_template_versions v
 on v.template_id=t.id and v.company_id=t.company_id and v.revision=t.revision
 where t.company_id=p_company_id and not t.archived and v.content->>'kind'='sickleave';
 x:=hr_private.require_context(p_company_id);
 return jsonb_build_object('context',x,'employee_revision',e.revision,'templates',rows);
end$$;

create function public.hr_sick_leave_get(p_company_id uuid,p_employee_id uuid,p_conversation_id uuid,p_version integer default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare x jsonb;e hr_private.employees%rowtype;t hr_private.sick_leave_cases%rowtype;a hr_private.artifacts%rowtype;v jsonb;
begin
 e:=hr_private.conversation_employee(p_company_id,p_employee_id);
 select * into t from hr_private.sick_leave_cases where company_id=p_company_id and employee_id=e.id and id=p_conversation_id;
 if t.id is null then raise exception 'Oppfølgingen er ikke tilgjengelig.' using errcode='42501';end if;
 if p_version is null then select * into a from hr_private.artifacts where id=t.current_artifact_id;
 else
  if p_version<1 or p_version>t.revision then raise exception 'Utgaven finnes ikke.' using errcode='22023';end if;
  select * into a from hr_private.artifacts where company_id=p_company_id and employee_id=e.id
   and payload->>'type'='sickleave' and payload->>'id'=t.id::text and payload->>'revision'=p_version::text;
 end if;
 if a.id is null then raise exception 'Utgaven finnes ikke.' using errcode='42501';end if;
 v:=hr_private.conversation_visible(a.payload,e,p_version is not null and p_version<>t.revision);
 x:=hr_private.require_context(p_company_id);
 return jsonb_build_object('context',x,'employee',hr_private.employee_json(e),
 'leader_email',(select email from public.profiles where id=case when p_version is not null and p_version<>t.revision then (a.payload->>'leader_id')::uuid else e.leader_id end),
 'current_revision',t.revision,'conversation',v,'historical',p_version is not null and p_version<>t.revision,
 'permissions',jsonb_build_object('followup',auth.uid()=e.leader_id and v->>'case_status'='active','reopen',auth.uid()=e.leader_id and v->>'case_status'='closed','prepare',auth.uid()=e.user_id and v->>'stage'='preparation' and v->>'case_status'='active',
 'meeting',auth.uid()=e.leader_id and v->>'stage' in ('meeting','awaiting') and v->>'case_status'='active',
 'confirm',auth.uid() in(e.user_id,e.leader_id) and v->>'stage' in ('awaiting','completed') and v->>'case_status'='active',
 'comment',auth.uid() in(e.user_id,e.leader_id) and coalesce((v->>'shared')::boolean,false) and v->>'case_status'='active'));
end$$;

create function public.hr_sick_leave_list(p_company_id uuid,p_employee_id uuid,p_after uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$declare x jsonb;e hr_private.employees%rowtype;rows jsonb;begin
 e:=hr_private.conversation_employee(p_company_id,p_employee_id);
 select coalesce(jsonb_agg(to_jsonb(q) order by q.id),'[]'::jsonb) into rows from(
  select t.id,t.revision,a.payload#>>'{template,title}' as title,a.payload->>'on' as on,
   hr_private.conversation_visible(a.payload,e)->>'stage' as stage,a.payload->>'saved_at' as saved_at,a.payload->>'case_status' as case_status
  from hr_private.sick_leave_cases t join hr_private.artifacts a on a.id=t.current_artifact_id
  where t.company_id=p_company_id and t.employee_id=e.id and(p_after is null or t.id>p_after) order by t.id limit 30
 )q;
 x:=hr_private.require_context(p_company_id);
 return jsonb_build_object('context',x,'employee',hr_private.employee_json(e),'conversations',rows,
 'next',case when jsonb_array_length(rows)=30 then rows->29->>'id' else null end,'can_start',auth.uid()=e.leader_id);
end$$;

create function public.hr_sick_leave_start(p_company_id uuid,p_employee_id uuid,p_employee_revision integer,
 p_conversation_id uuid,p_template_id uuid,p_template_revision integer,p_on date,p_mode text default 'full') returns jsonb
language plpgsql security definer set search_path='' as $$
declare e hr_private.employees%rowtype;t hr_private.conversation_templates%rowtype;tpl jsonb;v jsonb;aid uuid:=gen_random_uuid();old hr_private.sick_leave_cases%rowtype;
begin
 perform 1 from hr_private.firms where company_id=p_company_id for update;
 e:=hr_private.conversation_employee(p_company_id,p_employee_id);
 if auth.uid() is distinct from e.leader_id then raise exception 'Nærmeste leder starter samtalen.' using errcode='42501';end if;
 if p_employee_revision is distinct from e.revision then raise exception 'Medarbeiderens tilgang er endret.' using errcode='40001';end if;
 if p_conversation_id is null or p_on is null or p_on>(now() at time zone 'Europe/Oslo')::date or p_on<'1000-01-01'::date or p_on>'9998-06-01'::date or p_mode is null or p_mode not in('full','partial') then raise exception 'Samtaleidentitet og dato kreves.' using errcode='22023';end if;
 select * into old from hr_private.sick_leave_cases where id=p_conversation_id;
 if old.id is not null then
  if old.company_id<>p_company_id or old.employee_id<>e.id then raise exception 'Oppfølgingen er ikke tilgjengelig.' using errcode='42501';end if;
  -- Unknown start responses are resolved by reading this ID, never by creating another case.
  return public.hr_sick_leave_get(p_company_id,e.id,old.id);
 end if;
 if exists(select 1 from hr_private.sick_leave_cases c join hr_private.artifacts a on a.id=c.current_artifact_id where c.company_id=p_company_id and c.employee_id=e.id and a.payload->>'case_status'='active') then raise exception 'Åpne den aktive oppfølgingen først.' using errcode='22023';end if;
 select * into t from hr_private.conversation_templates where company_id=p_company_id and id=p_template_id;
 if t.id is null or t.archived then raise exception 'Velg en aktiv samtalemal.' using errcode='22023';end if;
 if t.revision is distinct from p_template_revision then raise exception 'Malen er endret. Velg ny utgave.' using errcode='40001';end if;
 select content into tpl from hr_private.conversation_template_versions where template_id=t.id and revision=t.revision;
 if tpl->>'kind'<>'sickleave' then raise exception 'Velg en sykefraværsmal.' using errcode='22023';end if;
 if(select count(*) from hr_private.sick_leave_cases where company_id=p_company_id and employee_id=e.id)>=200 then
  raise exception 'Kontroller lagringsbehovet før flere samtaler opprettes.' using errcode='22023';end if;
 v:=jsonb_build_object('type','sickleave','id',p_conversation_id,'revision',1,'content_version',1,
 'template_id',t.id,'template_revision',t.revision,'template',tpl,'leader_id',e.leader_id,'on',p_on,'stage','preparation','shared',false,
 'preparation','{}'::jsonb,'meeting','{}'::jsonb,'actions','[]'::jsonb,'next_on','',
 'comments',jsonb_build_object('employee','','leader',''),'confirmations',jsonb_build_object('employee',null,'leader',null),
 'case_status','active','absence_mode',p_mode,'returned_on','','milestones',jsonb_build_object('plan',jsonb_build_object('status','open','on','','note',''),'meeting1',jsonb_build_object('status',case when p_mode='partial' then 'review' else 'open' end,'on','','note',''),'activity',jsonb_build_object('status','open','on','','note',''),'meeting2',jsonb_build_object('status','open','on','','note','')),'sharing',jsonb_build_object('sykmelder','[]'::jsonb,'nav','[]'::jsonb),
 'saved_at',now(),'saved_by',auth.uid());
 insert into hr_private.artifacts(id,company_id,employee_id,employee_revision,kind,payload,review_on)
 values(aid,p_company_id,e.id,e.revision,'version',v,(select review_on from hr_private.firms where company_id=p_company_id));
 insert into hr_private.sick_leave_cases values(p_conversation_id,p_company_id,e.id,1,aid);
 return public.hr_sick_leave_get(p_company_id,e.id,p_conversation_id);
end$$;

create function public.hr_sick_leave_command(p_company_id uuid,p_employee_id uuid,p_employee_revision integer,
 p_conversation_id uuid,p_revision integer,p_action text,p_data jsonb default '{}'::jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare e hr_private.employees%rowtype;t hr_private.sick_leave_cases%rowtype;v jsonb;a jsonb;q jsonb;keys text[];
 aid uuid:=gen_random_uuid();is_employee boolean;is_leader boolean;side text;changed boolean:=true;owner uuid;ids uuid[]:='{}';qid uuid;
begin
 perform 1 from hr_private.firms where company_id=p_company_id for update;
 e:=hr_private.conversation_employee(p_company_id,p_employee_id);
 if p_employee_revision is distinct from e.revision then raise exception 'Medarbeiderens tilgang er endret.' using errcode='40001';end if;
 select * into t from hr_private.sick_leave_cases where company_id=p_company_id and employee_id=e.id and id=p_conversation_id for update;
 if t.id is null then raise exception 'Oppfølgingen er ikke tilgjengelig.' using errcode='42501';end if;
 if p_revision is distinct from t.revision then raise exception 'Oppfølgingen er endret. Arbeidet ditt er beholdt; hent ny utgave.' using errcode='40001';end if;
 select payload into v from hr_private.artifacts where id=t.current_artifact_id;
 -- Mutations retain the private preparation; redaction is only for responses.
 if v#>>'{confirmations,leader,user_id}' is distinct from e.leader_id::text then
  v:=jsonb_set(v,'{confirmations,leader}','null'::jsonb);
  if v->>'stage'='completed' then v:=jsonb_set(v,'{stage}','"awaiting"'::jsonb);end if;
 end if;
 is_employee:=coalesce(auth.uid()=e.user_id,false);is_leader:=coalesce(auth.uid()=e.leader_id,false);
 if p_action is null or p_action not in('preparation','share','meeting','ready','comment','confirm','revise','followup','log_sharing','close','reopen')
 or jsonb_typeof(p_data) is distinct from 'object' or octet_length(p_data::text)>180000 then
  raise exception 'Ugyldig oppfølgingshandling.' using errcode='22023';end if;
 keys:=case p_action when 'preparation' then array['answers'] when 'meeting' then array['answers','actions','next_on']
 when 'comment' then array['text'] when 'followup' then array['on','absence_mode','milestones','correction_reason'] when 'log_sharing' then array['target','on','version','channel','confirmed'] when 'close' then array['on','confirmed'] else '{}'::text[] end;
 if exists(select 1 from jsonb_object_keys(p_data) k where not k=any(keys)) or not p_data ?& keys then
  raise exception 'Ukjente eller manglende samtalefelt.' using errcode='22023';end if;
 if v->>'case_status'='closed' and p_action<>'reopen' then raise exception 'Oppfølgingen er avsluttet. Leder må gjenåpne før redigering.' using errcode='22023';end if;
 if p_action in('followup','log_sharing','close','reopen') then
  if not is_leader then raise exception 'Bare nærmeste leder følger opp saken.' using errcode='42501';end if;
  if p_action='followup' then
   perform hr_private.validate_sick_followup(p_data,v);
   v:=v||jsonb_build_object('on',p_data->>'on','absence_mode',p_data->>'absence_mode','milestones',p_data->'milestones','correction_reason',p_data->>'correction_reason');
   if v->>'stage'='completed' then v:=jsonb_set(v,'{stage}','"awaiting"'::jsonb);end if;
  elsif p_action='log_sharing' then
   if jsonb_typeof(p_data->'target') is distinct from 'string' or jsonb_typeof(p_data->'channel') is distinct from 'string' or jsonb_typeof(p_data->'on') is distinct from 'string' or p_data->>'target' not in('sykmelder','nav') or p_data->>'channel' not in('nav_portal','paper','other') or p_data->'confirmed' is distinct from 'true'::jsonb
    or jsonb_typeof(p_data->'version') is distinct from 'number' or (p_data->>'version')::integer<1 or (p_data->>'version')::integer>t.revision
    or p_data->>'on' !~ '^\d{4}-\d{2}-\d{2}$' or (p_data->>'on')::date>(now() at time zone 'Europe/Oslo')::date or (p_data->>'on')::date<(v->>'on')::date
    or not exists(select 1 from hr_private.artifacts a where a.company_id=p_company_id and a.employee_id=e.id and a.payload->>'type'='sickleave' and a.payload->>'id'=t.id::text and a.payload->>'revision'=p_data->>'version' and (a.payload->>'shared')::boolean)
   then raise exception 'Velg faktisk delt utgave, dato og kanal. Bekreft delingen.' using errcode='22023';end if;
   if jsonb_array_length(v#>array['sharing',p_data->>'target'])>=100 then raise exception 'Kontroller delingshistorikken før flere registreringer.' using errcode='22023';end if;
   v:=jsonb_set(v,array['sharing',p_data->>'target'],(v#>array['sharing',p_data->>'target'])||jsonb_build_array(p_data||jsonb_build_object('recorded_at',now(),'recorded_by',auth.uid())));changed:=false;
  elsif p_action='close' then
   if jsonb_typeof(p_data->'on') is distinct from 'string' or p_data->'confirmed' is distinct from 'true'::jsonb or p_data->>'on' !~ '^\d{4}-\d{2}-\d{2}$'
    or (p_data->>'on')::date<(v->>'on')::date or (p_data->>'on')::date>(now() at time zone 'Europe/Oslo')::date
   then raise exception 'Velg faktisk avslutningsdato og bekreft avslutning.' using errcode='22023';end if;
   v:=v||jsonb_build_object('case_status','closed','returned_on',p_data->>'on');changed:=false;
  else
   if v->>'case_status'<>'closed' then raise exception 'Oppfølgingen er allerede aktiv.' using errcode='22023';end if;
   if exists(select 1 from hr_private.sick_leave_cases other join hr_private.artifacts a on a.id=other.current_artifact_id where other.company_id=p_company_id and other.employee_id=e.id and other.id<>t.id and a.payload->>'case_status'='active') then raise exception 'En annen oppfølging er aktiv. Åpne den først.' using errcode='22023';end if;
   v:=v||jsonb_build_object('case_status','active','returned_on','');changed:=false;
  end if;
 elsif p_action in('preparation','share') then
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
  if v#>>array['confirmations',side,'user_id']=auth.uid()::text then return public.hr_sick_leave_get(p_company_id,e.id,t.id);end if;
  v:=jsonb_set(v,array['confirmations',side],jsonb_build_object('user_id',auth.uid(),'at',now(),'content_version',v->'content_version'));
  if v#>>'{confirmations,employee,user_id}'=e.user_id::text and v#>>'{confirmations,leader,user_id}'=e.leader_id::text then
   v:=jsonb_set(v,'{stage}','"completed"'::jsonb);end if;
 end if;
 if changed then v:=v||jsonb_build_object('content_version',(v->>'content_version')::integer+1,
 'confirmations',jsonb_build_object('employee',null,'leader',null));end if;
 v:=v||jsonb_build_object('revision',t.revision+1,'leader_id',e.leader_id,'saved_at',now(),'saved_by',auth.uid());
 insert into hr_private.artifacts(id,company_id,employee_id,employee_revision,kind,payload,review_on)
 values(aid,p_company_id,e.id,e.revision,'version',v,(select review_on from hr_private.firms where company_id=p_company_id));
 update hr_private.sick_leave_cases set revision=revision+1,current_artifact_id=aid where id=t.id;
 return public.hr_sick_leave_get(p_company_id,e.id,t.id);
end$$;


revoke all on function public.hr_sick_leave_templates(uuid,uuid),public.hr_sick_leave_get(uuid,uuid,uuid,integer),public.hr_sick_leave_list(uuid,uuid,uuid),public.hr_sick_leave_start(uuid,uuid,integer,uuid,uuid,integer,date,text),public.hr_sick_leave_command(uuid,uuid,integer,uuid,integer,text,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.hr_sick_leave_templates(uuid,uuid),public.hr_sick_leave_get(uuid,uuid,uuid,integer),public.hr_sick_leave_list(uuid,uuid,uuid),public.hr_sick_leave_start(uuid,uuid,integer,uuid,uuid,integer,date,text),public.hr_sick_leave_command(uuid,uuid,integer,uuid,integer,text,jsonb) to authenticated;
notify pgrst,'reload schema';
