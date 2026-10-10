-- HR templates: synthetic identities only. Roll back all fixtures.
begin;
set local statement_timeout='25s';
set local lock_timeout='2s';
create function pg_temp.hr_assert(ok boolean,label text) returns void language plpgsql as $$begin
 if ok is distinct from true then raise exception 'HR QA: %',label; end if;
 perform set_config('hr.qa.count',(coalesce(nullif(current_setting('hr.qa.count',true),''),'0')::integer+1)::text,true);
end$$;
create function pg_temp.hr_reject(q text,code text) returns void language plpgsql as $$declare failed boolean:=false;got text;begin
 begin execute q;exception when others then failed:=true;get stacked diagnostics got=returned_sqlstate;end;
 perform pg_temp.hr_assert(failed and got=code,'expected '||code||', got '||coalesce(got,'success'));
end$$;
do $$declare c uuid:=gen_random_uuid();b uuid:=gen_random_uuid();u uuid;k text;begin
 insert into public.sales_company_scopes(id,normalized_name,display_name) values(c,'hr-h1-qa-'||c,'HR H1 QA'),(b,'hr-h1-qa-'||b,'HR H1 foreign');
 perform set_config('hr.qa.company',c::text,true);perform set_config('hr.qa.foreign_company',b::text,true);
 foreach k in array array['admin','self','old','new','reader','ks','system','outsider','foreign'] loop
  u:=gen_random_uuid();perform set_config('hr.qa.'||k,u::text,true);
  insert into auth.users(id,aud,role,email,created_at,updated_at,raw_app_meta_data,raw_user_meta_data)
   values(u,'authenticated','authenticated','hr-h1-qa-'||u||'@example.invalid',now(),now(),'{}','{}');
  insert into public.profiles(id,email,company_name,approved,deactivated,role,company_role)
   values(u,'hr-h1-qa-'||u||'@example.invalid','hr-h1-qa-'||case when k='foreign' then b else c end,true,false,case when k in ('admin','foreign') then 'admin' else 'member' end,case when k in ('admin','foreign') then 'firmaadmin' else 'ansatt' end)
   on conflict(id) do update set approved=true,deactivated=false,role=excluded.role,company_role=excluded.company_role,system_role=null;
  insert into public.sales_company_memberships(company_id,user_id,is_primary,workspace_role)
   values(case when k='foreign' then b else c end,u,true,case when k in ('admin','foreign') then 'firmaadmin' else 'ansatt' end) on conflict(company_id,user_id) do update set workspace_role=excluded.workspace_role;
  insert into public.user_active_company_scope(user_id,company_id) values(u,case when k='foreign' then b else c end) on conflict(user_id) do update set company_id=excluded.company_id;
 end loop;
 update public.profiles set system_role='systemadmin',is_admin=true where id=current_setting('hr.qa.system')::uuid;
 insert into public.company_module_access(company_id,module_key,enabled) values(c,'kshms',true);
 -- Existing relationship scenarios now run behind explicit module entitlements.
 insert into public.company_module_access(company_id,module_key,enabled) values(c,'hr',true),(b,'hr',true);
 insert into hr_private.module_access(company_id,user_id,enabled) select company_id,user_id,true from public.sales_company_memberships where company_id in (c,b);
 insert into public.kshms_member_access(company_id,user_id,role,enabled,changed_by) values(c,current_setting('hr.qa.ks')::uuid,'responsible',true,current_setting('hr.qa.admin')::uuid);
end$$;
-- Fixture setup is the same isolated random-firm/identity contract as H1.
-- The harness prepends H1's setup before the first authenticated-role statement.
set local role authenticated;
do $$declare c uuid:=current_setting('hr.qa.company')::uuid;
 a uuid:=current_setting('hr.qa.admin')::uuid;tid uuid:=gen_random_uuid();other_id uuid:=gen_random_uuid();
 qid uuid:=gen_random_uuid();v jsonb;r jsonb;old_v jsonb;rev integer;k text;page jsonb;n integer;
