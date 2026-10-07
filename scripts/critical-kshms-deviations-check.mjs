import assert from 'node:assert/strict';
import fs from 'node:fs';
import { deviationForm,validateDeviation,deviationClosureIssues,saveDeviation,storeDeviationDraft,readDeviationDraft,deviationDraftKey,projectAfterDeviation,checklistAfterDeviation,readDeviationLink,deviationFileType } from '../src/modules/kshms/kshmsDeviations.mjs';
import { createAssignmentMailer,assignmentEmail } from '../supabase/functions/_shared/kshms-assignment-mailer.mjs';
import { createDeviationCenter } from '../src/modules/deviations/deviationViewTools.js';
import { createProjectDeviation,newProjectDeviation,projectDeviationDraftKey,readProjectDeviationDraft } from '../src/modules/deviations/projectDeviationCreate.mjs';
import { ruhRegistrationIssues } from '../src/modules/kshms/kshmsRuh.mjs';

const caseId='11111111-1111-4111-8111-111111111111',companyId='22222222-2222-4222-8222-222222222222',eli='eli';
const open={id:caseId,company_id:companyId,responsible_id:eli,revision:1,status:'open',category:'hms',title:'Trond → Eli',event:'A relevant actual incident',due_on:'2026-10-10',responsible_identity:{name:'Eli'},source_kind:'company'};
const form=deviationForm(open);assert.equal(validateDeviation(form),'');assert(validateDeviation(form,{closing:true}));
const completed={...form,cause:'A known cause',improvement_action:'Actual corrective action',control_note:'Eli checked the corrected work'};
const closed={...open,...completed,revision:2,status:'closed',closed_by:eli,closed_at:'2026-10-06T20:00:00Z',closed_identity:{name:'Eli'}};
assert.equal(validateDeviation(completed,{closing:true}),'');
const causeOnly={...form,cause:completed.cause};
assert.deepEqual(deviationClosureIssues(causeOnly).map(item=>item.key),['improvement_action','control_note']);
assert(!validateDeviation(causeOnly,{closing:true}).includes('Årsak'),'Filled cause was reported missing');
assert.equal(validateDeviation({...completed,cause:'OK',improvement_action:'OK',control_note:'OK'},{closing:true}),'','Short closure notes were rejected');
assert.deepEqual(deviationClosureIssues({...completed,control_note:'   '}).map(item=>item.key),['control_note']);
for(const failure of ['command','read','foreign','signer','text','late','']){
 const calls=[];const result=saveDeviation({companyId,userId:eli,action:'close',payload:{id:caseId,revision:1,...completed,controlled:true},isCurrent:()=>failure!=='late',rpc:async(name)=>{calls.push(name);if(name==='kshms_deviation_command'){if(failure==='command')throw new Error('not saved');return closed;}if(failure==='read')throw new Error('not verified');return {case:{...closed,...(failure==='foreign'?{company_id:'other'}:failure==='signer'?{closed_by:'trond'}:failure==='text'?{control_note:''}:{})},events:[]};}});
 if(['command','read','foreign','signer','text'].includes(failure))await assert.rejects(result);else assert.equal((await result)?.case?.status,failure==='late'?undefined:'closed');
 assert.equal(calls.length,['command','late'].includes(failure)?1:2);
}
await assert.rejects(saveDeviation({companyId,userId:eli,action:'save',payload:{id:caseId,revision:1,control_note:'OK'},rpc:async name=>name==='kshms_deviation_command'?{...open,revision:2}:{case:{...open,revision:2,control_note:''},events:[]}}),/Lagret tekst samsvarer ikke/,'Ordinary save silently accepted erased text');
const memory=new Map(),storage={getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)};
storeDeviationDraft(storage,eli,companyId,{form:completed,id:caseId,revision:1,requestId:'stable-request'});
assert.equal(readDeviationDraft(storage,eli,companyId).revision,1);assert.equal(readDeviationDraft(storage,'trond',companyId),null);assert.equal(readDeviationDraft(storage,eli,'other'),null);
const key=deviationDraftKey(eli,companyId),cached=JSON.parse(memory.get(key));memory.set(key,JSON.stringify({...cached,savedAt:Date.now()-8*86400000}));assert.equal(readDeviationDraft(storage,eli,companyId),null);
const legacyForm={...completed};delete legacyForm.project_reference;delete legacyForm.routines;memory.set(key,JSON.stringify({...cached,form:legacyForm}));assert.equal(readDeviationDraft(storage,eli,companyId).form.control_note,completed.control_note,'New optional RUH fields erased a legacy deviation draft');
storeDeviationDraft(storage,eli,companyId,{form:completed,revision:1,projectId:'project-one'},'project-one');assert.equal(readDeviationDraft(storage,eli,companyId,'project-one').form.control_note,completed.control_note);assert.equal(readDeviationDraft(storage,eli,companyId,'project-two'),null);assert(readDeviationDraft(storage,eli,companyId),'Project draft displaced standalone draft');
assert.deepEqual(ruhRegistrationIssues(deviationForm(),[]).map(row=>row.key),['title','event','responsible_id','due_on']);assert.equal(ruhRegistrationIssues(form,[{id:eli}]).length,0);
memory.set(key,JSON.stringify({...cached,form:{title:'incomplete'}}));assert.equal(readDeviationDraft(storage,eli,companyId),null);memory.set(key,'invalid');assert.equal(readDeviationDraft(storage,eli,companyId),null);
const project={projectName:'Unchanged',projectDeviations:[{id:'linked',photos:[{id:'proof'}]},{id:'ordinary',status:'Åpent'}]},linked={...closed,source_kind:'project',source_key:'linked'};
const next=projectAfterDeviation(project,linked);assert.equal(next.projectDeviations[0].status,'Lukket');assert.deepEqual(next.projectDeviations[0].photos,project.projectDeviations[0].photos);assert.equal(next.projectDeviations[1],project.projectDeviations[1]);assert.equal(project.projectDeviations[0].status,undefined);
assert.equal(projectAfterDeviation(project,{...linked,source_key:'missing'}),project);
const checklist={A:{B:{status:'Avvik',comment:'Keep own comment',photos:[1]},C:{status:'Ok'}}};
const after=checklistAfterDeviation(checklist,{...closed,source_kind:'checklist',source_group:'A',source_item:'B'});assert.equal(after.A.B.status,'Lukket avvik');assert.equal(after.A.B.comment,'Keep own comment');assert.equal(after.A.C,checklist.A.C);assert.equal(checklist.A.B.status,'Avvik');
assert.equal(readDeviationLink('?kshmsDeviation='+caseId+'&kshmsCompany='+companyId,companyId).matchingCompany,true);assert.equal(readDeviationLink('?kshmsDeviation='+caseId+'&kshmsCompany='+companyId,'other').matchingCompany,false);assert.equal(readDeviationLink('?kshmsDeviation=../../other',companyId),null);
assert.equal(deviationFileType({name:'safe.pdf',type:'',size:10}),'application/pdf');assert.throws(()=>deviationFileType({name:'bad.html',type:'text/html',size:10}));assert.throws(()=>deviationFileType({name:'big.pdf',type:'application/pdf',size:10485761}));

