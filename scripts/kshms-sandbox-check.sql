-- Sandbox only. Synthetic identities and every data change roll back.
begin;
do $$ declare a uuid:=gen_random_uuid(); b uuid:=gen_random_uuid(); uid uuid; k text; sys uuid; begin
 insert into public.sales_company_scopes(id,normalized_name,display_name) values(a,public.sales_normalize_company_name('kshms-qa-'||a),'kshms-qa-'||a),(b,public.sales_normalize_company_name('kshms-qa-'||b),'kshms-qa-'||b);
 perform set_config('kshms.test.company_a',a::text,true); perform set_config('kshms.test.company_b',b::text,true);
 select id into sys from public.profiles where system_role='systemadmin' and approved and not coalesce(deactivated,false) limit 1;
 assert sys is not null; perform set_config('kshms.test.sys',sys::text,true);
 foreach k in array array['admin','editor','reader','other'] loop
  uid:=gen_random_uuid(); perform set_config('kshms.test.'||k,uid::text,true);
  insert into auth.users(id,aud,role,email,created_at,updated_at,raw_app_meta_data,raw_user_meta_data)
   values(uid,'authenticated','authenticated','ks-qa-'||uid||'@example.invalid',now(),now(),'{}',jsonb_build_object('full_name','QA '||k));
  insert into public.profiles(id,email,company_name,approved,deactivated,role,company_role)
   values(uid,'ks-qa-'||uid||'@example.invalid','kshms-qa-'||case when k='other' then b else a end,true,false,case when k in ('admin','other') then 'admin' else 'member' end,case when k in ('admin','other') then 'firmaadmin' else 'ansatt' end)
   on conflict(id) do update set company_name=excluded.company_name,approved=true,deactivated=false,role=excluded.role,company_role=excluded.company_role,system_role=null;
  insert into public.sales_company_memberships(company_id,user_id,is_primary,workspace_role) values(case when k='other' then b else a end,uid,true,case when k in ('admin','other') then 'firmaadmin' else 'ansatt' end) on conflict(company_id,user_id) do update set workspace_role=excluded.workspace_role;
  insert into public.user_active_company_scope(user_id,company_id) values(uid,case when k='other' then b else a end) on conflict(user_id) do update set company_id=excluded.company_id;
 end loop;
end $$;
set local role authenticated;
do $$ declare a uuid:=current_setting('kshms.test.company_a')::uuid; b uuid:=current_setting('kshms.test.company_b')::uuid;
 admin_id uuid:=current_setting('kshms.test.admin')::uuid; editor_id uuid:=current_setting('kshms.test.editor')::uuid; reader_id uuid:=current_setting('kshms.test.reader')::uuid;
 sys_id uuid:=current_setting('kshms.test.sys')::uuid; other_id uuid:=current_setting('kshms.test.other')::uuid;
 draft jsonb:='{"title":"QA routine","chapter":"QA","goal":"Goal","responsibility":"Responsibility","procedure":"Procedure","documentation":"Evidence","confirmation":"Read and clarify","references":[]}';
 r jsonb; v1 jsonb; v2 jsonb; s jsonb; state jsonb; snapshot jsonb; n int:=0;
 statement text:='Jeg har gjennomgått denne rutineversjonen, forstår mitt ansvar og vil følge rutinen. Jeg ber om forklaring eller nødvendig opplæring dersom noe er uklart, og melder fra om farlige forhold og avvik. Bekreftelsen dokumenterer gjennomgang; den erstatter ikke opplæring eller faktisk utførelse.';
