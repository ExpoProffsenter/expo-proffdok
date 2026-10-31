import {checklistContent} from '../kshms/kshmsChecklists.mjs';
import {fieldProblem,verifyFieldReadback} from './checklistFields.mjs';
import {sameRunValue} from './checklistRuns.mjs';
import {signatureInput,signatureProblem,verifySignatureReadback} from './checklistSignatures.mjs';
export const standaloneDraftKey=(user,company)=>`expo:standalone-checklist:v1:${user}:${company}`;
export const standaloneMailKey=(user,company,id)=>`expo:standalone-checklist-mail:v1:${user}:${company}:${id}`;
export function readStandaloneDraft(storage,user,company){
 try{const row=JSON.parse(storage.getItem(standaloneDraftKey(user,company)));return row?.id&&row.requestId&&Array.isArray(row.definition?.points)&&row.answers?row:null;}catch{return null;}
}
export function checkStandaloneScope(state,company,user){
 if(state?.context?.company_id!==company||state.context.user_id!==user||!state.context.enabled)throw Error('Firmatilgangen er endret. Kladden er beholdt.');return state;
}
export function standaloneDetailsProblem(draft){
 if(!draft?.order_number?.trim())return 'Fyll inn ordrenummer.';
 if(!draft?.work_site?.trim())return 'Fyll inn arbeidssted/adresse.';
 return '';
}
export function standaloneProblem(draft){
 for(const p of draft.definition.points){const a=draft.answers[p.id]||{};
  if(!a.status)return `Svar på «${p.title}».`;
  if(a.status==='Ikke aktuelt'){if(p.allow_na===false)return `«${p.title}» må vurderes.`;continue;}
  const missing=fieldProblem(p.fields,a.values);if(missing)return `Fyll ut «${missing.label}» i «${p.title}».`;
  if((p.comment_required||a.status==='Avvik')&&!a.comment?.trim())return `Skriv kommentar til «${p.title}».`;
  if(p.image_required&&!a.photos?.length)return `Legg til bilde på «${p.title}».`;
 }return '';
}
export async function saveStandaloneChecklist({rpc,companyId,userId,draft,action,isCurrent=()=>true}){
 const legacyRetry=Boolean(draft.pendingAction)&&draft.signatureContract!=='execution-v1';
 if(action==='complete'&&!legacyRetry){const missing=signatureProblem(draft.signatures,userId);if(missing)throw Object.assign(Error(missing),{code:'22023'});}
 const detailsProblem=standaloneDetailsProblem(draft);if(detailsProblem)throw Object.assign(Error(detailsProblem),{code:'22023'});
 const definition=draft.version_id?draft.definition:checklistContent(draft.definition);
 const payload={id:draft.id,revision:draft.revision,version_id:draft.version_id||null,definition,order_number:draft.order_number.trim(),work_site:(draft.work_site||'').trim(),external_project:(draft.external_project||'').trim(),customer_name:(draft.customer_name||'').trim(),answers:draft.answers};
 if(!legacyRetry)payload.signatures=signatureInput(draft.signatures);
 const result=await rpc(legacyRetry?'standalone_checklist_command':'standalone_checklist_signed_command',{p_company_id:companyId,p_action:action,p_request_id:draft.requestId,p_payload:payload});
 if(!isCurrent())return null;checkStandaloneScope(result,companyId,userId);
 const read=await rpc('standalone_checklist_workspace',{p_company_id:companyId,p_id:draft.id});
 if(!isCurrent())return null;checkStandaloneScope(read,companyId,userId);const row=read.record;
 if(row?.id!==draft.id||row.company_id!==companyId||row.created_by!==userId||row.revision!==result.record?.revision||row.status!==(action==='complete'?'completed':'draft')||['order_number','work_site','external_project','customer_name'].some(k=>row[k]!==payload[k])||!sameRunValue(row.definition,definition)||!sameRunValue(row.answers,result.record.answers))throw Error('Lagringen kunne ikke bekreftes. Kladden er beholdt. Prøv samme lagring igjen.');
 for(const p of definition.points){const a=draft.answers[p.id]||{},b=row.answers[p.id]||{};
  if((a.status||'')!==b.status||(a.comment||'')!==b.comment||!sameRunValue(a.photos||[],b.photos||[]))throw Error('Svarene kunne ikke bekreftes lagret. Kladden er beholdt.');
  verifyFieldReadback(p.fields||[],a.values||{},b.values||{},userId);
 }
 if(!legacyRetry)verifySignatureReadback(row.signatures,payload.signatures,{recordId:row.id,revision:row.revision,userId});
 return read;
}
