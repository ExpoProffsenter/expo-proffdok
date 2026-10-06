import assert from 'node:assert/strict';
import fs from 'node:fs';
import { deviationForm,validateDeviation,saveDeviation,storeDeviationDraft,readDeviationDraft,deviationDraftKey,projectAfterDeviation,checklistAfterDeviation,readDeviationLink,deviationFileType } from '../src/modules/kshms/kshmsDeviations.mjs';
import { createAssignmentMailer,assignmentEmail } from '../supabase/functions/_shared/kshms-assignment-mailer.mjs';
import { createDeviationCenter } from '../src/modules/deviations/deviationViewTools.js';

const caseId='11111111-1111-4111-8111-111111111111',companyId='22222222-2222-4222-8222-222222222222',eli='eli';
const open={id:caseId,company_id:companyId,responsible_id:eli,revision:1,status:'open',title:'Trond → Eli',event:'A relevant actual incident',due_on:'2026-10-10',responsible_identity:{name:'Eli'},source_kind:'company'};
const closed={...open,revision:2,status:'closed',closed_by:eli,closed_at:'2026-10-06T20:00:00Z',closed_identity:{name:'Eli'},control_note:'Actual result checked'};
const form=deviationForm(open);assert.equal(validateDeviation(form),'');assert(validateDeviation(form,{closing:true}));
const completed={...form,cause:'A known cause',improvement_action:'Actual corrective action',control_note:'Eli checked the corrected work'};
assert.equal(validateDeviation(completed,{closing:true}),'');
for(const failure of ['command','read','foreign','signer','late','']){
 const calls=[];const result=saveDeviation({companyId,userId:eli,action:'close',payload:{id:caseId,revision:1,...completed,controlled:true},isCurrent:()=>failure!=='late',rpc:async(name)=>{calls.push(name);if(name==='kshms_deviation_command'){if(failure==='command')throw new Error('not saved');return closed;}if(failure==='read')throw new Error('not verified');return {case:{...closed,...(failure==='foreign'?{company_id:'other'}:failure==='signer'?{closed_by:'trond'}:{})},events:[]};}});
 if(['command','read','foreign','signer'].includes(failure))await assert.rejects(result);else assert.equal((await result)?.case?.status,failure==='late'?undefined:'closed');
 assert.equal(calls.length,['command','late'].includes(failure)?1:2);
}
const memory=new Map(),storage={getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)};
storeDeviationDraft(storage,eli,companyId,{form:completed,id:caseId,revision:1,requestId:'stable-request'});
assert.equal(readDeviationDraft(storage,eli,companyId).revision,1);assert.equal(readDeviationDraft(storage,'trond',companyId),null);assert.equal(readDeviationDraft(storage,eli,'other'),null);
const key=deviationDraftKey(eli,companyId),cached=JSON.parse(memory.get(key));memory.set(key,JSON.stringify({...cached,savedAt:Date.now()-8*86400000}));assert.equal(readDeviationDraft(storage,eli,companyId),null);
memory.set(key,JSON.stringify({...cached,form:{title:'incomplete'}}));assert.equal(readDeviationDraft(storage,eli,companyId),null);memory.set(key,'invalid');assert.equal(readDeviationDraft(storage,eli,companyId),null);
const project={projectName:'Unchanged',projectDeviations:[{id:'linked',photos:[{id:'proof'}]},{id:'ordinary',status:'Åpent'}]},linked={...closed,source_kind:'project',source_key:'linked'};
const next=projectAfterDeviation(project,linked);assert.equal(next.projectDeviations[0].status,'Lukket');assert.deepEqual(next.projectDeviations[0].photos,project.projectDeviations[0].photos);assert.equal(next.projectDeviations[1],project.projectDeviations[1]);assert.equal(project.projectDeviations[0].status,undefined);
assert.equal(projectAfterDeviation(project,{...linked,source_key:'missing'}),project);
const checklist={A:{B:{status:'Avvik',comment:'Keep own comment',photos:[1]},C:{status:'Ok'}}};
const after=checklistAfterDeviation(checklist,{...closed,source_kind:'checklist',source_group:'A',source_item:'B'});assert.equal(after.A.B.status,'Lukket avvik');assert.equal(after.A.B.comment,'Keep own comment');assert.equal(after.A.C,checklist.A.C);assert.equal(checklist.A.B.status,'Avvik');
assert.equal(readDeviationLink('?kshmsDeviation='+caseId+'&kshmsCompany='+companyId,companyId).matchingCompany,true);assert.equal(readDeviationLink('?kshmsDeviation='+caseId+'&kshmsCompany='+companyId,'other').matchingCompany,false);assert.equal(readDeviationLink('?kshmsDeviation=../../other',companyId),null);
assert.equal(deviationFileType({name:'safe.pdf',type:'',size:10}),'application/pdf');assert.throws(()=>deviationFileType({name:'bad.html',type:'text/html',size:10}));assert.throws(()=>deviationFileType({name:'big.pdf',type:'application/pdf',size:10485761}));

