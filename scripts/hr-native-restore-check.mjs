// Native Supabase containers, cold physical PostgreSQL/Auth and Storage volumes.
// All data is synthetic. Company/profile substrate is explicitly a test fixture.
// This is NOT managed-cloud PITR, H5b ack integration or a Production anchor.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {randomUUID,randomBytes,createHash} from 'node:crypto';
import {initializeLedger,readLedger,mergeSnapshot,reconcileSql} from './lib/hr-deletion-ledger.mjs';
import {createHrFileAccess} from '../supabase/functions/_shared/hr-file-access.mjs';

const cli=process.env.HR_NATIVE_CLI||'supabase';
const project='hrnativerestoreqaaaa'; // isolated synthetic logical identity; no cloud project reference
const stack='hr-native-'+randomBytes(6).toString('hex');
const root=await fs.mkdtemp(path.join(os.tmpdir(),'hr-native-restore-'));
await fs.chmod(root,0o700);
const ledger=path.join(root,'independent-ledger'),snapshots=path.join(root,'snapshots');
await fs.mkdir(snapshots,{mode:0o700});
await fs.mkdir(ledger,{mode:0o700});
const signingKey=randomBytes(32).toString('hex'),workerToken=randomBytes(32).toString('hex');
let failedCheck=null;
let phase='preflight',assertions=0,started=false,containers=[],dbContainer,image,api,anon,service;
const check=(ok,label)=>{if(!ok)failedCheck=label;assert(ok,label);assertions++;};
const stage=value=>{phase=value;console.log(JSON.stringify({mode:'ISOLATED_NATIVE_QA',stage:phase}));};
// Never emit CLI status, SQL, Auth responses, Docker environment or stderr.
function command(binary,args,input,timeout=60000){
 try{return execFileSync(binary,args,{input,encoding:'utf8',stdio:['pipe','pipe','pipe'],timeout,maxBuffer:16*1024*1024});}
 catch(e){const state=String(e.stderr||'').match(/(?:ERROR|FATAL):\s+([0-9A-Z]{5})\b/);throw Error(state?'native_sqlstate_'+state[1]:'native_command_failed');}
}
const docker=(args,input)=>command('docker',args,input);
const supabase=args=>command(cli,[...args,'--workdir',root,'--log-level','none'],undefined,480000);
const quote=v=>"'"+String(v).replaceAll("'","''")+"'";
const sql=text=>docker(['exec','-i',dbContainer,'psql','-U','postgres','-d','postgres','-X','-q','-t','-A','-v','ON_ERROR_STOP=1','-v','VERBOSITY=sqlstate'],text);
const scalar=text=>JSON.parse(sql(`select row_to_json(q) from (${text}) q;`).trim()).value;
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const inspect=name=>JSON.parse(docker(['inspect',name]))[0];
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function dbReady(){
 for(let i=0;i<60;i++){try{if(sql('select 1;').trim()==='1')return;}catch{}await wait(1000);}throw Error('database_not_ready');
}
async function apiReady(){
 for(let i=0;i<60;i++){try{if((await fetch(api+'/auth/v1/health',{signal:AbortSignal.timeout(2000)})).ok)return;}catch{}await wait(1000);}throw Error('auth_not_ready');
}
async function request(route,{method='GET',body,bearer=service,key=service,headers={}}={}){
 check(new URL(api).origin==='http://127.0.0.1:54321','loopback origin only');
 return fetch(api+route,{method,headers:{apikey:key,authorization:'Bearer '+bearer,...(body!==undefined?{'content-type':'application/json'}:{}),...headers},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
}
async function rpc(name,args,bearer=service){
 const r=await request('/rest/v1/rpc/'+name,{method:'POST',body:args,bearer,key:bearer===service?service:anon});
 if(!r.ok)throw Error('native_rpc_rejected_'+r.status);return r.json();
}
async function login(user){
 const r=await request('/auth/v1/token?grant_type=password',{method:'POST',key:anon,bearer:anon,body:{email:user.email,password:user.password}});
 check(r.ok,'native password login succeeds');const value=await r.json();
 check(value.user?.id===user.id&&typeof value.access_token==='string','native Auth identity matches');return value.access_token;
}
async function upload(object,bytes){
 const r=await fetch(api+'/storage/v1/object/hr-private/'+object,{method:'POST',headers:{apikey:service,authorization:'Bearer '+service,'content-type':'application/pdf','x-upsert':'true'},body:bytes,signal:AbortSignal.timeout(15000)});
 check(r.ok,'native Storage writes bytes');
}
const storage={
 download:object=>request('/storage/v1/object/authenticated/hr-private/'+object),
 remove:async object=>{const r=await request('/storage/v1/object/hr-private',{method:'DELETE',body:{prefixes:[object]}});check(r.ok,'native Storage deletes bytes');},
 missing:async object=>{
  const r=await storage.download(object);
  if(r.ok)return false;
  check([400,404].includes(r.status),'missing response is bounded');
  const error=await r.json();check(['not_found','NoSuchKey','404'].includes(String(error.error||error.code||error.statusCode))||error.message==='Object not found','actual missing object response');return true;
 }
};
function volumes(){
 const mounts=[inspect(dbContainer).Mounts.find(m=>m.Type==='volume'&&m.Destination==='/var/lib/postgresql/data'),inspect('supabase_storage_'+stack).Mounts.find(m=>m.Type==='volume'&&m.Destination==='/mnt')];
 check(mounts.every((m,i)=>m&&m.Name===(i===0?'supabase_db_':'supabase_storage_')+stack),'exact own database/storage volumes');
 return mounts.map((m,i)=>({name:m.Name,file:i===0?'database.tgz':'storage.tgz'}));
}
function snapshotVolume(v,restore=false){
 check(containers.every(c=>inspect(c).State.Running===false),'all own containers stopped for cold snapshot');
 const script=restore?'find /data -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +; tar -xzpf /snapshot/'+v.file+' -C /data':'tar -czpf /snapshot/'+v.file+' -C /data .';
 // Mounted names come only from inspected containers of this unique local stack.
 docker(['run','--rm','--network','none','--user','0','--entrypoint','sh','--mount',`type=volume,src=${v.name},dst=/data${restore?'':',readonly'}`,'--mount',`type=bind,src=${snapshots},dst=/snapshot`,image,'-ec',script]);
}
async function resume(quarantine=false){
 docker(['start',dbContainer]);await dbReady();
 if(quarantine){
  check(scalar('select content_enabled and not restore_quarantined as value from hr_private.runtime_state')===true,'old database really restores unsafe flag');
  sql('update hr_private.runtime_state set content_enabled=false,restore_quarantined=true;');
 }
 docker(['start',...containers.filter(c=>c!==dbContainer)]);await apiReady();
}
try{
 check(command(cli,['--version']).trim()==='2.120.0','pinned CLI');
 docker(['info','--format','{{.ServerVersion}}']);
 supabase(['init']);
 const configPath=path.join(root,'supabase','config.toml');
 let config=await fs.readFile(configPath,'utf8');
 config=config.replace(/^project_id\s*=.*$/m,`project_id = "${stack}"`).replace(/^major_version\s*=.*$/m,'major_version = 17');
 await fs.writeFile(configPath,config,{mode:0o600});
 stage('native_stack_start');started=true;
 supabase(['start','--exclude','studio,postgres-meta,imgproxy,realtime,edge-runtime,logflare,vector,supavisor']);
 // Capture test-only generated local credentials in memory; do not print/persist status.
 const status=JSON.parse(supabase(['status','--output','json']));
 api=status.API_URL;anon=status.ANON_KEY;service=status.SERVICE_ROLE_KEY;
 check(api==='http://127.0.0.1:54321'&&!!anon&&!!service,'local credentials and exact loopback API');
 dbContainer='supabase_db_'+stack;
 containers=docker(['ps','--format','{{.Names}}']).trim().split('\n').filter(n=>n.endsWith('_'+stack));
 check(containers.includes(dbContainer)&&containers.includes('supabase_auth_'+stack)&&containers.includes('supabase_storage_'+stack),'native required services running');
 check(containers.every(n=>/^supabase_[a-z0-9_-]+$/.test(n)),'bounded own container names');
 image=inspect(dbContainer).Image;check(/^sha256:[0-9a-f]{64}$/.test(image),'exact local image ID');
 const images=containers.map(c=>({service:c.slice(0,-stack.length-1),image:inspect(c).Image}));
 stage('native_auth_and_hr_fixture');
 sql(await fs.readFile('scripts/fixtures/hr-native-company.sql','utf8'));
 for(const file of ['20261009182551_hr_access_foundation.sql','20261009193953_hr_content_purge_foundation.sql','20261009203431_people_module_entitlements.sql','20261009203950_people_module_access_closure.sql','20261009211209_hr_restore_reconcile_orphans.sql']){stage('load_'+file);sql(await fs.readFile('supabase/migrations/'+file,'utf8'));}
 sql("notify pgrst,'reload schema';");
 stage('native_auth_users');
 const users=[];
 for(const role of ['firmaadmin','ansatt','ansatt','ansatt']){
  const user={email:randomUUID()+'@example.invalid',password:randomBytes(32).toString('hex'),role};
  const r=await request('/auth/v1/admin/users',{method:'POST',body:{email:user.email,password:user.password,email_confirm:true}});
  check(r.ok,'native Auth admin creates synthetic identity');user.id=(await r.json()).id;
  check(/^[0-9a-f-]{36}$/.test(user.id),'native generated user UUID');user.jwt=await login(user);users.push(user);
 }
 const [admin,user,other,outsider]=users,c=randomUUID(),otherCompany=randomUUID(),employee=randomUUID(),retained=randomUUID();
 sql(`insert into public.sales_company_scopes values(${quote(c)}),(${quote(otherCompany)});`);
 for(const u of users){const company=u===outsider?otherCompany:c;sql(`insert into public.profiles values(${quote(u.id)},${quote(u.email)},true,false,${quote(u.role)},null);insert into public.sales_company_memberships values(${quote(company)},${quote(u.id)},${quote(u.role)});insert into hr_private.module_access(company_id,user_id,enabled) values(${quote(company)},${quote(u.id)},true);`);}
 sql(`insert into public.company_module_access(company_id,module_key,enabled) values(${quote(c)},'hr',true),(${quote(otherCompany)},'hr',true);insert into hr_private.firms values(${quote(c)},true,'Synthetic purpose','Synthetic legal basis',current_date+30,1);insert into hr_private.employees(id,company_id,user_id,leader_id) values(${quote(employee)},${quote(c)},${quote(user.id)},${quote(admin.id)}),(${quote(retained)},${quote(c)},${quote(other.id)},${quote(admin.id)});insert into hr_private.readers(company_id,employee_id,user_id,granted_by,reason) values(${quote(c)},${quote(employee)},${quote(other.id)},${quote(admin.id)},'Synthetic reader reason');update hr_private.runtime_state set content_enabled=true,restore_quarantined=false;update hr_private.purge_worker_settings set enabled=true;select vault.update_secret(secret_id,${quote(workerToken)}) from hr_private.purge_worker_settings;`);
 stage('native_files_and_access');
 const files=[];
 for(const kind of ['content','version','draft','search','export']){
  const aid=randomUUID();sql(`insert into hr_private.artifacts values(${quote(aid)},${quote(c)},${quote(employee)},1,${quote(kind)},'{"synthetic":true}',current_date+30);`);
  if(['content','export'].includes(kind)){
   const fid=randomUUID(),bytes=Buffer.from('SYNTHETIC private '+kind),object=`${c}/${employee}/${fid}`;
   sql(`insert into hr_private.files(id,company_id,employee_id,artifact_id,employee_revision,size_bytes,mime_type,sha256) values(${quote(fid)},${quote(c)},${quote(employee)},${quote(aid)},1,${bytes.length},'application/pdf',${quote(hash(bytes))});`);
   await upload(object,bytes);files.push({fid,object,hash:hash(bytes)});
  }
 }
 const orphan=`${c}/${employee}/${randomUUID()}`,keep=`${c}/${retained}/${randomUUID()}`,keepBytes=Buffer.from('SYNTHETIC retained');
 await upload(orphan,Buffer.from('SYNTHETIC orphan'));await upload(keep,keepBytes);
 check((await request('/rest/v1/rpc/hr_file_authorize',{method:'POST',body:{p_company_id:c,p_file_id:files[0].fid},bearer:user.jwt,key:anon})).ok,'actual user HR file grant before closure');
 check(!(await request('/rest/v1/rpc/hr_file_authorize',{method:'POST',body:{p_company_id:c,p_file_id:files[0].fid},bearer:outsider.jwt,key:anon})).ok,'actual cross-company user rejected');
 check(!(await request('/storage/v1/object/authenticated/hr-private/'+files[0].object,{bearer:user.jwt,key:anon})).ok,'actual user cannot bypass file endpoint through Storage');
 check(!(await fetch(api+'/storage/v1/object/public/hr-private/'+files[0].object)).ok,'native private bucket rejects anonymous read');
 check(!(await request('/rest/v1/rpc/hr_purge_worker_reserve',{method:'POST',body:{},bearer:user.jwt,key:anon})).ok,'actual user cannot reserve worker job');
 stage('independent_test_ledger_initialize');
 await initializeLedger(ledger,project,signingKey);
 stage('native_volume_identity');
 const mounts=volumes();
 stage('cold_physical_database_auth_storage_backup');
 docker(['stop',...containers.filter(c=>c!==dbContainer)]);docker(['stop',dbContainer]);for(const v of mounts)snapshotVolume(v);
 for(const v of mounts)check((await fs.stat(path.join(snapshots,v.file))).size>0,'physical snapshot exists');
 await resume();
 stage('source_closure_and_actual_byte_purge');
 const closure=await rpc('hr_employee_command',{p_company_id:c,p_action:'end',p_payload:{id:employee,revision:1,confirm:'END_AND_DELETE'}},admin.jwt);
 check(closure.deleted===false&&closure.purge_state==='pending','source closure waits for bytes');
 const receipts=JSON.parse(sql("select coalesce(json_agg(q),'[]') from (select id,company_id,employee_id,user_id,kind,through_revision,requested_at from hr_private.purge_receipts order by id) q;").trim());
 await mergeSnapshot(ledger,{format:1,project,receipts},signingKey,0);
 const worker=createHrFileAccess({workerRpc:(name,args)=>rpc(name,args),storage,verifyTransport:async()=>{
  const r=await storage.download(keep);return r.ok&&hash(Buffer.from(await r.arrayBuffer()))===hash(keepBytes);
 }});
 const runWorker=async()=>{
  const r=await worker(new Request('http://127.0.0.1/purge',{method:'POST',headers:{'x-hr-purge-token':workerToken},body:'{}'}));
  check(r.status===200,'actual production worker module succeeds against native RPC and Storage');const report=await r.json();check(report.retry===0,'no hidden worker retries');return report;
 };
 check((await runWorker()).removed===3,'source purges both registrations and orphan');
 for(const object of [...files.map(f=>f.object),orphan])check(await storage.missing(object),'source file bytes absent');
 check(scalar(`select count(*)::int as value from hr_private.artifacts where employee_id=${quote(employee)}`)===0,'source five families deleted');
 // Remove the native Auth user AFTER closure/backup, without SQL deletion or token forgery.
 check((await request('/auth/v1/admin/users/'+user.id,{method:'DELETE'})).ok,'source native Auth identity deleted');
 check(!(await request('/auth/v1/token?grant_type=password',{method:'POST',key:anon,bearer:anon,body:{email:user.email,password:user.password}})).ok,'source deleted identity cannot sign in');
 stage('cold_physical_restore_quarantine_before_api');
 docker(['stop',...containers.filter(c=>c!==dbContainer)]);docker(['stop',dbContainer]);for(const v of mounts)snapshotVolume(v,true);
 await resume(true);
 check(scalar(`select count(*)::int as value from hr_private.artifacts where employee_id=${quote(employee)}`)===5,'restored five content families');
 check(scalar(`select count(*)::int as value from hr_private.files where employee_id=${quote(employee)}`)===2,'restored two registrations');
 check(scalar('select count(*)::int as value from hr_private.purge_receipts')===0,'old backup lacks later receipts');
 user.jwt=await login(user);admin.jwt=await login(admin);other.jwt=await login(other);outsider.jwt=await login(outsider);
 check((await request('/auth/v1/user',{bearer:user.jwt,key:anon})).ok,'restored real Auth session validated by native Auth');
 for(const f of files){const r=await storage.download(f.object);check(r.ok&&hash(Buffer.from(await r.arrayBuffer()))===f.hash,'restored physical file has original byte hash');}
 check((await readLedger(ledger,project,signingKey)).receipts.length===1,'independent ledger survives both volume restores');
 const closed=createHrFileAccess({authenticate:async authorization=>{
  const r=await request('/auth/v1/user',{bearer:authorization.slice(7),key:anon});if(!r.ok)throw Error('denied');return (await r.json()).id;
 },userRpc:async()=>{throw Error('closed_gate_must_not_read_db');}});
 check((await closed(new Request('http://127.0.0.1/file',{method:'POST',headers:{authorization:'Bearer '+user.jwt},body:'{}'}))).status===423,'independent file Edge gate denies actual restored user');
 check(!(await request('/rest/v1/rpc/hr_file_authorize',{method:'POST',body:{p_company_id:c,p_file_id:files[0].fid},bearer:user.jwt,key:anon})).ok,'quarantined DB rejects actual restored file grant');
 stage('independent_ledger_replay_and_native_file_purge');
 sql(reconcileSql(await readLedger(ledger,project,signingKey)));
 for(const table of ['employees','readers','artifacts','files'])check(scalar(`select count(*)::int as value from hr_private.${table} where ${table==='employees'?'id':'employee_id'}=${quote(employee)}`)===0,'replay removes restored '+table);
 check(scalar(`select count(*)::int as value from hr_private.module_access where user_id=${quote(user.id)}`)===0,'replay removes departed module access');
 check(scalar('select count(*)::int as value from hr_private.purge_objects')===3,'replay queues both registered paths and orphan');
 check((await runWorker()).removed===3,'restored physical bytes purged through native Storage API');
 for(const object of [...files.map(f=>f.object),orphan])check(await storage.missing(object),'restored deleted byte paths absent');
 const retainedResponse=await storage.download(keep);check(retainedResponse.ok&&hash(Buffer.from(await retainedResponse.arrayBuffer()))===hash(keepBytes),'unrelated employee bytes unchanged');
 check(scalar(`select state='complete' as value from hr_private.purge_receipts where id=${quote(employee)}`),'complete only after physical bytes removed');
 check((await rpc('hr_employee_get',{p_company_id:c,p_employee_id:retained},other.jwt)).employee.id===retained,'unrelated actual employee access preserved');
 for(const actor of [admin,user,other,outsider])check(!(await request('/rest/v1/rpc/hr_employee_get',{method:'POST',body:{p_company_id:c,p_employee_id:employee},bearer:actor.jwt,key:anon})).ok,'departed employee inaccessible to actual actor');
 stage('file_only_restore_regression');
 await upload(orphan,Buffer.from('SYNTHETIC returned orphan'));
 sql(reconcileSql(await readLedger(ledger,project,signingKey)));
 check(scalar('select count(*)::int as value from hr_private.purge_objects')===1,'file-only return queues new deletion');
 check(scalar(`select state='pending' as value from hr_private.purge_receipts where id=${quote(employee)}`),'file-only return never falsely complete');
 check((await runWorker()).removed===1&&await storage.missing(orphan),'returned file physically deleted');
 sql(reconcileSql(await readLedger(ledger,project,signingKey)));
 check(scalar('select count(*)::int as value from hr_private.purge_objects')===0,'empty replay idempotent');
 check(scalar('select not content_enabled and restore_quarantined as value from hr_private.runtime_state'),'private content stays quarantined');
 console.log(JSON.stringify({ok:true,mode:'ISOLATED_NATIVE_QA',assertions,cli:'2.120.0',images,physicalDatabaseAuthRestore:true,storageByteRestore:true,actualAuthUsers:4,restoredFamilies:5,restoredRegisteredFiles:2,deletedPaths:3,unrelatedEmployeePreserved:true,companyProfileFixture:true,productionAnchor:false,databaseAck:false,managedCloudRestore:false}));
}catch(e){
 const code=/^native_(?:sqlstate_[0-9A-Z]{5}|rpc_rejected_[0-9]{3}|command_failed)$/.test(e.message)?e.message:'native_check_failed';
 console.error(JSON.stringify({ok:false,mode:'ISOLATED_NATIVE_QA',stage:phase,code,failedCheck,assertions,productionAnchor:false,databaseAck:false,managedCloudRestore:false}));process.exitCode=1;
}finally{
 stage('cleanup');
 if(started){try{supabase(['stop','--project-id',stack,'--no-backup']);}catch{console.error(JSON.stringify({ok:false,code:'isolated_cleanup_failed'}));process.exitCode=1;}}
 await fs.rm(root,{recursive:true,force:true});
}
