-- Sandbox only. All synthetic business rows and native notifications are rolled back.
begin;
set local statement_timeout='25s';
set local lock_timeout='2s';
select set_config('qa.integration.projects_before',(select md5(coalesce(jsonb_agg(to_jsonb(p) order by p.id)::text,'')) from public.projects p),true);
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $$
declare c uuid:='e0000000-0000-4000-8000-000000000001';u uuid:=auth.uid();pid uuid:=gen_random_uuid();rt uuid;rid uuid:=gen_random_uuid();sid uuid:=gen_random_uuid();eid uuid:=gen_random_uuid();did uuid;r jsonb;before_root jsonb;payload jsonb;content jsonb;tasks jsonb;t jsonb;
begin
 r:=public.bolig_workspace(c,'create_plan',null,null,jsonb_build_object('request_id',gen_random_uuid(),'title','QA Integrasjon – rulles tilbake','reference','QA-ROLLBACK','buildings',jsonb_build_array(jsonb_build_object('name','QA','building_type','house','address','','house_floors',1,'entrances',jsonb_build_array(jsonb_build_object('address','','counts',jsonb_build_array(1)))))));
 rt:=(r#>>'{root,id}')::uuid;before_root:=public.bolig_workspace(c,'get',rt,null,'{}');
 payload:=jsonb_build_object('request_id',rid,'revision',0,'project_id',pid);
 r:=public.bolig_project_integration(c,rt,'create',payload);
 assert r#>>'{project,id}'=pid::text and r->>'revision'='1','Native project create/link failed';
 assert r#>>'{ks_context,enabled}'='true','Existing KS context lost';
 assert public.bolig_project_integration(c,rt,'create',payload)#>>'{project,id}'=pid::text,'Exact replay failed';
 assert public.bolig_workspace(c,'get',rt,null,'{}')=before_root,'Bolig data modified by link';
 perform public.project_checklist_state(c,pid);
 r:=public.kshms_sja_command(c,'save',gen_random_uuid(),jsonb_build_object('id',sid,'revision',0,'project_id',pid,'content',jsonb_build_object('title','QA SJA rollback','leader_id',u,'steps',jsonb_build_array(jsonb_build_object('id',gen_random_uuid())),'participants',jsonb_build_array(jsonb_build_object('id',gen_random_uuid())))));
 assert r#>>'{sja,project_id}'=pid::text and r#>>'{sja,status}'='draft','Native SJA link failed';
 r:=public.kshms_deviation_command(c,'create',jsonb_build_object('request_id',gen_random_uuid(),'title','QA RUH rollback','event','Synthetic event only. This transaction rolls back.','category','ruh','responsible_id',u,'due_on',current_date+1,'project_id',pid,'source_kind','company'));
 did:=(r->>'id')::uuid;assert r->>'project_id'=pid::text,'Native RUH link failed';
 content:=jsonb_build_object('title','QA kontroll rollback','workplace','QA','planned_on',current_date::text,'responsible_id',u,'participants','QA kontroll','review','','basis','','reference','','routines','','acceptance',jsonb_build_object('low_max',4,'medium_max',12,'description','','confirmed',false),'risks','[]'::jsonb,'points',jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'title','QA kontrollpunkt','image_required',false,'comment_required',false)),'answers','{}'::jsonb);
 r:=public.kshms_execution_command(c,'save',gen_random_uuid(),jsonb_build_object('id',eid,'kind','round','revision',0,'project_id',pid,'content',content));
 assert public.kshms_execution_detail(c,eid)#>>'{record,project_id}'=pid::text,'Native HMS control link failed';
 tasks:=public.bolig_my_project_tasks(c);
 assert exists(select 1 from jsonb_array_elements(tasks->'items') x where x->>'id'=did::text and x->>'kind'='deviation' and x->>'project_id'=pid::text),'Own native RUH task missing';
 assert exists(select 1 from jsonb_array_elements(tasks->'items') x where x->>'id'=eid::text and x->>'kind'='round' and x->>'project_id'=pid::text),'Own native HMS task missing';
 begin
 t:=public.time_projects(c,'QA Integrasjon');
 assert exists(select 1 from jsonb_array_elements(t->'projects') x where x->>'id'=pid::text),'Linked project missing from native time projects';
 perform set_config('qa.integration.time','PASS native time project list',true);
 exception when insufficient_privilege then perform set_config('qa.integration.time','Existing demo actor lacks time rights; rights unchanged',true);end;
 perform set_config('qa.integration.pid',pid::text,true);
 perform set_config('qa.integration.result','PASS native create/replay, unchanged Bolig, checklist gateway, SJA, RUH, HMS and own tasks',true);
end$$;
reset role;
do $$begin
 assert (select data->>'projectName'='QA Integrasjon – rulles tilbake' and company_scope_id='e0000000-0000-4000-8000-000000000001'::uuid and not share_enabled from public.projects where id=current_setting('qa.integration.pid')::uuid),'Project metadata or private sharing changed';
 assert (select md5(coalesce(jsonb_agg(to_jsonb(p) order by p.id)::text,'')) from public.projects p where p.id<>current_setting('qa.integration.pid')::uuid)=current_setting('qa.integration.projects_before'),'Existing ordinary projects changed';
end$$;
select current_setting('qa.integration.result') result,current_setting('qa.integration.time') time_result;
rollback;