// Actual task effect: out-of-order replies, offline retention, cleanup.
const taskSource=fs.readFileSync('src/modules/kshms/KshmsTasks.jsx','utf8');const taskBody=taskSource.slice(taskSource.indexOf('export default function')).replace('export default ','').split(' if(!tasks?.count')[0]+'\n}';
const requests=[],cleanups=[],fakeWindow=new EventTarget(),fakeDocument=new EventTarget(),states=[];fakeDocument.visibilityState='visible';fakeWindow.location={search:''};fakeWindow.setInterval=()=>1;fakeWindow.clearInterval=()=>{};
let index=0;const hook=new Function('bindings','const {useState,useRef,useEffect,kshmsRpc,window,document,DEVIATION_CHANGE_EVENT,readDeviationLink}=bindings;'+taskBody+';return KshmsTasks;')({useState:init=>{const id=index++;states[id]=typeof init==='function'?init():init;return [states[id],next=>states[id]=typeof next==='function'?next(states[id]):next];},useRef:value=>({current:value}),useEffect:effect=>cleanups.push(effect()),kshmsRpc:(name,args)=>new Promise((resolve,reject)=>requests.push({name,args,resolve,reject})),window:fakeWindow,document:fakeDocument,DEVIATION_CHANGE_EVENT:'changed',readDeviationLink});
hook({context:{company_id:companyId,user_id:eli},onOpen(){}});assert.equal(requests[0].args.p_company_id,companyId);
requests[0].resolve({company_id:companyId,user_id:eli,count:1,items:[open]});await Promise.resolve();assert.equal(states[0].count,1);
fakeWindow.dispatchEvent(new Event('focus'));requests[1].reject(new Error('network'));await Promise.resolve();assert.equal(states[0].count,1,'Network failure removed confirmed task');assert(states[1]);
fakeWindow.dispatchEvent(new Event('focus'));fakeWindow.dispatchEvent(new Event('focus'));requests[3].resolve({company_id:companyId,user_id:eli,count:0,items:[]});await Promise.resolve();requests[2].resolve({company_id:companyId,user_id:eli,count:1,items:[open]});await Promise.resolve();assert.equal(states[0].count,0,'Late reply restored closed task');
fakeWindow.dispatchEvent(new Event('focus'));cleanups[0]();requests[4].resolve({company_id:companyId,user_id:eli,count:1});await Promise.resolve();assert.equal(states[0].count,0);fakeWindow.dispatchEvent(new Event('focus'));assert.equal(requests.length,5);

