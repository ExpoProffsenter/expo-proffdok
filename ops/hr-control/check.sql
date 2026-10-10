-- Actual control SQL, synthetic bindings only. Entire fixture rolls back.
begin;
set local statement_timeout='20s';
set local lock_timeout='2s';
create temporary table control_assertions(label text primary key) on commit drop;
create function pg_temp.check_control(ok boolean,label text) returns void language plpgsql as $$
begin
 if not coalesce(ok,false) then raise exception 'Control assertion failed: %',label; end if;
 insert into control_assertions values(label);
end $$;
do $$
declare p text:='aaaaaaaaaaaaaaaaaaaa'; st text:='store_synthetic';
 o text:='https://synthetic.private.blob.vercel-storage.com';
 a uuid:='00000000-0000-4000-8000-000000000001';
 b uuid:='00000000-0000-4000-8000-000000000002'; s jsonb;
begin
 perform pg_temp.check_control(not exists(select 1 from hr_control.checkpoints),'no automatic bootstrap');
 begin perform public.hr_control_claim(p,st,o,a); raise exception 'unexpected claim';
 exception when insufficient_privilege then null; end;
 perform pg_temp.check_control(not exists(select 1 from hr_control.checkpoints),'missing anchor not recreated');
 insert into hr_control.checkpoints(project_ref,store_id,origin,generation,hmac)
 values(p,st,o,0,repeat('a',64));
 perform pg_temp.check_control(not (select enabled from hr_control.checkpoints),'default binding disabled');
 begin perform public.hr_control_claim(p,st,o,a); raise exception 'unexpected disabled claim';
 exception when insufficient_privilege then null; end;
 update hr_control.checkpoints set enabled=true where project_ref=p;
 begin perform public.hr_control_claim(p,'store_wrong',o,a); raise exception 'unexpected store';
 exception when insufficient_privilege then null; end;
 begin perform public.hr_control_claim(p,st,'https://wrong.private.blob.vercel-storage.com',a); raise exception 'unexpected origin';
 exception when insufficient_privilege then null; end;
 begin perform public.hr_control_claim(p,st,o,null); raise exception 'unexpected null run';
 exception when insufficient_privilege then null; end;
 perform pg_temp.check_control((select run_id is null from hr_control.checkpoints),'bad claims leave lock empty');
 s:=public.hr_control_claim(p,st,o,a);
 perform pg_temp.check_control(s->>'runId'=a::text and (s->>'revision')::int=0,'claim acquires exact durable run');
 begin perform public.hr_control_claim(p,st,o,b); raise exception 'unexpected second claim';
 exception when insufficient_privilege then null; end;
 update hr_control.checkpoints set acquired_at=now()-interval '1 year';
 begin perform public.hr_control_claim(p,st,o,b); raise exception 'unexpected timeout takeover';
 exception when insufficient_privilege then null; end;
 perform pg_temp.check_control((select run_id=a from hr_control.checkpoints),'old lock never expires automatically');
 begin perform public.hr_control_read(p,st,o,b); raise exception 'unexpected other reader';
 exception when insufficient_privilege then null; end;
 begin perform public.hr_control_commit(p,st,o,b,0,1,repeat('b',64)); raise exception 'unexpected other commit';
 exception when insufficient_privilege then null; end;
 begin perform public.hr_control_finish(p,st,o,b,0); raise exception 'unexpected other finish';
 exception when insufficient_privilege then null; end;
 begin perform public.hr_control_commit(p,st,o,a,1,1,repeat('b',64)); raise exception 'unexpected stale revision';
 exception when serialization_failure then null; end;
 begin perform public.hr_control_commit(p,st,o,a,0,0,repeat('b',64)); raise exception 'unexpected old generation';
 exception when serialization_failure then null; end;
 begin perform public.hr_control_commit(p,st,o,a,0,2,repeat('b',64)); raise exception 'unexpected skipped generation';
 exception when serialization_failure then null; end;
 begin perform public.hr_control_commit(p,st,o,a,0,1,'invalid'); raise exception 'unexpected bad digest';
 exception when serialization_failure then null; end;
 begin perform public.hr_control_commit(p,st,o,a,0,1,null); raise exception 'unexpected null digest';
 exception when serialization_failure then null; end;
 begin perform public.hr_control_commit(p,st,o,a,0,1,repeat('a',64)); raise exception 'unexpected unchanged digest';
 exception when serialization_failure then null; end;
 perform pg_temp.check_control((select revision=0 and generation=0 from hr_control.checkpoints),'failed commits preserve prior anchor');
 s:=public.hr_control_commit(p,st,o,a,0,1,repeat('b',64));
 perform pg_temp.check_control((s->>'revision')::int=1 and (s->'anchor'->>'generation')::int=1,'valid CAS commit advances once');
 perform pg_temp.check_control(public.hr_control_read(p,st,o,a)=s,'fresh SQL read matches committed anchor');
 begin perform public.hr_control_commit(p,st,o,a,0,1,repeat('b',64)); raise exception 'unexpected duplicate commit';
 exception when serialization_failure then null; end;
 begin perform public.hr_control_finish(p,st,o,a,0); raise exception 'unexpected stale finish';
 exception when serialization_failure then null; end;
 perform pg_temp.check_control((select run_id=a from hr_control.checkpoints),'failed finish preserves lock');
 perform pg_temp.check_control(public.hr_control_finish(p,st,o,a,1)='{"finished":true}'::jsonb,'exact owner finishes');
 perform pg_temp.check_control((select run_id is null and acquired_at is null and last_success_at is not null from hr_control.checkpoints),'success releases lock with timestamp');
 begin perform public.hr_control_read(p,st,o,a); raise exception 'unexpected old owner read';
 exception when insufficient_privilege then null; end;
 s:=public.hr_control_claim(p,st,o,b);
 perform pg_temp.check_control((s->>'revision')::int=1 and s->>'runId'=b::text,'new worker resumes last committed anchor');
 update hr_control.checkpoints set enabled=false where project_ref=p;
 begin perform public.hr_control_read(p,st,o,b); raise exception 'unexpected disabled read';
 exception when insufficient_privilege then null; end;
 perform pg_temp.check_control((select run_id=b from hr_control.checkpoints),'disable preserves recovery lock');
