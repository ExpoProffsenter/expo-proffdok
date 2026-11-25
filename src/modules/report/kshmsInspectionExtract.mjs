import {readLegacyProjectRows,legacyProjectDocument} from './kshmsLegacyProjectExtract.mjs';
import {sameRunValue} from '../checklist/checklistRuns.mjs';
import {routinePdfDocument,checklistTemplatePdfDocument,checklistRunPdfDocument} from './kshmsDocumentPdf.mjs';
import {sjaPdfDocument} from './kshmsSjaPdf.mjs';
import {readRuhPdfSnapshot,ruhPdfDocument,readDeviationPdfSnapshot,deviationPdfDocument,loadRuhImage} from './kshmsRuhPdf.mjs';
import {executionReportDocument,loadCompanyLogo,reportPhoto} from './kshmsExecutionReport.mjs';
import {appendBoxedPdf} from './kshmsBoxedPdf.mjs';
import {formatDeviationDateTime,formatDeviationDate} from '../deviations/deviationDates.mjs';
import {routineNumber} from '../kshms/kshmsJobChoices.mjs';

export const EXTRACT_GROUPS={routines:'Godkjente rutineutgaver',templates:'Publiserte sjekklistemaler',reviews:'Signerte håndbokrevisjoner',sjas:'SJA',ruhs:'RUH med historikk og bilder',deviations:'Kvalitets- og HMS-avvik med historikk og bilder',rounds:'Vernerunder / kontroller',risks:'Risikovurderinger 5×5',runs:'Lagrede prosjektkontroller',legacy:'Eldre ukoblede prosjektavvik'};
export const extractKey=row=>`${row.kind}:${row.id}`;
const when=value=>formatDeviationDateTime(value)||'Ikke oppgitt';
const changed=()=>Error('Et valgt dokument er endret eller ikke lenger tilgjengelig. Oppdater listen og velg på nytt.');
const checkContext=(value,companyId,userId)=>{
 if(!value?.enabled||!value.manage||value.company_id!==companyId||value.user_id!==userId)throw Error('Uttrekk krever firmaadmin eller KS/HMS-ansvarlig i det valgte firmaet. Tilgangen er endret.');
};
const unique=rows=>{if(!Array.isArray(rows)||rows.some(row=>!row?.id)||new Set(rows.map(row=>row.id)).size!==rows.length)throw Error('Dokumentlisten kunne ikke bekreftes.');return rows;};
const choice=(kind,row,title)=>({kind,id:row.id,title:title||row.title||row.content?.title||'Uten navn',revision:row.revision,number:row.number,hash:row.content_hash,status:row.status,projectId:row.project_id||null,...(kind==='deviations'?{category:row.category}:{})});

export async function loadExtractPage({kind,rpc,companyId,userId,query='',cursor=null,isCurrent=()=>true}){
 const args={p_company_id:companyId,p_status:'all',p_query:query},execution=['rounds','risks'].includes(kind);
 const name=kind==='sjas'?'kshms_sja_state':['ruhs','deviations'].includes(kind)?'kshms_deviation_state':'kshms_execution_state';
 if(!['sjas','ruhs','deviations','rounds','risks'].includes(kind))throw Error('Ukjent dokumentgruppe.');
 if(kind!=='sjas'){args.p_before=cursor?.before||cursor?.updated_at||null;args.p_before_id=cursor?.id||null;}
 if(execution)args.p_kind=kind==='rounds'?'round':'risk';
 const result=await rpc(name,args);if(!isCurrent())return null;checkContext(result?.context,companyId,userId);
 const rows=unique(result[kind==='sjas'?'items':['ruhs','deviations'].includes(kind)?'cases':'records']);
 if(result.next&&(!rows.length||!result.next.id||!(result.next.before||result.next.updated_at)||sameRunValue(cursor,result.next)))throw Error('Neste side kunne ikke bekreftes. Oppdater listen.');
 return {rows:rows.filter(row=>kind==='ruhs'?row.category==='ruh':kind==='deviations'?['quality','hms'].includes(row.category):true).map(row=>choice(kind,row)),next:result.next||null,total:result.total??null};
}

