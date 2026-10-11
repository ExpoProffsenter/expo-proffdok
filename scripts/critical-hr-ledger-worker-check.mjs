import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createWorkerHandler,createWorkerRpc,controlUrl} from '../ops/hr-control/supabase/functions/hr-ledger-worker/worker.mjs';
import {provisionSigningKey} from './hr-worker-provision-signing-key.mjs';
const key='sb_secret_'+'worker'.repeat(8),sourceKey='sb_secret_'+'source'.repeat(8);
const values={SUPABASE_URL:controlUrl,SUPABASE_SECRET_KEYS:JSON.stringify({hr_ledger_worker:key}),
 HR_LEDGER_QA_PROJECT_REF:'workerqaonlyxxxxxxxx',HR_LEDGER_BLOB_TOKEN:'vercel_blob_rw_feUEeykOyyvZVMca_fake',
 HR_LEDGER_QA_SIGNING_KEY_V1:'a'.repeat(64),HR_LEDGER_QA_SOURCE_KEY:sourceKey};
let assertions=0,effects=0;
function check(v){assert(v);assertions++;}
const effect=()=>{effects++;throw Error('provider-private-secret');};
const handler=(overrides={})=>createWorkerHandler({sdk:{get:effect,put:effect},transport:effect,env:n=>({...values,...overrides})[n]});
const request=(action='plan',overrides={})=>new Request(controlUrl+'/functions/v1/hr-ledger-worker',{
 method:'POST',headers:{apikey:key,'content-type':'application/json'},body:JSON.stringify({mode:'ISOLATED_QA',action}),...overrides});
async function expect(status,h=handler(),req=request()){
 const response=await h(req),body=await response.json();check(response.status===status);
 check(response.headers.get('cache-control')==='no-store');
 const text=JSON.stringify(body);check(![key,sourceKey,values.HR_LEDGER_BLOB_TOKEN,values.HR_LEDGER_QA_SIGNING_KEY_V1,'provider-private-secret'].some(v=>text.includes(v)));
 return body;
}
for(const credential of ['',sourceKey,'sb_publishable_'+'x'.repeat(32),'Bearer token'])
 await expect(403,handler(),request('cycle',{headers:{apikey:credential}}));
await expect(403,handler(),request('cycle',{headers:{apikey:key,authorization:'Bearer '+key}}));
for(const keys of ['bad',JSON.stringify({default:key,hr_cloud_probe:key}),JSON.stringify({hr_ledger_worker:23})])
 await expect(403,handler({SUPABASE_SECRET_KEYS:keys}));
await expect(503,handler({SUPABASE_URL:'https://dqffxflaoyarbxyiyhop.supabase.co'}));
await expect(405,handler(),request('plan',{method:'GET',body:undefined}));
for(const body of ['{','x'.repeat(257),JSON.stringify({mode:'PRODUCTION',action:'cycle'}),
 JSON.stringify({mode:'ISOLATED_QA',action:'plan',project:'dqffxflaoyarbxyiyhop'}),
 JSON.stringify({mode:'ISOLATED_QA',action:'unlock'}),'null'])await expect(400,handler(),request('plan',{body}));
for(const project of ['dqffxflaoyarbxyiyhop','ppvircenkjizeiqdxphj','amduqhmgmeetaatwlmmt','bad',undefined])
 await expect(503,handler({HR_LEDGER_QA_PROJECT_REF:project}));
for(const overrides of [{HR_LEDGER_QA_SIGNING_KEY_V1:undefined},{HR_LEDGER_BLOB_TOKEN:'vercel_blob_rw_other_fake'}])
 await expect(503,handler(overrides));
const plan=await expect(200);check(plan.anchor.generation===0 && plan.productionAnchor===false);
check(plan.stagingSql.includes('insert into')&&!/on conflict|enabled=true/i.test(plan.stagingSql));
await expect(503,handler(),request('cycle'));
await expect(503,handler({HR_LEDGER_QA_CYCLE_APPROVED:'ISOLATED_QA_VERIFIED',HR_LEDGER_QA_SOURCE_KEY:key}),request('cycle'));
check(effects===0);
const failed=await expect(502,handler(),request('bootstrap'));check(failed.automaticRetry===false);check(effects===1);
let calls=0;
const rpc=createWorkerRpc(values.HR_LEDGER_QA_PROJECT_REF,sourceKey,['hr_ledger_snapshot'],64,async(url,opts)=>{
 calls++;check(url===`https://${values.HR_LEDGER_QA_PROJECT_REF}.supabase.co/rest/v1/rpc/hr_ledger_snapshot`);
 check(opts.headers.apikey===sourceKey&&!('authorization'in opts.headers));check(opts.redirect==='error');return new Response('{}');});
check(JSON.stringify(await rpc('hr_ledger_snapshot',{}))==='{}');
await assert.rejects(rpc('arbitrary_endpoint',{}));check(calls===1);
for(const response of [()=>new Response('x'.repeat(65)),()=>new Response(new Uint8Array([255])),
 ()=>new Response('{}',{status:403}),()=>{throw Error('provider-private-secret');}]){
 await assert.rejects(createWorkerRpc(values.HR_LEDGER_QA_PROJECT_REF,sourceKey,['hr_ledger_snapshot'],64,async()=>response())('hr_ledger_snapshot',{}),e=>e.message==='hr_ledger_worker_rejected');assertions++;
}
const dir=await fs.mkdtemp(path.join(os.tmpdir(),'hr-key-qa-')),file=path.join(dir,'new-key');
try{
 const calls=[];const runCli=async(cli,args,input)=>{calls.push({args,input});return '[]';};
 const result=await provisionSigningKey({keyFile:file,runCli});check(result.ok);
 const newKey=(await fs.readFile(file,'utf8')).trim();check(/^[a-f0-9]{64}$/.test(newKey));
 check((await fs.stat(file)).mode%512===384);check(calls.length===2);
 check(calls[1].input===`HR_LEDGER_QA_SIGNING_KEY_V1=${newKey}\n`);check(!JSON.stringify(calls[1].args).includes(newKey));
 await assert.rejects(provisionSigningKey({keyFile:file,runCli}));assertions++;
 check((await fs.readFile(file,'utf8')).trim()===newKey);
 await assert.rejects(provisionSigningKey({keyFile:path.join(dir,'existing-cloud'),runCli:async()=>'[{"name":"HR_LEDGER_QA_SIGNING_KEY_V1"}]'}));assertions++;
 await assert.rejects(fs.stat(path.join(dir,'existing-cloud')));assertions++;
 const unknown=path.join(dir,'unknown');let n=0;
 await assert.rejects(provisionSigningKey({keyFile:unknown,runCli:async()=>{if(++n===1)return '[]';throw Error('unknown upload');}}));assertions++;
 check((await fs.stat(unknown)).size===65&&n===2);
 await fs.chmod(dir,0o755);await assert.rejects(provisionSigningKey({keyFile:path.join(dir,'unsafe'),runCli}));assertions++;
}finally{await fs.rm(dir,{recursive:true,force:true});}
console.log(`HR isolated Edge worker PASS: ${assertions} auth/binding/HTTP/secret-provisioning assertions. Synthetic HTTP only; no actual key provisioned.`);
