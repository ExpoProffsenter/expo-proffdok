-- Sandbox only. Synthetic project and all writes roll back; no email/provider.
begin;
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $$
declare c uuid:='e0000000-0000-4000-8000-000000000001';r jsonb;s jsonb;t jsonb;d jsonb;a jsonb;receipt jsonb;
 root uuid;unit uuid;pkg uuid;did uuid;pub jsonb;answer jsonb;portal_token text;
 token text:=encode(sha256(convert_to(gen_random_uuid()::text||gen_random_uuid()::text,'UTF8')),'hex');
begin
 r:=public.bolig_workspace(c,'create_plan',null,null,jsonb_build_object('request_id',gen_random_uuid(),'title','QA DEADLINE ROLLBACK','reference','QA-DEADLINE-ROLLBACK','buildings',jsonb_build_array(jsonb_build_object('name','QA','building_type','apartment','address','','house_floors',1,'entrances',jsonb_build_array(jsonb_build_object('address','','counts','[1]'::jsonb))))));
 root:=(r#>>'{root,id}')::uuid;unit:=(r#>>'{units,0,id}')::uuid;
 s:=public.bolig_catalog(c,root,'package',0,jsonb_build_object('name','QA','lines',jsonb_build_array(jsonb_build_object('key','a','name','QA Servant','quantity',1,'unit','stk'))));
 pkg:=(s#>>'{packages,0,id}')::uuid;t:=public.bolig_package_choices(c,root,unit);
 perform public.bolig_package_choices(c,root,unit,'save',0,jsonb_build_object('scope_id','common','package_id',pkg,'option_ids','[]'::jsonb,'catalog_revision',t->'revision','rooms_revision',t->'rooms_revision'));
 execute 'reset role';
 update bolig_private.units set contact_name='QA Beboer',contact_email='qa-deadline@example.invalid' where id=unit;
 execute 'set local role authenticated';
 begin
  perform public.bolig_commerce(c,root,unit,'create',jsonb_build_object('request_id',gen_random_uuid(),'kind','choice','choice_revision',1,'reason','QA invalid calendar date','acceptance_deadline','2030-02-30'));
  raise exception 'Invalid date accepted';
 exception when sqlstate '22023' then null;end;
 s:=public.bolig_commerce(c,root,unit,'create',jsonb_build_object('request_id',gen_random_uuid(),'kind','choice','choice_revision',1,'reason','QA fictional deadline only','acceptance_deadline','2030-06-10'));
 did:=(s->>'document_id')::uuid;select x into d from jsonb_array_elements(s->'documents') x where x->>'id'=did::text;
 if (d->>'expires_at')::timestamptz<>'2030-06-10 22:00:00Z'::timestamptz then raise exception 'Wrong draft deadline';end if;
 s:=public.bolig_commerce(c,root,unit,'approve',jsonb_build_object('request_id',gen_random_uuid(),'document_id',did,'revision',d->'revision'));
 select x into d from jsonb_array_elements(s->'documents') x where x->>'id'=did::text;
 pub:=jsonb_build_object('request_id',gen_random_uuid(),'document_id',did,'revision',d->'revision','token',token,'acceptance_deadline','2030-10-27');
 receipt:=public.bolig_commerce(c,root,unit,'publish',pub);
 select x into d from jsonb_array_elements(receipt->'documents') x where x->>'id'=did::text;
 if (d->>'expires_at')::timestamptz<>'2030-10-27 23:00:00Z'::timestamptz then raise exception 'Wrong published Oslo winter boundary';end if;
 if public.bolig_commerce(c,root,unit,'publish',pub) is distinct from receipt then raise exception 'Publication replay changed date';end if;
 begin
  perform public.bolig_commerce(c,root,unit,'publish',pub||jsonb_build_object('acceptance_deadline','2030-10-28'));
  raise exception 'Changed retry accepted';exception when sqlstate 'PT409' then null;end;
 portal_token:=encode(sha256(convert_to(gen_random_uuid()::text,'UTF8')),'hex');
 perform public.bolig_resident_portal(c,root,unit,'publish',jsonb_build_object('request_id',gen_random_uuid(),'revision',0,'token',portal_token,'reviewed',true));
 execute 'reset role';update bolig_private.commercial_documents set expires_at=clock_timestamp()+interval '20 milliseconds' where id=did;
 perform pg_sleep(0.03);
 perform set_config('request.jwt.claim.sub','',true);execute 'set local role anon';
 answer:=jsonb_build_object('name','QA Synthetic Resident','confirmed',true,'request_id',gen_random_uuid());
 begin
  perform public.bolig_resident_decision(token,'accept',did,answer);
  raise exception 'Expired direct acceptance succeeded';exception when sqlstate '42501' then null;end;
 begin
  perform public.bolig_portal(portal_token,'accept',answer||jsonb_build_object('document_id',did));
  raise exception 'Expired portal acceptance succeeded';exception when sqlstate '42501' then null;end;
 execute 'reset role';update bolig_private.commercial_documents set expires_at=now() where id=did;
 execute 'set local role authenticated';perform set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000001',true);
 s:=public.bolig_commerce(c,root,unit);select x into d from jsonb_array_elements(s->'documents') x where x->>'id'=did::text;
 if d->>'status'<>'expired' then raise exception 'Expired history disappeared';end if;
 if public.bolig_commerce(c,root,unit,'publish',pub) is distinct from receipt then raise exception 'Late exact replay changed date';end if;
 execute 'reset role';update bolig_private.commercial_documents set expires_at=now()+interval '1 day' where id=did;
 perform set_config('request.jwt.claim.sub','',true);execute 'set local role anon';
 a:=public.bolig_resident_decision(token,'accept',did,answer);
 if a->>'status'<>'accepted' then raise exception 'In-time acceptance failed';end if;
 execute 'reset role';update bolig_private.commercial_documents set expires_at=now()-interval '1 day' where id=did;
 execute 'set local role anon';
 s:=public.bolig_resident_decision(token,'accept',did,answer);
 if s->>'status'<>'accepted' or s->>'accepted_at' is distinct from a->>'accepted_at' or s->>'accepted_name' is distinct from a->>'accepted_name' then raise exception 'Accepted receipt lost after deadline';end if;
end$$;
reset role;
rollback;
select 'PASS native deadline: chosen draft/publication dates, Oslo DST, exact retries, expired direct/portal denials and permanent accepted receipt; all synthetic writes rolled back' as result;