// New project dialog: verify the source before linking; retry uses the same
// source/request IDs and only the server-confirmed recipient opens the case.
const createdEntry={...newProjectDeviation('project-source'),title:'Actual test incident',description:'Actual test incident with enough detail',responsible:'Eli',responsible_id:eli,dueDate:'2026-10-10',immediate_action:'Secured the area'};
const createContext={enabled:true,company_id:companyId,user_id:'trond'};
for (const failure of ['source','read','recipient','foreign-source','late','']) {
 const order=[];let active=true;
 const attempt=createProjectDeviation({entry:createdEntry,requestId:'stable-project-request',projectId:'project-id',context:createContext,isCurrent:()=>active,
  saveProject:async entry=>{order.push('source');if(failure==='source')throw new Error('not saved');if(failure==='late')active=false;return entry;},
  rpc:async(name,args)=>{order.push(name);assert.equal(args.p_company_id,companyId);const saved={...open,title:createdEntry.title,event:createdEntry.description,immediate_action:createdEntry.immediate_action,project_id:'project-id',source_kind:'project',source_key:createdEntry.id};
   if(name==='kshms_deviation_command'){assert.equal(args.p_payload.request_id,'stable-project-request');assert.equal(args.p_payload.source_key,createdEntry.id);assert.equal(args.p_payload.responsible_id,eli);return saved;}
   if(failure==='read')throw new Error('unconfirmed');return {case:{...saved,...(failure==='recipient'?{responsible_id:'trond'}:failure==='foreign-source'?{source_key:'other'}:{})},events:[]};}});
 if(['source','read','recipient','foreign-source'].includes(failure))await assert.rejects(attempt);else assert.equal((await attempt)?.case?.responsible_id,failure==='late'?undefined:eli);
 assert.equal(order[0],'source');assert.equal(order.length,failure==='source'||failure==='late'?1:3);
}
let legacyRpc=0;const legacyCreated=await createProjectDeviation({entry:createdEntry,context:null,saveProject:async entry=>entry,rpc:()=>legacyRpc++});assert.equal(legacyCreated.case,null);assert.equal(legacyRpc,0);
let invalidSourceSaved=false;await assert.rejects(createProjectDeviation({entry:{...createdEntry,responsible_id:''},context:createContext,saveProject:()=>invalidSourceSaved=true}));assert.equal(invalidSourceSaved,false);
const projectKey=projectDeviationDraftKey('trond',companyId,'project-id');memory.set(projectKey,JSON.stringify({entry:createdEntry,requestId:'stable-project-request',savedAt:Date.now()}));
assert.equal(readProjectDeviationDraft(storage,projectKey).entry.id,createdEntry.id);assert.equal(readProjectDeviationDraft(storage,projectDeviationDraftKey('eli',companyId,'project-id')),null);assert.equal(readProjectDeviationDraft(storage,projectDeviationDraftKey('trond',companyId,'other-project')),null);

