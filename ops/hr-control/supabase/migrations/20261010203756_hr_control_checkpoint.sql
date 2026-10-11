-- CONTROL PROJECT ONLY: amduqhmgmeetaatwlmmt. Never apply as an app migration.
-- No bootstrap rows, secrets, enabled bindings, scheduler or timeout takeover.
create schema hr_control;
revoke all on schema hr_control from public,anon,authenticated,service_role;

create table hr_control.checkpoints (
 project_ref text primary key check (project_ref ~ '^[a-z]{20}$'),
 store_id text not null check (store_id ~ '^store_[A-Za-z0-9]+$'),
 origin text not null check (origin ~ '^https://[a-z0-9-]+[.]private[.]blob[.]vercel-storage[.]com$'),
 enabled boolean not null default false,
 revision bigint not null default 0 check (revision between 0 and 9007199254740991),
 generation bigint not null check (generation between 0 and 9007199254740991),
 hmac text not null check (hmac ~ '^[a-f0-9]{64}$'),
 run_id uuid,
 acquired_at timestamptz,
 last_success_at timestamptz,
 check ((run_id is null) = (acquired_at is null))
);
alter table hr_control.checkpoints enable row level security;
revoke all on hr_control.checkpoints from public,anon,authenticated,service_role;

create function hr_control.bound_run(p_project text,p_store text,p_origin text,p_run uuid)
returns hr_control.checkpoints language plpgsql security invoker set search_path='' as $$
declare s hr_control.checkpoints;
begin
 select * into s from hr_control.checkpoints where project_ref=p_project for update;
 if not found or not s.enabled or p_run is null
  or s.store_id is distinct from p_store or s.origin is distinct from p_origin
  or s.run_id is distinct from p_run
 then raise exception 'HR control run unavailable.' using errcode='42501'; end if;
 return s;
end $$;

create function hr_control.describe_checkpoint(s hr_control.checkpoints)
returns jsonb language sql immutable security invoker set search_path='' as $$
 select pg_catalog.jsonb_build_object('format',1,'project',s.project_ref,'storeId',s.store_id,
  'origin',s.origin,'revision',s.revision,'runId',s.run_id,
  'anchor',pg_catalog.jsonb_build_object('project',s.project_ref,'storeId',s.store_id,
   'generation',s.generation,'hmac',s.hmac));
$$;

create function public.hr_control_claim(p_project text,p_store text,p_origin text,p_run uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare s hr_control.checkpoints;
begin
 select * into s from hr_control.checkpoints where project_ref=p_project for update;
 if not found or not s.enabled or p_run is null or s.run_id is not null
  or s.store_id is distinct from p_store or s.origin is distinct from p_origin
 then raise exception 'HR control claim unavailable.' using errcode='42501'; end if;
 update hr_control.checkpoints set run_id=p_run,acquired_at=pg_catalog.clock_timestamp()
  where project_ref=p_project returning * into s;
 return hr_control.describe_checkpoint(s);
end $$;

create function public.hr_control_read(p_project text,p_store text,p_origin text,p_run uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
begin
 return hr_control.describe_checkpoint(hr_control.bound_run(p_project,p_store,p_origin,p_run));
end $$;

create function public.hr_control_commit(p_project text,p_store text,p_origin text,p_run uuid,
 p_revision bigint,p_generation bigint,p_hmac text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare s hr_control.checkpoints;
begin
 s:=hr_control.bound_run(p_project,p_store,p_origin,p_run);
 if s.revision is distinct from p_revision or s.revision>=9007199254740991
  or p_generation is distinct from s.generation+1 or p_generation>9007199254740991
  or p_hmac is null or p_hmac !~ '^[a-f0-9]{64}$' or p_hmac=s.hmac
 then raise exception 'HR control checkpoint conflict.' using errcode='40001'; end if;
 update hr_control.checkpoints set revision=revision+1,generation=p_generation,hmac=p_hmac
  where project_ref=p_project returning * into s;
 return hr_control.describe_checkpoint(s);
end $$;

create function public.hr_control_finish(p_project text,p_store text,p_origin text,p_run uuid,p_revision bigint)
returns jsonb language plpgsql security definer set search_path='' as $$
declare s hr_control.checkpoints;
begin
 s:=hr_control.bound_run(p_project,p_store,p_origin,p_run);
 if s.revision is distinct from p_revision
 then raise exception 'HR control finish conflict.' using errcode='40001'; end if;
 update hr_control.checkpoints set run_id=null,acquired_at=null,last_success_at=pg_catalog.clock_timestamp()
  where project_ref=p_project;
 return pg_catalog.jsonb_build_object('finished',true);
end $$;

revoke all on all functions in schema hr_control from public,anon,authenticated,service_role;
revoke all on function public.hr_control_claim(text,text,text,uuid),
 public.hr_control_read(text,text,text,uuid),
 public.hr_control_commit(text,text,text,uuid,bigint,bigint,text),
 public.hr_control_finish(text,text,text,uuid,bigint) from public,anon,authenticated,service_role;
grant execute on function public.hr_control_claim(text,text,text,uuid),
 public.hr_control_read(text,text,text,uuid),
 public.hr_control_commit(text,text,text,uuid,bigint,bigint,text),
 public.hr_control_finish(text,text,text,uuid,bigint) to service_role;
comment on table hr_control.checkpoints is
 'Independent control state. Empty until explicit verified bootstrap. Never restore with app backups; never auto-reclaim a stuck run.';
