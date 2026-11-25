-- Synthetic PostgreSQL test. No real employee acknowledges any routine.
begin;
create function pg_temp.bulk_assert(ok boolean,label text) returns void language plpgsql as $$begin if ok is distinct from true then raise exception 'Batch QA: %',label;end if;end$$;
create function pg_temp.bulk_reject(statement text,expected text) returns void language plpgsql as $$begin
 begin execute statement;exception when others then if sqlstate=expected then return;end if;raise;end;
 raise exception 'Batch QA: expected rejection %',expected;
end$$;
do $$declare c uuid:=gen_random_uuid();b uuid:=gen_random_uuid();u uuid;k text;begin
 insert into public.sales_company_scopes(id,normalized_name,display_name) values(c,'bulk-qa-'||c,'Synthetic bulk QA'),(b,'bulk-qa-'||b,'Synthetic other QA');
 perform set_config('bulk.qa.company',c::text,true);perform set_config('bulk.qa.other',b::text,true);
 foreach k in array array['admin','responsible','reader','outsider','system'] loop
  u:=gen_random_uuid();perform set_config('bulk.qa.'||k,u::text,true);
  insert into auth.users(id,aud,role,email,created_at,updated_at,raw_app_meta_data,raw_user_meta_data)
  values(u,'authenticated','authenticated','bulk-qa-'||u||'@example.invalid',now(),now(),'{}',jsonb_build_object('full_name','Synthetic '||k));
  insert into public.profiles(id,email,company_name,approved,deactivated,role,company_role,system_role)
  values(u,'bulk-qa-'||u||'@example.invalid','bulk-qa-'||case when k='outsider' then b else c end,true,false,'member',case when k='admin' then 'firmaadmin' else 'ansatt' end,case when k='system' then 'systemadmin' end)
  on conflict(id) do update set approved=true,deactivated=false,role='member',company_role=excluded.company_role,system_role=excluded.system_role;
  insert into public.sales_company_memberships(company_id,user_id,is_primary,workspace_role)
  values(case when k='outsider' then b else c end,u,true,case when k='admin' then 'firmaadmin' else 'ansatt' end)
  on conflict(company_id,user_id) do update set workspace_role=excluded.workspace_role;
  insert into public.user_active_company_scope(user_id,company_id) values(u,case when k='outsider' then b else c end) on conflict(user_id) do update set company_id=excluded.company_id;
 end loop;
 insert into public.company_module_access(company_id,module_key,enabled) values(c,'kshms',true),(b,'kshms',true);
end$$;
set local role authenticated;
do $$declare c uuid:=current_setting('bulk.qa.company')::uuid;
 admin_id uuid:=current_setting('bulk.qa.admin')::uuid;reader_id uuid:=current_setting('bulk.qa.reader')::uuid;responsible_id uuid:=current_setting('bulk.qa.responsible')::uuid;
 r jsonb;v jsonb;ids uuid[]:='{}';outcome jsonb;state jsonb;prior jsonb;n int;
 statement text:='Jeg bekrefter at jeg har lest og forstått alle rutineutgavene i listen, forstår mitt ansvar og vil følge rutinene. Jeg ber om forklaring eller nødvendig opplæring dersom noe er uklart, og melder fra om farlige forhold og avvik. Bekreftelsen gjelder min egen gjennomgang av de oppførte utgavene; den erstatter ikke opplæring eller faktisk utførelse.';
 single_statement text:='Jeg har gjennomgått denne rutineversjonen, forstår mitt ansvar og vil følge rutinen. Jeg ber om forklaring eller nødvendig opplæring dersom noe er uklart, og melder fra om farlige forhold og avvik. Bekreftelsen dokumenterer gjennomgang; den erstatter ikke opplæring eller faktisk utførelse.';
 draft jsonb:='{"title":"Synthetic warehouse QA","chapter":"QA","goal":"Goal","responsibility":"Owner","procedure":"Synthetic safe steps","documentation":"Checks","confirmation":"Own reading","references":[]}';
