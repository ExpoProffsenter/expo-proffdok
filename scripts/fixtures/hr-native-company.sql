-- Test-only company/work-profile substrate. NOT production profile/onboarding QA.
-- Auth, Storage, Vault, Cron, pg_net and their roles/functions remain native.
create extension if not exists pgcrypto with schema extensions;
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;
create schema kshms_private;
create table public.sales_company_scopes(id uuid primary key);
create table public.profiles(id uuid primary key references auth.users(id) on delete cascade,email text,approved boolean,deactivated boolean,role text,system_role text);
create table public.sales_company_memberships(company_id uuid references public.sales_company_scopes(id),user_id uuid references auth.users(id) on delete cascade,workspace_role text,primary key(company_id,user_id));
-- Only one active fixture membership per actor; never read user-editable JWT metadata.
create function public.current_active_company_scope_id() returns uuid
language sql stable security definer set search_path='' as $$
 select company_id from public.sales_company_memberships where user_id=auth.uid()
$$;
create function public.current_profile_is_systemadmin() returns boolean
language sql stable security definer set search_path='' as $$
 select coalesce((select approved and not coalesce(deactivated,false) and system_role='systemadmin' from public.profiles where id=auth.uid()),false)
$$;
create table public.company_module_access(company_id uuid,module_key text,enabled boolean,granted_by uuid,updated_at timestamptz default now(),primary key(company_id,module_key),constraint company_module_access_supported_key check(module_key in ('store_offers','kshms')));
create table public.kshms_member_access(company_id uuid,user_id uuid,role text,enabled boolean,changed_by uuid,changed_at timestamptz default now(),primary key(company_id,user_id));
create table public.kshms_settings(company_id uuid,responsible_user_id uuid);
create table public.kshms_audit(company_id uuid,actor_id uuid,action text,object_id uuid);
alter table public.sales_company_scopes enable row level security;
alter table public.profiles enable row level security;
alter table public.sales_company_memberships enable row level security;
alter table public.company_module_access enable row level security;
alter table public.kshms_member_access enable row level security;
alter table public.kshms_settings enable row level security;
alter table public.kshms_audit enable row level security;
revoke all on all tables in schema public from public,anon,authenticated,service_role;
revoke all on function public.current_active_company_scope_id(),public.current_profile_is_systemadmin() from public,anon,authenticated,service_role;
