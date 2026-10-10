import assert from 'node:assert/strict';
import fs from 'node:fs';
import {downloadInspectionExtract,loadExtractChoices,loadExtractPage,loadExtractRuns,extractKey} from '../src/modules/report/kshmsInspectionExtract.mjs';
import {company,user,project,row,events,files} from './critical-kshms-ruh-pdf-check.mjs';
import {signed} from './critical-kshms-sja-pdf-check.mjs';
import {routine,version,template,edition,run} from './critical-kshms-document-pdf-check.mjs';
import {round,risk} from './critical-kshms-execution-pdf-check.mjs';

export const context={company_id:company,user_id:user,enabled:true,manage:true};
export const sources={routines:[routine],versions:[version],templates:[template],editions:[edition],reviews:[{id:crypto.randomUUID(),company_id:company,signed_by:user,signed_at:'2026-10-08T10:00:00Z',version_snapshot:[{id:version.id,hash:version.content_hash}],findings:'Gjennomført kontroll',follow_up:'Følg opp opplæring separat',next_review_on:'2027-10-08',statement:'Lagret revisjonssignatur'}],sjas:[signed],ruhs:[row],rounds:[{...round,company_id:company,project_id:project}],risks:[{...risk,company_id:company,project_id:project}],runs:[run],events,files};
export const selection=[['routines',version],['templates',edition],['reviews',sources.reviews[0]],['sjas',signed],['ruhs',row],['rounds',sources.rounds[0]],['risks',sources.risks[0]],['runs',run]].map(([kind,r])=>({kind,id:r.id,revision:r.revision,number:r.number,hash:r.content_hash,status:r.status,projectId:r.project_id||null,title:r.title||r.content?.title||kind}));
const before=JSON.stringify(sources);export const photo='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aF1sAAAAASUVORK5CYII=';
export function fixtureRpc({source=sources,mode='',onCall=()=>{}}={}){
 let contexts=0,details=0;
 return async(name,args={})=>{
  onCall(name,args);
  if(name==='get_kshms_context'){contexts++;return {...context,...(mode==='role'||mode==='final-role'&&contexts===2?{manage:false}:{}),...(mode==='company'?{company_id:'other'}:{}),...(mode==='user'?{user_id:'other'}:{}),...(mode==='disabled'?{enabled:false}:{})};}
  if(name==='work_profile_company_profile')return {companyId:mode==='profile'?'other':company,companyName:'QA firma',logoUrl:'/logo.png'};
  if(name==='kshms_get_state')return {context,routines:structuredClone(source.routines),versions:structuredClone(source.versions),reviews:structuredClone(source.reviews),assignments:[],acknowledgments:[{statement:'PRIVATE EMPLOYEE ACK'}]};
  if(name==='kshms_checklist_state')return {context,templates:structuredClone(source.templates),versions:structuredClone(source.editions)};
  if(name==='kshms_job_choices')return {context,projects:[{id:project,name:'QA prosjekt'}],project_total:1};
  if(name==='kshms_sja_state')return {context,items:source.sjas.map(r=>({...r,title:r.content.title})),total:source.sjas.length};
  if(name==='kshms_deviation_state')return {context,cases:source.ruhs,next:null};
  if(name==='kshms_execution_state')return {context,records:source[args.p_kind==='round'?'rounds':'risks'].map(r=>({...r,title:r.content.title})),next:null};
  if(name==='project_checklist_state')return {context:{company_id:company,user_id:user,project_id:project},runs:structuredClone(source.runs)};
  if(name==='kshms_sja_detail'){details++;if(mode==='revoked-final'&&details===2)throw Error('Revoked access');return {context,sja:structuredClone(source.sjas.find(r=>r.id===args.p_id))};}
  if(name==='kshms_execution_detail')return {context,record:structuredClone([...source.rounds,...source.risks].find(r=>r.id===args.p_id))};
  if(name==='kshms_deviation_detail')return {case:structuredClone(source.ruhs.find(r=>r.id===args.p_id)),events:structuredClone(source.events),next:null};
  if(name==='kshms_deviation_files')return structuredClone(source.files);
  throw Error('Unexpected RPC / mutation '+name);
 };
}
const printed=[],images=[],ranges=[];let saves=0;
class Pdf{
 constructor(){this.pages=1;this.internal={pageSize:{getWidth:()=>210,getHeight:()=>297},getNumberOfPages:()=>this.pages};}
 addPage(){this.pages++;}setPage(){}setFont(){}setFontSize(){}setTextColor(){}setFillColor(){}setDrawColor(){}setLineWidth(){}
 rect(x,y,w,h){assert(y+h<=277.001);}splitTextToSize(v){return String(v).match(/[\s\S]{1,80}/g)||[''];}
 text(v,x,y){assert(y<=285);printed.push(v);if(/\d+-\d+/.test(v))ranges.push(v);}getImageProperties(){return {width:500,height:400};}addImage(v){images.push(v);}save(){saves++;}
}
const catalog=await loadExtractChoices({companyId:company,userId:user,rpc:fixtureRpc(),query:'QA'});assert.equal(catalog.query,'QA');assert.equal(Object.values(catalog.groups).reduce((n,g)=>n+g.rows.length,0),7);assert.equal(catalog.groups.runs.rows.length,0);assert.equal((await loadExtractRuns({companyId:company,userId:user,projectId:project,rpc:fixtureRpc()})).length,1);
for(const mode of ['ok','missing-logo','role','final-role','company','user','disabled','profile','revoked-final','late-image','late-engine','late-final','image-missing','image-size','image-type','bad-image','changed-history','changed-files','changed-row','changed-version','changed-review','changed-run','missing-selected']){
 const source=structuredClone(sources);let active=true;const calls=[];const beforeSave=saves;
 const inner=fixtureRpc({source,mode,onCall:name=>calls.push(name)});
 const rpc=async(name,args)=>{if(mode==='late-final'&&name==='get_kshms_context'&&calls.filter(n=>n===name).length===1)active=false;return inner(name,args);};
 const options={selection,scopeText:'QA tilsyn - valgt omfang',companyId:company,userId:user,rpc,isCurrent:()=>active,loadPdf:async()=>{
  if(mode==='late-engine')active=false;
  if(mode==='changed-history')source.events[0].actor_identity.name='CHANGED';if(mode==='changed-files')source.files.pop();if(mode==='changed-row')source.sjas[0].content.task='NEW';if(mode==='changed-version')source.versions[0].content.procedure='NEW';if(mode==='changed-review')source.reviews[0].findings='NEW';if(mode==='changed-run')source.runs[0].completed_identity.name='NEW';if(mode==='missing-selected')source.rounds=[];
  return {jsPDF:Pdf};
 },downloadFile:async()=>mode==='image-missing'?null:new Blob([mode==='image-size'?'bigger':'four'],{type:mode==='image-type'?'image/jpeg':'image/png'}),loadPrivateImage:async()=>{if(mode==='late-image')active=false;return mode==='bad-image'?null:photo;},loadImage:async url=>mode==='missing-logo'&&url==='/logo.png'?null:photo};
 const good=mode==='ok'||mode==='missing-logo';if(good){const result=await downloadInspectionExtract(options);assert.equal(result.documents,8);assert.equal(result.logoMissing,mode==='missing-logo');assert(result.pages>=10);}else if(mode.startsWith('late-'))assert.equal(await downloadInspectionExtract(options),null);else await assert.rejects(downloadInspectionExtract(options),undefined,mode);
 assert.equal(saves-beforeSave,good?1:0,mode);assert(calls.every(name=>!name.endsWith('_command')));
}
for(const value of ['Manifest','Lagret signatur','Tidligere meldernavn','OPPRINNELIG hendelse',version.id,version.content_hash,'Lagret revisjonssignatur','Original.pdf','forventet effekt','Lagret fullfører'])assert(printed.join(' ').includes(value),value);
for(const value of ['PRIVATE EMPLOYEE ACK','ULAGRET FORSLAG','NYTT UPUBLISERT','token=','private.png'])assert(!printed.join(' ').includes(value),'Leak '+value);
assert(images.length>=4);assert(ranges.length>=8);assert.equal(JSON.stringify(sources),before);
for(const bad of [[],[...selection,selection[0]],[{kind:'hr',id:'secret'}],Array.from({length:51},(_,i)=>({kind:'ruhs',id:String(i)}))])await assert.rejects(downloadInspectionExtract({selection:bad,scopeText:'QA'}));
// Exhaustive RUH history both passes; no silent first-page-only extract.
let historyPages=0;const history=Array.from({length:55},(_,i)=>({...events[0],id:'event-'+i}));const inner=fixtureRpc();
await downloadInspectionExtract({selection:selection.filter(r=>r.kind==='ruhs'),scopeText:'QA hele historikken',companyId:company,userId:user,rpc:async(name,args)=>{
 if(name!=='kshms_deviation_detail')return inner(name,args);historyPages++;return {case:row,events:args.p_before?history.slice(50):history.slice(0,50),next:args.p_before?null:{before:row.created_at,id:'event-49'}};
},downloadFile:async()=>new Blob(['four'],{type:'image/png'}),loadPrivateImage:async()=>photo,loadImage:async()=>photo,loadPdf:async()=>({jsPDF:Pdf})});assert.equal(historyPages,6);
for(const mode of ['wrong-context','duplicate','cycle','invalid'])await assert.rejects(loadExtractPage({kind:'rounds',companyId:company,userId:user,cursor:{updated_at:'now',id:'id'},rpc:async()=>({context:mode==='wrong-context'?{...context,manage:false}:context,records:mode==='duplicate'?[{id:'a'},{id:'a'}]:[{id:'a'}],next:mode==='cycle'?{updated_at:'now',id:'id'}:mode==='invalid'?{id:'a'}:null})}));
const source=fs.readFileSync('src/modules/kshms/KshmsInspectionExtract.jsx','utf8');assert(source.includes(".from('kshms-private').download(file.object_name)"));assert(source.includes('latest.current===snapshot'));assert(source.includes('token.active=false'));assert(source.includes('!confirmed'));assert(!source.includes('createSignedUrl'));
const module=fs.readFileSync('src/modules/kshms/KshmsModule.jsx','utf8');assert(module.includes("canManage&&screen==='extract'"));
assert.equal(new Set(selection.map(extractKey)).size,8);
console.log('critical-kshms-inspection-extract-check: PASS - explicit eight-type selection/manifest, exhaustive RUH history/private images, exact final snapshots and role/access, no mutation or staff/draft/token leak');
