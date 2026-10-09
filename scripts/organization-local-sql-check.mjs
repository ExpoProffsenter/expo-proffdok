import fs from 'node:fs/promises';
const {PGlite}=await import(process.env.ORG_PGLITE_PATH||'/tmp/hr-h4-runtime/node_modules/@electric-sql/pglite/dist/index.js');
const db=await PGlite.create();
try{
 await db.exec(await fs.readFile('scripts/fixtures/hr-restore-platform.sql','utf8'));
 // Explicit synthetic platform adapter, not Supabase Auth/Storage evidence.
 await db.exec(`alter table auth.users add aud text,add role text,add email text,add created_at timestamptz,add updated_at timestamptz,add raw_app_meta_data jsonb,add raw_user_meta_data jsonb;
 alter table public.sales_company_scopes add normalized_name text,add display_name text;
 alter table public.profiles add company_name text,add company_role text,add is_admin boolean;
 alter table public.sales_company_memberships add is_primary boolean;
 create table public.user_active_company_scope(user_id uuid primary key,company_id uuid);
 create or replace function public.current_active_company_scope_id() returns uuid language sql as $$select company_id from public.user_active_company_scope where user_id=auth.uid()$$;
 grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;`);
 for(const name of ['20261009182551_hr_access_foundation.sql','20261009193953_hr_content_purge_foundation.sql','20261009203431_people_module_entitlements.sql','20261009203950_people_module_access_closure.sql'])await db.exec(await fs.readFile('supabase/migrations/'+name,'utf8'));
 await db.exec(`create function kshms_private.require_context(c uuid,management boolean default false,approval boolean default false) returns jsonb language plpgsql security definer set search_path='' as $$declare a boolean;begin
 a:=exists(select 1 from public.sales_company_memberships where company_id=c and user_id=auth.uid() and workspace_role='firmaadmin');
 if c is distinct from public.current_active_company_scope_id() or not hr_private.active_member(c,auth.uid()) or not exists(select 1 from public.company_module_access where company_id=c and module_key='kshms' and enabled) or (not a and not exists(select 1 from public.kshms_member_access where company_id=c and user_id=auth.uid() and enabled)) then raise exception 'KS denied' using errcode='42501';end if;
 return jsonb_build_object('company_id',c,'user_id',auth.uid(),'company_name',(select display_name from public.sales_company_scopes where id=c),'administer',a);end$$;`);
 await db.exec(await fs.readFile('supabase/migrations/20261009230526_hr_organization_chart.sql','utf8'));
 for(const name of (await fs.readdir('supabase/migrations')).filter(name=>name.endsWith('_organization_hr_trigger_scope_fix.sql')))await db.exec(await fs.readFile('supabase/migrations/'+name,'utf8'));
 const result=await db.exec(await fs.readFile('scripts/organization-sandbox-check.sql','utf8'));
 for(const part of result)if(part.rows?.length)console.log(part.rows);
 console.log('Organization actual PostgreSQL/PGlite DDL + rollback scenarios PASS (synthetic platform adapter).');
}finally{await db.close();}
