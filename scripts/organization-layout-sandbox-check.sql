-- Own synthetic companies/identities only. All data rolled back. No active fixtures.
begin;
set local statement_timeout='35s';
set local lock_timeout='2s';
create function pg_temp.org_assert(ok boolean,label text) returns void language plpgsql as $$begin
 if ok is distinct from true then raise exception 'ORG QA: %',label;end if;
 perform set_config('org.qa.count',(coalesce(nullif(current_setting('org.qa.count',true),''),'0')::integer+1)::text,true);
end$$;
create function pg_temp.org_reject(q text,code text) returns void language plpgsql as $$declare failed boolean:=false;got text;begin
 begin execute q;exception when others then failed:=true;get stacked diagnostics got=returned_sqlstate;end;
 perform pg_temp.org_assert(failed and got=code,'expected '||code||', got '||coalesce(got,'success')||' on '||q);
end$$;
-- This helper invokes the real public RPC as caller and always uses its latest revision.
create function pg_temp.org_write(c uuid,action text,payload jsonb) returns jsonb language plpgsql as $$begin
 return public.organization_command(c,(public.organization_state(c)->>'revision')::integer,action,payload);
end$$;
do $$declare c uuid:=gen_random_uuid();b uuid:=gen_random_uuid();u uuid;k text;begin
 insert into public.sales_company_scopes(id,normalized_name,display_name) values(c,'org-o1-qa-'||c,'Organisasjon O1 QA'),(b,'org-o1-qa-'||b,'Organisasjon foreign');
 perform set_config('org.qa.company',c::text,true);perform set_config('org.qa.foreign_company',b::text,true);
 foreach k in array array['admin','self','head','new','ks','system','outsider','foreign'] loop
  u:=gen_random_uuid();perform set_config('org.qa.'||k,u::text,true);
  insert into auth.users(id,aud,role,email,created_at,updated_at,raw_app_meta_data,raw_user_meta_data)
   values(u,'authenticated','authenticated','org-o1-qa-'||u||'@example.invalid',now(),now(),'{}',jsonb_build_object('full_name','Syntetisk '||k));
  insert into public.profiles(id,email,company_name,approved,deactivated,role,company_role)
   values(u,'org-o1-qa-'||u||'@example.invalid','org-o1-qa-'||case when k='foreign' then b else c end,true,false,case when k in ('admin','foreign') then 'admin' else 'member' end,case when k in ('admin','foreign') then 'firmaadmin' else 'ansatt' end)
   on conflict(id)do update set approved=true,deactivated=false,role=excluded.role,company_role=excluded.company_role,system_role=null;
  insert into public.sales_company_memberships(company_id,user_id,is_primary,workspace_role)
   values(case when k='foreign' then b else c end,u,true,case when k in ('admin','foreign') then 'firmaadmin' else 'ansatt' end)on conflict(company_id,user_id)do update set workspace_role=excluded.workspace_role;
  insert into public.user_active_company_scope(user_id,company_id)values(u,case when k='foreign' then b else c end)on conflict(user_id)do update set company_id=excluded.company_id;
 end loop;
 update public.profiles set system_role='systemadmin',is_admin=true where id=current_setting('org.qa.system')::uuid;
 insert into public.company_module_access(company_id,module_key,enabled)values(c,'kshms',true),(b,'kshms',true);
 insert into public.kshms_member_access(company_id,user_id,role,enabled,changed_by)
 select c,user_id,case when user_id=current_setting('org.qa.ks')::uuid then 'responsible' else 'reader' end,true,current_setting('org.qa.admin')::uuid
 from public.sales_company_memberships where company_id=c and user_id<>current_setting('org.qa.outsider')::uuid;
