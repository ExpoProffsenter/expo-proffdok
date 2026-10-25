-- Sandbox ppvircenkjizeiqdxphj only. Synthetic rows, transaction rollback, no sends.
begin;
set local statement_timeout='20s';
do $qa$
declare u uuid;c uuid;x jsonb;r uuid;s jsonb;rev bigint;rid uuid:=gen_random_uuid();eid uuid:=gen_random_uuid();pid uuid:=gen_random_uuid();
begin
 for u,c in select m.user_id,m.company_id from bolig_private.member_access m join bolig_private.firms f using(company_id) join public.profiles p on p.id=m.user_id where m.access_role='manager' and f.enabled and p.approved and not coalesce(p.deactivated,false) loop
  perform set_config('request.jwt.claim.sub',u::text,true);
  perform set_config('request.jwt.claims',jsonb_build_object('sub',u,'role','authenticated')::text,true);
  x:=bolig_private.context(c);
  exit when coalesce((x->>'enabled')::boolean,false) and x->>'role'='manager';
 end loop;
 if not coalesce((x->>'enabled')::boolean,false) or x->>'role'<>'manager' then raise exception 'No authorized Sandbox manager for rollback QA';end if;
 execute 'set local role authenticated';
 x:=public.bolig_workspace(c,'create_plan',null,null,jsonb_build_object('request_id',gen_random_uuid(),'title','QA-ROSTER-ROLLBACK-ONLY','reference','QA-ROSTER-ROLLBACK','buildings',jsonb_build_array(jsonb_build_object('name','QA','building_type','house','address','QA gate 1','house_floors',1,'entrances',jsonb_build_array(jsonb_build_object('address','QA gate 1','counts',jsonb_build_array(1)))))));
 r:=(x#>>'{root,id}')::uuid;
 s:=public.bolig_site_roster(c,r,'get','{}');
 if s->>'revision'<>'0' then raise exception 'Unexpected initial revision';end if;
 s:=public.bolig_site_roster(c,r,'settings',jsonb_build_object('request_id',rid,'revision',0,'values',jsonb_build_object('name','QA Byggeplass','address','QA gate 1','client_name','QA Byggherre')));
 if s->>'receipt_id'<>rid::text then raise exception 'Missing settings receipt';end if;
 s:=public.bolig_site_roster(c,r,'employer',jsonb_build_object('request_id',gen_random_uuid(),'revision',1,'values',jsonb_build_object('id',eid,'name','QA Virksomhet','organisation_number','999888777','registration_required',true)));
 s:=public.bolig_site_roster(c,r,'person',jsonb_build_object('request_id',gen_random_uuid(),'revision',2,'values',jsonb_build_object('id',pid,'name','QA Fiktiv Person','birth_date','1990-01-02','employer_id',eid,'employment_type','employed','card_status','number','card_number','QA-TEST-CARD','starts_on',s->>'today')));
 if jsonb_array_length(s->'missing')<>0 then raise exception 'Synthetic complete person reported incomplete';end if;
 s:=public.bolig_site_roster(c,r,'review',jsonb_build_object('request_id',gen_random_uuid(),'revision',3,'confirmed',true));
 if not (s->>'checked')::boolean or jsonb_array_length(s->'history')<>4 then raise exception 'Review/history failed';end if;
 s:=public.bolig_site_roster(c,r,'get',jsonb_build_object('snapshot_id',rid));
 if not (s->>'readonly')::boolean or jsonb_array_length(s#>'{document,people}')<>0 then raise exception 'Immutable version failed';end if;
end $qa$;
select 'PASS: authenticated Sandbox create/read/settings/employer/person/review/history; synthetic rows rolled back, no email' result;
rollback;
