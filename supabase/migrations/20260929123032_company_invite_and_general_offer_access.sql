-- Firmaadministrert invitasjon og firmadekkende tilgang til Generelle tilbud.
--
-- Kontrakt:
-- 1. En gyldig invitasjon fra aktiv Systemadmin/Firmaadmin kobler brukeren til firmaet
--    og godkjenner kontoen uten en ekstra Systemadmin-handling.
-- 2. En deaktivert konto kan aldri reaktiveres via invitasjon.
-- 3. Generelle tilbud er en firmatilgang. Systemadmin aktiverer/deaktiverer den én
--    gang for firmaet, og alle firmaets brukere får samme modulgrunnlag.
-- 4. «Din nto pris» forblir en separat rettighet per bruker. Firmaadmin kan styre
--    andre brukere i eget firma, men kan ikke gi rettigheten til seg selv.

create table if not exists public.company_module_access (
  company_id uuid not null references public.sales_company_scopes(id) on delete cascade,
  module_key text not null,
  enabled boolean not null default true,
  granted_by uuid null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (company_id, module_key),
  constraint company_module_access_supported_key
    check (module_key = 'store_offers')
);

create index if not exists company_module_access_granted_by_idx
  on public.company_module_access (granted_by);

alter table public.company_module_access enable row level security;
revoke all on public.company_module_access from anon, authenticated;

-- Bevar eksisterende tilgang: dersom minst én bruker i firmaet allerede hadde
-- Generelle tilbud, regnes firmaet som aktivert og alle brukere synkroniseres.
insert into public.company_module_access (
  company_id,
  module_key,
  enabled,
  granted_by,
  created_at,
  updated_at
)
select distinct
  s.id,
  'store_offers',
  true,
  null::uuid,
  now(),
  now()
from public.sales_company_scopes s
join public.profiles p
  on public.sales_normalize_company_name(p.company_name) = s.normalized_name
join public.user_module_access uma
  on uma.user_id = p.id
 and uma.module_key = 'store_offers'
on conflict (company_id, module_key) do nothing;

