import assert from 'node:assert/strict';
import fs from 'node:fs';
import {company,user,project} from './critical-kshms-ruh-pdf-check.mjs';
import {fixtureRpc,photo} from './critical-kshms-inspection-extract-check.mjs';
import {storageUrl,verifyArchive} from './critical-kshms-attachment-archive-check.mjs';
import {legacyProjectRows} from '../src/modules/report/kshmsLegacyProjectExtract.mjs';
import {loadExtractProjectDeviations,downloadInspectionExtract} from '../src/modules/report/kshmsInspectionExtract.mjs';
import {loadInspectionAttachmentPreview,downloadInspectionAttachmentArchive} from '../src/modules/report/kshmsAttachmentArchive.mjs';

export function legacyFixture(){
 const file={id:'legacy-image',name:'Eldre-bilde.png',url:storageUrl+'/storage/v1/object/public/project-images/avvik/qa.png',path:'avvik/qa.png',size:4};
 const data={id:project,company_scope_id:company,deviations:[
  {id:'old-open',title:'QA eldre åpent avvik',status:'Åpent',description:'QA eldre hendelse',responsible:'Lagret tidligere ansvarlig',createdAt:'2026-09-08T10:00:00Z',photos:[file,{...file,id:'legacy-doc',name:'Eldre-original.pdf',url:storageUrl+'/storage/v1/object/public/project-images/vedlegg/qa.pdf',path:'vedlegg/qa.pdf'}],secret:'PRIVATE EMPLOYEE'},
  {id:'old-closed',title:'QA eldre lukket avvik',status:'Lukket',action:'QA utført tiltak',closedBy:'Lagret tidligere lukker',closedAt:'2026-09-09T10:00:00Z',closeComment:'QA eldre kontroll',photos:[]},
  {id:'linked',ks_deviation_id:crypto.randomUUID(),title:'LINKED ALREADY IN KS',photos:[]}
 ]};
 return {data,rpc:fixtureRpc(),readProject:async()=>structuredClone(data)};
}
let saves=0;const printed=[];
class Pdf{
 constructor(){this.pages=1;this.internal={pageSize:{getWidth:()=>210,getHeight:()=>297},getNumberOfPages:()=>this.pages};}
 addPage(){this.pages++;}setPage(){}setFont(){}setFontSize(){}setTextColor(){}setFillColor(){}setDrawColor(){}setLineWidth(){}rect(x,y,w,h){assert(y+h<=277.001);}splitTextToSize(v){return String(v).match(/[\s\S]{1,80}/g)||[''];}text(v,x,y){assert(y<=285);printed.push(v);}getImageProperties(){return {width:500,height:400};}addImage(){}save(){saves++;}
}
for(const mode of ['ok','foreign-company','foreign-project','project-denied','wrong-user','linked-after-preview','changed-content','changed-file','removed','file-denied','type','size','final-project-denied','late-project','late-file']){
 const fixture=legacyFixture(),original=JSON.stringify(fixture.data);let active=true,access=0,blob;
 const options={companyId:company,userId:user,projectId:project,storageUrl,isCurrent:()=>active,readProject:async()=>{if(mode==='late-project')active=false;return fixture.readProject();},rpc:async(name,args)=>{
  if(name==='project_checklist_state'){access++;if(mode==='project-denied'||mode==='final-project-denied'&&access>=5)throw Error('Project denied');const result=await fixture.rpc(name,args);if(mode==='wrong-user')result.context.user_id='other';return result;}return fixture.rpc(name,args);
 }};
 if(mode==='foreign-company')fixture.data.company_scope_id='other';if(mode==='foreign-project')fixture.data.id='other';
 if(['foreign-company','foreign-project','project-denied','wrong-user'].includes(mode)){await assert.rejects(loadExtractProjectDeviations(options));continue;}
 const selection=await loadExtractProjectDeviations(options);if(mode==='late-project'){assert.equal(selection,null);continue;}
 assert.equal(selection.length,2);assert(selection.every(r=>r.hash.length===64));options.selection=selection;
 const preview=await loadInspectionAttachmentPreview(options);assert.equal(preview.entries.length,2);assert.equal(preview.entries[0].type,'image/png');
 if(mode==='linked-after-preview')fixture.data.deviations[0].ks_deviation_id='linked';if(mode==='changed-content')fixture.data.deviations[0].description='new';if(mode==='changed-file')fixture.data.deviations[0].photos[0].path='new';if(mode==='removed')fixture.data.deviations.shift();
 const downloadProject=async file=>{if(mode==='late-file')active=false;if(mode==='file-denied')throw Error('denied');return new Blob(['x'.repeat(mode==='size'?2:file.size||4)],{type:mode==='type'?'image/jpeg':file.type});};
 const prior=saves,task=()=>downloadInspectionAttachmentArchive({...options,preview,scopeText:'QA eldre',downloadProject,save:b=>{saves++;blob=b;}});
 if(mode==='ok'){
  await task();const manifest=verifyArchive(await blob.arrayBuffer());assert.equal(manifest.files.length,2);assert(manifest.files.every(f=>f.contentHash===selection[0].hash&&f.projectId===project&&f.revision===null));
  await downloadInspectionExtract({...options,scopeText:'QA eldre',downloadProject,loadPrivateImage:async()=>photo,loadImage:async()=>photo,loadPdf:async()=>({jsPDF:Pdf})});assert.equal(saves,prior+2);assert.equal(JSON.stringify(fixture.data),original);
 }else if(mode.startsWith('late')){assert.equal(await task(),null);assert.equal(saves,prior);}else{await assert.rejects(task(),undefined,mode);assert.equal(saves,prior);}
}
for(const value of ['Eldre prosjektavvik','uten versjonert hendelseshistorikk','QA eldre hendelse','Lagret tidligere ansvarlig','Lagret tidligere lukker','Eldre-original.pdf','SHA-256','uten versjonsnummer'])assert(printed.join(' ').includes(value),value);
for(const value of ['PRIVATE EMPLOYEE','LINKED ALREADY IN KS','avvik/qa.png','storage/v1'])assert(!printed.join(' ').includes(value),value);
for(const change of [data=>data.deviations.push(data.deviations[0]),data=>data.deviations[0].photos={},data=>data.deviations[0].status='Signed']){const f=legacyFixture();change(f.data);await assert.rejects(legacyProjectRows(f.data,company,project));}
// Content changes during the PDF-engine load must stop the final save.
const f=legacyFixture(),options={companyId:company,userId:user,projectId:project,rpc:f.rpc,readProject:f.readProject};options.selection=await loadExtractProjectDeviations(options);const prior=saves;
await assert.rejects(downloadInspectionExtract({...options,scopeText:'QA final',downloadProject:async file=>new Blob(['four'],{type:file.type}),loadPrivateImage:async()=>photo,loadImage:async()=>photo,loadPdf:async()=>{f.data.deviations[1].closeComment='changed';return {jsPDF:Pdf};}}));assert.equal(saves,prior);
const ui=fs.readFileSync('src/modules/kshms/KshmsInspectionExtract.jsx','utf8');assert(ui.includes("select('id,company_scope_id,deviations:data->project->projectDeviations')"));assert(ui.includes(".eq('company_scope_id',companyId)"));
console.log('critical-kshms-legacy-extract-check: PASS - legacy project access before/after scoped read, explicit cases/content hash, PDF/ZIP originals, no duplicate linked cases or invented history/signature, changes/revocation/late/missing-file gates');
