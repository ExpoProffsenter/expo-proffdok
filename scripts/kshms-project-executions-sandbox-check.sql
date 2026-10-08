-- Synthetic identities and documents only; every write is rolled back.
begin;
set local statement_timeout='25s';
set local lock_timeout='2s';
create function pg_temp.ex_assert(ok boolean,label text) returns void language plpgsql as $$begin if ok is distinct from true then raise exception 'PROJECT EXEC QA: %',label;end if;perform set_config('ks.exec.checks',(coalesce(nullif(current_setting('ks.exec.checks',true),''),'0')::integer+1)::text,true);end$$;
create function pg_temp.ex_reject(query text,code text default null) returns void language plpgsql as $$declare failed boolean:=false;got text;begin begin execute query;exception when others then failed:=true;get stacked diagnostics got=returned_sqlstate;end;perform pg_temp.ex_assert(failed and (code is null or got=code),'rejected request, expected '||coalesce(code,'error')||', received '||coalesce(got,'success'));end$$;
do $$declare c uuid:=gen_random_uuid();foreign_company uuid:=gen_random_uuid();u uuid;sys uuid;k text;pid uuid;begin
 insert into public.sales_company_scopes(id,normalized_name,display_name) values(c,public.sales_normalize_company_name('PROJECT EXEC QA '||c),'PROJECT EXEC QA '||c),(foreign_company,public.sales_normalize_company_name('FOREIGN EXEC QA '||foreign_company),'FOREIGN EXEC QA '||foreign_company);perform set_config('ks.exec.company',c::text,true);
 select id into sys from public.profiles where system_role='systemadmin' and approved and not coalesce(deactivated,false) limit 1;assert sys is not null;perform set_config('ks.exec.sys',sys::text,true);
 foreach k in array array['admin','worker','colleague','isolated','without'] loop
  u:=gen_random_uuid();perform set_config('ks.exec.'||k,u::text,true);
  insert into auth.users(id,aud,role,email,created_at,updated_at,raw_app_meta_data,raw_user_meta_data) values(u,'authenticated','authenticated','project-exec-qa-'||u||'@example.invalid',now(),now(),'{}',jsonb_build_object('full_name','PROJECT EXEC QA '||k));
  insert into public.profiles(id,email,company_name,approved,deactivated,role,company_role) values(u,'project-exec-qa-'||u||'@example.invalid','PROJECT EXEC QA '||c,true,false,case when k='admin' then 'admin' else 'member' end,case when k='admin' then 'firmaadmin' else 'ansatt' end) on conflict(id) do update set company_name=excluded.company_name,approved=true,deactivated=false,role=excluded.role,company_role=excluded.company_role,system_role=null;
  insert into public.sales_company_memberships(company_id,user_id,is_primary,workspace_role) values(c,u,true,case when k='admin' then 'firmaadmin' else 'ansatt' end) on conflict(company_id,user_id) do update set workspace_role=excluded.workspace_role;
  insert into public.user_active_company_scope(user_id,company_id) values(u,c) on conflict(user_id) do update set company_id=excluded.company_id;
  if k not in('isolated','without') then insert into public.user_module_access(user_id,module_key) values(u,'projects') on conflict do nothing;end if;
 end loop;
 foreach k in array array['project','project_two','foreign_project'] loop
  pid:=gen_random_uuid();perform set_config('ks.exec.'||k,pid::text,true);
  insert into public.projects(id,user_id,company_scope_id,title,data) values(pid,current_setting('ks.exec.worker')::uuid,case when k='foreign_project' then foreign_company else c end,'PROJECT EXEC QA '||k,'{"project":{"projectName":"PROJECT EXEC QA","projectDeviations":[{"id":"keep","status":"Åpent"}]},"overtagelse":{"signKunde":"keep"},"checklist":{"keep":{"comment":"Keep"}}}');
 end loop;
 perform set_config('ks.exec.project.data',(select data::text from public.projects where id=current_setting('ks.exec.project')::uuid),true);