begin
 assert current_user='authenticated','Scenario must run with actual authenticated DB privileges';
 perform set_config('request.jwt.claim.sub',admin_id::text,true);
 assert not (public.get_kshms_context()->>'enabled')::boolean,'Disabled company exposed'; n:=n+1;
 begin perform public.kshms_get_state(a);raise exception 'Disabled module read allowed';exception when insufficient_privilege then n:=n+1;end;
 begin perform public.kshms_activate(a,true);raise exception 'Firmaadmin activated module';exception when insufficient_privilege then n:=n+1;end;
 perform set_config('request.jwt.claim.sub',sys_id::text,true);
 perform public.kshms_activate(a,true);perform public.kshms_activate(b,true);
 -- Systemadmin can activate unrelated firm but cannot read its content.
 begin perform public.kshms_get_state(a);raise exception 'Systemadmin support bypass';exception when insufficient_privilege then n:=n+1;end;
 perform set_config('request.jwt.claim.sub',admin_id::text,true);
 assert (public.get_kshms_context()->>'publish')::boolean and (public.get_kshms_context()->>'administer')::boolean; n:=n+1;
 perform public.kshms_command(a,'access',jsonb_build_object('user_id',editor_id,'role','responsible','enabled',true));
 perform public.kshms_command(a,'access',jsonb_build_object('user_id',reader_id,'role','reader','enabled',true));
 begin perform public.kshms_command(a,'access',jsonb_build_object('user_id',other_id,'role','reader','enabled',true));raise exception 'Cross-firm grant';exception when others then if sqlerrm='Cross-firm grant' then raise;end if;n:=n+1;end;
 perform public.kshms_command(a,'settings',jsonb_build_object('revision',0,'trades',jsonb_build_array('mur_flis','vvs'),'activities','våtrom','responsible_user_id',editor_id));
 s:=public.kshms_get_state(a)->'settings';assert jsonb_array_length(s->'trades')=2;n:=n+1;
 begin perform public.kshms_command(a,'settings',jsonb_build_object('revision',0,'trades',jsonb_build_array('maler'),'responsible_user_id',editor_id));raise exception 'Stale settings allowed';exception when serialization_failure then n:=n+1;end;
 perform set_config('request.jwt.claim.sub',editor_id::text,true);
 r:=public.kshms_command(a,'save',jsonb_build_object('draft',draft));assert r->>'revision'='1';n:=n+1;
 assert (public.get_kshms_context()->>'publish')::boolean and not (public.get_kshms_context()->>'administer')::boolean,'Responsible publication/admin capabilities mixed';n:=n+1;
 begin perform public.kshms_command(a,'publish',jsonb_build_object('id',r->>'id','revision',1,'change_summary',''));raise exception 'Empty publication assessment';exception when others then if sqlerrm<>'Explain the publication/change' then raise;end if;n:=n+1;end;
 begin perform public.kshms_command(a,'access',jsonb_build_object('user_id',reader_id,'role','responsible','enabled',true));raise exception 'Editor granted access';exception when insufficient_privilege then n:=n+1;end;
 begin perform public.kshms_command(a,'archive',jsonb_build_object('id',r->>'id','revision',1));raise exception 'Editor archived';exception when insufficient_privilege then n:=n+1;end;
 begin perform public.kshms_command(a,'settings',jsonb_build_object('revision',1,'trades',jsonb_build_array('vvs'),'responsible_user_id',reader_id));raise exception 'Editor appointed responsible';exception when insufficient_privilege then n:=n+1;end;
 begin perform public.kshms_command(a,'save',jsonb_build_object('draft',jsonb_set(draft,'{references}','[{"url":"https://example.invalid","kind":"law","checked_on":"2099-01-01"}]')));raise exception 'Future reference accepted';exception when others then if sqlerrm='Future reference accepted' then raise;end if;n:=n+1;end;
 perform set_config('request.jwt.claim.sub',reader_id::text,true);
 state:=public.kshms_get_state(a);assert jsonb_array_length(state->'routines')=0,'Reader saw unpublished draft';assert jsonb_array_length(state->'members')=0,'Reader saw roster';n:=n+2;
 begin perform public.kshms_command(a,'save',jsonb_build_object('draft',draft));raise exception 'Reader edited';exception when insufficient_privilege then n:=n+1;end;
 begin perform public.kshms_command(a,'publish',jsonb_build_object('id',r->>'id','revision',1,'change_summary','Reader cannot approve'));raise exception 'Reader published';exception when insufficient_privilege then n:=n+1;end;
 perform set_config('request.jwt.claim.sub',editor_id::text,true);
 v1:=public.kshms_command(a,'publish',jsonb_build_object('id',r->>'id','revision',1,'change_summary','Initial QA publication','requires_ack',true));
 assert (v1->>'published_by')::uuid=editor_id and v1->'content'=draft and v1->>'number'='1' and length(v1->>'content_hash')=64; n:=n+1;
 assert v1->'publisher_identity'->>'name'='QA editor' and (v1->'publisher_identity'->>'id')::uuid=editor_id,'Publisher identity not captured';n:=n+1;
 assert jsonb_array_length(public.kshms_get_state(a)->'acknowledgments')=0,'Publishing without own confirmation added an ack';n:=n+1;
 perform set_config('request.jwt.claim.sub',reader_id::text,true);
 state:=public.kshms_get_state(a);assert jsonb_array_length(state->'versions')=1 and not ((state->'routines'->0)?'draft');n:=n+1;
 assert state->'versions'->0->'publisher_identity'->>'name'='QA editor' and jsonb_array_length(state->'members')=0,'Reader identity projection exposed roster or omitted publisher';n:=n+1;
 perform public.kshms_command(a,'ack',jsonb_build_object('version_id',v1->>'id','statement',statement,'user_id',editor_id,'acknowledged_at','2000-01-01'));
 state:=public.kshms_get_state(a);assert (state->'acknowledgments'->0->>'user_id')::uuid=reader_id and (state->'acknowledgments'->0->>'acknowledged_at')::timestamptz>=now()-interval '1 minute';n:=n+1;
 assert state->'acknowledgments'->0->'user_identity'->>'name'='QA reader' and (state->'acknowledgments'->0->'user_identity'->>'id')::uuid=reader_id,'Ack identity accepted another employee';n:=n+1;
 perform public.kshms_command(a,'ack',jsonb_build_object('version_id',v1->>'id','statement',statement));assert jsonb_array_length(public.kshms_get_state(a)->'acknowledgments')=1,'Duplicate ack';n:=n+1;
 begin perform public.kshms_command(b,'publish',jsonb_build_object('id',r->>'id','revision',2,'change_summary','Wrong firm cannot publish'));raise exception 'Wrong expected company publish';exception when insufficient_privilege then n:=n+1;end;
 begin perform public.kshms_command(b,'ack',jsonb_build_object('version_id',v1->>'id','statement',statement));raise exception 'Wrong expected company';exception when insufficient_privilege then n:=n+1;end;
 perform set_config('request.jwt.claim.sub',other_id::text,true);
 state:=public.kshms_get_state(b);assert jsonb_array_length(state->'routines')=0;n:=n+1;
 begin perform public.kshms_command(b,'publish',jsonb_build_object('id',r->>'id','revision',2,'change_summary','Other firm cannot publish'));raise exception 'Cross-firm publish';exception when serialization_failure then n:=n+1;end;
 begin perform public.kshms_command(b,'save',jsonb_build_object('id',r->>'id','revision',2,'draft',draft));raise exception 'Cross-firm edit';exception when serialization_failure then n:=n+1;end;
 begin perform public.kshms_command(b,'ack',jsonb_build_object('version_id',v1->>'id','statement',statement));raise exception 'Cross-firm ack';exception when insufficient_privilege then n:=n+1;end;
 perform set_config('request.jwt.claim.sub',editor_id::text,true);
 draft:=jsonb_set(draft,'{procedure}','"Changed meaningful procedure"');
 r:=public.kshms_command(a,'save',jsonb_build_object('id',r->>'id','revision',2,'draft',draft));assert r->>'revision'='3';n:=n+1;
 begin perform public.kshms_command(a,'save',jsonb_build_object('id',r->>'id','revision',2,'draft',draft));raise exception 'Stale draft accepted';exception when serialization_failure then n:=n+1;end;
 perform set_config('request.jwt.claim.sub',admin_id::text,true);
 -- Invalid combined confirmation must roll the entire publication back.
 begin perform public.kshms_command(a,'publish',jsonb_build_object('id',r->>'id','revision',3,'change_summary','Invalid own confirmation','acknowledge_self',true,'self_statement','not the confirmation'));raise exception 'Invalid own statement published';exception when others then if sqlerrm<>'Own confirmation statement required' then raise;end if;n:=n+1;end;
 begin perform public.kshms_command(a,'publish',jsonb_build_object('id',r->>'id','revision',3,'change_summary','Missing own confirmation','acknowledge_self',true));raise exception 'Missing own statement published';exception when others then if sqlerrm<>'Own confirmation statement required' then raise;end if;n:=n+1;end;
 begin perform public.kshms_command(a,'publish',jsonb_build_object('id',r->>'id','revision',3,'change_summary','String boolean refused','acknowledge_self','true','self_statement',statement));raise exception 'Nonboolean choice accepted';exception when others then if sqlerrm<>'Explicit own confirmation must be a boolean' then raise;end if;n:=n+1;end;
 assert jsonb_array_length(public.kshms_get_state(a)->'versions')=1,'Invalid combined confirmation left a new version';n:=n+1;
 v2:=public.kshms_command(a,'publish',jsonb_build_object('id',r->>'id','revision',3,'change_summary','Changed QA publication','requires_ack',true,'acknowledge_self',true,'self_statement',statement,'user_id',reader_id,'acknowledged_at','2000-01-01'));
 state:=public.kshms_get_state(a);
 assert exists(select 1 from jsonb_array_elements(state->'acknowledgments') ack where (ack->>'user_id')::uuid=admin_id and ack->>'version_id'=v2->>'id' and ack->>'statement'=statement and ack->'user_identity'->>'name'='QA admin' and (ack->>'acknowledged_at')::timestamptz>=now()-interval '1 minute'),'Combined publication missed own exact confirmation';n:=n+1;
 assert not exists(select 1 from jsonb_array_elements(state->'acknowledgments') ack where (ack->>'user_id')::uuid<>admin_id and ack->>'version_id'=v2->>'id'),'Combined publication signed for another employee';n:=n+1;

 assert (v2->>'published_by')::uuid=admin_id and v2->>'number'='2' and v2->>'content_hash'<>v1->>'content_hash';n:=n+1;
 begin perform public.kshms_command(a,'review',jsonb_build_object('findings','Review finding','follow_up','Review follow-up','next_review_on',current_date+100));raise exception 'Admin signed responsible review';exception when insufficient_privilege then n:=n+1;end;
 perform set_config('request.jwt.claim.sub',reader_id::text,true);
 state:=public.kshms_get_state(a);assert jsonb_array_length(state->'versions')=2 and jsonb_array_length(state->'acknowledgments')=1 and state->'versions'->0->'content'=draft;n:=n+1;
 assert state->'versions'->1->'content'->>'procedure'='Procedure','Old version overwritten';n:=n+1;
 perform set_config('request.jwt.claim.sub',editor_id::text,true);
 state:=public.kshms_get_state(a);
 select jsonb_agg(jsonb_build_object('id',value->>'id','hash',value->>'content_hash') order by value->>'id') into snapshot from jsonb_array_elements(state->'versions') where value->>'number'='2';
 begin perform public.kshms_command(a,'review',jsonb_build_object('settings_revision',1,'version_snapshot','[]'::jsonb,'findings','Meaningful review findings','follow_up','Owner and followup date','next_review_on',current_date+100));raise exception 'Stale review snapshot';exception when serialization_failure then n:=n+1;end;
 begin perform public.kshms_command(a,'review',jsonb_build_object('settings_revision',1,'version_snapshot',snapshot,'findings','Meaningful review findings','follow_up','Owner and followup date','next_review_on',current_date+400));raise exception 'Annual product max not enforced';exception when others then if sqlerrm='Annual product max not enforced' then raise;end if;n:=n+1;end;
 perform public.kshms_command(a,'review',jsonb_build_object('settings_revision',1,'version_snapshot',snapshot,'findings','Meaningful review findings','follow_up','Owner and followup date','next_review_on',current_date+100));
 state:=public.kshms_get_state(a);assert (state->'reviews'->0->>'signed_by')::uuid=editor_id and state->'reviews'->0->'version_snapshot'=snapshot;n:=n+1;
 perform set_config('request.jwt.claim.sub',admin_id::text,true);
 perform public.kshms_command(a,'assign',jsonb_build_object('version_id',v2->>'id','user_id',reader_id));
 state:=public.kshms_get_state(a);assert jsonb_array_length(state->'assignments')=6,'Idempotent assignment';n:=n+1;
 -- Firmaadmin is eligible without a redundant grant, but annual signature
 -- authority still requires explicit appointment to this particular firm.
 assert not (state->'context'->>'responsible')::boolean,'Unappointed firmaadmin could sign';n:=n+1;
 assert exists(select 1 from jsonb_array_elements(state->'members') m where (m->>'id')::uuid=admin_id and m->>'workspace_role'='firmaadmin' and not (m->>'enabled')::boolean),'Firmaadmin without grant missing from candidate roster';n:=n+1;
 perform public.kshms_command(a,'settings',jsonb_build_object('revision',2,'trades',jsonb_build_array('vvs'),'responsible_user_id',admin_id));
 state:=public.kshms_get_state(a);assert (state->'context'->>'responsible')::boolean,'Explicit self-appointment failed';n:=n+1;
 assert exists(select 1 from jsonb_array_elements(state->'members') m where (m->>'id')::uuid=admin_id and not (m->>'enabled')::boolean),'Appointment silently created a member grant';n:=n+1;
 perform set_config('request.jwt.claim.sub',editor_id::text,true);
 assert not (public.get_kshms_context()->>'responsible')::boolean,'Previous responsible still designated';n:=n+1;
 begin perform public.kshms_command(a,'review',jsonb_build_object('settings_revision',3,'version_snapshot',snapshot,'findings','Meaningful review findings','follow_up','Owner and followup date','next_review_on',current_date+100));raise exception 'Previous responsible signed after replacement';exception when insufficient_privilege then n:=n+1;end;
 perform set_config('request.jwt.claim.sub',admin_id::text,true);
 perform public.kshms_command(a,'review',jsonb_build_object('settings_revision',3,'version_snapshot',snapshot,'findings','Firmaadmin reviewed exact active versions','follow_up','Firmaadmin follows up within agreed date','next_review_on',current_date+100));
 state:=public.kshms_get_state(a);assert jsonb_array_length(state->'reviews')=2 and exists(select 1 from jsonb_array_elements(state->'reviews') rv where (rv->>'signed_by')::uuid=admin_id and rv->'version_snapshot'=snapshot),'Appointed firmaadmin signature lost identity or versions';n:=n+1;
 perform public.kshms_command(a,'settings',jsonb_build_object('revision',4,'trades',jsonb_build_array('vvs'),'responsible_user_id',editor_id));
 assert not (public.get_kshms_context()->>'responsible')::boolean,'Removed firmaadmin designation retained signature permission';n:=n+1;
 begin perform public.kshms_command(a,'settings',jsonb_build_object('revision',5,'trades',jsonb_build_array('vvs'),'responsible_user_id',other_id));raise exception 'Other firm admin appointed';exception when others then if sqlerrm='Other firm admin appointed' then raise;end if;n:=n+1;end;
 begin perform public.kshms_command(a,'settings',jsonb_build_object('revision',5,'trades',jsonb_build_array('vvs'),'responsible_user_id',reader_id));raise exception 'Reader without responsible grant appointed';exception when others then if sqlerrm='Reader without responsible grant appointed' then raise;end if;n:=n+1;end;
 perform public.kshms_command(a,'archive',jsonb_build_object('id',r->>'id','revision',4));
 state:=public.kshms_get_state(a);assert (state->'routines'->0->>'archived')::boolean and jsonb_array_length(state->'versions')=2;n:=n+1;
 begin perform public.kshms_command(a,'save',jsonb_build_object('id',r->>'id','revision',5,'draft',draft));raise exception 'Archived edit accepted';exception when others then if sqlerrm='Archived edit accepted' then raise;end if;n:=n+1;end;
 perform set_config('request.jwt.claim.sub',editor_id::text,true);
 begin perform public.kshms_command(a,'review',jsonb_build_object('settings_revision',2,'version_snapshot','[]'::jsonb,'findings','No active routines in handbook','follow_up','Restore relevant active routines','next_review_on',current_date+100));raise exception 'Empty active handbook review accepted';exception when others then if sqlerrm<>'No active published handbook to review' then raise;end if;n:=n+1;end;
 perform set_config('request.jwt.claim.sub',admin_id::text,true);
 perform public.kshms_command(a,'access',jsonb_build_object('user_id',editor_id,'role','responsible','enabled',false));
 perform set_config('request.jwt.claim.sub',editor_id::text,true);
 assert not coalesce((public.get_kshms_context()->>'publish')::boolean,false),'Revoked responsible publication permission';n:=n+1;
 begin perform public.kshms_command(a,'publish',jsonb_build_object('id',r->>'id','revision',5,'change_summary','Revoked responsible cannot publish'));raise exception 'Revoked responsible published';exception when insufficient_privilege then n:=n+1;end;
 perform set_config('request.jwt.claim.sub',admin_id::text,true);
 perform public.kshms_command(a,'access',jsonb_build_object('user_id',reader_id,'role','reader','enabled',false));
 perform set_config('request.jwt.claim.sub',reader_id::text,true);
 begin perform public.kshms_get_state(a);raise exception 'Revoked reader access';exception when insufficient_privilege then n:=n+1;end;
 perform set_config('request.jwt.claim.sub',sys_id::text,true);perform public.kshms_activate(a,false);
 perform set_config('request.jwt.claim.sub',admin_id::text,true);
 begin perform public.kshms_command(a,'save',jsonb_build_object('draft',draft));raise exception 'Disabled company wrote';exception when insufficient_privilege then n:=n+1;end;
 begin perform 1 from public.kshms_versions;raise exception 'Direct authenticated table read';exception when insufficient_privilege then n:=n+1;end;
 begin perform kshms_private.context();raise exception 'Direct private helper';exception when insufficient_privilege then n:=n+1;end;
 begin perform kshms_private.identity_snapshot(admin_id);raise exception 'Direct identity helper';exception when insufficient_privilege then n:=n+1;end;
 perform set_config('request.jwt.claim.sub','',true);
 begin perform public.kshms_get_state(a);raise exception 'No-identity read';exception when insufficient_privilege then n:=n+1;end;
 perform set_config('kshms.test.passed',n::text,true);
