// One renderer for download and email; accepts only a saved, server-verified record.
import {fieldsReport} from '../../../src/modules/checklist/checklistFields.mjs';
import {appendBoxedPdf} from '../../../src/modules/report/kshmsBoxedPdf.mjs';
const identity=v=>v?.name||v?.email||'Ikke oppgitt';
const time=v=>v?new Date(v).toLocaleString('nb-NO',{timeZone:'Europe/Oslo'}):'Ikke fullført';
export function standaloneChecklistDocument(record){
 if(!record?.id||!record.revision||!['draft','completed'].includes(record.status)||!Array.isArray(record.definition?.points))throw Error('Åpne en lagret sjekkliste før PDF.');
 const c=record.definition;
 return {id:record.id,type:'Utfylt sjekkliste',title:c.title,fields:[
  ['Status',record.status==='completed'?'Fullført':'UTKAST – IKKE FULLFØRT'],['Ordrenummer',record.order_number||'Ikke oppgitt'],['Fag',c.trade],
  ['Veiledning',c.instructions||''],['Lagret av',identity(record.updated_identity)],['Lagret tidspunkt',time(record.updated_at)],
  ['Kontroll-ID / revisjon',`${record.id} / ${record.revision}`],['Fast malutgave',record.version_id||'Egen sjekkliste']
 ],blocks:c.points.map((p,i)=>{const a=record.answers[p.id]||{};return {title:`${i+1}. ${p.title}`,fields:[['Veiledning',p.guidance||''],['Svar',a.status||'Ikke besvart'],['Kommentar',a.comment||''],...fieldsReport(p.fields,a.values)],photos:(a.photos||[]).map(photo=>({data:photo.data}))};}),closing:[['Fullført tidspunkt',time(record.completed_at)],['Oppfølging','Sjekklisten dokumenterer de lagrede svarene. Registrerte avvik må følges opp.']]};
}
export function createStandaloneChecklistPdf({JsPDF,record,company,logo=null,createdAt=record.updated_at,fileId=record.id}){
 const document=standaloneChecklistDocument(record),doc=new JsPDF({unit:'mm',format:'a4',compress:true});
 doc.setCreationDate(new Date(createdAt));doc.setFileId(fileId.replaceAll('-',''));
 appendBoxedPdf(doc,document,{companyName:company.companyName||'',logo});
 const pages=doc.internal.getNumberOfPages();
 for(let i=1;i<=pages;i++){doc.setPage(i);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(71,85,105);doc.text(`${String(company.companyName||'').slice(0,65)} · Expo ProffDok`,14,285);doc.text(`Side ${i} av ${pages}`,196,285,{align:'right'});}
 const fileName=(`${record.order_number?record.order_number+' - ':''}${document.title}`).replace(/[\\/:*?"<>|\x00-\x1f]/g,'-').slice(0,100)+'.pdf';
 return {doc,fileName};
}
