-- Run only against the dedicated Sandbox. All synthetic count rows roll back.
begin;
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $$
declare c uuid:='e0000000-0000-4000-8000-000000000001';s uuid:=gen_random_uuid();k uuid:=gen_random_uuid();r jsonb;i integer;line jsonb;
begin
 if not (public.stocktake_context()->>'enabled')::boolean then raise exception 'Sandbox test firm must be enabled first.'; end if;
 perform public.stocktake_create(c,s,'QA rollback stocktake','QA Lager','2026-10-15');
 r:=public.stocktake_record(c,s,k,'{"action":"add","supplier":"QA Manual","number":"000123","description":"QA zero count","quantity":"0","location":"A"}'::jsonb);
 if r ? 'error' or (r->>'quantity')::numeric<>0 then raise exception 'Zero count failed: %',r; end if;
 line:=r;
 r:=public.stocktake_record(c,s,k,'{"action":"add","supplier":"QA Manual","number":"000123","description":"QA zero count","quantity":"0","location":"A"}'::jsonb);
 if r->>'id'<>line->>'id' then raise exception 'Replay changed line.'; end if;
 for i in 1..105 loop
  r:=public.stocktake_record(c,s,gen_random_uuid(),jsonb_build_object('action','add','supplier','QA Manual','number','000'||i,'description','QA line '||i,'quantity','1.25','location','A'));
  if r ? 'error' then raise exception 'Add failed: %',r; end if;
 end loop;
 r:=public.stocktake_get(c,s,0);
 if (r->>'total')::integer<>106 or jsonb_array_length(r->'items')<>100 then raise exception 'First page/count failed.'; end if;
 if jsonb_array_length(public.stocktake_get(c,s,100)->'items')<>6 then raise exception 'Second page failed.'; end if;
 begin perform public.stocktake_get('e0000000-0000-4000-8000-000000000002',s,0);raise exception 'Foreign firm unexpectedly allowed.';exception when insufficient_privilege then null;end;
 begin perform 1 from stocktake_private.lines;raise exception 'Private rows unexpectedly exposed.';exception when insufficient_privilege then null;end;
 r:=public.stocktake_record(c,s,gen_random_uuid(),jsonb_build_object('action','close','revision',(r->'session'->>'revision')::bigint));
 if r->>'closed'<>'true' then raise exception 'Close failed: %',r; end if;
end $$;
reset role;
rollback;
