-- Explicit company entitlements and user access. Never grants individual HR readership.
alter table public.company_module_access drop constraint company_module_access_supported_key;
alter table public.company_module_access add constraint company_module_access_supported_key check(module_key in ('store_offers','kshms','hr'));
create table hr_private.module_access (
 company_id uuid not null references public.sales_company_scopes(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 enabled boolean not null default false,
 changed_by uuid references auth.users(id) on delete set null,
 changed_at timestamptz not null default now(), primary key(company_id,user_id)
);
create index hr_module_access_user_idx on hr_private.module_access(user_id);
create index hr_module_access_changed_by_idx on hr_private.module_access(changed_by);
alter table hr_private.module_access enable row level security;
revoke all on hr_private.module_access from public,anon,authenticated,service_role;
-- Preserve only existing configured firms and explicitly registered relationships.
-- This is continuity of the existing Preview authorization, never a payment record.
insert into public.company_module_access(company_id,module_key,enabled)
 select company_id,'hr',true from hr_private.firms on conflict do nothing;
insert into hr_private.module_access(company_id,user_id,enabled)
 select company_id,user_id,true from hr_private.employees
 union select company_id,leader_id,true from hr_private.employees where leader_id is not null
 union select company_id,user_id,true from hr_private.readers on conflict do nothing;

create function kshms_private.require_module_manager(c uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or c is null or not exists(select 1 from public.profiles p where p.id=auth.uid() and p.approved and not coalesce(p.deactivated,false))
 then raise exception 'Aktiv innlogging og firma kreves.' using errcode='42501'; end if;
 if public.current_profile_is_systemadmin() then
  if not exists(select 1 from public.sales_company_scopes where id=c) then raise exception 'Firma mangler.' using errcode='42501'; end if;
 elsif public.current_active_company_scope_id() is distinct from c or not exists(
  select 1 from public.sales_company_memberships m join public.profiles p on p.id=m.user_id
  where m.company_id=c and m.user_id=auth.uid() and m.workspace_role='firmaadmin' and p.role in ('admin','member','ansatt','firmaadmin'))
 then raise exception 'Bare firmaadmin i aktivt firma eller systemadministrator kan gi modultilgang.' using errcode='42501'; end if;
end $$;
create function public.people_modules_company_get(p_company_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 perform kshms_private.require_module_manager(p_company_id);
 return jsonb_build_object('company_id',p_company_id,'kshms',coalesce((select enabled from public.company_module_access where company_id=p_company_id and module_key='kshms'),false),
 'hr',coalesce((select enabled from public.company_module_access where company_id=p_company_id and module_key='hr'),false));
end $$;
create function public.people_modules_company_set(p_company_id uuid,p_expected jsonb,p_kshms boolean,p_hr boolean) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 perform kshms_private.require_module_manager(p_company_id);
 if not public.current_profile_is_systemadmin() then raise exception 'Bare systemadministrator kan aktivere kjøpte firmamoduler.' using errcode='42501'; end if;
 if p_kshms is null or p_hr is null then raise exception 'Velg begge moduler.' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended('people-modules:'||p_company_id::text,0));
 perform 1 from public.company_module_access where company_id=p_company_id and module_key in ('kshms','hr') order by module_key for update;
 if public.people_modules_company_get(p_company_id) is distinct from p_expected then raise exception 'Firmaets tilgang er endret. Hent på nytt.' using errcode='40001'; end if;
 insert into public.company_module_access(company_id,module_key,enabled,granted_by) values(p_company_id,'kshms',p_kshms,auth.uid()),(p_company_id,'hr',p_hr,auth.uid())
 on conflict(company_id,module_key) do update set enabled=excluded.enabled,granted_by=excluded.granted_by,updated_at=now();
 insert into public.kshms_audit(company_id,actor_id,action) values(p_company_id,auth.uid(),'company_modules_changed');
 return public.people_modules_company_get(p_company_id);
end $$;
create function public.people_modules_user_get(p_company_id uuid,p_user_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare r text; x jsonb;
begin
 perform kshms_private.require_module_manager(p_company_id);
 select m.workspace_role into r from public.sales_company_memberships m join public.profiles p on p.id=m.user_id
 where m.company_id=p_company_id and m.user_id=p_user_id and m.workspace_role in ('firmaadmin','ansatt') and p.role in ('admin','member','ansatt','firmaadmin');
 if r is null then raise exception 'Brukeren er ikke intern medarbeider i dette firmaet.' using errcode='42501'; end if;
 if not public.current_profile_is_systemadmin() and exists(select 1 from public.profiles where id=p_user_id and system_role='systemadmin')
 then raise exception 'Bare systemadministrator kan endre denne brukeren.' using errcode='42501'; end if;
 x:=public.people_modules_company_get(p_company_id);
 return jsonb_build_object('company_id',p_company_id,'user_id',p_user_id,'company',x,'firmaadmin',r='firmaadmin',
 'kshms',coalesce((select enabled from public.kshms_member_access where company_id=p_company_id and user_id=p_user_id),false),
 'kshms_role',coalesce((select role from public.kshms_member_access where company_id=p_company_id and user_id=p_user_id),'reader'),
 'hr',coalesce((select enabled from hr_private.module_access where company_id=p_company_id and user_id=p_user_id),false));
end $$;
create function public.people_modules_user_set(p_company_id uuid,p_user_id uuid,p_expected jsonb,p_kshms boolean,p_kshms_role text,p_hr boolean) returns jsonb
language plpgsql security definer set search_path='' as $$
declare x jsonb;
begin
 perform kshms_private.require_module_manager(p_company_id);
 if p_kshms is null or p_hr is null or p_kshms_role is null or p_kshms_role not in ('reader','responsible') then raise exception 'Ugyldige modulvalg.' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended('people-modules:'||p_company_id::text,0));
 perform 1 from public.company_module_access where company_id=p_company_id and module_key in ('kshms','hr') order by module_key for update;
 x:=public.people_modules_user_get(p_company_id,p_user_id);
 if x is distinct from p_expected then raise exception 'Brukerens tilgang er endret. Hent på nytt.' using errcode='40001'; end if;
 if (x->>'firmaadmin')::boolean then raise exception 'Firmaadmins modultilgang følger firmaaktivering og firmarolle.' using errcode='42501'; end if;
 if p_kshms and not (x#>>'{company,kshms}')::boolean or p_hr and not (x#>>'{company,hr}')::boolean
 then raise exception 'Modulen må først aktiveres på firmaet av systemadministrator.' using errcode='42501'; end if;
 if p_hr and exists(select 1 from hr_private.closed_employments where company_id=p_company_id and user_id=p_user_id)
 then raise exception 'Avsluttet arbeidsforhold kan ikke få HR-tilgang.' using errcode='42501'; end if;
 if (not p_kshms or p_kshms_role<>'responsible') and exists(select 1 from public.kshms_settings where company_id=p_company_id and responsible_user_id=p_user_id)
 then raise exception 'Velg ny KS/HMS-ansvarlig i oppstarten før denne tilgangen fjernes.' using errcode='42501'; end if;
 insert into public.kshms_member_access(company_id,user_id,role,enabled,changed_by) values(p_company_id,p_user_id,p_kshms_role,p_kshms,auth.uid())
 on conflict(company_id,user_id) do update set role=excluded.role,enabled=excluded.enabled,changed_by=excluded.changed_by,changed_at=now();
 insert into hr_private.module_access(company_id,user_id,enabled,changed_by) values(p_company_id,p_user_id,p_hr,auth.uid())
 on conflict(company_id,user_id) do update set enabled=excluded.enabled,changed_by=excluded.changed_by,changed_at=now();
 insert into public.kshms_audit(company_id,actor_id,action,object_id) values(p_company_id,auth.uid(),'member_modules_changed',p_user_id);
 return public.people_modules_user_get(p_company_id,p_user_id);
end $$;

create function hr_private.has_module_access(c uuid,u uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.company_module_access where company_id=c and module_key='hr' and enabled)
 and hr_private.active_member(c,u) and (exists(select 1 from public.sales_company_memberships where company_id=c and user_id=u and workspace_role='firmaadmin')
 or exists(select 1 from hr_private.module_access where company_id=c and user_id=u and enabled))
$$;
create or replace function hr_private.require_actor(c uuid,admin_only boolean default false) returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); a boolean;
begin
 if u is null or c is null or public.current_active_company_scope_id() is distinct from c or not hr_private.has_module_access(c,u)
 then raise exception 'HR-tilgang avslått eller arbeidsprofil endret.' using errcode='42501'; end if;
 select workspace_role='firmaadmin' into a from public.sales_company_memberships where company_id=c and user_id=u;
 if admin_only and not coalesce(a,false) then raise exception 'Bare firmaadmin kan endre HR-registeret.' using errcode='42501'; end if;
 return jsonb_build_object('company_id',c,'user_id',u,'administer',coalesce(a,false));
end $$;
revoke all on function kshms_private.require_module_manager(uuid),hr_private.has_module_access(uuid,uuid) from public,anon,authenticated,service_role;
revoke all on function public.people_modules_company_get(uuid),public.people_modules_company_set(uuid,jsonb,boolean,boolean),public.people_modules_user_get(uuid,uuid),public.people_modules_user_set(uuid,uuid,jsonb,boolean,text,boolean) from public,anon,authenticated,service_role;
grant execute on function public.people_modules_company_get(uuid),public.people_modules_company_set(uuid,jsonb,boolean,boolean),public.people_modules_user_get(uuid,uuid),public.people_modules_user_set(uuid,uuid,jsonb,boolean,text,boolean) to authenticated;
