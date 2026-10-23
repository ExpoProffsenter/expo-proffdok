-- SANDBOX ONLY. All synthetic writes roll back. Transport remains OFF.
begin;
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $smoke$
declare c uuid:='e0000000-0000-4000-8000-000000000001';rec jsonb;s jsonb;p jsonb;r jsonb;root uuid;unit uuid;other_unit uuid;gid uuid;today text:=(now() at time zone 'Europe/Oslo')::date::text;
begin
 rec:=public.bolig_workspace(c,'create_plan',null,null,jsonb_build_object('request_id',gen_random_uuid(),'title','QA – Notice composer rollback','reference','QA-NOTICE-ROLLBACK','buildings',jsonb_build_array(jsonb_build_object('name','QA Bygg','building_type','apartment','address','','house_floors',1,'entrances',jsonb_build_array(jsonb_build_object('address','','counts','[2]'::jsonb))))));
 root:=(rec#>>'{root,id}')::uuid;unit:=(rec#>>'{units,0,id}')::uuid;other_unit:=(rec#>>'{units,1,id}')::uuid;
 s:=public.bolig_progress(c,root);gid:=gen_random_uuid();
 p:=jsonb_build_object('id',gid,'request_id',gen_random_uuid(),'revision',s->'revision','mode','paper','title','QA Vannet stenges','body','QA – Fiktivt papirvarsel, ingen utsending.','start',today,'end',today,'publish_on',today,'audience_label','QA Bygg','unit_ids',jsonb_build_array(unit,other_unit),'contact',jsonb_build_object('name','QA Prosjektleder','phone','12345678','email','qa@example.invalid'),'recipient_basis',(select jsonb_object_agg(u->>'id',u->'notice_basis') from jsonb_array_elements(s->'units') u));
 r:=public.bolig_progress(c,root,null,'resident_notice',p);
 if public.bolig_progress(c,root,null,'resident_notice',p) is distinct from r then raise exception 'Unsafe retry';end if;
 if jsonb_array_length(r->'tasks')<>0 or jsonb_array_length(r->'notices')<>2 or exists(select 1 from jsonb_array_elements(r->'notices') n where n->>'paper_ready'<>'true' or n->>'published_at' is not null) then raise exception 'Paper failed or created artificial work/publication';end if;
 s:=public.bolig_progress(c,root,unit);if jsonb_array_length(s->'notices')<>1 then raise exception 'Unit scope leak';end if;
 rec:=public.bolig_workspace(c,'get',root);rec:=public.bolig_workspace(c,'unit',root,(rec#>>'{root,revision}')::bigint,jsonb_build_object('id',unit,'number','H0101','contact_name','QA Resident','contact_email','qa@example.invalid'));
 s:=public.bolig_progress(c,root);p:=p||jsonb_build_object('id',gen_random_uuid(),'request_id',gen_random_uuid(),'revision',s->'revision','mode','publish','unit_ids',jsonb_build_array(unit),'recipient_basis',(select jsonb_object_agg(u->>'id',u->'notice_basis') from jsonb_array_elements(s->'units') u));
 r:=public.bolig_progress(c,root,null,'resident_notice',p);if not exists(select 1 from jsonb_array_elements(r->'notices') n where n->>'group_id'=p->>'id' and n->>'valid'='true' and n->>'published_at' is not null) then raise exception 'One-step publication failed';end if;
end$smoke$;
rollback;
select 'PASS – paper, full audience, no artificial activity, exact retry, scope and one-step portal publication; writes rolled back' as result;
