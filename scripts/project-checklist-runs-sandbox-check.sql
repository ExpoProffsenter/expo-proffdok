-- Bounded Sandbox regression. Synthetic firm/users/projects only; all roll back.
begin;
set local statement_timeout='10s';
set local lock_timeout='2s';
do $$ declare company uuid:=gen_random_uuid(); uid uuid; sys uuid; kind text; pid uuid;begin
 insert into public.sales_company_scopes(id,normalized_name,display_name) values(company,public.sales_normalize_company_name('ks-checklist-qa-'||company),'ks-checklist-qa-'||company);
 perform set_config('ks.checklist.company',company::text,true);
 select id into sys from public.profiles where system_role='systemadmin' and approved and not coalesce(deactivated,false) limit 1;assert sys is not null;
 perform set_config('ks.checklist.sys',sys::text,true);
 foreach kind in array array['admin','employee','responsible'] loop
  uid:=gen_random_uuid();perform set_config('ks.checklist.'||kind,uid::text,true);
  insert into auth.users(id,aud,role,email,created_at,updated_at,raw_app_meta_data,raw_user_meta_data) values(uid,'authenticated','authenticated','ks-checklist-qa-'||uid||'@example.invalid',now(),now(),'{}',jsonb_build_object('full_name','Checklist QA '||kind));
  insert into public.profiles(id,email,company_name,approved,deactivated,role,company_role) values(uid,'ks-checklist-qa-'||uid||'@example.invalid','ks-checklist-qa-'||company,true,false,case when kind='admin' then 'admin' else 'member' end,case when kind='admin' then 'firmaadmin' else 'ansatt' end)
  on conflict(id) do update set company_name=excluded.company_name,approved=true,deactivated=false,role=excluded.role,company_role=excluded.company_role,system_role=null;
  insert into public.sales_company_memberships(company_id,user_id,is_primary,workspace_role) values(company,uid,true,case when kind='admin' then 'firmaadmin' else 'ansatt' end) on conflict(company_id,user_id) do update set workspace_role=excluded.workspace_role;
  insert into public.user_active_company_scope(user_id,company_id) values(uid,company) on conflict(user_id) do update set company_id=excluded.company_id;
  insert into public.user_module_access(user_id,module_key) values(uid,'projects') on conflict do nothing;
  if kind='employee' then
   pid:=gen_random_uuid();perform set_config('ks.checklist.project',pid::text,true);
   insert into public.projects(id,user_id,company_scope_id,title,data) values(pid,uid,company,'Checklist QA project','{"project":{"projectName":"Checklist QA","projectDeviations":[{"id":"legacy","status":"Åpent"}]},"checklist":{"Legacy":{"Point":{"status":"Avvik","comment":"keep"}}},"overtagelse":{"signKunde":"keep"}}');
  end if;
 end loop;