end $$;
reset role;
do $$ declare n int:=current_setting('kshms.test.passed')::int; a uuid:=current_setting('kshms.test.company_a')::uuid; t text; begin
 begin update public.kshms_versions set content='{}' where company_id=a;raise exception 'Version mutable';exception when insufficient_privilege then n:=n+1;end;
 begin update public.kshms_acknowledgments set statement='changed' where company_id=a;raise exception 'Ack mutable';exception when insufficient_privilege then n:=n+1;end;
 begin delete from public.kshms_reviews where company_id=a;raise exception 'Review mutable';exception when insufficient_privilege then n:=n+1;end;
 foreach t in array array['kshms_member_access','kshms_settings','kshms_routines','kshms_versions','kshms_assignments','kshms_acknowledgments','kshms_reviews','kshms_audit'] loop
  assert not has_table_privilege('authenticated','public.'||t,'SELECT,INSERT,UPDATE,DELETE');
  assert not has_table_privilege('anon','public.'||t,'SELECT,INSERT,UPDATE,DELETE');n:=n+2;
 end loop;
 assert not has_function_privilege('anon','public.kshms_command(uuid,text,jsonb)','EXECUTE');n:=n+1;
 -- Deactivated or external-role user must fail even with module/grant.
 perform set_config('request.jwt.claim.sub',current_setting('kshms.test.sys'),true);perform public.kshms_activate(a,true);
 update public.profiles set deactivated=true where id=current_setting('kshms.test.admin')::uuid;
 perform set_config('request.jwt.claim.sub',current_setting('kshms.test.admin'),true);assert not (public.get_kshms_context()->>'enabled')::boolean;n:=n+1;
 perform set_config('request.jwt.claim.sub',current_setting('kshms.test.sys'),true);
 update public.profiles set deactivated=false,role='underleverandor' where id=current_setting('kshms.test.admin')::uuid;
 perform set_config('request.jwt.claim.sub',current_setting('kshms.test.admin'),true);
 assert not (public.get_kshms_context()->>'enabled')::boolean;n:=n+1;
 perform set_config('kshms.test.passed',n::text,true);
