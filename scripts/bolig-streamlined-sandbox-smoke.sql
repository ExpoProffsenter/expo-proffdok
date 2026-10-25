-- Real sandbox gateways and policies. All synthetic writes roll back.
begin;
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $$
declare c uuid:='e0000000-0000-4000-8000-000000000001';r jsonb;s jsonb;t jsonb;row_data jsonb;preview jsonb;payload jsonb;root uuid;unit uuid;second uuid;block uuid;checkid uuid;point uuid:=gen_random_uuid();scope uuid;content jsonb;path text;v jsonb;entry jsonb;decisions jsonb;root_handover jsonb;
begin
 r:=public.bolig_workspace(c,'create_plan',null,null,jsonb_build_object('request_id',gen_random_uuid(),'title','QA ENKEL FLYT - ROLLBACK','reference','QA-SMOKE','buildings',jsonb_build_array(jsonb_build_object('name','Foreløpig bygg','building_type','apartment','address','','house_floors',1,'entrances',jsonb_build_array(jsonb_build_object('address','','counts','[1]'::jsonb),jsonb_build_object('address','','counts','[1]'::jsonb))))));
 root:=(r#>>'{root,id}')::uuid;unit:=(r#>>'{units,0,id}')::uuid;second:=(r#>>'{units,1,id}')::uuid;block:=(r#>>'{blocks,0,id}')::uuid;
 if exists(select 1 from jsonb_array_elements(r->'entrances') x where x->>'address'<>'') then raise exception 'Unknown addresses were invented';end if;
 content:=jsonb_build_object('title','Prosjektets sluttkontroll','trade','Felles – alle fag','instructions','Syntetisk kontroll','points',jsonb_build_array(jsonb_build_object('id',point,'title','Funksjon er kontrollert','guidance','','image_required',false,'comment_required',false)));
 s:=public.bolig_quality(c,root,unit,'check_add',0,jsonb_build_object('content',content,'required',false));checkid:=(s#>>'{data,checks,0,id}')::uuid;
 t:=public.bolig_completion(c,root,unit);select x into row_data from jsonb_array_elements(t->'rows') x where x->>'scope_id'=unit::text;
 if exists(select 1 from jsonb_array_elements_text(row_data->'issues') x where x like '%sjekkliste%') or jsonb_array_length(row_data->'warnings')=0 then raise exception 'Optional draft incorrectly blocks';end if;
 s:=public.bolig_quality(c,root,unit,'check_save',(s->>'revision')::bigint,jsonb_build_object('id',checkid,'required',true,'complete',true,'answers',jsonb_build_object(point::text,jsonb_build_object('status','Avvik','severity','minor','comment','Rosett justeres senere','values','{}'::jsonb,'documents','[]'::jsonb))));
 t:=public.bolig_completion(c,root,unit);select x into row_data from jsonb_array_elements(t->'rows') x where x->>'scope_id'=unit::text;
 t:=public.bolig_completion(c,root,unit,'start',(row_data->>'revision')::bigint,jsonb_build_object('basis',row_data->>'basis'));
 select x into row_data from jsonb_array_elements(t->'rows') x where x->>'scope_id'=unit::text;
 t:=public.bolig_completion(c,root,unit,'review_all',(row_data->>'revision')::bigint,jsonb_build_object('basis',row_data->>'basis','confirmed',true,'note',''));
 select x into row_data from jsonb_array_elements(t->'rows') x where x->>'scope_id'=unit::text;
 t:=public.bolig_completion(c,root,unit,'approve',(row_data->>'revision')::bigint,jsonb_build_object('basis',row_data->>'basis'));
 select x into row_data from jsonb_array_elements(t->'rows') x where x->>'scope_id'=unit::text;
 if row_data->>'status'<>'ready_with_rest' or jsonb_array_length(row_data->'restpoints')<>1 then raise exception 'Wrong disclosed readiness';end if;
 payload:=jsonb_build_object('sources',jsonb_build_array(jsonb_build_object('kind','project','id',checkid,'scope_id',unit)),'targets',jsonb_build_array(jsonb_build_object('scope_id',unit),jsonb_build_object('scope_id',second)),'required',false);
 preview:=public.bolig_quality_distribution(c,root,'preview',payload);
 if (preview->>'added')::int<>1 or (preview->>'skipped')::int<>1 then raise exception 'Wrong distribution preview';end if;
 payload:=payload||jsonb_build_object('basis',preview->>'basis','request_id',gen_random_uuid());
 r:=public.bolig_quality_distribution(c,root,'apply',payload);
 if (r->>'added')::int<>1 or (public.bolig_quality_distribution(c,root,'apply',payload)->>'replayed')::boolean is not true then raise exception 'Distribution replay unsafe';end if;
 s:=public.bolig_quality(c,root,second);
 if s#>'{data,checks,0,answers}'<>'{}'::jsonb then raise exception 'Source answers copied';end if;
 foreach scope in array array[second,block,root] loop
  t:=public.bolig_completion(c,root,scope);select x into row_data from jsonb_array_elements(t->'rows') x where x->>'scope_id'=scope::text;
  t:=public.bolig_completion(c,root,scope,case when scope=second then 'start' else 'no_common' end,(row_data->>'revision')::bigint,jsonb_build_object('basis',row_data->>'basis','reason',''));
  select x into row_data from jsonb_array_elements(t->'rows') x where x->>'scope_id'=scope::text;
  if scope=second then
   t:=public.bolig_completion(c,root,scope,'review_all',(row_data->>'revision')::bigint,jsonb_build_object('basis',row_data->>'basis','confirmed',true,'note',''));
   select x into row_data from jsonb_array_elements(t->'rows') x where x->>'scope_id'=scope::text;
  end if;
  t:=public.bolig_completion(c,root,scope,'approve',(row_data->>'revision')::bigint,jsonb_build_object('basis',row_data->>'basis'));
 end loop;
 foreach scope in array array[unit,second,block,root] loop
  -- Actual handover uses the manager assessment; it must not bypass open cases.
  v:=public.bolig_handover_review(c,root,scope);decisions:='[]';
  for entry in select value from jsonb_array_elements(v->'cases') loop
   decisions:=decisions||jsonb_build_array(jsonb_build_object('id',entry->>'id','decision','carry','reason','QA – fiktivt forhold er vurdert og beholdes til oppfølging, uten ferdigmelding.','owner_id',auth.uid(),'critical_confirmed',true));
  end loop;
  v:=public.bolig_handover_review(c,root,scope,'record',(v->>'revision')::bigint,jsonb_build_object('request_id',gen_random_uuid(),'basis',v->>'basis','decisions',decisions,'confirmed',true,'date',(now() at time zone 'Europe/Oslo')::date,'reference','QA – syntetisk protokoll, ingen virkelig overtakelse'));
  if v->'record'='null'::jsonb then raise exception 'Manager handover record missing';end if;
  if scope=root then root_handover:=v->'record';end if;
 end loop;
 t:=public.bolig_completion(c,root,root);
 select x into row_data from jsonb_array_elements(t->'rows') x where x->>'scope_id'=root::text;
 if row_data->>'status'<>'handed_over_with_rest' then raise exception 'Parent handover invalidated by unchanged child handover';end if;
 begin perform public.bolig_completion(c,root,unit,'handover',null,'{}');raise exception 'Legacy handover bypass accepted';exception when sqlstate 'PT409' then null;end;
 r:=public.bolig_documentation_export(c,root,unit);
 if jsonb_array_length(r->'scopes')<>3 or (select count(*) from jsonb_array_elements(r->'scopes') x where x->>'kind'='unit')<>1 or jsonb_array_length(r->'restpoints')<>1 then raise exception 'Wrong export scope';end if;
 if exists(select 1 from jsonb_array_elements(r->'scopes') x where x->>'id'=root::text and x->'common'<>'true'::jsonb) then raise exception 'Project common documents not marked shared';end if;
 s:=public.bolig_quality(c,root,unit);s:=public.bolig_quality(c,root,unit,'check_reopen',(s->>'revision')::bigint,jsonb_build_object('id',checkid,'reason','Ny kritisk feil'));
 s:=public.bolig_quality(c,root,unit,'check_save',(s->>'revision')::bigint,jsonb_build_object('id',checkid,'complete',true,'answers',jsonb_build_object(point::text,jsonb_build_object('status','Avvik','severity','critical','comment','Kritisk lekkasje','values','{}'::jsonb,'documents','[]'::jsonb))));
 t:=public.bolig_completion(c,root,root);select x into row_data from jsonb_array_elements(t->'rows') x where x->>'scope_id'=root::text;
 if row_data->>'control_status'<>'review' then raise exception 'Critical defect failed to invalidate internal approval chain';end if;
 if row_data->>'status'<>'handed_over_with_rest' or row_data->'handover' is distinct from root_handover then raise exception 'New critical defect erased historical actual handover';end if;
 begin perform public.bolig_documentation_export(c,root,gen_random_uuid());raise exception 'Foreign export scope accepted';exception when insufficient_privilege then null;end;
 raise notice 'PASS real sandbox streamlined workflow: optional startup, requirements/severity, combined review, restpoint approvals, atomic/replay distribution, shared export scope, handover chain and late critical defect. All rollback.';
end$$;
select 'PASS cloud streamlined workflow; all synthetic writes rolled back' as streamlined_smoke;
rollback;
