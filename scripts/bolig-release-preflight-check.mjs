// Offline evidence/manifest guard. It does not connect to or change any service.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root='docs/qa/evidence/';
const load=async name=>JSON.parse(await fs.readFile(root+name,'utf8'));
const manifest=await load('bolig-release-manifest-20261025.json');
const baseline=await load('bolig-release-baseline-20261025.json');
const indices=await load('bolig-release-index-history-20261025.json');
const catalog=await load('bolig-release-catalog-20261025.json');
const prerequisites=await load('bolig-release-production-prerequisites-20261025.json');
const digest=(s,algorithm='sha256')=>createHash(algorithm).update(s).digest('hex');
const compact=s=>s.replace(/\s/g,'');
let checks=0;const eq=(a,b,m)=>{assert.deepEqual(a,b,m);checks++;};
eq(manifest.production_project,'dqffxflaoyarbxyiyhop');eq(manifest.sandbox_project,'ppvircenkjizeiqdxphj');
eq(manifest.migrations.length,72);eq(manifest.production_bolig_migrations_applied,0);
const changed=execFileSync('git',['diff',process.argv[2]||'origin/main','--name-only','--','supabase/migrations'],{encoding:'utf8'}).trim().split('\n').sort();
eq(manifest.migrations.map(m=>m.path),changed,'Only the 72 reviewed migration files form this release');
const seen=new Set();
for(const m of manifest.migrations){
 const source=await fs.readFile(m.path,'utf8');eq(digest(source),m.sha256,'Migration file is frozen: '+m.path);
 const matches=baseline.sandbox_history.filter(h=>h.name.replace(/^\d+_/,'')===m.migration_name);
 eq(matches.length,1,'Exactly one known installation per migration');
 const h=matches[0];eq(seen.has(h.version),false,'One-to-one installation mapping');seen.add(h.version);
 if(m.sql_match==='exact')eq(digest(source,'md5'),h.sql_md5,'Exact SQL payload');
 else if(m.sql_match==='trailing_whitespace')eq(digest(source.trimEnd(),'md5'),h.trim_end_md5,'Only trailing blank lines differ');
 else{
  eq(['bolig_room_fk_indexes','bolig_delivery_fk_indexes'].includes(m.migration_name),true,'Comment normalization is restricted to two reviewed index files');
  const history=indices.find(x=>x.name===m.migration_name);
  eq(compact(source.replace(/--[^\n]*/g,'')),compact(history.statements.join('\n')),'All index statements remain exact');
 }
}
eq(catalog.production.bolig_schemas,[],'Captured Production is a clean module installation target');
eq(catalog.production.storage_buckets.filter(b=>b.id.startsWith('bolig-')).length,0);
eq(catalog.sandbox.storage_buckets.filter(b=>b.id.startsWith('bolig-')).every(b=>!b.public),true,'The four new storage buckets stay private');
for(const name of ['pg_cron','pg_net','pgcrypto','supabase_vault'])eq(catalog.production.extensions.some(e=>e.name===name),true,'Installed Production prerequisite '+name);
for(const anchor of ['personal_anchor','hr_anchor','signing_anchor'])eq(prerequisites[anchor],true,'Actual Production patch/copy anchor '+anchor);
eq(prerequisites.bolig_cron_jobs,0);
const sharedNames=['hr_private.can_read','hr_private.has_module_access','public.get_my_personal_context','public.people_modules_company_get','public.people_modules_user_get'];
eq(baseline.production_shared.filter(f=>sharedNames.includes(f.schema+'.'+f.proname)).length,5,'Recovery captures the actual shared functions');
const preflight=await fs.readFile('scripts/bolig-release-production-preflight.sql','utf8');
eq(preflight.includes('begin read only;'),true);eq(preflight.includes('rollback;'),true);
const rollback=await fs.readFile('scripts/bolig-release-shared-rollback.sql','utf8');
eq(rollback.includes("current_setting('expo.bolig_release_target',true)"),true,'Recovery is explicit and refuses an unselected target');
eq(rollback.includes('coalesce(e.leader_id=u,false)'),true,'Recovery does not restore NULL-leader access ambiguity');
eq(/^\s*(drop|truncate|delete)\s/im.test(rollback),false,'No data/schema destruction in module rollback');
console.log('PASS Bolig release manifest: '+checks+' assertions; frozen ordered SQL payloads, one-to-one Sandbox history, captured Production prerequisites and bounded non-destructive recovery. Backup verification is a separate release gate.');
