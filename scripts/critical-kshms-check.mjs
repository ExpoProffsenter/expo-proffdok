import fs from 'node:fs';
import assert from 'node:assert/strict';
import {readDraft,persistDraft,routineApprovalState,handbookProgress,sameRoutineContent} from '../src/modules/kshms/kshmsDraft.mjs';
import {ROUTINE_CATALOG,suggestedRoutines,currentVersionSnapshot,ACK_STATEMENT} from '../src/modules/kshms/kshmsCatalog.mjs';
import {addLibraryRoutines,routinesBySource,selectedCatalogRoutines} from '../src/modules/kshms/kshmsLibrary.mjs';
import {createGlobalAppTabs,createProjectWorkspaceTabs} from '../src/modules/project/projectNavigationTabs.mjs';
// Actual refresh hook: stale responses may never revive old company access.
const source=fs.readFileSync('src/modules/kshms/kshmsAccess.js','utf8');
const hook=source.slice(source.indexOf('export function useKshmsAccess')).replace('export function','function');
const requests=[],cleanups=[];let context,surface=null;
const window=new EventTarget();
const rpc=()=>new Promise((resolve,reject)=>requests.push({resolve,reject}));
const run=new Function('useState','useEffect','kshmsRpc','window','MANAGED_ACCESS_EVENT','MODULE_ACCESS_EVENT','WORK_PROFILE_EVENT',hook+';return useKshmsAccess;');
// Mirror the App's actual scope-keyed mount gate: losing enabled context
// unmounts KS/HMS and resets its local screen/setup on the next mount.
const renderSurface=()=>{if(!context?.enabled)surface=null;else if(surface?.company!==context.company_id)surface={company:context.company_id,screen:'handbook',activities:''};};
run(v=>{context=v;return[v,next=>{context=typeof next==='function'?next(context):next;renderSurface();}]},f=>cleanups.push(f()),rpc,window,'managed','module','profile')('u1');
assert.equal(context,null);
requests[0].resolve({user_id:'u1',company_id:'a',enabled:true});await Promise.resolve();assert.equal(context.company_id,'a');
surface.screen='setup';surface.activities='Ulagret oppstart for firma A';
window.dispatchEvent(new Event('focus'));assert.equal(context.company_id,'a','Background focus discarded visible draft context');
const profile=company=>{const event=new Event('profile');event.detail={active_company_id:company};window.dispatchEvent(event);};
profile('a');
assert.equal(surface?.screen,'setup','Same-company work-profile refresh remounted KS/HMS to its start screen');
assert.equal(surface.activities,'Ulagret oppstart for firma A','Same-company foreground refresh lost the unsaved setup');
requests[2].resolve({user_id:'u1',company_id:'a',enabled:true});await Promise.resolve();
requests[1].resolve({user_id:'u1',company_id:'a',enabled:true});await Promise.resolve();assert.equal(surface.screen,'setup');
window.dispatchEvent(new Event('focus'));profile('b');assert.equal(context,null);assert.equal(surface,null,'Real work-profile change must immediately unmount the old firm');
requests[4].resolve({user_id:'u1',company_id:'b',enabled:false});await Promise.resolve();
requests[3].resolve({user_id:'u1',company_id:'a',enabled:true});await Promise.resolve();assert.equal(context.company_id,'b');assert.equal(context.enabled,false);
window.dispatchEvent(new Event('managed'));assert.equal(context,null);
requests[5].resolve({user_id:'another-user',company_id:'a',enabled:true});await Promise.resolve();assert.equal(context,null);
window.dispatchEvent(new Event('module'));requests[6].reject(new Error('network'));await Promise.resolve();await Promise.resolve();assert.equal(context,null);
window.dispatchEvent(new Event('focus'));cleanups[0]();requests[7].resolve({user_id:'u1',enabled:true});await Promise.resolve();assert.equal(context,null);
const count=requests.length;window.dispatchEvent(new Event('profile'));assert.equal(requests.length,count);
// A new auth identity must not render the prior user's context before effects run.
const renderHook=run(()=>[{user_id:'u1',company_id:'a',enabled:true},()=>{}],()=>{},rpc,window,'managed','module','profile');
assert.equal(renderHook('u1').company_id,'a');assert.equal(renderHook('u2'),null);assert.equal(renderHook(null),null);
// Company/user draft recovery is explicit and keeps the original server revision.
const memory=new Map();const storage={getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)};
persistDraft(storage,'u1','a',{id:'r1',revision:4,draft:{title:'Meaningful local text',procedure:'Local work'}});
assert.equal(readDraft(storage,'u1','a').revision,4);
assert.equal(readDraft(storage,'u2','a'),null);assert.equal(readDraft(storage,'u1','b'),null);
memory.set('expo:kshms:draft:v1:u1:a','{broken');assert.equal(readDraft(storage,'u1','a'),null);
assert(!createGlobalAppTabs().some(([id])=>id==='kshms'));assert(createGlobalAppTabs({canUseKshms:true}).some(([id])=>id==='kshms'));
assert(!createProjectWorkspaceTabs().some(([id])=>id==='kshms'));
assert(suggestedRoutines(['maler'],'våtrom').some(r=>r.key==='wetroom'));
assert(!suggestedRoutines(['maler'],'fasade').some(r=>r.key==='wetroom'));
assert(!suggestedRoutines(['tomrer'],'montering').some(r=>r.key==='chemicals'));
assert(ROUTINE_CATALOG.length===12);
for(const routine of ROUTINE_CATALOG){assert(routine.procedure && routine.references.length);for(const ref of routine.references)assert(ref.checked_on==='2026-10-05'&&/^https:\/\//.test(ref.url));}
assert.deepEqual(currentVersionSnapshot({routines:[{id:'r1'},{id:'r2',archived:true}],versions:[{routine_id:'r1',id:'v2',content_hash:'new'},{routine_id:'r1',id:'v1',content_hash:'old'}]}),[{id:'v2',hash:'new'}]);
const coverage=JSON.parse(fs.readFileSync('docs/kshms/coverage.json','utf8'));
assert.equal(coverage.topics.filter(r=>r.id.startsWith('K')).length,105);assert.equal(coverage.topics.filter(r=>r.id.startsWith('K')&&r.personal_pages!=='—').length,88);
for(const [field,total] of [['quality_pages',148],['personal_pages',127]]){
 const pages=new Set();for(const row of coverage.topics)for(const section of row[field].split(';')){const range=section.split('–').map(Number);if(range.every(Number.isFinite))for(let page=range[0];page<=(range[1]||range[0]);page++)pages.add(page);}
 for(let page=1;page<=total;page++)assert(pages.has(page),`Source page ${field}:${page} missing`);
}
assert(fs.readFileSync('supabase/migrations/20261005195941_kshms_handbook_foundation.sql','utf8').includes(ACK_STATEMENT));
// Multi-selection saves every chosen draft. Retrying must preserve an existing
// company adaptation, including when a save committed but its response was lost.
function libraryServer({failAt=0,lostResponse=false}={}) {
 let calls=0,fail=true;
 const saved=[],commands=[];
 return {saved,commands,rpc:async(name,args)=>{
  assert.equal(args.p_company_id,'a');
  if(name==='kshms_get_state')return {context:{company_id:'a',manage:true},routines:structuredClone(saved)};
  assert.equal(name,'kshms_command');assert.equal(args.p_action,'save');
  commands.push(structuredClone(args.p_payload));calls++;
  if(fail&&calls===failAt&&!lostResponse){fail=false;throw new Error('Temporary network failure');}
  const row={id:`routine-${calls}`,revision:1,archived:false,draft:structuredClone(args.p_payload.draft)};
  saved.push(row);
  if(fail&&calls===failAt){fail=false;throw new Error('Response lost after commit');}
  return {id:row.id,revision:1};
 }};
}
const recommended=suggestedRoutines([], '', '', '');
assert.equal(recommended.length,10);
const chosen=recommended.map(r=>r.key),batch=libraryServer(),progress=[];
const firstBatch=await addLibraryRoutines({companyId:'a',keys:[...chosen,chosen[0]],rpc:batch.rpc,onProgress:value=>progress.push(value)});
assert.equal(firstBatch.addedCount,10);assert.equal(firstBatch.error,null);assert.equal(batch.saved.length,10);
assert.deepEqual(new Set(firstBatch.confirmedKeys),new Set(chosen));assert.equal(batch.commands.length,10);
assert(batch.commands.every(p=>p.id===null&&p.revision===0));assert.deepEqual(progress.at(-1),{completed:10,total:10});
batch.saved[0].draft.procedure='Firmaets egen tilpasning som må beholdes';
const retry=await addLibraryRoutines({companyId:'a',keys:ROUTINE_CATALOG.map(r=>r.key),rpc:batch.rpc});
assert.equal(retry.addedCount,2);assert.equal(retry.skippedCount,10);assert.equal(batch.saved.length,12);
assert.equal(batch.saved[0].draft.procedure,'Firmaets egen tilpasning som må beholdes');
assert.equal(batch.commands.length,12,'Re-selected templates overwrote or duplicated company drafts');
for(const lostResponse of [false,true]){
 const interrupted=libraryServer({failAt:3,lostResponse});
 const partial=await addLibraryRoutines({companyId:'a',keys:chosen,rpc:interrupted.rpc});
 assert(partial.error);assert.equal(partial.addedCount,lostResponse?3:2);
 assert.equal(interrupted.commands.length,3,'Batch continued after a failed save');
 const complete=await addLibraryRoutines({companyId:'a',keys:chosen,rpc:interrupted.rpc});
 assert.equal(complete.error,null);assert.equal(interrupted.saved.length,10);
 assert.equal(new Set(interrupted.saved.map(r=>r.draft.source_key)).size,10,'Retry duplicated a save with a lost response');
}
const invalid=libraryServer();await assert.rejects(addLibraryRoutines({companyId:'a',keys:['unknown'],rpc:invalid.rpc}));assert.equal(invalid.commands.length,0);
const wrongScope=await addLibraryRoutines({companyId:'a',keys:chosen,rpc:async()=>({context:{company_id:'b',manage:true},routines:[]})});
assert(wrongScope.error);assert.equal(wrongScope.confirmedKeys.length,0);
let active=true;const abandoned=libraryServer();
const stopped=await addLibraryRoutines({companyId:'a',keys:chosen,isCurrent:()=>active,rpc:async(name,args)=>{const value=await abandoned.rpc(name,args);if(name==='kshms_command')active=false;return value;}});
assert.equal(stopped.cancelled,true);assert.equal(abandoned.commands.length,1,'Old company batch continued after its workspace unmounted');
assert.equal(routinesBySource([{archived:true,draft:{source_key:chosen[0]}}]).size,0);
assert.equal(selectedCatalogRoutines([chosen[0],chosen[0]]).length,1);
// Exercise the actual opening/publishing handlers, using the same source-based
// runtime approach as the access hook above. Opening an approval must never
// publish; each click must reveal the panel, even for the already open routine.
const moduleSource=fs.readFileSync('src/modules/kshms/KshmsModule.jsx','utf8');
const openingStart=moduleSource.indexOf(' const choosePublication=');
const publishingEnd=moduleSource.indexOf(' const addSelected=');
assert(openingStart>=0&&publishingEnd>openingStart,'Approval opening lacks a visible focus/scroll action');
const approvalUi={busy:false,dirty:false,publication:null,summary:'old comment',freshAck:false,focus:0,overviewFocus:0,flowFocus:0,feedback:'',error:'',notice:''};
const approvalCommands=[];
const setters=['publication','summary','freshAck','focus','overviewFocus','flowFocus','feedback','error','notice'].map(key=>next=>{approvalUi[key]=typeof next==='function'?next(approvalUi[key]):next;});
const approvalHandlers=()=>new Function('busy','dirty','publication','summary','freshAck','data','run','setPublication','setSummary','setFreshAck','setPublicationFocus','setOverviewFocus','setFlowFocus','setPublicationFeedback','setError','setNotice',moduleSource.slice(openingStart,publishingEnd)+';return {choosePublication,publishRoutine};')(
 approvalUi.busy,approvalUi.dirty,approvalUi.publication,approvalUi.summary,approvalUi.freshAck,{versions:[]},async(action,payload)=>{approvalCommands.push({action,payload});return {id:`v-${payload.id}`,number:1};},...setters);
const firstRoutine={id:'r-one',revision:2,draft:{title:'First routine'}},secondRoutine={id:'r-two',revision:4,draft:{title:'Second routine'}};
approvalHandlers().choosePublication(firstRoutine);
assert.equal(approvalUi.publication.id,'r-one');assert.equal(approvalUi.summary,'');assert.equal(approvalUi.freshAck,true);assert.equal(approvalUi.focus,1);assert.equal(approvalCommands.length,0);
await approvalHandlers().publishRoutine();assert.equal(approvalCommands.length,0,'Empty assessment published a routine');
approvalUi.summary='Own assessment';approvalUi.freshAck=false;
approvalHandlers().choosePublication(firstRoutine);assert.equal(approvalUi.summary,'Own assessment');assert.equal(approvalUi.freshAck,false);assert.equal(approvalUi.focus,2,'Clicking the already open routine did not reveal it');
approvalHandlers().choosePublication(secondRoutine);assert.equal(approvalUi.publication.id,'r-two');assert.equal(approvalUi.summary,'');assert.equal(approvalUi.focus,3);
approvalUi.summary='Second reviewed';await approvalHandlers().publishRoutine();
assert.equal(approvalUi.publication,null);assert.equal(approvalCommands.length,1);assert.deepEqual(approvalCommands[0].payload,{id:'r-two',revision:4,change_summary:'Second reviewed',requires_ack:true});assert.equal(approvalUi.flowFocus,1,'Publishing must reveal the next action');assert(approvalUi.feedback.includes('Second routine'));
approvalHandlers().choosePublication(firstRoutine);approvalUi.summary='First reviewed';await approvalHandlers().publishRoutine();assert.equal(approvalCommands[1].payload.id,'r-one');assert.equal(approvalCommands[1].payload.change_summary,'First reviewed');
approvalUi.busy=true;approvalHandlers().choosePublication(secondRoutine);assert.equal(approvalUi.publication,null);await approvalHandlers().publishRoutine();assert.equal(approvalCommands.length,2);
approvalUi.busy=false;approvalHandlers().choosePublication(firstRoutine);approvalUi.summary='Valid assessment';approvalUi.dirty=true;await approvalHandlers().publishRoutine();assert.equal(approvalCommands.length,2,'Unsaved edits must not approve stale saved content');
const approvalEffect=moduleSource.match(/useEffect\(\(\)=>\{if\(publicationFocus[\s\S]*?\},\[publicationFocus\]\);/);
assert(approvalEffect,'Opening approval does not focus its visible panel');
const revealed=[];new Function('useEffect','publicationFocus','publicationRef',approvalEffect[0])(effect=>effect(),1,{current:{focus:()=>revealed.push('focus'),scrollIntoView:options=>revealed.push(options.block)}});
assert.deepEqual(revealed,['focus','start']);assert(moduleSource.includes('onClick={()=>choosePublication(r)}'));
const flowEffect=moduleSource.match(/useEffect\(\(\)=>\{if\(flowFocus[\s\S]*?\},\[flowFocus,screen\]\);/);
assert(flowEffect,'Next step must reveal its destination');
for(const screen of ['handbook','setup','followup']){
 const targets=[];const target=name=>({current:{focus:()=>targets.push(name),scrollIntoView:options=>targets.push(options.block)}});
 new Function('useEffect','flowFocus','screen','flowRef','setupRef','followupRef',flowEffect[0])(effect=>effect(),1,screen,target('handbook'),target('setup'),target('followup'));
 assert.deepEqual(targets,[screen,'start']);
}
// JSONB key order is irrelevant; actual text, source changes and array order
// are significant. A published v1 must remain unchanged while v2 is a draft.
const v1Content={title:'Safe work',procedure:'Before change',references:[{title:'Rule',url:'https://example.invalid/rule',checked_on:'2026-10-05'}]};
const draftRoutine={id:'r1',archived:false,draft:structuredClone(v1Content)};
const versionOne={id:'v1',routine_id:'r1',number:1,content:structuredClone(v1Content)};
const handbook={members:[{id:'u1',workspace_role:'firmaadmin'}],settings:{responsible_user_id:'u1'},routines:[draftRoutine],versions:[]};
assert.equal(handbookProgress({...handbook,settings:null}).step,'setup');
assert.equal(handbookProgress({...handbook,routines:[]}).step,'selection');
assert.equal(routineApprovalState(draftRoutine,[]).status,'draft');assert.equal(handbookProgress(handbook).step,'approval');
handbook.versions.push(versionOne);assert.equal(handbookProgress(handbook).step,'followup');assert.equal(handbookProgress(handbook).approved,1);
assert(sameRoutineContent({procedure:v1Content.procedure,references:v1Content.references,title:v1Content.title},v1Content));
draftRoutine.draft.procedure='After change';assert.equal(routineApprovalState(draftRoutine,handbook.versions).status,'changed');assert.equal(handbookProgress(handbook).step,'approval');
assert.equal(versionOne.content.procedure,'Before change','Editing rewrote the signed version');
handbook.versions.push({id:'v2',routine_id:'r1',number:2,content:structuredClone(draftRoutine.draft)});
assert.equal(routineApprovalState(draftRoutine,handbook.versions).current.id,'v2');assert.equal(handbookProgress(handbook).step,'followup');
assert.equal(routineApprovalState(draftRoutine,[{...versionOne,routine_id:'other'}]).status,'draft');
assert(!sameRoutineContent({steps:['a','b']},{steps:['b','a']}));
assert.equal(handbookProgress({...handbook,routines:[{...draftRoutine,archived:true}]}).step,'selection');
assert.equal(handbookProgress({...handbook,members:[{id:'u1',enabled:false,role:'responsible'}]}).step,'setup','Revoked responsible must not mark setup ready');
assert.equal(handbookProgress({...handbook,members:[{id:'u1',enabled:true,role:'responsible'}]}).step,'followup');
// Actual setup handler composes existing access/settings commands. Failure of
// the second call may retain a grant; it must say so and preserve the setup.
const setupStart=moduleSource.indexOf(' const saveSetup=');
const setupEnd=moduleSource.indexOf(' if(!data)return',setupStart);
assert(setupStart>=0&&setupEnd>setupStart);
async function setupScenario({member={id:'u1',workspace_role:'ansatt',enabled:false,role:'reader'},admin=true,failSettings=false,active=true}={}){
 const ui={error:'',screen:'setup',focus:0,broadcast:0},commands=[];
 const setup={trades:['vvs'],responsible_user_id:'u1',activities:'Local text'},scope={active};
 const saveSetup=new Function('busy','setup','data','requestScope','run','setError','setScreen','setFlowFocus','publishManagedAccessChange',moduleSource.slice(setupStart,setupEnd)+';return saveSetup;')(false,setup,{members:member?[member]:[],context:{administer:admin}},{current:scope},async(action,payload)=>{commands.push({action,payload:structuredClone(payload)});return action==='settings'&&failSettings?null:{revision:1};},next=>{ui.error=typeof next==='function'?next(ui.error):next;},next=>{ui.screen=next;},next=>{ui.focus=next(ui.focus);},()=>ui.broadcast++);
 await saveSetup({preventDefault(){}});return {ui,commands,setup};
}
const appointment=await setupScenario();assert.deepEqual(appointment.commands.map(c=>c.action),['access','settings']);assert.equal(appointment.ui.screen,'handbook');assert.equal(appointment.ui.broadcast,1);
assert.deepEqual(appointment.commands[0].payload,{user_id:'u1',role:'responsible',enabled:true});
const selfAppointment=await setupScenario({member:{id:'u1',workspace_role:'firmaadmin'}});assert.deepEqual(selfAppointment.commands.map(c=>c.action),['settings']);
const partialAppointment=await setupScenario({failSettings:true});assert(partialAppointment.ui.error.includes('tilgang, men oppstart kunne ikke bekreftes'));assert.equal(partialAppointment.setup.activities,'Local text');assert.equal(partialAppointment.ui.screen,'setup');assert.equal(partialAppointment.ui.broadcast,0);
assert.equal((await setupScenario({member:null})).commands.length,0,'Unknown/foreign user reached an access command');
assert.equal((await setupScenario({admin:false})).commands.length,0,'Responsible tried to grant another person');
assert.equal((await setupScenario({active:false})).commands.length,0,'Unmounted scope started an appointment command');
// Saving an edited approved routine must open approval of the returned saved
// revision. Saving unchanged content must not invent a new approval requirement.
const saveStart=moduleSource.indexOf(' const save=');
const saveEnd=moduleSource.indexOf(' const saveSetup=',saveStart);
async function saveScenario(changed){
 const ui={cached:true,dirty:true,editor:true,publication:null,notice:'',focus:0},commands=[];
 const draft={...structuredClone(versionOne.content),procedure:changed?'New saved procedure':versionOne.content.procedure};
 const save=new Function('editor','sources','data','run','validateReferences','window','draftKey','userId','companyId','setCached','setDirty','setEditor','routineApprovalState','choosePublication','setNotice','setFlowFocus',moduleSource.slice(saveStart,saveEnd)+';return save;')(
  {id:'r1',revision:5,draft},draft.references,{context:{publish:true},versions:[versionOne]},async(action,payload)=>{commands.push({action,payload});return {id:'r1',revision:6};},refs=>refs,{localStorage:{removeItem(){}}},()=>'', 'u1','a',next=>{ui.cached=next;},next=>{ui.dirty=next;},next=>{ui.editor=next;},routineApprovalState,next=>{ui.publication=next;},next=>{ui.notice=next;},next=>{ui.focus=next(ui.focus);});
 await save({preventDefault(){}});return {ui,commands};
}
const savedChange=await saveScenario(true);assert.equal(savedChange.ui.publication.revision,6);assert.equal(savedChange.ui.publication.draft.procedure,'New saved procedure');assert.equal(savedChange.commands.length,1);assert.equal(savedChange.commands[0].action,'save');assert.equal(savedChange.ui.dirty,false);
const savedUnchanged=await saveScenario(false);assert.equal(savedUnchanged.ui.publication,null);assert(savedUnchanged.ui.notice.includes('uten nye innholdsendringer'));assert.equal(savedUnchanged.ui.focus,1);assert.equal(versionOne.content.procedure,'Before change');
console.log('critical-kshms-check: OK – handbook progression/changed versions, composed appointment/failure, approval reveal/next step, multi-select/retry, grant/profile races, scoped recovery and 275 source pages');
