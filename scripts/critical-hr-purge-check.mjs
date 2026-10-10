import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHrFileAccess,sha256,boundedBytes} from '../supabase/functions/_shared/hr-file-access.mjs';
import {hrClosureMessage} from '../src/modules/hr/hrFoundation.mjs';
import {groupHelpTopics} from '../src/modules/help/helpTopicGroups.mjs';
const c='10000000-0000-4000-8000-000000000001',u='20000000-0000-4000-8000-000000000001',e='30000000-0000-4000-8000-000000000001',f='40000000-0000-4000-8000-000000000001',attempt='50000000-0000-4000-8000-000000000001';
const bytes=new TextEncoder().encode('Synthetic private HR file');
const grant={context:{company_id:c,user_id:u,administer:false},file:{id:f,company_id:c,employee_id:e,object_path:`${c}/${e}/${f}`,size_bytes:bytes.length,mime_type:'application/pdf',sha256:await sha256(bytes)},employee_revision:2};
function fixture({fresh=grant,first=grant,body=bytes,responseHeaders={},authenticate=async()=>u,downloadError=false,origins=['https://example.invalid']}={}){
 let calls=0,downloads=0;const args=[];
 const handler=createHrFileAccess({authenticate,contentEnabled:true,userRpc:async(name,p,authorization)=>{
  assert.equal(name,'hr_file_authorize');assert.equal(authorization,'Bearer synthetic-test');args.push(p);calls++;
  const value=calls===1?first:fresh;if(value instanceof Error)throw value;return structuredClone(value);
 },workerRpc:async()=>false,storage:{download:async path=>{downloads++;assert.equal(path,grant.file.object_path);if(downloadError)throw Error('offline');return new Response(body,{headers:responseHeaders});}},verifyTransport:async()=>false,origins});
 return {handler,args,get calls(){return calls;},get downloads(){return downloads;}};
}
const request=(body={company_id:c,file_id:f},headers={})=>new Request('https://example.invalid/file',{method:'POST',headers:{authorization:'Bearer synthetic-test',origin:'https://example.invalid',...headers},body:JSON.stringify(body)});
let x=fixture(),r=await x.handler(request());assert.equal(r.status,200);assert.deepEqual(new Uint8Array(await r.arrayBuffer()),bytes);assert.equal(x.calls,2);assert(x.args.every(p=>p.p_company_id===c&&p.p_file_id===f));assert.equal(r.headers.get('cache-control'),'no-store, private');assert.equal(r.headers.get('x-content-type-options'),'nosniff');assert(!r.headers.has('location'));
for(const options of [
 {first:new Error('revoked')},{first:{...grant,context:{...grant.context,user_id:f}}},
 {first:{...grant,file:{...grant.file,object_path:'../another-firm/file'}}},
 {fresh:new Error('leader changed')},{fresh:new Error('employee ended')},{fresh:new Error('reader revoked')},
 {fresh:{...grant,employee_revision:3}},{fresh:{...grant,context:{...grant.context,company_id:f}}},
 {body:new TextEncoder().encode('Wrong bytes')},{body:bytes,responseHeaders:{'content-length':'10485761'}},
 {body:bytes,responseHeaders:{'content-length':'12'},first:{...grant,file:{...grant.file,sha256:'0'.repeat(64)}}},
 {downloadError:true}
]){x=fixture(options);r=await x.handler(request());assert.equal(r.status,403);assert.equal((await r.json()).error,'file_not_available');assert(!r.headers.has('location'));}
x=fixture();assert.equal((await x.handler(request({company_id:c,file_id:f,path:grant.file.object_path}))).status,400);assert.equal(x.downloads,0);
x=fixture();assert.equal((await x.handler(request(undefined,{origin:'https://untrusted.invalid'}))).status,403);assert.equal(x.calls,0);
x=fixture({authenticate:async()=>null});assert.equal((await x.handler(request())).status,401);assert.equal(x.calls,0);
await assert.rejects(boundedBytes(new Response(new ReadableStream({start(controller){controller.enqueue(new Uint8Array(16));controller.close();}})),8),/too_large/);
// A revoked grant arriving during the actual byte stream never releases the bytes.
let release;const waiting=new Promise(resolve=>release=resolve);let streamCalls=0;
const race=createHrFileAccess({authenticate:async()=>u,contentEnabled:true,userRpc:async()=>{if(++streamCalls===2)throw Error('revoked');return grant;},workerRpc:async()=>false,verifyTransport:async()=>false,storage:{download:async()=>new Response(new ReadableStream({async start(controller){await waiting;controller.enqueue(bytes);controller.close();}}))}});
const racing=race(request(undefined,{origin:''}));await Promise.resolve();release();assert.equal((await racing).status,403);
for(const scenario of ['ok','remove-error','still-present','finish-error','invalid-job']){
 let reserved=false,finished=false,removed=false;
 const handler=createHrFileAccess({workerRpc:async(name,args)=>{
  if(name==='hr_purge_worker_authorize')return true;
  if(name==='hr_purge_worker_reserve'){if(reserved)return null;reserved=true;return {id:f,attempt,object_path:scenario==='invalid-job'?'../outside':grant.file.object_path};}
  assert.equal(name,'hr_purge_worker_finish');assert.equal(args.p_attempt,attempt);finished=true;
  if(scenario==='finish-error')throw Error('network lost after bytes deleted');
  assert.equal(args.p_removed,scenario==='ok');return args.p_removed;
 },verifyTransport:async()=>true,storage:{remove:async path=>{assert.equal(path,grant.file.object_path);if(scenario==='remove-error')throw Error('retry');removed=true;},missing:async()=>scenario!=='still-present'}});
 const result=await handler(new Request('https://example.invalid/purge',{method:'POST',headers:{'x-hr-purge-token':'a'.repeat(64)},body:'{}'}));
 assert(finished);assert.equal(result.status,scenario==='finish-error'?503:200);
 if(scenario==='ok')assert(removed);
}
assert(hrClosureMessage({deleted:false,purge_state:'pending'}).includes('pågår'));assert(!hrClosureMessage({deleted:false}).endsWith('er slettet.'));assert(hrClosureMessage({deleted:true}).endsWith('er slettet.'));
let releaseGateReads=0;
const closed=createHrFileAccess({authenticate:async()=>u,userRpc:async()=>{releaseGateReads++;return grant;}});
assert.equal((await closed(request(undefined,{origin:''}))).status,423);assert.equal(releaseGateReads,0,'Database restore cannot bypass independent Edge release gate');
const sql=fs.readFileSync('supabase/migrations/20261009193953_hr_content_purge_foundation.sql','utf8');
for(const name of ['runtime_state','artifacts','files','purge_receipts','purge_objects','purge_worker_settings'])assert(sql.includes(`alter table hr_private.${name} enable row level security;`));
assert(!/delete from storage\.objects|create policy|auth\.jwt|user_metadata|is_systemadmin/i.test(sql));
assert(sql.includes('for update skip locked limit 1'));assert(sql.includes("restore_quarantined=true"));assert(sql.includes("kind in ('content','version','draft','search','export')"));
const edge=fs.readFileSync('supabase/functions/hr-file-access/index.ts','utf8');assert(!edge.includes('createSignedUrl'));assert(!edge.includes('probe='));assert(edge.includes("'/auth/v1/user'"));
// Every existing guide is preserved under exactly one family, with no sibling duplicates.
const help=fs.readFileSync('src/modules/help/helpToolsCore.js','utf8');
const records=help.split('\n').filter(line=>/key["']?\s*:\s*["'](?:kshms|hr)-/.test(line)).map(line=>new Function('return ('+line.trim().replace(/,$/,'')+')')());
assert.equal(records.filter(row=>row.key.startsWith('kshms-')).length,12);assert.equal(records.filter(row=>row.key.startsWith('hr-')).length,1);
assert(records.some(row=>row.key==='kshms-organization'));
const other={key:'sales',title:'Unchanged sales'},grouped=groupHelpTopics([...records,other]);
assert.deepEqual(grouped.map(row=>row.key),['kshms','hr','sales']);assert.equal(grouped[2],other);
assert.equal(grouped.flatMap(row=>row.chapters||[]).length,records.length);
for(const original of records){const chapter=grouped.flatMap(row=>row.chapters||[]).find(row=>row.key===original.key);for(const key of ['purpose','workflow','important','best'])assert.deepEqual(chapter[key],original[key]);}
assert(help.includes('groupHelpTopics(['));assert(help.includes('HelpTopicGroup, {item,renderContent:renderGuideContent}'));
console.log('✅ HR H3: buffered file delivery/final fresh grant/hash/no cache, purge failures/fencing, closed restore/content gate and complete single-entry Help families PASS');
