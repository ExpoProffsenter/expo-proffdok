// Operator-only. Keep this directory AND its key outside database/file restore volumes.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHmac, timingSafeEqual, randomUUID} from 'node:crypto';

const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/;
const fields = ['id','company_id','employee_id','user_id','kind','through_revision','requested_at'];
const exact = (value, keys) => value && typeof value === 'object' && !Array.isArray(value)
  && Object.keys(value).sort().join(',') === [...keys].sort().join(',');
const fail = () => { throw Error('invalid_or_untrusted_hr_ledger'); };

export function normalizeReceipts(rows) {
  if (!Array.isArray(rows) || rows.length > 100000) fail();
  const ids = new Set();
  return rows.map(row => {
    if (!exact(row, fields) || fields.slice(0,4).some(key => !uuid.test(row[key]))
      || !['employment','content'].includes(row.kind)
      || !Number.isSafeInteger(row.through_revision) || row.through_revision < 1
      || row.through_revision > 2147483647
      || typeof row.requested_at !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(row.requested_at)
      || !Number.isFinite(Date.parse(row.requested_at))
      || (row.kind === 'employment' && row.id !== row.employee_id) || ids.has(row.id)) fail();
    ids.add(row.id);
    return Object.fromEntries(fields.map(key => [key, key === 'requested_at' ? new Date(row[key]).toISOString() : row[key]]));
  }).sort((a,b) => a.id.localeCompare(b.id));
}

function credentials(project, key) {
  if (!/^[a-z]{20}$/.test(project) || !/^[a-f0-9]{64}$/.test(key)) fail();
}
function sign(payload, key) { return createHmac('sha256', Buffer.from(key,'hex')).update(JSON.stringify(payload)).digest('hex'); }
export function sealLedger(payload, project, key) {
  credentials(project,key);
  const envelope={payload,hmac:sign(payload,key)};
  verifyLedger(envelope,project,key);
  return envelope;
}
export function verifyLedger(envelope, project, key) {
  credentials(project,key);
  if (!exact(envelope,['payload','hmac']) || !exact(envelope.payload,['format','project','generation','receipts'])
    || envelope.payload.format !== 1 || envelope.payload.project !== project
    || !Number.isSafeInteger(envelope.payload.generation) || envelope.payload.generation < 0
    || !/^[a-f0-9]{64}$/.test(envelope.hmac)) fail();
  const payload = {...envelope.payload, receipts:normalizeReceipts(envelope.payload.receipts)};
  if (JSON.stringify(payload) !== JSON.stringify(envelope.payload)
    || !timingSafeEqual(Buffer.from(sign(payload,key),'hex'),Buffer.from(envelope.hmac,'hex'))) fail();
  return payload;
}

async function privateDirectory(root) {
  if (!path.isAbsolute(root)) fail();
  const stat = await fs.lstat(root);
  if (!stat.isDirectory() || stat.isSymbolicLink() || (stat.mode & 0o077) !== 0) fail();
}
async function syncDirectory(root) { const handle=await fs.open(root,'r'); try { await handle.sync(); } finally { await handle.close(); } }
async function writeDurable(root, payload, key, initialize) {
  const target=path.join(root,'ledger.json'),temp=path.join(root,`.ledger-${randomUUID()}.tmp`);
  let handle;
  try {
    handle=await fs.open(temp,'wx',0o600);
    await handle.writeFile(JSON.stringify({payload,hmac:sign(payload,key)})+'\n');
    await handle.sync(); await handle.close(); handle=null;
    if (initialize) { await fs.link(temp,target); await fs.unlink(temp); }
    else await fs.rename(temp,target);
    await syncDirectory(root);
  } finally { if(handle)await handle.close(); await fs.unlink(temp).catch(()=>{}); }
}
async function locked(root, work) {
  await privateDirectory(root);
  const lock=path.join(root,'.operator.lock');
  // A crash leaves the lock behind: fail closed; operator verifies before recovery.
  const handle=await fs.open(lock,'wx',0o600);
  try { await handle.sync(); await syncDirectory(root); return await work(); }
  finally { await handle.close(); await fs.unlink(lock); await syncDirectory(root); }
}
export async function initializeLedger(root,project,key) {
  credentials(project,key);
  return locked(root,async()=>{const payload={format:1,project,generation:0,receipts:[]};await writeDurable(root,payload,key,true);return payload;});
}
export async function readLedger(root,project,key) {
  await privateDirectory(root);
  const file=path.join(root,'ledger.json'),stat=await fs.lstat(file);
  if (!stat.isFile() || stat.isSymbolicLink() || (stat.mode & 0o077) !== 0 || stat.size > 40000000) fail();
  return verifyLedger(JSON.parse(await fs.readFile(file,'utf8')),project,key);
}
export async function mergeSnapshot(root,snapshot,key,expectedGeneration) {
  if (!exact(snapshot,['format','project','receipts']) || snapshot.format!==1) fail();
  const fresh=normalizeReceipts(snapshot.receipts);
  return locked(root,async()=>{
    const old=await readLedger(root,snapshot.project,key);
    if(old.generation!==expectedGeneration)throw Error('stale_hr_ledger_generation');
    const rows=new Map(old.receipts.map(row=>[row.id,row]));
    for(const row of fresh){
      if(rows.has(row.id) && JSON.stringify(rows.get(row.id))!==JSON.stringify(row))fail();
      rows.set(row.id,row);
    }
    // Never drop an existing deletion, even if a restored source no longer has it.
    const payload={format:1,project:old.project,generation:old.generation+1,receipts:normalizeReceipts([...rows.values()])};
    await writeDurable(root,payload,key,false);
    return payload;
  });
}
export function reconcileSql(payload) {
  const rows=normalizeReceipts(payload.receipts),lines=[
    "-- Operator only; keep all content closed until independent checks finish.",
    "update hr_private.runtime_state set content_enabled=false,restore_quarantined=true where singleton;",
    "begin;", "set local statement_timeout='120s';", "set local lock_timeout='5s';"
  ];
  for(let start=0;start<rows.length;start+=100){
    const json=JSON.stringify(rows.slice(start,start+100)).replaceAll("'","''");
    lines.push(`select hr_private.restore_reconcile('${json}'::jsonb);`);
  }
  lines.push('commit;');
  return lines.join('\n')+'\n';
}
