-- Sandbox only, disposable minimal receipts. No HR content, Auth or Storage rows.
-- Always rollback; never run on Production or an active restored dataset.
begin;
set local statement_timeout='30s';
set local lock_timeout='3s';
do $$declare a uuid:=gen_random_uuid();b uuid:=gen_random_uuid();c uuid:=gen_random_uuid();u uuid:=gen_random_uuid();
 rows jsonb;v jsonb;unknown_row jsonb;result jsonb;job jsonb;n integer;begin
 if exists(select 1 from hr_private.purge_receipts) or exists(select 1 from hr_private.artifacts) or exists(select 1 from hr_private.files)
 then raise exception 'Requires empty Sandbox HR private fixtures.';end if;
 if exists(select 1 from hr_private.runtime_state where content_enabled or not restore_quarantined)
 then raise exception 'Private HR must remain quarantined.';end if;
 if exists(select 1 from hr_private.ledger_settings where enabled) then raise exception 'Ledger must be unbound for this fixture.';end if;
 update hr_private.ledger_settings set enabled=true,project_ref='ppvircenkjizeiqdxphj',store_id='store_synthetic';
 insert into hr_private.purge_receipts(id,company_id,employee_id,user_id,kind,through_revision,state,completed_at)
 values(a,c,a,u,'employment',1,'complete',now()),(b,c,b,u,'employment',1,'complete',now());
 if exists(select 1 from hr_private.purge_receipts where state<>'pending' or completed_at is not null) then raise exception 'Completion without ack.';end if;
 result:=public.hr_ledger_snapshot('ppvircenkjizeiqdxphj','store_synthetic');rows:=result->'receipts';
 if result->>'project'<>'ppvircenkjizeiqdxphj' or jsonb_array_length(rows)<>2 then raise exception 'Full snapshot missing.';end if;
 select value into v from jsonb_array_elements(rows) where value->>'id'=a::text;
 if (select count(*) from jsonb_object_keys(v))<>7 then raise exception 'Nonminimal export.';end if;
 begin perform public.hr_ledger_snapshot('ppvircenkjizeiqdxphj','store_wrong');raise exception 'Wrong binding accepted';
 exception when insufficient_privilege then null;end;
 begin perform public.hr_ledger_ack('ppvircenkjizeiqdxphj','store_synthetic',1,repeat('a',64),jsonb_build_array(v||jsonb_build_object('payload','synthetic forbidden extra')));raise exception 'Extra field accepted';
 exception when invalid_parameter_value then null;end;
 begin perform public.hr_ledger_ack('ppvircenkjizeiqdxphj','store_synthetic',1,repeat('a',64),jsonb_build_array(v||jsonb_build_object('user_id',gen_random_uuid())));raise exception 'Changed identity accepted';
 exception when invalid_parameter_value then null;end;
 begin perform public.hr_ledger_ack('ppvircenkjizeiqdxphj','store_synthetic',1,repeat('a',64),jsonb_build_array(v||jsonb_build_object('requested_at','2000-01-01T00:00:00Z')));raise exception 'Changed time accepted';
 exception when invalid_parameter_value then null;end;
 begin perform public.hr_ledger_ack('ppvircenkjizeiqdxphj','store_synthetic',1,repeat('a',64),jsonb_build_array(v,v));raise exception 'Duplicate accepted';
 exception when invalid_parameter_value then null;end;
 if exists(select 1 from hr_private.ledger_acknowledgments) then raise exception 'Partial ack survived failure.';end if;
 unknown_row:=v||jsonb_build_object('id',gen_random_uuid());
 begin perform public.hr_ledger_ack('ppvircenkjizeiqdxphj','store_synthetic',1,repeat('a',64),jsonb_build_array(v,unknown_row));raise exception 'Unknown accepted';
 exception when invalid_parameter_value then null;end;
 if exists(select 1 from hr_private.ledger_acknowledgments) then raise exception 'Unknown batch partly committed.';end if;
 begin perform public.hr_ledger_ack('ppvircenkjizeiqdxphj','store_synthetic',-1,repeat('a',64),rows);raise exception 'Negative generation accepted';
 exception when invalid_parameter_value then null;end;
 begin perform public.hr_ledger_ack('ppvircenkjizeiqdxphj','store_synthetic',1,'bad',rows);raise exception 'Invalid digest accepted';
 exception when invalid_parameter_value then null;end;
 insert into hr_private.purge_objects(receipt_id,object_path) values(b,c::text||'/'||b::text||'/'||gen_random_uuid()::text);
 perform public.hr_ledger_ack('ppvircenkjizeiqdxphj','store_synthetic',1,repeat('a',64),rows);
 if (select state from hr_private.purge_receipts where id=a)<>'complete' or (select state from hr_private.purge_receipts where id=b)<>'pending'
 then raise exception 'Ack/physical completion ordering broken.';end if;
 perform public.hr_ledger_ack('ppvircenkjizeiqdxphj','store_synthetic',1,repeat('a',64),rows);
 if (select count(*) from hr_private.ledger_acknowledgments)<>2 then raise exception 'Retry duplicated ack.';end if;
 begin perform public.hr_ledger_ack('ppvircenkjizeiqdxphj','store_synthetic',0,repeat('a',64),jsonb_build_array(v));raise exception 'Stale generation accepted';
 exception when serialization_failure then null;end;
 begin perform public.hr_ledger_ack('ppvircenkjizeiqdxphj','store_synthetic',1,repeat('b',64),jsonb_build_array(v));raise exception 'Changed digest accepted';
 exception when serialization_failure then null;end;
 update hr_private.purge_worker_settings set enabled=true;
 job:=public.hr_purge_worker_reserve();
 if not public.hr_purge_worker_finish((job->>'id')::uuid,(job->>'attempt')::uuid,true)
 then raise exception 'Existing worker completion failed.';end if;
 if (select state from hr_private.purge_receipts where id=b)<>'complete' then raise exception 'Byte finish ignored ack.';end if;
 update hr_private.purge_receipts set state='pending',completed_at=null where id=a;
 if exists(select 1 from hr_private.ledger_acknowledgments where receipt_id=a) then raise exception 'Replay reused stale ack.';end if;
 update hr_private.purge_receipts set state='complete',completed_at=now() where id=a;
 if (select state from hr_private.purge_receipts where id=a)<>'pending' then raise exception 'Replay bypassed gate.';end if;
 begin update hr_private.purge_receipts set through_revision=2 where id=a;raise exception 'Immutable receipt changed';
 exception when invalid_parameter_value then null;end;
 if has_function_privilege('anon','public.hr_ledger_ack(text,text,bigint,text,jsonb)','execute')
  or has_function_privilege('authenticated','public.hr_ledger_snapshot(text,text)','execute')
  or has_table_privilege('service_role','hr_private.ledger_acknowledgments','select,insert,update,delete')
 then raise exception 'Private ledger ACL widened.';end if;
end$$;
set local role service_role;
select jsonb_array_length(public.hr_ledger_snapshot('ppvircenkjizeiqdxphj','store_synthetic')->'receipts')=2 as server_role_snapshot_pass;
reset role;
select 'HR ledger acknowledgment rollback PASS' as result;
rollback;
