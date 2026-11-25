import assert from 'node:assert/strict';
import fs from 'node:fs';
import {handbookSnapshot,downloadHandbookPdf} from '../src/modules/report/kshmsHandbookPdf.mjs';
const company='c',user='u',stamp='2026-10-12T10:11:12Z';
export const fixture={context:{company_id:company,user_id:user,enabled:true,manage:true},members:[],routines:[],versions:[],assignments:[],acknowledgments:[]};
for(let i=1;i<=87;i++){
 const id=`r${i}`,vid=`v${i}`;
 fixture.routines.push({id,company_id:company,reference_number:i,archived:false,draft:{title:'PRIVATE DRAFT'}});
 fixture.versions.push({id:vid,routine_id:id,company_id:company,number:1,content_hash:`hash${i}`,publisher_identity:{name:'Godkjenner'},published_at:stamp,change_summary:'Kontrollert',content:{title:`Rutine ${String(i).padStart(3,'0')}`,chapter:'HMS',goal:'Trygt arbeid',responsibility:'Leder',procedure:`Fullstendig rutinetekst ${i}`,documentation:'Kontroll',confirmation:'Les og forstå',references:[]}});
 fixture.assignments.push({company_id:company,user_id:user,version_id:vid});
 fixture.acknowledgments.push({user_id:user,company_id:company,version_id:vid,user_identity:{name:'Egen bruker'},acknowledged_at:stamp,statement:'Jeg har lest og forstått.'});
}
const old={...structuredClone(fixture.versions[0]),id:'old',number:1};fixture.versions[0].number=2;fixture.versions.push(old);fixture.assignments.push({company_id:company,user_id:user,version_id:'old'});
fixture.versions.push({...structuredClone(old),id:'foreign',routine_id:'other',content:{title:'PRIVATE OTHER'}});fixture.assignments.push({company_id:company,user_id:'other',version_id:'foreign'});fixture.acknowledgments.push({user_id:'other',version_id:'v2',statement:'PRIVATE RECEIPT'});
const before=JSON.stringify(fixture),snapshot=handbookSnapshot(fixture,company,user);assert.equal(snapshot.length,88);assert.equal(snapshot.filter(e=>e.historical).length,1);assert(!JSON.stringify(snapshot).includes('PRIVATE'));assert.equal(JSON.stringify(fixture),before);
let saved=0;
class Pdf{constructor(){this.pages=1;this.internal={pageSize:{getWidth:()=>210,getHeight:()=>297},getNumberOfPages:()=>this.pages};}addPage(){this.pages++;}setPage(){}setFont(){}setFontSize(){}setTextColor(){}setFillColor(){}setDrawColor(){}setLineWidth(){}rect(){}text(){}getImageProperties(){return {width:400,height:100};}addImage(){}splitTextToSize(v,w){return String(v).match(new RegExp(`[\\s\\S]{1,${Math.floor(w*1.5)}}`,'g'))||[''];}save(){saved++;}}
for(const mode of ['ok','no-logo','logo-fail','profile','revoked','actor','company','changed-final','assignment-final','ack-final','late-engine','late-logo','late-read']){
 let reads=0,active=true;
 const options={companyId:company,userId:user,isCurrent:()=>active,loadPdf:async()=>{if(mode==='late-engine')active=false;return {jsPDF:Pdf};},loadLogo:async()=>{if(mode==='late-logo')active=false;return mode==='logo-fail'?null:'image';},rpc:async name=>{
  if(name==='work_profile_company_profile')return {companyId:mode==='profile'?'wrong':company,companyName:'Testfirma',logoUrl:mode==='no-logo'?null:'/logo.png'};
  reads++;if(mode==='revoked'&&reads===2)throw Error('revoked');if(mode==='late-read')active=false;
  const state=structuredClone(fixture);if(mode==='actor')state.context.user_id='other';if(mode==='company')state.context.company_id='other';if(reads===2&&mode==='changed-final')state.versions[0].content.procedure='Changed';if(reads===2&&mode==='assignment-final')state.assignments.shift();if(reads===2&&mode==='ack-final')state.acknowledgments.shift();return state;
 }};
 const prior=saved;
 if(['logo-fail','profile','revoked','actor','company','changed-final','assignment-final','ack-final'].includes(mode))await assert.rejects(downloadHandbookPdf(options));else await downloadHandbookPdf(options);
 assert.equal(saved-prior,['ok','no-logo'].includes(mode)?1:0,mode);
}
assert.equal(JSON.stringify(fixture),before);
const code=fs.readFileSync('src/modules/report/kshmsHandbookPdf.mjs','utf8');assert(!/rpc\('.*command/.test(code));
console.log('Handbook PDF critical PASS: 87 own routines + historical edition, no draft/other receipt, logo, final actor/access/assignment/content/receipt checks and late cancellation.');
