-- Scheduled conversation time is a local HH:MM in Europe/Oslo, never browser-timezone converted.
-- Existing start RPC and historical artifacts remain compatible. No table/grant/purge changes.
create function public.hr_conversation_start_at(p_company_id uuid,p_employee_id uuid,p_employee_revision integer,
 p_conversation_id uuid,p_template_id uuid,p_template_revision integer,p_on date,p_time text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare e hr_private.employees%rowtype;t hr_private.conversation_templates%rowtype;tpl jsonb;v jsonb;aid uuid:=gen_random_uuid();old hr_private.conversations%rowtype;
begin
 perform 1 from hr_private.firms where company_id=p_company_id for update;
 e:=hr_private.conversation_employee(p_company_id,p_employee_id);
 if auth.uid() is distinct from e.leader_id then raise exception 'Nærmeste leder starter samtalen.' using errcode='42501';end if;
 if p_employee_revision is distinct from e.revision then raise exception 'Medarbeiderens tilgang er endret.' using errcode='40001';end if;
 if p_time is null or p_time !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then raise exception 'Velg klokkeslett med timer og minutter.' using errcode='22023';end if;
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
 'template_id',t.id,'template_revision',t.revision,'template',tpl,'leader_id',e.leader_id,'on',p_on,'meeting_time',p_time,'meeting_timezone','Europe/Oslo','stage','preparation','shared',false,
 'preparation','{}'::jsonb,'meeting','{}'::jsonb,'actions','[]'::jsonb,'next_on','',
 'comments',jsonb_build_object('employee','','leader',''),'confirmations',jsonb_build_object('employee',null,'leader',null),
 'saved_at',now(),'saved_by',auth.uid());
 insert into hr_private.artifacts(id,company_id,employee_id,employee_revision,kind,payload,review_on)
 values(aid,p_company_id,e.id,e.revision,'version',v,(select review_on from hr_private.firms where company_id=p_company_id));
 insert into hr_private.conversations values(p_conversation_id,p_company_id,e.id,1,aid);
 return public.hr_conversation_get(p_company_id,e.id,p_conversation_id);
end$$;

create or replace function public.hr_conversation_list(p_company_id uuid,p_employee_id uuid,p_after uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$declare x jsonb;e hr_private.employees%rowtype;rows jsonb;begin
 e:=hr_private.conversation_employee(p_company_id,p_employee_id);
 select coalesce(jsonb_agg(to_jsonb(q) order by q.id),'[]'::jsonb) into rows from(
  select t.id,t.revision,a.payload#>>'{template,title}' as title,a.payload->>'on' as on,a.payload->>'meeting_time' as meeting_time,
   hr_private.conversation_visible(a.payload,e)->>'stage' as stage,a.payload->>'saved_at' as saved_at
  from hr_private.conversations t join hr_private.artifacts a on a.id=t.current_artifact_id
  where t.company_id=p_company_id and t.employee_id=e.id and(p_after is null or t.id>p_after) order by t.id limit 30
 )q;
 x:=hr_private.require_context(p_company_id);
 return jsonb_build_object('context',x,'employee',hr_private.employee_json(e),'conversations',rows,
 'next',case when jsonb_array_length(rows)=30 then rows->29->>'id' else null end,'can_start',auth.uid()=e.leader_id);
end$$;

create function public.hr_conversation_schedule(p_company_id uuid,p_employee_id uuid,p_employee_revision integer,
 p_conversation_id uuid,p_revision integer,p_on date,p_time text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare e hr_private.employees%rowtype;t hr_private.conversations%rowtype;v jsonb;aid uuid:=gen_random_uuid();begin
 perform 1 from hr_private.firms where company_id=p_company_id for update;
 e:=hr_private.conversation_employee(p_company_id,p_employee_id);
 if auth.uid() is distinct from e.leader_id then raise exception 'Bare nærmeste leder endrer tidspunktet.' using errcode='42501';end if;
 if p_employee_revision is distinct from e.revision then raise exception 'Medarbeiderens tilgang er endret.' using errcode='40001';end if;
 select * into t from hr_private.conversations where company_id=p_company_id and employee_id=e.id and id=p_conversation_id for update;
 if t.id is null then raise exception 'Samtalen er ikke tilgjengelig.' using errcode='42501';end if;
 if p_revision is distinct from t.revision then raise exception 'Samtalen er endret. Hent lagret utgave før du endrer tidspunkt.' using errcode='40001';end if;
 select payload into v from hr_private.artifacts where id=t.current_artifact_id;
 if v->>'stage' not in('preparation','meeting') then raise exception 'Åpne en ny referatutgave før du endrer tidspunktet.' using errcode='22023';end if;
 if p_on is null or p_time is null or p_time !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then raise exception 'Velg dato og klokkeslett med timer og minutter.' using errcode='22023';end if;
 if v->>'on'=p_on::text and v->>'meeting_time'=p_time then return public.hr_conversation_get(p_company_id,e.id,t.id);end if;
 v:=v||jsonb_build_object('on',p_on,'meeting_time',p_time,'meeting_timezone','Europe/Oslo',
 'revision',t.revision+1,'content_version',(v->>'content_version')::integer+1,'leader_id',e.leader_id,
 'confirmations',jsonb_build_object('employee',null,'leader',null),'saved_at',now(),'saved_by',auth.uid());
 insert into hr_private.artifacts(id,company_id,employee_id,employee_revision,kind,payload,review_on)
 values(aid,p_company_id,e.id,e.revision,'version',v,(select review_on from hr_private.firms where company_id=p_company_id));
 update hr_private.conversations set revision=revision+1,current_artifact_id=aid where id=t.id;
 return public.hr_conversation_get(p_company_id,e.id,t.id);
end$$;

revoke all on function public.hr_conversation_start_at(uuid,uuid,integer,uuid,uuid,integer,date,text),public.hr_conversation_schedule(uuid,uuid,integer,uuid,integer,date,text) from public,anon,authenticated,service_role;
grant execute on function public.hr_conversation_start_at(uuid,uuid,integer,uuid,uuid,integer,date,text),public.hr_conversation_schedule(uuid,uuid,integer,uuid,integer,date,text) to authenticated;
notify pgrst,'reload schema';
