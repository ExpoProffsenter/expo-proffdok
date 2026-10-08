import {readInspectionSnapshots,checkInspectionContext,EXTRACT_GROUPS} from './kshmsInspectionExtract.mjs';
import {sameRunValue} from '../checklist/checklistRuns.mjs';
import {FILE_TYPES,deviationFileType} from '../kshms/kshmsDeviations.mjs';
import {reportPhoto} from './kshmsExecutionReport.mjs';

const FILE_LIMIT=10485760,TOTAL_LIMIT=52428800;
const changed=()=>Error('Dokumenter eller vedlegg er endret. Vis vedleggslisten og bekreft på nytt.');
const safeName=value=>String(value||'fil').normalize('NFC').replace(/[\\/:*?"<>|\x00-\x1f\x7f\u202a-\u202e\u2066-\u2069]/g,'-').replace(/\.{2,}/g,'-').replace(/^\.+|\.+$/g,'').slice(0,120)||'fil';
const imageBytes=data=>{if(!reportPhoto({data}))throw Error('Et lagret bilde kunne ikke bekreftes.');const binary=atob(data.split(',')[1]);return Uint8Array.from(binary,c=>c.charCodeAt(0));};
const typeOf=file=>file.type||file.mimeType||FILE_TYPES[String(file.name||'').split('.').at(-1).toLowerCase()];

export function projectAttachmentObject(file,storageUrl){
 let url,base;try{url=new URL(file.url);base=new URL(storageUrl);}catch{throw Error('Prosjektvedleggets lagringssted kunne ikke bekreftes.');}
 const prefix='/storage/v1/object/public/project-images/';
 if(url.origin!==base.origin||!url.pathname.startsWith(prefix)||url.username||url.password)throw Error('Prosjektvedlegget må ligge i appens prosjektlager. Hent andre originaler separat.');
 const object=decodeURIComponent(url.pathname.slice(prefix.length));
 if(!/^(sjekklister|photos|vedlegg)\//.test(object)||object.split('/').some(part=>!part||part==='.'||part==='..')||object.includes('\\')||/[\x00-\x1f]/.test(object)||(file.path&&file.path!==object)||(file.storagePath&&file.storagePath!==object))throw Error('Prosjektvedleggets lagringssted kunne ikke bekreftes.');
 return object;
}

export function inspectionAttachmentEntries(snapshots){
 const entries=[];
 for(const {kind,row,snapshot} of snapshots){
  const add=(source,file,point='')=>{
   let name=file.name,type=source==='private'?file.mime_type:typeOf(file),size=source==='private'?file.size_bytes:file.size||null;
   if(source==='embedded'){type=file.data.slice(5,file.data.indexOf(';'));size=imageBytes(file.data).length;name=`Bilde-${file.id||entries.length+1}.${type==='image/jpeg'?'jpg':type.split('/')[1]}`;}
   deviationFileType({name:name||'fil',type,size:size||1});
   entries.push({documentId:row.id,kind,documentTitle:row.title||row.content?.title||row.definition?.category||EXTRACT_GROUPS[kind],revision:row.revision??row.number??null,projectId:row.project_id||null,fileId:file.id||String(entries.length+1),name:name||'fil',type,size,point,source,file});
  };
  if(kind==='ruhs')for(const file of snapshot.files)add('private',file);
  if(kind==='rounds')for(const point of row.content.points||[])for(const file of row.content.answers?.[point.id]?.photos||[])add('embedded',file,point.title||point.id);
  if(kind==='runs')for(const point of row.definition.items||[])for(const file of row.answers?.[point]?.photos||[])add('project',file,point);
 }
 if(entries.length>100||entries.reduce((sum,e)=>sum+(e.size||0),0)>TOTAL_LIMIT)throw Error('Velg færre dokumenter: maksimalt 100 vedlegg og 50 MB per pakke.');
 return entries;
}

export async function loadInspectionAttachmentPreview(options){
 if(!await checkInspectionContext(options))return null;const snapshots=await readInspectionSnapshots(options);if(!snapshots)return null;
 const entries=inspectionAttachmentEntries(snapshots);for(const entry of entries)if(entry.source==='project')projectAttachmentObject(entry.file,options.storageUrl);if(!await checkInspectionContext(options))return null;
 return {snapshots,entries,companyId:options.companyId,userId:options.userId,selection:structuredClone(options.selection)};
}

// Stored ZIP records, UTF-8 filenames and CRC32; no third-party runtime loader.
// PKWARE APPNOTE 4.3.7/4.3.12/4.3.16. Bounded to small non-ZIP64 archives.
export function storedAttachmentZip(files){
 if(!files.length||files.length>102||new Set(files.map(f=>f.name)).size!==files.length)throw Error('Vedleggspakken kunne ikke bekreftes.');
 const local=[],central=[];let offset=0,total=0;
 for(const file of files){
  if(!(file.data instanceof Uint8Array)||!file.name||file.name.startsWith('/')||file.name.includes('\\')||file.name.split('/').some(p=>!p||p==='.'||p==='..'))throw Error('Ugyldig fil i vedleggspakken.');
  total+=file.data.length;if(total>TOTAL_LIMIT+1048576)throw Error('Vedleggspakken er for stor.');
  const name=new TextEncoder().encode(file.name);if(name.length>1024)throw Error('Filnavnet er for langt.');
  let crc=0xffffffff;for(const b of file.data){crc^=b;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}crc=(crc^0xffffffff)>>>0;
  const header=new Uint8Array(30+name.length),h=new DataView(header.buffer);h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x800,true);h.setUint16(12,0x21,true);h.setUint32(14,crc,true);h.setUint32(18,file.data.length,true);h.setUint32(22,file.data.length,true);h.setUint16(26,name.length,true);header.set(name,30);
  const record=new Uint8Array(46+name.length),c=new DataView(record.buffer);c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(8,0x800,true);c.setUint16(14,0x21,true);c.setUint32(16,crc,true);c.setUint32(20,file.data.length,true);c.setUint32(24,file.data.length,true);c.setUint16(28,name.length,true);c.setUint32(42,offset,true);record.set(name,46);
  local.push(header,file.data);central.push(record);offset+=header.length+file.data.length;
 }
 const end=new Uint8Array(22),v=new DataView(end.buffer);v.setUint32(0,0x06054b50,true);v.setUint16(8,files.length,true);v.setUint16(10,files.length,true);v.setUint32(12,central.reduce((n,c)=>n+c.length,0),true);v.setUint32(16,offset,true);
 return new Blob([...local,...central,end],{type:'application/zip'});
}

export function saveAttachmentArchive(blob,name){
 const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name;document.body.appendChild(link);
 try{link.click();}finally{link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
}

export async function downloadInspectionAttachmentArchive({preview,scopeText,downloadPrivate,downloadProject,save=saveAttachmentArchive,...options}){
 if(!scopeText?.trim()||scopeText.length>2000||!preview?.entries.length||preview.companyId!==options.companyId||preview.userId!==options.userId||!sameRunValue(preview.selection,options.selection))throw changed();
 if(!await checkInspectionContext(options))return null;const before=await readInspectionSnapshots(options);if(!before)return null;if(!sameRunValue(before,preview.snapshots)||!sameRunValue(inspectionAttachmentEntries(before),preview.entries))throw changed();
 const files=[],manifest=[],now=new Date().toISOString();let total=0;
 for(const [index,entry] of preview.entries.entries()){
  let bytes,type;
  if(entry.source==='embedded'){bytes=imageBytes(entry.file.data);type=entry.type;}
  else{const blob=await (entry.source==='private'?downloadPrivate(entry.file):downloadProject(entry.file));if(options.isCurrent&&!options.isCurrent())return null;
   if(!blob||!blob.size||blob.size>FILE_LIMIT||entry.size&&blob.size!==entry.size||blob.type!==entry.type)throw Error('Et vedlegg mangler eller er endret. Ingen vedleggspakke er laget.');
   bytes=new Uint8Array(await blob.arrayBuffer());type=blob.type;
  }
  if(options.isCurrent&&!options.isCurrent())return null;total+=bytes.length;if(total>TOTAL_LIMIT)throw Error('Vedleggspakken overstiger 50 MB. Velg færre dokumenter.');
  const digest=await crypto.subtle.digest('SHA-256',bytes);if(options.isCurrent&&!options.isCurrent())return null;
  const path=`vedlegg/${String(index+1).padStart(3,'0')}-${safeName(entry.name)}`;files.push({name:path,data:bytes});
  manifest.push({documentId:entry.documentId,documentGroup:EXTRACT_GROUPS[entry.kind],documentTitle:entry.documentTitle,revision:entry.revision,projectId:entry.projectId,fileId:entry.fileId,originalName:entry.name,point:entry.point,type,bytes:bytes.length,sha256:Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join(''),path});
 }
 const final=await readInspectionSnapshots(options);if(!final)return null;if(!sameRunValue(before,final))throw changed();if(!await checkInspectionContext(options))return null;
 const data={format:'expo-kshms-attachments-v1',archiveId:crypto.randomUUID(),createdAt:now,companyId:options.companyId,scope:scopeText.trim(),notice:'Valgte vedlegg. Lagrede kontrollbilder kan være komprimert i appen. Ingen rapport-PDF, HR, ansattbekreftelser eller automatisk deling. ZIP-filen er ikke kryptert. Kontroller innhold og mottaker før deling.',files:manifest};
 files.unshift({name:'manifest.json',data:new TextEncoder().encode(JSON.stringify(data,null,2))});const blob=storedAttachmentZip(files);
 if(options.isCurrent&&!options.isCurrent())return null;save(blob,`KS-HMS vedlegg - ${safeName(scopeText.trim()).slice(0,90)}.zip`);
 return {files:manifest.length,bytes:total};
}
