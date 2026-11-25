// Physical PostgreSQL/PGlite datadir + actual local file-byte restore.
// No cloud connection. Local Auth/Storage/Vault adapters are explicitly synthetic.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createServer} from 'node:http';
import {randomUUID,randomBytes,createHash} from 'node:crypto';
import {initializeLedger,readLedger,mergeSnapshot,reconcileSql} from './lib/hr-deletion-ledger.mjs';
import {createHrFileAccess} from '../supabase/functions/_shared/hr-file-access.mjs';
const {PGlite}=await import(process.env.HR_PGLITE_PATH ? pathToFileURL(process.env.HR_PGLITE_PATH).href : '@electric-sql/pglite');
const root=await fs.mkdtemp(path.join(os.tmpdir(),'hr-physical-restore-'));
const project='ppvircenkjizeiqdxphj',key=randomBytes(32).toString('hex'),token=randomBytes(32).toString('hex');
const ledger=path.join(root,'independent-ledger'),live=path.join(root,'source-files'),backupFiles=path.join(root,'backup-files'),restoredFiles=path.join(root,'restored-files');
for(const dir of [ledger,live,backupFiles,restoredFiles])await fs.mkdir(dir,{mode:0o700});
let db,restored,server,activeDb,fileRoot;
let assertions=0;
const check=(value,label)=>{assert(value,label);assertions++;};
const scalar=async(sql,args=[])=>Object.values((await activeDb.query(sql,args)).rows[0])[0];
const read=async file=>fs.readFile(file,'utf8');
const load=async name=>activeDb.exec(await read('supabase/migrations/'+name));
const rpc=async(name,args)=>{
 const names={hr_purge_worker_authorize:['p_token'],hr_purge_worker_reserve:[],hr_purge_worker_finish:['p_id','p_attempt','p_removed']};
 return scalar(`select public.${name}(${names[name].map((_,i)=>'$'+(i+1)).join(',')})`,names[name].map(k=>args[k]));
};
const httpCall=async(method,object,body)=>fetch(`http://127.0.0.1:${server.address().port}/${object}`,{method,headers:{authorization:'Bearer '+token},body});
const storage={
 download:object=>httpCall('GET',object),
 remove:async object=>{check((await httpCall('DELETE',object)).ok,'byte API delete succeeds');},
 missing:async object=>(await httpCall('GET',object)).status===404
};
try {
 db=await PGlite.create({dataDir:path.join(root,'source-db')});activeDb=db;fileRoot=live;
 await db.exec(await read('scripts/fixtures/hr-restore-platform.sql'));
 for(const name of ['20261009182551_hr_access_foundation.sql','20261009193953_hr_content_purge_foundation.sql','20261009203431_people_module_entitlements.sql','20261009203950_people_module_access_closure.sql','20261009211209_hr_restore_reconcile_orphans.sql'])await load(name);
 const c=randomUUID(),admin=randomUUID(),user=randomUUID(),other=randomUUID(),employee=randomUUID(),retained=randomUUID();
 await db.query('insert into public.sales_company_scopes values($1)',[c]);
 for(const [u,role] of [[admin,'firmaadmin'],[user,'ansatt'],[other,'ansatt']]){
  await db.query('insert into auth.users values($1)',[u]);
  await db.query('insert into public.profiles values($1,$2,true,false,$3,null)',[u,'synthetic@example.invalid',role]);
  await db.query('insert into public.sales_company_memberships values($1,$2,$3)',[c,u,role]);
  await db.query('insert into hr_private.module_access(company_id,user_id,enabled) values($1,$2,true)',[c,u]);
 }
 await db.query("insert into public.company_module_access(company_id,module_key,enabled) values($1,'hr',true)",[c]);
 await db.query("select set_config('request.jwt.claim.sub',$1,false),set_config('hr.fixture.company',$2,false)",[admin,c]);
 await db.query("insert into hr_private.firms values($1,true,'Synthetic purpose','Synthetic legal basis',current_date+30,1)",[c]);
 await db.query('insert into hr_private.employees(id,company_id,user_id,leader_id) values($1,$2,$3,$4),($5,$2,$6,$4)',[employee,c,user,admin,retained,other]);
 await db.query("insert into hr_private.readers(company_id,employee_id,user_id,granted_by,reason) values($1,$2,$3,$4,'Synthetic reader reason')",[c,employee,other,admin]);
 await db.exec('update hr_private.runtime_state set content_enabled=true,restore_quarantined=false; update hr_private.purge_worker_settings set enabled=true;');
 await db.query('update vault.decrypted_secrets set decrypted_secret=$1',[token]);
 // A private LOCAL HTTP byte service; storage metadata mutation occurs only here.
 server=createServer(async(req,res)=>{
  try{
   if(req.headers.authorization!=='Bearer '+token){res.writeHead(403);res.end();return;}
   const object=req.url.slice(1);
   if(!/^[a-f0-9-]{36}\/[a-f0-9-]{36}\/[a-f0-9-]{36}$/.test(object)){res.writeHead(400);res.end();return;}
   const file=path.join(fileRoot,object);
   if(req.method==='PUT'){
    const parts=[];for await(const part of req)parts.push(part);
    await fs.mkdir(path.dirname(file),{recursive:true,mode:0o700});await fs.writeFile(file,Buffer.concat(parts),{mode:0o600});
    await activeDb.query("insert into storage.objects values('hr-private',$1) on conflict do nothing",[object]);
    res.end('ok');
   } else if(req.method==='DELETE'){
    await fs.unlink(file).catch(e=>{if(e.code!=='ENOENT')throw e;});
    await activeDb.query("delete from storage.objects where bucket_id='hr-private' and name=$1",[object]);res.end('ok');
   } else {const bytes=await fs.readFile(file);res.end(bytes);}
  }catch(e){res.writeHead(e.code==='ENOENT'?404:500);res.end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const files=[];
 for(const kind of ['content','version','draft','search','export']){
  const aid=randomUUID();await db.query('insert into hr_private.artifacts values($1,$2,$3,1,$4,$5,current_date+30)',[aid,c,employee,kind,{synthetic:kind}]);
  if(['content','export'].includes(kind)){
   const fid=randomUUID(),bytes=Buffer.from('SYNTHETIC private '+kind),hash=createHash('sha256').update(bytes).digest('hex'),object=`${c}/${employee}/${fid}`;
   await db.query('insert into hr_private.files(id,company_id,employee_id,artifact_id,employee_revision,size_bytes,mime_type,sha256) values($1,$2,$3,$4,1,$5,$6,$7)',[fid,c,employee,aid,bytes.length,'application/pdf',hash]);
   check((await httpCall('PUT',object,bytes)).ok,'actual synthetic bytes stored');files.push({object,bytes,hash});
  }
 }
 const orphan=`${c}/${employee}/${randomUUID()}`,keep=`${c}/${retained}/${randomUUID()}`;
 await httpCall('PUT',orphan,Buffer.from('SYNTHETIC orphan'));await httpCall('PUT',keep,Buffer.from('SYNTHETIC retained'));
 check((await fetch(`http://127.0.0.1:${server.address().port}/${files[0].object}`)).status===403,'local private byte endpoint denies anonymous');
 await initializeLedger(ledger,project,key);
 // Actual complete datadir backup, not copied rows or a rollback simulation.
 const dump=await db.dumpDataDir('gzip'),dumpFile=path.join(root,'database-backup.tgz');
 await fs.writeFile(dumpFile,new Uint8Array(await dump.arrayBuffer()));await fs.cp(live,backupFiles,{recursive:true});
 check((await fs.stat(dumpFile)).size>0,'physical PostgreSQL backup exists');
 const closure=await scalar("select public.hr_employee_command($1,'end',$2::jsonb)",[c,{id:employee,revision:1,confirm:'END_AND_DELETE'}]);
 check(closure.deleted===false&&closure.purge_state==='pending','closure waits for actual bytes');
 const receipts=(await db.query('select id,company_id,employee_id,user_id,kind,through_revision,requested_at from hr_private.purge_receipts order by id')).rows.map(row=>({...row,requested_at:new Date(row.requested_at).toISOString()}));
 await mergeSnapshot(ledger,{format:1,project,receipts},key,0);
 const worker=createHrFileAccess({workerRpc:rpc,storage,verifyTransport:async()=>true});
 const request=()=>new Request('https://synthetic.invalid/purge',{method:'POST',headers:{'x-hr-purge-token':token},body:'{}'});
 check((await worker(request())).status===200,'source actual worker finishes');
 check(await scalar('select count(*)::int from hr_private.artifacts where employee_id=$1',[employee])===0,'all five source content families deleted');
 check(await storage.missing(orphan),'source orphan bytes deleted');
 await db.close();db=null;
 restored=await PGlite.create({dataDir:path.join(root,'restored-db'),loadDataDir:new Blob([await fs.readFile(dumpFile)])});
 activeDb=restored;fileRoot=restoredFiles;await fs.cp(backupFiles,restoredFiles,{recursive:true});
 check(await scalar('select count(*)::int from hr_private.artifacts where employee_id=$1',[employee])===5,'backup really restores all five old families');
 check(await scalar('select count(*)::int from hr_private.files where employee_id=$1',[employee])===2,'backup restores both file registrations');
 check(await scalar('select count(*)::int from hr_private.purge_receipts')===0,'old backup lacks later deletion receipts');
 for(const f of files)check(createHash('sha256').update(Buffer.from(await (await storage.download(f.object)).arrayBuffer())).digest('hex')===f.hash,'restored bytes have original hash');
 check((await readLedger(ledger,project,key)).receipts.length===1,'independent durable ledger survives database/file restore');
 const closed=createHrFileAccess({authenticate:async()=>user,userRpc:async()=>{throw Error('must not reach restored database');}});
 check((await closed(new Request('https://synthetic.invalid/file',{method:'POST',headers:{authorization:'Bearer synthetic'}}))).status===423,'independent Edge gate stays closed despite restored true DB flag');
 await restored.exec(reconcileSql(await readLedger(ledger,project,key)));
 check(await scalar('select count(*)::int from hr_private.employees where id=$1',[employee])===0,'restored employee purged');
 check(await scalar('select count(*)::int from hr_private.readers where employee_id=$1',[employee])===0,'restored grants purged');
 check(await scalar('select count(*)::int from hr_private.module_access where user_id=$1',[user])===0,'restored module grant purged');
 check(await scalar('select count(*)::int from hr_private.artifacts where employee_id=$1',[employee])===0,'restored content purged');
 check(await scalar('select count(*)::int from hr_private.files where employee_id=$1',[employee])===0,'restored file registrations purged');
 check(await scalar('select count(*)::int from hr_private.purge_objects')===3,'all restored byte paths queued including orphan');
 check((await worker(request())).status===200,'restored worker finishes actual byte deletes');
 for(const object of [...files.map(f=>f.object),orphan])check(await storage.missing(object),'restored deleted bytes absent');
 check(!(await storage.missing(keep)),'unrelated employee bytes retained');
 check(await scalar("select state='complete' from hr_private.purge_receipts where id=$1",[employee]),'complete only after bytes absent');
 // File-only restoration after registry deletion is the H4 regression.
 await httpCall('PUT',orphan,Buffer.from('SYNTHETIC orphan restored again'));
 await restored.exec(reconcileSql(await readLedger(ledger,project,key)));
 check(await scalar('select count(*)::int from hr_private.purge_objects')===1,'missing employee still queues returned bytes');
 check(await scalar("select state='pending' from hr_private.purge_receipts where id=$1",[employee]),'missing employee does not falsely report complete');
 await worker(request());check(await storage.missing(orphan),'file-only replay actually deletes bytes');
 await restored.exec(reconcileSql(await readLedger(ledger,project,key)));
 check(await scalar('select count(*)::int from hr_private.purge_objects')===0,'replay without bytes is idempotent');
 check(await scalar('select not content_enabled and restore_quarantined from hr_private.runtime_state'),'content quarantined at completion');
 const version=await scalar('select version()');
 console.log(JSON.stringify({result:'PASS',assertions,postgres:version,backup_bytes:(await fs.stat(dumpFile)).size,restored_families:5,restored_registered_files:2,deleted_byte_paths:3,scope:'isolated PGlite PostgreSQL + local HTTP file adapter; not cloud Supabase restore'}));
} finally {
 if(server)await new Promise(resolve=>server.close(resolve));
 if(db)await db.close();if(restored)await restored.close();await fs.rm(root,{recursive:true,force:true});
}
