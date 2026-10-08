import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newExecution,newRisk,executionContent,executionIssues,riskScore,riskBand,validDate,saveExecution,EXECUTION_STATEMENT,EXECUTION_CHANGE_EVENT,publishExecutionChange,isUuid,storeExecutionDraft,readExecutionDraft} from '../src/modules/kshms/kshmsExecutions.mjs';
const user=crypto.randomUUID(),company=crypto.randomUUID();
const round=newExecution('round',user);round.content.title='Kontroll før arbeid';
assert.equal(riskScore('',4),null);assert.equal(riskScore(null,4),null);assert.equal(riskScore(0,4),null);assert.equal(riskScore(6,4),null);assert.equal(riskScore(5,5),25);assert.equal(riskScore('3','4'),12);
assert.equal(riskBand(4,{low_max:4,medium_max:12}),'Lav');assert.equal(riskBand(12,{low_max:4,medium_max:12}),'Moderat');assert.equal(riskBand(15,{low_max:4,medium_max:12}),'Høy');
assert(validDate('2026-10-08'));for(const date of ['2026-02-30','2026-13-08','8.10.2026',''])assert.equal(validDate(date),false);
assert.equal(executionContent(round.content,'round').points[0].title,'','Partial draft must save');
assert(executionIssues(executionContent(round.content,'round'),'round').length>5);
const point=round.content.points[0];point.title='Kontroller ferdsel';point.image_required=true;
Object.assign(round.content,{workplace:'Lager',planned_on:'2026-10-08',participants:'Utfører og verneombud gjennomgikk området.',review:'Avvik følges opp av valgt ansvarlig.'});
round.content.answers[point.id]={status:'na',comment:'Området er stengt og ikke i bruk.',responsible_id:'',due_on:'',photos:[]};
assert.equal(executionIssues(executionContent(round.content,'round'),'round').length,0,'Reasoned not-applicable must not require a meaningless photo');
round.content.answers[point.id].status='deviation';assert(executionIssues(executionContent(round.content,'round'),'round').some(i=>i.key==='photo-'+point.id));
Object.assign(round.content.answers[point.id],{responsible_id:user,due_on:'2026-10-09',photos:[{id:crypto.randomUUID(),data:'data:image/png;base64,aGVsbG8='}]});
assert.equal(executionIssues(executionContent(round.content,'round'),'round').length,0);
assert.throws(()=>executionContent({...round.content,answers:{[point.id]:{...round.content.answers[point.id],photos:[{id:crypto.randomUUID(),data:'data:image/svg+xml;base64,aGVsbG8='}]}}},'round'),/Bildet/);
assert.throws(()=>executionContent({...round.content,points:[point,point]},'round'),/ulike/);
const risk=newExecution('risk',user);Object.assign(risk.content,{...round.content,title:'Planlagt kapping',points:[],answers:{},risks:[newRisk()],basis:'Konsekvens gjelder personskade. Tidsrommet er dagens jobb.',acceptance:{low_max:4,medium_max:12,description:'Krav om kontroll før aksept. Ved høy risiko stanser vi.',confirmed:true}});
Object.assign(risk.content.risks[0],{activity:'Kapping',hazard:'Støv',consequence:'Lungeskade',existing_measures:'Adskilt område',planned_measures:'Avsug og kontroll',owner_id:user,due_on:'2026-10-09',probability_before:4,consequence_before:5,probability_after:1,consequence_after:3,follow_up:'Verneombudet kontrollerer avsuget.',effect_status:'planned',decision:'accepted',reason:'Etterkontroll kreves.'});
assert(executionIssues(executionContent(risk.content,'risk'),'risk').some(i=>i.key.endsWith('-decision')),'Forecast score cannot authorize work');
risk.content.risks[0].decision='needs_action';assert.equal(executionIssues(executionContent(risk.content,'risk'),'risk').length,0);
Object.assign(risk.content.risks[0],{effect_status:'verified',verified_on:'2026-10-08',decision:'accepted'});assert.equal(executionIssues(executionContent(risk.content,'risk'),'risk').length,0);
risk.content.risks[0].probability_after=5;risk.content.risks[0].consequence_after=5;assert(executionIssues(executionContent(risk.content,'risk'),'risk').some(i=>i.key.endsWith('-decision')),'High residual risk cannot be accepted');
const values=new Map(),storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};storeExecutionDraft(storage,user,company,round);assert.equal(readExecutionDraft(storage,user,company,'round').id,round.id);assert.equal(readExecutionDraft(storage,'other',company,'round'),null);assert.equal(readExecutionDraft(storage,user,'other','round'),null);assert.equal(readExecutionDraft(storage,user,company,'risk'),null);
const projectOne=crypto.randomUUID(),projectTwo=crypto.randomUUID(),projectDraft={...round,id:crypto.randomUUID(),project_id:projectOne};
storeExecutionDraft(storage,user,company,projectDraft,projectOne);
assert.equal(readExecutionDraft(storage,user,company,'round',projectOne).id,projectDraft.id);
assert.equal(readExecutionDraft(storage,user,company,'round',projectTwo),null,'Another project inherited the draft');
assert.equal(readExecutionDraft(storage,user,company,'round').id,round.id,'Project draft replaced standalone work');
assert.throws(()=>storeExecutionDraft(storage,user,company,projectDraft,projectTwo),/annet prosjekt/);
for(const failure of ['command','read','scope','text','revision','signer','late','']){
 let calls=0;const snapshot=structuredClone(round);
 const row={id:round.id,company_id:company,kind:'round',revision:1,project_id:null,template_version_id:null,content:executionContent(round.content,'round'),status:'completed',completed_by:user,completed_at:'2026-10-08T13:00:00Z',statement:EXECUTION_STATEMENT};
 const result=saveExecution({companyId:company,userId:user,editor:round,action:'complete',confirmed:true,isCurrent:()=>failure!=='late',rpc:async name=>{calls++;if(name==='kshms_execution_command'){if(failure==='command')throw Error('Network failed');return {record:row};}if(failure==='read')throw Error('Readback failed');return {context:{user_id:user,company_id:failure==='scope'?'other':company,enabled:true},record:{...row,...(failure==='text'?{content:{...row.content,review:'Lost text'}}:failure==='revision'?{revision:2}:failure==='signer'?{completed_by:'another'}:{})},links:[]};}});
 if(['command','read','scope','text','revision','signer'].includes(failure))await assert.rejects(result);else assert.equal(Boolean(await result),failure!=='late');assert.deepEqual(round,snapshot,'Transport/readback mutated local answers');assert.equal(calls,['command','late'].includes(failure)?1:2);
}
assert(await saveExecution({rpc:async name=>name==='kshms_execution_command'?{record:{id:round.id,company_id:company,revision:1}}:{context:{company_id:company,user_id:user,enabled:true},record:{...round,id:round.id,company_id:company,project_id:null,template_version_id:null,revision:1,content:executionContent(round.content,'round')}},companyId:company,userId:user,editor:round,action:'save',confirmed:false}));
// Exercise the actual app task effect: retained alerts, authoritative completion,
// out-of-order replies, visibility, company/user boundaries and revoked access.
const taskSource=fs.readFileSync('src/modules/kshms/KshmsExecutionTasks.jsx','utf8');
const taskBody=taskSource.slice(taskSource.indexOf('export default function')).replace('export default ','').split('  const open = row')[0]+'\nreturn {refreshRef};\n}';
function taskHarness(enabled=true){
 const requests=[],cleanups=[],states=[],fakeWindow=new EventTarget(),fakeDocument=new EventTarget();let index=0;
 fakeDocument.visibilityState='visible';fakeWindow.setInterval=()=>1;fakeWindow.clearInterval=()=>{};
 const hook=new Function('bindings','const {useState,useRef,useEffect,kshmsRpc,window,document,EXECUTION_CHANGE_EVENT,isUuid}=bindings;'+taskBody+';return KshmsExecutionTasks;')({
  useState:init=>{const id=index++;states[id]=typeof init==='function'?init():init;return [states[id],next=>states[id]=typeof next==='function'?next(states[id]):next];},
  useRef:init=>({current:init}),useEffect:fn=>cleanups.push(fn()),window:fakeWindow,document:fakeDocument,EXECUTION_CHANGE_EVENT,isUuid,
  kshmsRpc:(name,args)=>new Promise((resolve,reject)=>requests.push({name,args,resolve,reject}))
 });hook({context:{company_id:company,user_id:user,enabled}});return {requests,cleanups,states,fakeWindow,fakeDocument};
}
assert.equal(taskHarness(false).requests.length,0,'Disabled module loaded assignment tasks');
const task=taskHarness(),pending={company_id:company,user_id:user,count:2,overdue:1,items:[{id:round.id,kind:'round',project_id:projectOne,accessible:true},{id:risk.id,kind:'risk',project_id:null,accessible:true}]};
assert.equal(task.requests[0].name,'kshms_execution_tasks');assert.equal(task.requests[0].args.p_company_id,company);
task.requests[0].resolve(pending);await Promise.resolve();assert.equal(task.states[0].count,2);
publishExecutionChange({company_id:'another-company'},task.fakeWindow);assert.equal(task.requests.length,1,'Another company refreshed the tasks');
publishExecutionChange({company_id:company},task.fakeWindow);task.requests.at(-1).reject(Error('Offline'));await Promise.resolve();assert.equal(task.states[0].count,2,'Network error removed a confirmed alert');assert(task.states[1]);
task.fakeWindow.dispatchEvent(new Event('focus'));task.requests.at(-1).resolve({...pending,user_id:'another-user'});await Promise.resolve();assert.equal(task.states[0].count,2,'Another user replaced the current tasks');assert(task.states[1]);
task.fakeWindow.dispatchEvent(new Event('focus'));const stale=task.requests.at(-1);task.fakeWindow.dispatchEvent(new Event('focus'));task.requests.at(-1).resolve({...pending,count:0,overdue:0,items:[]});await Promise.resolve();stale.resolve(pending);await Promise.resolve();assert.equal(task.states[0].count,0,'Late reply restored a completed task');
task.fakeDocument.visibilityState='hidden';const beforeHidden=task.requests.length;task.fakeDocument.dispatchEvent(new Event('visibilitychange'));assert.equal(task.requests.length,beforeHidden);
task.fakeDocument.visibilityState='visible';task.fakeDocument.dispatchEvent(new Event('visibilitychange'));task.requests.at(-1).resolve(pending);await Promise.resolve();assert.equal(task.states[0].count,2);
task.fakeWindow.dispatchEvent(new Event('focus'));task.requests.at(-1).reject(Object.assign(Error('Access revoked'),{code:'42501'}));await Promise.resolve();assert.equal(task.states[0],null,'Revoked module retained private task data');
task.fakeWindow.dispatchEvent(new Event('focus'));const late=task.requests.at(-1);task.cleanups[0]();late.resolve(pending);await Promise.resolve();assert.equal(task.states[0],null,'Unmounted scope accepted a late task response');const beforeCleanup=task.requests.length;task.fakeWindow.dispatchEvent(new Event('focus'));assert.equal(task.requests.length,beforeCleanup);
const module=fs.readFileSync('src/modules/kshms/KshmsModule.jsx','utf8');assert(module.includes("['rounds','Vernerunder/kontroller']")&&module.includes("['risk','Risikovurdering']"));assert(module.includes('opened[key]||screen===key'),'Navigation must keep execution draft surfaces mounted');
console.log('critical-kshms-executions-check: OK — scoped project drafts, risk decisions, confirmed completion/readback and actual task effect with offline/late/revoked access');

await import('./critical-kshms-execution-pdf-check.mjs');
