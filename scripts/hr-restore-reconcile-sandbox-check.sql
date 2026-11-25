-- H4: synthetic operator receipts only; no Storage metadata writes or bytes.
begin;
set local statement_timeout='20s';
create function pg_temp.h4_assert(ok boolean,label text) returns void language plpgsql as $$begin
 if ok is distinct from true then raise exception 'H4 QA: %',label;end if;
 perform set_config('hr.h4.count',(coalesce(nullif(current_setting('hr.h4.count',true),''),'0')::int+1)::text,true);
end$$;
do $$declare c uuid:=gen_random_uuid();e uuid:=gen_random_uuid();u uuid:=gen_random_uuid();r jsonb;bad jsonb;failed boolean:=false;begin
 insert into public.sales_company_scopes(id,normalized_name,display_name) values(c,'hr-h4-qa-'||c,'Synthetic H4 restore');
 r:=jsonb_build_array(jsonb_build_object('id',e,'company_id',c,'employee_id',e,'user_id',u,'kind','employment','through_revision',1,'requested_at','2026-10-09T21:00:00Z'));
 perform pg_temp.h4_assert(hr_private.restore_reconcile(r)=1,'receipt without employee replays');
 perform pg_temp.h4_assert((select state='complete' from hr_private.purge_receipts where id=e),'no bytes means complete');
 perform pg_temp.h4_assert((select count(*)=0 from hr_private.purge_objects where receipt_id=e),'no nonexistent byte jobs');
 perform pg_temp.h4_assert((select user_id=u and previous_revision=1 from hr_private.closed_employments where employee_id=e),'closure barrier restored');
 perform pg_temp.h4_assert((select not content_enabled and restore_quarantined from hr_private.runtime_state where singleton),'replay keeps both DB gates closed');
 perform pg_temp.h4_assert(hr_private.restore_reconcile(r)=1,'repeat is idempotent');
 perform pg_temp.h4_assert((select count(*)=1 from hr_private.purge_receipts where id=e),'no duplicate receipt');
 bad:=jsonb_build_array((r->0)||jsonb_build_object('user_id',gen_random_uuid()));
 begin perform hr_private.restore_reconcile(bad);exception when sqlstate '22023' then failed:=true;end;
 perform pg_temp.h4_assert(failed,'changed receipt identity rejected');
 perform pg_temp.h4_assert(not has_function_privilege('authenticated','hr_private.restore_reconcile(jsonb)','EXECUTE'),'authenticated cannot restore');
 perform pg_temp.h4_assert(not has_function_privilege('service_role','hr_private.restore_reconcile(jsonb)','EXECUTE'),'service worker cannot restore');
 perform pg_temp.h4_assert(not has_function_privilege('anon','hr_private.restore_reconcile(jsonb)','EXECUTE'),'anonymous cannot restore');
end$$;
select current_setting('hr.h4.count')::int assertions,'PASS' result;
rollback;
