-- DRAFT RECOVERY ONLY. NOT RUN DURING PREPARATION.

-- Caller must wrap this file in BEGIN / COMMIT and set local expo.bolig_release_target.

-- Never restore an entire Production database without a separate outage/recovery decision.

do $guard$ begin if current_setting('expo.bolig_release_target',true) is distinct from 'dqffxflaoyarbxyiyhop' then raise exception 'Explicit Production rollback target is required.' using errcode='PT409';end if;end$guard$;

do $fingerprints$ begin
if not exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='hr_private' and p.proname='can_read' and p.proacl::text='{postgres=X/postgres}' and md5(pg_get_functiondef(p.oid)) in ('88bb002e58844ebf500f931c05558406','f715f79c74e5c36f82d289190598726f')) then raise exception 'Unreviewed shared function: hr_private.can_read. Stop before rollback.' using errcode='PT409';end if;
if not exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='hr_private' and p.proname='has_module_access' and p.proacl::text='{postgres=X/postgres}' and md5(pg_get_functiondef(p.oid)) in ('e0426cb72dbeeaf13f956ffd255254e2','fd8d48b6e62e8c875f51140004e97c64')) then raise exception 'Unreviewed shared function: hr_private.has_module_access. Stop before rollback.' using errcode='PT409';end if;
if not exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='get_my_personal_context' and p.proacl::text='{postgres=X/postgres,authenticated=X/postgres}' and md5(pg_get_functiondef(p.oid)) in ('ad9ef8bd260e07bb75717e34cfa34a4d','bc973ce9cc54a4a02132b3275696f41a','128081b8dc3890b6b5046c25fe749831')) then raise exception 'Unreviewed shared function: public.get_my_personal_context. Stop before rollback.' using errcode='PT409';end if;
if not exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='people_modules_company_get' and p.proacl::text='{postgres=X/postgres,authenticated=X/postgres}' and md5(pg_get_functiondef(p.oid)) in ('33229f37ceea0e44f01b0789f27f7435','308a353d35e5c963d0b3b4a375ff6037')) then raise exception 'Unreviewed shared function: public.people_modules_company_get. Stop before rollback.' using errcode='PT409';end if;
if not exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='people_modules_user_get' and p.proacl::text='{postgres=X/postgres,authenticated=X/postgres}' and md5(pg_get_functiondef(p.oid)) in ('d2a2840ad0e16ee5fc0c86cc90d8a941','eccf7c3c178a714b8d4a4c3750d712bd')) then raise exception 'Unreviewed shared function: public.people_modules_user_get. Stop before rollback.' using errcode='PT409';end if;
end$fingerprints$;

-- First stop only Bolig access/transport; retain all data and files.

do $pause$ begin if to_regclass('bolig_private.firms') is not null then update bolig_private.firms set enabled=false;end if;end$pause$;

do $pause$ begin if to_regclass('bolig_private.progress_mail_settings') is not null then update bolig_private.progress_mail_settings set enabled=false;end if;end$pause$;

do $pause$ begin if to_regclass('bolig_private.partner_mail_settings') is not null then update bolig_private.partner_mail_settings set enabled=false;end if;end$pause$;

do $pause$ begin if to_regclass('bolig_private.resident_link_mail_settings') is not null then update bolig_private.resident_link_mail_settings set enabled=false;end if;end$pause$;

CREATE OR REPLACE FUNCTION hr_private.can_read(c uuid, e hr_private.employees, u uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select e.company_id=c and hr_private.active_member(c,e.user_id) and hr_private.active_member(c,u)
 and (e.user_id=u or coalesce(e.leader_id=u,false) or exists(select 1 from public.sales_company_memberships m
 where m.company_id=c and m.user_id=u and m.workspace_role='firmaadmin')
 or exists(select 1 from hr_private.readers r where r.company_id=c and r.employee_id=e.id and r.user_id=u))
$function$
;

CREATE OR REPLACE FUNCTION hr_private.has_module_access(c uuid, u uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select exists(select 1 from public.company_module_access where company_id=c and module_key='hr' and enabled)
 and hr_private.active_member(c,u) and (exists(select 1 from public.sales_company_memberships where company_id=c and user_id=u and workspace_role='firmaadmin')
 or exists(select 1 from hr_private.module_access where company_id=c and user_id=u and enabled))
$function$
;

CREATE OR REPLACE FUNCTION public.get_my_personal_context()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare c uuid:=public.current_active_company_scope_id();u uuid:=auth.uid();admin boolean;ks boolean;hr boolean;usable_hr boolean;
begin
 if u is null or c is null or not exists(select 1 from public.sales_company_memberships m join public.profiles p on p.id=m.user_id
  where m.company_id=c and m.user_id=u and m.workspace_role in ('firmaadmin','ansatt')
  and p.approved and not coalesce(p.deactivated,false) and p.role in ('admin','member','ansatt','firmaadmin'))
 then raise exception 'Aktiv intern bruker og arbeidsprofil kreves.' using errcode='42501';end if;
 select workspace_role='firmaadmin' into admin from public.sales_company_memberships where company_id=c and user_id=u;
 ks:=exists(select 1 from public.company_module_access where company_id=c and module_key='kshms' and enabled);
 hr:=exists(select 1 from public.company_module_access where company_id=c and module_key='hr' and enabled);
 usable_hr:=hr_private.has_module_access(c,u) and (admin or exists(select 1 from hr_private.firms where company_id=c and enabled));
 return jsonb_build_object('company_id',c,'user_id',u,'company_name',(select display_name from public.sales_company_scopes where id=c),
  'personal_page',ks or hr or exists(select 1 from progress_private.assignments x join public.projects pr on pr.id=x.project_id where x.user_id=u and pr.company_scope_id=c and not coalesce(pr.locked,false)),'company_kshms',ks,'company_hr',hr,
  'hr_management',usable_hr and (admin or exists(select 1 from hr_private.employees e
   where e.company_id=c and e.leader_id=u and hr_private.active_member(c,e.user_id))), 'content_enabled',false);
end$function$
;

CREATE OR REPLACE FUNCTION public.people_modules_company_get(p_company_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
 perform kshms_private.require_module_manager(p_company_id);
 return jsonb_build_object('company_id',p_company_id,'kshms',coalesce((select enabled from public.company_module_access where company_id=p_company_id and module_key='kshms'),false),
 'hr',coalesce((select enabled from public.company_module_access where company_id=p_company_id and module_key='hr'),false));
end $function$
;

CREATE OR REPLACE FUNCTION public.people_modules_user_get(p_company_id uuid, p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
end $function$
;

-- CREATE OR REPLACE retains existing function ownership/ACL. Verify against snapshot.

-- Do not DROP Bolig tables/buckets, remove files, rewrite migration history or disable other workers.
