import assert from 'node:assert/strict';
import fs from 'node:fs';
import {continueAfterProjectSave,projectStepDataConfirmed} from '../src/modules/project/projectStepContinue.mjs';
import {projectWorkspaceGroups,projectSetupSteps} from '../src/modules/project/projectWorkspacePresentation.mjs';
import {createProjectWorkspaceTabs} from '../src/modules/project/projectNavigationTabs.mjs';
import {checklistResumeEntries} from '../src/modules/checklist/checklistResume.mjs';
let checks=0;
const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
const main=fs.readFileSync('src/main.jsx','utf8');
const extract=(name,next)=>main.slice(main.indexOf('    const '+name+' ='),main.indexOf('    const '+next+' =',main.indexOf('    const '+name+' =')));
const compile=(source,name,env)=>new Function('env',`with(env){${source};return ${name};}`)(env);
function fixture(mode='ok'){
 const events=new EventTarget(),alerts=[],writes=[],opened=[],urls=[];
 let stored={id:'project-1',user_id:'user',data:{project:{projectName:'QA Project',projectDescription:'Old description'},projectLog:{draft:''}}};
 const env={window:events,alert:text=>alerts.push(text),console:{error(){},warn(){}},authUser:{id:'user'},isProjectSupportReadOnly:mode==='support',isProjectLocked:mode==='locked',projectId:mode==='new'?null:'project-1',company:{companyName:'QA'},user:{name:'QA'},project:{projectName:'QA Project',projectDescription:'Retained description'},checked:{},productDocs:{},manualProducts:{},other:{},surf:{},bathroomEquipment:{},photos:[],access:[],inst:[],files:[],checklist:{},tilbud:{},overtagelse:{},warranty:{},projectLog:{draft:''},internalNotes:'Retained notes',latestStateRef:{current:{}},emptyProject:()=>({}),emptyWarranty:()=>({}),normalizeProjectLog:value=>value,projectFromRow:(row,project)=>project,rowIsLocked:()=>mode==='server-locked',hasValue:value=>Boolean(value),dataFromRow:row=>row.data,projectStepDataConfirmed,tab:'prosjektinfo',projectDirtyFingerprint:JSON.stringify,notifySupportProjectReadOnly:()=>alerts.push('Read only'),loadProjects:async()=>{},resetProjectDirty:()=>{env.cleaned++;},cleaned:0,unpacked:[],setProject:value=>{env.project=value;},setProjectLog(){},setProjectId:id=>{env.projectId=id;env.projectStepContextRef.current.projectId=id;},setCurrentProjectOwnerId(){},setSupportModeExplicit(){},setMobileCreatingProject(){},unpackData:data=>env.unpacked.push(data)};
 events.confirm=()=>mode==='copy';
 env.supabase={from:table=>{
  assert.equal(table,'projects');let operation='read',payload;
  const chain={select(){return chain;},eq(){return chain;},update(value){operation='update';payload=value;return chain;},insert(value){operation='insert';payload=value;return chain;},async maybeSingle(){return result();},async single(){return result();}};
  const result=()=>{
   if(operation==='read')return {data:mode==='missing'?null:stored,error:mode==='read-fail'?{message:'Read failed'}:null};
   if(mode==='write-fail')return {data:null,error:{message:'Write failed'}};
   writes.push({operation,payload});stored={...stored,id:operation==='insert'?'project-new':stored.id,data:structuredClone(payload.data)};
   if(mode==='changed'||mode==='copy')stored.data.project.projectDescription='Server has other description';
   return {data:stored,error:null};
  };
  return chain;
 }};
 env.projectStepContextRef={current:{projectId:env.projectId,tab:'prosjektinfo',userId:'user',companyName:'QA',readOnly:env.isProjectSupportReadOnly,locked:env.isProjectLocked}};
 env.projectStepBusyRef={current:false};env.projectStepAliveRef={current:true};env.progressPlanDirtyRef={current:false};
 env.setProjectStepBusy=value=>env.busy=value;env.setProjectStepNotice=value=>env.notice=value;
 env.continueAfterProjectSave=args=>continueAfterProjectSave({...args,events});
 env.goToTab=async id=>{opened.push(id);return true;};env.syncInternalProjectUrl=(...args)=>urls.push(args);
 env.saveProject=compile(extract('saveProject','continueProjectStep'),'saveProject',env);
 env.continueProjectStep=compile(extract('continueProjectStep','saveSharedProject'),'continueProjectStep',env);
 return {env,events,alerts,writes,opened,urls};
}
for(const mode of ['ok','new','read-fail','write-fail','missing','locked','server-locked','support','changed']){
 const f=fixture(mode);const success=['ok','new'].includes(mode);
 eq(await f.env.continueProjectStep('tilbud'),success,'actual save/continue '+mode);
 eq(f.opened,success?['tilbud']:[],'no navigation without verified save '+mode);
 eq(f.urls,success?[[mode==='new'?'project-new':'project-1','tilbud']]:[],'URL uses saved ID '+mode);
 eq(f.env.cleaned,success?1:0,'unverified save retains dirty draft '+mode);
 eq(f.env.busy,success||!['locked','support'].includes(mode)?false:undefined,'busy released '+mode);
 if(mode==='changed')eq(f.env.unpacked,[],'unverified readback never replaces draft');
}
{
 const f=fixture('new');const original=f.env.supabase.from;
 f.env.supabase.from=table=>{const chain=original(table),single=chain.single;chain.single=async()=>{const result=await single();result.data.data.internalNotes='Changed server notes';return result;};return chain;};
 eq(await f.env.continueProjectStep('prosjektinfo'),false,'new project mismatched readback stays');
 eq(f.env.projectId,'project-new','created ID retained for retry without duplicate insert');
 eq(f.env.cleaned,0,'new draft kept after mismatch');
}
{
 const f=fixture();f.env.progressPlanDirtyRef.current=true;
 eq(await f.env.continueProjectStep('sjekklister'),false,'uncommitted planner is not treated as a saved project field');eq(f.writes,[],'no generic save of unsaved planner');
}
for(const mode of ['pointerdown','newer-draft','new']){
 const f=fixture(mode==='new'?'new':'ok');const work=f.env.continueProjectStep('tilbud');
 if(mode==='newer-draft')f.env.latestStateRef.current={internalNotes:'Newer text'};
 else f.events.dispatchEvent(new Event('pointerdown'));
 eq(await work,false,'actual save stays after '+mode);eq(f.opened,[],'actual save does not navigate '+mode);
 eq(f.env.unpacked,[],'late save does not replace newer fields '+mode);eq(f.env.cleaned,0,'late save does not clear dirty draft '+mode);
 if(mode==='new')eq(f.env.projectId,'project-new','new row identity retained after interrupted continuation');
}
for(const intent of ['pointerdown','keydown','context','unmounted','failed','throw']){
 const f=fixture();let finish;
 f.env.saveProject=()=>new Promise((resolve,reject)=>{finish=()=>intent==='throw'?reject(Error('Transport failed')):resolve(intent==='failed'?undefined:{ok:true,projectId:'project-1'});});
 const first=f.env.continueProjectStep('tilbud');
 eq(await f.env.continueProjectStep('tilbud'),false,'double click is ignored '+intent);
 if(['pointerdown','keydown'].includes(intent))f.events.dispatchEvent(new Event(intent));
 if(intent==='context')f.env.projectStepContextRef.current.userId='other';
 if(intent==='unmounted')f.env.projectStepAliveRef.current=false;
 finish();eq(await first,false,'late save never reverses intent/failure '+intent);eq(f.opened,[],'stayed after '+intent);
}
{
 const f=fixture();const result=await f.env.saveProject();eq(result.ok,true,'old save caller remains supported');eq(f.alerts.length,1,'old success confirmation retained');
}
eq(projectStepDataConfirmed({company:{name:'old'},project:{description:'x'},files:[{id:'f'}]},{company:{name:'normalized'},project:{description:'x',server:true},files:[{id:'f',server:true}]}),true,'server metadata allowed');
eq(projectStepDataConfirmed({project:{description:'x'}},{project:{description:''}}),false,'description must match');
eq(projectStepDataConfirmed({files:[{id:'f'}]},{files:[]}),false,'attachment cannot disappear');
{
 const groups=projectWorkspaceGroups(createProjectWorkspaceTabs(),false);
 const agreement=projectSetupSteps(groups,{contractRequired:true}).find(step=>step.id==='tilbud');
 eq(agreement.optional,false,'warranty contract is not labelled optional');eq(agreement.requirement,'For garanti','warranty requirement remains explicit');
}
for(const simple of [false,true]){
 const groups=projectWorkspaceGroups(createProjectWorkspaceTabs({hasSalesOrigin:true}),simple),steps=projectSetupSteps(groups);
 eq(steps.map(step=>step.id),simple?['prosjekt','tilgang','prosjektinfo','fremdrift']:['prosjekt','tilgang','prosjektinfo','tilbud','prosjektering','fremdrift'],'appropriate setup length '+simple);
 eq(steps.some(step=>step.id==='sales'),false,'history is never a required setup step');
 eq(steps.filter(step=>step.optional).map(step=>step.id),simple?['fremdrift']:['tilbud','prosjektering','fremdrift'],'optional stages labelled '+simple);
}
{
 const groups=['Untouched','Local','Saved','Completed'].map(category=>({category,items:['Point']}));
 const readDraft=category=>category==='Local'?{answers:{Point:{comment:'local'}}}:null;
 const runs=[{category:'Saved',status:'draft'},{category:'Completed',status:'completed'}];
 const entries=checklistResumeEntries(groups,runs,{},readDraft);
 eq(entries.map(entry=>entry.group.category),['Local','Saved','Untouched','Completed'],'started lists before untouched, stable order');
 eq(entries.filter(entry=>entry.resumable).map(entry=>entry.group.category),['Local','Saved'],'completed control never becomes editable');
 eq(checklistResumeEntries(groups,runs,{},readDraft,true).some(entry=>entry.resumable),false,'read-only has no continue-edit action');
}
console.log(`Project save/step QA: ${checks} assertions PASS — actual main save and continuation, verified data, new ID, failures, user intent, scope, legacy save and checklist priority`);
