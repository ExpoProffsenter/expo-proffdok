-- Server-only test of one explicitly authorized recipient. Never scans the ordinary queue.
create function public.hr_followup_test_reserve(p_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$declare d hr_private.followup_deliveries%rowtype;email text;begin
 if not exists(select 1 from hr_private.followup_settings where singleton and enabled) then return null;end if;
 select * into d from hr_private.followup_deliveries where id=p_id and task_key='hr-review' and bucket=-9000000 and available_at>now()-interval '24 hours' and ((status='pending' and available_at<=now())or(status='sending' and reserved_at<now()-interval '5 minutes'))
 order by available_at,id for update skip locked limit 1;if d.id is null then return null;end if;
 select p.email into email from public.profiles p where p.id=d.recipient_id;
 if email is null or length(email)>254 or email ~ '[[:space:]]' or email !~ '^[^@ ]+@[^@ ]+\.[^@ ]+$'
 or(d.recipient_email is not null and d.recipient_email<>email)
 or not exists(select 1 from hr_private.sick_leave_tasks(d.company_id,d.case_id) t where t.recipient_id=d.recipient_id and t.task_key=d.task_key and t.due_on=d.due_on) then
 update hr_private.followup_deliveries set status='suppressed' where id=d.id;return jsonb_build_object('suppressed',true);end if;
 if d.attempts>=10 or(d.first_attempt_at is not null and d.first_attempt_at<now()-interval '23 hours') then
 update hr_private.followup_deliveries set status='failed' where id=d.id;return jsonb_build_object('suppressed',true);end if;
 update hr_private.followup_deliveries set status='sending',attempt=gen_random_uuid(),attempts=attempts+1,recipient_email=email,
 reserved_at=now(),first_attempt_at=coalesce(first_attempt_at,now()) where id=d.id returning * into d;
 return jsonb_build_object('id',d.id,'attempt',d.attempt,'to',email);
end$$;
revoke all on function public.hr_followup_test_reserve(uuid) from public,anon,authenticated,service_role;
grant execute on function public.hr_followup_test_reserve(uuid) to service_role;
