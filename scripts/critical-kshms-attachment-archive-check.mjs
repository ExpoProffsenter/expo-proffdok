import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import {sources,selection,fixtureRpc} from './critical-kshms-inspection-extract-check.mjs';
import {company,user} from './critical-kshms-ruh-pdf-check.mjs';
import {loadInspectionAttachmentPreview,downloadInspectionAttachmentArchive,projectAttachmentObject,inspectionAttachmentEntries,storedAttachmentZip} from '../src/modules/report/kshmsAttachmentArchive.mjs';
export const storageUrl='https://qa.supabase.co';
export function attachmentSource(){
 const source=structuredClone(sources);
 source.runs[0].answers.Koblinger.photos=[{id:'project-file',name:'Kontrollbilde.png',type:'image/png',size:4,url:storageUrl+'/storage/v1/object/public/project-images/sjekklister/projekt/kontroll.png',path:'sjekklister/projekt/kontroll.png'}];
 source.files.push({...source.files[1],id:'office-file',name:'Vurdering.docx',mime_type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',size_bytes:4,object_name:source.files[1].object_name+'.docx'});
 return source;
}
export function verifyArchive(bytes){
 return JSON.parse(execFileSync('python',['-c',`import sys,base64,io,zipfile,json,hashlib
z=zipfile.ZipFile(io.BytesIO(base64.b64decode(sys.stdin.read())))
assert z.testzip() is None
m=json.loads(z.read('manifest.json'))
assert len(z.namelist())==len(m['files'])+1
for f in m['files']:
 b=z.read(f['path']); assert len(b)==f['bytes']; assert hashlib.sha256(b).hexdigest()==f['sha256']
assert all(x.flag_bits&2048 for x in z.infolist())
print(json.dumps(m))`],{input:Buffer.from(bytes).toString('base64'),encoding:'utf8'}));
}
let saves=0;
for(const mode of ['ok','role','company','user','changed-file','changed-history','changed-round','changed-run','storage','size','type','final-role','late-file','late-final']){
 const source=attachmentSource(),original=JSON.stringify(source);let active=true,reads=0,blob;
 const inner=fixtureRpc({source,mode:['role','company','user'].includes(mode)?mode:''});
 const options={selection,companyId:company,userId:user,storageUrl,isCurrent:()=>active,rpc:async(name,args)=>{if(name==='get_kshms_context'){reads++;if(mode==='final-role'&&reads===4)return {company_id:company,user_id:user,enabled:true,manage:false};if(mode==='late-final'&&reads===4)active=false;}return inner(name,args);}};
 const before=saves;
 if(['role','company','user'].includes(mode)){await assert.rejects(loadInspectionAttachmentPreview(options));continue;}
 const preview=await loadInspectionAttachmentPreview(options);assert.equal(preview.entries.length,7);
 if(mode==='changed-file')source.files.pop();if(mode==='changed-history')source.events[0].actor_identity.name='CHANGED';if(mode==='changed-round')source.rounds[0].content.review='CHANGED';if(mode==='changed-run')source.runs[0].answers.Koblinger.comment='CHANGED';
 const load=async file=>{if(mode==='late-file')active=false;if(mode==='storage')throw Error('denied');return new Blob(['x'.repeat(mode==='size'?2:file.size_bytes||file.size)],{type:mode==='type'?'image/jpeg':file.mime_type||file.type});};
 const task=()=>downloadInspectionAttachmentArchive({...options,preview,scopeText:'QA valgt vedlegg',downloadPrivate:load,downloadProject:load,save:value=>{saves++;blob=value;}});
 if(mode==='ok'){
  const result=await task();assert.equal(result.files,7);const manifest=verifyArchive(await blob.arrayBuffer());assert.equal(manifest.companyId,company);assert.equal(manifest.files.filter(f=>f.documentGroup==='SJA').length,1);assert(manifest.files.some(f=>f.originalName==='SJA-bilde-1.jpg'&&f.point==='Bilder fra arbeidsstedet'));assert(manifest.files.some(f=>f.documentGroup.includes('Risikovurdering')&&f.originalName==='Risiko-1-bilde-1.png'&&f.point==='Støv'));assert.equal(manifest.files.filter(f=>f.documentGroup.includes('RUH')).length,3);assert(manifest.files.some(f=>f.originalName==='Vurdering.docx'));assert(manifest.files.some(f=>f.point==='Fri rømningsvei'));for(const secret of ['PRIVATE EMPLOYEE','object_name','storage/v1','private.png','data:image','token='])assert(!JSON.stringify(manifest).includes(secret));assert.equal(JSON.stringify(source),original);
 }else if(mode.startsWith('late'))assert.equal(await task(),null);else await assert.rejects(task());
 assert.equal(saves-before,mode==='ok'?1:0,mode);
}
const source=attachmentSource(),options={selection,companyId:company,userId:user,rpc:fixtureRpc({source}),storageUrl};
const preview=await loadInspectionAttachmentPreview(options);assert.equal(preview.entries.length,7);
for(const patch of [{scopeText:''},{userId:'other'},{companyId:'other'},{selection:selection.slice(1)}])await assert.rejects(downloadInspectionAttachmentArchive({...options,preview,scopeText:'QA',...patch}));
const riskOnly=await loadInspectionAttachmentPreview({...options,selection:selection.filter(v=>v.kind==='risks')});assert.equal(riskOnly.entries.length,1);
const file=source.runs[0].answers.Koblinger.photos[0];assert.equal(projectAttachmentObject(file,storageUrl),file.path);
for(const url of ['https://other.invalid/storage/v1/object/public/project-images/sjekklister/a','https://qa.supabase.co/storage/v1/object/public/kshms-private/sjekklister/a',storageUrl+'/storage/v1/object/public/project-images/vedlegg/%2e%2e%2fsecret',storageUrl+'/storage/v1/object/public/project-images/elsewhere/a','data:image/png;base64,AA=='])assert.throws(()=>projectAttachmentObject({...file,path:undefined,url},storageUrl));assert.throws(()=>projectAttachmentObject({...file,path:'other'},storageUrl));
for(const mutate of [s=>s.files[0].size_bytes=10485761,s=>s.files[0].mime_type='application/javascript',s=>s.files=Array.from({length:101},(_,i)=>({...s.files[0],id:String(i)})),s=>s.files=Array.from({length:6},(_,i)=>({...s.files[0],id:String(i),size_bytes:10485760}))]){const s=attachmentSource();mutate(s);await assert.rejects(loadInspectionAttachmentPreview({...options,rpc:fixtureRpc({source:s})}));}
assert.throws(()=>inspectionAttachmentEntries([{kind:'rounds',row:{id:'a',content:{points:[{id:'p'}],answers:{p:{photos:[{data:'data:image/png;base64,!'}]}}}}}]));
for(const name of ['../evil','/evil','a//b','a/../b','a\\b'])assert.throws(()=>storedAttachmentZip([{name,data:new Uint8Array([1])}]));
const utf=storedAttachmentZip([{name:'vedlegg/æøå.png',data:new Uint8Array([0,255,10])}]);assert.equal(utf.type,'application/zip');
const ui=fs.readFileSync('src/modules/kshms/KshmsInspectionExtract.jsx','utf8');assert(ui.includes('!attachmentConfirmed'));assert(ui.includes(".from('project-images').download(object)"));assert(!ui.includes('fetch('));
console.log('critical-kshms-attachment-archive-check: PASS - independent ZIP CRC/UTF-8/hash verification, exact selected snapshots/private and project files, bounded sizes/types/paths, role and late cancellation, no partial archive or mutation');
