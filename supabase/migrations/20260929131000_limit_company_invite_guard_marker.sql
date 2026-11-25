-- Begrens invitasjonsmarkøren til selve den validerte profiloppdateringen.
-- Første migrasjon er allerede kjørt i Sandbox, derfor beholdes denne idempotente
-- oppfølgingen for lik migrasjonshistorikk i Sandbox og Production.

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

revoke all on function public.accept_company_user_invite() from public, anon;
grant execute on function public.accept_company_user_invite() to authenticated;
