-- A source-to-activity link only. Scheduling, execution and notifications stay
-- in the existing progress engine. Linking never closes or approves a source.
create table bolig_private.handover_followups (
 root_id uuid not null references bolig_private.roots(id), case_id text not null,
 case_scope_id uuid not null, source jsonb not null,
 task_id uuid not null references bolig_private.progress_tasks(id),
 linked_by uuid not null references auth.users(id), linked_at timestamptz not null default now(),
 primary key(root_id,case_id)
);
create index bolig_handover_followup_task on bolig_private.handover_followups(task_id);
create index bolig_handover_followup_actor on bolig_private.handover_followups(linked_by);
alter table bolig_private.handover_followups enable row level security;
revoke all on bolig_private.handover_followups from public,anon,authenticated,service_role;

create function bolig_private.handover_followup(c uuid,root uuid,scope uuid,action text,payload jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare review jsonb;plan jsonb;result jsonb;source jsonb;target jsonb;allowed jsonb;
 rid uuid;fp text;receipt bolig_private.progress_receipts%rowtype;task uuid;unit uuid;
begin
 -- Fresh license, firm, linked-project scope and root/catalog locks, including retry.
 review:=bolig_private.handover_review(c,root,scope,'get',null,'{}');
 if (review->>'restricted')::boolean then raise exception 'Tilgang til hele området kreves.' using errcode='42501';end if;
 if action is null or action not in('get','link','create') or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>12000 then raise exception 'Ugyldig oppfølging.' using errcode='22023';end if;
 plan:=bolig_private.progress_workspace(c,root,null,'get','{}');
 select coalesce(jsonb_agg(u),'[]') into allowed from jsonb_array_elements(plan->'units') u
 where scope=root or u->>'id'=scope::text or u->>'block_id'=scope::text;
 if action<>'get' then
  if review#>>'{context,role}' is distinct from 'manager' or (review->>'root_archived')::boolean then raise exception 'Prosjektleder og aktivt prosjekt kreves.' using errcode='42501';end if;
  rid:=(payload->>'request_id')::uuid;fp:=md5(jsonb_build_array('handover_followup',scope,action,payload)::text);
  if rid is null then raise exception 'Forsøksreferanse mangler.' using errcode='22023';end if;
  select * into receipt from bolig_private.progress_receipts where root_id=root and actor_id=auth.uid() and request_id=rid;
  if found then if receipt.fingerprint<>fp then raise exception 'Forsøket har annet innhold.' using errcode='PT409';end if;return receipt.result;end if;
  if payload->>'basis' is distinct from review->>'basis' then raise exception 'Åpne forhold er endret. Hent siste oversikt. Kladden beholdes.' using errcode='PT409';end if;
  select x into source from jsonb_array_elements(review->'cases') x where x->>'id'=payload->>'case_id';
  if source is null then raise exception 'Forholdet finnes ikke i dette området.' using errcode='42501';end if;
  if exists(select 1 from bolig_private.handover_followups where root_id=root and case_id=source->>'id') then raise exception 'Forholdet har allerede en aktivitet. Oppdater oversikten.' using errcode='PT409';end if;
  if action='create' then
   -- An unfinished activity already is its own follow-up; do not duplicate it.
   if source->>'category'='Aktivitet' then raise exception 'Bruk den eksisterende aktiviteten.' using errcode='22023';end if;
   unit:=(payload->>'unit_id')::uuid;task:=(payload->>'task_id')::uuid;
   if task is null or exists(select 1 from bolig_private.progress_tasks where id=task) then raise exception 'Velg en ny aktivitetsreferanse.' using errcode='PT409';end if;
   if not exists(select 1 from jsonb_array_elements(allowed) u where u->>'id'=unit::text and (source->>'scope_id'=root::text or source->>'scope_id'=u->>'id' or source->>'scope_id'=u->>'block_id')) then raise exception 'Velg en bolig i forholdets område.' using errcode='42501';end if;
   perform bolig_private.progress_workspace(c,root,unit,'save',jsonb_build_object(
    'request_id',gen_random_uuid(),'revision',plan->'revision','id',task,'unit_id',unit,
    'title',payload->>'title','owner_id',payload->>'owner_id','planned_start',payload->>'planned_start','planned_end',payload->>'planned_end',
    'status','planned','required',false,'note','Oppfølging fra åpne forhold: '||left(source->>'title',1500)));
   plan:=bolig_private.progress_workspace(c,root,null,'get','{}');
  else task:=(payload->>'task_id')::uuid;
  end if;
  select t into target from jsonb_array_elements(plan->'tasks') t join jsonb_array_elements(allowed) u on u->>'id'=t->>'unit_id'
   where t->>'id'=task::text and t->'active'='true'::jsonb and t->'archived'='false'::jsonb
   and (source->>'scope_id'=root::text or source->>'scope_id'=u->>'id' or source->>'scope_id'=u->>'block_id');
  if target is null or (source->>'category'='Aktivitet' and source->>'id'<>'task:'||task::text) then raise exception 'Velg en aktiv aktivitet i samme område.' using errcode='42501';end if;
  insert into bolig_private.handover_followups(root_id,case_id,case_scope_id,source,task_id,linked_by)
   values(root,source->>'id',(source->>'scope_id')::uuid,source,task,auth.uid());
 end if;
 result:=jsonb_build_object('context',review->'context','root_id',root,'scope_id',scope,'basis',review->'basis',
  'units',allowed,'members',plan->'members','mail_enabled',plan->'mail_enabled',
  'tasks',coalesce((select jsonb_agg(t) from jsonb_array_elements(plan->'tasks') t where exists(select 1 from jsonb_array_elements(allowed) u where u->>'id'=t->>'unit_id')),'[]'),
  'links',coalesce((select jsonb_agg(to_jsonb(f) order by linked_at) from bolig_private.handover_followups f where f.root_id=root and (scope=root or f.case_scope_id=scope or exists(select 1 from jsonb_array_elements(allowed) u where u->>'id'=f.case_scope_id::text))),'[]'));
 if action<>'get' then insert into bolig_private.progress_receipts values(root,auth.uid(),rid,fp,result);end if;
 return result;
end$$;
revoke all on function bolig_private.handover_followup(uuid,uuid,uuid,text,jsonb) from public,anon,service_role;
grant execute on function bolig_private.handover_followup(uuid,uuid,uuid,text,jsonb) to authenticated;
create function public.bolig_handover_followup(p_company_id uuid,p_root_id uuid,p_scope_id uuid,p_action text default 'get',p_payload jsonb default '{}')
returns jsonb language sql security invoker set search_path='' as $$select bolig_private.handover_followup(p_company_id,p_root_id,p_scope_id,p_action,p_payload)$$;
revoke all on function public.bolig_handover_followup(uuid,uuid,uuid,text,jsonb) from public,anon,service_role;
grant execute on function public.bolig_handover_followup(uuid,uuid,uuid,text,jsonb) to authenticated;
notify pgrst,'reload schema';
