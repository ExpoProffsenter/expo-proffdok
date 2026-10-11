import {appendExecutionPdf} from '../report/kshmsExecutionReport.mjs';
import {conversationPdfDocument} from './hrConversationPdf.mjs';
import {sickLeaveMilestones} from './hrSickLeave.mjs';
const date=v=>v?v.split('-').reverse().join('.'):'Ikke registrert';
const statuses={open:'Gjenstår',review:'Behov skal vurderes',done:'Håndtert',exempt:'Unntak dokumentert'};
export function sickLeavePdfDocument(value){
 const c=value?.conversation;if(c?.type!=='sickleave'||!c.milestones||!c.sharing)throw Error('Åpne en lagret oppfølging først.');
 const document=conversationPdfDocument(value);
 return {...document,type:'OPPFØLGINGSPLAN',fields:[
  ...document.fields.filter(([k])=>k!=='Samtaledato'),['Første fraværsdag',date(c.on)],
  ['Fraværstype',c.absence_mode==='partial'?'Gradert fravær':'Fullt fravær'],
  ['Oppfølging',c.case_status==='closed'?'Avsluttet '+date(c.returned_on):'Aktiv'],
  ...(c.correction_reason?[['Begrunnelse for rettet startdato',c.correction_reason]]:[])],
 blocks:[...document.blocks,...sickLeaveMilestones(c.on,c.absence_mode).map(row=>({title:row.title,fields:[
  ['Beregnet frist',date(row.date)],['Ansvar',row.owner],['Veiledning',row.instruction],
  ['Dokumentert oppfølging',statuses[c.milestones[row.id].status]],['Dato',date(c.milestones[row.id].on)],
  ['Kort dokumentasjon',c.milestones[row.id].note||'Ikke registrert']],photos:[]})),
  ...['sykmelder','nav'].map(target=>({title:target==='nav'?'Faktisk deling med NAV':'Faktisk deling med sykmelder',fields:c.sharing[target].length?c.sharing[target].map((item,i)=>[
   'Deling '+(i+1),`Utgave ${item.version} · ${date(item.on)} · ${item.channel==='nav_portal'?'NAVs løsning':item.channel==='paper'?'Papir':'Annen avtalt kanal'}`]):[['Deling','Ingen deling registrert']],photos:[]}))],
 closing:[...document.closing,['Om deling','Dette dokumentet er ikke automatisk sendt til NAV eller sykmelder. Bruk riktig kanal og registrer faktisk deling i appen.'],
 ['Om frister','Datoene viser frister fra første fraværsdag. Registreringen dokumenterer partenes oppfølging. NAV avgjør aktivitet og egne møter.']]};
}
export async function downloadSickLeavePdf({value,companyName,isCurrent=()=>true,loadPdf=()=>import('https://esm.sh/jspdf@2.5.1'),save}){
 const document=sickLeavePdfDocument(value);if(!isCurrent())return null;
 const module=await loadPdf();if(!isCurrent())return null;
 const JsPDF=module.jsPDF||module.default?.jsPDF;if(!JsPDF)throw Error('PDF-motoren kunne ikke lastes.');
 const doc=new JsPDF({unit:'mm',format:'a4',compress:true});appendExecutionPdf(doc,document,{newPage:false,companyName});
 const pages=doc.internal.getNumberOfPages();for(let i=1;i<=pages;i++){
  doc.setPage(i);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(71,85,105);
  doc.text('Fortrolig oppfølgingsplan',14,285);doc.text(`Side ${i} av ${pages}`,196,285,{align:'right'});
 }
 if(!isCurrent())return null;if(save)await save(doc);else doc.save('Oppfolgingsplan.pdf');return {pages};
}
