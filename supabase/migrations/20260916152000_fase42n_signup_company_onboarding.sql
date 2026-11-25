-- FASE 42N: Ny egenregistrering må gi Systemadmin komplett firmagrunnlag før godkjenning.
-- Eksisterende firmainvitasjon beholdes uendret. Nye firma opprettes kun som ventende profil.

create or replace function public.signup_company_application_available(
  p_company_name text,
  p_org_number text
)
returns jsonb
language plpgsql
stable
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  v_company_name text := trim(coalesce(p_company_name, ''));
  v_company_norm text := public.sales_normalize_company_name(p_company_name);
  v_org text := regexp_replace(coalesce(p_org_number, ''), '[^0-9]', '', 'g');
  v_exists boolean := false;
begin
  if v_company_norm = '' then
    return jsonb_build_object('available', false, 'reason', 'missing_company_name');
  end if;

  if length(v_org) <> 9 then
    return jsonb_build_object('available', false, 'reason', 'invalid_org_number');
  end if;

  select exists (
    select 1
    from public.profiles p
    where public.sales_normalize_company_name(p.company_name) = v_company_norm
       or regexp_replace(coalesce(p.org_number, ''), '[^0-9]', '', 'g') = v_org
    union all
    select 1
    from public.companies c
    where public.sales_normalize_company_name(c.company_name) = v_company_norm
       or regexp_replace(coalesce(c.org_number, ''), '[^0-9]', '', 'g') = v_org
    union all
    select 1
    from public.sales_company_scopes s
    where s.normalized_name = v_company_norm
  ) into v_exists;

  if v_exists then
    return jsonb_build_object('available', false, 'reason', 'existing_company');
  end if;

  return jsonb_build_object(
    'available', true,
    'reason', 'available',
    'company_name', v_company_name,
    'org_number', v_org
  );
end;
$$;

revoke all on function public.signup_company_application_available(text, text) from public;
grant execute on function public.signup_company_application_available(text, text) to anon, authenticated, service_role;

create or replace function public.handle_auth_signup_company_application()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'auth', 'pg_temp'
as $$
declare
  v_meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_mode text := lower(trim(coalesce(v_meta ->> 'expo_proffdok_signup_mode', '')));
  v_company_name text := trim(coalesce(v_meta ->> 'expo_proffdok_company_name', ''));
  v_company_norm text := public.sales_normalize_company_name(v_meta ->> 'expo_proffdok_company_name');
  v_org text := regexp_replace(coalesce(v_meta ->> 'expo_proffdok_org_number', ''), '[^0-9]', '', 'g');
  v_address text := trim(coalesce(v_meta ->> 'expo_proffdok_company_address', ''));
  v_phone text := trim(coalesce(v_meta ->> 'expo_proffdok_company_phone', ''));
  v_website text := trim(coalesce(v_meta ->> 'expo_proffdok_company_website', ''));
  v_available jsonb;
begin
  -- Inviterte brukere fortsetter i eksisterende company_user_invites-flyt når de logger inn.
  if v_mode <> 'new_company' then
    return new;
  end if;

  if v_company_norm = '' then
    raise exception 'Firmanavn mangler i registreringen.' using errcode = '23514';
  end if;
  if length(v_org) <> 9 then
    raise exception 'Organisasjonsnummer må inneholde 9 sifre.' using errcode = '23514';
  end if;
  if length(v_address) < 5 then
    raise exception 'Firmaadresse mangler i registreringen.' using errcode = '23514';
  end if;
  if length(regexp_replace(v_phone, '[^0-9]', '', 'g')) < 8 then
    raise exception 'Firmatelefon mangler i registreringen.' using errcode = '23514';
  end if;

  v_available := public.signup_company_application_available(v_company_name, v_org);
  if coalesce((v_available ->> 'available')::boolean, false) is not true then
    raise exception 'Firmaet finnes allerede i Expo ProffDok. Be firmaadministrator invitere deg.' using errcode = '23505';
  end if;

  insert into public.profiles (
    id,
    email,
    approved,
    deactivated,
    company_name,
    company_role,
    org_number,
    address,
    phone,
    website
  ) values (
    new.id,
    new.email,
    false,
    false,
    v_company_name,
    'firmaadmin',
    v_org,
    v_address,
    v_phone,
    v_website
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_auth_signup_company_application() from public;
grant execute on function public.handle_auth_signup_company_application() to service_role;

drop trigger if exists on_auth_user_signup_company_application on auth.users;
create trigger on_auth_user_signup_company_application
after insert on auth.users
for each row
execute function public.handle_auth_signup_company_application();
