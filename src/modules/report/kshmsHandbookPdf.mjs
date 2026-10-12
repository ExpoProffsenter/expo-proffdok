import {personalHandbook,identityText} from '../kshms/kshmsPersonal.mjs';
import {routineNumber} from '../kshms/kshmsJobChoices.mjs';
import {acknowledgmentTime} from '../kshms/kshmsAcknowledgmentTime.mjs';
import {routinePdfDocument} from './kshmsDocumentPdf.mjs';
import {appendExecutionPdf,loadCompanyLogo} from './kshmsExecutionReport.mjs';

// A manager exports their own assignments too. No draft or other user's receipt
// enters this projection. All assigned history is retained in a marked appendix.
export function handbookSnapshot(state,companyId,userId){
 const x=state?.context;
 if(!x?.enabled||x.company_id!==companyId||x.user_id!==userId)throw Error('Tilgangen til personalhåndboka er endret. Åpne den på nytt.');
 const groups=personalHandbook(state,userId).all;
 const entries=groups.flatMap(group=>group.editions.map((row,i)=>({
  ...row,routine:state.routines.find(r=>r.id===group.routineId),historical:group.archived||i>0
 }))).sort((a,b)=>Number(a.historical)-Number(b.historical)||String(a.version.content.chapter).localeCompare(String(b.version.content.chapter),'nb')||a.version.content.title.localeCompare(b.version.content.title,'nb')||b.version.number-a.version.number);
 if(!entries.length)throw Error('Du har ikke fått noen rutiner ennå.');
 for(const row of entries){
  if(row.routine?.company_id!==companyId||row.version.company_id!==companyId)throw Error('En rutineutgave kunne ikke bekreftes i dette firmaet.');
  routinePdfDocument(row.version,row.routine);
 }
 return entries.map(({version,routine,acknowledgment,historical})=>({version:structuredClone(version),routine:{id:routine.id,company_id:routine.company_id,reference_number:routine.reference_number,archived:!!routine.archived},acknowledgment:acknowledgment?structuredClone(acknowledgment):null,historical}));
}

function handbookRoutine(entry,userId){
 const document=routinePdfDocument(entry.version,entry.routine),ack=entry.acknowledgment;
 if(entry.historical)document.fields[1][1]='HISTORIKK - TIDLIGERE ELLER UTGÅTT TILDELT UTGAVE. Kontroller gjeldende rutine i appen.';
 document.closing=[['Din egen gjennomgang',ack?.user_id===userId&&ack.version_id===entry.version.id?`Bekreftet av ${identityText(ack.user_identity,userId)} - ${acknowledgmentTime(ack.acknowledged_at)}`:'Ikke bekreftet'],...(ack?[['Lagret bekreftelsestekst',ack.statement]]:[]),['Lesebekreftelse','Nedlasting registrerer ingen ny bekreftelse. Les og bekreft i appen.']];
 return document;
}

export function renderHandbookPdf(JsPDF,entries,{companyName,logo,userId,exportedAt}){
 const render=(pageNumbers=[])=>{
  const doc=new JsPDF({unit:'mm',format:'a4',compress:true});
  const current=entries.filter(e=>!e.historical),history=entries.filter(e=>e.historical);
  appendExecutionPdf(doc,{type:'Personalhåndbok',title:companyName,fields:[['Hentet fra appen',acknowledgmentTime(exportedAt)],['Omfang',`${current.length} gjeldende tildelte rutiner. ${history.length} tidligere eller utgåtte utgaver i historikk.`],['Bruk av håndboka','Inneholder alle rutinene som er tildelt deg, uavhengig av søk. Firmaets godkjente tekster, kilder og egne lesebekreftelser følger med. Kontroller appen for oppdateringer.']],blocks:[{title:'Innholdsfortegnelse',fields:entries.map((e,i)=>[`${e.historical?'Historikk: ':''}${routineNumber(e.routine.reference_number)||''} ${e.version.content.title}`,`${e.version.content.chapter} - versjon ${e.version.number} - side ${pageNumbers[i]||0}`]),photos:[]}],closing:[]},{companyName,logo,newPage:false});
  const starts=[];
  for(const entry of entries){starts.push(doc.internal.getNumberOfPages()+1);appendExecutionPdf(doc,handbookRoutine(entry,userId),{companyName,logo,newPage:true});}
  return {doc,starts};
 };
 // The preliminary pass measures the shared boxed layout for real TOC pages.
 const measured=render(),result=render(measured.starts);
 if(JSON.stringify(measured.starts)!==JSON.stringify(result.starts))throw Error('Innholdsfortegnelsen kunne ikke pagineres. Prøv på nytt.');
 const pages=result.doc.internal.getNumberOfPages();
 for(let i=1;i<=pages;i++){result.doc.setPage(i);result.doc.setFont('helvetica','normal');result.doc.setFontSize(8);result.doc.setTextColor(71,85,105);result.doc.text(`${String(companyName).slice(0,65)} · Expo ProffDok`,14,285);result.doc.text(`Side ${i} av ${pages}`,196,285,{align:'right'});}
 return result.doc;
}

export async function downloadHandbookPdf({rpc,companyId,userId,isCurrent=()=>true,loadPdf=()=>import('https://esm.sh/jspdf@2.5.1'),loadLogo=loadCompanyLogo,now=()=>new Date().toISOString()}){
 const read=async()=>{const state=await rpc('kshms_get_state',{p_company_id:companyId});if(!isCurrent())return null;return handbookSnapshot(state,companyId,userId);};
 const entries=await read();if(!entries)return null;
 const profile=await rpc('work_profile_company_profile',{p_company_id:companyId});if(!isCurrent())return null;
 if(profile?.companyId!==companyId||!profile.companyName)throw Error('Firmaprofilen kunne ikke bekreftes.');
 const module=await loadPdf();if(!isCurrent())return null;
 const JsPDF=module.jsPDF||module.default?.jsPDF;if(!JsPDF)throw Error('PDF-motoren kunne ikke lastes.');
 const logo=profile.logoUrl?await loadLogo(profile.logoUrl):null;if(!isCurrent())return null;
 if(profile.logoUrl&&!logo)throw Error('Firmaets logo kunne ikke hentes. Prøv nedlastingen på nytt.');
 const latest=await read();if(!latest)return null;
 if(JSON.stringify(entries)!==JSON.stringify(latest))throw Error('Personalhåndboka er oppdatert under nedlastingen. Prøv på nytt for å få riktig utgave.');
 const doc=renderHandbookPdf(JsPDF,latest,{companyName:profile.companyName,logo,userId,exportedAt:now()});
 if(!isCurrent())return null;
 doc.save(`Personalhandbok - ${profile.companyName}`.replace(/[\\/:*?"<>|\x00-\x1f]/g,'-').slice(0,100)+'.pdf');
 return {logoMissing:!profile.logoUrl,routines:latest.filter(e=>!e.historical).length};
}