end $$;
select current_setting('kshms.test.passed')::integer as checks_passed,'Real authenticated role; synthetic fixtures; all changes roll back' as evidence;
-- Prove that new identity snapshots survive account-name changes, while a
-- genuinely legacy row is only enriched in the response, never backfilled.
do $$ declare a uuid:=current_setting('kshms.test.company_a')::uuid; admin_id uuid:=current_setting('kshms.test.admin')::uuid; reader_id uuid:=current_setting('kshms.test.reader')::uuid; r uuid; v uuid; begin
 update auth.users set raw_user_meta_data=jsonb_build_object('full_name','QA renamed') where id=admin_id;
 assert exists(select 1 from public.kshms_versions where company_id=a and published_by=admin_id and publisher_identity->>'name'='QA admin'),'Published identity changed with account name';
 assert exists(select 1 from public.kshms_acknowledgments where company_id=a and user_id=admin_id and user_identity->>'name'='QA admin'),'Own identity changed with account name';
 insert into public.kshms_routines(company_id,draft,created_by,updated_by) values(a,'{"title":"Synthetic legacy","chapter":"Personal","goal":"Goal","responsibility":"Responsible","procedure":"Procedure","documentation":"Evidence","confirmation":"Read","references":[]}',admin_id,admin_id) returning id into r;
 insert into public.kshms_versions(company_id,routine_id,number,content,content_hash,change_summary,published_by,published_at,requires_ack) select a,r,1,draft,repeat('a',64),'Synthetic legacy record',admin_id,'2020-01-01',true from public.kshms_routines where id=r returning id into v;
 insert into public.kshms_assignments(company_id,version_id,user_id,assigned_by) values(a,v,reader_id,admin_id);
 insert into public.kshms_acknowledgments(company_id,version_id,user_id,statement,acknowledged_at) values(a,v,reader_id,'Synthetic existing confirmation','2020-01-02');
 update public.kshms_member_access set enabled=true where company_id=a and user_id=reader_id;
 perform set_config('kshms.test.legacy',v::text,true);
