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
do $$declare c uuid:=current_setting('org.qa.company')::uuid;b uuid:=current_setting('org.qa.foreign_company')::uuid;
 a uuid:=current_setting('org.qa.admin')::uuid;u uuid:=current_setting('org.qa.self')::uuid;head uuid:=current_setting('org.qa.head')::uuid;
 nexthead uuid:=current_setting('org.qa.new')::uuid;x jsonb;r integer;one uuid;two uuid;child uuid;k text;payload jsonb;eid uuid;hrrev integer;oldrev integer;parent uuid;i integer;begin
 perform set_config('request.jwt.claim.sub',a::text,true);
 x:=public.organization_state(c);
 perform pg_temp.org_assert(x->>'revision'='0' and jsonb_array_length(x->'units')=0,'KS-only no HR setup onboarding');
 perform pg_temp.org_assert(jsonb_array_length(x->'people')=7,'all active internal members, no HR registration required');
 perform pg_temp.org_assert(x#>>'{context,user_id}'=a::text and x#>>'{context,company_id}'=c::text,'fresh company/actor');
 perform pg_temp.org_assert(not(x::text like '%legal_basis%') and not(x::text like '%readers%') and not(x::text like '%contact%'),'only public organization metadata');
 perform pg_temp.org_reject(format('select public.organization_state(%L)',b),'42501');
 perform pg_temp.org_reject(format('select public.organization_command(%L,0,%L,%L::jsonb)',c,'unit','{"name":"Fake","private_note":"secret"}'),'22023');
 perform pg_temp.org_reject(format('select public.organization_command(%L,0,%L,%L::jsonb)',c,'unit',jsonb_build_object('name',repeat('x',3000))),'22023');
 x:=pg_temp.org_write(c,'unit',jsonb_build_object('name','Service','color','teal','manager_id',head));one:=(x#>>'{units,0,id}')::uuid;
 perform pg_temp.org_assert(jsonb_array_length(x->'units')=1 and (x#>>'{units,0,editable}')::boolean,'admin first root');
 r:=(x->>'revision')::integer;
 perform pg_temp.org_reject(format('select public.organization_command(%L,0,%L,%L::jsonb)',c,'unit','{"name":"Stale","color":"blue"}'),'40001');
 x:=pg_temp.org_write(c,'unit','{"name":"Butikk","color":"blue"}');
 select (v->>'id')::uuid into two from jsonb_array_elements(x->'units')v where v->>'name'='Butikk';
 x:=pg_temp.org_write(c,'unit',jsonb_build_object('name','Prosjekt','color','amber','parent_id',one));
 select (v->>'id')::uuid into child from jsonb_array_elements(x->'units')v where v->>'name'='Prosjekt';
 perform pg_temp.org_assert(jsonb_array_length(x->'units')=3,'arbitrary hierarchy');
 perform pg_temp.org_reject(format('select pg_temp.org_write(%L,%L,%L::jsonb)',c,'unit',jsonb_build_object('id',one,'name','Loop','parent_id',child,'manager_id',head,'color','teal')),'22023');
 perform pg_temp.org_reject(format('select pg_temp.org_write(%L,%L,%L::jsonb)',c,'remove_unit',jsonb_build_object('id',one)),'22023');
 foreach k in array array['self','ks','system'] loop
  perform set_config('request.jwt.claim.sub',current_setting('org.qa.'||k),true);
  x:=public.organization_state(c);perform pg_temp.org_assert(not(x#>>'{context,administer}')::boolean,'no role bypass '||k);
  perform pg_temp.org_reject(format('select pg_temp.org_write(%L,%L,%L::jsonb)',c,'unit','{"name":"Unauthorized","color":"blue"}'),'42501');
 end loop;
 perform set_config('request.jwt.claim.sub',current_setting('org.qa.outsider'),true);perform pg_temp.org_reject(format('select public.organization_state(%L)',c),'42501');
 perform set_config('request.jwt.claim.sub',current_setting('org.qa.foreign'),true);perform pg_temp.org_reject(format('select public.organization_state(%L)',c),'42501');
 perform set_config('request.jwt.claim.sub',head::text,true);
 x:=public.organization_state(c);
 perform pg_temp.org_assert((select (v->>'editable')::boolean from jsonb_array_elements(x->'units')v where v->>'id'=one::text),'head own unit');
 perform pg_temp.org_assert((select (v->>'editable')::boolean from jsonb_array_elements(x->'units')v where v->>'id'=child::text),'head descendants');
 perform pg_temp.org_assert(not(select (v->>'editable')::boolean from jsonb_array_elements(x->'units')v where v->>'id'=two::text),'head not other branch');
 x:=pg_temp.org_write(c,'unit',jsonb_build_object('id',child,'name','Montasje','parent_id',one,'color','amber'));
 perform pg_temp.org_assert((select v->>'name' from jsonb_array_elements(x->'units')v where v->>'id'=child::text)='Montasje','head rename descendant');
 perform pg_temp.org_reject(format('select pg_temp.org_write(%L,%L,%L::jsonb)',c,'unit',jsonb_build_object('id',child,'name','Montasje','parent_id',two,'color','amber')),'42501');
 perform pg_temp.org_reject(format('select pg_temp.org_write(%L,%L,%L::jsonb)',c,'unit',jsonb_build_object('id',child,'name','Montasje','parent_id',one,'manager_id',head,'color','amber')),'42501');
 payload:=jsonb_build_object('employee_id',u,'employee_revision',0,'unit_id',child,'title','Rørleggerlærling','kind','apprentice','leader_id',head,'confirm_leader_change',true);
 perform pg_temp.org_reject(format('select pg_temp.org_write(%L,%L,%L::jsonb)',c,'place',payload),'42501');
 perform set_config('request.jwt.claim.sub',a::text,true);
 x:=pg_temp.org_write(c,'place',payload);
 perform pg_temp.org_assert((select v->>'kind' from jsonb_array_elements(x->'people')v where v->>'id'=u::text)='apprentice','KS-only apprentice placement');
 perform pg_temp.org_assert((select v->>'leader_id' from jsonb_array_elements(x->'people')v where v->>'id'=u::text)=head::text,'KS-only nearest leader');
 payload:=jsonb_build_object('employee_id',head,'employee_revision',0,'unit_id',one,'title','Avdelingsleder','kind','leader','leader_id',u,'confirm_leader_change',true);
 perform pg_temp.org_reject(format('select pg_temp.org_write(%L,%L,%L::jsonb)',c,'place',payload),'22023');
 perform set_config('request.jwt.claim.sub',head::text,true);
 payload:=jsonb_build_object('employee_id',u,'employee_revision',0,'unit_id',one,'title','Lærling service','kind','apprentice','leader_id',head);
 x:=pg_temp.org_write(c,'place',payload);perform pg_temp.org_assert((select v->>'unit_id' from jsonb_array_elements(x->'people')v where v->>'id'=u::text)=one::text,'head placement within branch');
 perform pg_temp.org_reject(format('select pg_temp.org_write(%L,%L,%L::jsonb)',c,'place',payload||jsonb_build_object('unit_id',two)),'42501');
 perform pg_temp.org_reject(format('select pg_temp.org_write(%L,%L,%L::jsonb)',c,'place',payload||jsonb_build_object('leader_id',nexthead,'confirm_leader_change',true)),'42501');
 x:=pg_temp.org_write(c,'unplace',jsonb_build_object('employee_id',u,'employee_revision',0));
 perform pg_temp.org_assert((select v->>'unit_id' from jsonb_array_elements(x->'people')v where v->>'id'=u::text) is null,'unplaced still member');
 perform pg_temp.org_assert((select v->>'leader_id' from jsonb_array_elements(x->'people')v where v->>'id'=u::text)=head::text,'unplace retains nearest leader');
 perform set_config('request.jwt.claim.sub',a::text,true);
 x:=pg_temp.org_write(c,'remove_unit',jsonb_build_object('id',child));perform pg_temp.org_assert(jsonb_array_length(x->'units')=2,'remove empty unit');
 -- Depth includes height of the entire moved subtree, not only its parent.
 parent:=two;
 for i in 2..12 loop
  x:=pg_temp.org_write(c,'unit',jsonb_build_object('name','Nivå '||i,'parent_id',parent,'color','blue'));
  select (v->>'id')::uuid into parent from jsonb_array_elements(x->'units')v where v->>'name'='Nivå '||i;
 end loop;
 perform pg_temp.org_assert(jsonb_array_length(x->'units')=13,'12 levels supported');
 perform pg_temp.org_reject(format('select pg_temp.org_write(%L,%L,%L::jsonb)',c,'unit',jsonb_build_object('name','Too deep','parent_id',parent,'color','blue')),'22023');
 perform pg_temp.org_reject(format('select pg_temp.org_write(%L,%L,%L::jsonb)',c,'unit',jsonb_build_object('id',two,'name','Butikk','parent_id',one,'color','blue')),'22023');
 perform set_config('org.qa.unit',one::text,true);
end$$;
reset role;
-- Enable HR only on this isolated fixture after KS-only behavior was proven.
insert into public.company_module_access(company_id,module_key,enabled)values(current_setting('org.qa.company')::uuid,'hr',true);
insert into hr_private.module_access(company_id,user_id,enabled)select company_id,user_id,true from public.sales_company_memberships where company_id=current_setting('org.qa.company')::uuid;
set local role authenticated;
do $$declare c uuid:=current_setting('org.qa.company')::uuid;a uuid:=current_setting('org.qa.admin')::uuid;u uuid:=current_setting('org.qa.self')::uuid;
 head uuid:=current_setting('org.qa.head')::uuid;nexthead uuid:=current_setting('org.qa.new')::uuid;one uuid:=current_setting('org.qa.unit')::uuid;
 x jsonb;eid uuid;hrrev integer;oldrev integer;payload jsonb;begin
 perform set_config('request.jwt.claim.sub',a::text,true);
 perform public.hr_foundation_configure(c,0,true,'Syntetisk organisasjon og HR','Syntetisk vurdert behandlingsgrunnlag',current_date+30);
 perform pg_temp.org_reject(format('select public.hr_employee_command(%L,%L,%L::jsonb)',c,'create',jsonb_build_object('user_id',u,'leader_id',nexthead)),'22023');
 x:=public.hr_employee_command(c,'create',jsonb_build_object('user_id',u,'leader_id',head));eid:=(x#>>'{employee,id}')::uuid;
 perform pg_temp.org_assert(eid is not null,'controlled same HR leader at registration');
 perform pg_temp.org_reject(format('select public.hr_employee_command(%L,%L,%L::jsonb)',c,'create',jsonb_build_object('user_id',head,'leader_id',u)),'22023');
 x:=public.hr_employee_command(c,'reader',jsonb_build_object('id',eid,'revision',1,'reader_id',head,'reason','Syntetisk ekstra lesing'));hrrev:=(x#>>'{employee,revision}')::integer;
 payload:=jsonb_build_object('employee_id',u,'employee_revision',hrrev,'unit_id',one,'title','Fagarbeider','kind','employee','leader_id',nexthead);
 perform pg_temp.org_reject(format('select pg_temp.org_write(%L,%L,%L::jsonb)',c,'place',payload||'{"employee_revision":0}'::jsonb),'40001');
 perform pg_temp.org_reject(format('select pg_temp.org_write(%L,%L,%L::jsonb)',c,'place',payload),'22023');
 perform pg_temp.org_reject(format('select pg_temp.org_write(%L,%L,%L::jsonb)',c,'place',payload||'{"confirm_leader_change":"true"}'::jsonb),'22023');
 x:=pg_temp.org_write(c,'place',payload||'{"confirm_leader_change":true}'::jsonb);
 perform pg_temp.org_assert((select v->>'leader_id' from jsonb_array_elements(x->'people')v where v->>'id'=u::text)=nexthead::text,'shared nearest leader after explicit confirmation');
 perform pg_temp.org_assert(not(x::text like '%readers%'),'HR reader metadata excluded from response');
 perform set_config('request.jwt.claim.sub',head::text,true);perform pg_temp.org_reject(format('select public.hr_employee_get(%L,%L)',c,eid),'42501');
 perform set_config('request.jwt.claim.sub',nexthead::text,true);perform pg_temp.org_assert(public.hr_employee_get(c,eid)#>>'{employee,id}'=eid::text,'new leader HR history right');
 perform set_config('request.jwt.claim.sub',current_setting('org.qa.ks'),true);perform pg_temp.org_reject(format('select public.hr_employee_get(%L,%L)',c,eid),'42501');
 perform set_config('request.jwt.claim.sub',a::text,true);
 x:=public.organization_state(c);oldrev:=(x->>'revision')::integer;
 hrrev:=(public.hr_employee_get(c,eid)#>>'{employee,revision}')::integer;
 perform public.hr_employee_command(c,'leader',jsonb_build_object('id',eid,'revision',hrrev,'leader_id',head,'clear_old_leader_reader',true));
 x:=public.organization_state(c);perform pg_temp.org_assert((x->>'revision')::integer>oldrev,'direct HR leader change invalidates org revision');
 perform pg_temp.org_assert((select v->>'leader_id' from jsonb_array_elements(x->'people')v where v->>'id'=u::text)=head::text,'HR change visible in chart');
 perform pg_temp.org_reject(format('select public.organization_command(%L,%s,%L,%L::jsonb)',c,oldrev,'place',payload||'{"confirm_leader_change":true}'::jsonb),'40001');
 hrrev:=(public.hr_employee_get(c,eid)#>>'{employee,revision}')::integer;
 perform public.hr_employee_command(c,'end',jsonb_build_object('id',eid,'revision',hrrev,'confirm','END_AND_DELETE'));
 x:=public.organization_state(c);perform pg_temp.org_assert(not exists(select 1 from jsonb_array_elements(x->'people')v where v->>'id'=u::text),'departed removed from chart');
 perform set_config('request.jwt.claim.sub',u::text,true);perform pg_temp.org_reject(format('select public.organization_state(%L)',c),'42501');
 perform set_config('request.jwt.claim.sub',a::text,true);
 x:=public.hr_employee_command(c,'create',jsonb_build_object('user_id',head));eid:=(x#>>'{employee,id}')::uuid;
 perform public.hr_employee_command(c,'end',jsonb_build_object('id',eid,'revision',1,'confirm','END_AND_DELETE'));
 x:=public.organization_state(c);perform pg_temp.org_assert((select v->>'manager_id' from jsonb_array_elements(x->'units')v where v->>'id'=one::text) is null,'departed head delegation removed');
end$$;
reset role;
update public.kshms_member_access set enabled=false where company_id=current_setting('org.qa.company')::uuid and user_id=current_setting('org.qa.ks')::uuid;
update public.profiles set deactivated=true where id=current_setting('org.qa.new')::uuid;
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('org.qa.ks'),true);
select pg_temp.org_reject(format('select public.organization_state(%L)',current_setting('org.qa.company')),'42501');
select set_config('request.jwt.claim.sub',current_setting('org.qa.new'),true);
select pg_temp.org_reject(format('select public.organization_state(%L)',current_setting('org.qa.company')),'42501');
reset role;
update public.company_module_access set enabled=false where company_id=current_setting('org.qa.company')::uuid and module_key='kshms';
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('org.qa.admin'),true);
select pg_temp.org_reject(format('select public.organization_state(%L)',current_setting('org.qa.company')),'42501');
select pg_temp.org_reject('select * from org_private.units','42501');
reset role;
select pg_temp.org_assert(not has_function_privilege('anon','public.organization_state(uuid)','EXECUTE'),'anon RPC denied');
select pg_temp.org_assert(not has_function_privilege('service_role','public.organization_command(uuid,integer,text,jsonb)','EXECUTE'),'service_role no write bypass');
select pg_temp.org_assert((select bool_and(relrowsecurity) from pg_class t join pg_namespace n on n.oid=t.relnamespace where n.nspname='org_private' and t.relkind='r'),'all private tables RLS');
select current_setting('org.qa.count')::integer assertions_pass;
rollback;
