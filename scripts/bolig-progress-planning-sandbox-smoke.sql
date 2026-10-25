-- Sandbox only. Synthetic authenticated public RPCs. Every row rolls back.
begin;
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $$
declare c uuid:='e0000000-0000-4000-8000-000000000001';actor uuid:='d0000000-0000-4000-8000-000000000001';r jsonb;s jsonb;p jsonb;items jsonb:='[]';change jsonb:='[]';root uuid;unit uuid;v jsonb;t uuid;pred uuid;req uuid:=gen_random_uuid();start date:=(now() at time zone 'Europe/Oslo')::date+3;i int;j int;
begin
 r:=public.bolig_workspace(c,'create_plan',null,null,jsonb_build_object('request_id',gen_random_uuid(),'title','QA MASSEPLAN ROLLBACK','reference','QA-BULK-ROLLBACK','buildings',jsonb_build_array(jsonb_build_object('name','QA Taktbygg','building_type','apartment','address','QA Taktveien','house_floors',2,'entrances',jsonb_build_array(jsonb_build_object('address','QA Taktveien','counts','[5,5]'::jsonb))))));
 root:=(r#>>'{root,id}')::uuid;
 for i in 0..9 loop
  unit:=(r->'units'->i->>'id')::uuid;pred:=null;
  for j in 0..1 loop
   t:=gen_random_uuid();items:=items||jsonb_build_array(jsonb_build_object('id',t,'unit_id',unit,'owner_id',actor,'title','QA Arbeid '||(j+1),'planned_start',start+i*2+j,'planned_end',start+i*2+j,'predecessor_id',pred,'required',true));
   change:=change||jsonb_build_array(jsonb_build_object('id',t,'planned_start',start+i*2+j+5,'planned_end',start+i*2+j+5));pred:=t;
  end loop;
 end loop;
 p:=jsonb_build_object('request_id',req,'revision',0,'mode','create','reviewed',true,'items',items);
 s:=public.bolig_progress(c,root,null,'batch',p);
 if jsonb_array_length(s->'tasks')<>20 or s->>'revision'<>'1' then raise exception 'Bulk save mismatch';end if;
 v:=public.bolig_progress(c,root,null,'batch',p);if v->'revision'<>s->'revision' then raise exception 'Replay revised plan';end if;
 v:=public.bolig_progress(c,root,(r#>>'{units,0,id}')::uuid);if jsonb_array_length(v#>'{history,0,snapshot,tasks}')<>2 then raise exception 'Unit history mismatch';end if;
 s:=public.bolig_progress(c,root,null,'batch',jsonb_build_object('request_id',gen_random_uuid(),'revision',1,'mode','dates','reviewed',true,'items',change));
 if s->>'revision'<>'2' or exists(select 1 from jsonb_array_elements(s->'tasks') x where x->>'actual_start' is not null or x->>'status'<>'planned') then raise exception 'Dates fabricated execution';end if;
 begin
  perform public.bolig_progress(c,root,null,'batch',jsonb_build_object('request_id',gen_random_uuid(),'revision',2,'mode','dates','reviewed',true,'items',jsonb_build_array((change->0)||jsonb_build_object('planned_end',start+100))));
  raise exception 'Broken dependency accepted';
 exception when invalid_parameter_value then null;end;
 v:=public.bolig_progress(c,root);if v->'revision'<>s->'revision' or v->'tasks'<>s->'tasks' then raise exception 'Failed batch changed plan';end if;
 execute 'reset role';if exists(select 1 from bolig_private.progress_deliveries where root_id=root) then raise exception 'Unexpected email';end if;
 if (select enabled from bolig_private.progress_mail_settings where singleton) then raise exception 'Mail enabled';end if;
end$$;
rollback;
