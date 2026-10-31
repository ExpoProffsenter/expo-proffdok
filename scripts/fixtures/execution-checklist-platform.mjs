import fs from 'node:fs/promises';
export const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
export async function executionChecklistPlatform({signatures=true}={}){
 const {PGlite}=await import(process.env.HR_PGLITE_PATH||'../qa/node_modules/@electric-sql/pglite/dist/index.js');
 const db=await PGlite.create();
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
 create function public.project_row_access_allowed(c uuid,u uuid) returns boolean language plpgsql as $$begin return public.current_profile_is_systemadmin() or c=public.current_active_company_scope_id() and (exists(select 1 from public.user_module_access where user_id=auth.uid() and module_key='projects') or exists(select 1 from public.profiles where id=auth.uid() and role='admin'));end$$;
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
 await db.exec(await fs.readFile('supabase/migrations/20261020140517_project_checklist_support_read.sql','utf8'));
 const firm=id(1),other=id(2),owner=id(3),colleague=id(4),foreign=id(5),project=id(6);
 await db.exec(`
 insert into auth.users(id) values('${owner}'),('${colleague}'),('${foreign}');
 insert into public.sales_company_scopes(id,display_name) values('${firm}','QA Bedrift'),('${other}','Annen bedrift');
 insert into public.profiles(id,email,approved,deactivated,role) values('${owner}','owner@example.invalid',true,false,'firmaadmin'),('${colleague}','worker@example.invalid',true,false,'ansatt'),('${foreign}','foreign@example.invalid',true,false,'ansatt');
 insert into public.sales_company_memberships(company_id,user_id,workspace_role) values('${firm}','${owner}','firmaadmin'),('${firm}','${colleague}','ansatt'),('${other}','${foreign}','ansatt');
 insert into public.user_active_company_scope values('${owner}','${firm}'),('${colleague}','${firm}'),('${foreign}','${other}');
 insert into public.company_module_access(company_id,module_key,enabled) values('${firm}','kshms',true);
 insert into public.user_module_access values('${owner}','projects',true,now()),('${colleague}','projects',true,now());
 insert into public.kshms_settings(company_id,responsible_user_id,updated_by) values('${firm}','${owner}','${owner}');
 insert into public.projects(id,user_id,company_scope_id,title,data) values('${project}','${owner}','${firm}','QA utførelse','{"project":{"projectName":"QA utførelse","address":"Testveien 42"}}');
 create function public.work_profile_company_profile(c uuid) returns jsonb language sql security definer set search_path='' as $$select jsonb_build_object('companyId',id,'companyName',display_name,'email','qa@example.invalid') from public.sales_company_scopes where id=c$$;
 `);
 for(const name of ['20261030212323_standalone_checklists.sql','20261030215202_standalone_checklist_owner_index.sql','20261030223853_standalone_checklist_external_project_details.sql'])await db.exec(await fs.readFile('supabase/migrations/'+name,'utf8'));
 const migrate=async()=>{await db.exec('reset role');for(const name of ['20261030233753_execution_checklist_signatures_core.sql','20261030233847_standalone_checklist_signatures.sql','20261030233912_project_execution_checklist_signatures.sql'])await db.exec(await fs.readFile('supabase/migrations/'+name,'utf8'));};
 if(signatures)await migrate();
 const actor=async(user=owner,company=firm,role='authenticated')=>{await db.exec('reset role');await db.query('insert into public.user_active_company_scope values($1,$2) on conflict(user_id) do update set company_id=excluded.company_id',[user,company]);await db.query("select set_config('request.jwt.claim.sub',$1,false)",[user]);await db.exec('set role '+role);};
 const rpc=async(name,args=[])=>{const values=args.map((v,i)=>'$'+(i+1)+(typeof v==='object'&&v!==null?'::jsonb':''));return (await db.query('select public.'+name+'('+values.join(',')+') v',args)).rows[0].v;};
 return {db,actor,rpc,migrate,firm,other,owner,colleague,foreign,project};
}
