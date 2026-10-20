-- Synthetic own consent only, using actual save/publish/ack/read RPCs. Rollback.
create function pg_temp.primary_ack_scenario() returns void language plpgsql security definer set search_path='' as $$
declare c uuid:=current_setting('bulk.qa.company')::uuid;b uuid:=current_setting('bulk.qa.other')::uuid;
 admin_id uuid:=current_setting('bulk.qa.admin')::uuid;u uuid:=current_setting('bulk.qa.reader')::uuid;
 r jsonb;v jsonb;first_id uuid;second_id uuid;target_id uuid;different_id uuid;late_id uuid;old_receipt jsonb;original jsonb;current_receipt jsonb;state jsonb;
 d jsonb:='{"title":"Synthetic shared routine","chapter":"QA","goal":"Goal","responsibility":"Owner","procedure":"Synthetic safe steps","documentation":"Checks","confirmation":"Own reading","references":[]}';
 statement text:='Jeg har gjennomgått denne rutineversjonen, forstår mitt ansvar og vil følge rutinen. Jeg ber om forklaring eller nødvendig opplæring dersom noe er uklart, og melder fra om farlige forhold og avvik. Bekreftelsen dokumenterer gjennomgang; den erstatter ikke opplæring eller faktisk utførelse.';
 batch_statement text:='Jeg bekrefter at jeg har lest og forstått alle rutineutgavene i listen, forstår mitt ansvar og vil følge rutinene. Jeg ber om forklaring eller nødvendig opplæring dersom noe er uklart, og melder fra om farlige forhold og avvik. Bekreftelsen gjelder min egen gjennomgang av de oppførte utgavene; den erstatter ikke opplæring eller faktisk utførelse.';
