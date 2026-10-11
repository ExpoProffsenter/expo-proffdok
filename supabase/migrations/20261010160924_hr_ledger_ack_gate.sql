-- H5b: fail closed until an independent, fresh ledger read has been acknowledged.
-- No configuration, activation, credentials, content release or worker deployment.
create table hr_private.ledger_settings (
 singleton boolean primary key default true check(singleton),
 enabled boolean not null default false,
 project_ref text check(project_ref ~ '^[a-z]{20}$'),
 store_id text check(store_id ~ '^store_[a-z0-9]+$'),
 check(not enabled or (project_ref is not null and store_id is not null))
);
insert into hr_private.ledger_settings(singleton) values(true);
create table hr_private.ledger_acknowledgments (
 receipt_id uuid primary key references hr_private.purge_receipts(id) on delete restrict,
 store_id text not null check(store_id ~ '^store_[a-z0-9]+$'),
 generation bigint not null check(generation between 0 and 9007199254740991),
 hmac text not null check(hmac ~ '^[a-f0-9]{64}$'),
 acknowledged_at timestamptz not null default now()
);
alter table hr_private.ledger_settings enable row level security;
alter table hr_private.ledger_acknowledgments enable row level security;
revoke all on hr_private.ledger_settings,hr_private.ledger_acknowledgments from public,anon,authenticated,service_role;

create function hr_private.guard_purge_completion() returns trigger
language plpgsql security definer set search_path='' as $$begin
 if tg_op='UPDATE' and (new.id,new.company_id,new.employee_id,new.user_id,new.kind,new.through_revision,new.requested_at)
  is distinct from (old.id,old.company_id,old.employee_id,old.user_id,old.kind,old.through_revision,old.requested_at)
 then raise exception 'Slettekvitteringens identitet er uforanderlig.' using errcode='22023';end if;
 -- Any replay/re-purge explicitly requests pending again, invalidating the old ack.
 if tg_op='INSERT' or new.state='pending' then
  delete from hr_private.ledger_acknowledgments where receipt_id=new.id;
 end if;
 if new.state='complete' and (
  not exists(select 1 from hr_private.ledger_acknowledgments a
    join hr_private.ledger_settings s on s.singleton and s.enabled and s.store_id=a.store_id
    where a.receipt_id=new.id)
  or exists(select 1 from hr_private.purge_objects where receipt_id=new.id and not removed))
 then new.state:='pending';end if;
 if new.state='pending' then new.completed_at:=null;end if;
 return new;
end$$;
create trigger hr_purge_completion_guard before insert or update on hr_private.purge_receipts
 for each row execute function hr_private.guard_purge_completion();
-- Existing DB-only completion is insufficient for the new independent contract.
update hr_private.purge_receipts set state='pending',completed_at=null;

create or replace function hr_private.closure_json(c uuid,employee uuid,ctx jsonb) returns jsonb
language sql security definer set search_path='' as $$
 select jsonb_build_object('context',ctx,'access_blocked',true,'deleted',coalesce(p.state='complete',false),
 'purge_state',coalesce(p.state,'pending'),'receipt_id',d.employee_id,'deleted_at',d.deleted_at,'purge_completed_at',p.completed_at)
 from hr_private.closed_employments d left join hr_private.purge_receipts p on p.id=d.employee_id
 where d.company_id=c and d.employee_id=employee
$$;

create function public.hr_ledger_snapshot(p_project text,p_store text) returns jsonb
language plpgsql security definer set search_path='' as $$declare rows jsonb;begin
 if not exists(select 1 from hr_private.ledger_settings where singleton and enabled and project_ref=p_project and store_id=p_store)
 then raise exception 'HR ledger binding unavailable.' using errcode='42501';end if;
 -- One full MVCC snapshot. UUID ordering is not a durable insertion cursor.
 select coalesce(jsonb_agg(to_jsonb(q) order by q.id),'[]'::jsonb) into rows from
  (select id,company_id,employee_id,user_id,kind,through_revision,requested_at
   from hr_private.purge_receipts order by id limit 100001) q;
 if jsonb_array_length(rows)>100000 then raise exception 'HR ledger capacity exceeded.' using errcode='54000';end if;
 return jsonb_build_object('format',1,'project',p_project,'receipts',rows);
end$$;

-- Only the isolated server operator may attest to verified external storage.
-- The DB does not hold the signing key and cannot itself prove an external write.
create function public.hr_ledger_ack(p_project text,p_store text,p_generation bigint,p_hmac text,p_receipts jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$declare v jsonb;r hr_private.purge_receipts%rowtype;ids jsonb:='[]';begin
 perform 1 from hr_private.ledger_settings where singleton and enabled and project_ref=p_project and store_id=p_store for share;
 if not found then raise exception 'HR ledger binding unavailable.' using errcode='42501';end if;
 if p_generation is null or p_generation<0 or p_generation>9007199254740991 or p_hmac is null or p_hmac !~ '^[a-f0-9]{64}$'
  or jsonb_typeof(p_receipts) is distinct from 'array' or jsonb_array_length(p_receipts)>100
 then raise exception 'Invalid HR ledger acknowledgment.' using errcode='22023';end if;
 for v in select value from jsonb_array_elements(p_receipts) order by value->>'id' loop
  if jsonb_typeof(v) is distinct from 'object' or not (v ?& array['id','company_id','employee_id','user_id','kind','through_revision','requested_at'])
   or (select count(*) from jsonb_object_keys(v))<>7 or v->>'id' is null or ids ? (v->>'id')
  then raise exception 'Invalid HR ledger receipt.' using errcode='22023';end if;
  select * into r from hr_private.purge_receipts where id=(v->>'id')::uuid for update;
  if r.id is null or v->>'company_id' is null or v->>'employee_id' is null or v->>'user_id' is null
   or v->>'kind' is null or v->>'through_revision' is null or v->>'requested_at' is null
   or (r.company_id,r.employee_id,r.user_id,r.kind,r.through_revision,r.requested_at)
    is distinct from ((v->>'company_id')::uuid,(v->>'employee_id')::uuid,(v->>'user_id')::uuid,v->>'kind',(v->>'through_revision')::integer,(v->>'requested_at')::timestamptz)
  then raise exception 'Changed HR ledger receipt.' using errcode='22023';end if;
  if exists(select 1 from hr_private.ledger_acknowledgments where receipt_id=r.id and
   (generation>p_generation or (generation=p_generation and (hmac<>p_hmac or store_id<>p_store))))
  then raise exception 'Stale HR ledger acknowledgment.' using errcode='40001';end if;
  insert into hr_private.ledger_acknowledgments(receipt_id,store_id,generation,hmac)
   values(r.id,p_store,p_generation,p_hmac)
   on conflict(receipt_id) do update set store_id=excluded.store_id,generation=excluded.generation,hmac=excluded.hmac,acknowledged_at=now();
  if not exists(select 1 from hr_private.purge_objects where receipt_id=r.id and not removed) then
   update hr_private.purge_receipts set state='complete',completed_at=coalesce(completed_at,now()) where id=r.id;
  end if;
  ids:=ids||jsonb_build_array(r.id::text);
 end loop;
 return jsonb_build_object('acknowledged',ids);
end$$;
revoke all on function hr_private.guard_purge_completion() from public,anon,authenticated,service_role;
revoke all on function public.hr_ledger_snapshot(text,text),public.hr_ledger_ack(text,text,bigint,text,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.hr_ledger_snapshot(text,text),public.hr_ledger_ack(text,text,bigint,text,jsonb) to service_role;
