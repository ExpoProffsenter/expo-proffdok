// Server/operator only. Root and signing key must be outside all restored volumes.
import fs from 'node:fs/promises';
import path from 'node:path';
import {constants} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {normalizeReceipts} from './hr-deletion-ledger.mjs';
import {readCloudLedger,syncCloudLedger} from './hr-cloud-deletion-ledger.mjs';

const fail=()=>{throw Error('untrusted_hr_ledger_ack_cycle');};
const exact=(v,keys)=>v && typeof v==='object' && !Array.isArray(v)
 && Object.keys(v).sort().join(',')===[...keys].sort().join(',');
async function syncDirectory(root){const h=await fs.open(root,'r');try{await h.sync();}finally{await h.close();}}
async function privateRoot(root){
 if(!path.isAbsolute(root))fail();
 const s=await fs.lstat(root);
 if(!s.isDirectory() || s.isSymbolicLink() || (s.mode&0o077)!==0)fail();
}
async function anchor(root){
 const h=await fs.open(path.join(root,'anchor.json'),constants.O_RDONLY|constants.O_NOFOLLOW);
 try{
  const s=await h.stat();
  if(!s.isFile() || (s.mode&0o077)!==0 || s.size>1024)fail();
  return JSON.parse(await h.readFile('utf8'));
 }finally{await h.close();}
}
async function publishAnchor(root,expected,next){
 if(JSON.stringify(await anchor(root))!==JSON.stringify(expected))fail();
 const temp=path.join(root,`.anchor-${randomUUID()}.tmp`);
 let h;
 try{
  h=await fs.open(temp,'wx',0o600);
  await h.writeFile(JSON.stringify(next)+'\n');await h.sync();await h.close();h=null;
  await fs.rename(temp,path.join(root,'anchor.json'));await syncDirectory(root);
  if(JSON.stringify(await anchor(root))!==JSON.stringify(next))fail();
 }finally{if(h)await h.close();await fs.unlink(temp).catch(()=>{});}
}

export async function runLedgerAckCycle({sdk,config,root,rpc}){
 await privateRoot(root);
 // Crash leaves a lock: operator recovery must verify remote generation and anchor.
 const lock=path.join(root,'.ack-cycle.lock'),h=await fs.open(lock,'wx',0o600);
 try{
  await h.sync();await syncDirectory(root);
  const old=await anchor(root);
  // Validate independent binding before even exporting DB identifiers.
  await readCloudLedger(sdk,config,old);
  const snapshot=await rpc('hr_ledger_snapshot',{p_project:config.project,p_store:config.storeId});
  if(!exact(snapshot,['format','project','receipts']) || snapshot.format!==1 || snapshot.project!==config.project)fail();
  const receipts=normalizeReceipts(snapshot.receipts);
  const result=await syncCloudLedger(sdk,config,old,{...snapshot,receipts});
  // DB ack must follow durable publication AND another fresh cloud read.
  await publishAnchor(root,old,result.anchor);
  const verified=await readCloudLedger(sdk,config,await anchor(root));
  const exported=new Map(verified.receipts.map(row=>[row.id,JSON.stringify(row)]));
  if(receipts.some(row=>exported.get(row.id)!==JSON.stringify(row)))fail();
  let acknowledged=0;
  for(let start=0;start<receipts.length;start+=100){
   const batch=receipts.slice(start,start+100);
   const response=await rpc('hr_ledger_ack',{p_project:config.project,p_store:config.storeId,
    p_generation:verified.generation,p_hmac:result.anchor.hmac,p_receipts:batch});
   if(!exact(response,['acknowledged']) || !Array.isArray(response.acknowledged)
    || JSON.stringify(response.acknowledged)!==JSON.stringify(batch.map(row=>row.id)))fail();
   acknowledged+=batch.length;
  }
  return {verified:true,generation:verified.generation,acknowledged};
 }finally{await h.close();await fs.unlink(lock);await syncDirectory(root);}
}

export function createLedgerRpc(project,serverKey,transport=fetch){
 if(!/^[a-z]{20}$/.test(project) || typeof serverKey!=='string' || serverKey.length<32)fail();
 return async(name,body)=>{
  if(!['hr_ledger_snapshot','hr_ledger_ack'].includes(name))fail();
  const response=await transport(`https://${project}.supabase.co/rest/v1/rpc/${name}`,{
   method:'POST',redirect:'error',signal:AbortSignal.timeout(30000),
   headers:{apikey:serverKey,authorization:'Bearer '+serverKey,'content-type':'application/json'},
   body:JSON.stringify(body)
  });
  if(!response.ok)throw Error('hr_ledger_rpc_failed');
  // Bounded stream; content-length can be absent or untrusted.
  if(!response.body)fail();
  const reader=response.body.getReader();const chunks=[];let size=0,finished=false;
  try{
   while(true){const p=await reader.read();if(p.done){finished=true;break;}
    size+=p.value.byteLength;if(size>40000000)fail();chunks.push(Buffer.from(p.value));}
   return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat(chunks)));
  }finally{if(!finished)await reader.cancel().catch(()=>{});reader.releaseLock();}
 };
}
