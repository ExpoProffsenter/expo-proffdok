-- SANDBOX ONLY: fictional project; all writes rolled back. No email is sent.
begin;
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $$
declare c uuid:='e0000000-0000-4000-8000-000000000001';actor uuid:='d0000000-0000-4000-8000-000000000001';rec jsonb;v jsonb;before jsonb;tree jsonb;ex jsonb;root uuid;unit uuid;block uuid;entry jsonb;decisions jsonb:='[]';request uuid:=gen_random_uuid();payload jsonb;
begin
 rec:=public.bolig_workspace(c,'create_plan',null,null,jsonb_build_object('request_id',gen_random_uuid(),'title','QA – Overtakelse uten falsk ferdigmelding','reference','QA-HANDOVER-ROLLBACK','buildings',jsonb_build_array(jsonb_build_object('name','QA Bygg','building_type','apartment','address','','house_floors',1,'entrances',jsonb_build_array(jsonb_build_object('address','','counts','[2]'::jsonb))))));
 root:=(rec#>>'{root,id}')::uuid;unit:=(rec#>>'{units,0,id}')::uuid;block:=(rec#>>'{blocks,0,id}')::uuid;
 v:=public.bolig_handover_review(c,root,unit);
 if jsonb_array_length(v->'cases')=0 then raise exception 'Expected explicit open controls';end if;
 -- Persist an incomplete assessment without inventing decisions or approval.
 v:=public.bolig_handover_review(c,root,unit,'assess',(v->>'revision')::bigint,jsonb_build_object('request_id',gen_random_uuid(),'basis',v->>'basis','decisions','[]'::jsonb,'confirmed',false));
 if v#>>'{assessment,complete}'<>'false' or v->'record'<>'null'::jsonb then raise exception 'Partial assessment must not record handover';end if;
 for entry in select value from jsonb_array_elements(v->'cases') loop decisions:=decisions||jsonb_build_array(jsonb_build_object('id',entry->>'id','decision','carry','reason','QA – prosjektleder har gjennomgått forholdet. Videre oppfølging dokumenteres uten å ferdigmelde kontrollen.','owner_id',actor,'critical_confirmed',true));end loop;
 payload:=jsonb_build_object('request_id',request,'basis',v->>'basis','decisions',decisions,'confirmed',true,'date',(now() at time zone 'Europe/Oslo')::date,'reference','QA – fiktiv protokoll, ikke en kundesak');before:=v;
 v:=public.bolig_handover_review(c,root,unit,'record',(v->>'revision')::bigint,payload);
 if public.bolig_handover_review(c,root,unit,'record',(before->>'revision')::bigint,payload) is distinct from v then raise exception 'Exact retry changed result';end if;
 tree:=public.bolig_completion(c,root,unit);
 select value into entry from jsonb_array_elements(tree->'rows') where value->>'scope_id'=unit::text;
 if entry->>'status'<>'handed_over_with_rest' or entry->>'control_status'<>'not_started' or entry->'approval'<>'null'::jsonb then raise exception 'Actual handover must not certify controls';end if;
 ex:=public.bolig_documentation_export(c,root,unit);
 if not exists(select 1 from jsonb_array_elements(ex->'scopes') s where s->>'id'=unit::text and s#>>'{handover_review,record,reference}'='QA – fiktiv protokoll, ikke en kundesak') then raise exception 'Export must include decision';end if;
 -- A building may be recorded separately after explicit review; no apartment is
 -- silently handed over, and missing child control remains visible.
 v:=public.bolig_handover_review(c,root,block);decisions:='[]';
 for entry in select value from jsonb_array_elements(v->'cases') loop decisions:=decisions||jsonb_build_array(jsonb_build_object('id',entry->>'id','decision','carry','reason','QA – underliggende åpne forhold er vurdert særskilt for byggregistreringen.','owner_id',actor,'critical_confirmed',true));end loop;
 v:=public.bolig_handover_review(c,root,block,'record',(v->>'revision')::bigint,jsonb_build_object('request_id',gen_random_uuid(),'basis',v->>'basis','decisions',decisions,'confirmed',true,'date',(now() at time zone 'Europe/Oslo')::date,'reference','QA – fiktiv byggprotokoll'));
 if v->'record'='null'::jsonb then raise exception 'Expected explicit building record';end if;
end$$;
reset role;
select jsonb_build_object('smoke','PASS','mail_enabled',(select enabled from bolig_private.progress_mail_settings where singleton),'transport_jobs',(select count(*) from bolig_private.dialogue_deliveries)) as result;
rollback;
select count(*) as rollback_roots from bolig_private.roots where reference='QA-HANDOVER-ROLLBACK';
