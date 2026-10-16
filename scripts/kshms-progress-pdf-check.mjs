import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildProgressPdf,downloadProgressPdf,progressPdfName} from '../src/modules/kshms/kshmsProgressPdf.mjs';
import {periodSessions} from '../src/modules/kshms/kshmsProgressTimeline.mjs';
import {weekLabel,staffingHtml,staffingCsv} from '../src/modules/kshms/kshmsProgressStaffing.mjs';
const engine=await import(process.env.KSHMS_JSPDF_NODE_PATH||process.env.HR_PRACTICE_JSPDF_PATH||'jspdf');const JsPDF=engine.jsPDF||engine.default?.jsPDF;
let checks=0;const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
const meta={title:'VVS – eksempelplan 3 måneder',companyName:'Expo Proffsenter',planReference:'ERP-100',address:'Syntetisk eksempel'};
const plan=process.env.KSHMS_PROGRESS_FIXTURE?JSON.parse(fs.readFileSync(process.env.KSHMS_PROGRESS_FIXTURE,'utf8')).plan:{version:1,excludeSundays:true,activities:Array.from({length:21},(_,i)=>({id:'task-'+i,title:`VVS-oppgave ${i+1} med æøå ÆØÅ`,trade:'Rørlegger',resource:'Arbeidslag '+i,status:i%2?'Pågår':'Ikke startet',crewSize:i%5+1,nsCode:'322',nsKind:'building',sessions:periodSessions({from:'2026-10-16',to:'2027-01-15',startTime:'07:00',endTime:'15:00',note:'Full merknad med sentinel END-NOTE-'+i,excludeSundays:true})}))};
for(const kind of ['schedule','staffing']){
 const doc=buildProgressPdf({JsPDF,meta,plan,kind}),bytes=Buffer.from(doc.output('arraybuffer'));eq(bytes.subarray(0,5).toString(),'%PDF-');eq(doc.internal.getNumberOfPages()>1,true,'actual multi-page PDF');eq(bytes.length>4000,true);if(process.env.KSHMS_PROGRESS_PDF_OUTPUT){fs.mkdirSync(process.env.KSHMS_PROGRESS_PDF_OUTPUT,{recursive:true});fs.writeFileSync(process.env.KSHMS_PROGRESS_PDF_OUTPUT+'/'+(kind==='staffing'?'bemanningsplan':'fremdriftsplan')+'.pdf',bytes);}
}
eq(weekLabel('2026-W53'),'Uke 53 · 2026');eq(weekLabel('2027-W01'),'Uke 1 · 2027');eq(staffingHtml(meta,plan).includes('2026-W'),false);eq(staffingCsv(meta,plan).includes('2026-W'),false);eq(progressPdfName({title:'Plan / A'},'staffing'),'Plan - A-bemanningsplan.pdf');
const long={activities:[{id:'long',title:'L'.repeat(200),trade:'Rørlegger',resource:'Team',status:'Pågår',crewSize:3,sessions:periodSessions({from:'2026-10-16',to:'2026-10-16',startTime:'08:00',endTime:'16:00',note:('Lang merknad. '.repeat(380))+'END-LONG-NOTE'})}]};const expanded=buildProgressPdf({JsPDF,meta,plan:long});eq(expanded.internal.getNumberOfPages()>2,true,'long notes continue across pages');eq(expanded.internal.pages.flat().join('\n').includes('END-LONG-NOTE'),true,'last part of long note preserved');
let live=true,saves=0,reads=0;const load=async()=>{reads++;return {meta,plan};};const options={load,loadPdf:async()=>({jsPDF:JsPDF}),isCurrent:()=>live,save:async()=>{saves++;}};
await downloadProgressPdf(options);eq(reads,2,'fresh read before and after engine');eq(saves,1);
await assert.rejects(()=>downloadProgressPdf({...options,loadPdf:async()=>{live=false;return {jsPDF:JsPDF};}}));checks++;eq(saves,1,'late engine cannot download after scope change');live=true;let count=0;await assert.rejects(()=>downloadProgressPdf({...options,load:async()=>{if(++count===2)throw Error('Access revoked');return {meta,plan};}}));checks++;eq(saves,1,'revoked fresh read cannot download');
console.log(`KS/HMS direct PDF: ${checks} assertions PASS: real multi-page PDF bytes, long note pagination, Norwegian ISO weeks, fresh post-engine authorization, canceled and revoked downloads.`);
