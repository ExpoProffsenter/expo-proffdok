// No app imports, database credentials, or automatic content opening.
import fs from 'node:fs/promises';
import {initializeLedger,readLedger,mergeSnapshot,reconcileSql} from './lib/hr-deletion-ledger.mjs';
const [command,root,input,expected]=process.argv.slice(2);
const project=process.env.HR_LEDGER_PROJECT,key=process.env.HR_LEDGER_HMAC_KEY;
try {
  let result;
  if(command==='init')result=await initializeLedger(root,project,key);
  else if(command==='sync'){
    const snapshot=JSON.parse(await fs.readFile(input,'utf8'));
    if(snapshot.project!==project)throw Error('wrong_project');
    result=await mergeSnapshot(root,snapshot,key,Number(expected));
  } else if(command==='verify')result=await readLedger(root,project,key);
  else if(command==='reconcile-sql'){
    result=await readLedger(root,project,key);
    // wx prevents overwriting an unrelated or previously approved operator file.
    await fs.writeFile(input,reconcileSql(result),{flag:'wx',mode:0o600});
  } else throw Error('usage');
  console.log(JSON.stringify({verified:true,generation:result.generation,receipts:result.receipts.length}));
} catch { console.error('HR ledger operation failed. No release or restore approval issued.'); process.exitCode=1; }
