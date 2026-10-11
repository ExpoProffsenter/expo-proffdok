import {appendExecutionPdf} from '../report/kshmsExecutionReport.mjs';
import {CONVERSATION_STAGES} from './hrConversationSession.mjs';
const date=v=>v?v.split('-').reverse().join('.'):'Ikke avtalt';
export function conversationPdfDocument(value){
 const c=value?.conversation;if(!c?.template?.questions||!Number.isInteger(c.revision))throw Error('Åpne en lagret samtale først.');
 const employee=value.employee.email||'Medarbeider',leader=value.leader_email||'Nærmeste leder';
 return {id:c.id,type:'MEDARBEIDERSAMTALE',title:c.template.title,
  fields:[['Medarbeider',employee],['Nærmeste leder',leader],['Samtaledato',date(c.on)],
   ...(c.type==='sickleave'?[]:[['Klokkeslett',c.meeting_time?c.meeting_time+' (norsk tid)':'Ikke avtalt']]),
   ['Status',CONVERSATION_STAGES[c.stage]||'Utkast'],['Lagret utgave',String(c.revision)],['Malutgave',String(c.template_revision)]],
  blocks:[...c.template.questions.map(q=>({title:q.topic,fields:[['Spørsmål',q.prompt],
   [q.phase==='preparation'?'Medarbeiderens forberedelse':'Felles møtereferat',
    (q.phase==='preparation'?c.preparation:c.meeting)[q.id]||(!c.shared&&q.phase==='preparation'?'Forberedelsen er ikke delt':'Ikke utfylt')]],photos:[]})),
   {title:'Oppfølging og egne kommentarer',fields:[['Neste oppfølging',date(c.next_on)],['Medarbeiderens kommentar',c.comments.employee||'Ingen'],['Lederens kommentar',c.comments.leader||'Ingen']],photos:[]},
   ...c.actions.map((a,i)=>({title:`Tiltak ${i+1}`,fields:[['Oppgave',a.task],['Ansvarlig',a.owner_id===value.employee.user_id?employee:leader],['Frist',date(a.due_on)],['Status',a.done?'Utført':'Åpent']],photos:[]}))],
  closing:[...['employee','leader'].map(side=>[side==='employee'?'Medarbeiderens bekreftelse':'Lederens bekreftelse',
   c.confirmations[side]?`Bekreftet ${new Date(c.confirmations[side].at).toLocaleString('nb-NO',{timeZone:'Europe/Oslo'})}`:'Ikke bekreftet']),
   ['Bekreftelse','Bekreftelse betyr at referatet er lest. Egne kommentarer og eventuell uenighet følger referatet.']]};
}
export async function downloadConversationPdf({value,companyName,isCurrent=()=>true,loadPdf=()=>import('https://esm.sh/jspdf@2.5.1'),save}){
 const document=conversationPdfDocument(value);if(!isCurrent())return null;
 const module=await loadPdf();if(!isCurrent())return null;
 const JsPDF=module.jsPDF||module.default?.jsPDF;if(!JsPDF)throw Error('PDF-motoren kunne ikke lastes.');
 const doc=new JsPDF({unit:'mm',format:'a4',compress:true});appendExecutionPdf(doc,document,{newPage:false,companyName});
 const pages=doc.internal.getNumberOfPages();for(let i=1;i<=pages;i++){
  doc.setPage(i);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(71,85,105);
  doc.text('Fortrolig medarbeidersamtale',14,285);doc.text(`Side ${i} av ${pages}`,196,285,{align:'right'});
 }
 if(!isCurrent())return null;if(save)await save(doc);else doc.save('Medarbeidersamtale.pdf');return {pages};
}
