-- Transport availability and project opt-in are separate. No project is opted in here.
create table bolig_private.progress_reminder_settings (
 root_id uuid primary key references bolig_private.roots(id),
 enabled boolean not null default false,
 changed_by uuid not null references auth.users(id),
 changed_at timestamptz not null default now()
);
alter table bolig_private.progress_reminder_settings enable row level security;
revoke all on bolig_private.progress_reminder_settings from public,anon,authenticated,service_role;
create index bolig_progress_reminders_actor on bolig_private.progress_reminder_settings(changed_by);

alter function bolig_private.progress_workspace(uuid,uuid,uuid,text,jsonb) rename to progress_workspace_before_reminders;
create function bolig_private.progress_workspace(c uuid,root uuid,unit uuid,action text,payload jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare result jsonb;ctx jsonb;rev bigint;rid uuid;fp text;receipt bolig_private.progress_receipts%rowtype;
begin
 -- Existing get performs live firm/role authorization and locks the root.
 result:=bolig_private.progress_workspace_before_reminders(c,root,unit,'get','{}');
 if action='reminders' then
  ctx:=result->'context';rev:=(result->>'revision')::bigint;
  if ctx->>'role' is distinct from 'manager' or unit is not null or exists(select 1 from bolig_private.roots where id=root and archived) then
   raise exception 'Prosjektleder og aktivt prosjekt kreves.' using errcode='42501';end if;
  if jsonb_typeof(payload) is distinct from 'object' or jsonb_typeof(payload->'enabled') is distinct from 'boolean' then
   raise exception 'Velg på eller av for automatiske påminnelser.' using errcode='22023';end if;
  rid:=(payload->>'request_id')::uuid;fp:=md5(jsonb_build_array(action,payload)::text);
  if rid is null then raise exception 'Forsøksreferanse mangler.' using errcode='22023';end if;
  select * into receipt from bolig_private.progress_receipts where root_id=root and actor_id=auth.uid() and request_id=rid;
  if found then
   if receipt.fingerprint<>fp then raise exception 'Forsøket har annet innhold.' using errcode='PT409';end if;
   return receipt.result;
  end if;
  if (payload->>'revision')::bigint is distinct from rev then
   raise exception 'Prosjektet er endret. Hent siste status før du endrer påminnelsene.' using errcode='PT409';end if;
  insert into bolig_private.progress_reminder_settings values(root,(payload->>'enabled')::boolean,auth.uid(),now())
   on conflict(root_id) do update set enabled=excluded.enabled,changed_by=excluded.changed_by,changed_at=excluded.changed_at;
  if not (payload->>'enabled')::boolean then
   update bolig_private.progress_deliveries set status='suppressed' where root_id=root and kind='owner' and status in('pending','sending');
  end if;
  insert into bolig_private.progress_states values(root,rev+1) on conflict(root_id) do update set revision=excluded.revision;
  insert into bolig_private.progress_history(root_id,revision,actor_id,action,snapshot)
   values(root,rev+1,auth.uid(),action,jsonb_build_object('enabled',payload->'enabled'));
  result:=bolig_private.progress_workspace_before_reminders(c,root,unit,'get','{}');
 elsif action<>'get' then
  result:=bolig_private.progress_workspace_before_reminders(c,root,unit,action,payload);
 end if;
 result:=result||jsonb_build_object('reminders_enabled',coalesce((select enabled from bolig_private.progress_reminder_settings where root_id=root),false));
 if action='reminders' then insert into bolig_private.progress_receipts values(root,auth.uid(),rid,fp,result);end if;
 return result;
end$$;
revoke all on function bolig_private.progress_workspace_before_reminders(uuid,uuid,uuid,text,jsonb) from public,anon,authenticated,service_role;
revoke all on function bolig_private.progress_workspace(uuid,uuid,uuid,text,jsonb) from public,anon,service_role;
grant execute on function bolig_private.progress_workspace(uuid,uuid,uuid,text,jsonb) to authenticated;

-- Preserve the current resident-notice implementation. Gate only owner reminders.
do $$declare definition text;needle text:='t.changed_at>=since';begin
 definition:=pg_get_functiondef('bolig_private.progress_tick()'::regprocedure);
 if strpos(definition,needle)=0 then raise exception 'Unexpected progress_tick definition';end if;
 definition:=replace(definition,needle,'exists(select 1 from bolig_private.progress_reminder_settings rs where rs.root_id=t.root_id and rs.enabled)');
 execute definition;
end$$;
alter function bolig_private.progress_delivery_valid(bolig_private.progress_deliveries) rename to progress_delivery_valid_before_reminders;
create function bolig_private.progress_delivery_valid(d bolig_private.progress_deliveries) returns boolean language sql stable set search_path='' as $$
 select (d.kind<>'owner' or exists(select 1 from bolig_private.progress_reminder_settings rs where rs.root_id=d.root_id and rs.enabled))
 and bolig_private.progress_delivery_valid_before_reminders(d)
$$;
revoke all on function bolig_private.progress_delivery_valid_before_reminders(bolig_private.progress_deliveries),bolig_private.progress_delivery_valid(bolig_private.progress_deliveries) from public,anon,authenticated,service_role;
notify pgrst,'reload schema';
