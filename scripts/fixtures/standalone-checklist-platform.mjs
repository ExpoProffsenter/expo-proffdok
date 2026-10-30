import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
export const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
export async function standaloneTestPlatform(){
 const {PGlite}=await import(process.env.HR_PGLITE_PATH||'../qa/node_modules/@electric-sql/pglite/dist/index.js');
 const db=await PGlite.create();
 const firm=id(1),other=id(2),owner=id(3),colleague=id(4),foreign=id(5);
 const q=v=>"'"+String(v).replaceAll("'","''")+"'";
 const actor=async(u=owner,c=firm,role='authenticated')=>db.exec(`reset role;select set_config('qa.actor',${q(u)},false);select set_config('qa.company',${q(c)},false);set role ${role}`);
 const rpc=async(name,args)=>{const sql=args.map(a=>a===null?'null':typeof a==='object'?q(JSON.stringify(a))+'::jsonb':typeof a==='number'?String(a):q(a)).join(',');return(await db.query(`select public.${name}(${sql}) v`)).rows[0].v;};
const loadFunction=async(file,name)=>{const sql=await fs.readFile(file,'utf8');const at=sql.indexOf('create or replace function '+name)>=0?sql.indexOf('create or replace function '+name):sql.indexOf('create function '+name);assert(at>=0,name);const end=sql.indexOf('$$;',sql.indexOf('as $$',at));assert(end>at,name);await db.exec(sql.slice(at,end+3));};
 await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;create schema kshms_private;
 create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql as $$select nullif(current_setting('qa.actor',true),'')::uuid$$;
 create function public.current_active_company_scope_id() returns uuid language sql as $$select nullif(current_setting('qa.company',true),'')::uuid$$;
 create table public.sales_company_scopes(id uuid primary key,display_name text);create table public.profiles(id uuid primary key,approved boolean default true,deactivated boolean default false,role text default 'ansatt',email text);
 create table public.sales_company_memberships(company_id uuid,user_id uuid,workspace_role text);
 create table public.kshms_checklist_templates(id uuid primary key,company_id uuid,archived boolean default false);
 create table public.kshms_checklist_versions(id uuid primary key,company_id uuid,template_id uuid,number int,content jsonb,content_hash text);
 create function kshms_private.identity_snapshot(u uuid) returns jsonb language sql as $$select jsonb_build_object('id',p.id,'name',p.email,'email',p.email) from public.profiles p where p.id=u$$;
 create function public.work_profile_company_profile(c uuid) returns jsonb language sql security definer set search_path='' as $$select jsonb_build_object('companyId',id,'companyName',display_name,'email','qa@example.invalid') from public.sales_company_scopes where id=c$$;
 grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;
 insert into auth.users values(${q(owner)}),(${q(colleague)}),(${q(foreign)});
 insert into public.profiles(id,email)values(${q(owner)},'owner@example.invalid'),(${q(colleague)},'worker@example.invalid'),(${q(foreign)},'foreign@example.invalid');
 insert into public.sales_company_scopes values(${q(firm)},'QA Bedrift'),(${q(other)},'Annen bedrift');
 insert into public.sales_company_memberships values(${q(firm)},${q(owner)},'firmaadmin'),(${q(firm)},${q(colleague)},'ansatt'),(${q(other)},${q(foreign)},'ansatt');`);
 const flexible='supabase/migrations/20261017133759_flexible_checklist_fields_hot_work.sql';
 for(const name of ['checklist_fields','checklist_visible_fields','checklist_values','checklist_prefix_add','checklist_sign_values','checklist_content'])await loadFunction(flexible,'kshms_private.'+name);
 await loadFunction('supabase/migrations/20261008131207_kshms_executions.sql','kshms_private.execution_text');
 await loadFunction('supabase/migrations/20261007180955_project_checklist_runs.sql','kshms_private.protect_completed_checklist');
 await db.exec(await fs.readFile('supabase/migrations/20261030212323_standalone_checklists.sql','utf8'));
 await db.exec(await fs.readFile('supabase/migrations/20261030215202_standalone_checklist_owner_index.sql','utf8'));

 return {db,actor,rpc,firm,other,owner,colleague,foreign};
}
