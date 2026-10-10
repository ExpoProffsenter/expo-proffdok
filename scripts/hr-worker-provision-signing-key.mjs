// Operator runs on their trusted machine. Never run inside app backup/restore volumes.
// Creates a new key without stdout, shell arguments, repository files or existing-key reads.
import fs from 'node:fs/promises';
import path from 'node:path';
import {randomBytes} from 'node:crypto';
import {spawn} from 'node:child_process';
import {pathToFileURL} from 'node:url';
const project='amduqhmgmeetaatwlmmt',name='HR_LEDGER_QA_SIGNING_KEY_V1';
const fail=()=>{throw Error('signing_key_provisioning_stopped');};
async function cliRun(cli,args,input){
 return new Promise((resolve,reject)=>{
  const child=spawn(cli,args,{stdio:['pipe','pipe','pipe'],shell:false});
  const chunks=[];let size=0,settled=false;
  const stop=()=>{if(!settled){settled=true;child.kill();reject(Error('signing_key_provisioning_stopped'));}};
  const timer=setTimeout(stop,30000);
  child.on('error',stop);child.stdin.on('error',stop);
  child.stdout.on('data',chunk=>{size+=chunk.length;if(size>65536)stop();else if(!input)chunks.push(chunk);});
  // Drain and discard all provider stderr; it may contain credential-bearing diagnostics.
  child.stderr.resume();
  child.on('close',code=>{clearTimeout(timer);if(settled)return;settled=true;
   if(code!==0)reject(Error('signing_key_provisioning_stopped'));else resolve(Buffer.concat(chunks).toString('utf8'));});
  child.stdin.end(input??'');
 });
}
export async function provisionSigningKey({keyFile,cli='supabase',runCli=cliRun,repoRoot=process.cwd()}){
 if(!path.isAbsolute(keyFile) || !path.isAbsolute(repoRoot))fail();
 const parent=path.dirname(keyFile),real=await fs.realpath(parent),root=await fs.realpath(repoRoot);
 const stat=await fs.lstat(parent);
 if(real!==parent || !stat.isDirectory() || stat.isSymbolicLink() || (stat.mode&0o077)!==0
  || keyFile===root || keyFile.startsWith(root+path.sep))fail();
 // Only names/digests from documented CLI listing; never read any existing secret value.
 const metadata=JSON.parse(await runCli(cli,['secrets','list','--project-ref',project,'--output','json','--log-level','error']));
 if(!Array.isArray(metadata) || metadata.some(row=>!row || typeof row.name!=='string' || row.name===name))fail();
 const key=randomBytes(32).toString('hex');
 const file=await fs.open(keyFile,'wx',0o600);
 try{await file.writeFile(key+'\n');await file.sync();}finally{await file.close();}
 const directory=await fs.open(parent,'r');try{await directory.sync();}finally{await directory.close();}
 // Preserve new offline key if upload outcome is unknown. No retry, deletion or rotation.
 await runCli(cli,['secrets','set','--project-ref',project,'--env-file','/dev/stdin','--log-level','error'],`${name}=${key}\n`);
 return {ok:true,secretName:name,controlProject:project,privateHROpen:false};
}
if(process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 try{
  if(process.argv.length!==4 || process.argv[2]!=='--new-key-file')fail();
  const result=await provisionSigningKey({keyFile:process.argv[3]});console.log(JSON.stringify(result));
 }catch{console.error(JSON.stringify({ok:false,code:'signing_key_provisioning_stopped',automaticRetry:false}));process.exitCode=1;}
}
