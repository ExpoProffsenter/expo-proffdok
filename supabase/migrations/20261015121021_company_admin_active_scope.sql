-- Scoped company administration. Existing primary-company and module RPCs stay intact.
create schema if not exists company_admin_private;
revoke all on schema company_admin_private from public, anon, authenticated;

create function company_admin_private.require_manager(c uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
 if c is null or public.current_active_company_scope_id() is distinct from c then
  raise exception 'Arbeidsfirmaet er endret. Hent firmaoversikten på nytt.' using errcode='42501';
 end if;
 perform kshms_private.require_module_manager(c);
end $$;

create function public.company_admin_snapshot(p_company_id uuid default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare c uuid:=coalesce(p_company_id,public.current_active_company_scope_id()); managed jsonb:='{}'; result jsonb;
begin
 perform company_admin_private.require_manager(c);
 if public.current_profile_is_systemadmin() or public.current_profile_is_firmaadmin() then
  managed:=public.list_managed_module_access();
 end if;
 select jsonb_build_object('company_id',s.id,'company_name',s.display_name,
  'company_profile',public.work_profile_company_profile(s.id),
  'caller_id',auth.uid(),'is_systemadmin',public.current_profile_is_systemadmin(),
  'caller_module_keys',to_jsonb(public.current_user_module_keys()),
  'users',coalesce((select jsonb_agg(jsonb_build_object(
   'id',p.id,'email',p.email,'name',coalesce(to_jsonb(p)->>'full_name',to_jsonb(p)->>'name',''),
   'company_name',p.company_name,'company_role',m.workspace_role,'is_primary',m.is_primary,
   'system_role',p.system_role,'approved',p.approved,'deactivated',p.deactivated,
   'can_edit_role',p.id<>auth.uid() and coalesce(p.system_role,'')<>'systemadmin' and
     (public.current_profile_is_systemadmin() or not m.is_primary or c=public.current_primary_company_scope_id()),
   'core_access',(select u from jsonb_array_elements(coalesce(managed->'users','[]'))u where u->>'user_id'=p.id::text)
   ) order by lower(p.email)) from public.sales_company_memberships m join public.profiles p on p.id=m.user_id
    where m.company_id=c and (public.current_profile_is_systemadmin() or coalesce(p.system_role,'')<>'systemadmin')),'[]'),
  'invites',coalesce((select jsonb_agg(jsonb_build_object('id',i.id,'email',i.email,'company_role',i.company_role)
    order by i.created_at desc) from public.company_user_invites i
    where public.sales_normalize_company_name(i.company_name)=s.normalized_name and i.status in ('pending','active')),'[]'))
 into result from public.sales_company_scopes s where s.id=c;
 return result;
end $$;

create function public.company_admin_set_role(p_company_id uuid,p_user_id uuid,p_expected_role text,p_role text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare m public.sales_company_memberships%rowtype; p public.profiles%rowtype;
begin
 perform company_admin_private.require_manager(p_company_id);
 if p_role is null or p_role not in ('ansatt','firmaadmin') then raise exception 'Ugyldig rolle.' using errcode='22023'; end if;
 select * into p from public.profiles where id=p_user_id for update;
 select * into m from public.sales_company_memberships where company_id=p_company_id and user_id=p_user_id for update;
 if m.user_id is null or p_user_id=auth.uid() or p.system_role='systemadmin' then
  raise exception 'Denne brukerrollen kan ikke endres her.' using errcode='42501'; end if;
 if m.workspace_role is distinct from p_expected_role then raise exception 'Rollen er endret. Hent på nytt.' using errcode='40001'; end if;
 if m.is_primary then
  -- Preserve the existing profile guard and primary-workspace synchronization.
  update public.profiles set company_role=p_role where id=p_user_id;
 else
  update public.sales_company_memberships set workspace_role=p_role,updated_at=now(),granted_by=auth.uid()
   where company_id=p_company_id and user_id=p_user_id;
 end if;
 return public.company_admin_snapshot(p_company_id);
end $$;

create function public.company_admin_set_status(p_company_id uuid,p_user_id uuid,p_expected jsonb,p_deactivated boolean)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare p public.profiles%rowtype;
begin
 perform company_admin_private.require_manager(p_company_id);
 if not public.current_profile_is_systemadmin() or p_user_id=auth.uid() or p_deactivated is null then
  raise exception 'Kontostatus styres av systemadministrator og gjelder alle firmaer.' using errcode='42501'; end if;
 select * into p from public.profiles where id=p_user_id for update;
 if p.id is null or p.system_role='systemadmin' or not exists(select 1 from public.sales_company_memberships where company_id=p_company_id and user_id=p_user_id)
 then raise exception 'Brukeren kan ikke endres her.' using errcode='42501'; end if;
 if jsonb_build_object('approved',p.approved,'deactivated',p.deactivated) is distinct from p_expected
 then raise exception 'Kontostatus er endret. Hent på nytt.' using errcode='40001'; end if;
 update public.profiles set approved=not p_deactivated,deactivated=p_deactivated where id=p_user_id;
 return public.company_admin_snapshot(p_company_id);
end $$;

create function public.company_admin_invite(p_company_id uuid,p_email text,p_role text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare s public.sales_company_scopes%rowtype; p public.profiles%rowtype;
 v_email text:=lower(trim(coalesce(p_email,''))); inviter text; primary_id uuid; accepted boolean:=false; canonical_name text;
begin
 perform company_admin_private.require_manager(p_company_id);
 if v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or length(v_email)>254 or p_role is null or p_role not in ('ansatt','firmaadmin')
 then raise exception 'Kontroller e-postadresse og rolle.' using errcode='22023'; end if;
 select * into s from public.sales_company_scopes where id=p_company_id;
 -- A renamed display label must never create a second company identity at signup.
 select company_name into canonical_name from public.profiles
  where public.sales_normalize_company_name(company_name)=s.normalized_name order by created_at limit 1;
 canonical_name:=coalesce(canonical_name,s.normalized_name);
 select p0.email into inviter from public.profiles p0 where p0.id=auth.uid();
 perform pg_advisory_xact_lock(hashtextextended('company-invite:'||v_email,0));
 select * into p from public.profiles where lower(trim(profiles.email))=v_email for update;
 if p.id is not null then
  if p.id=auth.uid() or p.system_role='systemadmin' or coalesce(p.deactivated,false) then
   raise exception 'Egen bruker, systemadministrator eller deaktivert konto kan ikke inviteres her.' using errcode='42501'; end if;
  select company_id into primary_id from public.sales_company_memberships where user_id=p.id and is_primary;
  if primary_id is not null and primary_id<>p_company_id then
   if not public.current_profile_is_systemadmin() or not public.is_internal_work_profile_company(primary_id)
      or not public.is_internal_work_profile_company(p_company_id) or not coalesce(p.approved,false)
   then raise exception 'Brukeren tilhører et annet firma. Systemadministrator må behandle arbeidsprofiler.' using errcode='42501'; end if;
   insert into public.sales_company_memberships(company_id,user_id,is_primary,workspace_role,granted_by,updated_at)
    values(p_company_id,p.id,false,p_role,auth.uid(),now())
    on conflict(company_id,user_id) do update set workspace_role=excluded.workspace_role,granted_by=excluded.granted_by,updated_at=now();
   accepted:=true;
  elsif primary_id=p_company_id and coalesce(p.approved,false) then
   update public.profiles set company_role=p_role where id=p.id;
   accepted:=true;
  elsif nullif(public.sales_normalize_company_name(p.company_name),'') is not null and
    public.sales_normalize_company_name(p.company_name)<>s.normalized_name then
   raise exception 'Brukeren tilhører et annet firma.' using errcode='42501';
  end if;
 end if;
 insert into public.company_user_invites(email,company_name,company_role,invited_by,status,accepted,accepted_at,accepted_user_id)
 values(v_email,canonical_name,p_role,inviter,case when accepted then 'accepted' else 'pending' end,accepted,
  case when accepted then now() else null end,case when accepted then p.id else null end)
 on conflict(email,company_name) do update set company_role=excluded.company_role,invited_by=excluded.invited_by,
  status=excluded.status,accepted=excluded.accepted,accepted_at=excluded.accepted_at,accepted_user_id=excluded.accepted_user_id,created_at=now();
 return jsonb_build_object('company_id',p_company_id,'company_name',s.display_name,'invite_company_name',canonical_name,'email',v_email,'accepted',accepted,
  'company_profile',public.work_profile_company_profile(p_company_id));
end $$;

revoke all on all functions in schema company_admin_private from public,anon,authenticated;
revoke all on function public.company_admin_snapshot(uuid),public.company_admin_set_role(uuid,uuid,text,text),
 public.company_admin_set_status(uuid,uuid,jsonb,boolean),public.company_admin_invite(uuid,text,text) from public,anon;
grant execute on function public.company_admin_snapshot(uuid),public.company_admin_set_role(uuid,uuid,text,text),
 public.company_admin_set_status(uuid,uuid,jsonb,boolean),public.company_admin_invite(uuid,text,text) to authenticated;

-- Validate a scoped firmaadmin invitation again when the recipient signs in.
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
            (inviter.company_role = 'firmaadmin'
             and public.sales_normalize_company_name(inviter.company_name)
               = public.sales_normalize_company_name(i.company_name))
            or exists (
              select 1 from public.sales_company_memberships m
              join public.sales_company_scopes s on s.id=m.company_id
              where m.user_id=inviter.id and m.workspace_role='firmaadmin'
                and inviter.role in ('admin','member','ansatt','firmaadmin')
                and s.normalized_name=public.sales_normalize_company_name(i.company_name)
            )
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


revoke all on function public.accept_company_user_invite() from public,anon;
grant execute on function public.accept_company_user_invite() to authenticated;
