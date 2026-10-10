// Actual handler/probe, synthetic cloud transport. No live secrets or network.
import assert from 'node:assert/strict';
import {createProbeHandler,runCloudProbe,controlUrl} from '../ops/hr-control/supabase/functions/hr-cloud-probe/probe.mjs';
import {createIdentityDispatcher} from '../ops/hr-control/supabase/functions/hr-cloud-probe/identity-dispatcher.mjs';
const token='vercel_blob_rw_feUEeykOyyvZVMca_synthetic-not-a-real-token';
const serverKey='sb_secret_synthetic-key-with-no-real-access';
const oldServerKey='sb_secret_synthetic-old-key-with-no-real-access';
const settings={SUPABASE_URL:controlUrl,SUPABASE_SECRET_KEYS:JSON.stringify({hr_cloud_probe:serverKey,default:oldServerKey}),HR_LEDGER_BLOB_TOKEN:token};
let scenarios=0;
async function scenario(fn){await fn();scenarios++;}
const request=(body={mode:'ISOLATED_CLOUD_QA'},key=serverKey,method='POST')=>new Request('https://example.invalid',{
 method,headers:{apikey:key},...(method==='POST'?{body:JSON.stringify(body)}:{})});
for(const [env,req,status] of [
 [{...settings,SUPABASE_URL:'https://dqffxflaoyarbxyiyhop.supabase.co'},request(),503],
 [{...settings,SUPABASE_URL:'https://ppvircenkjizeiqdxphj.supabase.co'},request(),503],
 [settings,request(undefined,'anon'),403],
 [{...settings,SUPABASE_SECRET_KEYS:''},request(),403],
 [{...settings,SUPABASE_SECRET_KEYS:'{"hr_cloud_probe":"anon"}'},request(),403],
 [{...settings,SUPABASE_SECRET_KEYS:JSON.stringify({other:serverKey})},request(),403],
 [{...settings,SUPABASE_SECRET_KEYS:JSON.stringify({default:serverKey})},request(),403],
 [settings,request(undefined,oldServerKey),403],
 [settings,new Request('https://example.invalid',{method:'POST',headers:{authorization:'Bearer '+serverKey}}),403],
 [settings,new Request('https://example.invalid',{method:'POST'}),403],
 [settings,request(undefined,serverKey,'GET'),405],
 [settings,request({mode:'PRODUCTION'}),400],
 [settings,request({mode:'ISOLATED_CLOUD_QA',path:'hr-ledger/private/ledger.json'}),400],
 [settings,request({mode:'x'.repeat(500)}),400],
 [{...settings,HR_LEDGER_BLOB_TOKEN:''},request(),503],
 [{...settings,HR_LEDGER_BLOB_TOKEN:'vercel_blob_rw_other_synthetic'},request(),503]
])await scenario(async()=>{
 let calls=0;const handler=createProbeHandler({sdk:{},env:n=>env[n],probe:async()=>{calls++;throw Error('unexpected');}});
 const result=await handler(req);assert.equal(result.status,status);assert.equal(calls,0);
 assert(!await result.text().then(t=>t.includes(token)||t.includes(serverKey)||t.includes(oldServerKey)));
});
// Distinguish missing runtime binding from rejected input without exposing any credentials.
for(const encoded of ['', 'not_json', 'null', JSON.stringify({default:serverKey}),
 JSON.stringify({hr_cloud_probe:'anon'})])await scenario(async()=>{
 let calls=0;const handler=createProbeHandler({sdk:{},
  env:n=>n==='SUPABASE_SECRET_KEYS'?encoded:settings[n],probe:async()=>{calls++;}});
 const result=await handler(request());assert.equal(result.status,403);assert.equal(calls,0);
 assert.deepEqual(await result.json(),{ok:false,code:'control_key_not_configured'});
});
for(const headers of [new Headers({apikey:oldServerKey}),
 new Headers([['apikey',serverKey],['apikey',oldServerKey]])])await scenario(async()=>{
 let calls=0;const handler=createProbeHandler({sdk:{},env:n=>settings[n],probe:async()=>{calls++;}});
 const result=await handler(new Request('https://example.invalid',{
  method:'POST',headers,body:JSON.stringify({mode:'ISOLATED_CLOUD_QA'})}));
 assert.equal(result.status,403);assert.equal(calls,0);
 assert.deepEqual(await result.json(),{ok:false,code:'service_only'});
});
await scenario(async()=>{
 const handler=createProbeHandler({sdk:{},env:n=>settings[n],probe:async(_,t)=>{
  assert.equal(t,token);return {ok:true,cleaned:true};}});
 const result=await handler(request());assert.equal(result.status,200);
 assert.deepEqual(await result.json(),{ok:true,cleaned:true});
});
await scenario(async()=>{
 const handler=createProbeHandler({sdk:{},env:n=>settings[n],probe:async()=>{throw Error(token);}});
 const result=await handler(request());assert.equal(result.status,502);
 assert.deepEqual(await result.json(),{ok:false,code:'probe_failed'});
});
class Conflict extends Error{}
function cloud(fault){
 const objects=new Map();let serial=0,gets=0,puts=0;
 return {
  objects,BlobPreconditionFailedError:Conflict,
  async put(path,value,o){
   assert.match(path,/^hr-ledger-qa\/[a-f0-9-]{36}\/ledger.json$/);
   assert.equal(o.token,token);assert.equal(o.access,'private');assert.equal(o.addRandomSuffix,false);
   if(fault==='write-error')throw Error(token);
   const old=objects.get(path);
   if((old && !o.allowOverwrite) || (o.ifMatch && old?.etag!==o.ifMatch))throw new Conflict();
   puts++;objects.set(path,{value,etag:'v'+(++serial)});
   return {pathname:path,url:'https://feueeykoyyvzvmca.private.blob.vercel-storage.com/'+path};
  },
  async get(path,o){
   assert.equal(o.useCache,false);assert.equal(o.token,token);gets++;
   const value=objects.get(path);if(!value)return null;
   const bytes=Buffer.from(value.value);
   if(fault==='missing-read' && gets===1)return null;
   const origin=fault==='wrong-origin'?'https://other.private.blob.vercel-storage.com':
    'https://feueeykoyyvzvmca.private.blob.vercel-storage.com';
   return {statusCode:200,blob:{pathname:path,url:origin+'/'+path,size:bytes.length,etag:value.etag},
    stream:new ReadableStream({start(c){c.enqueue(bytes);c.close();}})};
  },
  async del(path,o){
   assert.equal(o.token,token);assert.match(path,/^hr-ledger-qa\//);
   if(fault==='cleanup-error')throw Error(token);
   objects.delete(path);
  }
 };
}
await scenario(async()=>{
 const sdk=cloud();const result=await runCloudProbe(sdk,token,async(url,o)=>{
  assert.match(url,/^https:\/\/feueeykoyyvzvmca\.private\.blob\.vercel-storage\.com\/hr-ledger-qa\//);
  assert(!o.headers);assert.equal(o.credentials,'omit');return new Response('denied',{status:403});});
 assert.equal(result.ok,true);assert.equal(result.passed.length,9);assert.equal(result.cleaned,true);
 assert.equal(result.databaseAck,false);assert.equal(result.productionAnchor,false);assert.equal(result.byteRestore,false);
 assert.equal(sdk.objects.size,0);
 assert(!JSON.stringify(result).includes(token));
});
for(const fault of ['write-error','missing-read','wrong-origin','cleanup-error','anonymous-public','anonymous-404']){
 await scenario(async()=>{
  const sdk=cloud(fault);const result=await runCloudProbe(sdk,token,async()=>
   new Response('synthetic',{status:fault==='anonymous-public'?200:fault==='anonymous-404'?404:403}));
  assert.equal(result.ok,false);assert(!JSON.stringify(result).includes(token));
  if(fault==='cleanup-error')assert.equal(result.cleaned,false);
  else assert.equal(sdk.objects.size,0);
 });
}
await scenario(async()=>{
 let called=false;await assert.rejects(runCloudProbe({put:()=>{called=true;}},'vercel_blob_rw_wrong_synthetic'));
 assert.equal(called,false);
});
for(const headers of [{authorization:'synthetic', 'x-if-match':'v1','accept-encoding':'br'},
 ['authorization','synthetic','x-if-match','v1','accept-encoding','gzip, br']])await scenario(async()=>{
 let calls=0;const transport=createIdentityDispatcher({dispatch(o){calls++;
  const h=new Headers(Array.from({length:o.headers.length/2},(_,i)=>[o.headers[2*i],o.headers[2*i+1]]));
  assert.equal(h.get('authorization'),'synthetic');assert.equal(h.get('x-if-match'),'v1');
  assert.equal(h.get('accept-encoding'),'identity');return true;
 }});
 assert.equal(transport.dispatch({origin:'https://vercel.com',headers},{}),true);assert.equal(calls,1);
});
for(const origin of ['https://other.private.blob.vercel-storage.com','http://vercel.com','https://user@vercel.com'])
 await scenario(async()=>{let calls=0;const transport=createIdentityDispatcher({dispatch(){calls++;}});
  assert.throws(()=>transport.dispatch({origin,headers:{}},{}));assert.equal(calls,0);});
console.log(`HR cloud probe PASS: ${scenarios} handler/isolation/failure scenarios (synthetic transports; not actual cloud proof).`);
