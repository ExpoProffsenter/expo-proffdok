import {appendBoxedPdf} from './kshmsBoxedPdf.mjs';
import {loadCompanyLogo} from './kshmsExecutionReport.mjs';
import {kshmsReportDocuments} from './kshmsProjectReport.mjs';
import {sjaContent} from '../kshms/kshmsSja.mjs';
import {sameRunValue} from '../checklist/checklistRuns.mjs';

export function sjaPdfDocument(row){
 if(!row?.id||!Number.isSafeInteger(row.revision)||row.revision<1||!['draft','signed'].includes(row.status))throw Error('Åpne en lagret SJA før PDF.');
 sjaContent(row.content);
 if(row.status==='signed'&&(!row.signed_by||row.signed_by!==row.leader_id||row.content.leader_id!==row.signed_by||row.signed_identity?.id!==row.signed_by||!Number.isFinite(Date.parse(row.signed_at))||!row.statement))throw Error('Den lagrede signaturen kunne ikke bekreftes. Åpne SJA-en på nytt.');
 const document=kshmsReportDocuments({sjas:[row]})[0];
 document.fields.splice(1,0,['Dokument-ID / lagret revisjon',`${row.id} / ${row.revision}`],['Prosjekt',row.project_name||(row.project_id?'Prosjekt-ID: '+row.project_id:'Uten prosjekt')]);
 return document;
}

export async function downloadSjaPdf({expected,rpc,companyId,userId,projectId=null,isCurrent=()=>true,loadPdf=()=>import('https://esm.sh/jspdf@2.5.1'),loadLogo=loadCompanyLogo}){
 if(!expected?.id||expected.company_id!==companyId||expected.project_id!==projectId)throw Error('Åpne den lagrede SJA-en før PDF.');
 const read=async()=>{
  const result=await rpc('kshms_sja_detail',{p_company_id:companyId,p_id:expected.id});if(!isCurrent())return null;
  const x=result?.context,row=result?.sja;
  if(!x?.enabled||x.company_id!==companyId||x.user_id!==userId||row?.id!==expected.id||row.company_id!==companyId||row.project_id!==projectId)throw Error('SJA-tilgangen er endret. Åpne analysen på nytt.');
  if(!sameRunValue(row,expected))throw Error('En nyere SJA eller annen dokumentasjon er lagret. Åpne analysen på nytt før PDF.');
  return row;
 };
 const row=await read();if(!row)return null;
 const document=sjaPdfDocument(row);
 const profile=await rpc('work_profile_company_profile',{p_company_id:companyId});if(!isCurrent())return null;
 if(profile?.companyId!==companyId)throw Error('Firmaprofilen kunne ikke bekreftes.');
 const module=await loadPdf();if(!isCurrent())return null;
 const JsPDF=module.jsPDF||module.default?.jsPDF;if(!JsPDF)throw Error('PDF-motoren kunne ikke lastes.');
 const logo=profile.logoUrl?await loadLogo(profile.logoUrl):null;if(!isCurrent())return null;
 // Check the same authorization and complete saved snapshot after slow loads.
 if(!await read())return null;
 const doc=new JsPDF({unit:'mm',format:'a4',compress:true});appendBoxedPdf(doc,document,{companyName:profile.companyName,logo});
 const count=doc.internal.getNumberOfPages();
 for(let i=1;i<=count;i++){doc.setPage(i);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(71,85,105);doc.text(`${String(profile.companyName||'').slice(0,65)} · Expo ProffDok`,14,285);doc.text(`Side ${i} av ${count}`,196,285,{align:'right'});}
 if(!isCurrent())return null;
 doc.save(('SJA - '+document.title).replace(/[\\/:*?"<>|\x00-\x1f]/g,'-').slice(0,100)+'.pdf');
 return {logoMissing:Boolean(profile.logoUrl&&!logo)};
}
