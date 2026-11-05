-- Personal conversation text only. No table/RLS/role/queue change.
-- The separate old validator remains unchanged for sick-leave flows.
-- 24 questions at 10,000 four-byte code points fit below 1.1 MB.
-- Refuse to overwrite a newer command implementation (normalize legacy SQLSTATE only).
do $guard$
begin
 if not exists(select 1 from pg_catalog.pg_proc p join pg_catalog.pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname='hr_conversation_command'
  and pg_catalog.md5(replace(p.prosrc,'''40001''','''PT409'''))='c3437b63da704b68c12dbff7cd5a42a2') then
  raise exception 'Samtalefunksjonen har et annet grunnlag. Kontroller nyeste migrasjon før installasjon.';
 end if;
end $guard$;

create function hr_private.validate_extended_conversation_answers(answers jsonb,tpl jsonb,phase text,complete boolean) returns void
language plpgsql security invoker set search_path='' as $$declare k text;q jsonb;begin
 if jsonb_typeof(answers) is distinct from 'object' or octet_length(answers::text)>1100000 then
  raise exception 'Ugyldige samtalesvar.' using errcode='22023';end if;
 for k in select jsonb_object_keys(answers) loop
  if not exists(select 1 from jsonb_array_elements(tpl->'questions') as items(value) where items.value->>'id'=k and items.value->>'phase'=phase)
   or jsonb_typeof(answers->k) is distinct from 'string' or length(answers->>k)>10000 then
   raise exception 'Et svar har feil spørsmål eller er for langt.' using errcode='22023';end if;
 end loop;
 if complete then
  for q in select value from jsonb_array_elements(tpl->'questions') where value->>'phase'=phase and(value->>'required')::boolean loop
   if length(trim(coalesce(answers->>(q->>'id'),'')))=0 then raise exception 'Svar på de obligatoriske spørsmålene først.' using errcode='22023';end if;
  end loop;
 end if;
end$$;

revoke all on function hr_private.validate_extended_conversation_answers(jsonb,jsonb,text,boolean) from public,anon,authenticated,service_role;

create or replace function public.hr_conversation_command(p_company_id uuid,p_employee_id uuid,p_employee_revision integer,
 p_conversation_id uuid,p_revision integer,p_action text,p_data jsonb default '{}'::jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare e hr_private.employees%rowtype;t hr_private.conversations%rowtype;v jsonb;a jsonb;q jsonb;keys text[];
 aid uuid:=gen_random_uuid();is_employee boolean;is_leader boolean;side text;changed boolean:=true;notify_feedback boolean:=false;owner uuid;ids uuid[]:='{}';qid uuid;
begin
 perform 1 from hr_private.firms where company_id=p_company_id for update;
 e:=hr_private.conversation_employee(p_company_id,p_employee_id);
 if p_employee_revision is distinct from e.revision then raise exception 'Medarbeiderens tilgang er endret.' using errcode='PT409';end if;
 select * into t from hr_private.conversations where company_id=p_company_id and employee_id=e.id and id=p_conversation_id for update;
 if t.id is null then raise exception 'Samtalen er ikke tilgjengelig.' using errcode='42501';end if;
 if p_revision is distinct from t.revision then raise exception 'Samtalen er endret. Arbeidet ditt er beholdt; hent ny utgave.' using errcode='PT409';end if;
 select payload into v from hr_private.artifacts where id=t.current_artifact_id;
 -- Mutations retain the private preparation; redaction is only for responses.
 if v#>>'{confirmations,leader,user_id}' is distinct from e.leader_id::text then
  v:=jsonb_set(v,'{confirmations,leader}','null'::jsonb);
  if v->>'stage'='completed' then v:=jsonb_set(v,'{stage}','"awaiting"'::jsonb);end if;
 end if;
 is_employee:=coalesce(auth.uid()=e.user_id,false);is_leader:=coalesce(auth.uid()=e.leader_id,false);
 if p_action is null or p_action not in('preparation','share','meeting','ready','comment','confirm','revise')
 or jsonb_typeof(p_data) is distinct from 'object' or octet_length(p_data::text)>1800000 then
  raise exception 'Ugyldig samtalehandling.' using errcode='22023';end if;
 keys:=case p_action when 'preparation' then array['answers'] when 'meeting' then array['answers','actions','next_on']
 when 'comment' then array['text'] else '{}'::text[] end;
 if exists(select 1 from jsonb_object_keys(p_data) k where not k=any(keys)) or not p_data ?& keys then
  raise exception 'Ukjente eller manglende samtalefelt.' using errcode='22023';end if;
 notify_feedback:=is_employee and(p_action='share' or(p_action='comment' and v#>'{comments,employee}' is distinct from p_data->'text'));
 if p_action in('preparation','share') then
  if not is_employee or v->>'stage'<>'preparation' then raise exception 'Bare medarbeideren kan forberede sin åpne kladd.' using errcode='42501';end if;
  a:=case when p_action='preparation' then p_data->'answers' else v->'preparation' end;
  perform hr_private.validate_extended_conversation_answers(a,v->'template','preparation',p_action='share');
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
    perform hr_private.validate_extended_conversation_answers(p_data->'answers',v->'template','meeting',false);
    if jsonb_typeof(p_data->'actions') is distinct from 'array' or jsonb_array_length(p_data->'actions')>12
    or jsonb_typeof(p_data->'next_on') is distinct from 'string' then raise exception 'Ugyldige tiltak eller oppfølgingsdato.' using errcode='22023';end if;
    if p_data->>'next_on'<>'' then
     if p_data->>'next_on' !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'Ugyldig oppfølgingsdato.' using errcode='22023';end if;
     perform(p_data->>'next_on')::date;
    end if;
    for q in select value from jsonb_array_elements(p_data->'actions') loop
     if jsonb_typeof(q) is distinct from 'object' or not q ?& array['id','task','owner_id','due_on','done']
     or exists(select 1 from jsonb_object_keys(q) k where not k=any(array['id','task','owner_id','due_on','done']))
     or jsonb_typeof(q->'task') is distinct from 'string' or length(trim(q->>'task')) not between 1 and 2000
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
    perform hr_private.validate_extended_conversation_answers(v->'meeting',v->'template','meeting',true);
    -- Retrying an already submitted review must preserve its confirmations/history.
    if v->>'stage'='awaiting' then return public.hr_conversation_get(p_company_id,e.id,t.id);end if;
    v:=jsonb_set(v,'{stage}','"awaiting"'::jsonb);
   end if;
  end if;
 elsif p_action='comment' then
  if not(is_employee or is_leader) or not(v->>'shared')::boolean then raise exception 'Bare partene kan legge til egne kommentarer.' using errcode='42501';end if;
  if jsonb_typeof(p_data->'text') is distinct from 'string' or length(p_data->>'text')>10000 then raise exception 'Kommentaren er for lang.' using errcode='22023';end if;
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
 if notify_feedback then v:=v||jsonb_build_object('employee_feedback_revision',t.revision+1);end if;
 insert into hr_private.artifacts(id,company_id,employee_id,employee_revision,kind,payload,review_on)
 values(aid,p_company_id,e.id,e.revision,'version',v,(select review_on from hr_private.firms where company_id=p_company_id));
 update hr_private.conversations set revision=revision+1,current_artifact_id=aid where id=t.id;
 if notify_feedback then perform hr_private.queue_conversation_feedback(p_company_id,e.id,t.id);end if;
 return public.hr_conversation_get(p_company_id,e.id,t.id);
end$$;
