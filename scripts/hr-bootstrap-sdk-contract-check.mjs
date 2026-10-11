// Actual pinned SDK; synthetic HTTP, external networking disabled.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {randomBytes} from 'node:crypto';
import {prepareControlBootstrap,runControlBootstrap} from './lib/hr-control-bootstrap.mjs';
import {createIdentityDispatcher} from '../ops/hr-control/supabase/functions/hr-cloud-probe/identity-dispatcher.mjs';
const root=process.env.HR_LEDGER_BLOB_SDK_ROOT;assert(root&&path.isAbsolute(root));
assert(!process.env.VERCEL_BLOB_API_URL&&!process.env.NEXT_PUBLIC_VERCEL_BLOB_API_URL);
const manifest=JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8'));
assert.equal(manifest.name,'@vercel/blob');assert.equal(manifest.version,'2.8.1');
const sdk=await import(pathToFileURL(path.join(root,'dist/index.js')).href);
const {MockAgent,setGlobalDispatcher,getGlobalDispatcher}=await import(pathToFileURL(path.resolve(root,'../../undici/index.js')).href);
const prior=getGlobalDispatcher(),agent=new MockAgent();agent.disableNetConnect();setGlobalDispatcher(createIdentityDispatcher(agent));
const config={project:'bootstrapqaonlyxxxxx',storeId:'store_feueeykoyyvzvmca',
 origin:'https://feueeykoyyvzvmca.private.blob.vercel-storage.com',
 token:'vercel_blob_rw_feUEeykOyyvZVMca_synthetic',key:randomBytes(32).toString('hex')};
const pathname=`hr-ledger/${config.project}/ledger.json`,url=config.origin+'/'+pathname;
const anchor=prepareControlBootstrap(config,'ISOLATED_QA').anchor;
let encoded='',runId=null,status='staged';
const control=async(name,args)=>{
 if(name==='hr_control_bootstrap_claim'){assert.equal(status,'staged');runId=args.p_run;status='writing';}
 if(name==='hr_control_bootstrap_commit')status='verified';
 return {format:1,project:config.project,storeId:config.storeId,origin:config.origin,revision:0,runId,anchor,bootstrapStatus:status,enabled:false};
};
const privatePool=agent.get(config.origin);
function read(){privatePool.intercept({path:`/${pathname}?cache=0`,method:'GET',
 headers:{authorization:'Bearer '+config.token,'accept-encoding':'identity'}})
 .reply(()=>({statusCode:200,data:encoded,responseOptions:{headers:{'content-type':'application/json',
  'content-length':String(Buffer.byteLength(encoded)),etag:'"v0"'}}}));}
try{
 privatePool.intercept({path:`/${pathname}?cache=0`,method:'GET'}).reply(404,'missing');
 agent.get('https://vercel.com').intercept({path:`/api/blob/?pathname=${encodeURIComponent(pathname)}`,method:'PUT'})
 .reply(200,async options=>{
  const input=options.headers;const headers=new Headers(Array.isArray(input)
   ?Array.from({length:input.length/2},(_,i)=>[input[2*i],input[2*i+1]]):input);
  assert.equal(headers.get('x-allow-overwrite'),'0');assert.equal(headers.get('x-add-random-suffix'),'0');
  assert.equal(headers.get('x-vercel-blob-access'),'private');assert.equal(headers.get('x-if-match'),null);
  assert.equal(headers.get('authorization'),'Bearer '+config.token);assert.equal(headers.get('accept-encoding'),'identity');
  if(options.body&&typeof options.body[Symbol.asyncIterator]==='function'){
   const chunks=[];for await(const chunk of options.body)chunks.push(Buffer.from(chunk));encoded=Buffer.concat(chunks).toString();
  }else encoded=Buffer.isBuffer(options.body)?options.body.toString():String(options.body);
  return JSON.stringify({url,pathname,etag:'"v0"',downloadUrl:url+'?download=1',contentType:'application/json',contentDisposition:'attachment'});
 });
 read();read();
 assert.deepEqual(await runControlBootstrap({sdk,config,control,runMode:'ISOLATED_QA'}),
  {bootstrapVerified:true,bindingEnabled:false,locked:true});
 agent.assertNoPendingInterceptors();
 console.log('Bootstrap actual @vercel/blob 2.8.1 PASS: missing/create-only/private/token/identity/fresh-readback contract; synthetic HTTP, external network disabled.');
}finally{setGlobalDispatcher(prior);await agent.close();}
