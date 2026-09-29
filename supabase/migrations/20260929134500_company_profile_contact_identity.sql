-- Felles firmaprofil: firmaets kontaktadresse er separat fra brukerens innlogging.
-- Firmaets primære arbeidsprofil er autoritativ identitet. public.companies lagrer
-- kontaktdata og deles av alle brukere i firmaet.

create or replace function public.work_profile_company_profile(p_company_id uuid)
returns jsonb
language sql
stable
security definer
set search_path to 'public', 'pg_temp'
as $function$
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
  where s.id = p_company_id;
$function$;

create or replace function public.get_my_company_profile()
returns jsonb
language plpgsql
stable
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_company_id uuid;
  v_profile jsonb;
  v_can_edit boolean := false;
  v_is_complete boolean := false;
begin
  if auth.uid() is null then
    raise exception 'Du må være innlogget.' using errcode = '42501';
  end if;

  v_company_id := public.current_primary_company_scope_id();
  if v_company_id is null then
    raise exception 'Brukeren er ikke koblet til et firma.' using errcode = 'P0002';
  end if;

  v_profile := public.work_profile_company_profile(v_company_id);
  if v_profile is null then
    raise exception 'Firmaprofilen finnes ikke.' using errcode = 'P0002';
  end if;

  v_can_edit :=
    public.current_profile_is_systemadmin()
    or public.current_profile_is_firmaadmin();

  v_is_complete :=
    length(regexp_replace(coalesce(v_profile ->> 'orgNumber', ''), '[^0-9]', '', 'g')) = 9
    and length(trim(coalesce(v_profile ->> 'address', ''))) >= 5
    and length(regexp_replace(coalesce(v_profile ->> 'phone', ''), '[^0-9]', '', 'g')) >= 8
    and trim(coalesce(v_profile ->> 'email', '')) ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$';

  return v_profile || jsonb_build_object(
    'canEdit', v_can_edit,
    'isComplete', v_is_complete
  );
end;
$function$;

create or replace function public.set_my_company_profile(
  p_org_number text,
  p_address text,
  p_phone text,
  p_email text,
  p_website text,
  p_logo_url text
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_actor public.profiles%rowtype;
  v_company_id uuid;
  v_scope public.sales_company_scopes%rowtype;
  v_company_row_id uuid;
  v_org_number text := trim(coalesce(p_org_number, ''));
  v_address text := trim(coalesce(p_address, ''));
  v_phone text := trim(coalesce(p_phone, ''));
  v_email text := lower(trim(coalesce(p_email, '')));
  v_website text := trim(coalesce(p_website, ''));
  v_logo_url text := trim(coalesce(p_logo_url, ''));
  v_result jsonb;
begin
  if auth.uid() is null then
    raise exception 'Du må være innlogget.' using errcode = '42501';
  end if;

  select *
  into v_actor
  from public.profiles p
  where p.id = auth.uid();

  if v_actor.id is null
     or coalesce(v_actor.approved, false) = false
     or coalesce(v_actor.deactivated, false) = true then
    raise exception 'Brukeren må være godkjent og aktiv.' using errcode = '42501';
  end if;

  if not (
    public.current_profile_is_systemadmin()
    or public.current_profile_is_firmaadmin()
  ) then
    raise exception 'Kun Firmaadmin eller Systemadministrator kan endre firmaprofilen.' using errcode = '42501';
  end if;

  if length(regexp_replace(v_org_number, '[^0-9]', '', 'g')) <> 9 then
    raise exception 'Foretaksnummer må inneholde 9 sifre.' using errcode = '23514';
  end if;
  if length(v_address) < 5 then
    raise exception 'Firmaadresse må fylles ut.' using errcode = '23514';
  end if;
  if length(regexp_replace(v_phone, '[^0-9]', '', 'g')) < 8 then
    raise exception 'Firmatelefon må inneholde minst 8 sifre.' using errcode = '23514';
  end if;
  if v_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'Skriv inn en gyldig firma-e-post.' using errcode = '23514';
  end if;

  v_company_id := public.current_primary_company_scope_id();
  if v_company_id is null then
    raise exception 'Brukeren er ikke koblet til et firma.' using errcode = 'P0002';
  end if;

  select *
  into v_scope
  from public.sales_company_scopes s
  where s.id = v_company_id;

  if v_scope.id is null then
    raise exception 'Firmaet finnes ikke.' using errcode = 'P0002';
  end if;

  select c.id
  into v_company_row_id
  from public.companies c
  where public.sales_normalize_company_name(c.company_name) = v_scope.normalized_name
  order by
    case when c.id = v_actor.company_id then 0 else 1 end,
    c.created_at asc,
    c.id
  limit 1
  for update;

  if v_company_row_id is null then
    insert into public.companies (
      company_name,
      org_number,
      address,
      phone,
      email,
      website,
      logo_url
    ) values (
      v_scope.display_name,
      v_org_number,
      v_address,
      v_phone,
      v_email,
      v_website,
      v_logo_url
    )
    returning id into v_company_row_id;
  else
    update public.companies
    set company_name = v_scope.display_name,
        org_number = v_org_number,
        address = v_address,
        phone = v_phone,
        email = v_email,
        website = v_website,
        logo_url = v_logo_url
    where id = v_company_row_id;
  end if;

  v_result := public.work_profile_company_profile(v_company_id);

  return v_result || jsonb_build_object(
    'canEdit', true,
    'isComplete', true
  );
end;
$function$;

comment on function public.get_my_company_profile() is
  'Henter felles firmaprofil for brukerens primærfirma. Firmaets e-post er separat fra brukerens innlogging.';
comment on function public.set_my_company_profile(text, text, text, text, text, text) is
  'Oppdaterer felles firmaprofil. Kun aktiv Firmaadmin/Systemadministrator; obligatoriske kontaktfelt valideres server-side.';

revoke all on function public.get_my_company_profile() from public, anon;
revoke all on function public.set_my_company_profile(text, text, text, text, text, text) from public, anon;
grant execute on function public.get_my_company_profile() to authenticated;
grant execute on function public.set_my_company_profile(text, text, text, text, text, text) to authenticated;
