-- Synthetic control-project SQL only. No Blob/app calls; all rows rolled back.
begin;
set local statement_timeout='20s';
set local lock_timeout='2s';
create temporary table bootstrap_assertions(label text primary key) on commit drop;
create function pg_temp.check_bootstrap(ok boolean,label text) returns void language plpgsql as $$
begin
 if not coalesce(ok,false) then raise exception 'Bootstrap assertion failed: %',label;end if;
 insert into bootstrap_assertions values(label);
end $$;
do $$
declare p text:='bootstrapqaonlyxxxxx';s text:='store_synthetic';
 o text:='https://synthetic.private.blob.vercel-storage.com';h text:=repeat('a',64);
 a uuid:='00000000-0000-4000-8000-000000000001';b uuid:='00000000-0000-4000-8000-000000000002';v jsonb;r text;f text;
begin
 perform pg_temp.check_bootstrap(not exists(select 1 from hr_control.checkpoints),'no installed bootstrap rows');
 begin perform public.hr_control_bootstrap_claim(p,s,o,a,h);raise exception 'unexpected missing claim';
 exception when insufficient_privilege then null;end;
 perform pg_temp.check_bootstrap(not exists(select 1 from hr_control.checkpoints),'missing checkpoint stays missing');
 foreach r in array array['dqffxflaoyarbxyiyhop','ppvircenkjizeiqdxphj','amduqhmgmeetaatwlmmt'] loop
  begin insert into hr_control.checkpoints(project_ref,store_id,origin,generation,hmac,bootstrap_status)
   values(r,s,o,0,h,'staged');raise exception 'unexpected protected source';exception when check_violation then null;end;
  perform pg_temp.check_bootstrap(true,'protected source rejected '||r);
 end loop;
 insert into hr_control.checkpoints(project_ref,store_id,origin,generation,hmac,bootstrap_status) values(p,s,o,0,h,'staged');
 begin perform public.hr_control_bootstrap_claim(p,s,o,a,repeat('b',64));raise exception 'unexpected digest';exception when insufficient_privilege then null;end;
 begin perform public.hr_control_bootstrap_claim(p,'store_wrong',o,a,h);raise exception 'unexpected store';exception when insufficient_privilege then null;end;
 begin perform public.hr_control_bootstrap_claim(p,s,'https://wrong.private.blob.vercel-storage.com',a,h);raise exception 'unexpected origin';exception when insufficient_privilege then null;end;
 begin perform public.hr_control_bootstrap_claim(p,s,o,null,h);raise exception 'unexpected null run';exception when insufficient_privilege then null;end;
 perform pg_temp.check_bootstrap((select run_id is null and bootstrap_status='staged' from hr_control.checkpoints where project_ref=p),'bad claims preserve staged row');
 begin update hr_control.checkpoints set enabled=true where project_ref=p;raise exception 'unexpected enable';exception when check_violation then null;end;
 perform pg_temp.check_bootstrap((select not enabled from hr_control.checkpoints where project_ref=p),'constraint prevents activation');
 foreach r in array array['anon','authenticated','service_role'] loop
  perform pg_temp.check_bootstrap(not has_table_privilege(r,'hr_control.checkpoints','select,insert,update,delete'),r||' no direct table access');
  perform pg_temp.check_bootstrap(not has_schema_privilege(r,'hr_control','usage'),r||' no private helper access');
  foreach f in array array['claim','read','commit'] loop
   perform pg_temp.check_bootstrap(has_function_privilege(r,'public.hr_control_bootstrap_'||f||'(text,text,text,uuid,text)','execute')=(r='service_role'),r||' ACL '||f);
  end loop;
 end loop;
end $$;
set local role anon;
do $$ begin
 begin perform public.hr_control_bootstrap_claim('bootstrapqaonlyxxxxx','store_synthetic','https://synthetic.private.blob.vercel-storage.com','00000000-0000-4000-8000-000000000001',repeat('a',64));raise exception 'unexpected anon';exception when insufficient_privilege then null;end;
end $$;
reset role;
select pg_temp.check_bootstrap(true,'actual anon denied');
set local role authenticated;
do $$ begin
 begin perform public.hr_control_bootstrap_read('bootstrapqaonlyxxxxx','store_synthetic','https://synthetic.private.blob.vercel-storage.com','00000000-0000-4000-8000-000000000001',repeat('a',64));raise exception 'unexpected user';exception when insufficient_privilege then null;end;
end $$;
reset role;
select pg_temp.check_bootstrap(true,'actual authenticated denied');
set local role service_role;
select public.hr_control_bootstrap_claim('bootstrapqaonlyxxxxx','store_synthetic','https://synthetic.private.blob.vercel-storage.com','00000000-0000-4000-8000-000000000001',repeat('a',64));
select public.hr_control_bootstrap_commit('bootstrapqaonlyxxxxx','store_synthetic','https://synthetic.private.blob.vercel-storage.com','00000000-0000-4000-8000-000000000001',repeat('a',64));
select public.hr_control_bootstrap_read('bootstrapqaonlyxxxxx','store_synthetic','https://synthetic.private.blob.vercel-storage.com','00000000-0000-4000-8000-000000000001',repeat('a',64));
reset role;
do $$
declare p text:='bootstrapqaonlyxxxxx';s text:='store_synthetic';o text:='https://synthetic.private.blob.vercel-storage.com';h text:=repeat('a',64);
 a uuid:='00000000-0000-4000-8000-000000000001';b uuid:='00000000-0000-4000-8000-000000000002';v jsonb;
begin
 v:=public.hr_control_bootstrap_read(p,s,o,a,h);
 perform pg_temp.check_bootstrap(v->>'bootstrapStatus'='verified' and (v->>'enabled')::boolean=false and v->>'runId'=a::text and v->'anchor'->>'hmac'=h,'actual service-only commit and separate exact read');
 begin perform public.hr_control_bootstrap_claim(p,s,o,b,h);raise exception 'unexpected rebootstrap';exception when insufficient_privilege then null;end;
 begin perform public.hr_control_bootstrap_commit(p,s,o,a,h);raise exception 'unexpected duplicate commit';exception when serialization_failure then null;end;
 begin perform public.hr_control_bootstrap_read(p,s,o,b,h);raise exception 'unexpected new owner';exception when insufficient_privilege then null;end;
 begin perform public.hr_control_claim(p,s,o,b);raise exception 'unexpected cycle claim';exception when insufficient_privilege then null;end;
 begin perform public.hr_control_finish(p,s,o,a,0);raise exception 'unexpected cycle unlock';exception when insufficient_privilege then null;end;
 perform pg_temp.check_bootstrap((select run_id=a and not enabled from hr_control.checkpoints where project_ref=p),'retry and normal cycle cannot unlock');
 update hr_control.checkpoints set acquired_at=now()-interval '1 year' where project_ref=p;
 begin perform public.hr_control_bootstrap_claim(p,s,o,b,h);raise exception 'unexpected old takeover';exception when insufficient_privilege then null;end;
 perform pg_temp.check_bootstrap((select run_id=a from hr_control.checkpoints where project_ref=p),'old lock stays owned');
 perform pg_temp.check_bootstrap(not exists(select 1 from pg_proc where proname like 'hr_control_bootstrap_%' and not ('search_path=""'=any(proconfig))),'empty RPC search_path');
 perform pg_temp.check_bootstrap((select relrowsecurity from pg_class where oid='hr_control.checkpoints'::regclass),'RLS remains');
end $$;
select count(*)::int as bootstrap_assertions from bootstrap_assertions;
rollback;