export async function loadExtractChoices({rpc,companyId,userId,query='',isCurrent=()=>true}){
 const kinds=['sjas','ruhs','deviations','rounds','risks'];
 const results=await Promise.all([
  rpc('kshms_get_state',{p_company_id:companyId}),rpc('kshms_checklist_state',{p_company_id:companyId}),rpc('kshms_job_choices',{p_company_id:companyId}),
  ...kinds.map(kind=>loadExtractPage({kind,rpc,companyId,userId,query,isCurrent}))
 ]);if(!isCurrent())return null;
 const [handbook,central,jobs,...pages]=results;for(const state of [handbook,central,jobs])checkContext(state?.context,companyId,userId);
 const routines=unique(handbook.routines),templates=unique(central.templates);
 const fixed=(rows,kind,parent)=>unique(rows).map(row=>{if(row.company_id!==companyId)throw changed();const entry=parent?.find(r=>r.id===row[kind==='routines'?'routine_id':'template_id']);if(parent&&!entry)throw changed();return choice(kind,row,kind==='routines'?`${routineNumber(entry.reference_number)} · ${row.content.title} · v${row.number}`:kind==='templates'?`${row.content.title} · v${row.number}`:`Revisjon ${when(row.signed_at)}`);});
 return {query,groups:{routines:{rows:fixed(handbook.versions,'routines',routines)},templates:{rows:fixed(central.versions,'templates',templates)},reviews:{rows:fixed(handbook.reviews,'reviews')},...Object.fromEntries(kinds.map((kind,i)=>[kind,pages[i]])),runs:{rows:[]},legacy:{rows:[]}},projects:unique(jobs.projects),projectTotal:jobs.project_total};
}

export async function loadExtractRuns({rpc,companyId,userId,projectId,isCurrent=()=>true}){
 const result=await rpc('project_checklist_state',{p_company_id:companyId,p_project_id:projectId});if(!isCurrent())return null;
 const x=result?.context;if(x?.company_id!==companyId||x.user_id!==userId||x.project_id!==projectId)throw changed();
 return unique(result.runs).map(row=>{if(row.company_id!==companyId||row.project_id!==projectId)throw changed();return choice('runs',row,`${row.definition.category} · kontroll ${row.sequence}`);});
}

export async function loadExtractProjectDeviations(options){
 const rows=await readLegacyProjectRows(options);if(!rows)return null;return rows.map(row=>({...choice('legacy',row,row.content.title||'Prosjektavvik uten tittel'),hash:row.content_hash}));
}

function reviewDocument(row){
 if(!row.signed_by||!Number.isFinite(Date.parse(row.signed_at))||!row.statement||!Array.isArray(row.version_snapshot))throw changed();
 return {id:row.id,type:'Signert håndbokrevisjon',title:when(row.signed_at),fields:[['Dokument-ID',row.id],['Signert av - lagret bruker-ID',row.signed_by],['Identitet','Historisk navn er ikke lagret på denne revisjonen. Bruker-ID vises uten nytt kontooppslag.'],['Signert tidspunkt',when(row.signed_at)],['Funn',row.findings],['Videre oppfølging',row.follow_up],['Neste revisjon',formatDeviationDate(row.next_review_on)]],blocks:row.version_snapshot.map((v,i)=>({title:`Kontrollert rutineutgave ${i+1}`,fields:[['Utgave-ID',v.id],['Lagret innholdskontroll',v.hash]],photos:[]})),closing:[['Lagret bekreftelse',row.statement],['Rutinetekst','Referansene dokumenterer hva som ble gjennomgått. Rutinetekst tas bare med når den utgaven er valgt separat.']]};
}

