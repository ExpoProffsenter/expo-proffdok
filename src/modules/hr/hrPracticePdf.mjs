import {PRACTICE_QUESTIONS,validatePracticeConversation} from './hrPracticeConversation.mjs';
import {appendExecutionPdf} from '../report/kshmsExecutionReport.mjs';
const date=value=>value?value.split('-').reverse().join('.'):'Ikke avtalt';
export function practicePdfDocument(version){
 const c=validatePracticeConversation(version?.content);
 if(!Number.isSafeInteger(version.number)||version.number<1||!Number.isFinite(Date.parse(version.at)))throw Error('Lagre prøvesamtalen før PDF.');
 return {id:'practice',type:'PRØVESAMTALE - EKSEMPELINNHOLD',title:c.title,
  fields:[['Status',c.stage==='completed'?'Prøvereferat fullført':'UTKAST - prøvesamtale'],
   ['Medarbeider (test)',c.employee],['Leder (test)',c.leader],['Samtaledato',date(c.on)],
   ['Lagret utgave',String(version.number)],['Lagring','Bare denne nettleseren. Ingen samtale er sendt til en ansatt.']],
  blocks:[...PRACTICE_QUESTIONS.map((q,i)=>({title:q.title,fields:[['Medarbeiderens forberedelse',c.answers[i].employee||'Ikke utfylt'],['Felles møtereferat',c.answers[i].meeting||'Ikke utfylt']],photos:[]})),
   {title:'Oppsummering og neste møte',fields:[['Oppsummering',c.summary||'Ikke utfylt'],['Neste oppfølging',date(c.nextOn)]],photos:[]},
   ...c.actions.map((a,i)=>({title:`Tiltak ${i+1}`,fields:[['Oppgave',a.task],['Ansvarlig',a.owner],['Frist',date(a.dueOn)],['Status',a.done?'Utført':'Åpent']],photos:[]}))],
  closing:[['Prøveinnhold','Dette er en prøve av arbeidsflyten. Dokumentet er ikke en signert medarbeidersamtale eller en bekreftelse fra en annen person.']]};
}
export async function downloadPracticePdf({version,companyName,isCurrent=()=>true,loadPdf=()=>import('https://esm.sh/jspdf@2.5.1'),save}){
 const document=practicePdfDocument(version);if(!isCurrent())return null;
 const module=await loadPdf();if(!isCurrent())return null;
 const JsPDF=module.jsPDF||module.default?.jsPDF;if(!JsPDF)throw Error('PDF-motoren kunne ikke lastes.');
 const doc=new JsPDF({unit:'mm',format:'a4',compress:true});
 appendExecutionPdf(doc,document,{newPage:false,companyName:companyName||'Prøvefirma'});
 const pages=doc.internal.getNumberOfPages();for(let i=1;i<=pages;i++){
  doc.setPage(i);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(71,85,105);
  doc.text('PRØVESAMTALE - EKSEMPELINNHOLD',14,285);doc.text(`Side ${i} av ${pages}`,196,285,{align:'right'});
 }
 if(!isCurrent())return null;
 if(save)await save(doc);else doc.save('Proevesamtale-referat.pdf');
 return {pages};
}
