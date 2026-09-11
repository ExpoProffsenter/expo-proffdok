-- Expo ProffDok – FASE 41B.3G
-- Firmainvitasjon kan hjelpe med firma/firmarolle, men skal aldri godkjenne eller
-- reaktivere en bruker. Godkjenning/deaktivering er en systemadmin-handling.

create or replace function public.guard_profile_security_fields()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
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
        raise exception 'Firmainvitasjon kan ikke godkjenne eller reaktivere en bruker.' using errcode = '42501';
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

comment on function public.guard_profile_security_fields() is
  'FASE 41B.3G: systemadmin er eneste godkjenningsgrense; firmainvitasjon kan ikke selv-godkjenne eller reaktivere.';
