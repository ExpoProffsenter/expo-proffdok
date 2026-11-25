import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {randomBytes} from 'node:crypto';
import {initializeLedger,readLedger,mergeSnapshot,verifyLedger,reconcileSql} from './lib/hr-deletion-ledger.mjs';
const project='ppvircenkjizeiqdxphj',key=randomBytes(32).toString('hex');
const root=await fs.mkdtemp(path.join(os.tmpdir(),'hr-ledger-check-'));
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const row=n=>({id:id(n),company_id:id(1001),employee_id:id(n),user_id:id(n+2000),kind:'employment',through_revision:1,requested_at:'2026-10-09T21:00:00.000Z'});
const snapshot=receipts=>({format:1,project,receipts});
try {
 await assert.rejects(readLedger(root,project,key));
 await initializeLedger(root,project,key);
 await assert.rejects(initializeLedger(root,project,key));
 let result=await mergeSnapshot(root,snapshot([row(900)]),key,0);
 assert.equal(result.generation,1);
 // A new smaller UUID and an absent old source receipt must both survive.
 result=await mergeSnapshot(root,snapshot([row(1)]),key,1);
 assert.deepEqual(result.receipts.map(r=>r.id),[id(1),id(900)]);
 await assert.rejects(mergeSnapshot(root,snapshot([]),key,1),/stale/);
 for(const receipts of [[{...row(1),user_id:id(99)}],[{...row(2),payload:'secret'}],[row(2),row(2)],[{...row(2),requested_at:'never'}]])
  await assert.rejects(mergeSnapshot(root,snapshot(receipts),key,2));
 assert.equal((await readLedger(root,project,key)).generation,2,'failures never replace the durable ledger');
 await assert.rejects(readLedger(root,'aaaaaaaaaaaaaaaaaaaa',key));
 await assert.rejects(readLedger(root,project,'f'.repeat(64)));
 const encoded=JSON.parse(await fs.readFile(path.join(root,'ledger.json'),'utf8'));
 encoded.payload.receipts.pop();assert.throws(()=>verifyLedger(encoded,project,key));
 await fs.writeFile(path.join(root,'.operator.lock'),'unfinished operator');
 await assert.rejects(mergeSnapshot(root,snapshot([]),key,2));
 await fs.unlink(path.join(root,'.operator.lock'));
 result=await mergeSnapshot(root,snapshot(Array.from({length:205},(_,i)=>row(i+1))),key,2);
 assert.equal(result.receipts.length,206);
 const sql=reconcileSql(result);
 assert.equal(sql.match(/select hr_private.restore_reconcile/g).length,3);
 assert(sql.indexOf('restore_quarantined=true')<sql.indexOf('begin;'));
 assert(!/content_enabled=true|restore_quarantined=false/.test(sql));
 assert.equal((await fs.stat(path.join(root,'ledger.json'))).mode&0o077,0);
 await fs.chmod(root,0o755);await assert.rejects(readLedger(root,project,key));await fs.chmod(root,0o700);
 const migration=await fs.readFile('supabase/migrations/20261009211209_hr_restore_reconcile_orphans.sql','utf8');
 assert(migration.includes('Capture restored bytes even when the employee/registry was already deleted'));
 assert(migration.includes('receipt_id=excluded.receipt_id,removed=false,attempt=null,lease_until=null'));
 assert(!/delete from storage\.objects|grant execute|content_enabled=true|restore_quarantined=false/i.test(migration));
 console.log('✅ HR H4 ledger: durable private writes, signature/project/identity/CAS, no missed lower UUID, complete paging and closed replay PASS');
} finally {await fs.rm(root,{recursive:true,force:true});}