end$$;
set local role authenticated;
do $$declare c uuid:=current_setting('ks.exec.company')::uuid;a uuid:=current_setting('ks.exec.admin')::uuid;u uuid:=current_setting('ks.exec.worker')::uuid;col uuid:=current_setting('ks.exec.colleague')::uuid;project uuid:=current_setting('ks.exec.project')::uuid;second uuid:=current_setting('ks.exec.project_two')::uuid;round_id uuid:=gen_random_uuid();risk_id uuid:=gen_random_uuid();point uuid:=gen_random_uuid();risk_point uuid:=gen_random_uuid();content jsonb;payload jsonb;r jsonb;details jsonb;state jsonb;tasks jsonb;k text;statement_value text:='Jeg bekrefter at jeg har gjennomført og kontrollert dokumentasjonen sammen med de oppgitte deltakerne.';
begin
 perform set_config('request.jwt.claim.sub',current_setting('ks.exec.sys'),true);perform public.kshms_activate(c,true);
 perform set_config('request.jwt.claim.sub',a::text,true);foreach k in array array['worker','colleague','isolated'] loop perform public.kshms_command(c,'access',jsonb_build_object('user_id',current_setting('ks.exec.'||k)::uuid,'role','reader','enabled',true));end loop;
 content:=jsonb_build_object('title','PROJECT EXEC QA kontroll','workplace','Lager','planned_on',(current_date-1)::text,'responsible_id',u,'participants','Utfører og verneombud.','review','','basis','','reference','','routines','R-012 – Støv (versjon 3)','acceptance',jsonb_build_object('low_max',4,'medium_max',12,'description','','confirmed',false),'risks','[]'::jsonb,'points',jsonb_build_array(jsonb_build_object('id',point,'title','Kontroller ferdsel','image_required',false,'comment_required',false)),'answers','{}'::jsonb);
 payload:=jsonb_build_object('id',round_id,'kind','round','revision',0,'project_id',project,'content',content);
 perform public.kshms_execution_command(c,'save',gen_random_uuid(),payload);perform set_config('ks.exec.round',round_id::text,true);
 content:=content||jsonb_build_object('title','PROJECT EXEC QA risiko','points','[]'::jsonb,'risks',jsonb_build_array(jsonb_build_object('id',risk_point)));
 payload:=jsonb_build_object('id',risk_id,'kind','risk','revision',0,'project_id',project,'content',content);
 perform public.kshms_execution_command(c,'save',gen_random_uuid(),payload);perform set_config('ks.exec.risk',risk_id::text,true);
 perform pg_temp.ex_assert(public.kshms_execution_tasks(c)->>'count'='0','reporter/manager is not the responsible recipient');
 perform set_config('request.jwt.claim.sub',u::text,true);
 tasks:=public.kshms_execution_tasks(c);perform pg_temp.ex_assert(tasks->>'count'='2' and tasks->>'overdue'='2','responsible receives both pending kinds and dates');
 perform pg_temp.ex_assert(exists(select 1 from jsonb_array_elements(tasks->'items') i where i->>'id'=round_id::text and i->>'kind'='round' and i->>'project_id'=project::text),'round task links exact project/document');
 perform pg_temp.ex_assert(exists(select 1 from jsonb_array_elements(tasks->'items') i where i->>'id'=risk_id::text and i->>'kind'='risk'),'risk task present');
 state:=public.kshms_project_execution_state(c,project,'round');perform pg_temp.ex_assert(jsonb_array_length(state->'records')=1 and state#>>'{records,0,id}'=round_id::text,'project round list');
 perform pg_temp.ex_assert(state#>>'{context,project_id}'=project::text and state#>>'{project,id}'=project::text and state#>>'{project,locked}'='false','project response identity/lock');
 perform pg_temp.ex_assert(jsonb_array_length(public.kshms_project_execution_state(c,project,'risk')->'records')=1,'project risk list');
 perform pg_temp.ex_assert(jsonb_array_length(public.kshms_project_execution_state(c,second,'round')->'records')=0,'other project does not list first project round');
 perform pg_temp.ex_assert(jsonb_array_length(public.kshms_project_execution_state(c,project,'round','all','not-a-match')->'records')=0,'project search');
 details:=public.kshms_execution_detail(c,round_id);perform pg_temp.ex_assert(details#>>'{record,content,routines}'='R-012 – Støv (versjon 3)','saved routine number/edition');
 perform pg_temp.ex_assert(public.kshms_execution_tasks(c)->>'count'='2','reading does not acknowledge or remove task');
 perform pg_temp.ex_reject(format('select public.kshms_execution_command(%L,''complete'',%L,%L::jsonb)',c,gen_random_uuid(),details->'record'||jsonb_build_object('confirmed',true,'statement',statement_value)));
 perform pg_temp.ex_assert(public.kshms_execution_tasks(c)->>'count'='2','failed fullføring preserves task');
 perform set_config('request.jwt.claim.sub',a::text,true);payload:=details->'record';payload:=jsonb_set(payload,'{content,responsible_id}',to_jsonb(col::text));perform public.kshms_execution_command(c,'save',gen_random_uuid(),payload);
 perform set_config('request.jwt.claim.sub',u::text,true);perform pg_temp.ex_assert(public.kshms_execution_tasks(c)->>'count'='1','old responsible loses reassigned task');
 perform set_config('request.jwt.claim.sub',col::text,true);tasks:=public.kshms_execution_tasks(c);perform pg_temp.ex_assert(tasks->>'count'='1','new responsible gains reassigned task');
 perform pg_temp.ex_assert(tasks#>>'{items,0,accessible}'='false' and tasks#>'{items,0,project_id}'='null'::jsonb and tasks#>'{items,0,due_on}'='null'::jsonb and strpos(tasks#>>'{items,0,title}','PROJECT EXEC QA')=0,'recipient without project access gets only minimal alert');
 perform pg_temp.ex_reject(format('select public.kshms_execution_detail(%L,%L)',c,round_id),'42501');
 perform set_config('request.jwt.claim.sub',a::text,true);details:=public.kshms_execution_detail(c,round_id);payload:=jsonb_set(details->'record','{content,responsible_id}',to_jsonb(u::text));perform public.kshms_execution_command(c,'save',gen_random_uuid(),payload);
 perform set_config('request.jwt.claim.sub',u::text,true);details:=public.kshms_execution_detail(c,round_id);payload:=details->'record';payload:=jsonb_set(jsonb_set(payload,'{content,review}','"Gjennomgått og kontrollert."'),'{content,answers}',jsonb_build_object(point::text,jsonb_build_object('status','ok','photos','[]'::jsonb)));payload:=payload||jsonb_build_object('confirmed',true,'statement',statement_value);
 perform public.kshms_execution_command(c,'complete',gen_random_uuid(),payload);perform pg_temp.ex_assert(public.kshms_execution_tasks(c)->>'count'='1','own saved round completion removes only its task');
 perform pg_temp.ex_assert(jsonb_array_length(public.kshms_project_execution_state(c,project,'round','completed')->'records')=1,'round remains in project history');
 details:=public.kshms_execution_detail(c,risk_id);content:=details#>'{record,content}';content:=content||jsonb_build_object('review','Deltakerne har gått gjennom vurderingen.','basis','Skala 1–5 gjelder sannsynlighet og personskade i dagens jobb.','acceptance',jsonb_build_object('low_max',4,'medium_max',12,'description','Kontrollerte tiltak før aksept.','confirmed',true),'risks',jsonb_build_array(jsonb_build_object('id',risk_point,'activity','Kapping','hazard','Støv','consequence','Lungeskade','existing_measures','Avskjerming','planned_measures','Avsug','owner_id',u,'due_on',current_date::text,'probability_before',3,'consequence_before',4,'probability_after',1,'consequence_after',2,'follow_up','Verneombud kontrollerer avsuget.','effect_status','planned','decision','needs_action','reason','Tiltak må gjennomføres og kontrolleres.')));
 payload:=details->'record'||jsonb_build_object('content',content,'confirmed',true,'statement',statement_value);perform public.kshms_execution_command(c,'complete',gen_random_uuid(),payload);
 perform pg_temp.ex_assert(public.kshms_execution_tasks(c)->>'count'='0','own saved risk completion removes final task');
 perform pg_temp.ex_assert(jsonb_array_length(public.kshms_project_execution_state(c,project,'risk','completed')->'records')=1,'risk remains in project history');
 perform pg_temp.ex_assert(public.kshms_execution_detail(c,risk_id)#>>'{record,content,risks,0,decision}'='needs_action','completed assessment still documents outstanding measures');
 details:=public.kshms_execution_detail(c,round_id);payload:=details->'record'||jsonb_build_object('id',gen_random_uuid(),'revision',0,'confirmed',false,'statement',null);r:=public.kshms_execution_command(c,'save',gen_random_uuid(),payload);perform set_config('ks.exec.locked_draft',r#>>'{record,id}',true);
 perform pg_temp.ex_reject(format('select public.kshms_project_execution_state(%L,%L,''round'')',c,current_setting('ks.exec.foreign_project')),'42501');
 perform pg_temp.ex_reject(format('select public.kshms_project_execution_state(%L,%L,''round'')',c,gen_random_uuid()),'42501');
 perform pg_temp.ex_reject(format('select public.kshms_project_execution_state(%L,null,''round'')',c),'42501');
 perform pg_temp.ex_reject(format('select public.kshms_project_execution_state(%L,%L,''invalid'')',c,project));
 perform pg_temp.ex_reject(format('select public.kshms_project_execution_state(%L,%L,''round'',''all'','''',now(),null)',c,project));
 perform pg_temp.ex_reject(format('select public.kshms_project_execution_state(%L,%L,''round'',''all'',%L)',c,project,repeat('a',161)));
 perform set_config('request.jwt.claim.sub',current_setting('ks.exec.isolated'),true);perform pg_temp.ex_reject(format('select public.kshms_project_execution_state(%L,%L,''round'')',c,project),'42501');perform pg_temp.ex_assert(public.kshms_execution_tasks(c)->>'count'='0','no project grant exposes no project task');
 perform set_config('request.jwt.claim.sub',current_setting('ks.exec.without'),true);perform pg_temp.ex_reject(format('select public.kshms_project_execution_state(%L,%L,''round'')',c,project),'42501');perform pg_temp.ex_reject(format('select public.kshms_execution_tasks(%L)',c),'42501');
end$$;
reset role;
-- A page from another project must never affect pagination in the selected one.
insert into public.kshms_executions(id,company_id,kind,project_id,content,responsible_id,responsible_identity,created_by,creator_identity,updated_by,updated_identity)
 select gen_random_uuid(),e.company_id,'round',current_setting('ks.exec.project_two')::uuid,e.content||'{"title":"PAGE QA"}'::jsonb,e.responsible_id,e.responsible_identity,e.created_by,e.creator_identity,e.updated_by,e.updated_identity
 from public.kshms_executions e cross join generate_series(1,101) where e.id=current_setting('ks.exec.round')::uuid;
update public.projects set locked=true where id=current_setting('ks.exec.project')::uuid;
set local role authenticated;
do $$declare c uuid:=current_setting('ks.exec.company')::uuid;project uuid:=current_setting('ks.exec.project')::uuid;second uuid:=current_setting('ks.exec.project_two')::uuid;state jsonb;page jsonb;details jsonb;begin
 perform set_config('request.jwt.claim.sub',current_setting('ks.exec.worker'),true);
 state:=public.kshms_project_execution_state(c,second,'round','all','PAGE QA');perform pg_temp.ex_assert(jsonb_array_length(state->'records')=100 and state->'next'<>'null'::jsonb,'project cursor is bounded at 100');
 page:=public.kshms_project_execution_state(c,second,'round','all','PAGE QA',(state#>>'{next,updated_at}')::timestamptz,(state#>>'{next,id}')::uuid);perform pg_temp.ex_assert(jsonb_array_length(page->'records')=1 and page->'next'='null'::jsonb,'second page returns remaining project record');
 perform pg_temp.ex_assert(not exists(select 1 from jsonb_array_elements(state->'records') a join jsonb_array_elements(page->'records') b on a->>'id'=b->>'id'),'cursor does not duplicate records');
 state:=public.kshms_project_execution_state(c,project,'round');perform pg_temp.ex_assert(jsonb_array_length(state->'records')=2 and state->'next'='null'::jsonb,'foreign project pages do not pollute selected project');
 perform pg_temp.ex_assert(state#>>'{project,locked}'='true','locked project remains readable and is marked read-only');
 details:=public.kshms_execution_detail(c,current_setting('ks.exec.locked_draft')::uuid);perform pg_temp.ex_reject(format('select public.kshms_execution_command(%L,''save'',%L,%L::jsonb)',c,gen_random_uuid(),details->'record'),'42501');
 perform set_config('request.jwt.claim.sub',current_setting('ks.exec.admin'),true);perform public.kshms_command(c,'access',jsonb_build_object('user_id',current_setting('ks.exec.worker'),'role','reader','enabled',false));
 perform set_config('request.jwt.claim.sub',current_setting('ks.exec.worker'),true);perform pg_temp.ex_reject(format('select public.kshms_project_execution_state(%L,%L,''round'')',c,project),'42501');perform pg_temp.ex_reject(format('select public.kshms_execution_tasks(%L)',c),'42501');
end$$;
set local role anon;
do $$begin perform pg_temp.ex_reject(format('select public.kshms_project_execution_state(%L,%L,''round'')',current_setting('ks.exec.company'),current_setting('ks.exec.project')),'42501');perform pg_temp.ex_reject(format('select public.kshms_execution_tasks(%L)',current_setting('ks.exec.company')),'42501');end$$;
reset role;
select pg_temp.ex_assert((select data::text=current_setting('ks.exec.project.data') from public.projects where id=current_setting('ks.exec.project')::uuid),'project/checklist/signature JSON preserved');
select pg_temp.ex_assert((select count(*)=0 from public.kshms_notification_outbox where company_id=current_setting('ks.exec.company')::uuid and notification_kind='deviation'),'control assignment alone creates no deviation email');
select pg_temp.ex_assert((select count(*)>0 from public.kshms_notification_outbox where company_id=current_setting('ks.exec.company')::uuid and notification_kind in('round','risk')),'control assignments also create responsible email notifications');
select 'PASS – all synthetic rows rolled back' as result,current_setting('ks.exec.checks')::integer as assertions;
rollback;
