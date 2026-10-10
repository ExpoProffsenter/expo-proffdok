-- CONTROL PROJECT ONLY. Schema preparation; no rows, credentials or activation.
-- A reviewed operator must pre-stage the expected generation-zero HMAC explicitly.
alter table hr_control.checkpoints add column bootstrap_status text
 check (bootstrap_status in ('staged','writing','verified'));
alter table hr_control.checkpoints add constraint hr_control_bootstrap_closed check (
 bootstrap_status is null or (
  not enabled and revision=0 and generation=0 and last_success_at is null
  and project_ref not in ('dqffxflaoyarbxyiyhop','ppvircenkjizeiqdxphj','amduqhmgmeetaatwlmmt')
  and ((bootstrap_status='staged' and run_id is null)
    or (bootstrap_status in ('writing','verified') and run_id is not null))
 ));

create function hr_control.describe_bootstrap(s hr_control.checkpoints)
returns jsonb language sql immutable security invoker set search_path='' as $$
 select hr_control.describe_checkpoint(s) || pg_catalog.jsonb_build_object(
  'bootstrapStatus',s.bootstrap_status,'enabled',s.enabled);
$$;

create function public.hr_control_bootstrap_claim(p_project text,p_store text,p_origin text,p_run uuid,p_hmac text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare s hr_control.checkpoints;
begin
 select * into s from hr_control.checkpoints where project_ref=p_project for update;
 if not found or p_run is null or s.enabled or s.bootstrap_status is distinct from 'staged'
  or s.run_id is not null or s.revision<>0 or s.generation<>0
  or s.store_id is distinct from p_store or s.origin is distinct from p_origin
  or s.hmac is distinct from p_hmac
 then raise exception 'HR bootstrap unavailable.' using errcode='42501'; end if;
 update hr_control.checkpoints set bootstrap_status='writing',run_id=p_run,
  acquired_at=pg_catalog.clock_timestamp() where project_ref=p_project returning * into s;
 return hr_control.describe_bootstrap(s);
end $$;

create function public.hr_control_bootstrap_read(p_project text,p_store text,p_origin text,p_run uuid,p_hmac text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare s hr_control.checkpoints;
begin
 select * into s from hr_control.checkpoints where project_ref=p_project for update;
 if not found or p_run is null or s.enabled or s.bootstrap_status is null
  or s.bootstrap_status not in ('writing','verified') or s.run_id is distinct from p_run
  or s.store_id is distinct from p_store or s.origin is distinct from p_origin
  or s.hmac is distinct from p_hmac or s.revision<>0 or s.generation<>0
 then raise exception 'HR bootstrap owner unavailable.' using errcode='42501'; end if;
 return hr_control.describe_bootstrap(s);
end $$;

create function public.hr_control_bootstrap_commit(p_project text,p_store text,p_origin text,p_run uuid,p_hmac text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare s hr_control.checkpoints;
begin
 perform public.hr_control_bootstrap_read(p_project,p_store,p_origin,p_run,p_hmac);
 select * into s from hr_control.checkpoints where project_ref=p_project for update;
 if s.bootstrap_status is distinct from 'writing'
 then raise exception 'HR bootstrap already committed.' using errcode='40001'; end if;
 update hr_control.checkpoints set bootstrap_status='verified'
  where project_ref=p_project returning * into s;
 -- Keep disabled AND locked. Explicit reviewed activation is a separate operation.
 return hr_control.describe_bootstrap(s);
end $$;

revoke all on function hr_control.describe_bootstrap(hr_control.checkpoints) from public,anon,authenticated,service_role;
revoke all on function public.hr_control_bootstrap_claim(text,text,text,uuid,text),
 public.hr_control_bootstrap_read(text,text,text,uuid,text),
 public.hr_control_bootstrap_commit(text,text,text,uuid,text) from public,anon,authenticated,service_role;
grant execute on function public.hr_control_bootstrap_claim(text,text,text,uuid,text),
 public.hr_control_bootstrap_read(text,text,text,uuid,text),
 public.hr_control_bootstrap_commit(text,text,text,uuid,text) to service_role;
