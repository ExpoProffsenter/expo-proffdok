-- HR selection creates a register entry only after validated invitation acceptance.
-- No HR content, manager, company membership or module grant is invented here.
create function company_admin_private.enroll_invited_hr_users(c uuid,target uuid default null)
returns integer language plpgsql security definer set search_path='' as $$
declare ready boolean;n integer:=0;
begin
 perform pg_advisory_xact_lock(hashtextextended('hr-foundation:'||c::text,0));
 select enabled into ready from hr_private.firms where company_id=c for update;
 if not coalesce(ready,false) then return 0;end if;
 insert into hr_private.employees(company_id,user_id,leader_id)
 select distinct c,i.accepted_user_id,placement.leader_id
 from company_admin_private.invitation_access a join public.company_user_invites i on i.id=a.invite_id
 join public.sales_company_scopes s on s.id=a.company_id and s.normalized_name=public.sales_normalize_company_name(i.company_name)
 left join org_private.placements placement on placement.company_id=c and placement.user_id=i.accepted_user_id
 where a.company_id=c and a.applied_at is not null and a.options->'hr'='true'::jsonb
  and i.accepted and i.status='accepted' and i.accepted_user_id is not null
  and (target is null or i.accepted_user_id=target)
  and a.expected_invite=jsonb_build_object('email',i.email,'company_name',i.company_name,'company_role',i.company_role,'invited_by',i.invited_by,'created_at',i.created_at)
  and hr_private.has_module_access(c,i.accepted_user_id)
  and (placement.leader_id is null or (placement.leader_id<>i.accepted_user_id and hr_private.has_module_access(c,placement.leader_id)))
  and not exists(select 1 from hr_private.closed_employments d where d.company_id=c and d.user_id=i.accepted_user_id)
  and not exists(select 1 from hr_private.employees e where e.company_id=c and e.user_id=i.accepted_user_id)
 on conflict(company_id,user_id) do nothing;
 get diagnostics n=row_count;
 return n;
end $$;

create or replace function company_admin_private.apply_invite_options(invitation uuid,target uuid)
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
 if h then
  -- Same lock order as HR setup: configuration before member grants/HR rows.
  perform pg_advisory_xact_lock(hashtextextended('hr-foundation:'||saved.company_id::text,0));
  perform 1 from hr_private.firms where company_id=saved.company_id for update;
 end if;
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
 if h then perform company_admin_private.enroll_invited_hr_users(saved.company_id,target);end if;
end $$;


-- Enroll accepted HR invitations deferred while the firm's register was not set up.
create function company_admin_private.on_hr_register_ready()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 perform company_admin_private.enroll_invited_hr_users(new.company_id);
 return new;
end $$;
create trigger company_invitation_hr_register_ready after insert or update of enabled on hr_private.firms
 for each row when (new.enabled=true) execute function company_admin_private.on_hr_register_ready();
revoke all on function company_admin_private.enroll_invited_hr_users(uuid,uuid),company_admin_private.on_hr_register_ready()
 from public,anon,authenticated,service_role;

-- Repair only explicit, previously accepted HR invitation choices. Never bulk-enroll memberships.
do $$declare c uuid;begin
 for c in select distinct company_id from company_admin_private.invitation_access
  where applied_at is not null and options->'hr'='true'::jsonb
 loop perform company_admin_private.enroll_invited_hr_users(c);end loop;
end $$;
