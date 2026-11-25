import assert from 'node:assert/strict';
import {company,user,row,events,files} from './critical-kshms-ruh-pdf-check.mjs';
import {context,fixtureRpc,photo} from './critical-kshms-inspection-extract-check.mjs';
import {attachmentSource,storageUrl,verifyArchive} from './critical-kshms-attachment-archive-check.mjs';
import {loadExtractChoices,loadExtractPage,downloadInspectionExtract,readInspectionSnapshots} from '../src/modules/report/kshmsInspectionExtract.mjs';
import {loadInspectionAttachmentPreview,downloadInspectionAttachmentArchive} from '../src/modules/report/kshmsAttachmentArchive.mjs';
import {ruhPdfDocument,readRuhPdfSnapshot,downloadRuhPdf} from '../src/modules/report/kshmsRuhPdf.mjs';

// Add cases without weakening or replacing any existing eight-type fixtures.
export function deviationFixture(source=attachmentSource()){
 const cases=['quality','hms'].map((category,i)=>({...structuredClone(row),id:`55555555-5555-4555-8555-55555555555${i}`,category,title:`QA ${category} avvik`,status:i?'open':'closed'}));
 const history=cases.flatMap(c=>events.map(e=>({...structuredClone(e),id:`${c.category}-${e.id}`,deviation_id:c.id,snapshot:e.action==='file'?e.snapshot:{...structuredClone(e.snapshot),id:c.id,category:c.category}})));
 const attachments=cases.flatMap(c=>files.map(f=>({...f,id:`${c.category}-${f.id}`,deviation_id:c.id,name:`${c.category}-${f.name}`,object_name:`${company}/${c.id}/${f.object_name.split('/').at(-1)}`})));
 const selected=cases.map(c=>({kind:'deviations',id:c.id,category:c.category,revision:c.revision,status:c.status,projectId:c.project_id,title:c.title}));
 const base=fixtureRpc({source});
 const rpc=async(name,args={})=>{
  if(name==='kshms_deviation_state')return {context,cases:[...source.ruhs,...cases],next:null};
  const c=cases.find(c=>c.id===args.p_id);
  if(c&&name==='kshms_deviation_detail')return {case:structuredClone(c),events:structuredClone(history.filter(e=>e.deviation_id===c.id)),next:null};
  if(c&&name==='kshms_deviation_files')return structuredClone(attachments.filter(f=>f.deviation_id===c.id));
  return base(name,args);
 };
 return {source,cases,history,attachments,selected,rpc};
}