// Actual legacy render and handlers: only linked rows lose legacy closure.
let savedProject;globalThis.window={prompt:()=> 'Actual checked legacy correction',confirm:()=>true};
const Legacy=createDeviationCenter({uid:()=> 'new',checklistPointAnchor:(a,b)=>a+b,Grid:'div',Select:'select',Input:'input',Textarea:'textarea',Plus:'span'});
const elements=Legacy({project:{projectDeviations:[{id:'a',title:'Linked',status:'Åpent',ks_deviation_id:caseId},{id:'b',title:'Unlinked',status:'Åpent'}]},setProject:value=>savedProject=value,onOpenKshms(){}});
const flatten=value=>Array.isArray(value)?value.flatMap(flatten):value&&typeof value==='object'?[value,...flatten(value.props?.children)]:[];
const buttons=flatten(elements).filter(n=>n.type==='button');assert.equal(buttons.filter(n=>n.props.children==='✅ Lukk avvik').length,1);assert.equal(buttons.filter(n=>n.props.children==='Fjern').length,1);assert.equal(buttons.filter(n=>n.props.children==='Åpne i KS/HMS').length,1);
buttons.find(n=>n.props.children==='✅ Lukk avvik').props.onClick();assert.equal(savedProject.projectDeviations[0].status,'Åpent');assert.equal(savedProject.projectDeviations[1].status,'Lukket');delete globalThis.window;

// Actual editor handlers with persistent hook slots and failed-close retry.
const editorSource=fs.readFileSync('src/modules/kshms/KshmsDeviations.jsx','utf8');
const editorBody=editorSource.slice(editorSource.indexOf('export default function')).replace('export default ','').split('\n return <section')[0]+'\n return {openCase,change,save,setControlled,state:{detail,form,dirty,controlled,error,notice,conflict}};\n}';
const slots=[],effects=[],queue=[],published=[];let slot=0,serverCase={...open},failClose=true,commands=0;
const editorStorage={...storage,removeItem:k=>memory.delete(k)},editorWindow=new EventTarget();editorWindow.localStorage=editorStorage;editorWindow.confirm=()=>true;
const editorRpc=async name=>{
 if(name==='kshms_deviation_state')return {context:{company_id:companyId,user_id:eli},members:[],cases:[serverCase],counts:{open:1,closed:0}};
 if(name==='kshms_deviation_detail')return {case:serverCase,events:[]};
 if(name==='kshms_deviation_files')return [];
 if(name==='kshms_deviation_command'){commands++;if(failClose)throw new Error('Synthetic failed close');serverCase=closed;return closed;}
 throw new Error(name);
};
const Editor=new Function('bindings','const {useState,useRef,useEffect,kshmsRpc,window,readDeviationDraft,deviationForm,storeDeviationDraft,deviationDraftKey,validateDeviation,saveDeviation,publishDeviationChange,DEVIATION_CHANGE_EVENT}=bindings;'+editorBody+';return KshmsDeviations;')({
 useState:init=>{const id=slot++;if(!(id in slots))slots[id]=typeof init==='function'?init():init;return [slots[id],value=>slots[id]=typeof value==='function'?value(slots[id]):value];},
 useRef:init=>{const id=slot++;if(!(id in slots))slots[id]={current:init};return slots[id];},
 useEffect:(fn,deps)=>{const id=slot++;if(!effects[id]||deps.some((value,i)=>value!==effects[id].deps[i]))queue.push(()=>{effects[id]?.cleanup?.();effects[id]={deps,cleanup:fn()};});},
 kshmsRpc:editorRpc,window:editorWindow,readDeviationDraft,deviationForm,storeDeviationDraft,deviationDraftKey,validateDeviation,saveDeviation,publishDeviationChange:row=>published.push(row),DEVIATION_CHANGE_EVENT:'changed'
});
const renderEditor=()=>{slot=0;const view=Editor({context:{company_id:companyId,user_id:eli,manage:false}});for(const effect of queue.splice(0))effect();return view;};
let view=renderEditor();await view.openCase(caseId);view=renderEditor();
for(const key of ['cause','improvement_action','control_note']){view.change(key,completed[key]);view=renderEditor();}
await view.save('close');assert.equal(commands,0,'Unchecked control submitted closure');
view.setControlled(true);view=renderEditor();await view.save('close');view=renderEditor();
assert.equal(view.state.detail.case.status,'open');assert.equal(view.state.dirty,true);assert.equal(view.state.controlled,true);assert.equal(view.state.form.control_note,completed.control_note);assert(view.state.error.includes('Kladden er beholdt'));assert.equal(published.length,0);
failClose=false;await view.save('close');view=renderEditor();assert.equal(view.state.detail.case.status,'closed');assert.equal(view.state.detail.case.closed_by,eli);assert.equal(view.state.dirty,false);assert(view.state.notice.includes('Lukkingen er lagret'));assert.equal(published.length,1);assert.equal(readDeviationDraft(editorStorage,eli,companyId),null);
for(const effect of effects)effect?.cleanup?.();

