import assert from 'node:assert/strict';
import {executionReportDocument,appendExecutionPdf,downloadExecutionPdf} from '../src/modules/report/kshmsExecutionReport.mjs';
import {kshmsReportDocuments,kshmsReportSelectionKey} from '../src/modules/report/kshmsProjectReport.mjs';
const company=crypto.randomUUID(),user=crypto.randomUUID(),project=crypto.randomUUID(),point=crypto.randomUUID();
const photo='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aF1sAAAAASUVORK5CYII=';
export const round={id:crypto.randomUUID(),company_id:company,project_id:project,kind:'round',status:'completed',revision:3,project_name:'QA prosjekt',responsible_identity:{name:'Lagret ansvarlig'},completed_identity:{name:'Lagret fullfører'},completed_at:'2026-10-08T14:00:00Z',statement:'Lagret egen bekreftelse',content:{title:'QA vernerunde',workplace:'Lager',planned_on:'2026-10-08',reference:'QA ekstern',participants:'Utfører og verneombud',routines:'R-001 utgave 2',review:'Videre tiltak følges opp',points:[{id:point,title:'Fri rømningsvei',guidance:'Se etter hindringer'}],answers:{[point]:{status:'deviation',comment:'Kasser foran døren',responsible_identity:{name:'Lagret tiltaksansvarlig'},due_on:'2026-10-09',photos:[{id:crypto.randomUUID(),data:photo}]}}}};
export const risk={...round,id:crypto.randomUUID(),kind:'risk',content:{...round.content,title:'QA risikovurdering',points:[],answers:{},basis:'Dagens jobb, nivåene 1-5 gjelder personskade.',acceptance:{low_max:4,medium_max:12,description:'Kontroll før aksept. Høy risiko krever tiltak/stans.',confirmed:true},risks:[{id:crypto.randomUUID(),activity:'Kapping',hazard:'Støv',consequence:'Lungeskade',existing_measures:'Avsperret område',probability_before:3,consequence_before:4,planned_measures:'Avsug og kontroll',owner_identity:{name:'Lagret tiltakshaver'},due_on:'2026-10-10',probability_after:1,consequence_after:2,effect_status:'planned',follow_up:'Kontroller avsug',decision:'needs_action',reason:'Effekten er foreløpig forventet.'}]}};
const before=JSON.stringify({round,risk});
const documents=kshmsReportDocuments({sjas:[],ruhs:[],rounds:[round],risks:[risk]});assert.equal(documents.length,2);assert(JSON.stringify(documents).includes('Lagret fullfører'));assert(JSON.stringify(documents).includes('R-001 utgave 2'));assert.equal(documents[0].blocks[0].photos[0].data,photo);assert(JSON.stringify(documents).includes('forventet effekt - ikke kontrollert'));assert(JSON.stringify(documents).includes('Videre tiltak kreves'));assert(!JSON.stringify(documents).includes('Akseptert'));assert.equal(JSON.stringify({round,risk}),before);
const draft=executionReportDocument({...round,status:'draft'});assert(JSON.stringify(draft).includes('IKKE FULLFØRT'));assert(!JSON.stringify(draft).includes('Lagret fullfører'));assert.throws(()=>executionReportDocument({...round,kind:'unknown'}));
assert.throws(()=>executionReportDocument({...round,content:{...round.content,answers:{[point]:{photos:[{data:'https://private.invalid/photo'}]}}}}),/kontrollbilde/);
assert.notEqual(kshmsReportSelectionKey({rounds:[round]}),kshmsReportSelectionKey({rounds:[{...round,revision:4}]}));
const prints=[],images=[],fills=[],boxes=[];let pages=1,saves=0;
class FakePdf{constructor(){this.internal={pageSize:{getWidth:()=>210,getHeight:()=>297},getNumberOfPages:()=>pages};}addPage(){pages++;}setPage(){}setFont(){}setFontSize(){}setTextColor(){}setLineWidth(){}setDrawColor(){}setFillColor(...c){fills.push(c);}rect(x,y,w,h){boxes.push({x,y,w,h});}splitTextToSize(v){return String(v).match(/[\s\S]{1,90}/g)||[''];}text(v,x,y){prints.push({v,x,y});}getImageProperties(){return {width:700,height:400};}addImage(data,x,y,w,h){images.push({data,x,y,w,h});}save(){saves++;}}
appendExecutionPdf(new FakePdf(),executionReportDocument({...round,content:{...round.content,review:'Lang kontrolltekst '.repeat(2500)+'QA SLUTT'}}));
assert(pages>4);assert(prints.every(p=>p.y>=16&&p.y<=277));assert(prints.map(p=>p.v).join('').includes('QA SLUTT'));assert(images.every(p=>p.y+p.h<=277));
assert(boxes.every(b=>b.x>=14&&b.x+b.w<=196.001&&b.y>=16&&b.y+b.h<=277.001),'Frames stay inside printable page');
assert(boxes.some(b=>b.x>100&&b.w<100),'Short fields use right-hand column');
assert(boxes.some(b=>b.x===14&&b.w===182&&b.h>50),'Long text uses full-width framed continuation');
appendExecutionPdf(new FakePdf(),executionReportDocument(risk));assert.equal(fills.filter(c=>c[0]===187||c[0]===254).length,25);assert(fills.some(c=>c[0]===187)&&fills.some(c=>c[0]===254));
const context={company_id:company,user_id:user,enabled:true};
for(const mode of ['ok','revoked','company','project','revision','profile','late-rpc','late-engine','logo-missing']){
 let active=true,logoCalls=0;const prior=saves;
 const rpc=async name=>{if(name==='work_profile_company_profile')return {companyId:mode==='profile'?'wrong':company,companyName:'QA firma',logoUrl:'/logo.png'};if(mode==='revoked')throw Error('Revoked');if(mode==='late-rpc')active=false;return {context:mode==='company'?{...context,company_id:'wrong'}:context,record:{...round,...(mode==='project'?{project_id:'wrong'}:mode==='revision'?{revision:9}:{})}};};
 const options={rpc,companyId:company,userId:user,editor:round,isCurrent:()=>active,loadPdf:async()=>{if(mode==='late-engine')active=false;return {jsPDF:FakePdf};},loadLogo:async()=>{logoCalls++;return mode==='logo-missing'?null:photo;}};
 if(['revoked','company','project','revision','profile'].includes(mode))await assert.rejects(downloadExecutionPdf(options));else{const result=await downloadExecutionPdf(options);if(mode.startsWith('late'))assert.equal(result,null);else assert.equal(result.logoMissing,mode==='logo-missing');}
 assert.equal(saves-prior,['ok','logo-missing'].includes(mode)?1:0);
 if(mode.startsWith('late'))assert.equal(logoCalls,0);
}
assert.equal(JSON.stringify({round,risk}),before);
console.log('critical-kshms-execution-pdf-check: OK — snapshot identities, draft/expected-risk markers, photos, 25 matrix cells, pagination, changed revision and revoked/late export gates');