begin
 perform set_config('request.jwt.claim.sub',a::text,true);
 v:=jsonb_build_object('title','Syntetisk samtalemal','kind','annual','intro','Generelle spørsmål, ikke personopplysninger.',
  'questions',jsonb_build_array(jsonb_build_object('id',qid,'topic','Arbeidsmiljø','prompt','Hva fungerer godt?','phase','preparation','required',true)));
 perform pg_temp.hr_reject(format('select public.hr_template_list(%L)',c),'42501');
 perform public.hr_foundation_configure(c,0,true,'Syntetisk test av malbygger','Syntetisk vurdert grunnlag',current_date+30);
 perform pg_temp.hr_assert(jsonb_array_length(public.hr_template_list(c)->'templates')=0,'no automatic templates');
 r:=public.hr_template_save(c,tid,0,v,false);
 perform pg_temp.hr_assert(r#>>'{template,revision}'='1','first immutable version');
 perform pg_temp.hr_assert(r->>'content_enabled'='false','private content closed');
 perform pg_temp.hr_assert(r#>'{version,content}'=v,'readback exact');old_v:=v;
 perform pg_temp.hr_assert(jsonb_array_length(public.hr_template_list(c)->'templates')=1,'scoped catalogue');
 perform pg_temp.hr_reject(format('select public.hr_template_save(%L,%L,0,%L,false)',c,tid,v),'40001');
 perform pg_temp.hr_assert(public.hr_template_save(c,tid,1,v,false)#>>'{template,revision}'='1','unchanged save does not invent version');
 v:=jsonb_set(jsonb_set(v,'{title}','"Ny syntetisk malutgave"'),'{kind}','"sickleave"');
 r:=public.hr_template_save(c,tid,1,v,false);
 perform pg_temp.hr_assert(r#>>'{template,revision}'='2','changed creates version two');
 perform pg_temp.hr_assert(r#>>'{version,content,kind}'='sickleave','sick leave kind persists');
 perform pg_temp.hr_assert(public.hr_template_list(c)#>>'{templates,0,kind}'='sickleave','sick leave catalogue');
 perform pg_temp.hr_assert(public.hr_template_get(c,tid,1)#>>'{version,content,kind}'='annual','new kind does not alter old annual snapshot');
 perform pg_temp.hr_assert(public.hr_template_get(c,tid,1)#>'{version,content}'=old_v,'historical snapshot unchanged');
 perform pg_temp.hr_reject(format('select public.hr_template_save(%L,%L,1,%L,false)',c,tid,old_v),'40001');
 perform pg_temp.hr_assert(public.hr_template_get(c,tid)#>'{version,content}'=v,'stale writer cannot overwrite');
 r:=public.hr_template_save(c,tid,2,v,true);
 perform pg_temp.hr_assert(r#>>'{template,archived}'='true' and r#>>'{template,revision}'='3','archive creates traceable version');
 perform pg_temp.hr_reject(format('select public.hr_template_save(%L,%L,3,%L,true)',c,tid,old_v),'22023');
 r:=public.hr_template_save(c,tid,3,v,false);
 perform pg_temp.hr_assert(r#>>'{template,archived}'='false' and r#>>'{template,revision}'='4','reopen');
 perform pg_temp.hr_assert(jsonb_array_length(public.hr_template_history(c,tid)->'versions')=4,'history includes archive transitions');
 perform pg_temp.hr_reject(format('select public.hr_template_get(%L,%L,99)',c,tid),'22023');
 perform pg_temp.hr_reject(format('select public.hr_template_history(%L,%L,0)',c,tid),'22023');
 perform pg_temp.hr_reject(format('select public.hr_template_save(%L,%L,0,%L,true)',c,gen_random_uuid(),v),'22023');
 -- Malformed or private-shaped payloads fail, including an invalid last item.
 for k in select unnest(array['answer','employee_id','file','diagnosis']) loop
  perform pg_temp.hr_reject(format('select public.hr_template_save(%L,%L,4,%L,false)',c,tid,v||jsonb_build_object(k,'not allowed')),'22023');
 end loop;
 for k in select unnest(array['null','[]','"text"','1','{}']) loop
  perform pg_temp.hr_reject(format('select public.hr_template_save(%L,%L,4,%L,false)',c,tid,k),'22023');
 end loop;
 for k in select unnest(array['{"title":"ab"}','{"kind":"diagnosis"}','{"intro":null}','{"questions":[]}','{"questions":null}']) loop
  perform pg_temp.hr_reject(format('select public.hr_template_save(%L,%L,4,%L,false)',c,tid,v||k::jsonb),'22023');
 end loop;
 for k in select unnest(array['{"required":"true"}','{"phase":"private"}','{"prompt":""}','{"id":"bad"}','{"topic":null}','{"answer":"secret"}']) loop
  perform pg_temp.hr_reject(format('select public.hr_template_save(%L,%L,4,%L,false)',c,tid,jsonb_set(v,'{questions}',jsonb_build_array(v#>'{questions,0}',(v#>'{questions,0}')||k::jsonb))),'22023');
 end loop;
 perform pg_temp.hr_reject(format('select public.hr_template_save(%L,%L,4,%L,false)',c,tid,jsonb_set(v,'{questions}',jsonb_build_array(v#>'{questions,0}',v#>'{questions,0}'))),'22023');
 perform pg_temp.hr_assert(public.hr_template_get(c,tid)#>>'{template,revision}'='4','late invalid questions cause no partial revision');
 perform pg_temp.hr_reject(format('select public.hr_template_save(%L,%L,4,%L,false)',c,tid,jsonb_set(v,'{intro}',to_jsonb(repeat('x',1001)))),'22023');
 perform pg_temp.hr_reject(format('select public.hr_template_save(%L,%L,4,%L,false)',c,tid,jsonb_set(v,'{title}',to_jsonb(repeat('x',121)))),'22023');
 perform pg_temp.hr_reject(format('select public.hr_template_save(%L,%L,4,%L,false)',c,tid,jsonb_set(v,'{questions,0,prompt}',to_jsonb(repeat('x',501)))),'22023');
 foreach k in array array['self','old','reader','ks','system','outsider','foreign'] loop
  perform set_config('request.jwt.claim.sub',current_setting('hr.qa.'||k),true);
  perform pg_temp.hr_reject(format('select public.hr_template_list(%L)',c),'42501');
  perform pg_temp.hr_reject(format('select public.hr_template_get(%L,%L)',c,tid),'42501');
  perform pg_temp.hr_reject(format('select public.hr_template_history(%L,%L)',c,tid),'42501');
  perform pg_temp.hr_reject(format('select public.hr_template_save(%L,%L,4,%L,false)',c,tid,v),'42501');
 end loop;
 perform set_config('request.jwt.claim.sub',a::text,true);
 -- More than one page of immutable versions; no hidden truncation.
 rev:=4;
 for n in 1..20 loop
  v:=jsonb_set(v,'{title}',to_jsonb('Syntetisk utgave '||n));r:=public.hr_template_save(c,tid,rev,v,false);rev:=rev+1;
 end loop;
 page:=public.hr_template_history(c,tid);
 perform pg_temp.hr_assert(jsonb_array_length(page->'versions')=20 and page->>'next'='5','history first page');
 perform pg_temp.hr_assert(jsonb_array_length(public.hr_template_history(c,tid,5)->'versions')=4,'history remainder');
 perform pg_temp.hr_assert(public.hr_template_get(c,tid,1)#>'{version,content}'=old_v,'oldest survives long history');
 -- Catalogue has 50 inclusive of archived, no unbounded state fetch.
 for n in 1..49 loop perform public.hr_template_save(c,gen_random_uuid(),0,v,false);end loop;
 page:=public.hr_template_list(c);perform pg_temp.hr_assert(jsonb_array_length(page->'templates')=20 and page->>'next' is not null,'catalogue first page');
 page:=public.hr_template_list(c,(page->>'next')::uuid);perform pg_temp.hr_assert(jsonb_array_length(page->'templates')=20,'catalogue second page');
 page:=public.hr_template_list(c,(page->>'next')::uuid);perform pg_temp.hr_assert(jsonb_array_length(page->'templates')=10 and page->>'next' is null,'catalogue final page');
 perform pg_temp.hr_reject(format('select public.hr_template_save(%L,%L,0,%L,false)',c,gen_random_uuid(),v),'22023');
 perform set_config('hr.qa.template',tid::text,true);perform set_config('hr.qa.template_content',v::text,true);
end $$;
reset role;
do $$declare c uuid:=current_setting('hr.qa.company')::uuid;b uuid:=current_setting('hr.qa.foreign_company')::uuid;
 a uuid:=current_setting('hr.qa.admin')::uuid;tid uuid:=current_setting('hr.qa.template')::uuid;v jsonb:=current_setting('hr.qa.template_content')::jsonb;
begin
 -- Foreign UUID collision and direct-table/function grants.
 insert into hr_private.firms values(b,true,'Syntetisk annet firma','Syntetisk grunnlag',current_date+30,1);
 insert into hr_private.conversation_templates values(gen_random_uuid(),b,1,false) returning id into tid;
 perform set_config('hr.qa.foreign_template',tid::text,true);
 perform pg_temp.hr_assert(not has_table_privilege('authenticated','hr_private.conversation_template_versions','select'),'no raw version reads');
 perform pg_temp.hr_assert(not has_table_privilege('service_role','hr_private.conversation_templates','select'),'no service raw reads');
 perform pg_temp.hr_assert(not has_function_privilege('anon','public.hr_template_list(uuid,uuid)','execute'),'no anonymous RPC');
 perform pg_temp.hr_assert(not has_function_privilege('service_role','public.hr_template_save(uuid,uuid,integer,jsonb,boolean)','execute'),'no service RPC');
 perform pg_temp.hr_assert((select count(*)=0 from hr_private.artifacts where company_id=c),'no personal artifacts created');
 perform pg_temp.hr_assert((select content_enabled=false and restore_quarantined from hr_private.runtime_state),'gate unchanged');
end $$;
set local role authenticated;
do $$declare c uuid:=current_setting('hr.qa.company')::uuid;t uuid:=current_setting('hr.qa.foreign_template')::uuid;v jsonb:=current_setting('hr.qa.template_content')::jsonb;begin
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.admin'),true);
 perform pg_temp.hr_reject(format('select public.hr_template_get(%L,%L)',c,t),'42501');
 perform pg_temp.hr_reject(format('select public.hr_template_history(%L,%L)',c,t),'42501');
 perform pg_temp.hr_reject(format('select public.hr_template_save(%L,%L,1,%L,false)',c,t,v),'42501');
end $$;
reset role;
update public.company_module_access set enabled=false where company_id=current_setting('hr.qa.company')::uuid and module_key='hr';
set local role authenticated;
do $$begin perform set_config('request.jwt.claim.sub',current_setting('hr.qa.admin'),true); perform pg_temp.hr_reject(format('select public.hr_template_list(%L)',current_setting('hr.qa.company')),'42501');end$$;
reset role;
update public.company_module_access set enabled=true where company_id=current_setting('hr.qa.company')::uuid and module_key='hr';
select set_config('request.jwt.claim.sub',current_setting('hr.qa.system'),true);
update public.profiles set deactivated=true where id=current_setting('hr.qa.admin')::uuid;
set local role authenticated;
do $$begin perform set_config('request.jwt.claim.sub',current_setting('hr.qa.admin'),true); perform pg_temp.hr_reject(format('select public.hr_template_list(%L)',current_setting('hr.qa.company')),'42501');end$$;
reset role;
select set_config('request.jwt.claim.sub',current_setting('hr.qa.system'),true);
update public.profiles set deactivated=false where id=current_setting('hr.qa.admin')::uuid;
update public.user_active_company_scope set company_id=current_setting('hr.qa.foreign_company')::uuid where user_id=current_setting('hr.qa.admin')::uuid;
set local role authenticated;
do $$begin perform set_config('request.jwt.claim.sub',current_setting('hr.qa.admin'),true); perform pg_temp.hr_reject(format('select public.hr_template_list(%L)',current_setting('hr.qa.company')),'42501');end$$;
reset role;
select current_setting('hr.qa.count')::integer as assertions;
rollback;