begin
 perform set_config('request.jwt.claim.sub',admin_id::text,true);
 perform public.kshms_command(c,'access',jsonb_build_object('user_id',responsible_id,'role','responsible','enabled',true));
 perform public.kshms_command(c,'access',jsonb_build_object('user_id',reader_id,'role','reader','enabled',true));
 perform public.kshms_command(c,'settings',jsonb_build_object('revision',0,'trades',jsonb_build_array('vvs'),'activities','Synthetic warehouse','responsible_user_id',responsible_id));
 for n in 1..86 loop
  r:=public.kshms_command(c,'save',jsonb_build_object('draft',jsonb_set(draft,'{title}',to_jsonb('Synthetic QA '||n))));
  v:=public.kshms_command(c,'publish',jsonb_build_object('id',r->>'id','revision',1,'change_summary','Synthetic initial edition'));
  ids:=array_append(ids,(v->>'id')::uuid);
 end loop;
 -- An informational second edition is still included in explicit bulk consent.
 r:=public.kshms_command(c,'save',jsonb_build_object('id',r->>'id','revision',2,'draft',jsonb_set(draft,'{procedure}',to_jsonb('Synthetic changed steps'::text))));
 v:=public.kshms_command(c,'publish',jsonb_build_object('id',r->>'id','revision',r->>'revision','change_summary','Synthetic informational edition','requires_ack',false));
 ids:=array_append(ids,(v->>'id')::uuid);perform set_config('bulk.qa.ids',ids::text,true);
 perform set_config('request.jwt.claim.sub',reader_id::text,true);
 perform pg_temp.bulk_assert(not(public.get_kshms_context()->>'manage')::boolean,'reader remains reader');
 perform pg_temp.bulk_reject(format('select public.kshms_acknowledge_batch(%L,%L,%L,%L)',c,reader_id,ids::text,'Wrong consent'),'22023');
 perform pg_temp.bulk_reject(format('select public.kshms_acknowledge_batch(%L,%L,%L,%L)',c,admin_id,ids::text,statement),'42501');
 perform pg_temp.bulk_reject(format('select public.kshms_acknowledge_batch(%L,%L,%L,%L)',current_setting('bulk.qa.other'),reader_id,ids::text,statement),'42501');
 perform pg_temp.bulk_reject(format('select public.kshms_acknowledge_batch(%L,%L,%L,%L)',c,reader_id,'{}',statement),'22023');
 perform pg_temp.bulk_reject(format('select public.kshms_acknowledge_batch(%L,%L,null,%L)',c,reader_id,statement),'22023');
 perform pg_temp.bulk_reject(format('select public.kshms_acknowledge_batch(%L,%L,%L,%L)',c,reader_id,array[ids[1],ids[1]]::text,statement),'22023');
 perform pg_temp.bulk_reject(format('select public.kshms_acknowledge_batch(%L,%L,%L,%L)',c,reader_id,array[ids[1],null::uuid]::text,statement),'22023');
 perform pg_temp.bulk_reject(format('select public.kshms_acknowledge_batch(%L,%L,%L,%L)',c,reader_id,array[ids[1:2],ids[3:4]]::text,statement),'22023');
 perform pg_temp.bulk_reject(format('select public.kshms_acknowledge_batch(%L,%L,%L,%L)',c,reader_id,array_fill(ids[1],array[501])::text,statement),'22023');
 perform pg_temp.bulk_reject(format('select public.kshms_acknowledge_batch(%L,%L,%L,%L)',c,reader_id,array_append(ids,gen_random_uuid())::text,statement),'42501');
 perform pg_temp.bulk_reject(format('select public.kshms_acknowledge_batch(%L,%L,%L,%L)',c,reader_id,ids[1:86]::text,statement),'40001');
 perform pg_temp.bulk_assert(jsonb_array_length(public.kshms_get_state(c)->'acknowledgments')=0,'invalid/incomplete batch writes no partial receipts');
 perform public.kshms_command(c,'ack',jsonb_build_object('version_id',ids[1],'statement',single_statement));
 prior:=public.kshms_get_state(c)->'acknowledgments';
 outcome:=public.kshms_acknowledge_batch(c,reader_id,ids,statement);
 state:=public.kshms_get_state(c);
 perform pg_temp.bulk_assert(outcome->>'inserted_count'='86' and jsonb_array_length(state->'acknowledgments')=87,'single plus 86 new atomic receipts');
 perform pg_temp.bulk_assert(exists(select 1 from jsonb_array_elements(state->'acknowledgments') a where a=prior->0),'previous single statement/time/identity preserved');
 perform pg_temp.bulk_assert((select count(distinct a->>'acknowledged_at')=1 from jsonb_array_elements(state->'acknowledgments') a where a->>'statement'=statement),'all new rows use the same server clock');
 perform pg_temp.bulk_assert((select bool_and(a->'user_identity'->>'id'=reader_id::text and a->'user_identity'->>'name'='Synthetic reader') from jsonb_array_elements(state->'acknowledgments') a),'saved identity is the actual reader');
 prior:=state->'acknowledgments';
 outcome:=public.kshms_acknowledge_batch(c,reader_id,ids,statement);
 perform pg_temp.bulk_assert(outcome->>'inserted_count'='0' and public.kshms_get_state(c)->'acknowledgments'=prior,'retry never rewrites immutable receipts');
 for n in 1..2 loop
  perform set_config('request.jwt.claim.sub',case when n=1 then responsible_id else admin_id end::text,true);
  outcome:=public.kshms_acknowledge_batch(c,case when n=1 then responsible_id else admin_id end,ids,statement);
  perform pg_temp.bulk_assert(outcome->>'inserted_count'='87','responsible/admin may confirm own complete assigned set');
 end loop;
 perform set_config('request.jwt.claim.sub',admin_id::text,true);
 r:=public.kshms_command(c,'save',jsonb_build_object('draft',jsonb_set(draft,'{title}',to_jsonb('Synthetic new assignment'::text))));
 v:=public.kshms_command(c,'publish',jsonb_build_object('id',r->>'id','revision',1,'change_summary','Synthetic new assignment'));
 perform set_config('request.jwt.claim.sub',reader_id::text,true);
 perform pg_temp.bulk_reject(format('select public.kshms_acknowledge_batch(%L,%L,%L,%L)',c,reader_id,ids::text,statement),'40001');
 perform pg_temp.bulk_assert(jsonb_array_length(public.kshms_get_state(c)->'acknowledgments')=87,'new edition does not inherit previous batch');
 perform set_config('bulk.qa.new_version',v->>'id',true);
