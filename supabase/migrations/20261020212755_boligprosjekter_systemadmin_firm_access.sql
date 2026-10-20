-- Systemadmin manages firm entitlements independently of the active work profile.
-- Workspace data and member grants keep their existing active-company gate.
create function bolig_private.firm_access(c uuid, expected bigint, enabled boolean) returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); current_revision bigint;
begin
 if u is null or not public.current_profile_is_systemadmin() or not exists(
  select 1 from public.profiles p where p.id=u and p.approved and not coalesce(p.deactivated,false)
   and p.role in ('admin','member','ansatt','firmaadmin'))
 then raise exception 'Systemadmin kreves.' using errcode='42501';end if;
 if enabled is not null then
  if c is null or not exists(select 1 from public.sales_company_scopes s where s.id=c)
  then raise exception 'Velg et registrert firma.' using errcode='22023';end if;
  perform pg_advisory_xact_lock(hashtextextended('bolig-access:'||c::text,0));
  select coalesce((select f.revision from bolig_private.firms f where f.company_id=c),0) into current_revision;
  if expected is distinct from current_revision then raise exception 'Firmatilgangen er endret. Hent på nytt.' using errcode='PT409';end if;
  insert into bolig_private.firms(company_id,enabled,changed_by) values(c,enabled,u)
  on conflict(company_id) do update set enabled=excluded.enabled,revision=bolig_private.firms.revision+1,changed_by=u,changed_at=now();
  insert into bolig_private.audit(company_id,actor_id,action,revision)
   values(c,u,'license',(select f.revision from bolig_private.firms f where f.company_id=c));
 end if;
 return jsonb_build_object('user_id',u,'system_admin',true,'companies',coalesce((
  select jsonb_agg(jsonb_build_object('company_id',s.id,'company_name',s.display_name,'licensed',coalesce(f.enabled,false),'revision',coalesce(f.revision,0)) order by s.display_name,s.id)
  from public.sales_company_scopes s left join bolig_private.firms f on f.company_id=s.id),'[]'::jsonb));
end$$;
revoke all on function bolig_private.firm_access(uuid,bigint,boolean) from public,anon,authenticated,service_role;
grant execute on function bolig_private.firm_access(uuid,bigint,boolean) to authenticated;
create function public.bolig_firm_access(p_company_id uuid default null,p_revision bigint default null,p_enabled boolean default null) returns jsonb
language sql security invoker set search_path='' as $$
 select bolig_private.firm_access(p_company_id,p_revision,p_enabled);
$$;
revoke all on function public.bolig_firm_access(uuid,bigint,boolean) from public,anon,service_role;
grant execute on function public.bolig_firm_access(uuid,bigint,boolean) to authenticated;
