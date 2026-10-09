import './critical-kshms-legacy-extract-check.mjs';
import './critical-kshms-attachment-archive-check.mjs';
import './critical-kshms-deviation-extract-check.mjs';
import fs from 'node:fs';
import './critical-kshms-inspection-extract-check.mjs';
import assert from 'node:assert/strict';
import './critical-kshms-source-updates-check.mjs';
import {readDraft,persistDraft,routineApprovalState,handbookProgress,sameRoutineContent,pendingReadingVersions} from '../src/modules/kshms/kshmsDraft.mjs';
import {ROUTINE_CATALOG,suggestedRoutines,currentVersionSnapshot,ACK_STATEMENT} from '../src/modules/kshms/kshmsCatalog.mjs';
import {addLibraryRoutines,routinesBySource,selectedCatalogRoutines} from '../src/modules/kshms/kshmsLibrary.mjs';
import {createGlobalAppTabs,createProjectWorkspaceTabs} from '../src/modules/project/projectNavigationTabs.mjs';
import {fillEmptySetup,changeSetupTrades,routineWithSuggestions,fillEmptyRoutine,ROUTINE_WRITING_TIPS} from '../src/modules/kshms/kshmsWriting.mjs';
import {filterFirmRoutines,matchesRoutineSearch} from '../src/modules/kshms/kshmsSearch.mjs';
import {acknowledgmentOverview,pendingAssignmentOptions} from '../src/modules/kshms/kshmsFollowup.mjs';
import {personalHandbook,identityText} from '../src/modules/kshms/kshmsPersonal.mjs';
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
// Actual hook + mount gate: changing another employee's access must not erase
// unsaved setup, editor, search or assessment. Own/unscoped events still hide
// access immediately, and a stale response must not undo a later revocation.
const memberWindow=new EventTarget(),memberRequests=[];let memberContext,workspace;
run(initial=>{memberContext=initial;return[initial,next=>{memberContext=typeof next==='function'?next(memberContext):next;if(!memberContext?.enabled)workspace=null;else workspace||={screen:'setup',activities:'Egen ulagret tekst',query:'våtrom',assessment:'Egen vurdering'};}];},effect=>effect(),()=>new Promise((resolve,reject)=>memberRequests.push({resolve,reject})),memberWindow,'managed','module','profile')('admin');
const adminContext={user_id:'admin',company_id:'a',enabled:true,manage:true,publish:true,administer:true};
memberRequests[0].resolve(adminContext);await Promise.resolve();const originalWorkspace=workspace;
const memberEvent=userId=>{const event=new Event('managed');event.detail={source:'kshms-member-access',userId,companyId:'a'};memberWindow.dispatchEvent(event);};
memberEvent('employee-one');assert.equal(workspace,originalWorkspace,'Grant for another member unmounted the workspace');
memberRequests[1].resolve({...adminContext});await Promise.resolve();assert.equal(workspace.activities,'Egen ulagret tekst');
memberEvent('employee-two');assert.equal(workspace.assessment,'Egen vurdering');assert.equal(workspace.query,'våtrom');
memberEvent('admin');assert.equal(workspace,null,'Own access changes must fail closed immediately');
memberRequests[3].resolve({...adminContext,enabled:false});await Promise.resolve();memberRequests[2].resolve(adminContext);await Promise.resolve();assert.equal(memberContext.enabled,false,'Stale other-member response undid own revocation');
memberEvent('');assert.equal(workspace,null);
memberRequests[4].reject(new Error('Access check failed'));await Promise.resolve();await Promise.resolve();assert.equal(memberContext,null);