end $$;
set local role authenticated;
do $$ declare a uuid:=current_setting('kshms.test.company_a')::uuid; v uuid:=current_setting('kshms.test.legacy')::uuid; state jsonb; begin
 perform set_config('request.jwt.claim.sub',current_setting('kshms.test.sys'),true);perform public.kshms_activate(a,true);
 perform set_config('request.jwt.claim.sub',current_setting('kshms.test.reader'),true);state:=public.kshms_get_state(a);
 assert exists(select 1 from jsonb_array_elements(state->'versions') row where (row->>'id')::uuid=v and row->'publisher_identity'->>'source'='current_account' and row->'publisher_identity'->>'name'='QA renamed'),'Legacy publisher label missing or misrepresented as snapshot';
 assert exists(select 1 from jsonb_array_elements(state->'acknowledgments') row where (row->>'version_id')::uuid=v and row->'user_identity'->>'source'='current_account' and row->'user_identity'->>'name'='QA reader'),'Legacy own identity missing';
 assert jsonb_array_length(state->'members')=0,'Legacy labels exposed firm roster';
end $$;
reset role;
do $$ declare v uuid:=current_setting('kshms.test.legacy')::uuid; begin
 assert (select publisher_identity is null from public.kshms_versions where id=v),'Legacy read backfilled immutable publication';
 assert (select user_identity is null from public.kshms_acknowledgments where version_id=v),'Legacy read backfilled immutable confirmation';
end $$;
select 'All role/tenant/version/review assertions passed; synthetic records rolled back' as result;
rollback;
