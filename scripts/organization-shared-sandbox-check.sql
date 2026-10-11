begin;
set local statement_timeout='35s';set local lock_timeout='2s';
create function pg_temp.g_assert(ok boolean,label text)returns void language plpgsql as $$begin if ok is distinct from true then raise exception 'GROUP QA: %',label;end if;perform set_config('org.g.count',(coalesce(nullif(current_setting('org.g.count',true),''),'0')::integer+1)::text,true);end$$;
create function pg_temp.g_reject(q text,code text)returns void language plpgsql as $$declare failed boolean:=false;got text;begin begin execute q;exception when others then failed:=true;get stacked diagnostics got=returned_sqlstate;end;perform pg_temp.g_assert(failed and got=code,'expected '||code||' got '||coalesce(got,'success')||' on '||q);end$$;
create function pg_temp.g_write(c uuid,g uuid,action text,p jsonb)returns jsonb language plpgsql as $$begin return public.organization_group_command(c,g,(public.organization_group_state(c,g)->>'revision')::integer,action,p);end$$;
do $$declare ids uuid[];c uuid;u uuid;k text;i integer;begin
 for i in 1..4 loop c:=gen_random_uuid();ids:=array_append(ids,c);insert into public.sales_company_scopes(id,normalized_name,display_name)values(c,'org-g-qa-'||c,case i when 1 then 'Ringside Rørleggerbedrift' when 2 then 'Bademiljø Expo' when 3 then 'Expo Proffsenter' else 'Utenfor kartet' end);insert into public.company_module_access(company_id,module_key,enabled)values(c,'kshms',true);perform set_config('org.g.c'||i,c::text,true);end loop;
 foreach k in array array['admin','self','ks','head','system'] loop
 u:=gen_random_uuid();perform set_config('org.g.'||k,u::text,true);
 insert into auth.users(id,aud,role,email,created_at,updated_at,raw_app_meta_data,raw_user_meta_data)values(u,'authenticated','authenticated','org-g-qa-'||u||'@example.invalid',now(),now(),'{}',jsonb_build_object('full_name','Syntetisk '||k));
 insert into public.profiles(id,email,company_name,approved,deactivated,role,company_role)values(u,'org-g-qa-'||u||'@example.invalid','org-g-qa-'||ids[1],true,false,case when k='admin' then 'admin' else 'member' end,case when k='admin' then 'firmaadmin' else 'ansatt' end)on conflict(id)do update set approved=true,deactivated=false,role=excluded.role,company_role=excluded.company_role,system_role=null;
 for i in 1..case when k in ('head','system')then 1 else 4 end loop
 insert into public.sales_company_memberships(company_id,user_id,is_primary,workspace_role)values(ids[i],u,i=1,case when k='admin' then 'firmaadmin' else 'ansatt' end)on conflict(company_id,user_id)do update set workspace_role=excluded.workspace_role;
 if k<>'system' then insert into public.kshms_member_access(company_id,user_id,role,enabled,changed_by)values(ids[i],u,case when k='ks' then 'responsible' else 'reader' end,true,u);end if;
 end loop;
 insert into public.user_active_company_scope(user_id,company_id)values(u,ids[1])on conflict(user_id)do update set company_id=excluded.company_id;
 end loop;
 update public.profiles set is_admin=true,system_role='systemadmin' where id=current_setting('org.g.system')::uuid;
 perform set_config('org.g.hr_before',(select count(*)from hr_private.employees)::text,true);
 perform set_config('org.g.org_before',(select count(*)from org_private.units)::text,true);
end$$;

do $$declare c uuid;u uuid;i integer;begin
 for i in 2..3 loop c:=current_setting('org.g.c'||i)::uuid;u:=gen_random_uuid();perform set_config('org.g.single'||i,u::text,true);
 insert into auth.users(id,aud,role,email,created_at,updated_at,raw_app_meta_data,raw_user_meta_data)values(u,'authenticated','authenticated','org-shared-'||u||'@example.invalid',now(),now(),'{}','{}');
 insert into public.profiles(id,email,company_name,approved,deactivated,role,company_role)values(u,'org-shared-'||u||'@example.invalid','org-g-qa-'||c,true,false,'member','ansatt')on conflict(id)do update set approved=true,deactivated=false,company_role='ansatt',system_role=null;
 insert into public.sales_company_memberships(company_id,user_id,is_primary,workspace_role)values(c,u,true,'ansatt')on conflict(company_id,user_id)do update set workspace_role='ansatt';
 insert into public.kshms_member_access(company_id,user_id,role,enabled,changed_by)values(c,u,'reader',true,u);
 insert into public.user_active_company_scope(user_id,company_id)values(u,c)on conflict(user_id)do update set company_id=c;
 end loop;
 perform set_config('org.g.members_before',(select md5(coalesce(jsonb_agg(to_jsonb(m) order by company_id,user_id)::text,''))from public.sales_company_memberships m),true);
