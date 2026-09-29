-- Beholder den etablerte firmascope-vakten når den delte firmaprofilen hentes.
-- Hjelperen kan brukes av innloggede kallere, men returnerer bare eget firma
-- (eller valgt firma for Systemadministrator). Anonyme kall har ingen tilgang.

create or replace function public.work_profile_company_profile(p_company_id uuid)
returns jsonb
language sql
stable
security definer
set search_path to 'public', 'pg_temp'
as $function$
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
        'orgNumber', coalesce(nullif(trim(c.org_number), ''), nullif(trim(seed.org_number), ''), ''),
        'address', coalesce(nullif(trim(c.address), ''), nullif(trim(seed.address), ''), ''),
        'phone', coalesce(nullif(trim(c.phone), ''), nullif(trim(seed.phone), ''), ''),
        'email', coalesce(nullif(trim(c.email), ''), nullif(trim(seed.email), ''), ''),
        'website', coalesce(nullif(trim(c.website), ''), nullif(trim(seed.website), ''), ''),
        'logoUrl', coalesce(
          nullif(trim(c.logo_url), ''),
          nullif(trim(seed.logo_url), ''),
          case
            when s.normalized_name = public.sales_normalize_company_name('Ringside Rørleggerbedrift AS')
              then '/brands/ringside-rorleggerbedrift.png'
            when s.normalized_name = public.sales_normalize_company_name('Bademiljø Expo')
              then '/brands/bademiljo-expo-ringside.png'
            else '/expo-logo.png'
          end
        )
      )
      from public.sales_company_scopes s
      left join lateral (
        select
          company_row.org_number,
          company_row.address,
          company_row.phone,
          company_row.email,
          company_row.website,
          company_row.logo_url
        from public.companies company_row
        where public.sales_normalize_company_name(company_row.company_name) = s.normalized_name
        order by company_row.created_at asc, company_row.id
        limit 1
      ) c on true
      left join lateral (
        select
          profile_row.org_number,
          profile_row.address,
          profile_row.phone,
          profile_row.email,
          profile_row.website,
          profile_row.logo_url
        from public.profiles profile_row
        where public.sales_normalize_company_name(profile_row.company_name) = s.normalized_name
        order by
          case
            when profile_row.company_role = 'firmaadmin'
             and coalesce(profile_row.approved, false)
             and not coalesce(profile_row.deactivated, false)
              then 0
            else 1
          end,
          profile_row.created_at asc,
          profile_row.id
        limit 1
      ) seed on true
      where s.id = p_company_id
    )
  end;
$function$;

revoke all on function public.work_profile_company_profile(uuid) from public, anon;
grant execute on function public.work_profile_company_profile(uuid) to authenticated;

comment on function public.work_profile_company_profile(uuid) is
  'Returnerer delt firmaprofil bare for brukerens eget firmascope eller Systemadministrator.';
