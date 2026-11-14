-- Existing dated projects retain end-of-day until a manager explicitly changes it.
alter table bolig_private.roots add column choice_deadline_time time;
update bolig_private.roots r set choice_deadline_time='12:00'
where not exists(select 1 from bolig_private.units u where u.root_id=r.id and u.choice_deadline is not null);
alter table bolig_private.roots alter column choice_deadline_time set default '12:00';
alter table bolig_private.roots add constraint bolig_deadline_minute check
(choice_deadline_time is null or (choice_deadline_time < time '24:00' and extract(second from choice_deadline_time)=0));

create function bolig_private.choice_deadline_at(root uuid,deadline date) returns timestamptz
language sql stable set search_path='' as $$
 select case when r.choice_deadline_time is null then (deadline+1)::timestamp at time zone 'Europe/Oslo'
 else (deadline+r.choice_deadline_time) at time zone 'Europe/Oslo' end from bolig_private.roots r where r.id=root
$$;
revoke all on function bolig_private.choice_deadline_at(uuid,date) from public,anon,authenticated,service_role;

-- Preserve portal authorization, brand, acceptance and retry behavior.
alter function bolig_private.portal_state(bolig_private.resident_portals) rename to portal_state_before_project_clock;
create function bolig_private.portal_state(p bolig_private.resident_portals) returns jsonb
language sql stable set search_path='' as $$
 select bolig_private.portal_state_before_project_clock(p)||jsonb_build_object(
 'choice_deadline_time',to_char(r.choice_deadline_time,'HH24:MI'),
 'choice_deadline_at',bolig_private.choice_deadline_at(r.id,u.choice_deadline),
 'choices_closed',coalesce(clock_timestamp()>=bolig_private.choice_deadline_at(r.id,u.choice_deadline),false))
 from bolig_private.units u join bolig_private.roots r on r.id=u.root_id where u.id=p.unit_id
$$;
revoke all on function bolig_private.portal_state(bolig_private.resident_portals) from public,anon,authenticated,service_role;
do $$declare body text;anchor text:='(u.choice_deadline+1)::timestamp at time zone ''Europe/Oslo''';begin
 body:=pg_get_functiondef('bolig_resident_private.portal(text,text,jsonb)'::regprocedure);
 if position(anchor in body)=0 then raise exception 'Missing portal deadline anchor';end if;
 execute replace(body,anchor,'bolig_private.choice_deadline_at(u.root_id,u.choice_deadline)');
end$$;

alter function bolig_private.resident_batch(uuid,uuid,text,jsonb) rename to resident_batch_before_project_clock;
revoke all on function bolig_private.resident_batch_before_project_clock(uuid,uuid,text,jsonb) from public,anon,authenticated,service_role;
create function bolig_private.resident_batch(c uuid,root uuid,action text,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare result jsonb; r bolig_private.roots%rowtype; rid uuid; fp bytea;
 prior bolig_private.resident_batch_receipts%rowtype; selected_time time;
begin
 -- Existing entry point authorizes and locks the root before any read/replay/write.
 result:=bolig_private.resident_batch_before_project_clock(c,root,'get','{}');
 select * into r from bolig_private.roots where id=root and company_id=c;
 if action='deadline_time' then
  if jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>300000
   or payload->'reviewed' is distinct from 'true'::jsonb
   or coalesce(payload->>'deadline_time','') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
   then raise exception 'Bekreft felles klokkeslett for hele prosjektet.' using errcode='22023';end if;
  rid:=(payload->>'request_id')::uuid;
  if rid is null then raise exception 'Forsøksreferanse mangler.' using errcode='22023';end if;
  fp:=sha256(convert_to(jsonb_build_object('action',action,'payload',payload)::text,'UTF8'));
  select * into prior from bolig_private.resident_batch_receipts where root_id=root and actor_id=auth.uid() and request_id=rid;
  if found then
   if prior.payload_hash<>fp then raise exception 'Referansen tilhører en annen handling.' using errcode='PT409';end if;
   return prior.result||jsonb_build_object('context',result->'context','replayed',true);
  end if;
  if (payload->>'revision')::bigint is distinct from r.revision then
   raise exception 'Prosjektet er endret. Hent siste oversikt og bekreft på nytt.' using errcode='PT409';end if;
  selected_time:=(payload->>'deadline_time')::time;
  update bolig_private.roots set choice_deadline_time=selected_time,revision=revision+1,updated_at=now() where id=root returning * into r;
  insert into bolig_private.audit(company_id,root_id,actor_id,action,entity_id,revision)
   values(c,root,auth.uid(),'resident_project_deadline_time',root,r.revision);
  result:=bolig_private.resident_batch_before_project_clock(c,root,'get','{}');
 else
  result:=bolig_private.resident_batch_before_project_clock(c,root,action,payload);
 end if;
 result:=result||jsonb_build_object('deadline_time',to_char(r.choice_deadline_time,'HH24:MI'),'project_revision',r.revision);
 if action='deadline_time' then insert into bolig_private.resident_batch_receipts values(root,auth.uid(),rid,fp,result,clock_timestamp());end if;
 return result;
end$$;
revoke all on function bolig_private.resident_batch(uuid,uuid,text,jsonb) from public,anon,service_role;
grant execute on function bolig_private.resident_batch(uuid,uuid,text,jsonb) to authenticated;
-- SQL wrappers may bind their callee OID; explicitly bind the new entry point.
create or replace function public.bolig_resident_batch(p_company_id uuid,p_root_id uuid,p_action text default 'get',p_payload jsonb default '{}') returns jsonb
language sql security invoker set search_path='' as $$select bolig_private.resident_batch(p_company_id,p_root_id,p_action,p_payload)$$;
notify pgrst,'reload schema';
