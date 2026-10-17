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
create function pg_temp.ff_assert(ok boolean,label text) returns void language plpgsql as $$begin if ok is distinct from true then raise exception 'FIELD QA: %',label;end if;perform set_config('ff.count',(coalesce(nullif(current_setting('ff.count',true),''),'0')::int+1)::text,true);end$$;
create function pg_temp.ff_reject(q text,label text) returns void language plpgsql as $$declare rejected boolean:=false;begin begin execute q;exception when others then rejected:=true;end;perform pg_temp.ff_assert(rejected,label);end$$;
set local role authenticated;
do $$declare company uuid:=current_setting('ks.checklist.company')::uuid;admin_id uuid:=current_setting('ks.checklist.admin')::uuid;worker uuid:=current_setting('ks.checklist.employee')::uuid;pid uuid:=current_setting('ks.checklist.project')::uuid;
 f1 uuid:=gen_random_uuid();f2 uuid:=gen_random_uuid();f3 uuid:=gen_random_uuid();f4 uuid:=gen_random_uuid();p1 uuid:=gen_random_uuid();p2 uuid:=gen_random_uuid();tid uuid:=gen_random_uuid();rid uuid:=gen_random_uuid();roundid uuid:=gen_random_uuid();nonce uuid:=gen_random_uuid();fields jsonb;content jsonb;v jsonb;def jsonb;payload jsonb;r jsonb;stamp jsonb;snapshot jsonb;vals jsonb;roundcontent jsonb;begin
 perform set_config('request.jwt.claim.sub',current_setting('ks.checklist.sys'),true);perform public.kshms_activate(company,true);perform set_config('request.jwt.claim.sub',admin_id::text,true);
 fields:=jsonb_build_array(jsonb_build_object('id',f1,'label','Trengs tillatelse?','type','yesno','required',true),jsonb_build_object('id',f2,'label','Tillatelsesnummer','type','text','required',true,'when',jsonb_build_object('field_id',f1,'equals','Ja')),jsonb_build_object('id',f3,'label','Valgfri merknad','type','text','required',false),jsonb_build_object('id',f4,'label','Min egen før-start-bekreftelse','type','confirmation','required',true));
 content:=jsonb_build_object('title','QA fleksibel kontroll','trade','Felles – alle fag','instructions','QA','points',jsonb_build_array(jsonb_build_object('id',p1,'title','Før start','guidance','','image_required',false,'comment_required',false,'allow_na',false,'fields',fields),jsonb_build_object('id',p2,'title','Etter arbeid','guidance','','image_required',false,'comment_required',false)));
 v:=public.kshms_checklist_command(company,'publish',gen_random_uuid(),jsonb_build_object('id',tid,'revision',0,'content',content))->'version';
 perform pg_temp.ff_assert(v#>>'{content,trade}'='Felles – alle fag' and v#>'{content,points,0,fields}'=fields,'shared trade and exact typed edition');
 update public.projects set data=jsonb_set(data,'{project,kshmsChecklistInstances}',jsonb_build_array(jsonb_build_object('category','QA fields','version_id',v->>'id','content',v->'content'))) where id=pid;
 def:=jsonb_build_object('category','QA fields','source_version_id',v->>'id','items','["Før start","Etter arbeid"]'::jsonb,'requirements',jsonb_build_object('Før start',jsonb_build_object('guidance','','image_required',false,'comment_required',false,'allow_na',false,'fields',fields),'Etter arbeid',jsonb_build_object('guidance','','image_required',false,'comment_required',false)));
 vals:=jsonb_build_object(f1::text,'Ja',f4::text,jsonb_build_object('confirmed',true,'confirmation_id',nonce,'signed_by',admin_id,'signed_at','2000-01-01'));
 payload:=jsonb_build_object('id',rid,'revision',0,'definition',def,'answers',jsonb_build_object('Før start',jsonb_build_object('status','Ok','values',vals),'Etter arbeid','{}'::jsonb));
 perform set_config('request.jwt.claim.sub',worker::text,true);
 perform pg_temp.ff_assert(not (public.get_kshms_context()->>'enabled')::boolean,'project worker has no personal KS/HMS grant');
 perform pg_temp.ff_reject(format('select public.project_checklist_command(%L,%L,''save'',%L,%L::jsonb)',company,pid,gen_random_uuid(),payload),'cannot sign with required conditional answer missing');
 vals:=vals||jsonb_build_object(f2::text,'T-17');payload:=jsonb_set(payload,array['answers','Før start','values'],vals);
 r:=public.project_checklist_command(company,pid,'save',gen_random_uuid(),payload);stamp:=r#>array['run','answers','Før start','values',f4::text];
 perform pg_temp.ff_assert(stamp->>'signed_by'=worker::text and (stamp->>'signed_at')::timestamptz>now()-interval '1 minute','server ignores forged signer and time');
 perform pg_temp.ff_assert(stamp->>'content_hash' is not null and stamp->>'confirmation_id'=nonce::text,'signed prefix and explicit confirmation ID retained');
 perform pg_temp.ff_assert(r#>>'{run,status}'='draft' and r#>>'{run,answers,Etter arbeid,status}' is null,'pre-start save does not require after-work answers');
 payload:=payload||jsonb_build_object('revision',1);payload:=jsonb_set(payload,'{answers,Etter arbeid}','{"status":"Ok","comment":"Etterkontroll"}');
 r:=public.project_checklist_command(company,pid,'save',gen_random_uuid(),payload);
 perform pg_temp.ff_assert(r#>array['run','answers','Før start','values',f4::text]=stamp,'after-work answer does not rewrite pre-start evidence');
 payload:=payload||jsonb_build_object('revision',2);payload:=jsonb_set(payload,array['answers','Før start','values',f2::text],'"Changed"');
 perform pg_temp.ff_reject(format('select public.project_checklist_command(%L,%L,''save'',%L,%L::jsonb)',company,pid,gen_random_uuid(),payload),'cannot retain stale confirmation on changed prefix');
 payload:=jsonb_set(payload,array['answers','Før start','values',f4::text],jsonb_build_object('confirmed',true,'confirmation_id',gen_random_uuid()));
 r:=public.project_checklist_command(company,pid,'complete',gen_random_uuid(),payload);snapshot:=r->'run';
 perform pg_temp.ff_assert(r#>>'{run,status}'='completed' and r#>array['run','answers','Før start','values',f4::text,'content_hash']<>stamp->'content_hash','explicit fresh confirmation binds changed values at completion');
 perform pg_temp.ff_reject(format('select public.project_checklist_command(%L,%L,''save'',%L,%L::jsonb)',company,pid,gen_random_uuid(),payload||jsonb_build_object('revision',3)),'completed run immutable');
 perform pg_temp.ff_reject(format('select public.project_checklist_state(%L,%L)',gen_random_uuid(),pid),'foreign company denied');
 -- Same edition runs through KS/HMS with canonical typed fields and stamps.
 perform set_config('request.jwt.claim.sub',admin_id::text,true);
 roundcontent:=jsonb_build_object('title','QA typed standalone','workplace','QA','planned_on',current_date,'responsible_id',admin_id,'participants','QA','review','QA','points',v#>'{content,points}','answers',jsonb_build_object(p1::text,jsonb_build_object('status','ok','values',jsonb_build_object(f1::text,'Nei',f4::text,jsonb_build_object('confirmed',true,'confirmation_id',gen_random_uuid()))),p2::text,jsonb_build_object('status','ok')),'acceptance',jsonb_build_object('low_max',null,'medium_max',null,'description','','confirmed',false));
 r:=public.kshms_execution_command(company,'save',gen_random_uuid(),jsonb_build_object('id',roundid,'kind','round','revision',0,'template_version_id',v->>'id','content',roundcontent));
 r:=public.kshms_execution_detail(company,roundid);
 perform pg_temp.ff_assert(r#>array['record','content','points','0','fields']=fields and r#>>array['record','content','answers',p1::text,'values',f4::text,'signed_by']=admin_id::text,'standalone retains typed fields and server identity');
 perform pg_temp.ff_assert(exists(select 1 from jsonb_array_elements(public.project_checklist_state(company,pid)->'runs') q(value) where q.value=snapshot),'standalone does not mutate completed project snapshot');
 perform pg_temp.ff_reject(format('select public.kshms_checklist_command(%L,''save'',%L,%L::jsonb)',company,gen_random_uuid(),jsonb_build_object('id',tid,'revision',1,'content',jsonb_set(content,array['points','0','fields','1','when','field_id'],to_jsonb(f4::text)))),'forward/cyclic dependency rejected');
 perform pg_temp.ff_reject(format('select public.project_checklist_command(%L,%L,''save'',%L,%L::jsonb)',company,pid,gen_random_uuid(),jsonb_set(payload||jsonb_build_object('id',gen_random_uuid(),'revision',0,'predecessor_id',rid),array['definition','requirements','Før start','fields','0','required'],'false')),'pinned requirements cannot be relaxed');
end$$;
reset role;
do $$declare f jsonb;v jsonb;fid uuid:=gen_random_uuid();s uuid:=gen_random_uuid();begin
 f:=jsonb_build_array(jsonb_build_object('id',fid,'label','Minutter','type','number','required',true,'min',60));
 perform pg_temp.ff_assert(kshms_private.checklist_values(f,jsonb_build_object(fid::text,'60'),true)->>fid::text='60','minimum number accepted');
 perform pg_temp.ff_reject(format('select kshms_private.checklist_values(%L::jsonb,%L::jsonb,true)',f,jsonb_build_object(fid::text,'59')),'number below minimum rejected');
 for f in select jsonb_build_array(jsonb_build_object('id',fid,'label','QA','type',t,'required',true)) from unnest(array['date','time','number']) t loop
  v:=to_jsonb(case f#>>'{0,type}' when 'date' then '2026-02-30' when 'time' then '24:00' else 'NaN' end);
  perform pg_temp.ff_reject(format('select kshms_private.checklist_values(%L::jsonb,%L::jsonb,true)',f,jsonb_build_object(fid::text,v)),'invalid typed value rejected');
 end loop;
 f:=jsonb_build_array(jsonb_build_object('id',fid,'label','Velg','type','multiple','required',true,'options','["A","B"]'::jsonb));
 perform pg_temp.ff_assert(kshms_private.checklist_values(f,jsonb_build_object(fid::text,'["B","A"]'::jsonb),true)->fid::text='["A","B"]'::jsonb,'multiple choices use canonical order');
 perform pg_temp.ff_reject(format('select kshms_private.checklist_values(%L::jsonb,%L::jsonb,true)',f,jsonb_build_object(fid::text,'["A","A"]'::jsonb)),'duplicate choices rejected');
 perform pg_temp.ff_reject(format('select kshms_private.checklist_values(%L::jsonb,%L::jsonb,true)',f,jsonb_build_object(s::text,'forged')),'unknown field rejected');
 f:=jsonb_set(f,'{0,type}','"single"');
 perform pg_temp.ff_assert(kshms_private.checklist_values(f,jsonb_build_object(fid::text,'A'),true)->>fid::text='A','single selection accepted');
 perform pg_temp.ff_reject(format('select kshms_private.checklist_values(%L::jsonb,%L::jsonb,true)',f,jsonb_build_object(fid::text,'forged')),'foreign choice rejected');
end$$;
select pg_temp.ff_assert(not has_function_privilege('authenticated','kshms_private.checklist_sign_values(jsonb,jsonb,jsonb,jsonb)','execute'),'private signing helper closed');
select 'PASS – flexible fields: '||current_setting('ff.count')||' PostgreSQL assertions; all synthetic rows rolled back' result;
rollback;
