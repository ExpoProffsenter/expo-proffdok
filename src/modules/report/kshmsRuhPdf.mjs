import {appendExecutionPdf,loadCompanyLogo,reportPhoto} from './kshmsExecutionReport.mjs';
import {identityText} from '../kshms/kshmsPersonal.mjs';
import {DEVIATION_STATUS,DEVIATION_CATEGORY} from '../kshms/kshmsDeviations.mjs';
import {sameRunValue} from '../checklist/checklistRuns.mjs';
import {formatDeviationDate,formatDeviationDateTime} from '../deviations/deviationDates.mjs';

const when=v=>formatDeviationDateTime(v)||'Ikke oppgitt';
const names={create:'Registrert',save:'Endret',close:'Lukket etter egen kontroll',reopen:'Gjenåpnet',file:'Vedlegg lagt til'};
const imageTypes=['image/jpeg','image/png','image/webp'];
const fields=row=>[
 ['Sak / lagret revisjon',`${row.id} / ${row.revision}`],['Status',DEVIATION_STATUS[row.status]||row.status],['Type',DEVIATION_CATEGORY[row.category]||row.category],
 ['Tittel',row.title],['Hendelse',row.event],['Prosjekt-ID',row.project_id||'Uten prosjekt'],['Ekstern / egen referanse',row.project_reference],['Rutiner / utgaver',row.routines],
 ['Meldt av',identityText(row.creator_identity,row.created_by)],['Meldt tidspunkt',when(row.created_at)],['Ansvarlig',identityText(row.responsible_identity,row.responsible_id)],['Saksbehandler',identityText(row.handler_identity,row.handler_id)],['Frist',formatDeviationDate(row.due_on)],
 ['Årsak',row.cause],['Strakstiltak',row.immediate_action],['Utførte tiltak / forbedring',row.improvement_action],['Videre oppfølging',row.follow_up],['Egen kontroll av resultatet',row.control_note],
 ['Kildekobling',[row.source_kind,row.source_key,row.source_group,row.source_item].filter(Boolean).join(' / ')],['Valgt i sluttrapport',row.include_in_report?'Ja':'Nei'],
 ['Sist lagret tidspunkt',when(row.updated_at)],['Lukket av',row.closed_at?identityText(row.closed_identity,row.closed_by):'Ikke lukket'],['Lagret lukking',row.closed_at?when(row.closed_at):'Ikke lukket']
];

// Whitelist stored case fields. Storage paths, signed links and arbitrary JSON
// are never rendered. Historical identity snapshots remain historical.
export function ruhPdfDocument({case:row,events,files}){
 if(row?.category!=='ruh'||!row.id||!Array.isArray(events)||!Array.isArray(files))throw Error('RUH-dokumentasjonen kunne ikke bekreftes.');
 return {id:row.id,type:'RUH med historikk og vedlegg',title:row.title,fields:[['Dokumentbruk','Internt uttrekk. Vurder innhold og mottaker før du deler filen.'],...fields(row),['Historikk / vedlegg',`${events.length} historikkhendelser / ${files.length} lagrede vedlegg`]],blocks:[
  ...files.map((file,i)=>({title:`Vedlegg ${i+1}: ${file.name}`,fields:[['Filtype / størrelse',`${file.mime_type} / ${Math.ceil(file.size_bytes/1024)} KB`],['Lagret tidspunkt',when(file.uploaded_at)],['Innhold',imageTypes.includes(file.mime_type)?'Lagret bilde, gjengitt nedenfor.':'Originalfilen følger ikke PDF-en. Åpne vedlegget i appen.']],photos:imageTypes.includes(file.mime_type)?[{file}]:[]})),
  ...[...events].reverse().map((event,i)=>({title:`Historikk ${i+1}: ${names[event.action]||event.action}`,fields:[['Utført av - lagret identitet',identityText(event.actor_identity,event.actor_id)],['Tidspunkt / hendelses-ID',`${when(event.created_at)} / ${event.id}`],...(event.action==='file'?[['Vedleggsnavn',event.snapshot.name],['Fil-ID / størrelse',`${event.snapshot.id} / ${Math.ceil(event.snapshot.size_bytes/1024)} KB`]]:fields(event.snapshot))],photos:[]}))
 ],closing:[['Avslutning',row.status==='closed'?'Lukking er lagret etter ansvarligs egen kontroll. Tidligere utgaver og eventuelle gjenåpninger står i historikken.':'Saken er ikke lukket. Dette uttrekket bekrefter ingen ferdig oppfølging.'],['Deling','Nedlasting sender ikke dokumentet eller endrer valget for prosjektrapport.']]};
}

export async function loadRuhImage(blob){
 if(!blob||!imageTypes.includes(blob.type)||!blob.size||blob.size>10485760)return null;
 const url=URL.createObjectURL(blob);
 try{
  const image=new Image();await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Bilde tok for lang tid.')),10000);image.onload=()=>{clearTimeout(timer);resolve();};image.onerror=()=>{clearTimeout(timer);reject(Error('Bildet kunne ikke leses.'));};image.src=url;});
  if(!image.width||!image.height)return null;
  const canvas=document.createElement('canvas');
  for(const edge of [1200,900,600]){
   const scale=Math.min(1,edge/Math.max(image.width,image.height));canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));
   const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);
   const data=canvas.toDataURL('image/jpeg',0.85);if(reportPhoto({data}))return data;
  }return null;
 }finally{URL.revokeObjectURL(url);}
}

