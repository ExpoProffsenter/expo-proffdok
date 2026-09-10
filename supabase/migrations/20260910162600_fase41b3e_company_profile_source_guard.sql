-- Expo ProffDok – FASE 41B.3E
-- Firmaprofil/branding for aktivt firmascope skal bare hentes fra brukere som
-- faktisk har dette firmaet som sin egen profiltilknytning. Ekstra arbeidsprofil
-- eller systemadmin-tilgang skal aldri kunne låne logo/kontaktdata fra annet firma.

create or replace function public.work_profile_company_profile(p_company_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select case
    when not (
      public.current_profile_is_systemadmin()
      or exists (
        select 1
        from public.sales_company_memberships mine
        where mine.user_id = auth.uid()
          and mine.company_id = p_company_id
      )
    ) then null::jsonb
    else (
      select jsonb_build_object(
        'companyId', s.id,
        'companyName', s.display_name,
        'orgNumber', coalesce((
          select nullif(trim(p.org_number),'')
          from public.sales_company_memberships m
          join public.profiles p on p.id = m.user_id
          where m.company_id = s.id
            and public.sales_normalize_company_name(p.company_name) = s.normalized_name
            and nullif(trim(coalesce(p.org_number,'')),'') is not null
          order by case when p.company_role='firmaadmin' then 0 else 1 end, m.is_primary desc, m.created_at
          limit 1
        ), ''),
        'address', coalesce((
          select nullif(trim(p.address),'')
          from public.sales_company_memberships m
          join public.profiles p on p.id = m.user_id
          where m.company_id = s.id
            and public.sales_normalize_company_name(p.company_name) = s.normalized_name
            and nullif(trim(coalesce(p.address,'')),'') is not null
          order by case when p.company_role='firmaadmin' then 0 else 1 end, m.is_primary desc, m.created_at
          limit 1
        ), ''),
        'phone', coalesce((
          select nullif(trim(p.phone),'')
          from public.sales_company_memberships m
          join public.profiles p on p.id = m.user_id
          where m.company_id = s.id
            and public.sales_normalize_company_name(p.company_name) = s.normalized_name
            and nullif(trim(coalesce(p.phone,'')),'') is not null
          order by case when p.company_role='firmaadmin' then 0 else 1 end, m.is_primary desc, m.created_at
          limit 1
        ), ''),
        'email', coalesce((
          select nullif(trim(p.email),'')
          from public.sales_company_memberships m
          join public.profiles p on p.id = m.user_id
          where m.company_id = s.id
            and public.sales_normalize_company_name(p.company_name) = s.normalized_name
            and nullif(trim(coalesce(p.email,'')),'') is not null
          order by case when p.company_role='firmaadmin' then 0 else 1 end, m.is_primary desc, m.created_at
          limit 1
        ), ''),
        'website', coalesce((
          select nullif(trim(p.website),'')
          from public.sales_company_memberships m
          join public.profiles p on p.id = m.user_id
          where m.company_id = s.id
            and public.sales_normalize_company_name(p.company_name) = s.normalized_name
            and nullif(trim(coalesce(p.website,'')),'') is not null
          order by case when p.company_role='firmaadmin' then 0 else 1 end, m.is_primary desc, m.created_at
          limit 1
        ), ''),
        'logoUrl', coalesce((
          select nullif(trim(p.logo_url),'')
          from public.sales_company_memberships m
          join public.profiles p on p.id = m.user_id
          where m.company_id = s.id
            and public.sales_normalize_company_name(p.company_name) = s.normalized_name
            and nullif(trim(coalesce(p.logo_url,'')),'') is not null
          order by case when p.company_role='firmaadmin' then 0 else 1 end, m.is_primary desc, m.created_at
          limit 1
        ), case
          when s.normalized_name = public.sales_normalize_company_name('Ringside Rørleggerbedrift AS')
            then '/brands/ringside-rorleggerbedrift.png'
          when s.normalized_name = public.sales_normalize_company_name('Bademiljø Expo')
            then '/brands/bademiljo-expo-ringside.png'
          when s.normalized_name = public.sales_normalize_company_name('Expo Proffsenter')
            then '/expo-logo.png'
          else '/expo-logo.png'
        end)
      )
      from public.sales_company_scopes s
      where s.id = p_company_id
    )
  end;
$$;

revoke all on function public.work_profile_company_profile(uuid) from public;
grant execute on function public.work_profile_company_profile(uuid) to authenticated;
