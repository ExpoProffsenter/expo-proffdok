-- Sandbox only. Real project/checklist gateways; all fixture writes roll back.
begin;
select set_config('request.jwt.claim.sub',(select id::text from auth.users where email='demo@expo-proffdok.no'),true);
do $seed$
declare c uuid:='e0000000-0000-4000-8000-000000000001';pid uuid:=gen_random_uuid();
begin
 insert into public.projects(id,user_id,company_scope_id,title,data) values(pid,auth.uid(),c,'QA ROLLBACK – dokumentert ferdigstilling','{"checklist":{"QA kontroll":{"Testpunkt":{"status":"Ok"}}}}');
 insert into kshms_private.project_checklist_runs(id,company_id,project_id,category,definition,answers,status,created_by,updated_by,updated_identity,completed_at,completed_by,completed_identity)
 values(gen_random_uuid(),c,pid,'QA kontroll','{"category":"QA kontroll","items":["Testpunkt"]}','{"Testpunkt":{"status":"Ok"}}','completed',auth.uid(),auth.uid(),'{"name":"QA"}',now(),auth.uid(),'{"name":"QA"}');
 perform set_config('qa.completion_project',pid::text,true);
end$seed$;
set local role authenticated;
do $qa$
declare c uuid:='e0000000-0000-4000-8000-000000000001';rec jsonb;tree jsonb;row jsonb;item jsonb;r uuid;u uuid;pid uuid:=current_setting('qa.completion_project')::uuid;
begin
 rec:=public.bolig_workspace(c,'create_plan',null,null,jsonb_build_object('request_id',gen_random_uuid(),'title','QA ROLLBACK – ferdigstilling','reference','QA-ROLLBACK-COMPLETE','buildings','[{"name":"QA bygg","building_type":"apartment","address":"QA gate","house_floors":1,"entrances":[{"address":"QA gate","counts":[1]}]}]'::jsonb));
 r:=(rec->'root'->>'id')::uuid;u:=(rec->'units'->0->>'id')::uuid;
 rec:=public.bolig_workspace(c,'unit',r,(rec->'root'->>'revision')::bigint,jsonb_build_object('id',u,'number','H0101','project_id',pid));
 tree:=public.bolig_completion(c,r,u);select value into row from jsonb_array_elements(tree->'rows') where value->>'scope_id'=u::text;
 tree:=public.bolig_completion(c,r,u,'start',(row->>'revision')::bigint,jsonb_build_object('basis',row->>'basis'));
 select value into row from jsonb_array_elements(tree->'rows') where value->>'scope_id'=u::text;
 if jsonb_array_length(row->'source'->'issues')<>0 then raise exception 'Unexpected project source blockers: %',row->'source';end if;
 for item in select value from jsonb_array_elements(row->'items') loop
  tree:=public.bolig_completion(c,r,u,'item',(row->>'revision')::bigint,jsonb_build_object('basis',row->>'basis','id',item->>'id','done',true,'evidence','QA testdokument 22.10.2026'));
  select value into row from jsonb_array_elements(tree->'rows') where value->>'scope_id'=u::text;
 end loop;
 if row->>'status'<>'controlled' then raise exception 'Expected controlled: %',row->'issues';end if;
 tree:=public.bolig_completion(c,r,u,'approve',(row->>'revision')::bigint,jsonb_build_object('basis',row->>'basis'));
 select value into row from jsonb_array_elements(tree->'rows') where value->>'scope_id'=u::text;
 tree:=public.bolig_completion(c,r,u,'handover',(row->>'revision')::bigint,jsonb_build_object('basis',row->>'basis','reason','QA overtagelsesprotokoll – rollback'));
 select value into row from jsonb_array_elements(tree->'rows') where value->>'scope_id'=u::text;
 if row->>'status'<>'handed_over' then raise exception 'Expected handover';end if;
 perform set_config('qa.completion_root',r::text,true);perform set_config('qa.completion_unit',u::text,true);
end$qa$;
reset role;
-- A newer draft must invalidate even a recorded handover.
insert into kshms_private.project_checklist_runs(id,company_id,project_id,category,definition,answers,status,created_by,updated_by,updated_identity)
values(gen_random_uuid(),'e0000000-0000-4000-8000-000000000001',current_setting('qa.completion_project')::uuid,'QA kontroll','{"category":"QA kontroll","items":["Testpunkt"]}','{}','draft',auth.uid(),auth.uid(),'{"name":"QA"}');
set local role authenticated;
do $verify$
declare tree jsonb;row jsonb;
begin
 tree:=public.bolig_completion('e0000000-0000-4000-8000-000000000001',current_setting('qa.completion_root')::uuid,current_setting('qa.completion_unit')::uuid);
 select value into row from jsonb_array_elements(tree->'rows') where value->>'scope_id'=current_setting('qa.completion_unit');
 if row->>'status'<>'review' or jsonb_array_length(row->'source'->'issues')=0 then raise exception 'New draft did not invalidate handover';end if;
 perform set_config('qa.completion_result','PASS real authenticated project/checklist read, proof, approval, handover, newer draft invalidation; full rollback',true);
end$verify$;
select current_setting('qa.completion_result') result;
rollback;
