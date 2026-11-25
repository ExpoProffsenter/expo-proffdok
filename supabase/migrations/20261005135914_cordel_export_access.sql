-- Opt-in, company-scoped Cordel export. Existing price permissions are untouched.
create table public.cordel_export_user_access (
 user_id uuid primary key references public.profiles(id) on delete cascade,
 company_scope_id uuid not null references public.sales_company_scopes(id) on delete cascade,
 granted_by uuid references public.profiles(id) on delete set null,
 updated_at timestamptz not null default now()
);
alter table public.cordel_export_user_access enable row level security;
revoke all on public.cordel_export_user_access from anon, authenticated;
create or replace function public.get_cordel_export_access(p_target_user_id uuid default null)
returns boolean language plpgsql stable security definer set search_path='' as $$
declare v_uid uuid := auth.uid(); v_target uuid := coalesce(p_target_user_id,auth.uid());
begin
 if v_uid is null then return false; end if;
 if v_target <> v_uid and not public.current_profile_is_systemadmin() then
  raise exception 'Kun Systemadministrator kan lese andre brukeres Cordel-tilgang.' using errcode='42501';
 end if;
 return exists(select 1 from public.profiles p where p.id=v_target
  and ((v_target <> v_uid and public.current_profile_is_systemadmin()) or (coalesce(p.approved,false) and not coalesce(p.deactivated,false)))
  and (p.system_role='systemadmin' or exists(
   select 1 from public.cordel_export_user_access a join public.sales_company_scopes s on s.id=a.company_scope_id
   where a.user_id=p.id and s.normalized_name=public.sales_normalize_company_name(p.company_name))));
end $$;
create or replace function public.set_cordel_export_access(p_target_user_id uuid,p_enabled boolean)
returns boolean language plpgsql security definer set search_path='' as $$
declare v_scope uuid; v_role text;
begin
 if auth.uid() is null or not public.current_profile_is_systemadmin() then
  raise exception 'Kun Systemadministrator kan endre Cordel-tilgang.' using errcode='42501';
 end if;
 select p.system_role,s.id into v_role,v_scope from public.profiles p left join public.sales_company_scopes s
 on s.normalized_name=public.sales_normalize_company_name(p.company_name) where p.id=p_target_user_id;
 if not found then raise exception 'Brukeren finnes ikke.'; end if;
 if v_role='systemadmin' then raise exception 'Systemadministrator har Cordel-tilgang automatisk.'; end if;
 if coalesce(p_enabled,false) then
  if v_scope is null then raise exception 'Brukeren må tilhøre et registrert firma.'; end if;
  insert into public.cordel_export_user_access(user_id,company_scope_id,granted_by) values(p_target_user_id,v_scope,auth.uid())
  on conflict(user_id) do update set company_scope_id=excluded.company_scope_id,granted_by=excluded.granted_by,updated_at=now();
 else delete from public.cordel_export_user_access where user_id=p_target_user_id;
 end if;
 return public.get_cordel_export_access(p_target_user_id);
end $$;
revoke all on function public.get_cordel_export_access(uuid) from public,anon;
revoke all on function public.set_cordel_export_access(uuid,boolean) from public,anon;
grant execute on function public.get_cordel_export_access(uuid) to authenticated;
grant execute on function public.set_cordel_export_access(uuid,boolean) to authenticated;
