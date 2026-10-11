import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../src/demoSandboxControl.jsx',import.meta.url),'utf8');
const start=source.indexOf('async function runFullPreflight()');
const end=source.indexOf('\nfunction StatusDot',start);
assert(start>=0&&end>start,'actual control-page preflight must be present');
const checks=['course_hr_templates','course_safety_examples','course_privacy_transport','course_hr_conversation','course_sick_leave'].map(key=>({key,ok:true}));
async function scenario({course={ok:true,checks},server={ok:true,checks:[{key:'sales',ok:true}]},baseline=true,sketch=true,reject=false}={}){
 const context=vm.createContext({callRpc:async name=>{if(reject)throw Error('offline');return name==='demo_sandbox_preflight'?server:course;},checkProductionBaseline:async()=>({key:'production_baseline',ok:baseline}),checkLocalDemoAssets:()=>({key:'local_sketch',ok:sketch}),SANDBOX_PRODUCTION_BASELINE:'verified-main',PRODUCTION_REPO:'repo'});
 return vm.runInContext(source.slice(start,end)+'\nrunFullPreflight()',context);
}
assert.equal((await scenario()).ok,true,'five current course points permit a ready demo');
assert.equal((await scenario({course:{ok:true,checks:checks.slice(0,4)}})).ok,false,'old four-point payload cannot pass');
assert.equal((await scenario({course:{ok:true,checks:[...checks,{key:'unknown',ok:true}]}})).ok,false,'unexpected contract cannot pass');
assert.equal((await scenario({course:{ok:true,checks:checks.map(x=>x.key==='course_privacy_transport'?{...x,ok:false}:x)}})).ok,false,'email transport failure wins over top-level ok');
assert.equal((await scenario({course:{ok:false,checks}})).ok,false,'backend course failure blocks');
assert.equal((await scenario({server:{ok:false,checks:[]}})).ok,false,'infrastructure failure blocks');
assert.equal((await scenario({baseline:false})).ok,false,'stale main baseline blocks');
assert.equal((await scenario({sketch:false})).ok,false,'missing local sketch blocks');
await assert.rejects(scenario({reject:true}),/offline/,'RPC failure remains visible');
console.log('PASS: actual demo control preflight accepts five current points and fails closed for contract, mail, backend, baseline, local asset and network failures');
