import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const {PGlite}=await import(process.env.HR_PGLITE_PATH||'/tmp/hr-sick-qa-runtime/node_modules/@electric-sql/pglite/dist/index.js');
const db=await PGlite.create();
try {
 let platform=await fs.readFile('scripts/fixtures/hr-restore-platform.sql','utf8');
 platform=platform.replace(/^create table public\.kshms_.*$/gm,'');
 platform=platform.replace("module_key in ('store_offers','kshms')","module_key in ('store_offers')");
 await db.exec(platform);
 await db.exec(`alter table auth.users add aud text,add role text,add email text,add created_at timestamptz,add updated_at timestamptz,add raw_app_meta_data jsonb,add raw_user_meta_data jsonb;
 alter table public.sales_company_scopes add normalized_name text,add display_name text;
 alter table public.profiles add company_name text,add company_role text,add is_admin boolean;
 alter table public.sales_company_memberships add is_primary boolean,add updated_at timestamptz default now();
 alter table public.company_module_access add granted_by uuid,add updated_at timestamptz default now();
 alter table storage.buckets add allowed_mime_types text[];
 alter table storage.objects add metadata jsonb;
 create table public.user_active_company_scope(user_id uuid primary key,company_id uuid);
 create or replace function public.current_active_company_scope_id() returns uuid language sql security definer set search_path='' as $$select company_id from public.user_active_company_scope where user_id=auth.uid()$$;
 create table public.projects(id uuid primary key,user_id uuid,company_scope_id uuid,title text,data jsonb,locked boolean default false,updated_at timestamptz default now());
 create function public.project_row_access_allowed(c uuid,u uuid) returns boolean language sql as $$select c=public.current_active_company_scope_id()$$;
 create table public.user_module_access(user_id uuid,module_key text,enabled boolean,updated_at timestamptz default now());
 create function public.is_internal_work_profile_company(c uuid) returns boolean language sql as $$select false$$;
 create or replace function public.current_profile_is_systemadmin() returns boolean language sql as $$select exists(select 1 from public.profiles where id=auth.uid() and system_role='systemadmin' and approved and not coalesce(deactivated,false))$$;
 create table net.http_request_queue(id bigint);
 create table net._http_response(id bigint);
 grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;`);
 const files=(await fs.readdir('supabase/migrations')).filter(n=>n>='20261005195941'&&n.endsWith('.sql')).sort();
 assert.equal(files.length,54,'Release manifest changed; review new migration scope');
 for(const name of files) {
  let sql=await fs.readFile('supabase/migrations/'+name,'utf8');
  // Local adapter only: cron/net are stubs above, not live Supabase extensions.
  sql=sql.replace(/^create extension if not exists pg_(cron|net).*;$/gm,'');
  try {await db.exec(sql);} catch(error) {throw new Error('Failed migration: '+name+' ('+error.code+'): '+error.message);}
 }
 const gates=await db.query('select content_enabled,restore_quarantined from hr_private.runtime_state');
 assert(gates.rows.every(r=>!r.content_enabled&&r.restore_quarantined));
 for(const script of ['hr-templates-sandbox-check.sql','organization-groups-sandbox-check.sql']) {
  for(const result of await db.exec(await fs.readFile('scripts/'+script,'utf8')))if(result.rows?.length)console.log(result.rows);
 }
 console.log('Release PASS: all 54 canonical migrations in order, closed HR content gate, template and organization PostgreSQL scenarios. Synthetic platform adapter; not cloud Storage/Auth verification.');
} finally {await db.close();}