export function validateInspectionSelection(selection){
 if(!Array.isArray(selection)||!selection.length||selection.length>50||new Set(selection.map(extractKey)).size!==selection.length||selection.some(v=>!EXTRACT_GROUPS[v.kind]||!v.id||v.kind==='deviations'&&!['quality','hms'].includes(v.category)))throw Error('Velg mellom 1 og 50 dokumenter.');
}
export async function checkInspectionContext({rpc,companyId,userId,isCurrent=()=>true}){
 const x=await rpc('get_kshms_context');if(!isCurrent())return false;checkContext(x,companyId,userId);return true;
}
export async function readInspectionSnapshots({selection,rpc,readProject,companyId,userId,isCurrent=()=>true}){
 validateInspectionSelection(selection);
  const cache=new Map();const state=name=>{if(!cache.has(name))cache.set(name,rpc(name,{p_company_id:companyId}));return cache.get(name);};
  const saved=[];
  for(const expected of selection){
   if(!isCurrent())return null;const kind=expected.kind;let bundle;
   if(kind==='legacy'){
    const key='legacy:'+expected.projectId;if(!cache.has(key))cache.set(key,readLegacyProjectRows({rpc,readProject,companyId,userId,projectId:expected.projectId,isCurrent}));
    const rows=await cache.get(key);if(!rows||!isCurrent())return null;const row=rows.find(r=>r.id===expected.id);if(!row||row.content_hash!==expected.hash||row.status!==expected.status)throw changed();bundle={kind,row};
   }else if(['routines','reviews','templates'].includes(kind)){
    const result=await state(kind==='templates'?'kshms_checklist_state':'kshms_get_state');if(!isCurrent())return null;checkContext(result?.context,companyId,userId);
    const row=unique(result[kind==='reviews'?'reviews':'versions']).find(v=>v.id===expected.id);if(!row||row.company_id!==companyId)throw changed();
    if(kind==='reviews')bundle={kind,row};
    else{const parent=unique(result[kind==='routines'?'routines':'templates']).find(v=>v.id===row[kind==='routines'?'routine_id':'template_id']);if(!parent||parent.company_id!==companyId||row.number!==expected.number||row.content_hash!==expected.hash)throw changed();bundle={kind,row,parent:{id:parent.id,reference_number:parent.reference_number,archived:parent.archived}};}
   }else if(['ruhs','deviations'].includes(kind)){
    const detail=await rpc('kshms_deviation_detail',{p_company_id:companyId,p_id:expected.id,p_before:null,p_before_id:null});if(!isCurrent())return null;
    if(detail.case?.id!==expected.id||detail.case.company_id!==companyId||detail.case.category!==(kind==='ruhs'?'ruh':expected.category)||detail.case.revision!==expected.revision||detail.case.status!==expected.status)throw changed();
    const snapshot=await (kind==='ruhs'?readRuhPdfSnapshot:readDeviationPdfSnapshot)({expected:detail.case,rpc,companyId,isCurrent});if(!snapshot)return null;bundle={kind,row:snapshot.case,snapshot};
   }else{
    const runs=kind==='runs';const result=await rpc(runs?'project_checklist_state':kind==='sjas'?'kshms_sja_detail':'kshms_execution_detail',{p_company_id:companyId,...(runs?{p_project_id:expected.projectId}:{p_id:expected.id})});if(!isCurrent())return null;
    if(runs){const x=result?.context;if(x?.company_id!==companyId||x.user_id!==userId||x.project_id!==expected.projectId)throw changed();}
    else checkContext(result?.context,companyId,userId);
    const row=runs?unique(result.runs).find(v=>v.id===expected.id):result[kind==='sjas'?'sja':'record'];
    if(!row||row.id!==expected.id||row.company_id!==companyId||row.revision!==expected.revision||row.status!==expected.status||runs&&row.project_id!==expected.projectId||['rounds','risks'].includes(kind)&&row.kind!==(kind==='rounds'?'round':'risk'))throw changed();bundle={kind,row};
   }
   saved.push(bundle);
  }return saved;
}

