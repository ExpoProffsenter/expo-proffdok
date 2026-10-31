import assert from 'node:assert/strict';
import {readProjectReportRuns,prepareProjectControlDocuments,checkCompletedProjectRun} from '../src/modules/report/projectControlReport.mjs';
import {signatureA,signatureB} from './fixtures/checklist-signatures.mjs';
const scope={companyId:'firm',projectId:'project',userId:'reader'},context={company_id:'firm',project_id:'project',user_id:'reader'};
const run={id:'run',company_id:'firm',project_id:'project',revision:3,status:'completed',sequence:4,definition:{category:'QA utførelse',items:['Rør'],requirements:{Rør:{fields:[]}}},answers:{Rør:{status:'OK',comment:'QA lagret kommentar',photos:[{path:'private/qa-photo.png',name:'QA bilde.png',type:'image/png'},{url:'https://qa.invalid/document.pdf?token=PRIVATE',name:'QA vedlegg.pdf',type:'application/pdf'}]}},completed_by:'signer',completed_at:'2026-10-30T12:00:00Z',completed_identity:{name:'QA historisk fullfører'},signatures:{record_id:'run',revision:3,basis_hash:'QA-basis',own:{image:signatureA,user_id:'signer',identity:{name:'QA historisk signatar'},signed_at:'2026-10-30T11:59:00Z'},external:{image:signatureB,name:'QA ekstern Ærlig',role:'Byggeleder',signed_at:'2026-10-30T11:59:30Z',witness:{identity:{name:'QA lagret vitne'}}}}};
let checks=0;const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
let state={context,runs:[run,{...run,id:'draft',status:'draft'}]},reads=0;
const rpc=async(name,args)=>{eq(name,'project_checklist_state','only existing read RPC');eq(args,{p_company_id:'firm',p_project_id:'project'},'exact company/project arguments');reads++;return state;};
const rows=await readProjectReportRuns({...scope,rpc});eq(rows.length,1,'draft excluded');eq(rows[0],run,'exact completed source');eq(rows[0]===run,false,'snapshot detached from response');
const before=JSON.stringify(state),loaded=[];
const documents=await prepareProjectControlDocuments(rows,{resolveFileUrl:file=>{eq(file.path,'private/qa-photo.png','existing file resolver receives stored path');return 'https://qa.invalid/photo?token=PRIVATE';},loadImage:async url=>{loaded.push(url);return signatureB;}});
eq(loaded,['https://qa.invalid/photo?token=PRIVATE'],'only selected image loaded');eq(JSON.stringify(state),before,'mapping does not mutate persisted source');
const text=JSON.stringify(documents);eq(text.includes('token=PRIVATE'),false,'source tokens never rendered');eq(text.includes('QA vedlegg.pdf'),true,'separate original attachment disclosed');eq(text.includes('QA historisk signatar'),true,'frozen signer retained');eq(text.includes('QA ekstern Ærlig'),true,'external signer retained');eq(documents[0].blocks.filter(b=>b.photos.some(p=>p.kind==='signature')).length,2,'both native signature blocks');
for(const change of [r=>r.company_id='foreign',r=>r.project_id='foreign',r=>r.status='draft',r=>r.revision=0,r=>r.signatures.record_id='other',r=>r.signatures.revision=4,r=>r.signatures.basis_hash='',r=>r.signatures.own.user_id='other',r=>r.signatures.external.role='']){
 const bad=structuredClone(run);change(bad);assert.throws(()=>checkCompletedProjectRun(bad,scope));checks++;
}
eq(checkCompletedProjectRun({...run,signatures:{}},scope).signatures,{},'legacy completion remains unsigned');
for(const bad of [{context:{...context,company_id:'foreign'},runs:[run]},{context:{...context,user_id:'foreign'},runs:[run]},{context:{...context,project_id:'foreign'},runs:[run]},{context,runs:[run,run]},{context,runs:[{...run,project_id:'foreign'}]},{context,runs:[null]}]){
 await assert.rejects(()=>readProjectReportRuns({...scope,rpc:async()=>bad}));checks++;
}
await assert.rejects(()=>readProjectReportRuns({...scope,rpc,ids:['missing']}));checks++;
await assert.rejects(()=>readProjectReportRuns({...scope,rpc,ids:['run','run']}));checks++;
const expected=await readProjectReportRuns({...scope,rpc,ids:['run']});
for(const mutate of [r=>r.answers.Rør.comment='Changed',r=>r.signatures.own.identity.name='Changed',r=>r.signatures.external.image=signatureA,r=>r.definition.items.push('Changed'),r=>r.updated_identity={name:'Changed'}]){
 state={context,runs:[structuredClone(run)]};mutate(state.runs[0]);await assert.rejects(()=>readProjectReportRuns({...scope,rpc,ids:['run'],expected}));checks++;
}
eq(await readProjectReportRuns({...scope,rpc,isCurrent:()=>false}),null,'late read discarded');
await assert.rejects(()=>prepareProjectControlDocuments(rows,{resolveFileUrl:()=>'',loadImage:async()=>signatureB}));checks++;
await assert.rejects(()=>prepareProjectControlDocuments(rows,{resolveFileUrl:()=>'/qa',loadImage:async()=>null}));checks++;
let active=true;eq(await prepareProjectControlDocuments(rows,{resolveFileUrl:()=>'/qa',loadImage:async()=>{active=false;return signatureB;},isCurrent:()=>active}),null,'late image discarded');
console.log(`Project report controls PASS: ${checks} checks; existing read-only endpoint, frozen completed/legacy signatures, exact scope/content, images, original attachment notice, no source token or mutation, revoked/changed/late rejection.`);
