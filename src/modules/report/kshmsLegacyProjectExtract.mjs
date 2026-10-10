import {formatDeviationDate,formatDeviationDateTime} from '../deviations/deviationDates.mjs';
import {FILE_TYPES,deviationFileType} from '../kshms/kshmsDeviations.mjs';

const fail=()=>Error('Prosjektavviket er endret eller ikke tilgjengelig. Hent eldre prosjektavvik og velg på nytt.');
const strings=['type','severity','title','description','action','responsible','responsible_id','dueDate','immediate_action','createdAt','closedAt','closedBy','closeComment'];
const when=value=>formatDeviationDateTime(value)||'Ikke oppgitt';

// Only the stored legacy case is copied. No unrelated project/customer JSON,
// live account lookup, invented revision/signature or constructed event history.
export async function legacyProjectRows(project,companyId,projectId){
 if(project?.id!==projectId||project.company_scope_id!==companyId)throw fail();
 const entries=project.deviations??[];
 if(!Array.isArray(entries)||entries.length>500||entries.some(e=>!e?.id||typeof e.id!=='string')||new Set(entries.map(e=>e.id)).size!==entries.length)throw fail();
 const rows=[];
 for(const entry of entries){
  if(entry.ks_deviation_id)continue; // authoritative linked case uses the KS/HMS group
  if(!['Åpent','Lukket'].includes(entry.status||'Åpent'))throw fail();
  const content=Object.fromEntries(strings.map(key=>[key,typeof entry[key]==='string'?entry[key]:'']));
  content.status=entry.status||'Åpent';content.affectsWarranty=entry.affectsWarranty===true;content.includeInReport=entry.includeInReport===true;
  if(entry.photos!=null&&!Array.isArray(entry.photos))throw fail();
  content.photos=(entry.photos||[]).map(file=>{
   if(!file||typeof file.url!=='string'||!file.url||typeof file.name!=='string'||!file.name)throw fail();
   const type=file.type||file.mimeType||FILE_TYPES[file.name.split('.').at(-1).toLowerCase()];
   deviationFileType({name:file.name,type,size:file.size||1});
   return {id:typeof file.id==='string'?file.id:'',url:file.url,name:file.name,type,...(file.size?{size:file.size}:{}),...(file.path?{path:file.path}:{}),...(file.storagePath?{storagePath:file.storagePath}:{})};
  });
  const row={id:`${projectId}:${entry.id}`,source_id:entry.id,company_id:companyId,project_id:projectId,status:content.status,content};
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(row)));
  row.content_hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');rows.push(row);
 }return rows;
}

export async function readLegacyProjectRows({rpc,readProject,companyId,userId,projectId,isCurrent=()=>true}){
 const access=async()=>{
  const state=await rpc('project_checklist_state',{p_company_id:companyId,p_project_id:projectId});if(!isCurrent())return false;
  const x=state?.context;if(x?.company_id!==companyId||x.user_id!==userId||x.project_id!==projectId)throw fail();return true;
 };
 if(!await access())return null;
 const project=await readProject(projectId);if(!isCurrent())return null;
 const rows=await legacyProjectRows(project,companyId,projectId);if(!isCurrent())return null;
 if(!await access())return null;return rows;
}

export function legacyProjectDocument(row){
 const c=row.content;
 return {id:row.id,type:'Eldre prosjektavvik - lagret tilstand',title:c.title||'Prosjektavvik uten tittel',fields:[
  ['Status',c.status],['Dokument-ID / kilde-ID',`${row.id} / ${row.source_id}`],['Prosjekt-ID',row.project_id],['Innholdskontroll (SHA-256)',row.content_hash],
  ['Dokumentasjon','Lagret prosjektavvik uten versjonert hendelseshistorikk. Ansvar og lukking er eldre tekstfelter, ikke verifiserte KS/HMS-signaturer.'],
  ['Type / alvorlighet',[c.type,c.severity].filter(Boolean).join(' / ')],['Hendelse',c.description],['Strakstiltak',c.immediate_action],['Tiltak',c.action],
  ['Ansvarlig - lagret tekst',c.responsible],['Ansvarlig bruker-ID',c.responsible_id],['Frist',formatDeviationDate(c.dueDate)],['Registrert tidspunkt',when(c.createdAt)],
  ['Lukket av - lagret tekst',c.closedBy],['Lagret lukketidspunkt',c.closedAt?when(c.closedAt):'Ikke oppgitt'],['Lukkekommentar',c.closeComment],
  ['Påvirker garanti',c.affectsWarranty?'Ja':'Nei'],['Valgt i prosjektets sluttrapport',c.includeInReport?'Ja':'Nei']
 ],blocks:c.photos.map((file,i)=>({title:`Vedlegg ${i+1}: ${file.name}`,fields:[['Innhold',file.type.startsWith('image/')?'Lagret bilde, gjengitt nedenfor.':'Originalfilen følger ikke PDF-en. Bruk vedleggslisten for ZIP.']],photos:file.type.startsWith('image/')?[{file}]:[]})),closing:[['Avgrensning','Nedlasting endrer ikke prosjektet, lukker ingen sak og lager ingen historikk eller signatur. Bare dette valgte prosjektavviket følger uttrekket.']]};
}
