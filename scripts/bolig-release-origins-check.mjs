import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {boligAllowedOrigins} from '../supabase/functions/_shared/bolig-origins.mjs';
import {createContractFiles} from '../supabase/functions/_shared/bolig-contract-files.mjs';
import {createPartnerFiles} from '../supabase/functions/_shared/bolig-partner-files.mjs';
import {createContractReviewHandler} from '../supabase/functions/_shared/bolig-contract-review.mjs';
let checks=0,auth=0,bytes=0,model=0;
const eq=(a,b,m)=>{assert.deepEqual(a,b,m);checks++;};
const files=createContractFiles({origins:boligAllowedOrigins,authenticate:async()=>{auth++;return null;}});
const partner=createPartnerFiles({origins:boligAllowedOrigins,rpc:async()=>{bytes++;throw Error('Not an authorized file request');},upload:async()=>{bytes++;},download:async()=>{bytes++;}});
const review=createContractReviewHandler({authenticate:async()=>{auth++;return null;},generate:async()=>{model++;}});
for(const origin of boligAllowedOrigins){
 const options=()=>new Request('https://gateway.invalid',{method:'OPTIONS',headers:{origin}});
 for(const handler of [files,partner]){
  const r=await handler(options());eq(r.status,204,'Verified app origins pass file preflight');
  eq(r.headers.get('access-control-allow-origin'),origin,'Exact requesting origin is returned');
 }
 const r=await review(new Request('https://gateway.invalid',{method:'POST',headers:{origin},body:'{}'}));
 eq(r.status,401,'Each permitted host still requires a confirmed login');
 eq(r.headers.get('access-control-allow-origin'),origin,'Review recognizes the configured host');
}
for(const origin of ['https://expo-proffdok.app.attacker.invalid','https://www.expo-proffdok.app.attacker.invalid','http://expo-proffdok.app','https://www.expo-proffdok.app:444']){
 for(const handler of [files,partner,review]){
  const r=await handler(new Request('https://gateway.invalid',{method:'POST',headers:{origin},body:'{}'}));
  eq(r.status,403,'Unreviewed origins are denied before authentication/Storage/model work');
  eq(r.headers.get('access-control-allow-origin')===origin,false,'Untrusted origin is never reflected');
 }
}
eq(auth,boligAllowedOrigins.length,'Wrong hosts do not invoke authentication');eq(bytes,0,'No Storage or RPC mutation is made by host tests');eq(model,0,'No model call is made');
for(const file of ['supabase/functions/bolig-contract-files/index.ts','supabase/functions/bolig-partner-files/index.ts']){
 const source=await fs.readFile(file,'utf8');eq(/import\s*\{boligAllowedOrigins\}\s*from\s*['"]\.\.\/_shared\/bolig-origins.mjs['"]/.test(source),true,'Edge entry uses reviewed shared origins');
 eq(/origins:\s*boligAllowedOrigins/.test(source),true,'Handler receives shared allowlist');
}
console.log('PASS Bolig release origins: '+checks+' assertions; verified production/www/Preview/Demo hosts, unrelated hosts denied, preserved authentication and no bytes/model/sends.');