// All selected rows are read twice. Slow image/PDF loads cannot turn a mixed
// revision or a revoked permission into a partial or apparently complete file.
export async function downloadInspectionExtract({selection,scopeText,rpc,companyId,userId,readProject,downloadProject,downloadFile,resolveFileUrl=file=>file.url,isCurrent=()=>true,loadImage=loadCompanyLogo,loadPrivateImage=loadRuhImage,loadPdf=()=>import('https://esm.sh/jspdf@2.5.1')}){
 if(!Array.isArray(selection)||!selection.length||selection.length>50||new Set(selection.map(extractKey)).size!==selection.length||selection.some(v=>!EXTRACT_GROUPS[v.kind]||!v.id)||!scopeText?.trim()||scopeText.length>2000)throw Error('Beskriv omfanget og velg mellom 1 og 50 dokumenter.');
 const check=async()=>{const x=await rpc('get_kshms_context');if(!isCurrent())return false;checkContext(x,companyId,userId);return true;};
 const read=()=>readInspectionSnapshots({selection,rpc,readProject,companyId,userId,isCurrent});
 if(!await check())return null;const saved=await read();if(!saved)return null;
 const profile=await rpc('work_profile_company_profile',{p_company_id:companyId});if(!isCurrent())return null;if(profile?.companyId!==companyId)throw Error('Firmaprofilen kunne ikke bekreftes.');
 const documents=saved.map(({kind,row,parent,snapshot})=>kind==='routines'?routinePdfDocument(row,parent):kind==='templates'?checklistTemplatePdfDocument(row,parent):kind==='reviews'?reviewDocument(row):kind==='sjas'?sjaPdfDocument(row):kind==='ruhs'?ruhPdfDocument(snapshot):kind==='deviations'?deviationPdfDocument(snapshot):kind==='runs'?checklistRunPdfDocument(row):kind==='legacy'?legacyProjectDocument(row):executionReportDocument(row));
 for(const [index,document] of documents.entries())for(const block of document.blocks||[])for(const photo of block.photos||[]){
  if(!photo.file)continue;const file=photo.file;let data;
  if(['ruhs','deviations'].includes(saved[index].kind)){
   const blob=await downloadFile(file);if(!isCurrent())return null;if(blob?.size!==file.size_bytes||blob?.type!==file.mime_type)throw Error('Et valgt avviksbilde mangler eller er endret. Uttrekket er ikke laget.');
   data=await loadPrivateImage(blob);
  }else if(saved[index].kind==='legacy'){
   const blob=await downloadProject(file);if(!isCurrent())return null;
   if(!blob?.size||blob.size>10485760||file.size&&blob.size!==file.size||blob.type!==file.type)throw Error('Et prosjektavviksbilde mangler eller er endret. Uttrekket er ikke laget.');data=await loadPrivateImage(blob);
  }else{const url=resolveFileUrl(file);if(!url)throw Error('Et valgt kontrollbilde mangler. Uttrekket er ikke laget.');data=await loadImage(url);}
  if(!isCurrent())return null;if(!reportPhoto({data}))throw Error('Et valgt bilde kunne ikke hentes. Uttrekket er ikke laget.');photo.data=data;delete photo.file;
 }
 const engine=await loadPdf();if(!isCurrent())return null;const JsPDF=engine.jsPDF||engine.default?.jsPDF;if(!JsPDF)throw Error('PDF-motoren kunne ikke lastes.');
 const logo=profile.logoUrl?await loadImage(profile.logoUrl):null;if(!isCurrent())return null;
 const final=await read();if(!final)return null;if(!sameRunValue(saved,final))throw changed();if(!await check())return null;
 const extractedAt=new Date().toISOString(),extractId=crypto.randomUUID();
 const doc=new JsPDF({unit:'mm',format:'a4',compress:true}),options={companyName:profile.companyName,logo};
 appendBoxedPdf(doc,{type:'Valgt KS/HMS-uttrekk',title:scopeText.trim(),fields:[['Uttrekks-ID',extractId],['Firma-ID',companyId],['Laget tidspunkt',when(extractedAt)],['Omfang',scopeText.trim()],['Antall valgte dokumenter',documents.length],['Les dette først','Dette er et avgrenset uttrekk av lagret dokumentasjon. Utkast, åpne saker og forventet risiko er merket. Uttrekket er ingen tilsynsgodkjenning.'],['Avgrensning','HR, fortrolige varslinger, ansattes lesebekreftelser og opplæringsbevis tas ikke med. Separate originalfiler er listet, men følger ikke PDF-en. Ikke-valgte dokumenter tas ikke med.'],['Dokumentoversikt','Manifestet på slutten viser dokument-ID, utgave/revisjon, innholdskontroll og sider. Kontroller innhold og mottaker før deling.']],blocks:[],closing:[]},options);
 const manifest=[];
 documents.forEach((document,i)=>{
  const start=doc.internal.getNumberOfPages()+1;appendBoxedPdf(doc,document,{...options,newPage:true});
  const {kind,row}=saved[i];manifest.push({title:`${i+1}. ${document.type}: ${document.title}`,fields:[['Dokument-ID',row.id],['Dokumentgruppe',EXTRACT_GROUPS[kind]],['Utgave / lagret revisjon',row.number??row.revision??(kind==='legacy'?'Lagret prosjektinnhold - uten versjonsnummer':'Signert revisjonssnapshot')],['Lagret innholdskontroll',row.content_hash||'Dokument-ID og revisjon / signert snapshot'],['Status',document.fields.find(([key])=>key==='Status')?.[1]||'Signert håndbokrevisjon'],['Prosjekt-ID',row.project_id||'Uten prosjekt'],['Sider i dette uttrekket',`${start}-${doc.internal.getNumberOfPages()}`]],photos:[]});
 });
 appendBoxedPdf(doc,{type:'Manifest - valgte dokumenter',title:scopeText.trim(),fields:[['Uttrekks-ID',extractId],['Firma-ID',companyId],['Laget tidspunkt',when(extractedAt)]],blocks:manifest,closing:[['Deling','Ingen e-post, portalpublisering eller lagring av saker er utført. Originalfiler må hentes separat før eventuell utlevering.']]},{...options,newPage:true});
 const count=doc.internal.getNumberOfPages();for(let i=1;i<=count;i++){doc.setPage(i);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(71,85,105);doc.text(`${String(profile.companyName||'').slice(0,65)} · Expo ProffDok`,14,285);doc.text(`Side ${i} av ${count}`,196,285,{align:'right'});}
 if(!isCurrent())return null;doc.save(('KS-HMS uttrekk - '+scopeText.trim()).replace(/[\\/:*?"<>|\x00-\x1f]/g,'-').slice(0,100)+'.pdf');
 return {logoMissing:Boolean(profile.logoUrl&&!logo),documents:documents.length,pages:count,extractId};
}
