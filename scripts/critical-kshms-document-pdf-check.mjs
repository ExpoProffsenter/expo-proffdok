import assert from 'node:assert/strict';
import fs from 'node:fs';
import {routinePdfDocument,checklistTemplatePdfDocument,checklistRunPdfDocument,downloadDocumentPdf} from '../src/modules/report/kshmsDocumentPdf.mjs';
export const company='11111111-1111-4111-8111-111111111111',user='22222222-2222-4222-8222-222222222222',project='33333333-3333-4333-8333-333333333333';
export const routine={id:crypto.randomUUID(),company_id:company,reference_number:7,archived:false,draft:{title:'ULAGRET FORSLAG'}};
export const version={id:crypto.randomUUID(),company_id:company,routine_id:routine.id,number:2,content_hash:'routine-hash',publisher_identity:{name:'Lagret godkjenner'},published_at:'2026-10-08T10:00:00Z',change_summary:'Gjennomgått i firmaet',content:{title:'QA godkjent rutine',chapter:'HMS',goal:'Trygt arbeid',responsibility:'Arbeidsleder',procedure:'Firmaets lagrede fremgangsmåte',documentation:'Dokumenter kontroll',confirmation:'Egen gjennomgang',references:[{title:'QA kilde',url:'https://example.invalid/rule',kind:'professional',checked_on:'2026-10-08'}]}};
export const template={id:crypto.randomUUID(),company_id:company,archived:false,draft:{title:'NYTT UPUBLISERT UTKAST'}};
export const edition={...version,id:crypto.randomUUID(),template_id:template.id,content_hash:'template-hash',published_identity:{name:'Lagret publisist'},content:{title:'QA sjekklistemal',trade:'Rørlegger',instructions:'Kontroller før innbygging',points:[{id:crypto.randomUUID(),title:'Koblinger',guidance:'Se etter lekkasje',image_required:true,comment_required:true}]}};
export const run={id:crypto.randomUUID(),company_id:company,project_id:project,revision:2,sequence:1,status:'completed',category:'QA sjekklistemal',definition:{category:'QA sjekklistemal',source_version_id:edition.id,items:['Koblinger','Merking'],requirements:{Koblinger:{image_required:true,comment_required:true,guidance:'Se etter lekkasje'}}},answers:{Koblinger:{status:'Avvik',comment:'Kobling må rettes',ks_deviation_id:'case-id',photos:[{url:'https://example.invalid/proof.png?token=PRIVATE',name:'Kontrollbilde.png'}]},Merking:{status:'Ikke aktuelt',comment:'Ingen merking her'}},updated_identity:{name:'Lagret utfører'},updated_at:'2026-10-08T10:00:00Z',completed_identity:{name:'Lagret fullfører'},completed_at:'2026-10-08T11:00:00Z'};
export const context={company_id:company,user_id:user,enabled:true,manage:false};
export const state={context,routines:[routine],versions:[version],assignments:[{company_id:company,user_id:user,version_id:version.id}],acknowledgments:[{user_id:'another',statement:'PRIVATE ANNET ANSATTINNHOLD'}],reviews:[],members:[]};
export const central={context:{...context,manage:true},templates:[template],versions:[edition]};
export const controls={context:{company_id:company,user_id:user,project_id:project},runs:[run],checklist:{}};
const before=JSON.stringify({state,central,controls});
const mapped=routinePdfDocument(version,routine);assert(JSON.stringify(mapped).includes('R-007'));assert(JSON.stringify(mapped).includes('Lagret godkjenner'));assert(JSON.stringify(mapped).includes('QA kilde'));assert(!JSON.stringify(mapped).includes('ULAGRET'));assert(!JSON.stringify(mapped).includes('PRIVATE ANNET'));
assert(JSON.stringify(routinePdfDocument(version,{...routine,archived:true})).includes('UTGÅTT'));
assert(JSON.stringify(routinePdfDocument({...version,publisher_identity:{name:'Nåværende konto',source:'current_account'}},routine)).includes('historisk navn er ikke lagret'));
assert(JSON.stringify(checklistTemplatePdfDocument(edition,template)).includes('TOM MAL'));assert(!JSON.stringify(checklistTemplatePdfDocument(edition,template)).includes('NYTT UPUBLISERT'));
assert(JSON.stringify(checklistRunPdfDocument({...run,status:'draft'})).includes('IKKE FULLFØRT'));assert(!JSON.stringify(checklistRunPdfDocument({...run,status:'draft'})).includes('Lagret fullfører'));
assert(JSON.stringify(checklistRunPdfDocument(run)).includes('Lagret fullfører'));assert(JSON.stringify(checklistRunPdfDocument(run)).includes('case-id'));assert(JSON.stringify(checklistRunPdfDocument(run)).includes('fullført kontroll lukker ikke avvik'));
const fileRun=structuredClone(run);fileRun.answers.Koblinger.photos.push({name:'Rapport.pdf',url:'https://example.invalid/file.pdf?token=SECRET'});assert(JSON.stringify(checklistRunPdfDocument(fileRun)).includes('filen følger ikke denne PDF'));
const logs=[],coordinates=[];let saved=0,pages=1;
class FakePdf{constructor(){this.internal={pageSize:{getWidth:()=>210,getHeight:()=>297},getNumberOfPages:()=>pages};}addPage(){pages++;}setPage(){}setFont(){}setFontSize(){}setTextColor(){}splitTextToSize(text){return String(text).match(/[\s\S]{1,80}/g)||[''];}text(value,x,y){logs.push(value);coordinates.push(y);}getImageProperties(){return {width:400,height:300};}addImage(){}save(){saved++;}}
for(const kind of ['routine','template','run'])for(const mode of ['ok','foreign','user','missing','revision','content','revoked','revoked-final','late-read','late-engine','late-image','missing-image','missing-logo','profile','unassigned']){
 let active=true,reads=0;const prior=saved,base=kind==='routine'?state:kind==='template'?central:controls,expected=kind==='routine'?version:kind==='template'?edition:run;
 const rpc=async name=>{
  if(name==='work_profile_company_profile')return {companyId:mode==='profile'?'other':company,companyName:'QA firma',logoUrl:'/logo.png'};
  reads++;if(mode==='revoked'||mode==='revoked-final'&&reads===2)throw Error('Tilgang avslått');if(mode==='late-read')active=false;
  const result=structuredClone(base),row=kind==='run'?result.runs[0]:result.versions[0];
  if(mode==='foreign')result.context.company_id='other';if(mode==='user')result.context.user_id='other';if(mode==='missing'){if(kind==='run')result.runs=[];else result.versions=[];}
  if(mode==='revision'){if(kind==='run')row.revision++;else row.number++;}
  if(mode==='content'){if(kind==='run')row.answers={};else row.content.title='UNEXPECTED';}
  if(mode==='unassigned'){result.assignments=[];result.context.manage=false;}
  return result;
 };
 const options={kind,expected,rpc,companyId:company,userId:user,projectId:project,isCurrent:()=>active,loadPdf:async()=>{if(mode==='late-engine')active=false;return {jsPDF:FakePdf};},loadImage:async url=>{if(mode==='late-image')active=false;return mode==='missing-logo'&&url==='/logo.png'||mode==='missing-image'&&url.includes('proof')?null:'data:image/png;base64,fixture';}};
 const failed=['foreign','user','missing','revision','content','revoked','revoked-final','profile'].includes(mode)||mode==='missing-image'&&kind==='run'||mode==='unassigned'&&kind!=='run';
 if(failed)await assert.rejects(downloadDocumentPdf(options));else await downloadDocumentPdf(options);
 assert.equal(saved-prior,failed||mode.startsWith('late')?0:1,`${kind}/${mode}`);
}
assert(!logs.join(' ').includes('PRIVATE'));assert.equal(JSON.stringify({state,central,controls}),before);
const buttons=fs.readFileSync('src/modules/kshms/KshmsDocumentPdfButton.jsx','utf8');assert(buttons.includes('latest.current===snapshot'));assert(buttons.includes('scope.active=false'));
const workspace=fs.readFileSync('src/modules/checklist/ProjectChecklistWorkspace.jsx','utf8');assert(workspace.includes('sameRunValue(answersForDefinition(savedSelection.definition,savedSelection.answers)'));assert(workspace.includes('!selected.earlierDraft'));assert(workspace.includes('resolveFileUrl={resolveFileUrl}'));
const source=fs.readFileSync('src/modules/report/kshmsDocumentPdf.mjs','utf8');assert(!source.includes("rpc('kshms_command'"));assert(!source.includes("rpc('project_checklist_command'"));
console.log('critical-kshms-document-pdf-check: OK — exact stored editions/answers, no staff acknowledgment/draft/source-URL leak, saved identity, draft/archive/template markers, image failure, own assignment, final revoked access and late response gates');
