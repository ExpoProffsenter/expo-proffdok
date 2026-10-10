// Optional operator QA. Real pinned SDK, synthetic HTTP, all external networking disabled.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {randomBytes} from 'node:crypto';
import {sealLedger} from './lib/hr-deletion-ledger.mjs';
import {syncCloudLedger} from './lib/hr-cloud-deletion-ledger.mjs';
import {createIdentityDispatcher} from '../ops/hr-control/supabase/functions/hr-cloud-probe/identity-dispatcher.mjs';
const root=process.env.HR_LEDGER_BLOB_SDK_ROOT;
assert(root && path.isAbsolute(root));
assert(!process.env.VERCEL_BLOB_API_URL && !process.env.NEXT_PUBLIC_VERCEL_BLOB_API_URL);
const manifest=JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8'));
assert.equal(manifest.name,'@vercel/blob');assert.equal(manifest.version,'2.8.1');
const sdk=await import(pathToFileURL(path.join(root,'dist/index.js')).href);
const {MockAgent,setGlobalDispatcher,getGlobalDispatcher}=await import(
  pathToFileURL(path.resolve(root,'../../undici/index.js')).href);
const prior=getGlobalDispatcher(),agent=new MockAgent();agent.disableNetConnect();
setGlobalDispatcher(createIdentityDispatcher(agent));
const project='ppvircenkjizeiqdxphj';
const config={project,storeId:'store_feueeykoyyvzvmca',origin:'https://feueeykoyyvzvmca.private.blob.vercel-storage.com',
  token:'vercel_blob_rw_feUEeykOyyvZVMca_not-a-real-token',key:randomBytes(32).toString('hex')};
const initial=sealLedger({format:1,project,generation:0,receipts:[]},project,config.key);
const anchor={project,storeId:config.storeId,generation:0,hmac:initial.hmac};
const pathname=`hr-ledger/${project}/ledger.json`,url=`${config.origin}/${pathname}`;
let encoded=JSON.stringify(initial)+'\n';
const privatePool=agent.get(config.origin),api=agent.get('https://vercel.com');
function privateRead(etag){
  privatePool.intercept({path:`/${pathname}?cache=0`,method:'GET',
    headers:{authorization:`Bearer ${config.token}`,'accept-encoding':'identity'}})
    .reply(()=>({statusCode:200,data:encoded,responseOptions:{headers:{
      'content-type':'application/json','content-length':String(Buffer.byteLength(encoded)),etag}}}));
}
try {
  privateRead('"v0"');
  api.intercept({path:`/api/blob/?pathname=${encodeURIComponent(pathname)}`,method:'PUT'})
    .reply(200,async options=>{
      // A dispatcher supplies flat header pairs to Undici; retain every original assertion.
      const input=options.headers;
      const headers=new Headers(Array.isArray(input)
        ? Array.from({length:input.length/2},(_,i)=>[input[2*i],input[2*i+1]]) : input);
      assert.equal(headers.get('x-if-match'),'"v0"');
      assert.equal(headers.get('x-allow-overwrite'),'1');
      assert.equal(headers.get('x-add-random-suffix'),'0');
      assert.equal(headers.get('x-vercel-blob-access'),'private');
      assert.equal(headers.get('authorization'),`Bearer ${config.token}`);
      assert.equal(headers.get('accept-encoding'),'identity');
      const body=options.body;
      if(body && typeof body[Symbol.asyncIterator]==='function'){
        const chunks=[];for await(const chunk of body)chunks.push(Buffer.from(chunk));
        encoded=Buffer.concat(chunks).toString();
      }else encoded=Buffer.isBuffer(body)?body.toString():String(body);
      return JSON.stringify({url,pathname,etag:'"v1"',downloadUrl:url+'?download=1',
        contentType:'application/json',contentDisposition:'attachment'});
    });
  privateRead('"v1"');
  const result=await syncCloudLedger(sdk,config,anchor,{format:1,project,receipts:[]});
  assert.equal(result.anchor.generation,1);agent.assertNoPendingInterceptors();
  // A genuine SDK 412 must reach the adapter as rejection, without another overwrite/readback.
  privateRead('"v1"');
  api.intercept({path:`/api/blob/?pathname=${encodeURIComponent(pathname)}`,method:'PUT'})
    .reply(412,{error:{code:'precondition_failed',message:'synthetic CAS conflict'}});
  await assert.rejects(syncCloudLedger(sdk,config,result.anchor,{format:1,project,receipts:[]}));
  agent.assertNoPendingInterceptors();
  console.log('✅ Real @vercel/blob 2.8.1: private/cache=0/token/ifMatch headers, fresh readback and 412 rejection PASS (synthetic HTTP, network disabled)');
} finally {setGlobalDispatcher(prior);await agent.close();}
