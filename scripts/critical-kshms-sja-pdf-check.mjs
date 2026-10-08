import assert from 'node:assert/strict';
import {blankSja,SJA_STATEMENT} from '../src/modules/kshms/kshmsSja.mjs';
import {sjaPdfDocument,downloadSjaPdf} from '../src/modules/report/kshmsSjaPdf.mjs';

export const company='11111111-1111-4111-8111-111111111111',user='22222222-2222-4222-8222-222222222222',project='33333333-3333-4333-8333-333333333333';
const blank=blankSja();
export const signed={id:blank.id,company_id:company,project_id:null,revision:2,status:'signed',leader_id:user,leader_identity:{id:user,name:'Lagret prosjektleder'},signed_by:user,signed_identity:{id:user,name:'Lagret signatur'},signed_at:'2026-10-08T18:00:00Z',statement:SJA_STATEMENT,extra:'PRIVATE IKKE RAPPORTFELT',content:{...blank.content,title:'QA sikker jobbanalyse',workplace:'Lager',project_reference:'Ekstern ordre 77038',leader_id:user,planned_on:'2026-10-09',task:'Bytte kupling',routines:'R-007 utgave 2',equipment:'Trykk kontrollert',ppe:'Vernebriller',emergency:'Førstehjelp tilgjengelig',stop_conditions:'Stans ved trykk',reviewed_on:'2026-10-08',communication:'Felles gjennomgang',steps:[{...blank.content.steps[0],activity:'Steng ventil',hazard:'Resttrykk',consequence:'Personskade',measures:'Avlast trykk',owner:'Historisk ansvarlig',check:'Kontroller manometer'}],participants:[{...blank.content.participants[0],name:'Lagret deltaker',role:'Utfører',company:'Lagret firma',involvement:'Deltok i vurderingen'}]}};
export const draft={...signed,id:crypto.randomUUID(),status:'draft',signed_by:null,signed_identity:null,signed_at:null,statement:null,revision:1};
const before=JSON.stringify({signed,draft});
const document=sjaPdfDocument(signed),text=JSON.stringify(document);
for(const value of ['Signert','Lagret signatur','Lagret deltaker','Deltok i vurderingen','R-007 utgave 2',signed.id,'20:00:00'])assert(text.includes(value),value);
assert(!text.includes('PRIVATE'));
const draftText=JSON.stringify(sjaPdfDocument({...draft,signed_identity:{name:'PHANTOM SIGNATURE'},statement:'PHANTOM CONSENT'}));
assert(draftText.includes('IKKE SIGNERT'));assert(!draftText.includes('PHANTOM'));
for(const patch of [{revision:0},{status:'completed'},{signed_identity:{id:crypto.randomUUID()}},{signed_by:crypto.randomUUID()},{signed_at:'invalid'},{statement:null}])assert.throws(()=>sjaPdfDocument({...signed,...patch}));
const prints=[],frames=[];let saves=0,pages=1;
class FakePdf{
 constructor(){pages=1;this.internal={pageSize:{getWidth:()=>210,getHeight:()=>297},getNumberOfPages:()=>pages};}
 addPage(){pages++;}setPage(){}setFont(){}setFontSize(){}setTextColor(){}setDrawColor(){}setFillColor(){}setLineWidth(){}
 rect(x,y,w,h){frames.push({x,y,w,h});}text(value,x,y){prints.push({value,x,y});}splitTextToSize(v){return String(v).match(/[\s\S]{1,80}/g)||[''];}
 getImageProperties(){return {width:400,height:100};}addImage(){}save(){saves++;}
}
for(const mode of ['ok','project-ok','draft-ok','logo-missing','new','foreign','other-user','disabled','wrong-id','wrong-company','wrong-project','revision','content','signature','profile','revoked','revoked-final','changed-final','late-read','late-profile','late-engine','late-logo','late-final','engine-missing']){
 const expected=structuredClone(mode==='draft-ok'?draft:signed);if(mode==='project-ok')expected.project_id=project;
 if(mode==='new')expected.revision=0;
 let reads=0,active=true;const prior=saves;
 const rpc=async(name,args)=>{
  assert.equal(args.p_company_id,company);
  if(name==='work_profile_company_profile'){if(mode==='late-profile')active=false;return {companyId:mode==='profile'?'wrong':company,companyName:'QA firma',logoUrl:'/logo.png'};}
  assert.equal(name,'kshms_sja_detail','Export issued a mutation');assert.equal(args.p_id,expected.id);reads++;
  if(mode==='revoked'||mode==='revoked-final'&&reads===2)throw Error('Access revoked');
  if(mode==='late-read'||mode==='late-final'&&reads===2)active=false;
  const x={company_id:company,user_id:user,enabled:true},row=structuredClone(expected);
  if(mode==='foreign')x.company_id='wrong';if(mode==='other-user')x.user_id='wrong';if(mode==='disabled')x.enabled=false;
  if(mode==='wrong-id')row.id='wrong';if(mode==='wrong-company')row.company_id='wrong';if(mode==='wrong-project')row.project_id=project;
  if(mode==='revision')row.revision++;if(mode==='content'||mode==='changed-final'&&reads===2)row.content.task='NEW TASK';if(mode==='signature')row.signed_identity.name='CURRENT PROFILE';
  return {context:x,sja:row};
 };
 const options={expected,rpc,companyId:company,userId:user,projectId:expected.project_id,isCurrent:()=>active,loadPdf:async()=>{if(mode==='late-engine')active=false;return mode==='engine-missing'?{}:{jsPDF:FakePdf};},loadLogo:async()=>{if(mode==='late-logo')active=false;return mode==='logo-missing'?null:'data:image/png;base64,fixture';}};
 const ok=['ok','project-ok','draft-ok','logo-missing'].includes(mode),late=mode.startsWith('late');
 if(ok){const result=await downloadSjaPdf(options);assert.equal(result.logoMissing,mode==='logo-missing');assert.equal(reads,2);}
 else if(late)assert.equal(await downloadSjaPdf(options),null);
 else await assert.rejects(downloadSjaPdf(options));
 assert.equal(saves-prior,ok?1:0,mode);
}
const long={...signed,content:{...signed.content,task:'Kontroller trykket før arbeid. '.repeat(120)+'QA LANGTEKST SLUTT'}};
await downloadSjaPdf({expected:long,companyId:company,userId:user,rpc:async name=>name==='work_profile_company_profile'?{companyId:company,companyName:'QA firma'}:{context:{company_id:company,user_id:user,enabled:true},sja:structuredClone(long)},loadPdf:async()=>({jsPDF:FakePdf})});
assert(pages>1);assert(prints.some(p=>p.value.includes('QA LANGTEKST SLUTT')));assert(prints.every(p=>p.y>=16&&p.y<=285));
assert(frames.every(b=>b.x>=14&&b.x+b.w<=196.001&&b.y+b.h<=277.001));
assert.equal(JSON.stringify({signed,draft}),before,'Export mutated source');
console.log('critical-kshms-sja-pdf-check: PASS – exact saved signature/content, draft markers, company/project/user gates, final revocation/change, late cancellation, no mutation and framed pagination');
