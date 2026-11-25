-- FASE 45B – tilgangshardening før produksjon.
-- Bevarer gjeldende Fase 42K/41B semantics for eksisterende brukere og legger kun til
-- en eksplisitt ekstern-proffsti for store_offers. Ingen endring i godkjenning,
-- firmaopprettelse eller eksisterende moduladministrasjon.

-- Proffkatalogen skal alltid følge brukerens aktive firmascope, ikke "første medlemskap".
create or replace function public.current_sales_company_id()
returns uuid
language sql stable security definer set search_path=public,pg_temp as $$
  select public.current_active_company_scope_id();
$$;
revoke all on function public.current_sales_company_id() from public,anon;

-- Bevar eksisterende Production-regler ordrett logisk:
-- 1) godkjent og aktiv profil
-- 2) systemadmin eller eksplisitt user_module_access
-- 3) store_offers er fortsatt intern-only i den eksisterende stien
-- Ekstern proff får KUN store_offers når brukeren allerede har sales og aktivt firma
-- eksplisitt har minst én godkjent proffleverandør.
create or replace function public.current_user_has_module_access(p_module_key text)
returns boolean
language sql stable security definer set search_path=public,pg_temp as $$
  select
    public.module_access_valid_key(p_module_key)
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and coalesce(p.approved,false) = true
        and coalesce(p.deactivated,false) = false
        and (
          (
            (
              p.system_role = 'systemadmin'
              or exists (
                select 1
                from public.user_module_access uma
                where uma.user_id = p.id
                  and uma.module_key = trim(p_module_key)
              )
            )
            and (
              trim(p_module_key) <> 'store_offers'
              or public.is_internal_work_profile_company(public.current_active_company_scope_id())
            )
          )
          or (
            trim(p_module_key) = 'store_offers'
            and coalesce(p.system_role,'') <> 'systemadmin'
            and exists (
              select 1
              from public.user_module_access sales_access
              where sales_access.user_id = p.id
                and sales_access.module_key = 'sales'
            )
            and public.company_has_pro_store_catalog_access(public.current_active_company_scope_id())
          )
        )
    );
$$;
revoke all on function public.current_user_has_module_access(text) from public;
grant execute on function public.current_user_has_module_access(text) to authenticated;

-- Firmaadmin/Systemadmin må angi eksplisitt firma når prisinnsyn endres. Dette
-- fjerner tvetydighet for brukere som kan være medlem av mer enn ett firma.
create or replace function public.set_store_catalog_user_net_price_access(
  p_company_id uuid,
  p_user_id uuid,
  p_can_view boolean
)
returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare
  v_actor_company uuid := public.current_active_company_scope_id();
begin
  if not public.current_profile_is_systemadmin() and not public.current_profile_is_firmaadmin() then
    raise exception 'Du har ikke tilgang til å administrere prisinnsyn.' using errcode='42501';
  end if;

  if p_company_id is null or not exists(
    select 1 from public.sales_company_scopes s where s.id=p_company_id
  ) then
    raise exception 'Firmaet finnes ikke.' using errcode='P0002';
  end if;

  if not exists(
    select 1 from public.sales_company_memberships m
    where m.company_id=p_company_id and m.user_id=p_user_id
  ) then
    raise exception 'Brukeren tilhører ikke valgt firma.' using errcode='42501';
  end if;

  if not public.current_profile_is_systemadmin() and p_company_id<>v_actor_company then
    raise exception 'Du kan bare administrere prisinnsyn i aktivt firma.' using errcode='42501';
  end if;

  if not public.current_profile_is_systemadmin() and p_user_id=auth.uid() then
    raise exception 'Firmaadministrator kan ikke gi seg selv prisinnsyn.' using errcode='42501';
  end if;

  insert into public.store_catalog_user_price_access(
    company_id,user_id,can_view_net_price,updated_by,updated_at
  ) values(
    p_company_id,p_user_id,coalesce(p_can_view,false),auth.uid(),now()
  )
  on conflict(company_id,user_id) do update
    set can_view_net_price=excluded.can_view_net_price,
        updated_by=auth.uid(),
        updated_at=now();

  return jsonb_build_object(
    'user_id',p_user_id,
    'company_id',p_company_id,
    'can_view_net_price',coalesce(p_can_view,false)
  );
end; $$;

-- Den gamle 2-args varianten beholdes kun for migreringssikkerhet, men kan ikke
-- lenger kalles av klienter fordi den valgte første medlemskap og var tvetydig.
revoke all on function public.set_store_catalog_user_net_price_access(uuid,boolean) from public,anon,authenticated;
revoke all on function public.set_store_catalog_user_net_price_access(uuid,uuid,boolean) from public,anon;
grant execute on function public.set_store_catalog_user_net_price_access(uuid,uuid,boolean) to authenticated;
