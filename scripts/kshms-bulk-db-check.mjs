import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const {PGlite}=await import(process.env.HR_PGLITE_PATH||'/tmp/hr-sick-qa-runtime/node_modules/@electric-sql/pglite/dist/index.js');
const db=await PGlite.create();
try {
 let platform=await fs.readFile('scripts/fixtures/hr-restore-platform.sql','utf8');
 platform=platform.replace(/^create table public\.kshms_.*$/gm,'').replace("module_key in ('store_offers','kshms')","module_key in ('store_offers')");
 await db.exec(platform);
 await db.exec(`alter table auth.users add aud text,add role text,add email text,add created_at timestamptz,add updated_at timestamptz,add raw_app_meta_data jsonb,add raw_user_meta_data jsonb;
 alter table public.sales_company_scopes add normalized_name text,add display_name text;
 alter table public.profiles add company_name text,add company_role text;
 alter table public.sales_company_memberships add is_primary boolean;
 create table public.user_active_company_scope(user_id uuid primary key,company_id uuid);
 create or replace function public.current_active_company_scope_id() returns uuid language sql security definer set search_path='' as $$select company_id from public.user_active_company_scope where user_id=auth.uid()$$;
 grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;`);
 for(const name of ['20261005195941_kshms_handbook_foundation.sql','20261005212145_kshms_firmaadmin_appointment.sql','20261005225124_kshms_responsible_publication.sql','20261006141916_kshms_personal_handbook_identity.sql','20261012094218_kshms_bulk_own_acknowledgment.sql'])await db.exec(await fs.readFile('supabase/migrations/'+name,'utf8'));
 for(const result of await db.exec(await fs.readFile('scripts/kshms-bulk-sandbox-check.sql','utf8')))if(result.rows?.length)console.log(result.rows);
 assert.equal((await db.query('select count(*)::int n from public.kshms_acknowledgments')).rows[0].n,0,'All synthetic content must roll back');
 console.log('PostgreSQL bulk QA PASS: real authenticated role, 87 editions/three roles, own-only identity/server clock, immutable single/batch retries, exact set/invalid input/revocation/closed table and rollback. Local platform adapter; cloud test remains required.');
}catch(error){console.error('Bulk DB QA failed:',error.code,error.message,error.where||'');process.exitCode=1;}finally{await db.close();}