// Exercise the actual integration callback, including server readback failure,
// source retries, photos and unrelated project/checklist fields.
const mainSource=fs.readFileSync('src/main.jsx','utf8');
const sourceSaveCode=mainSource.slice(mainSource.indexOf('    const saveProjectDeviation = async'),mainSource.indexOf('    const openCreatedProjectDeviation = async'));
for(const mode of ['normal','unconfirmed','linked','closed','photos']) {
 const previous=mode==='linked'?{...createdEntry,ks_deviation_id:caseId}:mode==='closed'?{...createdEntry,status:'Lukket'}:mode==='photos'?{...createdEntry,photos:[{id:'keep-photo'}]}:null;
 const before={project:{projectName:'Keep project',projectDeviations:[...(previous?[previous]:[]),{id:'other',description:'Keep other case',photos:[1]}]},checklist:{A:{B:{comment:'Keep comment',photos:[2]}}},overtagelse:{signKunde:'Keep signature'}};
 let persisted=structuredClone(before),calls=0;const latest={current:structuredClone(before)};
 const invoke=new Function('bindings',`const {authUser,isProjectLocked,isReadOnly,isProjectSupportReadOnly,buildProjectSnapshot,latestStateRef,setProject,saveLocalDraftNow,projectId,cloudAutoSaveTimerRef,autoSaveProjectToCloud,supabase,window}=bindings;${sourceSaveCode};return saveProjectDeviation;`)({authUser:{id:'trond'},isProjectLocked:false,isReadOnly:false,isProjectSupportReadOnly:false,buildProjectSnapshot:()=>structuredClone(before),latestStateRef:latest,setProject(){},saveLocalDraftNow(){},projectId:'project-id',cloudAutoSaveTimerRef:{current:null},window:{clearTimeout(){}},autoSaveProjectToCloud:async snapshot=>{calls++;if(mode!=='unconfirmed')persisted=structuredClone(snapshot);},supabase:{from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:{id:'project-id',data:persisted},error:null})})})})}});
 if(mode==='unconfirmed'||mode==='closed')await assert.rejects(invoke(createdEntry));else {const saved=await invoke(createdEntry);assert.equal(saved.id,createdEntry.id);if(mode==='photos')assert.deepEqual(saved.photos,previous.photos);if(mode!=='linked')assert(!Object.hasOwn(saved,'responsible_id'),'Project source retained an ID that can become stale after KS/HMS reassignment');}
 if(mode==='linked'||mode==='closed')assert.equal(calls,0);
 assert.deepEqual(persisted.checklist,before.checklist);assert.deepEqual(persisted.overtagelse,before.overtagelse);assert.deepEqual(persisted.project.projectDeviations.find(row=>row.id==='other'),before.project.projectDeviations.find(row=>row.id==='other'));
}

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
const editorBody=editorSource.slice(editorSource.indexOf('export default function')).replace('export default ','').split('\n return <section')[0]+'\n return {openCase,change,save,dismissEditor,setControlled,closureFields,state:{detail,form,dirty,controlled,error,notice,conflict,closureAttempted,closureIssues}};\n}';
const slots=[],effects=[],queue=[],published=[];let slot=0,serverCase={...open},failClose=true,commands=0;
const editorStorage={...storage,removeItem:k=>memory.delete(k)},editorWindow=new EventTarget();editorWindow.localStorage=editorStorage;editorWindow.confirm=()=>true;
const editorRpc=async(name,args)=>{
 if(name==='kshms_deviation_state')return {context:{company_id:companyId,user_id:eli},members:[],cases:[serverCase],counts:{open:1,closed:0}};
 if(name==='kshms_deviation_detail')return {case:serverCase,events:[]};
 if(name==='kshms_deviation_files')return [];
 if(name==='kshms_deviation_command'){commands++;if(args.p_action==='close'&&failClose)throw new Error('Synthetic failed close');serverCase={...serverCase,...args.p_payload,revision:serverCase.revision+1};if(args.p_action==='close')serverCase={...serverCase,status:'closed',closed_by:eli,closed_at:closed.closed_at,closed_identity:closed.closed_identity,control_note:args.p_payload.control_note.trim()};return serverCase;}
 throw new Error(name);
};
const Editor=new Function('bindings','const {useState,useRef,useEffect,kshmsRpc,window,useKshmsJobChoices,ruhRegistrationIssues,readDeviationDraft,deviationForm,deviationClosureIssues,storeDeviationDraft,deviationDraftKey,validateDeviation,saveDeviation,publishDeviationChange,DEVIATION_CHANGE_EVENT}=bindings;'+editorBody+';return KshmsDeviations;')({
 useState:init=>{const id=slot++;if(!(id in slots))slots[id]=typeof init==='function'?init():init;return [slots[id],value=>slots[id]=typeof value==='function'?value(slots[id]):value];},
 useRef:init=>{const id=slot++;if(!(id in slots))slots[id]={current:init};return slots[id];},
 useEffect:(fn,deps)=>{const id=slot++;if(!effects[id]||deps.some((value,i)=>value!==effects[id].deps[i]))queue.push(()=>{effects[id]?.cleanup?.();effects[id]={deps,cleanup:fn()};});},
 kshmsRpc:editorRpc,window:editorWindow,useKshmsJobChoices:()=>({value:null}),ruhRegistrationIssues:()=>[],readDeviationDraft,deviationForm,deviationClosureIssues,storeDeviationDraft,deviationDraftKey,validateDeviation,saveDeviation,publishDeviationChange:row=>published.push(row),DEVIATION_CHANGE_EVENT:'changed'
});
const renderEditor=()=>{slot=0;const view=Editor({context:{company_id:companyId,user_id:eli,manage:false}});for(const effect of queue.splice(0))effect();return view;};
let view=renderEditor();await view.openCase(caseId);view=renderEditor();
view.change('cause',completed.cause);view=renderEditor();
let focusedMissing=0;view.closureFields.current.improvement_action={focus:()=>focusedMissing++,scrollIntoView(){}};
view.setControlled(true);view=renderEditor();await view.save('close');view=renderEditor();
assert.equal(commands,0,'Incomplete closure reached the server');assert.equal(focusedMissing,1,'First missing field was not focused');
assert.equal(view.state.form.cause,completed.cause);assert.equal(view.state.dirty,true);assert.equal(view.state.closureAttempted,true);
assert.deepEqual(view.state.closureIssues.map(item=>item.key),['improvement_action','control_note']);
for(const key of ['cause','improvement_action','control_note']){view.change(key,'OK');view=renderEditor();}
view.dismissEditor();view=renderEditor();assert.equal(view.state.form,null);
await view.openCase(caseId);view=renderEditor();assert.equal(view.state.form.control_note,'OK','Reopening the popup lost the local draft');assert.equal(view.state.dirty,true);
await view.save('close');assert.equal(commands,0,'Unchecked control submitted closure');
await view.save('save');view=renderEditor();assert.equal(view.state.form.control_note,'OK','Ordinary save erased the editor text');assert.equal(view.state.detail.case.status,'open');assert.equal(view.state.dirty,false);assert.equal(commands,1);assert.equal(published.length,1);
view.change('control_note',' OK ');view=renderEditor();
view.setControlled(true);view=renderEditor();await view.save('close');view=renderEditor();
assert.equal(view.state.detail.case.status,'open');assert.equal(view.state.dirty,true);assert.equal(view.state.controlled,true);assert.equal(view.state.form.control_note,' OK ');assert(view.state.error.includes('Kladden er beholdt'));assert.equal(published.length,1);
failClose=false;await view.save('close');view=renderEditor();assert.equal(view.state.form,null,'Confirmed closure left the popup open');assert.equal(view.state.detail,null);assert.equal(published.at(-1).status,'closed');assert.equal(published.at(-1).closed_by,eli);assert.equal(published.at(-1).control_note,'OK');assert.equal(view.state.dirty,false);assert(view.state.notice.includes('lukket og lagret'));assert.equal(published.length,2);assert.equal(readDeviationDraft(editorStorage,eli,companyId),null);
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