begin
 insert into public.sales_company_memberships(company_id,user_id,is_primary,workspace_role) values(b,admin_id,false,'firmaadmin'),(b,u,false,'ansatt');
 perform set_config('request.jwt.claim.sub',admin_id::text,true);
 perform public.kshms_command(c,'access',jsonb_build_object('user_id',u,'role','reader','enabled',true));
 perform public.kshms_command(c,'settings',jsonb_build_object('revision',0,'trades',jsonb_build_array('vvs'),'responsible_user_id',admin_id));
 r:=public.kshms_command(c,'save',jsonb_build_object('draft',d));
 v:=public.kshms_command(c,'publish',jsonb_build_object('id',r->>'id','revision',r->'revision','change_summary','Synthetic primary'));first_id:=(v->>'id')::uuid;
 r:=public.kshms_command(c,'save',jsonb_build_object('draft',jsonb_set(d,'{title}','"Synthetic second"')));
 v:=public.kshms_command(c,'publish',jsonb_build_object('id',r->>'id','revision',r->'revision','change_summary','Synthetic second'));second_id:=(v->>'id')::uuid;
 update public.user_active_company_scope set company_id=b where user_id in(admin_id,u);
 perform public.kshms_command(b,'access',jsonb_build_object('user_id',u,'role','reader','enabled',true));
 perform public.kshms_command(b,'settings',jsonb_build_object('revision',0,'trades',jsonb_build_array('vvs'),'responsible_user_id',admin_id));
 r:=public.kshms_command(b,'save',jsonb_build_object('draft',d));
 v:=public.kshms_command(b,'publish',jsonb_build_object('id',r->>'id','revision',r->'revision','change_summary','Synthetic target'));target_id:=(v->>'id')::uuid;
 r:=public.kshms_command(b,'save',jsonb_build_object('draft',jsonb_set(jsonb_set(d,'{title}','"Synthetic second"'),'{procedure}','"Different instructions"')));
 v:=public.kshms_command(b,'publish',jsonb_build_object('id',r->>'id','revision',r->'revision','change_summary','Synthetic different'));different_id:=(v->>'id')::uuid;
 perform set_config('request.jwt.claim.sub',u::text,true);
 perform pg_temp.bulk_assert(jsonb_array_length(public.kshms_get_state(b)->'acknowledgments')=0,'no consent is never inferred');
 -- A secondary-only receipt does not become a primary receipt.
 perform public.kshms_command(b,'ack',jsonb_build_object('version_id',different_id,'statement',statement));
 select to_jsonb(a) into old_receipt from public.kshms_acknowledgments a where version_id=different_id and user_id=u;
 perform pg_temp.bulk_assert(not exists(select 1 from public.kshms_acknowledgments where company_id=c and user_id=u),'secondary cannot acknowledge primary');
 update public.user_active_company_scope set company_id=c where user_id=u;
 perform public.kshms_command(c,'ack',jsonb_build_object('version_id',first_id,'statement',statement));
 select to_jsonb(a) into original from public.kshms_acknowledgments a where version_id=first_id and user_id=u;
 select to_jsonb(a) into current_receipt from public.kshms_acknowledgments a where version_id=target_id and user_id=u;
 perform pg_temp.bulk_assert(current_receipt->>'shared_from_version_id'=first_id::text and current_receipt->>'shared_from_company_id'=c::text,'source original is linked');
 perform pg_temp.bulk_assert(current_receipt->'acknowledged_at'=original->'acknowledged_at' and current_receipt->'user_identity'=original->'user_identity' and current_receipt->'statement'=original->'statement','actual consent time identity and statement preserved');
 perform pg_temp.bulk_assert(not exists(select 1 from public.kshms_acknowledgments where company_id in(c,b) and user_id<>u),'no other user receipt reused');
 perform public.kshms_acknowledge_batch(c,u,array[first_id,second_id],batch_statement);
 perform pg_temp.bulk_assert(old_receipt=(select to_jsonb(a) from public.kshms_acknowledgments a where version_id=different_id and user_id=u),'different content and existing own receipt unchanged');
 perform pg_temp.bulk_assert(original=(select to_jsonb(a) from public.kshms_acknowledgments a where version_id=first_id and user_id=u),'original consent immutable after retry/batch');
 -- Publishing a later identical copy reuses consent on authorized read.
 perform set_config('request.jwt.claim.sub',admin_id::text,true);
 r:=public.kshms_command(b,'save',jsonb_build_object('draft',jsonb_set(d,'{title}','"Synthetic second"')));
 v:=public.kshms_command(b,'publish',jsonb_build_object('id',r->>'id','revision',r->'revision','change_summary','Synthetic late target'));late_id:=(v->>'id')::uuid;
 update public.kshms_member_access set enabled=false where company_id=c and user_id=u;
 perform set_config('request.jwt.claim.sub',u::text,true);
 update public.user_active_company_scope set company_id=b where user_id=u;
 state:=public.kshms_get_state(b);
 perform pg_temp.bulk_assert(not exists(select 1 from public.kshms_acknowledgments where version_id=late_id and user_id=u),'revoked source access stops new sharing');
 update public.kshms_member_access set enabled=true where company_id=c and user_id=u;
 state:=public.kshms_get_state(b);
 perform pg_temp.bulk_assert(state#>>'{context,primary_company_id}'=c::text,'primary follows membership rather than working dropdown');
 perform pg_temp.bulk_assert(exists(select 1 from public.kshms_acknowledgments where version_id=late_id and user_id=u and shared_from_version_id=second_id),'read reconciles future assignments');
 perform pg_temp.bulk_assert(jsonb_array_length(state->'acknowledgments')=3 and not exists(select 1 from jsonb_array_elements(state->'acknowledgments') a where a->>'user_id'<>u::text),'reader only sees own company receipts');
 perform pg_temp.bulk_assert(current_receipt=(select to_jsonb(a) from public.kshms_acknowledgments a where version_id=target_id and user_id=u),'read reconciliation never rewrites shared receipt');
 -- A same-hash/different-JSON fixture cannot pass the full content check.
 perform set_config('request.jwt.claim.sub',admin_id::text,true);
 r:=public.kshms_command(b,'save',jsonb_build_object('draft',jsonb_set(d,'{procedure}','"Different despite same synthetic hash"')));
 insert into public.kshms_versions(company_id,routine_id,number,content,content_hash,change_summary,published_by)
 select b,(r->>'id')::uuid,1,r->'draft',content_hash,'Synthetic hash mismatch',admin_id from public.kshms_versions where id=first_id returning id into late_id;
 insert into public.kshms_assignments(company_id,version_id,user_id,assigned_by) values(b,late_id,u,admin_id);
 perform set_config('request.jwt.claim.sub',u::text,true);perform public.kshms_get_state(b);
 perform pg_temp.bulk_assert(not exists(select 1 from public.kshms_acknowledgments where version_id=late_id and user_id=u),'hash alone is insufficient');
 perform pg_temp.bulk_assert((select count(*)=2 from public.kshms_audit where company_id=b and actor_id=u and action='ack_shared_primary'),'one separate reuse audit per new target receipt');
end$$;
set local role authenticated;
select pg_temp.primary_ack_scenario();
reset role;
select 'PASS: original own primary consent, exact JSON and hash, secondary isolation, single/batch, late assignment/read repair, revoked access, immutable history and source provenance' as result;
rollback;
