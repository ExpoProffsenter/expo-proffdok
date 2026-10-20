import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const {PGlite}=await import(process.env.HR_PGLITE_PATH||'@electric-sql/pglite');
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
 for(const name of ['20261005195941_kshms_handbook_foundation.sql','20261005212145_kshms_firmaadmin_appointment.sql','20261005225124_kshms_responsible_publication.sql','20261006141916_kshms_personal_handbook_identity.sql','20261012094218_kshms_bulk_own_acknowledgment.sql','20261012110939_kshms_bulk_company_publication.sql','20261020130549_kshms_auto_assign_handbook_on_access.sql'])await db.exec(await fs.readFile('supabase/migrations/'+name,'utf8'));
 const references=(await fs.readFile('supabase/migrations/20261007224149_kshms_job_choices_routine_references_ruh.sql','utf8')).split('-- Only the current actor')[0];
 await db.exec(references);
 await db.exec(await fs.readFile('supabase/migrations/20261020134830_kshms_primary_company_acknowledgment.sql','utf8'));
 const prelude=(await fs.readFile('scripts/kshms-bulk-sandbox-check.sql','utf8')).split('set local role authenticated;')[0];
 const scenario=prelude+await fs.readFile('scripts/kshms-primary-ack-sandbox-check.sql','utf8');
 if(process.env.KSHMS_PRIMARY_ACK_SQL_OUTPUT)await fs.writeFile(process.env.KSHMS_PRIMARY_ACK_SQL_OUTPUT,scenario);
 for(const result of await db.exec(scenario))if(result.rows?.length)console.log(result.rows);
 assert.equal((await db.query('select count(*)::int n from public.kshms_assignments')).rows[0].n,0,'Synthetic scenario must roll back');
 for(const role of ['anon','authenticated','service_role'])assert.equal((await db.query(`select has_function_privilege('${role}','kshms_private.reuse_primary_ack(uuid,uuid)','execute') allowed`)).rows[0].allowed,false);
 console.log('Primary handbook consent PostgreSQL QA PASS; real access/save/publish/ack/read RPCs and trigger migration, no API helper grants, complete rollback.');
}catch(e){console.error('Primary consent DB QA:',e.code,e.message,e.where||'');process.exitCode=1;}finally{await db.close();}