// Editable suggestions never replace meaningful saved/custom text. Only fields
// still owned by the suggestion may follow a later multi-trade selection.
const savedSetup={revision:7,trades:['vvs'],activities:'Firmaets faktiske oppgaver',responsibilities:'Eget ansvar',risks:''};
const preparedSetup=fillEmptySetup(savedSetup);assert.equal(savedSetup.risks,'');assert.deepEqual(preparedSetup.filled,['risks']);
assert.equal(preparedSetup.setup.activities,savedSetup.activities);assert.equal(preparedSetup.setup.revision,7);
const preparedTrades=changeSetupTrades(preparedSetup.setup,['vvs','maler'],new Set(preparedSetup.filled));
assert.equal(preparedTrades.activities,savedSetup.activities);assert(preparedTrades.risks.includes('lekkasjer'));assert(preparedTrades.risks.includes('ventilasjon'));
const customRisk={...preparedTrades,risks:'Firmaets egen vurdering'};
assert.equal(changeSetupTrades(customRisk,['tomrer'],new Set()).risks,customRisk.risks);
const deliberatelyCleared={...customRisk,risks:''};assert.equal(changeSetupTrades(deliberatelyCleared,['tomrer'],new Set()).risks,'','Trade selection replaced a field the user cleared');
const proposedRoutine=routineWithSuggestions();assert.equal(proposedRoutine.title,'');assert.equal(proposedRoutine.source_key,null);assert(proposedRoutine.procedure.includes('1.'));
const localRoutine={...proposedRoutine,goal:'Firmaets egne mål',documentation:''};const filledRoutine=fillEmptyRoutine(localRoutine);
assert.equal(localRoutine.documentation,'');assert.equal(filledRoutine.goal,'Firmaets egne mål');assert(filledRoutine.documentation);
for(const draft of [proposedRoutine,filledRoutine])for(const tip of Object.values(ROUTINE_WRITING_TIPS))assert(!JSON.stringify(draft).includes(tip),'Editor guidance leaked into routine content');

