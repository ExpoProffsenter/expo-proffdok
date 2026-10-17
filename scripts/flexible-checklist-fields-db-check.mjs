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
 create function public.project_row_access_allowed(c uuid,u uuid) returns boolean language plpgsql as $$begin return c=public.current_active_company_scope_id() and (exists(select 1 from public.user_module_access where user_id=auth.uid() and module_key='projects') or exists(select 1 from public.profiles where id=auth.uid() and role='admin'));end$$;
 create table public.user_module_access(user_id uuid,module_key text,enabled boolean,updated_at timestamptz default now());
 create function public.is_internal_work_profile_company(c uuid) returns boolean language sql as $$select false$$;
 create or replace function public.current_profile_is_systemadmin() returns boolean language sql as $$select exists(select 1 from public.profiles where id=auth.uid() and system_role='systemadmin' and approved and not coalesce(deactivated,false))$$;
 create table net.http_request_queue(id bigint);
 create table net._http_response(id bigint);
 grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;`);
 const files=(await fs.readdir('supabase/migrations')).filter(n=>n>='20261005195941'&&n<='20261009041152_z'&&n.endsWith('.sql')).sort();

 for(const name of files) {
  let sql=await fs.readFile('supabase/migrations/'+name,'utf8');
  // Local adapter only: cron/net are stubs above, not live Supabase extensions.
  sql=sql.replace(/^create extension if not exists pg_(cron|net).*;$/gm,'');
  try {await db.exec(sql);} catch(error) {throw new Error('Failed migration: '+name+' ('+error.code+'): '+error.message);}
 }
 await db.exec(await fs.readFile('supabase/migrations/20261017133759_flexible_checklist_fields_hot_work.sql','utf8'));
 await db.exec("insert into auth.users(id) values('00000000-0000-4000-8000-000000000001');insert into public.profiles(id,email,approved,deactivated,role,system_role) values('00000000-0000-4000-8000-000000000001','sys@example.invalid',true,false,'admin','systemadmin');create function public.sales_normalize_company_name(v text) returns text language sql as $$select lower(v)$$;create function extensions.digest(v bytea,algo text) returns bytea language sql as $$select sha256(v)$$;grant usage on schema public to authenticated;grant select,update on public.projects to authenticated;");
 for(const script of ['kshms-checklist-central-sandbox-check.sql','project-checklist-runs-sandbox-check.sql','kshms-checklist-subforms-sandbox-check.sql','kshms-executions-sandbox-check.sql','flexible-checklist-fields-sandbox-check.sql']){
  try{for(const result of await db.exec(await fs.readFile('scripts/'+script,'utf8')))if(result.rows?.length)console.log(script,result.rows);}catch(e){console.error(script,e.code,e.message,e.where);throw new Error(e.message);}
 }
 console.log('Flexible fields PostgreSQL PASS: actual migrations, existing checklist/subform/execution scenarios + new typed controls. Synthetic platform adapter; not cloud Auth/Storage proof.');
} finally {await db.close();}
