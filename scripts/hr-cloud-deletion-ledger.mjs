// Requires a separately installed/pinned @vercel/blob SDK in the operator environment.
// No provisioning, DB acknowledgement, content opening, or credential output.
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {constants} from 'node:fs';
import {readCloudLedger,syncCloudLedger} from './lib/hr-cloud-deletion-ledger.mjs';

async function privateJson(file) {
  if(!path.isAbsolute(file))throw Error('private_absolute_file_required');
  const handle=await fs.open(file,constants.O_RDONLY|constants.O_NOFOLLOW);
  try {
    const stat=await handle.stat();
    if(!stat.isFile() || (stat.mode&0o077)!==0 || stat.size>40000000)throw Error('private_file_required');
    return JSON.parse(await handle.readFile('utf8'));
  } finally {await handle.close();}
}
const [command,anchorFile,snapshotFile,outputFile]=process.argv.slice(2);
try {
  if(!['verify','sync','reconcile-sql'].includes(command))throw Error('usage');
  const config={project:process.env.HR_LEDGER_PROJECT,storeId:process.env.HR_LEDGER_STORE_ID,
    origin:process.env.HR_LEDGER_BLOB_ORIGIN,token:process.env.HR_LEDGER_BLOB_TOKEN,
    key:process.env.HR_LEDGER_HMAC_KEY};
  const anchor=await privateJson(anchorFile);
  if(process.env.VERCEL_BLOB_API_URL || process.env.NEXT_PUBLIC_VERCEL_BLOB_API_URL)
    throw Error('custom_blob_endpoint_forbidden');
  // External package root keeps operator dependencies out of the browser app/lockfile.
  const sdkRoot=process.env.HR_LEDGER_BLOB_SDK_ROOT;
  if(!sdkRoot || !path.isAbsolute(sdkRoot))throw Error('pinned_sdk_required');
  const manifest=JSON.parse(await fs.readFile(path.join(sdkRoot,'package.json'),'utf8'));
  if(manifest.name!=='@vercel/blob' || manifest.version!=='2.8.1')throw Error('unaudited_sdk');
  const sdk=await import(pathToFileURL(path.join(sdkRoot,'dist/index.js')).href);
  let payload;
  if(command==='sync') {
    if(!path.isAbsolute(outputFile))throw Error('output_required');
    const result=await syncCloudLedger(sdk,config,anchor,await privateJson(snapshotFile));
    // Independent new file, fsync and parent directory sync; never overwrite an old anchor.
    const handle=await fs.open(outputFile,'wx',0o600);
    try {await handle.writeFile(JSON.stringify(result.anchor)+'\n');await handle.sync();}
    finally {await handle.close();}
    const directory=await fs.open(path.dirname(outputFile),'r');
    try {await directory.sync();}finally{await directory.close();}
    payload=result.payload;
  } else {
    payload=await readCloudLedger(sdk,config,anchor);
    if(command==='reconcile-sql') {
      if(!path.isAbsolute(snapshotFile))throw Error('output_required');
      const {reconcileSql}=await import('./lib/hr-deletion-ledger.mjs');
      await fs.writeFile(snapshotFile,reconcileSql(payload),{flag:'wx',mode:0o600});
    }
  }
  console.log(JSON.stringify({verified:true,generation:payload.generation,receipts:payload.receipts.length}));
} catch {
  console.error('HR cloud ledger operation failed. No database acknowledgement or release approval issued.');
  process.exitCode=1;
}
