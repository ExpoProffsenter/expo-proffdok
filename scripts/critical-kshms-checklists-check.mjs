import assert from 'node:assert/strict';
import fs from 'node:fs';
import { blankChecklist,checklistContent,checklistDraftKey,persistChecklistDraft,readChecklistDraft,sameChecklistContent,saveChecklistTemplate,appendProjectChecklist,projectChecklistTemplate,importPublishedChecklist } from '../src/modules/kshms/kshmsChecklists.mjs';

const company='11111111-1111-4111-8111-111111111111',template='22222222-2222-4222-8222-222222222222',version='33333333-3333-4333-8333-333333333333',point='44444444-4444-4444-8444-444444444444',instance='55555555-5555-4555-8555-555555555555';
const content={title:'Rørkontroll',trade:'Rørlegger',instructions:'Før innbygging',points:[{id:point,title:'Kontroller rørene',guidance:'Kontroller koblingene',image_required:true,comment_required:false}]};
const editor={id:template,revision:0,requestId:instance,content};
const published={id:version,template_id:template,company_id:company,number:1,content_hash:'hash1',content};
assert.equal(blankChecklist(()=>instance).content.title,'');
assert.equal(checklistContent({...content,title:' Rørkontroll '}).title,'Rørkontroll');
assert.equal(checklistContent({...content,points:[{...content.points[0],subform_version_id:version}]}).points[0].subform_version_id,version);
assert.throws(()=>checklistContent({...content,points:[{...content.points[0],subform_version_id:'bad'}]}),/gyldig underskjema/);
assert.throws(()=>checklistContent({...content,points:[content.points[0],{...content.points[0],id:instance,title:'kontroller rørene'}]}),/ulik tekst/);
const memory=new Map(),storage={getItem:key=>memory.get(key),setItem:(key,value)=>memory.set(key,value)};
persistChecklistDraft(storage,'admin',company,editor);assert.equal(readChecklistDraft(storage,'admin',company).requestId,instance);
assert.equal(readChecklistDraft(storage,'other',company),null);assert.equal(readChecklistDraft(storage,'admin',template),null);
memory.set(checklistDraftKey('admin',company),'broken');assert.equal(readChecklistDraft(storage,'admin',company),null);
for(const failure of ['command','read','text','foreign','late','']){
 let calls=0;
 const result=saveChecklistTemplate({companyId:company,userId:'admin',editor,action:'publish',isCurrent:()=>failure!=='late',rpc:async(name,args)=>{
  calls++;assert.equal(args.p_company_id,company);
  const row={id:template,company_id:company,revision:1,draft:content};
  if(name==='kshms_checklist_command'){assert.equal(args.p_request_id,editor.requestId);if(failure==='command')throw Error('not saved');return {template:row,version:published};}
  if(failure==='read')throw Error('read failed');return {context:{company_id:failure==='foreign'?template:company,user_id:'admin',manage:true},templates:[row],versions:[{...published,content:failure==='text'?{...content,title:'Changed text'}:content}]};
 }});
 if(['command','read','text','foreign'].includes(failure))await assert.rejects(result);else assert.equal(Boolean(await result),failure!=='late');
 assert.equal(calls,['command','late'].includes(failure)?1:2);
}
const copy={id:instance,company_id:company,template_id:template,version_id:version,version:1,content_hash:'hash1',content};
const nestedPoint='66666666-6666-4666-8666-666666666666';
const nestedContent={...content,root_points:[{...content.points[0],subform_version_id:instance}],points:[content.points[0],{...content.points[0],id:nestedPoint,title:'Underskjema · Trykkprøve · Kontroller trykk'}],dependencies:[{version_id:instance,template_id:point,number:3,content_hash:'nested-hash',title:'Trykkprøve',trade:'Rørlegger',content}]};
assert(sameChecklistContent(nestedContent,structuredClone(nestedContent)),'Exact dependency snapshot comparison failed');
assert(sameChecklistContent({...content,points:nestedContent.root_points},nestedContent),'Draft did not compare with published root points');
const nestedCopy=appendProjectChecklist({}, {...copy,content:nestedContent}).instance;
assert.equal(nestedCopy.content.dependencies[0].content_hash,'nested-hash');assert.equal(projectChecklistTemplate([nestedCopy])[0].items.length,2);
const original={projectName:'General or wetroom',projectDeviations:[{id:'legacy',status:'Åpent'}],customChecklistGroups:[{text:'Keep'}]};
const added=appendProjectChecklist(original,copy);assert.equal(original.kshmsChecklistInstances,undefined);
assert.equal(added.project.projectDeviations,original.projectDeviations);assert.equal(added.project.customChecklistGroups,original.customChecklistGroups);
const answered={...added.project,answers:{[added.instance.category]:{'Kontroller rørene':{status:'Avvik',comment:'Existing answer',photos:[1]}}}};
assert.equal(appendProjectChecklist(answered,{...copy,id:point}).project,answered,'Retry duplicated an imported edition or erased answers');
const afterPublication=appendProjectChecklist(answered,{...copy,id:point,version_id:point,version:2,content:{...content,title:'Changed list',points:[{...content.points[0],title:'New point'}]}}).project;
assert.equal(afterPublication.kshmsChecklistInstances[0].content.points[0].title,'Kontroller rørene');assert.equal(afterPublication.answers,answered.answers);
const groups=projectChecklistTemplate(afterPublication.kshmsChecklistInstances);assert.equal(groups.length,2);assert.equal(groups[0].requirements['Kontroller rørene'].guidance,'Kontroller koblingene');assert.equal(groups[0].requirements['Kontroller rørene'].image_required,true);
assert.equal(projectChecklistTemplate()[0],undefined);assert.equal(projectChecklistTemplate([{content:{}}]).length,0);
for(const failure of ['foreign','disabled','unverified','late','']){
 let writes=0;
 const result=importPublishedChecklist({companyId:company,userId:'no-ks-grant',projectId:'project-id',versionId:version,instanceId:instance,isCurrent:()=>failure!=='late',rpc:async(name,args)=>{
  assert.equal(name,'kshms_project_checklists');assert.equal(args.p_version_id,version);
  return {context:{company_id:failure==='foreign'?template:company,user_id:'no-ks-grant',project_id:'project-id',enabled:failure!=='disabled',manage:false},versions:[published]};
 },saveProject:async row=>{writes++;return failure==='unverified'?{...row,content_hash:'wrong'}:row;}});
 if(['foreign','disabled','unverified'].includes(failure))await assert.rejects(result);else assert.equal(Boolean(await result),failure!=='late');
 assert.equal(writes,['foreign','disabled','late'].includes(failure)?0:1);
}
// Invoke the real App save callback. Other project data and answers survive a
// failed save and retry, with no personal KS/HMS grant and no synthetic editor.
const main=fs.readFileSync('src/main.jsx','utf8');
const start=main.indexOf('    const checklistImportScopeRef ='),end=main.indexOf('    const openProjectChecklist =',start);
assert(start>=0&&end>start);
const code=main.slice(start,end);
for(const mode of ['saved','unconfirmed','locked','readonly','support']){
 const before={project:structuredClone(original),checklist:{Legacy:{Point:{status:'Avvik',comment:'Keep this',photos:[1]}}},overtagelse:{signKunde:'Existing signature'},photos:[{id:'photo'}],inst:[{name:'Existing installation'}]};
 let snapshot=before,persisted=structuredClone(before),writes=0,local;
 const invoke=new Function('bindings',`const {import_react,authUser,kshmsContext,projectId,isProjectLocked,isReadOnly,isProjectSupportReadOnly,buildProjectSnapshot,appendProjectChecklist,latestStateRef,setProject,saveLocalDraftNow,cloudAutoSaveTimerRef,window,autoSaveProjectToCloud,supabase,sameChecklistContent}=bindings;${code};return saveProjectChecklist;`)({import_react:{useRef:()=>({current:''})},authUser:{id:'no-ks-grant'},kshmsContext:{company_id:company,enabled:false},projectId:'project-id',isProjectLocked:mode==='locked',isReadOnly:mode==='readonly',isProjectSupportReadOnly:mode==='support',buildProjectSnapshot:()=>structuredClone(snapshot),appendProjectChecklist,latestStateRef:{current:snapshot},setProject:project=>{snapshot={...snapshot,project};},saveLocalDraftNow:value=>{local=structuredClone(value);},cloudAutoSaveTimerRef:{current:null},window:{clearTimeout(){}},autoSaveProjectToCloud:async value=>{writes++;if(mode!=='unconfirmed')persisted=structuredClone(value);},supabase:{from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:{data:persisted},error:null})})})})},sameChecklistContent});
 if(mode==='saved'){await invoke(copy);await invoke(copy);assert.equal(persisted.project.kshmsChecklistInstances.length,1);assert.equal(writes,2);}
 else {await assert.rejects(invoke(copy));assert.equal(writes,mode==='unconfirmed'?1:0);if(mode==='unconfirmed')assert.equal(local.project.kshmsChecklistInstances.length,1);}
 for(const key of ['checklist','overtagelse','photos','inst'])assert.deepEqual(persisted[key],before[key],`${key} changed while importing a checklist`);
 assert.deepEqual(persisted.project.projectDeviations,before.project.projectDeviations);
}
const panels=[...main.matchAll(/tab === "installasjoner"/g)].map(match=>match.index);
const pickers=[...main.matchAll(/\(ProjectChecklistPicker,/g)].map(match=>match.index);assert.equal(panels.length,2);assert.equal(pickers.length,2);
const checklistPanel=main.indexOf('tab === "sjekklister"',panels[1]);
assert(pickers[0]>panels[1]&&pickers[0]<checklistPanel&&pickers[1]>checklistPanel,'Template intake leaked into the external project surface');
assert(main.slice(panels[1],pickers[0]).includes('!isSimpleOrderProject(project)'),'General orders exposed equipment intake');
assert(main.slice(checklistPanel,pickers[1]).includes('isSimpleOrderProject(project) && authUser'),'General orders need intake directly in Sjekklister');
assert(main.includes('...firmChecklistTemplate'),'Imported copies omitted from checklist/progress/report');
const central=fs.readFileSync('src/modules/kshms/KshmsModule.jsx','utf8');assert(central.includes("['checklists','Sjekklistesentral']")&&central.includes("screen==='checklists'||checklistsOpened"));
const migration=fs.readFileSync('supabase/migrations/20261009040633_kshms_checklist_subforms.sql','utf8');
for(const needle of ['checklist_snapshot_contains_template','checklist_point_uuid','root_points','dependencies','subform_version_id','jsonb_array_length(flat_points)>100',"revoke all on function kshms_private.checklist_content"])assert(migration.includes(needle),`Missing subform guard: ${needle}`);
const executionShape=fs.readFileSync('supabase/migrations/20261009041152_kshms_checklist_subform_execution_shape.sql','utf8');assert(executionShape.includes("point-'subform_version_id'"),'Dependency reference leaked into execution point');
const orderUx=fs.readFileSync('src/modules/project/simpleOrderWorkspaceUx.js','utf8');
const hidden=orderUx.slice(orderUx.indexOf('const HIDDEN_NAV_LABELS'),orderUx.indexOf('const CUSTOMER_ACTION_PATTERN'));
assert(hidden.includes("'Fag/utstyr'"),'General order exposed Fag/utstyr against the agreed scope');
for(const label of ['Garanti','Prosjektering','Overflater og innredning','Tilbud/kontrakt','Chat','Overtagelse'])assert(hidden.includes(`'${label}'`),'Unrelated general order navigation changed');
console.log('critical-kshms-checklists-check: OK — company intake without personal grant, confirmed saves, retained drafts, immutable project copies and unchanged legacy data');

// PDF must remain subject to the same edition/project access contracts.
await import('./critical-kshms-document-pdf-check.mjs');
