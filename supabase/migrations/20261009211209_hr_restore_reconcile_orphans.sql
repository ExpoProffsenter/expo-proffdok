-- H4 operator-only replay: orphan file metadata must produce fresh byte deletion jobs.
-- No content gate opening or Storage metadata deletion. Existing ACL is retained.
create or replace function hr_private.restore_reconcile(p_receipts jsonb) returns integer
language plpgsql security definer set search_path='' as $$declare v jsonb;e hr_private.employees%rowtype;old_receipt hr_private.purge_receipts%rowtype;n integer:=0;begin
 perform pg_advisory_xact_lock(hashtextextended('hr-restore-reconcile',0));
 update hr_private.runtime_state set content_enabled=false,restore_quarantined=true where singleton;
 if jsonb_typeof(p_receipts) is distinct from 'array' or jsonb_array_length(p_receipts)>100 then raise exception 'Ugyldig restore-manifest.' using errcode='22023';end if;
 for v in select value from jsonb_array_elements(p_receipts) loop
  if jsonb_typeof(v) is distinct from 'object' or v->>'kind' is null or (v->>'kind') not in ('employment','content') or not (v ?& array['id','company_id','employee_id','user_id','kind','through_revision','requested_at'])
  then raise exception 'Ufullstendig restore-kvittering.' using errcode='22023';end if;
  if v->>'kind'='employment' and v->>'id' is distinct from v->>'employee_id' then raise exception 'Ugyldig avslutningskvittering.' using errcode='22023';end if;
  select * into old_receipt from hr_private.purge_receipts where id=(v->>'id')::uuid;
  if old_receipt.id is not null and (old_receipt.company_id,old_receipt.employee_id,old_receipt.user_id,old_receipt.kind,old_receipt.through_revision)
   is distinct from ((v->>'company_id')::uuid,(v->>'employee_id')::uuid,(v->>'user_id')::uuid,v->>'kind',(v->>'through_revision')::integer)
  then raise exception 'Restore-kvitteringen er endret.' using errcode='22023';end if;
  insert into hr_private.purge_receipts(id,company_id,employee_id,user_id,kind,through_revision,requested_at,state)
  values((v->>'id')::uuid,(v->>'company_id')::uuid,(v->>'employee_id')::uuid,(v->>'user_id')::uuid,v->>'kind',(v->>'through_revision')::integer,(v->>'requested_at')::timestamptz,'pending')
  on conflict(id) do update set state='pending',completed_at=null;
  select * into e from hr_private.employees where company_id=(v->>'company_id')::uuid and id=(v->>'employee_id')::uuid for update;
  if e.id is not null then
   if e.user_id is distinct from (v->>'user_id')::uuid then raise exception 'Restore-identitet stemmer ikke.' using errcode='22023';end if;
   perform hr_private.purge_resources(e,(v->>'id')::uuid,v->>'kind',(v->>'through_revision')::integer);
   if v->>'kind'='employment' then delete from hr_private.employees where id=e.id;
   else update hr_private.employees set revision=greatest(revision,(v->>'through_revision')::integer+1) where id=e.id;end if;
  end if;
  if v->>'kind'='employment' then
   insert into hr_private.closed_employments(employee_id,company_id,user_id,previous_revision,deleted_at)
   values((v->>'employee_id')::uuid,(v->>'company_id')::uuid,(v->>'user_id')::uuid,(v->>'through_revision')::integer,(v->>'requested_at')::timestamptz)
   on conflict(employee_id) do nothing;
   -- Capture restored bytes even when the employee/registry was already deleted.
   insert into hr_private.purge_objects(receipt_id,object_path)
   select (v->>'id')::uuid,o.name from storage.objects o where o.bucket_id='hr-private'
    and o.name like (v->>'company_id')||'/'||(v->>'employee_id')||'/%'
    and o.name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9a-f-]{36}$'
   on conflict(object_path) do update set receipt_id=excluded.receipt_id,removed=false,attempt=null,lease_until=null,available_at=now();
  end if;
  if not exists(select 1 from hr_private.purge_objects where receipt_id=(v->>'id')::uuid and not removed) then
   update hr_private.purge_receipts set state='complete',completed_at=now() where id=(v->>'id')::uuid;
  end if;
  n:=n+1;
 end loop;
 return n;
end$$;

revoke all on function hr_private.restore_reconcile(jsonb) from public,anon,authenticated,service_role;