end $$;
set local role authenticated;
do $$ declare company uuid:=current_setting('ks.checklist.company')::uuid;employee uuid:=current_setting('ks.checklist.employee')::uuid;
 admin_id uuid:=current_setting('ks.checklist.admin')::uuid;pid uuid:=current_setting('ks.checklist.project')::uuid;
 rid uuid:=gen_random_uuid();reqid uuid:=gen_random_uuid();payload jsonb;r jsonb;previous jsonb;state jsonb;dev jsonb;version jsonb;point uuid:=gen_random_uuid();definition jsonb;n integer:=0;begin
 perform set_config('request.jwt.claim.sub',employee::text,true);
 assert not (public.get_kshms_context()->>'enabled')::boolean; n:=n+1;
 state:=public.project_checklist_state(company,pid);assert state->'context'->>'user_id'=employee::text and jsonb_array_length(state->'runs')=0;n:=n+1;
 payload:=jsonb_build_object('id',rid,'revision',0,'predecessor_id',null,
  'definition',jsonb_build_object('category','Egne sjekkpunkter – Rørlegger','items',jsonb_build_array('Kontroller rør'),'requirements',jsonb_build_object('Kontroller rør',jsonb_build_object('comment_required',true))),
  'answers',jsonb_build_object('Kontroller rør',jsonb_build_object('status','Ok')));
 begin perform public.project_checklist_command(company,pid,'complete',gen_random_uuid(),payload);raise exception 'Missing comment completed';exception when others then if sqlerrm='Missing comment completed' then raise;end if;if sqlerrm not like 'Legg til kommentar:%' then raise exception 'Expected required-comment error, got: %',sqlerrm;end if;n:=n+1;end;
 r:=public.project_checklist_command(company,pid,'save',reqid,payload);assert r->'run'->>'revision'='1' and r->'run'->>'status'='draft';n:=n+1;
 assert public.project_checklist_command(company,pid,'save',reqid,payload)=r,'Lost-response retry changed draft';n:=n+1;
 begin perform public.project_checklist_command(company,pid,'complete',reqid,payload);raise exception 'Reused request changed content';exception when serialization_failure then n:=n+1;end;
 previous:=payload||jsonb_build_object('revision',1);payload:=previous;
 perform set_config('request.jwt.claim.sub',admin_id::text,true);
 payload:=jsonb_set(payload,'{answers,Kontroller rør,comment}','"Kollega kontrollerte"');
 r:=public.project_checklist_command(company,pid,'save',gen_random_uuid(),payload);assert r->'run'->>'updated_by'=admin_id::text and r->'run'->>'revision'='2';n:=n+1;
 perform set_config('request.jwt.claim.sub',employee::text,true);
 begin perform public.project_checklist_command(company,pid,'save',gen_random_uuid(),previous);raise exception 'Stale colleague overwrote draft';exception when serialization_failure then n:=n+1;end;
 payload:=payload||jsonb_build_object('revision',2);reqid:=gen_random_uuid();r:=public.project_checklist_command(company,pid,'complete',reqid,payload);
 assert r->'run'->>'status'='completed' and r->'run'->>'completed_by'=employee::text and r->'run'->'completed_identity'->>'id'=employee::text;n:=n+1;
 assert public.project_checklist_command(company,pid,'complete',reqid,payload)=r,'Retry duplicated completion';n:=n+1;
 perform set_config('ks.checklist.completed',rid::text,true);
 payload:=payload||jsonb_build_object('id',gen_random_uuid(),'revision',0,'predecessor_id',rid,'answers',jsonb_build_object('Kontroller rør',jsonb_build_object('status','Avvik','comment','Ny kontroll','photos',jsonb_build_array(jsonb_build_object('id','photo','url','https://example.invalid/photo.png','name','bevis')))));
 r:=public.project_checklist_command(company,pid,'save',gen_random_uuid(),payload);assert r->'run'->>'status'='draft';n:=n+1;
 payload:=jsonb_set(payload||jsonb_build_object('revision',1),'{definition,items}','["Kontroller rør","Kontroller merking"]');
 payload:=jsonb_set(payload,'{answers,Kontroller merking}','{"status":"Ok"}');r:=public.project_checklist_command(company,pid,'save',gen_random_uuid(),payload);
 assert jsonb_array_length(r->'run'->'definition'->'items')=2,'Could not add own point to draft';n:=n+1;
 payload:=payload||jsonb_build_object('revision',2);r:=public.project_checklist_command(company,pid,'complete',gen_random_uuid(),payload);
 assert r->'run'->'answers'->'Kontroller rør'->>'status'='Avvik','Completion silently closed deviation';n:=n+1;
 state:=public.project_checklist_state(company,pid);assert jsonb_array_length(state->'runs')=2 and state->'runs'->1->'answers'->'Kontroller rør'->>'comment'='Kollega kontrollerte';n:=n+1;
 update public.projects set data=jsonb_set(data,'{checklist}','{"Egne sjekkpunkter – Rørlegger":{"Kontroller rør":{"status":"Ok"}},"Legacy":{"Point":{"status":"Avvik","comment":"keep"}}}') where id=pid;
 assert (select data#>>'{checklist,Egne sjekkpunkter – Rørlegger,Kontroller rør,status}' from public.projects where id=pid)='Avvik','Ordinary stale autosave overwrote popup';n:=n+1;
 assert (select data#>>'{checklist,Egne sjekkpunkter – Rørlegger,Kontroller rør,photos,0,name}' from public.projects where id=pid)='bevis';n:=n+1;
 assert (select data#>>'{project,projectDeviations,0,status}' from public.projects where id=pid)='Åpent' and (select data#>>'{overtagelse,signKunde}' from public.projects where id=pid)='keep';n:=n+1;
 begin perform public.project_checklist_state(gen_random_uuid(),pid);raise exception 'Foreign firm read history';exception when insufficient_privilege then n:=n+1;end;
 begin perform public.project_checklist_command(company,gen_random_uuid(),'save',gen_random_uuid(),payload);raise exception 'Foreign project wrote history';exception when insufficient_privilege then n:=n+1;end;
 -- Existing KS/HMS closure remains authoritative over the project mirror.
 perform set_config('request.jwt.claim.sub',current_setting('ks.checklist.sys'),true);perform public.kshms_activate(company,true);
 perform set_config('request.jwt.claim.sub',admin_id::text,true);
 dev:=public.kshms_deviation_command(company,'create',jsonb_build_object('request_id',gen_random_uuid(),'title','Checklist source regression','event','Synthetic checklist control found an issue','category','quality','responsible_id',admin_id,'due_on',current_date,'source_kind','checklist','project_id',pid,'source_group','Egne sjekkpunkter – Rørlegger','source_item','Kontroller rør'));
 assert (select data#>>'{checklist,Egne sjekkpunkter – Rørlegger,Kontroller rør,ks_deviation_id}' from public.projects where id=pid)=dev->>'id';n:=n+1;
 dev:=public.kshms_deviation_command(company,'close',jsonb_build_object('id',dev->>'id','revision',dev->'revision','controlled',true,'cause','Synthetic cause','improvement_action','Synthetic completed measure','control_note','Synthetic controlled result'));
 update public.projects set data=jsonb_set(data,'{project,projectName}','"Changed title"') where id=pid;
 assert (select data#>>'{checklist,Egne sjekkpunkter – Rørlegger,Kontroller rør,status}' from public.projects where id=pid)='Lukket avvik','Mirror reopened authoritative KS/HMS closure';n:=n+1;
 assert public.project_checklist_state(company,pid)->'runs'->0->'answers'->'Kontroller rør'->>'status'='Avvik','Later KS/HMS closure mutated completed inspection';n:=n+1;
 -- Imported requirements and version cannot be changed at first save.
 version:=public.kshms_checklist_command(company,'publish',gen_random_uuid(),jsonb_build_object('id',gen_random_uuid(),'revision',0,'content',jsonb_build_object('title','QA imported control','trade','Rørlegger','instructions','QA','points',jsonb_build_array(jsonb_build_object('id',point,'title','Imported point','guidance','QA','image_required',true,'comment_required',false)))))->'version';
 update public.projects set data=jsonb_set(data,'{project,kshmsChecklistInstances}',jsonb_build_array(jsonb_build_object('category','QA imported','version_id',version->'id','content',version->'content'))) where id=pid;
 definition:=jsonb_build_object('category','QA imported','items',jsonb_build_array('Imported point'),'source_version_id',version->'id','requirements',jsonb_build_object('Imported point',jsonb_build_object('image_required',true,'comment_required',false,'guidance','QA')));
 payload:=jsonb_build_object('id',gen_random_uuid(),'revision',0,'predecessor_id',null,'definition',definition,'answers',jsonb_build_object('Imported point',jsonb_build_object('status','Ok')));
 begin perform public.project_checklist_command(company,pid,'complete',gen_random_uuid(),payload);raise exception 'Missing required imported photo accepted';exception when others then if sqlerrm='Missing required imported photo accepted' then raise;end if;assert sqlerrm like 'Legg til bilde:%';n:=n+1;end;
 begin perform public.project_checklist_command(company,pid,'save',gen_random_uuid(),jsonb_set(payload,'{definition,requirements,Imported point,image_required}','false'));raise exception 'Changed imported requirement accepted';exception when others then if sqlerrm='Changed imported requirement accepted' then raise;end if;assert sqlerrm like 'Den innhentede malutgaven%';n:=n+1;end;
 r:=public.project_checklist_command(company,pid,'save',gen_random_uuid(),payload);assert r->'run'->'definition'=definition;n:=n+1;
 perform set_config('ks.checklist.count',n::text,true);
end $$;
reset role;
do $$ declare pid uuid:=current_setting('ks.checklist.project')::uuid;company uuid:=current_setting('ks.checklist.company')::uuid;
 n integer:=current_setting('ks.checklist.count')::integer;employee uuid:=current_setting('ks.checklist.employee')::uuid;begin
 begin update kshms_private.project_checklist_runs set answers='{}' where id=current_setting('ks.checklist.completed')::uuid;raise exception 'Completed answers mutated';exception when insufficient_privilege then n:=n+1;end;
 begin delete from kshms_private.project_checklist_runs where id=current_setting('ks.checklist.completed')::uuid;raise exception 'Completed control deleted';exception when insufficient_privilege then n:=n+1;end;
 assert not has_table_privilege('authenticated','kshms_private.project_checklist_runs','select') and not has_table_privilege('authenticated','kshms_private.project_checklist_runs','update');n:=n+1;
 assert not has_function_privilege('anon','public.project_checklist_state(uuid,uuid)','execute') and not has_function_privilege('anon','public.project_checklist_command(uuid,uuid,text,uuid,jsonb)','execute');n:=n+1;
 update public.projects set locked=true where id=pid;perform set_config('request.jwt.claim.sub',employee::text,true);
 begin perform public.project_checklist_command(company,pid,'save',gen_random_uuid(),'{}');raise exception 'Locked project saved';exception when insufficient_privilege then n:=n+1;end;
 update public.projects set locked=false where id=pid;
 perform set_config('request.jwt.claim.sub',current_setting('ks.checklist.sys'),true);update public.profiles set deactivated=true where id=employee;perform set_config('request.jwt.claim.sub',employee::text,true);
 begin perform public.project_checklist_state(company,pid);raise exception 'Deactivated user read controls';exception when insufficient_privilege then n:=n+1;end;
 perform set_config('ks.checklist.count',n::text,true);
end $$;
select 'PASS: '||current_setting('ks.checklist.count')||' project checklist assertions; all fixtures rolled back' as result;
rollback;