end$$;
-- All records are synthetic; transaction always rolls back.
set local role authenticated;
do $$declare c uuid:=current_setting('org.g.c1')::uuid;b uuid:=current_setting('org.g.c2')::uuid;d uuid:=current_setting('org.g.c3')::uuid;a uuid:=current_setting('org.g.admin')::uuid;h uuid:=current_setting('org.g.head')::uuid;g uuid:=gen_random_uuid();x jsonb;p jsonb;bad jsonb;r integer;begin
 perform set_config('request.jwt.claim.sub',a::text,true);perform set_config('org.g.group',g::text,true);
 p:=jsonb_build_object('id',g,'name','Ringside AS','company_ids',jsonb_build_array(c,b,d),'confirm',true,'shared_visibility',true);
 perform pg_temp.g_reject(format('select public.organization_group_create(%L,%L::jsonb)',c,p||'{"shared_visibility":"true"}'),'22023');
 x:=public.organization_group_create(c,p);
 perform pg_temp.g_assert(x->>'shared_visibility'='true','explicit shared create');
 perform pg_temp.g_assert(jsonb_array_length(x->'companies')=3,'all three companies');
 p:=jsonb_build_object('chart_name','Ringside AS','shared_visibility',true,'units',(select jsonb_agg((v-'editable'-'manager_name')||jsonb_build_object('sort_order',case v->>'company_id' when c::text then 2 when b::text then 3 when d::text then 1 else 0 end))from jsonb_array_elements(x->'units')v),'removed_ids','[]'::jsonb,'confirm_removal',false);
 x:=pg_temp.g_write(c,g,'layout',p);r:=(x->>'revision')::integer;
 perform pg_temp.g_assert((select v->>'sort_order'='2' from jsonb_array_elements(x->'units')v where v->>'company_id'=c::text),'plumbing saved in middle order');
 perform pg_temp.g_assert((select string_agg(v->>'name',',' order by (v->>'sort_order')::integer)from jsonb_array_elements(x->'units')v where v->>'company_id' is not null)='Expo Proffsenter,Ringside Rørleggerbedrift,Bademiljø Expo','saved left/middle/right');
 perform pg_temp.g_reject(format('select public.organization_group_command(%L,%L,%s,''layout'',%L::jsonb)',c,g,r-1,p),'40001');
 foreach bad in array array[p||'{"shared_visibility":null}',jsonb_set(p,'{units,0,sort_order}','1.5'),jsonb_set(p,'{units,0,sort_order}','101'),jsonb_set(p,'{units,0,sort_order}','-1'),jsonb_set(p,'{units,0,sort_order}','"2"')] loop
 perform pg_temp.g_reject(format('select public.organization_group_command(%L,%L,%s,''layout'',%L::jsonb)',c,g,r,bad),'22023');end loop;
 perform pg_temp.g_assert(public.organization_group_state(c,g)=x,'bad shared/order payload atomic');
 perform set_config('org.g.payload',p::text,true);
 perform set_config('request.jwt.claim.sub',h::text,true);x:=public.organization_group_state(c,g);
 perform pg_temp.g_assert(jsonb_array_length(x->'units')=4 and jsonb_array_length(x->'companies')=3,'single-company reader sees board and all branches');
 perform pg_temp.g_assert(jsonb_array_length(x->'people')>0 and (select count(distinct v->>'company_id')from jsonb_array_elements(x->'people')v)=3,'single-company reader sees safe people from all branches');
 perform pg_temp.g_assert(x#>>'{context,administer}'='false' and not exists(select 1 from jsonb_array_elements(x->'units')v where (v->>'editable')::boolean),'shared reading gives no edit rights');
 perform pg_temp.g_assert(jsonb_array_length(public.organization_group_options(c)->'groups')=1,'shared chart in single-company picker');
 perform pg_temp.g_assert(not exists(select 1 from jsonb_array_elements(x->'people')v where v?'email' or v?'private_contact' or v?'medical' or (v->>'hr_registered')::boolean or v->>'leader_id' is not null),'safe chart fields no HR/contact payload');
 perform pg_temp.g_reject(format('select public.organization_group_command(%L,%L,%s,''layout'',%L::jsonb)',c,g,r,p),'42501');
 perform pg_temp.g_reject(format('select public.organization_group_command(%L,%L,%s,''remove_group'',''{"confirm":true}'')',c,g,r),'42501');
 perform set_config('request.jwt.claim.sub',current_setting('org.g.system'),true);
 perform pg_temp.g_reject(format('select public.organization_group_state(%L,%L)',c,g),'42501');
 perform set_config('request.jwt.claim.sub',a::text,true);
 perform pg_temp.g_reject(format('select public.organization_group_state(%L,%L)',current_setting('org.g.c4'),g),'42501');
end$$;
reset role;
-- Access in an unrelated linked firm is not required for shared reading.
update public.kshms_member_access set enabled=false where company_id=current_setting('org.g.c2')::uuid and user_id=current_setting('org.g.self')::uuid;
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('org.g.self'),true);
select pg_temp.g_assert(public.organization_group_state(current_setting('org.g.c1')::uuid,current_setting('org.g.group')::uuid)->>'shared_visibility'='true','other firm grant revoke preserves own linked read');
reset role;
-- Fresh own-company access still gates both options and payload.
update public.kshms_member_access set enabled=false where company_id=current_setting('org.g.c1')::uuid and user_id=current_setting('org.g.head')::uuid;
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('org.g.head'),true);
select pg_temp.g_reject(format('select public.organization_group_state(%L,%L)',current_setting('org.g.c1'),current_setting('org.g.group')),'42501');
select pg_temp.g_reject(format('select public.organization_group_options(%L)',current_setting('org.g.c1')),'42501');
reset role;
update public.kshms_member_access set enabled=true where company_id=current_setting('org.g.c1')::uuid and user_id=current_setting('org.g.head')::uuid;
insert into hr_private.closed_employments(company_id,user_id,employee_id,previous_revision)values(current_setting('org.g.c1')::uuid,current_setting('org.g.head')::uuid,gen_random_uuid(),1);
set local role authenticated;
select pg_temp.g_reject(format('select public.organization_group_state(%L,%L)',current_setting('org.g.c1'),current_setting('org.g.group')),'42501');
select set_config('request.jwt.claim.sub',current_setting('org.g.admin'),true);
-- A single-company account in each other firm reads the very same global chart.
do $$declare c uuid;g uuid:=current_setting('org.g.group')::uuid;x jsonb;i integer;begin
 for i in 2..3 loop c:=current_setting('org.g.c'||i)::uuid;perform set_config('request.jwt.claim.sub',current_setting('org.g.single'||i),true);x:=public.organization_group_state(c,g);
 perform pg_temp.g_assert(x#>>'{context,group_id}'=g::text and jsonb_array_length(x->'companies')=3,'single-company viewer in linked firm '||i);
 perform pg_temp.g_assert(x#>>'{context,administer}'='false','single-company viewer cannot edit '||i);
 end loop;perform set_config('request.jwt.claim.sub',current_setting('org.g.admin'),true);
end$$;
-- Both other firms can use their own current scope to fetch the same group ID.
reset role;
update public.user_active_company_scope set company_id=current_setting('org.g.c2')::uuid where user_id=current_setting('org.g.admin')::uuid;
set local role authenticated;
select pg_temp.g_assert(public.organization_group_state(current_setting('org.g.c2')::uuid,current_setting('org.g.group')::uuid)#>>'{context,group_id}'=current_setting('org.g.group'),'same group through second company');
reset role;
update public.user_active_company_scope set company_id=current_setting('org.g.c3')::uuid where user_id=current_setting('org.g.admin')::uuid;
set local role authenticated;
select pg_temp.g_assert(public.organization_group_state(current_setting('org.g.c3')::uuid,current_setting('org.g.group')::uuid)#>>'{context,group_id}'=current_setting('org.g.group'),'same group through third company');
reset role;
update public.user_active_company_scope set company_id=current_setting('org.g.c1')::uuid where user_id=current_setting('org.g.admin')::uuid;
set local role authenticated;
do $$declare c uuid:=current_setting('org.g.c1')::uuid;g uuid:=current_setting('org.g.group')::uuid;x jsonb;p jsonb;begin
 x:=public.organization_group_state(c,g);p:=current_setting('org.g.payload')::jsonb;
 x:=pg_temp.g_write(c,g,'layout',p||'{"shared_visibility":false}');perform pg_temp.g_assert(x->>'shared_visibility'='false','sharing can be disabled atomically');
 perform set_config('request.jwt.claim.sub',current_setting('org.g.self'),true);
 perform pg_temp.g_reject(format('select public.organization_group_state(%L,%L)',c,g),'42501');
end$$;
reset role;
select pg_temp.g_assert((select count(*)from hr_private.employees)::text=current_setting('org.g.hr_before'),'HR rows unchanged');
select pg_temp.g_assert((select count(*)from org_private.units)::text=current_setting('org.g.org_before'),'ordinary firm chart unchanged');
select pg_temp.g_assert((select md5(coalesce(jsonb_agg(to_jsonb(m) order by company_id,user_id)::text,''))from public.sales_company_memberships m)=current_setting('org.g.members_before'),'membership data unchanged');
select current_setting('org.g.count')::integer as shared_assertions_pass;
rollback;
