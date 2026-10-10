import {appendExecutionPdf,loadCompanyLogo} from './kshmsExecutionReport.mjs';
import {routineNumber} from '../kshms/kshmsJobChoices.mjs';
import {identityText} from '../kshms/kshmsPersonal.mjs';
import {sameRunValue,answersForDefinition} from '../checklist/checklistRuns.mjs';
import {formatDeviationDate,formatDeviationDateTime} from '../deviations/deviationDates.mjs';

const when=value=>formatDeviationDateTime(value)||'Ikke oppgitt';
const sourceTypes={law:'Lov eller forskrift',professional:'Fag, veiledning eller kontrakt',company:'Firmaets egne regler',product:'ProffDoks valg'};
const isDocument=file=>/\.(pdf|docx?|xlsx?|txt|csv|zip)(?:[?#]|$)/i.test(file.name||file.url||'')||Boolean(file.type&&!file.type.startsWith('image/'));
const requirements=point=>[point.documentation_either?'Bilde eller kommentar':point.image_required?'Bilde påkrevd':'',!point.documentation_either&&point.comment_required?'Kommentar påkrevd':''].filter(Boolean).join(' · ')||'Ingen særskilte bilde-/kommentarkrav';
const sourceIdentity=(snapshot,fallback)=>`${identityText(snapshot,fallback)}${snapshot?.source==='current_account'?' (kontooppslag; historisk navn er ikke lagret)':''}`;

// Only immutable editions or an exact saved control are accepted. No editor
// suggestions, staff assignments or another person's acknowledgments enter PDF.
export function routinePdfDocument(version,routine){
 if(!version?.id||!version.content_hash||!version.number||routine?.id!==version.routine_id)throw Error('Rutineutgaven kunne ikke bekreftes.');
 const c=version.content;
 return {id:version.id,type:'Godkjent firmarutine',title:c.title,fields:[
  ['Rutine / utgave',`${routineNumber(routine.reference_number)||routine.id} · versjon ${version.number}`],
  ['Status',routine.archived?'UTGÅTT RUTINE - HISTORISK UTGAVE':'Godkjent utgave. Kontroller i appen hvilken utgave som gjelder før bruk.'],
  ['Kapittel',c.chapter],['Godkjent for firmaet av',sourceIdentity(version.publisher_identity,version.published_by)],['Godkjent tidspunkt',when(version.published_at)],['Endringsvurdering',version.change_summary],
  ['Dokument-ID / innholdskontroll',`${version.id} / ${version.content_hash}`]
 ],blocks:[['Mål','goal'],['Ansvar','responsibility'],['I vår bedrift har vi følgende rutine','procedure'],['Dokumentasjon','documentation'],['Gjennomgang','confirmation']].map(([title,key])=>({title,fields:[['Rutinetekst',c[key]]],photos:[]})).concat((c.references||[]).map((ref,i)=>({title:`Kilde ${i+1}: ${ref.title||'Uten navn'}`,fields:[['Lenke',ref.url],['Kildetype',sourceTypes[ref.kind]||ref.kind],['Kilden kontrollert',formatDeviationDate(ref.checked_on)||'Ikke oppgitt']],photos:[]}))),closing:[['Egen gjennomgang','PDF-en registrerer ingen ansattbekreftelse. Les og bekreft tildelte utgaver i appen før arbeid.']]};
}
export function checklistTemplatePdfDocument(version,template){
 if(!version?.id||!version.content_hash||!version.number||template?.id!==version.template_id)throw Error('Sjekklisteutgaven kunne ikke bekreftes.');
 const c=version.content;
 const dependencyText=(c.dependencies||[]).map(row=>`${row.title} · v${row.number} · ${row.version_id} / ${row.content_hash}`).join('\n');
 return {id:version.id,type:'Publisert sjekklistemal',title:c.title,fields:[['Status',template.archived?'ARKIVERT MAL - HISTORISK UTGAVE':'TOM MAL - IKKE UTFØRT KONTROLL'],['Fag',c.trade],['Versjon',version.number],['Når brukes sjekklisten?',c.instructions],...(dependencyText?[['Versjonsfaste underskjema',dependencyText]]:[]),['Publisert av',identityText(version.published_identity,version.published_by)],['Publisert tidspunkt',when(version.published_at)],['Dokument-ID / innholdskontroll',`${version.id} / ${version.content_hash}`]],blocks:c.points.map((point,i)=>({title:`Sjekkpunkt ${i+1}: ${point.title}`,fields:[['Veiledning',point.guidance],['Dokumentasjonskrav',requirements(point)],['Svar','Ikke utfylt - mal']],photos:[]})),closing:[['Gjennomføring','Hent listen i prosjektet og lagre svar der. En mal er ingen bekreftelse på utført arbeid.']]};
}
export function checklistRunPdfDocument(run){
 if(!run?.id||!run.revision||!['draft','completed'].includes(run.status)||!Array.isArray(run.definition?.items))throw Error('Den lagrede kontrollen kunne ikke bekreftes.');
 const completed=run.status==='completed',definition=run.definition;
 return {id:run.id,type:'Prosjektets sjekklistekontroll',title:definition.category.replace(/^KS\/HMS sjekkliste – /,''),fields:[['Status',completed?'Fullført':'UNDER ARBEID - IKKE FULLFØRT'],['Prosjekt-ID',run.project_id],['Kontroll-ID / lagret revisjon',`${run.id} / ${run.revision}`],['Kontrollnummer',run.sequence],['Fast malutgave-ID',definition.source_version_id||'Prosjektets egne / ordinære sjekkpunkter'],['Veiledning',definition.instructions],['Sist lagret av',identityText(run.updated_identity,run.updated_by)],['Sist lagret tidspunkt',when(run.updated_at)]],blocks:definition.items.map((item,i)=>{
  const a=run.answers?.[item]||{};
  return {title:`Sjekkpunkt ${i+1}: ${item}`,fields:[['Veiledning',definition.requirements?.[item]?.guidance],['Dokumentasjonskrav',requirements(definition.requirements?.[item]||{})],['Lagret svar',a.status||'Ikke besvart'],['Kommentar',a.comment],...(a.ks_deviation_id?[['Koblet KS/HMS-avvik-ID',a.ks_deviation_id]]:[]),...(['Avvik','Lukket avvik'].includes(a.status)?[['Avviksoppfølging','Dette er kontrollens lagrede svar. Se Avvik/RUH for gjeldende status; fullført kontroll lukker ikke avvik.']]:[]),...(a.photos||[]).filter(isDocument).map(file=>['Dokumentvedlegg',`${file.name||'Uten filnavn'} - filen følger ikke denne PDF-en. Åpne originalen i prosjektet.`])],photos:(a.photos||[]).filter(file=>!isDocument(file)).map(file=>({file}))};
 }),closing:completed?[['Fullført av - lagret identitet',identityText(run.completed_identity,run.completed_by)],['Fullført tidspunkt',when(run.completed_at)],['Fullføring','Punktenes svar ble lagret ved fullføring. Åpne avvik følges opp separat.']]:[['Fullføring','Ikke fullført. Utkastet dokumenterer ikke bekreftet gjennomføring.']]};
}

function savedRow(kind,state,expected,{companyId,userId,projectId}){
 const x=state?.context;
 if(x?.company_id!==companyId||x.user_id!==userId||(kind==='run'?x.project_id!==projectId:!x.enabled))throw Error('Tilgangen til dokumentet er endret. Åpne det på nytt.');
 const row=(kind==='run'?state.runs:state.versions)?.find(value=>value.id===expected.id);
 if(!row||row.company_id!==companyId)throw Error('Utgaven er ikke tilgjengelig i dette firmaet. Åpne dokumentet på nytt.');
 if(kind==='run'){
  if(row.project_id!==projectId||row.revision!==expected.revision||row.status!==expected.status||!sameRunValue(row.definition,expected.definition)||!sameRunValue(answersForDefinition(row.definition,row.answers),answersForDefinition(expected.definition,expected.answers)))throw Error('Kontrollen har ulagrede endringer eller en nyere lagret utgave. Lagre eller åpne den lagrede kontrollen på nytt før PDF.');
 }else if(row.content_hash!==expected.content_hash||row.number!==expected.number||!sameRunValue(row.content,expected.content)||(kind==='routine'?row.routine_id!==expected.routine_id:row.template_id!==expected.template_id))throw Error('Rutine- eller sjekklisteutgaven er endret. Åpne den på nytt.');
 if(kind==='routine'&&!x.manage&&!state.assignments?.some(a=>a.user_id===userId&&a.version_id===row.id&&a.company_id===companyId))throw Error('Denne rutineutgaven er ikke tildelt deg.');
 if(kind==='template'&&!x.manage)throw Error('Du har ikke tilgang til sjekklistesentralen.');
 return row;
}

export async function downloadDocumentPdf({kind,expected,rpc,companyId,userId,projectId=null,isCurrent=()=>true,resolveFileUrl=file=>file.url,loadPdf=()=>import('https://esm.sh/jspdf@2.5.1'),loadImage=loadCompanyLogo}){
 if(!['routine','template','run'].includes(kind))throw Error('Ukjent dokumenttype.');
 const endpoint={routine:'kshms_get_state',template:'kshms_checklist_state',run:'project_checklist_state'}[kind];
 const args={p_company_id:companyId,...(kind==='run'?{p_project_id:projectId}:{})};
 const read=async()=>{const state=await rpc(endpoint,args);if(!isCurrent())return null;savedRow(kind,state,expected,{companyId,userId,projectId});return state;};
 const state=await read();if(!state)return null;
 const row=savedRow(kind,state,expected,{companyId,userId,projectId});
 const profile=await rpc('work_profile_company_profile',{p_company_id:companyId});if(!isCurrent())return null;
 if(profile?.companyId!==companyId)throw Error('Firmaprofilen kunne ikke bekreftes.');
 const document=kind==='routine'?routinePdfDocument(row,state.routines?.find(r=>r.id===row.routine_id)):kind==='template'?checklistTemplatePdfDocument(row,state.templates?.find(t=>t.id===row.template_id)):checklistRunPdfDocument(row);
 // Source URLs (including short-lived tokens) never enter exported text/links.
 for(const block of document.blocks)for(const photo of block.photos){
  const url=resolveFileUrl(photo.file);if(!url)throw Error('Et lagret bilde mangler filadresse. PDF er ikke laget.');
  const data=await loadImage(url);if(!isCurrent())return null;
  if(!data)throw Error('Et lagret bilde kunne ikke hentes. PDF er ikke laget. Prøv igjen når bildet er tilgjengelig.');
  photo.data=data;delete photo.file;
 }
 const module=await loadPdf();if(!isCurrent())return null;
 const JsPDF=module.jsPDF||module.default?.jsPDF;if(!JsPDF)throw Error('PDF-motoren kunne ikke lastes.');
 const logo=profile.logoUrl?await loadImage(profile.logoUrl):null;if(!isCurrent())return null;
 // Recheck authorization and the exact snapshot after potentially slow loads.
 const finalState=await read();if(!finalState)return null;
 if(kind==='routine')document.fields[1][1]=routinePdfDocument(row,finalState.routines.find(r=>r.id===row.routine_id)).fields[1][1];
 if(kind==='template')document.fields[0][1]=checklistTemplatePdfDocument(row,finalState.templates.find(t=>t.id===row.template_id)).fields[0][1];
 const doc=new JsPDF({unit:'mm',format:'a4',compress:true});appendExecutionPdf(doc,document,{newPage:false,companyName:profile.companyName,logo});
 const pages=doc.internal.getNumberOfPages();for(let i=1;i<=pages;i++){doc.setPage(i);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(71,85,105);doc.text(`${String(profile.companyName||'').slice(0,65)} · Expo ProffDok`,14,285);doc.text(`Side ${i} av ${pages}`,196,285,{align:'right'});}
 if(!isCurrent())return null;
 doc.save((document.type+' - '+document.title).replace(/[\\/:*?"<>|\x00-\x1f]/g,'-').slice(0,100)+'.pdf');
 return {logoMissing:Boolean(profile.logoUrl&&!logo)};
}