export async function downloadRuhPdf({expected,rpc,companyId,userId,projectId=null,downloadFile,isCurrent=()=>true,loadImage=loadRuhImage,loadLogo=loadCompanyLogo,loadPdf=()=>import('https://esm.sh/jspdf@2.5.1')}){
 if(!expected?.id||expected.company_id!==companyId||expected.category!=='ruh')throw Error('Åpne en lagret RUH før PDF.');
 const scope=async()=>{
  const response=await rpc(projectId?'kshms_project_ruh_state':'get_kshms_context',projectId?{p_company_id:companyId,p_project_id:projectId,p_status:'all',p_query:'',p_before:null,p_before_id:null}:{});
  if(!isCurrent())return false;
  const x=projectId?response?.context:response;
  if(!x?.enabled||x.company_id!==companyId||x.user_id!==userId||projectId&&x.project_id!==projectId)throw Error('Tilgangen er endret. Åpne saken på nytt.');return true;
 };
 const read=async()=>{
  let cursor=null;const events=[],seen=new Set(),cursors=new Set();let row;
  do{
   const result=await rpc('kshms_deviation_detail',{p_company_id:companyId,p_id:expected.id,p_before:cursor?.before||null,p_before_id:cursor?.id||null});if(!isCurrent())return null;
   if(result.case?.company_id!==companyId||result.case.id!==expected.id||result.case.category!=='ruh'||projectId&&result.case.project_id!==projectId||!sameRunValue(result.case,expected))throw Error('En nyere sak er lagret. Trykk «Oppdater sak» før PDF.');
   row=result.case;if(!Array.isArray(result.events))throw Error('Historikken kunne ikke bekreftes.');
   for(const event of result.events){
    if(!event.id||seen.has(event.id)||event.company_id!==companyId||event.deviation_id!==row.id||!names[event.action]||!event.snapshot||event.action!=='file'&&(event.snapshot.id!==row.id||event.snapshot.company_id!==companyId))throw Error('Historikken er ufullstendig eller gjelder en annen sak. PDF er ikke laget.');
    seen.add(event.id);events.push(event);
   }
   cursor=result.next;
   if(cursor){const key=JSON.stringify(cursor);if(!cursor.before||!cursor.id||!result.events.length||cursors.has(key)||events.length>10000)throw Error('Hele historikken kunne ikke hentes. PDF er ikke laget.');cursors.add(key);}
  }while(cursor);
  const files=await rpc('kshms_deviation_files',{p_company_id:companyId,p_id:expected.id});if(!isCurrent())return null;
  const ids=new Set();if(!Array.isArray(files))throw Error('Vedleggene kunne ikke bekreftes for denne saken.');
  for(const file of files){if(!file.id||ids.has(file.id)||file.company_id!==companyId||file.deviation_id!==row.id||!file.uploaded_at||!file.object_name?.startsWith(`${companyId}/${row.id}/`)||file.object_name.includes('..')||file.object_name.split('/').length!==3||!file.size_bytes)throw Error('Vedleggene kunne ikke bekreftes for denne saken.');ids.add(file.id);}
  return {case:row,events,files};
 };
 if(!await scope())return null;const saved=await read();if(!saved)return null;
 const profile=await rpc('work_profile_company_profile',{p_company_id:companyId});if(!isCurrent())return null;if(profile?.companyId!==companyId)throw Error('Firmaprofilen kunne ikke bekreftes.');
 const document=ruhPdfDocument(saved);
 for(const block of document.blocks)for(const photo of block.photos){
  // Authenticated Storage GET re-evaluates private file access. No signed URL
  // survives revocation or appears in the PDF.
  const blob=await downloadFile(photo.file);if(!isCurrent())return null;
  if(blob?.size!==photo.file.size_bytes||blob?.type!==photo.file.mime_type)throw Error('Et lagret bilde mangler eller er endret. PDF er ikke laget.');
  const data=await loadImage(blob);if(!isCurrent())return null;if(!reportPhoto({data}))throw Error('Et lagret bilde kunne ikke leses. PDF er ikke laget.');photo.data=data;delete photo.file;
 }
 const module=await loadPdf();if(!isCurrent())return null;const JsPDF=module.jsPDF||module.default?.jsPDF;if(!JsPDF)throw Error('PDF-motoren kunne ikke lastes.');
 const logo=profile.logoUrl?await loadLogo(profile.logoUrl):null;if(!isCurrent())return null;
 const final=await read();if(!final)return null;if(!sameRunValue(saved,final))throw Error('Historikk eller vedlegg er endret. Trykk «Oppdater sak» før PDF.');
 if(!await scope())return null;
 const doc=new JsPDF({unit:'mm',format:'a4',compress:true});appendExecutionPdf(doc,document,{newPage:false,companyName:profile.companyName,logo});
 const count=doc.internal.getNumberOfPages();for(let i=1;i<=count;i++){doc.setPage(i);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(71,85,105);doc.text(`${String(profile.companyName||'').slice(0,65)} · Expo ProffDok`,14,285);doc.text(`Side ${i} av ${count}`,196,285,{align:'right'});}
 if(!isCurrent())return null;doc.save(('RUH - '+document.title).replace(/[\\/:*?"<>|\x00-\x1f]/g,'-').slice(0,100)+'.pdf');return {logoMissing:Boolean(profile.logoUrl&&!logo)};
}