// Real worker with stubbed transport; no email leaves this test.
const job={id:caseId,company_id:companyId,deviation_id:caseId,email:'synthetic@example.invalid',app_url:'https://example.com',attempt:1,title:'Never email this sensitive case title',event:'Never email this description'};
const token='a'.repeat(64),request=(given=token)=>new Request('https://worker.invalid',{method:'POST',headers:{'x-kshms-worker-token':given}});
const delivered=[],finished=[];
async function workerScenario({authorize=true,validate=true,provider=200,finishFails=false,apiKey='test-key',given=token}={}){
 let available=true;const calls=[];
 const worker=createAssignmentMailer({apiKey,from:'Synthetic <test@example.invalid>',verifyTransport:async()=>true,rpc:async(name,args)=>{calls.push(name);if(name==='kshms_email_worker_authorize')return authorize?{enabled:true}:null;if(name==='kshms_email_reserve'){if(!available)return null;available=false;return job;}if(name==='kshms_email_validate_attempt')return validate;if(name==='kshms_email_finish_attempt'){finished.push(args);if(finishFails)throw new Error('lost finish');}},fetcher:async(url,options)=>{delivered.push({url,options});return new Response(JSON.stringify(provider===200?{id:'provider-id'}:{error:'retry'}),{status:provider});}});
 return {response:await worker(request(given)),calls};
}
const before=delivered.length;assert.equal((await workerScenario({given:'wrong'})).response.status,401);assert.equal(delivered.length,before);assert.equal((await workerScenario({authorize:false})).response.status,401);assert.equal((await workerScenario({apiKey:''})).response.status,503);
const healthWorker=createAssignmentMailer({apiKey:'',from:'',verifyTransport:async()=>true,rpc:async name=>{assert.equal(name,'kshms_email_worker_authorize');return {enabled:true};},fetcher:()=>{throw new Error('Health sent email');}});
const health=await healthWorker(new Request('https://worker.invalid',{method:'POST',headers:{'x-kshms-worker-token':token,'x-kshms-worker-mode':'check'}}));assert.equal(health.status,503);assert.deepEqual(await health.json(),{configured:false,api_key_configured:false,sender_configured:false,transport_safe:true});
const unsafeWorker=createAssignmentMailer({apiKey:'test',from:'test',rpc:async name=>{assert.equal(name,'kshms_email_worker_authorize');return {enabled:true};},fetcher:()=>{throw new Error('Unsafe transport sent email');}});assert.equal((await unsafeWorker(request())).status,503);
const inactive=await workerScenario({validate:false});assert.equal(inactive.response.status,200);assert.equal(delivered.length,before);
assert.equal((await workerScenario({provider:429})).response.status,200);assert.equal(finished.at(-1).p_sent,false);assert.equal(finished.at(-1).p_attempt,1);
assert.equal((await workerScenario()).response.status,200);assert.equal(finished.at(-1).p_sent,true);
assert.equal((await workerScenario({finishFails:true})).response.status,503);assert.equal((await workerScenario()).response.status,200);
const last=delivered.slice(-2);assert.equal(last[0].options.headers['Idempotency-Key'],last[1].options.headers['Idempotency-Key']);assert.equal(last[0].options.body,last[1].options.body);
const email=JSON.parse(last[0].options.body);assert(!JSON.stringify(email).includes(job.title));assert(!JSON.stringify(email).includes(job.event));assert(email.text.includes('kshmsDeviation='+caseId));assert.throws(()=>assignmentEmail({...job,app_url:'javascript:alert(1)'},'from'));
console.log('critical-kshms-deviations-check: OK – confirmed-only closure, actual editor/task handlers, scoped recovery, private files, linked/unlinked legacy and fenced mailer with stub transport');