// A reader search cannot discover draft wording or another employee's edition,
// even when an over-broad synthetic state is supplied. The server remains the
// real authorization boundary; search does not make broader API calls.
const searchState={context:{manage:false,user_id:'reader'},routines:[{id:'r1',draft:{title:'Hemmelig utkast'}},{id:'r2',draft:{title:'Personalnotat'}}],versions:[{id:'own',routine_id:'r1',number:1,content:{title:'Våtrom',chapter:'Fag og kvalitet',procedure:'Kontroll av membran'}},{id:'other',routine_id:'r2',number:1,content:{title:'Bare andre'}}],assignments:[{user_id:'reader',version_id:'own'},{user_id:'another',version_id:'other'}]};
assert.equal(filterFirmRoutines(searchState,'').length,1);assert.equal(filterFirmRoutines(searchState,'vatrom membran').length,1);
assert.equal(filterFirmRoutines(searchState,'hemmelig').length,0);assert.equal(filterFirmRoutines(searchState,'personal').length,0);assert.equal(filterFirmRoutines(searchState,'andre').length,0);
assert.equal(filterFirmRoutines({...searchState,context:{manage:true,user_id:'admin'}},'hemmelig').length,1);
assert.equal(filterFirmRoutines({...searchState,context:{manage:true,user_id:'admin'}},'membran').length,1,'Published wording disappeared from a manager search after draft changes');
assert(matchesRoutineSearch({title:'VERKTØY',procedure:'Før kontroll'},'verktoy for'));assert(!matchesRoutineSearch({title:'Våtrom'},'våtrom kjemikalier'));
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
assert.equal(ROUTINE_CATALOG.length,73,'A2 contains the 12 stable starting keys and 61 specific additional drafts');
assert.equal(new Set(ROUTINE_CATALOG.map(r=>r.source_key)).size,ROUTINE_CATALOG.length);
assert.equal(new Set(ROUTINE_CATALOG.map(r=>r.procedure)).size,ROUTINE_CATALOG.length,'Generic repeated bodies do not cover independent topics');
for(const routine of ROUTINE_CATALOG){assert(routine.procedure && routine.references.length);assert(!/fyll inn/i.test(routine.procedure),'Writing instructions belong outside routine content');for(const tip of Object.values(ROUTINE_WRITING_TIPS))assert(!JSON.stringify(routine).includes(tip));for(const ref of routine.references)assert(ref.checked_on===((Object.hasOwn(routine,'recommendation')||['leadership','leave','deviations','emergency'].includes(routine.key))?'2026-10-06':'2026-10-05')&&/^https:\/\//.test(ref.url));}
assert.deepEqual(currentVersionSnapshot({routines:[{id:'r1'},{id:'r2',archived:true}],versions:[{routine_id:'r1',id:'v2',content_hash:'new'},{routine_id:'r1',id:'v1',content_hash:'old'}]}),[{id:'v2',hash:'new'}]);
const coverage=JSON.parse(fs.readFileSync('docs/kshms/coverage.json','utf8'));
assert.equal(coverage.topics.filter(r=>r.id.startsWith('K')).length,105);assert.equal(coverage.topics.filter(r=>r.id.startsWith('K')&&r.personal_pages!=='—').length,88);
for(const row of coverage.topics.filter(r=>!r.id.startsWith('M'))){
 assert(ROUTINE_CATALOG.some(r=>r.coverage.includes(row.id)),`Content theme ${row.id} lacks a written draft`);
 assert.deepEqual(row.library_keys,ROUTINE_CATALOG.filter(r=>r.coverage.includes(row.id)).map(r=>r.key));
}
assert(ROUTINE_CATALOG.find(r=>r.key==='infection').procedure.includes('eldre koronaregler'));
assert(ROUTINE_CATALOG.find(r=>r.key==='whistleblowing').procedure.includes('ordinære'));
assert(!suggestedRoutines().some(r=>['asbestos','gps','confined'].includes(r.key)));
assert(suggestedRoutines([],'rehabilitering med asbest').some(r=>r.key==='asbestos'));
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
assert.equal(retry.addedCount,ROUTINE_CATALOG.length-10);assert.equal(retry.skippedCount,10);assert.equal(batch.saved.length,ROUTINE_CATALOG.length);
assert.equal(batch.saved[0].draft.procedure,'Firmaets egen tilpasning som må beholdes');
assert.equal(batch.commands.length,ROUTINE_CATALOG.length,'Re-selected templates overwrote or duplicated company drafts');
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
// User-requested flow change: confirmed publication opens the next pending
// routine, replacing the old top-card target. Opening never approves, and the
// next assessment/checkbox must not inherit the previous user's decision.
const moduleSource=fs.readFileSync('src/modules/kshms/KshmsModule.jsx','utf8');
const openingStart=moduleSource.indexOf(' const choosePublication=');
const publishingEnd=moduleSource.indexOf(' const chooseReading=');
assert(openingStart>=0&&publishingEnd>openingStart,'Approval opening lacks a visible focus/scroll action');
const firstRoutine={id:'r-one',revision:2,draft:{title:'First routine'}},secondRoutine={id:'r-two',revision:4,draft:{title:'Second routine'}};
const approvalUi={busy:false,dirty:false,publication:null,summary:'old comment',freshAck:false,selfAcknowledgment:false,focus:0,overviewFocus:0,flowFocus:0,completionFocus:0,feedback:'',error:'',notice:'',query:'Second',screen:'handbook'};
const approvalState={context:{company_id:'a',user_id:'u1',manage:true,publish:true},members:[{id:'u1',workspace_role:'firmaadmin'}],settings:{responsible_user_id:'u1'},routines:structuredClone([firstRoutine,secondRoutine]),versions:[],acknowledgments:[]};
const approvalCommands=[],approvalScope={current:{active:true}};let failPublication=false,afterPublication=null;
const changeUi=(ui,key)=>next=>{ui[key]=typeof next==='function'?next(ui[key]):next;};
const approvalHandlers=()=>new Function('bindings','const {'+Object.keys(bindingsForApproval()).join(',')+'}=bindings;'+moduleSource.slice(openingStart,publishingEnd)+';return {choosePublication,publishRoutine};')(bindingsForApproval());
function bindingsForApproval(){return {
 busy:approvalUi.busy,dirty:approvalUi.dirty,publication:approvalUi.publication,summary:approvalUi.summary,freshAck:approvalUi.freshAck,selfAcknowledgment:approvalUi.selfAcknowledgment,ACK_STATEMENT,data:structuredClone(approvalState),requestScope:approvalScope,companyId:'a',userId:'u1',handbookQuery:approvalUi.query,handbookProgress,matchesRoutineSearch,
 run:async(action,payload,success,onSaved)=>{approvalCommands.push({action,payload});if(failPublication)return null;const row=approvalState.routines.find(row=>row.id===payload.id),result={id:`v-${payload.id}-${approvalCommands.length}`,number:approvalState.versions.filter(v=>v.routine_id===row.id).length+1};approvalState.versions.push({...result,routine_id:row.id,content:structuredClone(row.draft)});if(payload.acknowledge_self)approvalState.acknowledgments.push({version_id:result.id,user_id:'u1',statement:payload.self_statement});row.revision++;afterPublication?.();onSaved(result,structuredClone(approvalState));return result;},
 setPublication:changeUi(approvalUi,'publication'),setSummary:changeUi(approvalUi,'summary'),setFreshAck:changeUi(approvalUi,'freshAck'),setSelfAcknowledgment:changeUi(approvalUi,'selfAcknowledgment'),setPublicationFocus:changeUi(approvalUi,'focus'),setOverviewFocus:changeUi(approvalUi,'overviewFocus'),setFlowFocus:changeUi(approvalUi,'flowFocus'),setCompletionFocus:changeUi(approvalUi,'completionFocus'),setPublicationFeedback:changeUi(approvalUi,'feedback'),setError:changeUi(approvalUi,'error'),setNotice:changeUi(approvalUi,'notice'),setHandbookQuery:changeUi(approvalUi,'query')
};}
approvalHandlers().choosePublication(firstRoutine);
assert.equal(approvalUi.publication.id,'r-one');assert.equal(approvalUi.summary,'');assert.equal(approvalUi.freshAck,true);assert.equal(approvalUi.focus,1);assert.equal(approvalCommands.length,0);
await approvalHandlers().publishRoutine();assert.equal(approvalCommands.length,0,'Empty assessment published a routine');
approvalUi.summary='Own assessment';approvalUi.freshAck=false;
approvalHandlers().choosePublication(firstRoutine);assert.equal(approvalUi.summary,'Own assessment');assert.equal(approvalUi.freshAck,false);assert.equal(approvalUi.focus,2,'Clicking the already open routine did not reveal it');
approvalHandlers().choosePublication(secondRoutine);assert.equal(approvalUi.publication.id,'r-two');assert.equal(approvalUi.summary,'');assert.equal(approvalUi.focus,3);
approvalUi.summary='Second reviewed';await approvalHandlers().publishRoutine();
assert.equal(approvalCommands.length,1);assert.deepEqual(approvalCommands[0].payload,{id:'r-two',revision:4,change_summary:'Second reviewed',requires_ack:true});assert(approvalUi.feedback.includes('Second routine'));
assert.equal(approvalUi.publication.id,'r-one','Confirmed publication did not open the next pending routine');assert.equal(approvalUi.summary,'','Previous assessment was reused for another routine');assert.equal(approvalUi.focus,4);assert.equal(approvalUi.completionFocus,0);assert.equal(approvalUi.flowFocus,0);assert.equal(approvalUi.query,'','Search hid the next pending routine');
assert.equal(approvalState.versions.length,1,'Opening the next routine published it automatically');
const originalPublished=structuredClone(approvalState.versions[0]);
assert.equal(approvalUi.selfAcknowledgment,false,'Next routine inherited own confirmation');assert.equal(approvalState.acknowledgments.length,0,'Publication without explicit own confirmation added an acknowledgment');
approvalUi.summary='First reviewed';approvalUi.selfAcknowledgment=true;await approvalHandlers().publishRoutine();
assert.equal(approvalCommands[1].payload.acknowledge_self,true);assert.equal(approvalCommands[1].payload.self_statement,ACK_STATEMENT);assert.equal(approvalState.acknowledgments.length,1);assert.equal(approvalUi.selfAcknowledgment,false);assert(approvalUi.feedback.includes('Din egen gjennomgang er også bekreftet'));assert.equal(approvalCommands[1].payload.id,'r-one');assert.equal(approvalCommands[1].payload.change_summary,'First reviewed');assert.equal(approvalUi.publication,null);assert.equal(approvalUi.summary,'');assert.equal(approvalUi.completionFocus,1,'Last publication must focus completion at the bottom');assert.equal(approvalUi.flowFocus,0);assert.deepEqual(approvalState.versions[0],originalPublished,'Advancing rewrote a previously signed version');
approvalUi.busy=true;approvalHandlers().choosePublication(secondRoutine);assert.equal(approvalUi.publication,null);await approvalHandlers().publishRoutine();assert.equal(approvalCommands.length,2);
approvalUi.busy=false;approvalHandlers().choosePublication(firstRoutine);approvalUi.summary='Valid assessment';approvalUi.dirty=true;await approvalHandlers().publishRoutine();assert.equal(approvalCommands.length,2,'Unsaved edits must not approve stale saved content');
approvalUi.dirty=false;failPublication=true;const beforeFailure=approvalUi.focus;
await approvalHandlers().publishRoutine();assert.equal(approvalUi.publication.id,'r-one');assert.equal(approvalUi.summary,'Valid assessment');assert.equal(approvalUi.focus,beforeFailure,'Failed publication advanced the flow');assert.equal(approvalUi.completionFocus,1);
failPublication=false;afterPublication=()=>{approvalScope.current.active=false;};await approvalHandlers().publishRoutine();assert.equal(approvalUi.publication.id,'r-one','Unmounted scope advanced after a late response');assert.equal(approvalUi.focus,beforeFailure);
approvalScope.current={active:true};afterPublication=()=>{approvalUi.screen='setup';};await approvalHandlers().publishRoutine();assert.equal(approvalUi.screen,'setup','Late publication reversed deliberate tab navigation');

// Use the actual run wrapper. Fresh state is delivered only after command AND
// read both succeed. A lost/failed refresh must not pretend the flow completed.
const runStart=moduleSource.indexOf(' const run='),runEnd=moduleSource.indexOf(' const chooseEditor=',runStart);
const wrapper=moduleSource.slice(runStart,runEnd);
for(const failure of ['','command','refresh']){
 const stages=[],ui={busy:false,error:'',notice:''},serverState={marker:'fresh'};
 const command=new Function('bindings','const {kshmsRpc,companyId,load,setBusy,setError,setNotice,setupSuggestionFields,setSetup}=bindings;'+wrapper+';return run;')({kshmsRpc:async()=>{stages.push('command');if(failure==='command')throw new Error('Command failed');return {};},companyId:'a',load:async()=>{stages.push('read');if(failure==='refresh')throw new Error('Refresh failed');return serverState;},setBusy:changeUi(ui,'busy'),setError:changeUi(ui,'error'),setNotice:changeUi(ui,'notice'),setupSuggestionFields:{current:new Set()},setSetup(){}});
 const response=await command('ack',{},'',(_,state)=>{assert.equal(state,serverState);stages.push('confirmed');});
 assert.deepEqual(stages,failure==='command'?['command']:failure==='refresh'?['command','read']:['command','read','confirmed']);assert.equal(ui.busy,false);assert.equal(Boolean(response),!failure);if(failure)assert(ui.error);
}

// Employee auto-next uses only their own unacknowledged required editions. It
// ignores informational editions, missing IDs and somebody else's signatures.
const readerVersions=[{id:'old',number:1,requires_ack:false,content:{title:'First reading'}},{id:'next',number:2,requires_ack:true,content:{title:'Next reading'}},{id:'info',number:2,requires_ack:false,content:{title:'Information'}},{id:'other',number:1,requires_ack:true,content:{title:'Other employee'}}];
const readingState={context:{company_id:'a',user_id:'u1'},versions:structuredClone(readerVersions),assignments:[{user_id:'u1',version_id:'old'},{user_id:'u1',version_id:'next'},{user_id:'u1',version_id:'info'},{user_id:'u1',version_id:'missing'},{user_id:'u2',version_id:'other'}],acknowledgments:[{user_id:'u2',version_id:'old'}]};
assert.deepEqual(pendingReadingVersions(readingState,'u1').map(v=>v.id),['old','next']);assert.deepEqual(pendingReadingVersions(readingState,'u2').map(v=>v.id),['other']);
const readerUi={busy:false,reading:null,checked:false,feedback:'',error:'',notice:'',focus:0,query:'First',screen:'reading'},readerScope={current:{active:true}},readingCommands=[];let readingFailure=false,recordReading=true,afterReading=null;
const readingStart=moduleSource.indexOf(' const chooseReading='),readingEnd=moduleSource.indexOf(' const addSelected=',readingStart);
function bindingsForReading(){return {
 busy:readerUi.busy,reading:readerUi.reading,checked:readerUi.checked,requestScope:readerScope,companyId:'a',userId:'u1',readingQuery:readerUi.query,ACK_STATEMENT,pendingReadingVersions,matchesRoutineSearch,
 run:async(action,payload,success,onSaved)=>{readingCommands.push({action,payload});if(readingFailure)return null;if(recordReading)readingState.acknowledgments.push({user_id:'u1',version_id:payload.version_id,statement:payload.statement});afterReading?.();onSaved({},structuredClone(readingState));return {};},
 setReading:changeUi(readerUi,'reading'),setChecked:changeUi(readerUi,'checked'),setReadingFeedback:changeUi(readerUi,'feedback'),setError:changeUi(readerUi,'error'),setNotice:changeUi(readerUi,'notice'),setReadingFocus:changeUi(readerUi,'focus'),setReadingQuery:changeUi(readerUi,'query')
};}
const readingHandlers=()=>new Function('bindings','const {'+Object.keys(bindingsForReading()).join(',')+'}=bindings;'+moduleSource.slice(readingStart,readingEnd)+';return {chooseReading,acknowledgeRoutine};')(bindingsForReading());
readingHandlers().chooseReading(readerVersions[0]);assert.equal(readerUi.focus,1);await readingHandlers().acknowledgeRoutine();assert.equal(readingCommands.length,0,'Unchecked employee confirmation reached the API');
readerUi.checked=true;readingFailure=true;await readingHandlers().acknowledgeRoutine();assert.equal(readerUi.reading.id,'old');assert.equal(readerUi.checked,true);assert.equal(readerUi.focus,1,'Failed acknowledgment advanced the employee');
readingFailure=false;recordReading=false;await readingHandlers().acknowledgeRoutine();assert.equal(readerUi.reading.id,'old');assert.equal(readerUi.checked,true);assert(readerUi.error.includes('bekreftelsen er lagret'),'Missing own acknowledgment was treated as a success');
recordReading=true;await readingHandlers().acknowledgeRoutine();assert.equal(readingCommands.at(-1).payload.statement,ACK_STATEMENT);assert.equal(readerUi.reading.id,'next');assert.equal(readerUi.checked,false,'Next edition inherited a checked confirmation');assert.equal(readerUi.focus,2);assert.equal(readerUi.query,'');assert(readerUi.feedback.includes('First reading'));assert.equal(pendingReadingVersions(readingState,'u1').length,1);
const firstAcknowledgment=structuredClone(readingState.acknowledgments.find(row=>row.user_id==='u1'));
readerUi.checked=true;await readingHandlers().acknowledgeRoutine();assert.equal(readerUi.reading,null);assert.equal(readerUi.checked,false);assert.equal(readerUi.focus,3);assert.equal(pendingReadingVersions(readingState,'u1').length,0);assert.deepEqual(readingState.acknowledgments.find(row=>row.user_id==='u1'),firstAcknowledgment);
readingHandlers().chooseReading(readerVersions[0]);readerUi.checked=true;readerUi.busy=true;const readingCount=readingCommands.length;await readingHandlers().acknowledgeRoutine();assert.equal(readingCommands.length,readingCount);readingHandlers().chooseReading(readerVersions[1]);assert.equal(readerUi.reading.id,'old');
readerUi.busy=false;afterReading=()=>{readerScope.current.active=false;};const readingFocusBeforeLate=readerUi.focus;await readingHandlers().acknowledgeRoutine();assert.equal(readerUi.reading.id,'old','Late acknowledgment changed an unmounted workspace');assert.equal(readerUi.focus,readingFocusBeforeLate);
readerScope.current={active:true};afterReading=()=>{readingState.context.company_id='b';};await readingHandlers().acknowledgeRoutine();assert.equal(readerUi.reading.id,'old','Foreign state advanced employee confirmation');assert.equal(readerUi.focus,readingFocusBeforeLate);
readingState.context.company_id='a';afterReading=()=>{readerUi.screen='handbook';};await readingHandlers().acknowledgeRoutine();assert.equal(readerUi.screen,'handbook','Late acknowledgment reversed deliberate tab navigation');

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
const readingEffect=moduleSource.match(/useEffect\(\(\)=>\{if\(readingFocus[\s\S]*?\},\[readingFocus\]\);/),completionEffect=moduleSource.match(/useEffect\(\(\)=>\{if\(completionFocus[\s\S]*?\},\[completionFocus\]\);/);
assert(readingEffect&&completionEffect,'Auto-next/completion must reuse the focus/scroll contract');
for(const reading of [readerVersions[0],null]){
 const targets=[],target=name=>({current:{focus:()=>targets.push(name),scrollIntoView:options=>targets.push(options.block)}});
 new Function('useEffect','readingFocus','reading','readingRef','readingDoneRef',readingEffect[0])(effect=>effect(),1,reading,target('reading'),target('done'));
 assert.deepEqual(targets,[reading?'reading':'done','start']);
}
const completionTargets=[];new Function('useEffect','completionFocus','completionRef',completionEffect[0])(effect=>effect(),1,{current:{focus:()=>completionTargets.push('bottom'),scrollIntoView:options=>completionTargets.push(options.block)}});assert.deepEqual(completionTargets,['bottom','start']);
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
 const ui={error:'',screen:'setup',focus:0,broadcast:0,broadcastDetail:null},commands=[];
 const setup={trades:['vvs'],responsible_user_id:'u1',activities:'Local text'},scope={active};
 const saveSetup=new Function('busy','setup','data','requestScope','run','setError','setScreen','setFlowFocus','publishManagedAccessChange','companyId',moduleSource.slice(setupStart,setupEnd)+';return saveSetup;')(false,setup,{members:member?[member]:[],context:{administer:admin}},{current:scope},async(action,payload)=>{commands.push({action,payload:structuredClone(payload)});return action==='settings'&&failSettings?null:{revision:1};},next=>{ui.error=typeof next==='function'?next(ui.error):next;},next=>{ui.screen=next;},next=>{ui.focus=next(ui.focus);},detail=>{ui.broadcast++;ui.broadcastDetail=detail;},'a');
 await saveSetup({preventDefault(){}});return {ui,commands,setup};
}
const appointment=await setupScenario();assert.deepEqual(appointment.commands.map(c=>c.action),['access','settings']);assert.equal(appointment.ui.screen,'handbook');assert.equal(appointment.ui.broadcast,1);
assert.deepEqual(appointment.ui.broadcastDetail,{source:'kshms-member-access',userId:'u1',companyId:'a'});
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
// The reported 40-line list is four employees with ten exact assignments.
// Grouping must shorten the overview without hiding a required edition,
// attributing another employee's signature or creating any new acknowledgment.
const followupState={members:Array.from({length:4},(_,i)=>({id:`employee-${i}`,email:`demo-${i}@example.invalid`,workspace_role:i?'ansatt':'firmaadmin',enabled:true})),versions:Array.from({length:10},(_,i)=>({id:`edition-${i}`,routine_id:`routine-${i}`,number:1,requires_ack:true,content:{title:`Routine ${i}`}})),assignments:[],acknowledgments:[]};
for(const member of followupState.members)for(const version of followupState.versions)followupState.assignments.push({user_id:member.id,version_id:version.id});
const unchangedFollowup=JSON.stringify(followupState),forty=acknowledgmentOverview(followupState);
assert.equal(forty.groups.length,4);assert.equal(forty.pendingMembers,4);assert.equal(forty.missing,40);
assert(forty.groups.every(group=>group.entries.length===10&&group.confirmed===0&&group.missing===10));
assert.equal(JSON.stringify(followupState),unchangedFollowup,'Overview changed assignments or confirmations');
assert.equal(pendingAssignmentOptions(followupState,followupState.versions).length,0,'Fully assigned editions left empty assignment sections');
followupState.acknowledgments.push({user_id:'employee-0',version_id:'edition-0',acknowledged_at:'2026-10-06T13:00:00Z'});
const thirtyNine=acknowledgmentOverview(followupState);
assert.equal(thirtyNine.missing,39);assert.equal(thirtyNine.groups.find(group=>group.userId==='employee-0').confirmed,1);
assert.equal(thirtyNine.groups.find(group=>group.userId==='employee-1').confirmed,0,'Another employee borrowed the first confirmation');
assert.equal(thirtyNine.groups.find(group=>group.userId==='employee-0').entries.find(row=>row.version.id==='edition-0').acknowledgment.acknowledged_at,'2026-10-06T13:00:00Z');
for(const version of followupState.versions.slice(1))followupState.acknowledgments.push({user_id:'employee-0',version_id:version.id,acknowledged_at:'2026-10-06T13:01:00Z'});
const thirty=acknowledgmentOverview(followupState);assert.equal(thirty.pendingMembers,3);assert.equal(thirty.missing,30);assert.equal(thirty.groups.at(-1).userId,'employee-0');assert.equal(thirty.groups.at(-1).confirmed,10);
followupState.assignments.push({...followupState.assignments[0]},{user_id:'employee-0',version_id:'missing-version'});
followupState.versions.push({id:'information-v2',routine_id:'routine-0',number:2,requires_ack:false,content:{title:'Information'}});followupState.assignments.push({user_id:'employee-0',version_id:'information-v2'});
assert.equal(acknowledgmentOverview(followupState).missing,30,'Duplicate, missing or informational edition inflated required progress');
followupState.versions.push({id:'required-v3',routine_id:'routine-0',number:3,requires_ack:true,content:{title:'Important change'}});followupState.assignments.push({user_id:'employee-0',version_id:'required-v3'});
const changedOverview=acknowledgmentOverview(followupState),changedEmployee=changedOverview.groups.find(group=>group.userId==='employee-0');
assert.equal(changedOverview.missing,31);assert.equal(changedEmployee.confirmed,10);assert.equal(changedEmployee.missing,1);assert.equal(changedEmployee.entries.length,11);assert.equal(followupState.acknowledgments.length,10,'Grouping rewrote old confirmation history');
const newcomer={id:'new-reader',email:'new@example.invalid',workspace_role:'ansatt',enabled:false};followupState.members.push(newcomer);
assert.equal(pendingAssignmentOptions(followupState,followupState.versions.slice(0,10)).length,0,'Newcomer without module access was offered assignment');
newcomer.enabled=true;const newOptions=pendingAssignmentOptions(followupState,followupState.versions.slice(0,10));assert.equal(newOptions.length,10);assert(newOptions.every(option=>option.members.length===1&&option.members[0].id===newcomer.id));
followupState.assignments.push({user_id:newcomer.id,version_id:'edition-0'});assert.equal(pendingAssignmentOptions(followupState,followupState.versions.slice(0,10)).length,9,'Assigned edition remained assignable to same newcomer');
assert.deepEqual(acknowledgmentOverview({...followupState,assignments:[]}),{groups:[],missing:0,pendingMembers:0});
const completeState=structuredClone(followupState);completeState.acknowledgments=completeState.assignments.map(row=>({...row,acknowledged_at:'2026-10-06T13:02:00Z'}));
assert.equal(acknowledgmentOverview(completeState).missing,0);assert.equal(acknowledgmentOverview(completeState).pendingMembers,0);
assert(moduleSource.includes('const followup=canManage?acknowledgmentOverview(data):null'),'Employee must not derive manager follow-up');
assert(moduleSource.includes("screen==='followup'&&canManage"),'Employee gained another user\'s progress view');
// A manager's personal lookup must include only their own exact assignments.
const personalState={context:{company_id:'a'},members:[],routines:[{id:'personal-routine',archived:false,draft:{title:'Private unpublished draft'}},{id:'other-routine'}],versions:[{id:'personal-v1',company_id:'a',routine_id:'personal-routine',number:1,content:{title:'Ferie',chapter:'Personal',procedure:'Planlegg ferie'}},{id:'personal-v2',company_id:'a',routine_id:'personal-routine',number:2,content:{title:'Ferie oppdatert',chapter:'Personal',procedure:'Avtal tidspunkt'}},{id:'not-assigned',company_id:'a',routine_id:'other-routine',number:1,content:{title:'Other employee'}},{id:'wrong-company',company_id:'b',routine_id:'other-routine',number:1,content:{title:'Wrong company'}}],assignments:[{user_id:'me',version_id:'personal-v1'},{user_id:'me',version_id:'personal-v2'},{user_id:'other',version_id:'not-assigned'},{user_id:'me',version_id:'wrong-company'},{user_id:'me',version_id:'missing'}],acknowledgments:[{user_id:'me',version_id:'personal-v1',acknowledged_at:'2026-10-06T13:00:00Z'},{user_id:'other',version_id:'personal-v2'}]};
const personalBefore=JSON.stringify(personalState),personal=personalHandbook(personalState,'me');
assert.equal(personal.all.length,1);assert.equal(personal.all[0].editions.length,2);assert.equal(personal.all[0].editions[0].version.id,'personal-v2');assert.equal(personal.all[0].editions[0].acknowledgment,null);assert.equal(personal.all[0].editions[1].acknowledgment.acknowledged_at,'2026-10-06T13:00:00Z');
assert.equal(personalHandbook(personalState,'me','planlegg').visible.length,1,'Older assigned text disappeared from personal lookup');assert.equal(personalHandbook(personalState,'me','private unpublished').visible.length,0);assert.equal(personalHandbook(personalState,'me','other employee').visible.length,0);assert.equal(personalHandbook(personalState,'none').all.length,0);assert.equal(JSON.stringify(personalState),personalBefore);
personalState.routines[0].archived=true;assert.equal(personalHandbook(personalState,'me').all[0].archived,true,'Archived version presented as active');
assert.equal(identityText({id:'u',name:'Demo Employee',email:'demo@example.invalid'}),'Demo Employee (demo@example.invalid)');assert.equal(identityText({name:'demo@example.invalid',email:'demo@example.invalid'}),'demo@example.invalid');
assert(moduleSource.includes("screen==='personal'"));assert(moduleSource.includes('Jeg bekrefter også egen gjennomgang av denne utgaven.'));assert(moduleSource.includes('confirmSelf&&!savedState.acknowledgments.some'));
console.log('critical-kshms-check: OK – own-only personal lookup and explicit combined confirmation; grouped 40 confirmations/four employees, exact progress/history and qualified new assignments; confirmed publication/own reading auto-next, last-item completion, failure and late-scope retention; targeted grant retention/revocation, suggestion ownership, reader-scoped search, handbook/version progression, appointment/failure, approval, multi-select/retry, scoped recovery and 275 source pages');
