import {checklistContent,sameChecklistContent} from '../kshms/kshmsChecklists.mjs';
export const proposalDraftKey=(user,company,record)=>`expo:checklist-proposal:v1:${user}:${company}:${record}`;
export const proposalReviewKey=(user,company)=>`expo:checklist-proposal-review:v1:${user}:${company}`;
export function proposalContext(state,company,user){if(state?.context?.company_id!==company||state.context.user_id!==user||!state.context.enabled)throw Error('Tilgangen til firmaets malforslag er endret. Forsøket er beholdt.');return state;}
export async function submitChecklistProposal({rpc,companyId,userId,job,isCurrent=()=>true}){
 const content=checklistContent(job.definition);
 const saved=await rpc('checklist_template_proposal_submit',{p_company_id:companyId,p_request_id:job.requestId,p_definition:content});if(!isCurrent())return null;proposalContext(saved,companyId,userId);
 const read=await rpc('checklist_template_proposal_state',{p_company_id:companyId,p_id:job.requestId});if(!isCurrent())return null;proposalContext(read,companyId,userId);
 if(read.record?.id!==job.requestId||saved.record?.id!==job.requestId||read.record.submitted_by!==userId||read.record.company_id!==companyId||!sameChecklistContent(read.record.definition,content))throw Error('Forslaget kunne ikke bekreftes. Prøv samme forslag igjen.');
 return read.record;
}
export async function reviewChecklistProposal({rpc,companyId,userId,job,isCurrent=()=>true}){
 const result=await rpc('checklist_template_proposal_review',{p_company_id:companyId,p_id:job.id,p_revision:job.revision,p_request_id:job.requestId,p_decision:job.decision,p_note:job.note});if(!isCurrent())return null;proposalContext(result,companyId,userId);
 const read=await rpc('checklist_template_proposal_state',{p_company_id:companyId,p_id:job.id});if(!isCurrent())return null;proposalContext(read,companyId,userId);
 const r=read.record,expected=job.decision==='approve'?'approved':'rejected';
 if(r?.id!==job.id||r.company_id!==companyId||r.status!==expected||r.reviewed_by!==userId||r.review_request_id!==job.requestId||r.decision_note!==job.note.trim()||!sameChecklistContent(r.definition,job.definition))throw Error('Behandlingen kunne ikke bekreftes. Prøv samme behandling igjen.');
 if(expected==='approved'&&(result.version?.id!==r.version_id||result.version.template_id!==r.template_id||result.version.company_id!==companyId||result.version.published_by!==userId||!sameChecklistContent(result.version.content,job.definition)))throw Error('Den publiserte firmamalen kunne ikke bekreftes. Samme forsøk er beholdt.');
 return r;
}