end$$;
reset role;
do $$declare c uuid:=current_setting('bulk.qa.company')::uuid;u uuid:=current_setting('bulk.qa.reader')::uuid;begin
 perform pg_temp.bulk_assert((select count(*)=261 from public.kshms_acknowledgments where company_id=c),'only 87 own receipts for each of three users');
 perform pg_temp.bulk_assert((select count(*)=260 from public.kshms_audit where company_id=c and action='ack_batch'),'one audit row per inserted batch receipt; retries add none');
 perform pg_temp.bulk_reject(format('update public.kshms_acknowledgments set statement=%L where company_id=%L','rewrite',c),'42501');
 -- A stale or revoked assignment must fail before adding any receipt.
 update public.kshms_routines set archived=true where company_id=c and id=(select routine_id from public.kshms_versions where id=current_setting('bulk.qa.new_version')::uuid);
 perform set_config('request.jwt.claim.sub',u::text,true);
 perform pg_temp.bulk_reject(format('select public.kshms_acknowledge_batch(%L,%L,%L,%L)',c,u,array[current_setting('bulk.qa.new_version')::uuid]::text,'Jeg bekrefter at jeg har lest og forstått alle rutineutgavene i listen, forstår mitt ansvar og vil følge rutinene. Jeg ber om forklaring eller nødvendig opplæring dersom noe er uklart, og melder fra om farlige forhold og avvik. Bekreftelsen gjelder min egen gjennomgang av de oppførte utgavene; den erstatter ikke opplæring eller faktisk utførelse.'),'42501');
 update public.kshms_member_access set enabled=false where company_id=c and user_id=u;
end$$;
set local role authenticated;
do $$declare c uuid:=current_setting('bulk.qa.company')::uuid;u uuid:=current_setting('bulk.qa.reader')::uuid;statement text:='Jeg bekrefter at jeg har lest og forstått alle rutineutgavene i listen, forstår mitt ansvar og vil følge rutinene. Jeg ber om forklaring eller nødvendig opplæring dersom noe er uklart, og melder fra om farlige forhold og avvik. Bekreftelsen gjelder min egen gjennomgang av de oppførte utgavene; den erstatter ikke opplæring eller faktisk utførelse.';begin
 perform pg_temp.bulk_reject(format('select public.kshms_acknowledge_batch(%L,%L,%L,%L)',c,u,current_setting('bulk.qa.ids'),statement),'42501');
 perform set_config('request.jwt.claim.sub',current_setting('bulk.qa.outsider'),true);
 perform pg_temp.bulk_reject(format('select public.kshms_acknowledge_batch(%L,%L,%L,%L)',c,current_setting('bulk.qa.outsider'),current_setting('bulk.qa.ids'),statement),'42501');
 perform set_config('request.jwt.claim.sub',current_setting('bulk.qa.system'),true);
 perform pg_temp.bulk_reject(format('select public.kshms_acknowledge_batch(%L,%L,%L,%L)',c,current_setting('bulk.qa.system'),current_setting('bulk.qa.ids'),statement),'42501');
 perform pg_temp.bulk_reject('select * from public.kshms_acknowledgments','42501');
end$$;
reset role;
do $$declare c uuid:=current_setting('bulk.qa.company')::uuid;begin
 update public.company_module_access set enabled=false where company_id=c and module_key='kshms';
 perform set_config('request.jwt.claim.sub',current_setting('bulk.qa.admin'),true);
 perform pg_temp.bulk_reject(format('select public.kshms_acknowledge_batch(%L,%L,%L,%L)',c,current_setting('bulk.qa.admin'),current_setting('bulk.qa.ids'),'consent'),'42501');
 perform pg_temp.bulk_assert(not has_function_privilege('anon','public.kshms_acknowledge_batch(uuid,uuid,uuid[],text)','execute'),'anon cannot call');
 perform pg_temp.bulk_assert(not has_function_privilege('service_role','public.kshms_acknowledge_batch(uuid,uuid,uuid[],text)','execute'),'server worker cannot call');
end$$;
select jsonb_build_object('result','PASS','editions',87,'new_batch_receipts',260,'real_employee_writes',0,'transaction','ROLLBACK') as bulk_qa;
rollback;