CREATE OR REPLACE FUNCTION public.company_has_store_offers_access(p_company_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  select coalesce((
    select a.enabled
    from public.company_module_access a
    where a.company_id = p_company_id
      and a.module_key = 'store_offers'
  ), false);
$function$;

CREATE OR REPLACE FUNCTION public.sync_company_store_offers_users(p_company_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_company_norm text;
  v_enabled boolean := false;
  v_granted_by uuid;
begin
  select s.normalized_name
  into v_company_norm
  from public.sales_company_scopes s
  where s.id = p_company_id;

  if v_company_norm is null then
    raise exception 'Firmaet finnes ikke.' using errcode = 'P0002';
  end if;

  select a.enabled, a.granted_by
  into v_enabled, v_granted_by
  from public.company_module_access a
  where a.company_id = p_company_id
    and a.module_key = 'store_offers';

  v_enabled := coalesce(v_enabled, false);

  if v_enabled then
    insert into public.user_module_access (user_id, module_key, granted_by)
    select p.id, module_row.module_key, v_granted_by
    from public.profiles p
    cross join unnest(array['sales', 'store_offers']::text[]) as module_row(module_key)
    where public.sales_normalize_company_name(p.company_name) = v_company_norm
    on conflict (user_id, module_key) do update
      set granted_by = case
        when excluded.module_key = 'store_offers' then coalesce(excluded.granted_by, public.user_module_access.granted_by)
        else public.user_module_access.granted_by
      end;
  else
    delete from public.user_module_access uma
    using public.profiles p
    where uma.user_id = p.id
      and uma.module_key = 'store_offers'
      and public.sales_normalize_company_name(p.company_name) = v_company_norm;

    delete from public.store_catalog_user_price_access a
    where a.company_id = p_company_id;
  end if;
end;
$function$;

CREATE OR REPLACE FUNCTION public.get_company_store_offers_access(p_company_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
  if auth.uid() is null or not public.current_profile_is_systemadmin() then
    raise exception 'Kun Systemadministrator kan lese firmatilgangen her.' using errcode = '42501';
  end if;

  if p_company_id is null or not exists (
    select 1 from public.sales_company_scopes s where s.id = p_company_id
  ) then
    raise exception 'Firmaet finnes ikke.' using errcode = 'P0002';
  end if;

  return jsonb_build_object(
    'company_id', p_company_id,
    'enabled', public.company_has_store_offers_access(p_company_id)
  );
end;
$function$;

CREATE OR REPLACE FUNCTION public.set_company_store_offers_access(p_company_id uuid, p_enabled boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_enabled boolean := coalesce(p_enabled, false);
begin
  if auth.uid() is null or not public.current_profile_is_systemadmin() then
    raise exception 'Kun Systemadministrator kan endre firmatilgangen til Generelle tilbud.' using errcode = '42501';
  end if;

  if p_company_id is null or not exists (
    select 1 from public.sales_company_scopes s where s.id = p_company_id
  ) then
    raise exception 'Firmaet finnes ikke.' using errcode = 'P0002';
  end if;

  if v_enabled
     and not public.is_internal_work_profile_company(p_company_id)
     and not public.company_has_pro_store_catalog_access(p_company_id) then
    raise exception 'Aktiver minst én leverandør for firmaet før Generelle tilbud aktiveres.' using errcode = '42501';
  end if;

  insert into public.company_module_access (
    company_id,
    module_key,
    enabled,
    granted_by,
    created_at,
    updated_at
  ) values (
    p_company_id,
    'store_offers',
    v_enabled,
    auth.uid(),
    now(),
    now()
  )
  on conflict (company_id, module_key) do update
    set enabled = excluded.enabled,
        granted_by = excluded.granted_by,
        updated_at = now();

  perform public.sync_company_store_offers_users(p_company_id);

  return jsonb_build_object(
    'company_id', p_company_id,
    'enabled', v_enabled
  );
end;
$function$;

CREATE OR REPLACE FUNCTION public.sync_profile_company_store_offers_access()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_company_id uuid;
begin
  if nullif(public.sales_normalize_company_name(new.company_name), '') is null then
    delete from public.user_module_access
    where user_id = new.id and module_key = 'store_offers';
    return new;
  end if;

  select s.id
  into v_company_id
  from public.sales_company_scopes s
  where s.normalized_name = public.sales_normalize_company_name(new.company_name)
  limit 1;

  if v_company_id is not null and public.company_has_store_offers_access(v_company_id) then
    insert into public.user_module_access (user_id, module_key, granted_by)
    select new.id, module_row.module_key, a.granted_by
    from public.company_module_access a
    cross join unnest(array['sales', 'store_offers']::text[]) as module_row(module_key)
    where a.company_id = v_company_id
      and a.module_key = 'store_offers'
      and a.enabled = true
    on conflict (user_id, module_key) do nothing;
  else
    delete from public.user_module_access
    where user_id = new.id and module_key = 'store_offers';
  end if;

  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.guard_profile_security_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_uid uuid := auth.uid();
  v_auth_email text := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  v_caller_company text := '';
  v_caller_company_norm text := '';
  v_old_company_norm text := '';
  v_new_company_norm text := lower(trim(coalesce(new.company_name, '')));
  v_is_systemadmin boolean := false;
  v_is_firmaadmin boolean := false;
  v_invite_role text := null;
  v_invite_ok boolean := false;
  v_first_company_setup boolean := false;
  v_accepting_validated_invite boolean :=
    coalesce(current_setting('expo.accepting_company_invite', true), '') = 'on';
begin
  if v_uid is null then return new; end if;

  if tg_op = 'INSERT' then
    if new.id is distinct from v_uid
       or new.system_role is not null
       or coalesce(new.is_admin, false) = true
       or coalesce(new.role, 'member') = 'admin'
       or coalesce(new.approved, false) = true
       or coalesce(new.deactivated, false) = true
       or new.company_id is not null
       or coalesce(new.company_role, 'ansatt') <> 'ansatt' then
      raise exception 'Profilen kan ikke opprettes med utvidede rettigheter.' using errcode = '42501';
    end if;
    return new;
  end if;

  if new.id is distinct from old.id then
    raise exception 'Bruker-ID kan ikke endres.' using errcode = '42501';
  end if;

  select
    coalesce(p.company_name, ''),
    (coalesce(p.approved, false) = true and coalesce(p.deactivated, false) = false and (p.system_role = 'systemadmin' or coalesce(p.is_admin, false) = true or p.role = 'admin')),
    (coalesce(p.approved, false) = true and coalesce(p.deactivated, false) = false and p.company_role = 'firmaadmin')
  into v_caller_company, v_is_systemadmin, v_is_firmaadmin
  from public.profiles p
  where p.id = v_uid
  limit 1;

  v_is_systemadmin := coalesce(v_is_systemadmin, false);
  v_is_firmaadmin := coalesce(v_is_firmaadmin, false);
  v_caller_company_norm := lower(trim(coalesce(v_caller_company, '')));
  v_old_company_norm := lower(trim(coalesce(old.company_name, '')));

  if v_is_systemadmin then return new; end if;

  if new.system_role is distinct from old.system_role
     or new.is_admin is distinct from old.is_admin
     or new.role is distinct from old.role
     or new.company_id is distinct from old.company_id then
    raise exception 'Systemrolle og systemtilknytning kan bare endres av systemadministrator.' using errcode = '42501';
  end if;

  if v_accepting_validated_invite and new.id = v_uid then
    if coalesce(old.deactivated, false) = true
       or coalesce(new.deactivated, false) = true
       or coalesce(new.approved, false) = false
       or v_new_company_norm = '' then
      raise exception 'Invitasjonen kan ikke reaktivere eller opprette en ugyldig profil.' using errcode = '42501';
    end if;
    return new;
  end if;

  if new.id is distinct from v_uid then
    if old.system_role = 'systemadmin' or coalesce(old.is_admin, false) = true or old.role = 'admin' then
      raise exception 'Administratorbrukere kan bare endres av systemadministrator.' using errcode = '42501';
    end if;
    if not v_is_firmaadmin
       or v_caller_company_norm = ''
       or v_old_company_norm <> v_caller_company_norm
       or v_new_company_norm <> v_caller_company_norm then
      raise exception 'Firmaadministrator kan bare endre brukere i eget firma.' using errcode = '42501';
    end if;
    if new.approved is distinct from old.approved
       or new.deactivated is distinct from old.deactivated then
      raise exception 'Godkjenning og deaktivering kan bare endres av systemadministrator.' using errcode = '42501';
    end if;
    return new;
  end if;

  select i.company_role into v_invite_role
  from public.company_user_invites i
  where lower(trim(i.email)) = v_auth_email
    and lower(trim(i.company_name)) = v_new_company_norm
    and i.status in ('pending', 'active')
  order by i.created_at desc
  limit 1;
  v_invite_ok := found;

  v_first_company_setup := v_old_company_norm = '' and v_new_company_norm <> '' and not exists (
    select 1 from public.profiles p
    where p.id <> v_uid
      and lower(trim(coalesce(p.company_name, ''))) = v_new_company_norm
  );

  if v_new_company_norm <> v_old_company_norm and not (v_invite_ok or v_first_company_setup) then
    raise exception 'Firmatilknytning kan ikke endres direkte. Bruk firmainvitasjon eller kontakt systemadministrator.' using errcode = '42501';
  end if;

  if new.company_role is distinct from old.company_role
     or new.approved is distinct from old.approved
     or new.deactivated is distinct from old.deactivated then
    if v_invite_ok then
      if new.company_role <> (case when v_invite_role = 'firmaadmin' then 'firmaadmin' else 'ansatt' end)
         or new.approved is distinct from old.approved
         or new.deactivated is distinct from old.deactivated then
        raise exception 'Firmainvitasjon kan ikke godkjenne eller reaktivere en bruker direkte.' using errcode = '42501';
      end if;
      return new;
    end if;

    if old.company_role = 'firmaadmin'
       and new.company_role = 'ansatt'
       and new.approved is not distinct from old.approved
       and new.deactivated is not distinct from old.deactivated then
      return new;
    end if;

    if v_first_company_setup
       and coalesce(old.company_role, 'ansatt') = 'ansatt'
       and new.company_role = 'firmaadmin'
       and new.approved is not distinct from old.approved
       and new.deactivated is not distinct from old.deactivated then
      return new;
    end if;

    raise exception 'Egen rolle, godkjenning eller deaktivering kan ikke endres direkte.' using errcode = '42501';
  end if;

  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.accept_company_user_invite()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_uid uuid := auth.uid();
  v_email text := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  v_profile public.profiles%rowtype;
  v_invite public.company_user_invites%rowtype;
  v_company_id uuid;
begin
  if v_uid is null or v_email = '' then
    raise exception 'Du må være innlogget.' using errcode = '42501';
  end if;

  select *
  into v_profile
  from public.profiles p
  where p.id = v_uid
  for update;

  if v_profile.id is null then
    raise exception 'Brukerprofilen finnes ikke.' using errcode = 'P0002';
  end if;

  select i.*
  into v_invite
  from public.company_user_invites i
  where lower(trim(i.email)) = v_email
    and i.status in ('pending', 'active')
    and exists (
      select 1
      from public.profiles inviter
      where lower(trim(inviter.email)) = lower(trim(i.invited_by))
        and coalesce(inviter.approved, false) = true
        and coalesce(inviter.deactivated, false) = false
        and (
          inviter.system_role = 'systemadmin'
          or (
            inviter.company_role = 'firmaadmin'
            and public.sales_normalize_company_name(inviter.company_name)
              = public.sales_normalize_company_name(i.company_name)
          )
        )
    )
  order by i.created_at desc
  limit 1
  for update;

  if v_invite.id is null then
    return jsonb_build_object('accepted', false, 'reason', 'no_valid_invite');
  end if;

  if coalesce(v_profile.deactivated, false) = true then
    raise exception 'Kontoen er deaktivert og må behandles av Systemadministrator.' using errcode = '42501';
  end if;

  if nullif(public.sales_normalize_company_name(v_profile.company_name), '') is not null
     and public.sales_normalize_company_name(v_profile.company_name)
       <> public.sales_normalize_company_name(v_invite.company_name) then
    raise exception 'Kontoen er allerede knyttet til et annet firma.' using errcode = '42501';
  end if;

  perform set_config('expo.accepting_company_invite', 'on', true);

  update public.profiles
  set company_name = v_invite.company_name,
      company_role = case when v_invite.company_role = 'firmaadmin' then 'firmaadmin' else 'ansatt' end,
      approved = true,
      deactivated = false,
      invited_by = coalesce(nullif(v_invite.invited_by, ''), invited_by)
  where id = v_uid;

  perform set_config('expo.accepting_company_invite', 'off', true);

  update public.company_user_invites
  set status = 'accepted',
      accepted = true,
      accepted_at = coalesce(accepted_at, now()),
      accepted_user_id = v_uid
  where id = v_invite.id;

  select s.id
  into v_company_id
  from public.sales_company_scopes s
  where s.normalized_name = public.sales_normalize_company_name(v_invite.company_name)
  limit 1;

  if v_company_id is not null then
    perform public.sync_company_store_offers_users(v_company_id);
  end if;

  return jsonb_build_object(
    'accepted', true,
    'company_name', v_invite.company_name,
    'company_role', case when v_invite.company_role = 'firmaadmin' then 'firmaadmin' else 'ansatt' end,
    'company_id', v_company_id
  );
end;
$function$;

CREATE OR REPLACE FUNCTION public.current_user_has_module_access(p_module_key text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  select
    public.module_access_valid_key(p_module_key)
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and coalesce(p.approved, false) = true
        and coalesce(p.deactivated, false) = false
        and (
          p.system_role = 'systemadmin'
          or (
            trim(p_module_key) <> 'store_offers'
            and exists (
              select 1
              from public.user_module_access uma
              where uma.user_id = p.id
                and uma.module_key = trim(p_module_key)
            )
          )
          or (
            trim(p_module_key) = 'store_offers'
            and public.company_has_store_offers_access(public.current_active_company_scope_id())
            and exists (
              select 1
              from public.user_module_access sales_access
              where sales_access.user_id = p.id
                and sales_access.module_key = 'sales'
            )
            and (
              public.is_internal_work_profile_company(public.current_active_company_scope_id())
              or public.company_has_pro_store_catalog_access(public.current_active_company_scope_id())
            )
          )
        )
    );
$function$;

CREATE OR REPLACE FUNCTION public.list_managed_module_access()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_uid uuid := auth.uid();
  v_is_systemadmin boolean := false;
  v_is_firmaadmin boolean := false;
  v_company_name text := '';
  v_users jsonb := '[]'::jsonb;
begin
  if v_uid is null then
    raise exception 'Du må være innlogget.' using errcode = '42501';
  end if;

  v_is_systemadmin := public.current_profile_is_systemadmin();
  v_is_firmaadmin := public.current_profile_is_firmaadmin();
  if not v_is_systemadmin and not v_is_firmaadmin then
    raise exception 'Du har ikke tilgang til brukeradministrasjon.' using errcode = '42501';
  end if;

  select coalesce(p.company_name, '')
  into v_company_name
  from public.profiles p
  where p.id = v_uid;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'user_id', p.id,
      'email', p.email,
      'company_name', p.company_name,
      'company_role', p.company_role,
      'system_role', p.system_role,
      'approved', coalesce(p.approved, false),
      'deactivated', coalesce(p.deactivated, false),
      'module_keys', to_jsonb(coalesce((
        select array_agg(uma.module_key order by uma.module_key)
        from public.user_module_access uma
        where uma.user_id = p.id
      ), array[]::text[])),
      'feature_keys', to_jsonb(case
        when p.system_role = 'systemadmin' then array['view_internal_net_prices']::text[]
        else coalesce((
          select array_agg(ufa.feature_key order by ufa.feature_key)
          from public.user_feature_access ufa
          where ufa.user_id = p.id
        ), array[]::text[])
      end),
      'company_scope_id', (
        select s.id
        from public.sales_company_scopes s
        where s.normalized_name = public.sales_normalize_company_name(p.company_name)
        limit 1
      ),
      'company_store_offers_enabled', coalesce((
        select public.company_has_store_offers_access(s.id)
        from public.sales_company_scopes s
        where s.normalized_name = public.sales_normalize_company_name(p.company_name)
        limit 1
      ), false),
      'company_has_pro_catalog', coalesce((
        select public.company_has_pro_store_catalog_access(s.id)
        from public.sales_company_scopes s
        where s.normalized_name = public.sales_normalize_company_name(p.company_name)
        limit 1
      ), false),
      'pro_net_price_can_view', coalesce((
        select a.can_view_net_price
        from public.sales_company_scopes s
        join public.store_catalog_user_price_access a
          on a.company_id = s.id and a.user_id = p.id
        where s.normalized_name = public.sales_normalize_company_name(p.company_name)
        limit 1
      ), false)
    ) order by coalesce(p.company_name, ''), coalesce(p.email, '')
  ), '[]'::jsonb)
  into v_users
  from public.profiles p
  where v_is_systemadmin
     or public.sales_normalize_company_name(p.company_name)
        = public.sales_normalize_company_name(v_company_name);

  return jsonb_build_object(
    'caller_module_keys', to_jsonb(public.current_user_module_keys()),
    'is_systemadmin', v_is_systemadmin,
    'is_firmaadmin', v_is_firmaadmin,
    'company_name', v_company_name,
    'users', v_users
  );
end;
$function$;

CREATE OR REPLACE FUNCTION public.set_managed_module_access(target_user_id uuid, requested_module_keys text[] DEFAULT ARRAY[]::text[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_uid uuid := auth.uid();
  v_is_systemadmin boolean := false;
  v_is_firmaadmin boolean := false;
  v_actor_company text := '';
  v_target public.profiles%rowtype;
  v_requested text[] := array[]::text[];
  v_actor_keys text[] := array[]::text[];
  v_invalid text;
  v_wants_store boolean := false;
  v_company_store_enabled boolean := false;
  v_target_company_id uuid;
begin
  if v_uid is null then
    raise exception 'Du må være innlogget.' using errcode = '42501';
  end if;

  v_is_systemadmin := public.current_profile_is_systemadmin();
  v_is_firmaadmin := public.current_profile_is_firmaadmin();
  if not v_is_systemadmin and not v_is_firmaadmin then
    raise exception 'Du har ikke tilgang til brukeradministrasjon.' using errcode = '42501';
  end if;

  select * into v_target from public.profiles where id = target_user_id;
  if v_target.id is null then
    raise exception 'Brukeren finnes ikke.' using errcode = 'P0002';
  end if;

  select coalesce(p.company_name, '')
  into v_actor_company
  from public.profiles p
  where p.id = v_uid;

  if not v_is_systemadmin then
    if target_user_id = v_uid then
      raise exception 'Firmaadministrator kan ikke endre sin egen modultilgang.' using errcode = '42501';
    end if;
    if v_target.system_role = 'systemadmin' then
      raise exception 'Systemadministrator kan ikke endres fra firma.' using errcode = '42501';
    end if;
    if public.sales_normalize_company_name(v_target.company_name)
       <> public.sales_normalize_company_name(v_actor_company) then
      raise exception 'Brukeren tilhører ikke ditt firma.' using errcode = '42501';
    end if;
  end if;

  select coalesce(array_agg(distinct trim(k) order by trim(k)), array[]::text[])
  into v_requested
  from unnest(coalesce(requested_module_keys, array[]::text[])) k
  where nullif(trim(k), '') is not null;

  select k into v_invalid
  from unnest(v_requested) k
  where not public.module_access_valid_key(k)
  limit 1;

  if v_invalid is not null then
    raise exception 'Ugyldig modultilgang: %', v_invalid using errcode = '22023';
  end if;

  if 'store_offers' = any(v_requested) and not ('sales' = any(v_requested)) then
    v_requested := array_append(v_requested, 'sales');
  end if;

  select s.id
  into v_target_company_id
  from public.sales_company_scopes s
  where s.normalized_name = public.sales_normalize_company_name(v_target.company_name)
  limit 1;

  v_company_store_enabled := public.company_has_store_offers_access(v_target_company_id);
  v_wants_store := 'store_offers' = any(v_requested);

  if v_wants_store is distinct from v_company_store_enabled then
    raise exception 'Generelle tilbud styres samlet for hele firmaet av Systemadministrator.' using errcode = '42501';
  end if;

  if v_company_store_enabled and not ('sales' = any(v_requested)) then
    raise exception 'Befaring / Våtromstilbud må beholdes når firmaet har Generelle tilbud.' using errcode = '42501';
  end if;

  if not v_is_systemadmin then
    v_actor_keys := public.current_user_module_keys();
    if exists (
      select 1
      from unnest(v_requested) k
      where k <> 'store_offers' and not (k = any(v_actor_keys))
    ) then
      raise exception 'Du kan bare gi tilgang til moduler du selv har.' using errcode = '42501';
    end if;
  end if;

  delete from public.user_module_access where user_id = target_user_id;
  insert into public.user_module_access (user_id, module_key, granted_by)
  select target_user_id, k, v_uid
  from unnest(v_requested) k;

  return jsonb_build_object(
    'user_id', target_user_id,
    'module_keys', to_jsonb(v_requested)
  );
end;
$function$;

CREATE OR REPLACE FUNCTION public.set_managed_pro_catalog_net_price_access(target_user_id uuid, p_can_view boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_uid uuid := auth.uid();
  v_target public.profiles%rowtype;
  v_company_id uuid;
begin
  if v_uid is null or not public.current_profile_is_systemadmin() then
    raise exception 'Kun Systemadministrator kan endre «Din nto pris» her.' using errcode = '42501';
  end if;

  select * into v_target from public.profiles where id = target_user_id;
  if v_target.id is null then
    raise exception 'Brukeren finnes ikke.' using errcode = 'P0002';
  end if;

  select s.id into v_company_id
  from public.sales_company_scopes s
  where s.normalized_name = public.sales_normalize_company_name(v_target.company_name)
  limit 1;

  if v_company_id is null then
    raise exception 'Brukerens firma mangler gyldig firmascope.' using errcode = '42501';
  end if;

  if coalesce(p_can_view, false) then
    if coalesce(v_target.approved, false) = false or coalesce(v_target.deactivated, false) = true then
      raise exception 'Brukeren må være godkjent og aktiv før «Din nto pris» kan aktiveres.' using errcode = '42501';
    end if;
    if not public.company_has_store_offers_access(v_company_id)
       or not public.company_has_pro_store_catalog_access(v_company_id) then
      raise exception 'Firmaet må ha Generelle tilbud og minst én aktiv leverandør.' using errcode = '42501';
    end if;
    if not exists (
      select 1 from public.user_module_access
      where user_id = target_user_id and module_key = 'sales'
    ) then
      raise exception 'Brukeren mangler Befaring / Våtromstilbud.' using errcode = '42501';
    end if;
  end if;

  insert into public.store_catalog_user_price_access (
    company_id,
    user_id,
    can_view_net_price,
    updated_by,
    updated_at
  ) values (
    v_company_id,
    target_user_id,
    coalesce(p_can_view, false),
    v_uid,
    now()
  )
  on conflict (company_id, user_id) do update
    set can_view_net_price = excluded.can_view_net_price,
        updated_by = v_uid,
        updated_at = now();

  return jsonb_build_object(
    'user_id', target_user_id,
    'company_id', v_company_id,
    'can_view_net_price', coalesce(p_can_view, false)
  );
end;
$function$;

CREATE OR REPLACE FUNCTION public.set_store_catalog_user_net_price_access(p_user_id uuid, p_can_view boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$ declare v_actor_company uuid:=public.current_sales_company_id(); v_target_company uuid; begin if not public.current_profile_is_systemadmin() and not public.current_profile_is_firmaadmin() then raise exception 'Du har ikke tilgang til å administrere prisinnsyn.' using errcode='42501'; end if; select m.company_id into v_target_company from public.sales_company_memberships m where m.user_id=p_user_id order by m.company_id limit 1; if v_target_company is null then raise exception 'Brukeren har ikke gyldig firmatilknytning.' using errcode='P0002'; end if; if not public.current_profile_is_systemadmin() and v_target_company<>v_actor_company then raise exception 'Brukeren tilhører ikke ditt firma.' using errcode='42501'; end if; if not public.current_profile_is_systemadmin() and p_user_id=auth.uid() then raise exception 'Firmaadministrator kan ikke gi seg selv prisinnsyn.' using errcode='42501'; end if; insert into public.store_catalog_user_price_access(company_id,user_id,can_view_net_price,updated_by,updated_at) values(v_target_company,p_user_id,coalesce(p_can_view,false),auth.uid(),now()) on conflict(company_id,user_id) do update set can_view_net_price=excluded.can_view_net_price,updated_by=auth.uid(),updated_at=now(); return jsonb_build_object('user_id',p_user_id,'company_id',v_target_company,'can_view_net_price',coalesce(p_can_view,false)); end; $function$;

CREATE OR REPLACE FUNCTION public.set_store_catalog_user_net_price_access(p_company_id uuid, p_user_id uuid, p_can_view boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_actor_company uuid := public.current_active_company_scope_id();
  v_target public.profiles%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Du må være innlogget.' using errcode = '42501';
  end if;

  if not public.current_profile_is_systemadmin() and not public.current_profile_is_firmaadmin() then
    raise exception 'Du har ikke tilgang til å administrere prisinnsyn.' using errcode = '42501';
  end if;

  if p_company_id is null or not exists (
    select 1 from public.sales_company_scopes s where s.id = p_company_id
  ) then
    raise exception 'Firmaet finnes ikke.' using errcode = 'P0002';
  end if;

  if not exists (
    select 1 from public.sales_company_memberships m
    where m.company_id = p_company_id and m.user_id = p_user_id
  ) then
    raise exception 'Brukeren tilhører ikke valgt firma.' using errcode = '42501';
  end if;

  if not public.current_profile_is_systemadmin() and p_company_id <> v_actor_company then
    raise exception 'Du kan bare administrere prisinnsyn i aktivt firma.' using errcode = '42501';
  end if;

  if not public.current_profile_is_systemadmin() and p_user_id = auth.uid() then
    raise exception 'Firmaadministrator kan ikke gi seg selv prisinnsyn.' using errcode = '42501';
  end if;

  select * into v_target from public.profiles where id = p_user_id;
  if v_target.id is null then
    raise exception 'Brukeren finnes ikke.' using errcode = 'P0002';
  end if;

  if coalesce(p_can_view, false) then
    if coalesce(v_target.approved, false) = false or coalesce(v_target.deactivated, false) = true then
      raise exception 'Brukeren må være godkjent og aktiv før «Din nto pris» kan aktiveres.' using errcode = '42501';
    end if;
    if not public.company_has_store_offers_access(p_company_id)
       or not public.company_has_pro_store_catalog_access(p_company_id) then
      raise exception 'Firmaet må ha Generelle tilbud og minst én aktiv leverandør.' using errcode = '42501';
    end if;
    if not exists (
      select 1 from public.user_module_access uma
      where uma.user_id = p_user_id and uma.module_key = 'sales'
    ) then
      raise exception 'Brukeren mangler Befaring / Våtromstilbud.' using errcode = '42501';
    end if;
  end if;

  insert into public.store_catalog_user_price_access (
    company_id,
    user_id,
    can_view_net_price,
    updated_by,
    updated_at
  ) values (
    p_company_id,
    p_user_id,
    coalesce(p_can_view, false),
    auth.uid(),
    now()
  )
  on conflict (company_id, user_id) do update
    set can_view_net_price = excluded.can_view_net_price,
        updated_by = auth.uid(),
        updated_at = now();

  return jsonb_build_object(
    'user_id', p_user_id,
    'company_id', p_company_id,
    'can_view_net_price', coalesce(p_can_view, false)
  );
end;
$function$;

drop trigger if exists profiles_sync_company_store_offers_access on public.profiles;
create trigger profiles_sync_company_store_offers_access
after insert or update of company_name, approved, deactivated on public.profiles
for each row execute function public.sync_profile_company_store_offers_access();

comment on function public.guard_profile_security_fields() is
  'Invitasjon kan godkjenne en ny bruker bare via accept_company_user_invite; direkte selv-godkjenning og reaktivering er sperret.';

-- Rydd gamle ventende invitasjoner som allerede er manuelt fullført med korrekt
-- firma. Dette endrer ingen brukerstatus eller firmatilknytning.
update public.company_user_invites i
set status = 'accepted',
    accepted = true,
    accepted_at = coalesce(i.accepted_at, now()),
    accepted_user_id = p.id
from public.profiles p
where i.status in ('pending', 'active')
  and lower(trim(i.email)) = lower(trim(p.email))
  and public.sales_normalize_company_name(i.company_name)
    = public.sales_normalize_company_name(p.company_name)
  and coalesce(p.approved, false) = true
  and coalesce(p.deactivated, false) = false;

-- Synkroniser alle firma som ble seedet fra eksisterende brukertilgang.
do $$
declare
  v_company record;
begin
  for v_company in
    select a.company_id
    from public.company_module_access a
    where a.module_key = 'store_offers' and a.enabled = true
  loop
    perform public.sync_company_store_offers_users(v_company.company_id);
  end loop;
end;
$$;

revoke all on function public.company_has_store_offers_access(uuid) from public, anon, authenticated;
revoke all on function public.sync_company_store_offers_users(uuid) from public, anon, authenticated;
revoke all on function public.sync_profile_company_store_offers_access() from public, anon, authenticated;
revoke all on function public.get_company_store_offers_access(uuid) from public, anon;
revoke all on function public.set_company_store_offers_access(uuid, boolean) from public, anon;
revoke all on function public.accept_company_user_invite() from public, anon;
revoke all on function public.current_user_has_module_access(text) from public, anon;
revoke all on function public.list_managed_module_access() from public, anon;
revoke all on function public.set_managed_module_access(uuid, text[]) from public, anon;
revoke all on function public.set_managed_pro_catalog_net_price_access(uuid, boolean) from public, anon;
revoke all on function public.set_store_catalog_user_net_price_access(uuid, uuid, boolean) from public, anon;
revoke all on function public.set_store_catalog_user_net_price_access(uuid, boolean) from public, anon, authenticated;

grant execute on function public.get_company_store_offers_access(uuid) to authenticated;
grant execute on function public.set_company_store_offers_access(uuid, boolean) to authenticated;
grant execute on function public.accept_company_user_invite() to authenticated;
grant execute on function public.current_user_has_module_access(text) to authenticated;
grant execute on function public.list_managed_module_access() to authenticated;
grant execute on function public.set_managed_module_access(uuid, text[]) to authenticated;
grant execute on function public.set_managed_pro_catalog_net_price_access(uuid, boolean) to authenticated;
grant execute on function public.set_store_catalog_user_net_price_access(uuid, uuid, boolean) to authenticated;