end$$;
set local role authenticated;
do $$declare c uuid:=current_setting('org.qa.company')::uuid;a uuid:=current_setting('org.qa.admin')::uuid;
 board uuid:=gen_random_uuid();one uuid:=gen_random_uuid();two uuid:=gen_random_uuid();three uuid:=gen_random_uuid();u uuid:=current_setting('org.qa.self')::uuid;head uuid:=current_setting('org.qa.head')::uuid;
 x jsonb;p jsonb;r integer;bad jsonb;key text;before jsonb;begin
 perform set_config('request.jwt.claim.sub',a::text,true);
 p:=jsonb_build_object('chart_name','Ringside','units',jsonb_build_array(
  jsonb_build_object('id',board,'name','Styret','color','violet'),
  jsonb_build_object('id',one,'name','Ringside Rørleggerbedrift','color','teal','parent_id',board,'manager_id',head),
  jsonb_build_object('id',two,'name','Bademiljø Expo','color','blue','parent_id',board),
  jsonb_build_object('id',three,'name','Expo Proffsenter','color','amber','parent_id',board)),
  'removed_ids','[]'::jsonb,'confirm_removal',false);
 x:=public.organization_save_layout(c,0,p);r:=(x->>'revision')::integer;
 perform pg_temp.org_assert(x->>'chart_name'='Ringside' and jsonb_array_length(x->'units')=4,'top name + full snapshot saved');
 perform pg_temp.org_assert((select count(*)from jsonb_array_elements(x->'units')v where v->>'parent_id'=board::text)=3,'three peer businesses below board');
 before:=x;
 perform pg_temp.org_reject(format('select public.organization_save_layout(%L,0,%L::jsonb)',c,p),'40001');
 foreach key in array array['self','head','ks','system','outsider','foreign'] loop
  perform set_config('request.jwt.claim.sub',current_setting('org.qa.'||key),true);
  perform pg_temp.org_reject(format('select public.organization_save_layout(%L,%s,%L::jsonb)',c,r,p),'42501');
 end loop;
 perform set_config('request.jwt.claim.sub',a::text,true);
 perform pg_temp.org_reject(format('select public.organization_save_layout(%L,%s,%L::jsonb)',current_setting('org.qa.foreign_company'),0,p),'42501');
 perform pg_temp.org_reject(format('select public.organization_save_layout(%L,%s,%L::jsonb)',c,r,p||'{"private_contact":"forbidden"}'),'22023');
 perform pg_temp.org_reject(format('select public.organization_save_layout(%L,%s,%L::jsonb)',c,r,p||'{"chart_name":""}'),'22023');
 bad:=jsonb_set(p,'{units,3,color}','"invalid"');
 perform pg_temp.org_reject(format('select public.organization_save_layout(%L,%s,%L::jsonb)',c,r,bad),'22023');
 perform pg_temp.org_assert(public.organization_state(c)=before,'late invalid item leaves whole chart unchanged');
 bad:=jsonb_set(p,'{units,0,parent_id}',to_jsonb(one));
 perform pg_temp.org_reject(format('select public.organization_save_layout(%L,%s,%L::jsonb)',c,r,bad),'22023');
 bad:=jsonb_set(p,'{units,1,parent_id}',to_jsonb(gen_random_uuid()));
 perform pg_temp.org_reject(format('select public.organization_save_layout(%L,%s,%L::jsonb)',c,r,bad),'22023');
 bad:=jsonb_set(p,'{units,1,id}',to_jsonb(board));
 perform pg_temp.org_reject(format('select public.organization_save_layout(%L,%s,%L::jsonb)',c,r,bad),'22023');
 bad:=jsonb_set(p,'{units,3}',p#>'{units,3}'||'{"private_note":"no"}');
 perform pg_temp.org_reject(format('select public.organization_save_layout(%L,%s,%L::jsonb)',c,r,bad),'22023');
 bad:=jsonb_set(p,'{units,1,manager_id}',to_jsonb(current_setting('org.qa.outsider')));
 perform pg_temp.org_reject(format('select public.organization_save_layout(%L,%s,%L::jsonb)',c,r,bad),'42501');
 -- Make a real cross-company collision as owner, then test the actual caller.
 perform set_config('org.qa.foreign_unit',gen_random_uuid()::text,true);
end$$;
reset role;
insert into org_private.units(id,company_id,name,color)values(current_setting('org.qa.foreign_unit')::uuid,current_setting('org.qa.foreign_company')::uuid,'Foreign unit','teal');
set local role authenticated;
do $$declare c uuid:=current_setting('org.qa.company')::uuid;x jsonb;p jsonb;bad jsonb;r integer;u uuid:=current_setting('org.qa.self')::uuid;head uuid:=current_setting('org.qa.head')::uuid;one uuid;two uuid;parent uuid;ids uuid[];i integer;e jsonb;begin
 x:=public.organization_state(c);r:=(x->>'revision')::integer;
 select(v->>'id')::uuid into one from jsonb_array_elements(x->'units')v where v->>'name'='Ringside Rørleggerbedrift';
 select(v->>'id')::uuid into two from jsonb_array_elements(x->'units')v where v->>'name'='Bademiljø Expo';
 p:=jsonb_build_object('chart_name','Ringside','units',(select jsonb_agg(v-'manager_name'-'editable')from jsonb_array_elements(x->'units')v),'removed_ids','[]'::jsonb,'confirm_removal',false);
 bad:=jsonb_set(p,'{units,0,id}',to_jsonb(current_setting('org.qa.foreign_unit')));
 perform pg_temp.org_reject(format('select public.organization_save_layout(%L,%s,%L::jsonb)',c,r,bad),'42501');
 -- A 13-level chain and an oversized array must never partially write.
 bad:=p||'{"units":[]}';parent:=null;
 for i in 1..13 loop
  ids:=array_append(ids,gen_random_uuid());bad:=jsonb_set(bad,'{units}',(bad->'units')||jsonb_build_object('id',ids[i],'name','Level '||i,'color','teal','parent_id',parent));parent:=ids[i];
 end loop;
 perform pg_temp.org_reject(format('select public.organization_save_layout(%L,%s,%L::jsonb)',c,r,bad),'22023');
 bad:=p||'{"units":[]}';for i in 1..101 loop bad:=jsonb_set(bad,'{units}',(bad->'units')||jsonb_build_object('id',gen_random_uuid(),'name','Unit '||i,'color','teal'));end loop;
 perform pg_temp.org_reject(format('select public.organization_save_layout(%L,%s,%L::jsonb)',c,r,bad),'54000');
 -- Place a real HR-registered member, then remove the organizational card only.
 reset role;
 insert into public.company_module_access(company_id,module_key,enabled)values(c,'hr',true);
 insert into hr_private.module_access(company_id,user_id,enabled,changed_by)select c,user_id,true,current_setting('org.qa.admin')::uuid from public.sales_company_memberships where company_id=c;
 set local role authenticated;
 perform public.hr_foundation_configure(c,0,true,'Syntetisk O2','Syntetisk grunnlag',current_date+30);
 e:=public.hr_employee_command(c,'create',jsonb_build_object('user_id',u,'leader_id',head));
 x:=pg_temp.org_write(c,'place',jsonb_build_object('employee_id',u,'employee_revision',1,'unit_id',one,'title','Hjelpearbeider','kind','employee','leader_id',head,'confirm_leader_change',true));
 r:=(x->>'revision')::integer;
 p:=jsonb_build_object('chart_name','Ringside','units',(select jsonb_agg(v-'manager_name'-'editable')from jsonb_array_elements(x->'units')v where v->>'id'<>one::text),'removed_ids',jsonb_build_array(one),'confirm_removal',false);
 perform pg_temp.org_reject(format('select public.organization_save_layout(%L,%s,%L::jsonb)',c,r,p),'22023');
 perform pg_temp.org_reject(format('select public.organization_save_layout(%L,%s,%L::jsonb)',c,r,p||'{"confirm_removal":"true"}'),'22023');
 perform pg_temp.org_reject(format('select public.organization_save_layout(%L,%s,%L::jsonb)',c,r,p||'{"confirm_removal":true,"removed_ids":[]}'),'22023');
 x:=public.organization_save_layout(c,r,p||'{"confirm_removal":true}');
 perform pg_temp.org_assert(jsonb_array_length(x->'units')=3,'confirmed branch removal');
 perform pg_temp.org_assert((select v->>'unit_id' is null and v->>'title'='Hjelpearbeider' and v->>'leader_id'=head::text from jsonb_array_elements(x->'people')v where v->>'id'=u::text),'unplaced, title and nearest leader preserved');
 perform pg_temp.org_assert(public.hr_employee_get(c,(e#>>'{employee,id}')::uuid)#>>'{employee,leader_id}'=head::text,'individual HR unchanged');
 -- Existing unit command must preserve the new root name.
 x:=pg_temp.org_write(c,'unit',jsonb_build_object('id',two,'name','Bademiljø Expo Butikk','color','blue','parent_id',(select v->'parent_id'from jsonb_array_elements(x->'units')v where v->>'id'=two::text)));
 perform pg_temp.org_assert(x->>'chart_name'='Ringside','old individual write preserves root name');
 r:=(x->>'revision')::integer;
 p:=jsonb_build_object('chart_name','Ringside','units','[]'::jsonb,'removed_ids',(select jsonb_agg(v->'id')from jsonb_array_elements(x->'units')v),'confirm_removal',true);
 x:=public.organization_save_layout(c,r,p);perform pg_temp.org_assert(jsonb_array_length(x->'units')=0 and x->>'chart_name'='Ringside','explicit empty chart saved');
end$$;
reset role;
update public.company_module_access set enabled=false where company_id=current_setting('org.qa.company')::uuid and module_key='kshms';
set local role authenticated;
select pg_temp.org_reject(format('select public.organization_save_layout(%L,0,%L::jsonb)',current_setting('org.qa.company'),'{}'),'42501');
reset role;
select pg_temp.org_assert(not has_function_privilege('anon','public.organization_save_layout(uuid,integer,jsonb)','EXECUTE'),'anon save denied');
select pg_temp.org_assert(not has_function_privilege('service_role','public.organization_save_layout(uuid,integer,jsonb)','EXECUTE'),'service_role save denied');
select current_setting('org.qa.count')::integer assertions_pass;
rollback;
