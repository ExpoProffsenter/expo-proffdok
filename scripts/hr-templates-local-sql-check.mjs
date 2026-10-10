import fs from 'node:fs/promises';
const {PGlite}=await import(process.env.HR_PGLITE_PATH||'/tmp/hr-h4-runtime/node_modules/@electric-sql/pglite/dist/index.js');
const db=await PGlite.create();
try{
 await db.exec(await fs.readFile('scripts/fixtures/hr-restore-platform.sql','utf8'));
 await db.exec(`alter table auth.users add aud text,add role text,add email text,add created_at timestamptz,add updated_at timestamptz,add raw_app_meta_data jsonb,add raw_user_meta_data jsonb;
 alter table public.sales_company_scopes add normalized_name text,add display_name text;
 alter table public.profiles add company_name text,add company_role text,add is_admin boolean;
 alter table public.sales_company_memberships add is_primary boolean;
 create table public.user_active_company_scope(user_id uuid primary key,company_id uuid);
 create or replace function public.current_active_company_scope_id() returns uuid language sql as $$select company_id from public.user_active_company_scope where user_id=auth.uid()$$;
 grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;`);
 for(const name of ['20261009182551_hr_access_foundation.sql','20261009193953_hr_content_purge_foundation.sql','20261009203431_people_module_entitlements.sql','20261009203950_people_module_access_closure.sql','20261010004928_hr_conversation_templates.sql','20261010105649_hr_sick_leave_template_kind.sql'])await db.exec(await fs.readFile('supabase/migrations/'+name,'utf8'));
 for(const r of await db.exec(await fs.readFile('scripts/hr-templates-sandbox-check.sql','utf8')))if(r.rows?.length)console.log(r.rows);
 console.log('HR template actual PostgreSQL/PGlite DDL/rollback PASS (synthetic platform adapter; no cloud restore).');
}finally{await db.close();}