end $$;
do $$
declare r text; fn text;
begin
 foreach r in array array['anon','authenticated','service_role'] loop
  perform pg_temp.check_control(not has_table_privilege(r,'hr_control.checkpoints','select,insert,update,delete'),r||' cannot access anchor table');
  perform pg_temp.check_control(not has_schema_privilege(r,'hr_control','usage'),r||' cannot access private helpers');
  foreach fn in array array['public.hr_control_claim(text,text,text,uuid)',
   'public.hr_control_read(text,text,text,uuid)',
   'public.hr_control_commit(text,text,text,uuid,bigint,bigint,text)',
   'public.hr_control_finish(text,text,text,uuid,bigint)'] loop
   perform pg_temp.check_control(has_function_privilege(r,fn,'execute')=(r='service_role'),r||' ACL '||fn);
  end loop;
 end loop;
 perform pg_temp.check_control((select relrowsecurity from pg_class where oid='hr_control.checkpoints'::regclass),'private table RLS enabled');
 perform pg_temp.check_control(not exists(select 1 from pg_proc where proname like 'hr_control_%' and pronamespace='public'::regnamespace and not ('search_path=""'=any(proconfig))),'RPC search_path empty');
end $$;
-- Actual role execution, not only metadata checks.
set local role anon;
do $$ begin
 begin perform public.hr_control_claim('aaaaaaaaaaaaaaaaaaaa','store_synthetic','https://synthetic.private.blob.vercel-storage.com','00000000-0000-4000-8000-000000000001');
 raise exception 'anon unexpectedly claimed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
select pg_temp.check_control(true,'actual anon execution denied');
set local role authenticated;
do $$ begin
 begin perform public.hr_control_read('aaaaaaaaaaaaaaaaaaaa','store_synthetic','https://synthetic.private.blob.vercel-storage.com','00000000-0000-4000-8000-000000000001');
 raise exception 'user unexpectedly read'; exception when insufficient_privilege then null; end;
end $$;
reset role;
select pg_temp.check_control(true,'actual authenticated execution denied');
update hr_control.checkpoints set enabled=true where project_ref='aaaaaaaaaaaaaaaaaaaa';
set local role service_role;
select public.hr_control_read('aaaaaaaaaaaaaaaaaaaa','store_synthetic','https://synthetic.private.blob.vercel-storage.com','00000000-0000-4000-8000-000000000002');
reset role;
select pg_temp.check_control(true,'actual service-only RPC works');
select count(*)::int as assertions, array_agg(label order by label) as checks from control_assertions;
rollback;
