// Isolated Sandbox operator; schedule externally only after live storage QA.
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {runLedgerAckCycle,createLedgerRpc} from './lib/hr-ledger-ack-cycle.mjs';
try{
 const config={project:process.env.HR_LEDGER_PROJECT,storeId:process.env.HR_LEDGER_STORE_ID,
  origin:process.env.HR_LEDGER_BLOB_ORIGIN,token:process.env.HR_LEDGER_BLOB_TOKEN,
  key:process.env.HR_LEDGER_HMAC_KEY};
 if(process.env.HR_LEDGER_RUN_MODE!=='SANDBOX' || config.project!=='ppvircenkjizeiqdxphj'
  || process.env.VERCEL_BLOB_API_URL || process.env.NEXT_PUBLIC_VERCEL_BLOB_API_URL)
  throw Error('sandbox_operator_required');
 const sdkRoot=process.env.HR_LEDGER_BLOB_SDK_ROOT;
 if(!sdkRoot || !path.isAbsolute(sdkRoot))throw Error('pinned_sdk_required');
 const manifest=JSON.parse(await fs.readFile(path.join(sdkRoot,'package.json'),'utf8'));
 if(manifest.name!=='@vercel/blob' || manifest.version!=='2.8.1')throw Error('unaudited_sdk');
 const sdk=await import(pathToFileURL(path.join(sdkRoot,'dist/index.js')).href);
 const result=await runLedgerAckCycle({sdk,config,root:process.env.HR_LEDGER_ANCHOR_ROOT,
  rpc:createLedgerRpc(config.project,process.env.HR_LEDGER_SUPABASE_SERVER_KEY)});
 console.log(JSON.stringify(result));
}catch{
 console.error('HR ledger cycle failed. No release approval issued; inspect private operator state before recovery.');
 process.exitCode=1;
}
