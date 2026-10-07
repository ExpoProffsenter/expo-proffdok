import assert from 'node:assert/strict';
import fs from 'node:fs';
import {answersForDefinition,commitChecklistRun,completionProblem,currentRunAnswers,readRunDraft,sameRunValue} from '../src/modules/checklist/checklistRuns.mjs';
const main=fs.readFileSync('src/main.jsx','utf8');
const start=main.indexOf('    const customChecklistAllowed ='),end=main.indexOf('    const dynamicSoproWarrantyRequirementStatus =',start);
assert(start>=0&&end>start);
const select=new Function('project','simple','canCustom',`const isSimpleOrderProject=()=>simple,canUseCustomChecklistForWarranty=()=>canCustom,warranty={},selectedSoproProductChecklistTemplate=[],import_react={useMemo:fn=>fn()},normalizeCustomChecklistGroups=value=>value,projectChecklistTemplate=value=>value||[],getActiveChecklistTemplate=()=>[{category:'Wetroom default',items:['Standard']}],dedupeChecklistTemplate=value=>value;${main.slice(start,end)}return {allowed:customChecklistAllowed,groups:activeChecklistTemplate};`);
assert.deepEqual(select({},true,false),{allowed:true,groups:[]},'General order inherited wetroom checklist or disallowed own points');
assert.equal(select({},false,false).groups[0].category,'Wetroom default','Wetroom lost existing standard');
const custom={category:'Own',items:['Own point']},published={category:'Published',items:['Fixed point']};
assert.deepEqual(select({customChecklistGroups:[custom],kshmsChecklistInstances:[published]},true,false),{allowed:true,groups:[custom,published]});
const definition={category:'Control',items:['Point'],requirements:{Point:{image_required:true,comment_required:true}}};
assert.match(completionProblem(definition,{}),/Vurder/);
assert.match(completionProblem(definition,{Point:{status:'Ok',comment:'Evidence'}}),/bilde/);
assert.equal(completionProblem(definition,{Point:{status:'Avvik',comment:'Evidence',photos:[{url:'https://example.invalid/proof'}]}}),'');
assert.equal(completionProblem({...definition,requirements:{Point:{documentation_either:true}}},{Point:{status:'Ok',comment:'Warranty evidence'}}),'');
assert.equal(answersForDefinition(definition,{Point:{status:'Ok',comment:'Previous'}},true).Point.comment,undefined);
assert.equal(answersForDefinition(definition,{Point:{status:'Avvik',comment:'Unresolved'}},true).Point.comment,'Unresolved');
assert.equal(currentRunAnswers({category:'Control',status:'draft',definition,answers:{Point:{status:'Avvik',comment:'Local'}}},{Control:{Point:{ks_deviation_id:'case',status:'Lukket avvik'}}}).Point.status,'Lukket avvik');
assert.equal(readRunDraft({getItem:()=>'{broken'},'key'),null);assert(sameRunValue({b:1,a:2},{a:2,b:1}));
const draft={id:'run',revision:0,requestId:'request',definition,answers:{Point:{status:'Ok'}}};
for(const failure of ['write','read','foreign','changed','late','']){
 let calls=0;
 const result=commitChecklistRun({companyId:'company',projectId:'project',userId:'user',draft,action:'save',isCurrent:()=>failure!=='late',rpc:async name=>{
  calls++;const run={...draft,company_id:'company',project_id:'project',revision:1,status:'draft'},context={company_id:'company',project_id:'project',user_id:'user'};
  if(name==='project_checklist_command'){if(failure==='write')throw Error('Failed write');return {context,run,answers:draft.answers};}
  if(failure==='read')throw Error('Failed read');
  return {context:{...context,company_id:failure==='foreign'?'other':'company'},runs:[{...run,answers:failure==='changed'?{Point:{status:'Avvik'}}:run.answers}]};
 }});
 if(['write','read','foreign','changed'].includes(failure))await assert.rejects(result);else assert.equal(Boolean(await result),failure!=='late');
 assert.equal(calls,['write','late'].includes(failure)?1:2);
}
assert(main.includes('ProjectChecklistWorkspace')&&main.includes('onSaved: applySavedChecklistControl'));
const sql=fs.readFileSync('supabase/migrations/20261007180955_project_checklist_runs.sql','utf8');
assert(sql.includes('public.project_row_access_allowed')&&sql.includes('public.current_active_company_scope_id()'));
assert(sql.includes('kshms_private.project_checklist_receipts')&&sql.includes('project_checklist_completed_immutable'));
assert(sql.includes('create trigger kshms_checklist_answers'),'Delayed project autosave can replace popup data');
console.log('critical-project-checklist-runs-check: OK — actual order template selection, own points without warranty, preserved wetroom lists, completion evidence, source status and verified-save failures');
