import {sameRunValue} from '../checklist/checklistRuns.mjs';
import {isExecutionChecklist,signatureProblem} from '../checklist/checklistSignatures.mjs';
import {checklistRunPdfDocument} from './kshmsDocumentPdf.mjs';
import {loadCompanyLogo} from './kshmsExecutionReport.mjs';

const changed=()=>Error('En valgt prosjektkontroll eller tilgangen er endret. Åpne rapportvalget på nytt.');
const imageData=value=>typeof value==='string'&&value.length<=12000000&&/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(value);

export function checkCompletedProjectRun(row,{companyId,projectId}){
 if(!row?.id||row.company_id!==companyId||row.project_id!==projectId||row.status!=='completed'||!Number.isSafeInteger(row.revision)||row.revision<1||!row.definition?.category||!Array.isArray(row.definition.items)||!row.definition.items.length||row.definition.items.some(item=>typeof item!=='string'||!item.trim())||!Number.isFinite(Date.parse(row.completed_at)))throw changed();
 const s=row.signatures;
 if(s?.own?.image){
  if(!imageData(s.own.image)||!row.completed_by||s.record_id!==row.id||s.revision!==row.revision||!s.basis_hash||s.own.user_id!==row.completed_by||!Number.isFinite(Date.parse(s.own.signed_at))||signatureProblem(s,row.completed_by)||s.external?.image&&!imageData(s.external.image))throw changed();
 }else if(isExecutionChecklist(row.definition)&&(s?.basis_hash||s?.external?.image))throw changed();
 // Legacy completions keep their explicit missing-ink status in the existing
 // mapper. They are never backfilled or presented as a new signature.
 return row;
}

export async function readProjectReportRuns({rpc,companyId,userId,projectId,ids=null,expected=null,isCurrent=()=>true}){
 const state=await rpc('project_checklist_state',{p_company_id:companyId,p_project_id:projectId});
 if(!isCurrent())return null;
 const x=state?.context;
 if(x?.company_id!==companyId||x.user_id!==userId||x.project_id!==projectId||!Array.isArray(state.runs)||state.runs.some(row=>!row?.id)||new Set(state.runs.map(row=>row.id)).size!==state.runs.length)throw changed();
 if(state.runs.some(row=>row.company_id!==companyId||row.project_id!==projectId))throw changed();
 if(ids!==null&&(!Array.isArray(ids)||new Set(ids).size!==ids.length))throw changed();
 const rows=state.runs.filter(row=>row.status==='completed');
 const selected=ids===null?rows:ids.map(id=>rows.find(row=>row.id===id));
 selected.forEach(row=>checkCompletedProjectRun(row,{companyId,projectId}));
 const snapshot=JSON.parse(JSON.stringify(selected));
 if(expected&&!sameRunValue(snapshot,expected))throw changed();
 return snapshot;
}

export async function prepareProjectControlDocuments(runs,{resolveFileUrl=file=>file.url,loadImage=loadCompanyLogo,isCurrent=()=>true}={}){
 const documents=[];
 for(const row of runs){
  if(!isCurrent())return null;
  const document=checklistRunPdfDocument(row);
  for(const block of document.blocks)for(const photo of block.photos||[]){
   if(photo.data){if(!imageData(photo.data))throw changed();continue;}
   const url=resolveFileUrl(photo.file);
   if(!url)throw Error('Et valgt kontrollbilde mangler filadresse. Rapporten ble ikke laget.');
   const data=await loadImage(url);
   if(!isCurrent())return null;
   if(!imageData(data))throw Error('Et valgt kontrollbilde kunne ikke hentes. Rapporten ble ikke laget. Prøv igjen når bildet er tilgjengelig.');
   photo.data=data;delete photo.file;
  }
  documents.push(document);
 }
 return documents;
}
