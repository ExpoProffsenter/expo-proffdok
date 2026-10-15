-- Invitation choices are private administrative metadata, never employee HR data.
create table company_admin_private.invitation_access (
 invite_id uuid primary key references public.company_user_invites(id) on delete cascade,
 company_id uuid not null references public.sales_company_scopes(id) on delete cascade,
 inviter_id uuid not null references public.profiles(id) on delete cascade,
 options jsonb not null,
 expected_invite jsonb not null,
 new_account boolean not null,
 applied_at timestamptz,
 created_at timestamptz not null default now()
);
create index invitation_access_company_idx on company_admin_private.invitation_access(company_id);
create index invitation_access_inviter_idx on company_admin_private.invitation_access(inviter_id);
alter table company_admin_private.invitation_access enable row level security;
revoke all on company_admin_private.invitation_access from public,anon,authenticated,service_role;

create function company_admin_private.validate_invite_options(c uuid,actor uuid,opts jsonb)
returns void language plpgsql security definer set search_path='' as $$
declare grantor public.profiles%rowtype; keys text[]; licensed boolean;
begin
 select * into grantor from public.profiles where id=actor for share;
 if grantor.id is null or not coalesce(grantor.approved,false) or coalesce(grantor.deactivated,false) or not (
  coalesce(grantor.system_role,'')='systemadmin' or exists(select 1 from public.sales_company_memberships m
   where m.user_id=actor and m.company_id=c and m.workspace_role='firmaadmin' and grantor.role in ('admin','member','ansatt','firmaadmin')))
 then raise exception 'Inviterende administrator har ikke lenger tilgang til firmaet.' using errcode='42501';end if;
 if opts is null or jsonb_typeof(opts)<>'object' or
   exists(select 1 from jsonb_object_keys(opts) k where k not in ('module_keys','kshms','hr','kshms_role')) or
   jsonb_typeof(opts->'module_keys') is distinct from 'array' or
   jsonb_typeof(opts->'kshms') is distinct from 'boolean' or jsonb_typeof(opts->'hr') is distinct from 'boolean' or
   coalesce(opts->>'kshms_role','') not in ('reader','responsible') or jsonb_array_length(opts->'module_keys')>3
 then raise exception 'Ugyldige tilgangsvalg.' using errcode='22023';end if;
 if exists(select 1 from jsonb_array_elements(opts->'module_keys') k where jsonb_typeof(k)<>'string' or k#>>'{}' not in ('projects','sales','store_offers'))
 then raise exception 'Ugyldig hovedmodul.' using errcode='22023';end if;
 select coalesce(array_agg(v),array[]::text[]) into keys from jsonb_array_elements_text(opts->'module_keys') v;
 licensed:=public.company_has_store_offers_access(c);
 if ('store_offers'=any(keys)) is distinct from licensed or (licensed and not 'sales'=any(keys))
 then raise exception 'Generelle tilbud følger firmaavtalen og krever Befaring / Våtromstilbud.' using errcode='42501';end if;
 if coalesce(grantor.system_role,'')<>'systemadmin' and exists(select 1 from unnest(keys) k where k not in (
  select module_key from public.user_module_access where user_id=actor) and not(licensed and k in ('sales','store_offers')))
 then raise exception 'Du kan bare invitere med hovedmoduler du selv har.' using errcode='42501';end if;
 if ((opts->>'kshms')::boolean and not exists(select 1 from public.company_module_access where company_id=c and module_key='kshms' and enabled)) or
    ((opts->>'hr')::boolean and not exists(select 1 from public.company_module_access where company_id=c and module_key='hr' and enabled))
 then raise exception 'Modulen må først aktiveres på firmaet av systemadministrator.' using errcode='42501';end if;
end $$;

create function company_admin_private.apply_invite_options(invitation uuid,target uuid)
returns void language plpgsql security definer set search_path='' as $$
declare saved company_admin_private.invitation_access%rowtype;i public.company_user_invites%rowtype;
 target_role text;keys text[];k boolean;h boolean;r text;
begin
 select * into strict i from public.company_user_invites where id=invitation for update;
 select * into saved from company_admin_private.invitation_access where invite_id=invitation for update;
 if not found or saved.applied_at is not null then return;end if;
 if jsonb_build_object('email',i.email,'company_name',i.company_name,'company_role',i.company_role,'invited_by',i.invited_by,'created_at',i.created_at) is distinct from saved.expected_invite
 then raise exception 'Invitasjonen er endret. Be administrator sende den på nytt med ønskede tilganger.' using errcode='40001';end if;
 if i.accepted_user_id is distinct from target or not coalesce(i.accepted,false) or i.status<>'accepted' or
  not exists(select 1 from public.profiles where id=target and approved and not coalesce(deactivated,false))
 then raise exception 'Invitasjonen er ikke bekreftet for en aktiv bruker.' using errcode='42501';end if;
 perform company_admin_private.validate_invite_options(saved.company_id,saved.inviter_id,saved.options);
 select workspace_role into target_role from public.sales_company_memberships where company_id=saved.company_id and user_id=target for share;
 if target_role is null then raise exception 'Brukeren mangler firmatilknytning.' using errcode='42501';end if;
 k:=(saved.options->>'kshms')::boolean;h:=(saved.options->>'hr')::boolean;r:=saved.options->>'kshms_role';
 if target_role<>'firmaadmin' then
  -- Preserve the same responsible-person and closed-employment invariants as PeopleModuleAccess.
  if h and exists(select 1 from hr_private.closed_employments where company_id=saved.company_id and user_id=target)
  then raise exception 'Avsluttet arbeidsforhold kan ikke få HR-tilgang.' using errcode='42501';end if;
  if (not k or r<>'responsible') and exists(select 1 from public.kshms_settings where company_id=saved.company_id and responsible_user_id=target)
  then raise exception 'Velg ny KS/HMS-ansvarlig før denne tilgangen fjernes.' using errcode='42501';end if;
  insert into public.kshms_member_access(company_id,user_id,role,enabled,changed_by) values(saved.company_id,target,r,k,saved.inviter_id)
   on conflict(company_id,user_id) do update set role=excluded.role,enabled=excluded.enabled,changed_by=excluded.changed_by,changed_at=now();
  insert into hr_private.module_access(company_id,user_id,enabled,changed_by) values(saved.company_id,target,h,saved.inviter_id)
   on conflict(company_id,user_id) do update set enabled=excluded.enabled,changed_by=excluded.changed_by,changed_at=now();
 end if;
 if saved.new_account then
  select coalesce(array_agg(v),array[]::text[]) into keys from jsonb_array_elements_text(saved.options->'module_keys') v;
  delete from public.user_module_access where user_id=target;
  insert into public.user_module_access(user_id,module_key,granted_by) select target,v,saved.inviter_id from unnest(keys) v;
 end if;
 insert into public.kshms_audit(company_id,actor_id,action,object_id) values(saved.company_id,saved.inviter_id,'invitation_modules_applied',target);
 update company_admin_private.invitation_access set applied_at=now() where invite_id=invitation;
end $$;

create function public.company_admin_invite_with_access(p_company_id uuid,p_email text,p_role text,p_access jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;i public.company_user_invites%rowtype;new_user boolean;
begin
 perform company_admin_private.require_manager(p_company_id);
 perform company_admin_private.validate_invite_options(p_company_id,auth.uid(),p_access);
 select not exists(select 1 from public.profiles where lower(trim(email))=lower(trim(p_email))) into new_user;
 -- Clear previous choices in this same transaction before legacy invite code
 -- can turn a pending invitation into accepted for an existing account.
 perform 1 from public.company_user_invites ci join public.sales_company_scopes s
  on s.normalized_name=public.sales_normalize_company_name(ci.company_name)
  where s.id=p_company_id and lower(trim(ci.email))=lower(trim(p_email)) for update of ci;
 delete from company_admin_private.invitation_access a using public.company_user_invites ci,public.sales_company_scopes s
  where a.invite_id=ci.id and s.id=p_company_id and s.normalized_name=public.sales_normalize_company_name(ci.company_name)
    and lower(trim(ci.email))=lower(trim(p_email));
 result:=public.company_admin_invite(p_company_id,p_email,p_role);
 select * into strict i from public.company_user_invites where email=result->>'email' and company_name=result->>'invite_company_name' for update;
 insert into company_admin_private.invitation_access(invite_id,company_id,inviter_id,options,expected_invite,new_account)
 values(i.id,p_company_id,auth.uid(),p_access,jsonb_build_object('email',i.email,'company_name',i.company_name,'company_role',i.company_role,'invited_by',i.invited_by,'created_at',i.created_at),new_user)
 on conflict(invite_id) do update set company_id=excluded.company_id,inviter_id=excluded.inviter_id,options=excluded.options,
  expected_invite=excluded.expected_invite,new_account=excluded.new_account,applied_at=null,created_at=now();
 if i.accepted then perform company_admin_private.apply_invite_options(i.id,i.accepted_user_id);end if;
 return result||jsonb_build_object('access',p_access,'existing_account',not new_user);
end $$;

create function company_admin_private.on_invite_accepted()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.accepted and new.status='accepted' and new.accepted_user_id is not null then
  perform company_admin_private.apply_invite_options(new.id,new.accepted_user_id);
 end if;
 return new;
end $$;
-- An existing invitation is first rewritten by legacy code and its choices are
-- then replaced by the wrapper. Only the recipient's first acceptance applies
-- pending choices; resends/accepted-to-accepted updates never replay old grants.
create trigger company_invitation_apply_options after update on public.company_user_invites
 for each row when (new.accepted=true and coalesce(old.accepted,false)=false)
 execute function company_admin_private.on_invite_accepted();

revoke all on all functions in schema company_admin_private from public,anon,authenticated,service_role;
revoke all on function public.company_admin_invite_with_access(uuid,text,text,jsonb) from public,anon,service_role;
grant execute on function public.company_admin_invite_with_access(uuid,text,text,jsonb) to authenticated;

create or replace function public.company_admin_snapshot(p_company_id uuid default null)
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
  'invites',coalesce((select jsonb_agg(jsonb_build_object('id',i.id,'email',i.email,'company_role',i.company_role,'access',(select options from company_admin_private.invitation_access a where a.invite_id=i.id))
    order by i.created_at desc) from public.company_user_invites i
    where public.sales_normalize_company_name(i.company_name)=s.normalized_name and i.status in ('pending','active')),'[]'))
 into result from public.sales_company_scopes s where s.id=c;
 return result||jsonb_build_object(
  'can_switch_company',public.current_profile_is_systemadmin() or (select count(*)>1 from public.sales_company_memberships where user_id=auth.uid()),
  'invite_options',jsonb_build_object('store_offers',public.company_has_store_offers_access(c),
   'kshms',coalesce((select enabled from public.company_module_access where company_id=c and module_key='kshms'),false),
   'hr',coalesce((select enabled from public.company_module_access where company_id=c and module_key='hr'),false),
   'allowed_modules',case when public.current_profile_is_systemadmin() then '["projects","sales","store_offers"]'::jsonb else to_jsonb(public.current_user_module_keys()) end));
end $$;
