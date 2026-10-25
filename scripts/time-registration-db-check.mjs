const CONFLICT_CODE=process.env.QA_RPC_CONFLICT_POLICY==='1'?'PT409':'40001';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {defaultCategories,EXPORT_COLUMNS,payrollCsv} from '../src/modules/time/timeCore.mjs';
const {PGlite}=await import(process.env.HR_PGLITE_PATH||'/workspace/scratch/8cad950ed5ad/hr-release-qa/node_modules/@electric-sql/pglite/dist/index.js');
const db=await PGlite.create();let checks=0;const id=n=>`81000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const [company,foreign,admin,self,leader,reader,outsider,next,project]=[1,2,3,4,5,6,7,8,9].map(id);
const q=v=>"'"+String(v).replaceAll("'","''")+"'";
const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
const sql=async s=>(await db.query(s)).rows;
const rpc=async(name,args=[])=>((await sql(`select public.${name}(${args.map(v=>v===null?'null':q(typeof v==='object'?JSON.stringify(v):v)).join(',')}) v`))[0].v);
const actor=async u=>db.exec(`reset role;select set_config('request.jwt.claim.sub',${q(u)},false);set role authenticated;`);
const reject=async(fn,code)=>{await assert.rejects(fn,e=>e.code===code,code);checks++;};
try{
 // BEGIN deterministic time QA clock
 // This disposable PGlite instance must not inherit the CI runner's DST hour.
 const qaNow=process.env.TIME_QA_NOW||'2026-11-18T12:00:00.000Z';
 assert.equal(new Date(qaNow).toISOString(),qaNow,'QA clock must be a canonical UTC instant');
 await db.query("select set_config('qa.time_now',$1,false)",[qaNow]);
 await db.exec(`create or replace function pg_catalog.now() returns timestamptz language sql stable as $$select current_setting('qa.time_now')::timestamptz$$;`);
 eq((await sql("select to_char(now() at time zone 'UTC','YYYY-MM-DD\"T\"HH24:MI:SS.MS\"Z\"') v"))[0].v,qaNow,'server fixture uses the explicit QA instant');
 // END deterministic time QA clock
 await db.exec(await fs.readFile('scripts/fixtures/hr-restore-platform.sql','utf8'));
 await db.exec(`alter table auth.users add raw_user_meta_data jsonb;alter table public.sales_company_scopes add normalized_name text,add display_name text;alter table storage.buckets add allowed_mime_types text[];alter table storage.objects add metadata jsonb;alter table storage.objects enable row level security;grant select,insert,update,delete on storage.objects to authenticated;
 create table public.user_active_company_scope(user_id uuid primary key,company_id uuid);create or replace function public.current_active_company_scope_id() returns uuid language sql as $$select company_id from public.user_active_company_scope where user_id=auth.uid()$$;
 create table public.projects(id uuid primary key,company_scope_id uuid,user_id uuid,data jsonb);create function public.project_row_access_allowed(c uuid,u uuid) returns boolean language sql as $$select c=public.current_active_company_scope_id()$$;
 grant usage on schema auth,storage to authenticated;grant execute on function auth.uid() to authenticated;`);
 for(const f of ['20261009182551_hr_access_foundation.sql','20261009193953_hr_content_purge_foundation.sql','20261009203431_people_module_entitlements.sql','20261009203950_people_module_access_closure.sql','20261014144538_time_registration.sql','20261014160424_time_timer_existing_rows.sql','20261014161822_time_external_project_reference.sql','20261014165602_time_mobile_shortcut_setting.sql'])await db.exec(await fs.readFile('supabase/migrations/'+f,'utf8'));
 await db.exec(`insert into public.sales_company_scopes values(${q(company)},'qa','QA'),(${q(foreign)},'other','Other');insert into public.company_module_access(company_id,module_key,enabled) values(${q(company)},'hr',true),(${q(foreign)},'hr',true);`);
 for(const u of [admin,self,leader,reader,outsider,next])await db.exec(`insert into auth.users(id,raw_user_meta_data) values(${q(u)},'{}');insert into public.profiles(id,email,approved,deactivated,role) values(${q(u)},'qa-${u}@example.invalid',true,false,'member');insert into public.sales_company_memberships values(${q(company)},${q(u)},${q(u===admin?'firmaadmin':'ansatt')});insert into public.user_active_company_scope values(${q(u)},${q(company)});insert into hr_private.module_access(company_id,user_id,enabled) values(${q(company)},${q(u)},true);`);
 await actor(admin);await rpc('hr_foundation_configure',[company,0,true,'Timekontroll i syntetisk firma','Syntetisk vurdert grunnlag','2027-01-01']);
 const employee=(await rpc('hr_employee_command',[company,'create',{user_id:self,leader_id:leader}])).employee;
 await rpc('hr_employee_command',[company,'create',{user_id:admin,leader_id:leader}]);
 await rpc('hr_employee_command',[company,'reader',{id:employee.id,revision:employee.revision,reader_id:reader,reason:'Syntetisk ekstra lesetilgang'}]);
 await db.exec(`reset role;insert into public.projects values(${q(project)},${q(company)},${q(self)},'{"projectName":"QA prosjekt","projectNumber":"P009"}');update hr_private.runtime_state set content_enabled=true,restore_quarantined=false;`);
 await actor(admin);let settings={enabled:true,categories:defaultCategories(),employee_numbers:{[self]:'004',[admin]:'003'},project_numbers:{},managers:[],deadline_day:0,deadline_time:'12:00',export:{separator:';',decimal:',',date_format:'yyyy-mm-dd',columns:EXPORT_COLUMNS.map(([key,label])=>({key,label}))}};
 settings.categories=settings.categories.map((c,i)=>({...c,payroll_code:'00'+(i+1)}));
 let setup=await rpc('time_setup_save',[company,0,settings]);eq(setup.revision,1,'settings persisted');
 await reject(()=>rpc('time_setup_save',[company,0,settings]),CONFLICT_CODE);
 let bad={...settings,employee_numbers:{[self]:'1',[admin]:'1'}};await reject(()=>rpc('time_setup_save',[company,1,bad]),'22023');
 eq((await rpc('time_tasks_get',[company])).mobile_shortcut,false,'missing shortcut preference defaults off');
 await db.exec('reset role;begin;');await actor(admin);
 const shortcutReject=async(fn,code)=>{await db.exec('savepoint shortcut_negative');try{await reject(fn,code);}finally{await db.exec('rollback to savepoint shortcut_negative;release savepoint shortcut_negative');}};
 for(const value of ['true',1,null])await shortcutReject(()=>rpc('time_setup_save',[company,1,{...settings,mobile_shortcut:value}]),'22023');
 let mobileSetup=await rpc('time_setup_save',[company,1,{...settings,mobile_shortcut:true}]);eq(mobileSetup.content.mobile_shortcut,true,'admin persists company shortcut preference');
 await actor(self);eq((await rpc('time_tasks_get',[company])).mobile_shortcut,true,'enrolled HR employee sees enabled shortcut');await shortcutReject(()=>rpc('time_setup_save',[company,2,{...settings,mobile_shortcut:false}]),'42501');
 await actor(reader);eq((await rpc('time_tasks_get',[company])).mobile_shortcut,false,'HR reader without own employee record has no shortcut');
 await actor(admin);await rpc('time_setup_save',[company,2,{...settings,mobile_shortcut:false}]);await actor(self);eq((await rpc('time_tasks_get',[company])).mobile_shortcut,false,'saved opt-out removes shortcut');
 await actor(admin);await rpc('time_setup_save',[company,3,{...settings,mobile_shortcut:true,enabled:false}]);await actor(self);eq((await rpc('time_tasks_get',[company])).mobile_shortcut,false,'disabled time registration hides opted-in shortcut');
 await db.exec('reset role;rollback;');await actor(admin);
 await actor(self);await reject(()=>rpc('time_setup_get',[company]),'42501');await reject(()=>rpc('time_setup_save',[company,1,settings]),'42501');
 const week='2026-10-12',work=settings.categories[0],internal=settings.categories[1],expense=settings.categories.at(-1);
 let state=await rpc('time_sheet_get',[company,week,null]);eq(state.employee.id,employee.id);eq(state.sheet,null);eq(state.settings.employee_numbers,undefined,'personal settings exclude employee numbers');
 const row={id:id(20),on:week,category_id:work.id,project_id:project,mode:'clock',quantity:'',start:'07:00',end:'15:30',pause:30,next_day:false,note:'QA arbeid',files:[]};
 // BEGIN explicit DST QA scenarios
 // Keep the real server's rejection of nonexistent/ambiguous civil times.
 await db.exec('reset role;begin;');await actor(self);
 for(const [dstWeek,on] of [['2026-03-23','2026-03-29'],['2026-10-19','2026-10-25']]){
  const dstRow={...row,on,start:'02:15',end:'02:45',pause:0};
  await db.exec('savepoint dst_negative');
  await reject(()=>rpc('time_sheet_command',[company,dstWeek,employee.id,0,crypto.randomUUID(),'save',[dstRow],false,'']),'22023');
  await db.exec('rollback to savepoint dst_negative;release savepoint dst_negative');
  const measured=await rpc('time_sheet_command',[company,dstWeek,employee.id,0,crypto.randomUUID(),'save',[{...dstRow,mode:'quantity',quantity:'0.50'}],false,'']);
  eq(measured.sheet.entries[0].quantity,0.5,'explicit measured hours remain available on the DST date');
 }
 await db.exec('reset role;rollback;');await actor(self);
 // END explicit DST QA scenarios
 const command=(action,rows=[row],revision=state.sheet?.revision||0,who=employee.id,op=crypto.randomUUID(),empty=false,note='')=>rpc('time_sheet_command',[company,week,who,revision,op,action,rows,empty,note]);
 // External ERP references require no project row, and preserve exact text in review/history/export.
 await db.exec('reset role;begin;');await actor(self);
 const externalReject=async(fn,code)=>{await db.exec('savepoint external_negative');try{await reject(fn,code);}finally{await db.exec('rollback to savepoint external_negative;release savepoint external_negative');}};
 const externalWeek='2026-11-09',refs=['00458','Solsiden byggetrinn 2','Storgata 12, Oslo'];
 const externalRows=refs.map((ref,n)=>({...row,id:id(180+n),on:externalWeek,project_id:null,external_project:'  '+ref+'  ',mode:'quantity',quantity:'2.50'}));
 let external=await rpc('time_sheet_command',[company,externalWeek,employee.id,0,crypto.randomUUID(),'save',externalRows,false,'']);
 eq(external.sheet.entries.map(r=>r.external_project),refs,'number, name and address accepted and trimmed');eq(external.sheet.entries.map(r=>r.project_number),refs,'export project reference is exact manual text');
 eq(external.sheet.entries.every(r=>r.project_id===null),true,'manual references never create a ProffDok project');
 for(const bad of [{...externalRows[0],project_id:project},{...externalRows[0],external_project:'  '},{...externalRows[0],external_project:'x'.repeat(241)},{...externalRows[0],external_project:{name:'Wrong type'}},{...externalRows[0],external_project:'Invalid\nreference'}])await externalReject(()=>rpc('time_sheet_command',[company,externalWeek,employee.id,external.sheet.revision,crypto.randomUUID(),'save',[bad],false,'']),'22023');
 external=await rpc('time_sheet_command',[company,externalWeek,employee.id,external.sheet.revision,crypto.randomUUID(),'submit',externalRows,false,'']);await actor(leader);
 external=await rpc('time_sheet_command',[company,externalWeek,employee.id,external.sheet.revision,crypto.randomUUID(),'approve',externalRows,false,'']);await actor(admin);
 const externalBatch=await rpc('time_export_create',[company,id(190),externalWeek,'2026-11-15',1]);eq(externalBatch.batch.rows.map(r=>r.project_number),refs,'all three reference types survive actual approved export');
 eq((await rpc('time_history',[company,external.sheet.id])).history[0].snapshot.entries.map(r=>r.external_project),refs,'immutable history retains references');
 eq(payrollCsv(externalBatch.batch).includes('00458'),true,'CSV preserves leading zeros');
 // Timer stop belongs to its real Oslo start week, independently of dated manual-entry fixtures.
 const externalTimerWeek=(await sql("select to_char(date_trunc('week',(now()-interval '2 hours') at time zone 'Europe/Oslo'),'YYYY-MM-DD') v"))[0].v;
 const timerExternal=id(191);let currentAdmin=await rpc('time_sheet_get',[company,externalTimerWeek,null]);
 await rpc('time_sheet_command',[company,externalTimerWeek,currentAdmin.employee.id,0,crypto.randomUUID(),'save',[{...row,on:externalTimerWeek,id:id(192),category_id:internal.id,project_id:null,mode:'quantity',quantity:'1.00'}],false,'']);
 let manualTimer=await rpc('time_timer_command_v2',[company,'start',timerExternal,work.id,null,'ERP tidtaking',0,'00078 – Solsiden']);eq(manualTimer.timer.external_project,'00078 – Solsiden','manual timer starts with required project');
 await db.exec(`reset role;update time_private.timers set started_at=now()-interval '2 hours' where id=${q(timerExternal)};`);await actor(admin);
 await rpc('time_timer_command',[company,'stop',timerExternal]);currentAdmin=await rpc('time_sheet_get',[company,externalTimerWeek,null]);eq(currentAdmin.sheet.entries.find(r=>r.id===timerExternal).project_number,'00078 – Solsiden','legacy stop also keeps external timer reference');
 await db.exec('reset role;');eq((await sql("select has_function_privilege('anon','public.time_timer_command_v2(uuid,text,uuid,uuid,uuid,text,integer,text)','execute') v"))[0].v,false,'no anonymous timer v2');
 await db.exec('rollback;');await actor(self);
 const operation=crypto.randomUUID();state=await command('save',[row],0,employee.id,operation);eq(state.sheet.revision,1);eq(state.sheet.entries[0].quantity,8,'server clock arithmetic');
 eq((await command('save',[row],0,employee.id,operation)).sheet.revision,1,'retry is idempotent');
 await reject(()=>command('save',[{...row,note:'changed'}],0,employee.id,operation),CONFLICT_CODE);await reject(()=>command('save',[row],0),CONFLICT_CODE);
 await reject(()=>command('save',[{...row,project_id:id(99)}]),'42501');await reject(()=>command('save',[{...row,project_id:null}]),'22023');
 await reject(()=>command('save',[{...row,on:'2026-10-19'}]),'22023');await reject(()=>command('save',[{...row,pause:600}]),'22023');await reject(()=>command('save',[{...row,start:'24:00'}]),'22023');
 await reject(()=>command('save',[row,{...row,id:id(21),start:'15:00',end:'17:00',pause:0}]),'22023');
 const night={...row,id:id(21),on:'2026-10-13',start:'22:00',end:'06:00',pause:30,next_day:true};state=await command('save',[row,night]);eq(state.sheet.entries[1].quantity,7.5,'overnight + pause');
 await reject(()=>command('save',[row,night,{...row,id:id(22),on:'2026-10-14',start:'05:00',end:'07:00',pause:0}]),'22023');
 const cost={...row,id:id(30),category_id:expense.id,project_id:null,mode:'quantity',quantity:'349.50',note:'QA kvittering'};
 state=await command('save',[row,cost]);await reject(()=>command('submit',[row,cost]),'22023');
 const fid=id(40);let receipt=await rpc('time_file_begin',[company,state.sheet.id,fid,'QA.png',3,'image/png','a'.repeat(64)]);eq(receipt.file.ready,false);eq(await rpc('time_file_access',[receipt.file.object_path,true]),true);
 await actor(leader);eq(await rpc('time_file_access',[receipt.file.object_path,true]),false);await reject(()=>rpc('time_sheet_get',[company,week,employee.id]),'42501');
 await actor(self);await reject(()=>rpc('time_file_finish',[company,fid]),'22023');
 await db.exec(`reset role;insert into storage.objects(bucket_id,name,metadata) values('time-private',${q(receipt.file.object_path)},'{"size":3,"mimetype":"image/png"}');`);
 await actor(self);receipt=await rpc('time_file_finish',[company,fid]);eq(receipt.file.ready,true);eq(await rpc('time_file_access',[receipt.file.object_path,true]),false,'no overwrite after confirmation');
 cost.files=[fid];state=await command('save',[row,cost]);state=await command('submit',[row,cost]);eq(state.sheet.state,'submitted');
 await reject(()=>command('save',[row]),'22023');await reject(()=>command('approve'),'42501');
 await actor(reader);await reject(()=>rpc('time_sheet_get',[company,week,employee.id]),'42501');eq(await rpc('time_file_access',[receipt.file.object_path,false]),false,'extra HR reader cannot read payroll receipt');
 await actor(outsider);await reject(()=>rpc('time_sheet_get',[company,week,employee.id]),'42501');
 await actor(leader);state=await rpc('time_sheet_get',[company,week,employee.id]);eq(state.sheet.can_review,true);eq(await rpc('time_file_access',[receipt.file.object_path,false]),true);eq((await rpc('time_tasks_get',[company])).review_count,1);
 await reject(()=>command('return',[row,cost],state.sheet.revision,employee.id,crypto.randomUUID(),false,'x'),'22023');state=await command('return',[row,cost],state.sheet.revision,employee.id,crypto.randomUUID(),false,'Kontroller beløpet');eq(state.sheet.state,'returned');
 await actor(self);state=await rpc('time_sheet_get',[company,week,null]);state=await command('submit',[row,cost]);
 await actor(admin);state=await rpc('time_sheet_get',[company,week,employee.id]);state=await command('approve');eq(state.sheet.state,'approved');
 const batchId=id(50);let batch=await rpc('time_export_create',[company,batchId,'2026-10-01','2026-10-14',1]);eq(batch.batch.rows.length,2);eq(batch.batch.rows[0].employee_number,'004');eq(batch.batch.rows[0].payroll_code,'001');
 eq((await rpc('time_export_create',[company,batchId,'2026-10-01','2026-10-14',1])).batch.id,batchId,'same export retry');
 await reject(()=>rpc('time_export_create',[company,id(51),'2026-10-01','2026-10-14',1]),'22023');
 state=await rpc('time_sheet_get',[company,week,employee.id]);eq(state.sheet.export_locked,true);await reject(()=>command('reopen',[row,cost],state.sheet.revision,employee.id,crypto.randomUUID(),false,'Retting av uke'),'22023');
 eq((await rpc('time_export_list',[company])).exports.length,1);eq((await rpc('time_history',[company,state.sheet.id])).history.length,8);
 for(const u of [self,leader,reader,outsider]){await actor(u);await reject(()=>rpc('time_export_get',[company,batchId]),'42501');}
 await db.exec(`reset role;update hr_private.employees set leader_id=${q(next)},revision=revision+1 where id=${q(employee.id)};`);await actor(leader);await reject(()=>rpc('time_sheet_get',[company,week,employee.id]),'42501');
 await actor(next);eq((await rpc('time_sheet_get',[company,week,employee.id])).sheet.id,state.sheet.id,'new leader reads actual saved week');
 await db.exec(`reset role;update public.user_active_company_scope set company_id=${q(foreign)} where user_id=${q(next)};`);await reject(()=>rpc('time_sheet_get',[company,week,employee.id]),'42501');
 await actor(admin);settings={...settings,managers:[reader]};setup=await rpc('time_setup_save',[company,1,settings]);eq(setup.revision,2);await actor(reader);eq((await rpc('time_setup_get',[company])).revision,2,'delegated time responsible setup');
 await reject(()=>rpc('time_setup_save',[company,2,{...settings,managers:[reader,self]}]),'42501');
 // A real server timer survives repeated reads and cannot double-register on stop.
 const timerWeek=(await sql("select to_char(date_trunc('week',(now()-interval '2 hours') at time zone 'Europe/Oslo'),'YYYY-MM-DD') v"))[0].v;
 await actor(admin);const beforeTimer=await rpc('time_sheet_get',[company,timerWeek,null]);await rpc('time_sheet_command',[company,timerWeek,beforeTimer.employee.id,0,crypto.randomUUID(),'save',[{...row,on:timerWeek,id:id(72),category_id:internal.id,project_id:null,mode:'quantity',quantity:'1.25'}],false,'']);const timerId=id(70);let timer=await rpc('time_timer_command',[company,'start',timerId,internal.id,null,'QA tidtaking',0]);eq(timer.timer.id,timerId);
 eq((await rpc('time_timer_get',[company])).timer.id,timerId,'timer survives a fresh server read');
 await reject(()=>rpc('time_timer_command',[company,'start',id(71),internal.id,null,'',0]),'22023');
 await db.exec(`reset role;update time_private.timers set started_at=now()-interval '2 hours' where id=${q(timerId)};`);await actor(admin);
 timer=await rpc('time_timer_command',[company,'stop',timerId,null,null,'',15]);eq(timer.timer,null,'stop saves and clears server timer');
 eq((await rpc('time_timer_command',[company,'stop',timerId,null,null,'',15])).timer,null,'stop retry cannot duplicate line');
 eq((await rpc('time_sheet_get',[company,timerWeek,null])).sheet.entries.filter(r=>r.id===timerId).length,1);eq((await rpc('time_sheet_get',[company,timerWeek,null])).sheet.entries.length,2,'stopping timer preserves an existing saved line and its server snapshots');
 // Measure a representative 10-line week including each save, approval and immutable export.
 await db.exec('reset role;begin;');await actor(self);const sizedWeek='2026-11-02';let sized=null;const sizedRows=[];
 for(let n=0;n<10;n++){sizedRows.push({...row,id:id(100+n),on:'2026-11-0'+(2+Math.floor(n/2)),category_id:internal.id,project_id:null,mode:'quantity',quantity:'3.75',note:'Montering og kontroll på syntetisk prosjekt '+n});sized=await rpc('time_sheet_command',[company,sizedWeek,employee.id,sized?.sheet.revision||0,crypto.randomUUID(),'save',sizedRows,false,'']);}
 sized=await rpc('time_sheet_command',[company,sizedWeek,employee.id,sized.sheet.revision,crypto.randomUUID(),'submit',sizedRows,false,'']);await actor(admin);
 sized=await rpc('time_sheet_command',[company,sizedWeek,employee.id,sized.sheet.revision,crypto.randomUUID(),'approve',sizedRows,false,'']);
 await rpc('time_export_create',[company,id(150),sizedWeek,'2026-11-08',2]);await db.exec('reset role;');
 const measure=(await sql(`select (select sum(pg_column_size(t)) from time_private.sheets t where id=${q(sized.sheet.id)})+(select sum(pg_column_size(t)) from time_private.history t where sheet_id=${q(sized.sheet.id)})+(select sum(pg_column_size(t)) from time_private.operations t where response#>>'{sheet,id}'=${q(sized.sheet.id)})+(select sum(pg_column_size(t)) from time_private.exports t where id=${q(id(150))})+(select sum(pg_column_size(t)) from time_private.exported_entries t where sheet_id=${q(sized.sheet.id)}) as bytes`))[0];
 console.log('Representative saved 10-line week, history, idempotency and export: '+measure.bytes+' row bytes; 40 employees × 9 weeks: '+Math.round(Number(measure.bytes)*40*9/1e6)+' MB before indexes/free space. Synthetic, excludes receipt bytes.');
 await db.exec('rollback;');
 await actor(admin);const r=(await rpc('hr_employee_get',[company,employee.id])).employee;await rpc('hr_employee_command',[company,'end',{id:r.id,revision:r.revision,confirm:'END_AND_DELETE'}]);
 eq((await rpc('time_export_get',[company,batchId])).batch.rows.length,2,'financial export retained on HR closure');await actor(self);await reject(()=>rpc('time_sheet_get',[company,week,null]),'42501');
 await actor(leader);await reject(()=>rpc('time_file_get',[company,fid]),'42501');await actor(admin);eq((await rpc('time_file_get',[company,fid])).file.id,fid,'payroll responsible retains receipt');
 await db.exec('reset role;');
 for(const role of ['anon','authenticated','service_role'])eq((await sql(`select has_table_privilege('${role}','time_private.sheets','select,insert,update,delete') v`))[0].v,false,'no direct private table grants');
 for(const role of ['anon','authenticated'])for(const name of ['time_mail_reserve()','time_mail_authorize(text)','time_mail_validate(uuid,uuid)','time_mail_finish(uuid,uuid,text)'])eq((await sql(`select has_function_privilege('${role}','public.${name}','execute') v`))[0].v,false,'worker is server only');
 eq((await sql('select enabled from time_private.mail_settings'))[0].enabled,false,'transport remains off');eq((await sql('select count(*)::int n from time_private.deliveries'))[0].n,0,'no messages from disabled transport');
 // Retention is based on the completed export date, not the work date.
 await db.exec(`update time_private.exports set created_at=now()-interval '2 months'+interval '1 day' where id=${q(batchId)};`);
 eq((await sql('select time_private.cleanup_completed() n'))[0].n,0,'recent completed export remains');
 await db.exec(`update time_private.exports set created_at=now()-interval '2 months'-interval '1 day' where id=${q(batchId)};`);
 eq((await sql('select time_private.cleanup_completed() n'))[0].n,1,'completed export past two months is purged');
 eq((await sql(`select count(*)::int n from time_private.sheets where id=${q(state.sheet.id)}`))[0].n,0);
 eq((await sql(`select count(*)::int n from time_private.history where sheet_id=${q(state.sheet.id)}`))[0].n,0);
 eq((await sql(`select count(*)::int n from time_private.files where id=${q(fid)}`))[0].n,0);
 eq((await sql(`select count(*)::int n from time_private.exports where id=${q(batchId)}`))[0].n,0);
 eq((await sql('select count(*)::int n from time_private.cleanup_files'))[0].n,1,'receipt queued for Storage API removal, never SQL-deleted from storage.objects');
 eq((await sql('select count(*)::int n from time_private.sheets'))[0].n,1,'unexported timer week preserved');
 eq((await sql('select count(*)::int n from time_private.closed_weeks'))[0].n,1,'minimal closed-week marker prevents missing task or re-entry');
 for(const role of ['anon','authenticated'])for(const name of ['time_cleanup_authorize(text)','time_cleanup_files()','time_cleanup_finish(text[])'])eq((await sql(`select has_function_privilege('${role}','public.${name}','execute') v`))[0].v,false,'cleanup server only');
 console.log(`Time registration actual PostgreSQL PASS: ${checks} assertions; separate private tables, company/actor/employee/leader guards, clock/overnight/overlap validation, receipts, CAS/retry, return/approval, unique immutable exports and retained financial history. Local Auth/Storage/project adapters synthetic.`);
}finally{await db.close();}