let saves=0;const printed=[];
class Pdf{
 constructor(){this.pages=1;this.internal={pageSize:{getWidth:()=>210,getHeight:()=>297},getNumberOfPages:()=>this.pages};}
 addPage(){this.pages++;}setPage(){}setFont(){}setFontSize(){}setTextColor(){}setFillColor(){}setDrawColor(){}setLineWidth(){}
 rect(x,y,w,h){assert(y+h<=277.001);}splitTextToSize(v){return String(v).match(/[\s\S]{1,80}/g)||[''];}
 text(v,x,y){assert(y<=285);printed.push(v);}getImageProperties(){return {width:500,height:400};}addImage(){}save(){saves++;}
}
const catalog=await loadExtractChoices({companyId:company,userId:user,rpc:deviationFixture().rpc});
assert.equal(catalog.groups.ruhs.rows.length,1);assert.equal(catalog.groups.deviations.rows.length,2);
assert.deepEqual(catalog.groups.deviations.rows.map(c=>c.category),['quality','hms']);
// Filtering a page to zero matching rows must retain its server cursor.
const cursor={before:row.created_at,id:row.id};
const filtered=await loadExtractPage({kind:'deviations',companyId:company,userId:user,rpc:async()=>({context,cases:[row],next:cursor})});
assert.equal(filtered.rows.length,0);assert.deepEqual(filtered.next,cursor);
for(const mode of ['ok','wrong-category','unknown-category','changed-category','history','foreign-file','denied','final-revoked','late']){
 const fixture=deviationFixture(),original=JSON.stringify(fixture),calls=[];let active=true,reads=0,blob;
 const options={selection:fixture.selected,companyId:company,userId:user,storageUrl,isCurrent:()=>active,rpc:async(name,args)=>{
  calls.push(name);if(name==='get_kshms_context'&&++reads===4&&mode==='final-revoked')return {...context,manage:false};
  if(mode==='denied'&&name==='kshms_deviation_files')throw Error('Denied');
  return fixture.rpc(name,args);
 }};
 if(mode==='wrong-category')options.selection=[{...fixture.selected[0],category:'hms'}];
 if(mode==='unknown-category')options.selection=[{...fixture.selected[0],category:'hr'}];
 const prior=saves;
 if(['wrong-category','unknown-category','denied'].includes(mode)){await assert.rejects(loadInspectionAttachmentPreview(options));assert.equal(saves,prior);continue;}
 const preview=await loadInspectionAttachmentPreview(options);assert.equal(preview.entries.length,4);
 if(mode==='changed-category')fixture.cases[0].category='ruh';
 if(mode==='history')fixture.history[0].actor_identity.name='CHANGED';
 if(mode==='foreign-file')fixture.attachments[0].deviation_id=fixture.cases[1].id;
 const load=async f=>{if(mode==='late')active=false;return new Blob(['x'.repeat(f.size_bytes)],{type:f.mime_type});};
 const task=()=>downloadInspectionAttachmentArchive({...options,preview,scopeText:'QA kvalitet/HMS',downloadPrivate:load,save:b=>{saves++;blob=b;}});
 if(mode==='ok'){
  await task();const manifest=verifyArchive(await blob.arrayBuffer());assert.equal(manifest.files.length,4);
  assert(manifest.files.every(f=>fixture.cases.some(c=>c.id===f.documentId)));assert(!JSON.stringify(manifest).includes(row.id));
  assert.equal(JSON.stringify(fixture),original);assert.equal(saves,prior+1);
  await downloadInspectionExtract({...options,scopeText:'QA kvalitet/HMS',downloadFile:load,loadPrivateImage:async()=>photo,loadImage:async()=>photo,loadPdf:async()=>({jsPDF:Pdf})});
  assert.equal(saves,prior+2);
 }else if(mode==='late'){assert.equal(await task(),null);assert.equal(saves,prior);}else{await assert.rejects(task());assert.equal(saves,prior);}
 assert(!calls.some(name=>name.endsWith('_command')));
}
for(const value of ['Kvalitetsavvik med historikk','HMS-avvik med historikk','Tidligere meldernavn','OPPRINNELIG hendelse','quality-Original.pdf','hms-Original.pdf','Manifest'])assert(printed.join(' ').includes(value),value);
for(const value of ['private.png','token='])assert(!printed.join(' ').includes(value));
// Standalone RUH cannot be used to export another category after refactoring.
const f=deviationFixture();
assert.throws(()=>ruhPdfDocument({case:f.cases[0],events:[],files:[]}));
await assert.rejects(readRuhPdfSnapshot({expected:f.cases[0],rpc:f.rpc,companyId:company}));
await assert.rejects(downloadRuhPdf({expected:f.cases[0],rpc:f.rpc,companyId:company,userId:user}));
// Both categories exhaust paginated history. Final changed history blocks save.
for(const category of ['quality','hms'])for(const changed of [false,true]){
 const f=deviationFixture(),c=f.cases.find(c=>c.category===category),history=Array.from({length:55},(_,i)=>({...f.history.find(e=>e.deviation_id===c.id&&e.action==='create'),id:`${category}-event-${i}`}));
 let pages=0;const prior=saves;const rpc=async(name,args)=>{
  if(name!=='kshms_deviation_detail')return f.rpc(name,args);pages++;
  const events=structuredClone(args.p_before?history.slice(50):history.slice(0,50));if(changed&&pages>=4)events[0].actor_identity.name='CHANGED';
  return {case:c,events,next:args.p_before?null:{before:row.created_at,id:history[49].id}};
 };
 const task=()=>downloadInspectionExtract({selection:f.selected.filter(v=>v.category===category),rpc,companyId:company,userId:user,scopeText:'QA hel historikk',downloadFile:async file=>new Blob(['x'.repeat(file.size_bytes)],{type:file.mime_type}),loadPrivateImage:async()=>photo,loadImage:async()=>photo,loadPdf:async()=>({jsPDF:Pdf})});
 if(changed)await assert.rejects(task());else await task();assert.equal(pages,6);assert.equal(saves-prior,changed?0:1);
}
await assert.rejects(readInspectionSnapshots({selection:[{...f.selected[0],kind:'ruhs'}],rpc:f.rpc,companyId:company,userId:user}));
console.log('critical-kshms-deviation-extract-check: PASS - explicit quality/HMS groups, exhaustive history/private originals/PDF/ZIP, category confusion and final changes/access/late gates, RUH-only entry points preserved');
