import React, {useLayoutEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import HrModule from '../../src/modules/hr/HrModule.jsx';
import DeviationDialog from '../../src/modules/deviations/DeviationDialog.jsx';
import '../../src/style.css';
import '../../src/modules/app/mobileResponsive41A.css';
import '../../src/modules/ui/proffdokWorkspace.css';
import '../../src/modules/ui/proffdokPeopleWorkspace.css';
import {APP_RUNTIME_STYLES} from '../../src/modules/app/appRuntimeStyles.js';
import {blankHrTemplate} from '../../src/modules/hr/hrConversationTemplates.mjs';

// Match the actual app cascade, including the late runtime stylesheet. Older
// HR checks only loaded the static CSS and missed inner-section differences.
const runtime=document.createElement('style');runtime.textContent=APP_RUNTIME_STYLES;document.head.appendChild(runtime);

const names=['Emma Berg','Nora Vik','Sofie Dahl','Martin Lund','Ada Eiendom og prosjektutvikling med langt navn','Jon Hansen'];
const members=['admin','leader','self','reader','new'].map(id=>({id,email:id+'@example.invalid'}));
const rows=names.map((full_name,index)=>({id:'e'+index,user_id:index===0?'self':'employee'+index,full_name,email:'person'+index+'@example.invalid',leader_id:'admin',revision:1,readers:[]}));
rows[1].leader_id='leader';
rows[0].readers=[{user_id:'reader',reason:'Syntetisk delt tilgang',granted_by:'admin',granted_at:'2026-10-29T10:00:00Z'}];
const template={title:'Årlig medarbeidersamtale',intro:'Syntetiske spørsmål',questions:[{id:'prep',phase:'preparation',topic:'Arbeidshverdagen',prompt:'Hvordan fungerer arbeidet?',required:false},{id:'meeting',phase:'meeting',topic:'Avtaler',prompt:'Hva er avtalt?',required:false}]};
const conversations=new Map();
const clone=value=>JSON.parse(JSON.stringify(value));
window.qa={calls:[],commands:[],revoked:false,empty:false,enabled:true,held:[],heldConversationCommands:[],context:null,rows,transition:0,unexpected:[]};
window.qa.surfaces=new URL(location.href).searchParams.has('surfaces');
const sickCases=new Map();
const storedTemplate={id:'qa-template',revision:2,title:'QA lagret samtalemal',kind:'custom',archived:false,question_count:1};
const storedContent={...blankHrTemplate(()=> '10000000-0000-4000-8000-000000000001'),title:storedTemplate.title};
function sickCase(id){if(!sickCases.has(id))sickCases.set(id,{...clone(conversation(id)),id:'s-'+id,title:'QA oppfølgingsplan',template:{...template,title:'QA oppfølgingsplan'},content_version:1,template_revision:1,type:'sickleave',case_status:'active',absence_mode:'full',returned_on:'',milestones:Object.fromEntries(['plan','meeting1','activity','meeting2'].map(k=>[k,{status:'open',on:'',note:''}])),sharing:{sykmelder:[],nav:[]}});return sickCases.get(id);}
function conversation(id){if(!conversations.has(id))conversations.set(id,{id:'c-'+id,revision:1,title:template.title,template,on:'2026-11-02',meeting_time:'10:00',meeting_location:'QA møterom',stage:'meeting',shared:true,preparation:{prep:'Lagret forberedelse'},meeting:{meeting:'Lagret avtale'},actions:[],next_on:'',comments:{employee:'',leader:''},confirmations:{employee:null,leader:null}});return conversations.get(id);}
window.qa.client={rpc:async(name,args={})=>{
  window.qa.calls.push({name,args:clone(args)});
  const context=clone(window.qa.context);
  if(window.qa.revoked)return {error:{code:'42501',message:'Syntetisk tilbakekalt tilgang'}};
  if(args.p_company_id&&args.p_company_id!==context.company_id)throw Error('Wrong company in synthetic request');
  const employee=rows.find(row=>row.id===args.p_employee_id);
  const result=extra=>({data:{context,...extra}});
  if(name==='hr_foundation_state')return result({settings:{revision:1,enabled:window.qa.enabled,purpose:'Syntetisk oppfølging',legal_basis:'Syntetisk vurdering',review_on:'2027-10-01'},members,next:null});
  if(['hr_employee_list','hr_management_list','hr_personal_list'].includes(name))return result({employees:window.qa.empty?[]:clone(name==='hr_personal_list'?rows.filter(row=>row.user_id===context.user_id):name==='hr_management_list'?rows.filter(row=>row.leader_id===context.user_id):context.administer?rows:rows.filter(row=>row.readers.some(reader=>reader.user_id===context.user_id))),next:null});
  if(name==='hr_purge_status')return result({receipts:window.qa.surfaces?[{id:'qa-receipt',kind:'employment',state:'complete',requested_at:'2026-10-01T10:00:00Z',completed_at:'2026-10-01T10:02:00Z'}]:[],next:null});
  if(name==='hr_employee_get'){
    if(!context.administer&&employee.user_id!==context.user_id&&employee.leader_id!==context.user_id&&!employee.readers.some(reader=>reader.user_id===context.user_id))return {error:{code:'42501',message:'No synthetic relationship'}};
    const response=result({employee:clone(employee)});
    if(window.qa.holdDetail)return new Promise(resolve=>window.qa.held.push(()=>resolve(response)));
    return response;
  }
  if(name==='hr_followup_tasks')return result({tasks:window.qa.empty?[]:Array.from({length:7},(_,i)=>({case_id:'c-e0',employee_id:'e0',task_key:'action:qa'+i,due_on:'2026-11-02'})),next:null,email_enabled:false});
  if(name==='time_tasks_get')return result({enabled:true,registered:true,review_count:0,can_manage:true,missing_week:null});
  if(name==='hr_contact_get')return result({registered:true,available:window.qa.surfaces,editable:context.user_id===employee.user_id,employee:clone(employee),revision:1,data:{address:'QA-veien 1',postal_code:'0001',city:'Oslo'}});
  if(name==='hr_template_list')return result({templates:window.qa.surfaces?[storedTemplate]:[],next:null,content_enabled:true});
  if(name==='hr_template_get')return result({template:storedTemplate,version:{revision:args.p_version||2,content:storedContent}});
  if(name==='hr_template_history')return result({versions:[1,2].map(revision=>({revision,saved_at:'2026-10-01T10:00:00Z',archived:false})),next:null});
  if(name==='hr_conversation_list')return result({employee:clone(employee),conversations:[{...clone(conversation(employee.id)),title:template.title}],next:null,can_start:context.user_id===employee.leader_id});
  if(name==='hr_conversation_templates')return result({templates:[]});
  if(name==='hr_sick_leave_list')return result({employee:clone(employee),conversations:window.qa.surfaces?[clone(sickCase(employee.id))]:[],next:null,can_start:window.qa.surfaces&&context.user_id===employee.leader_id});
  if(name==='hr_sick_leave_templates')return result({templates:[{id:'s-template',revision:1,title:'QA oppfølgingsplan'}]});
  if(name==='hr_sick_leave_get')return result({employee:clone(employee),leader_email:'admin@example.invalid',conversation:clone(sickCase(employee.id)),current_revision:1,historical:Boolean(args.p_version),permissions:{prepare:context.user_id===employee.user_id,meeting:!args.p_version&&context.user_id===employee.leader_id,followup:!args.p_version&&context.user_id===employee.leader_id,comment:!args.p_version,confirm:false}});
  if(name==='hr_conversation_invitation_status')return result({conversation_id:args.p_conversation_id,app_notification:false,can_notify:false,email_status:'disabled'});
  if(name==='hr_conversation_get'||name==='hr_conversation_command'){
    const c=conversation(employee.id);
    if(name.endsWith('_command')){
      window.qa.commands.push({name,args:clone(args)});
      if(args.p_action==='meeting'){c.meeting=args.p_data.answers;c.actions=args.p_data.actions;c.next_on=args.p_data.next_on;}
      if(args.p_action==='preparation')c.preparation=args.p_data.answers;
      c.revision++;
      if(window.qa.holdConversationCommand)await new Promise(resolve=>window.qa.heldConversationCommands.push(resolve));
    }
    return result({employee:clone(employee),conversation:clone(c),current_revision:c.revision,historical:Boolean(args.p_version),permissions:{prepare:!args.p_version&&context.user_id===employee.user_id,meeting:!args.p_version&&context.user_id===employee.leader_id,comment:false,confirm:false}});
  }
  if(name==='hr_employee_command'){
    window.qa.commands.push({name,args:clone(args)});const p=args.p_payload;
    if(args.p_action==='create'){const row={id:'added',user_id:p.user_id,email:p.user_id+'@example.invalid',full_name:'Ny QA medarbeider',leader_id:p.leader_id,revision:1,readers:[]};rows.push(row);return result({employee:clone(row)});}
    const row=rows.find(row=>row.id===p.id);
    if(args.p_action==='leader')row.leader_id=p.leader_id;
    if(args.p_action==='reader')row.readers.push({user_id:p.reader_id,reason:p.reason,granted_by:context.user_id,granted_at:'2026-10-29T10:00:00Z'});
    if(args.p_action==='revoke_reader')row.readers=row.readers.filter(reader=>reader.user_id!==p.reader_id);
    row.revision++;return result({employee:clone(row)});
  }
  window.qa.unexpected.push(name);throw Error('Unexpected synthetic HR request: '+name);
}};
function NativeDialogProbe({onClose}){
  const ref=useRef(null);useLayoutEffect(()=>{ref.current.showModal();},[]);
  return <dialog ref={ref} aria-label="QA native dialog" onCancel={()=>{window.qa.nativeCancels++;onClose();}}><button onClick={()=>{ref.current.close();onClose();}}>Lukk native dialog</button></dialog>;
}
function NestedDialogProbe({onClose}){
  const [child,setChild]=useState(false),[native,setNative]=useState(false);
  return <><DeviationDialog title="QA forelderdialog" onClose={()=>{window.qa.dialogCloses.push('parent');onClose();}}><button onClick={()=>setChild(true)}>Åpne QA underdialog</button><button onClick={()=>setNative(true)}>Åpne QA native dialog</button>{child&&<DeviationDialog title="QA underdialog" onClose={()=>{window.qa.dialogCloses.push('child');setChild(false);}}><button>Første underkontroll</button><button>Siste underkontroll</button></DeviationDialog>}</DeviationDialog>{native&&<NativeDialogProbe onClose={()=>setNative(false)}/>}</>;
}
function App(){
  const [role,setRole]=useState('admin'),[generation,setGeneration]=useState(0),[nested,setNested]=useState(false);
  const context={company_id:'firm',user_id:role==='personal'?'self':role==='management'?'leader':role==='reader'?'reader':'admin',company_name:'QA firma',available:true,enabled:window.qa.enabled,administer:role==='admin'};
  window.qa.context=context;
  useLayoutEffect(()=>{window.qa.committed={role,generation};});
  window.qa.show=(nextRole='admin',options={})=>{window.qa.empty=Boolean(options.empty);window.qa.enabled=options.enabled!==false;window.qa.revoked=false;window.qa.requested=++window.qa.transition;setRole(nextRole);setGeneration(window.qa.requested);};
  window.qa.release=()=>{window.qa.holdDetail=false;for(const resolve of window.qa.held.splice(0))resolve();};
  window.qa.releaseConversationCommand=()=>{window.qa.holdConversationCommand=false;for(const resolve of window.qa.heldConversationCommands.splice(0))resolve();};
  window.qa.showNested=()=>{window.qa.dialogCloses=[];window.qa.nativeCancels=0;setNested(true);};
  return <div data-expo-app-shell="true"><main><div className="pd-workspace-tool-row" data-qa-global-tools><span>Arbeidsrom HR</span><button>Generelle verktøy</button></div><HrModule key={role+generation} context={context} audience={role==='personal'?'personal':role==='management'?'management':'legacy'}/></main>{nested&&<NestedDialogProbe onClose={()=>setNested(false)}/>}</div>;
}
createRoot(document.getElementById('app')).render(<App/>);
