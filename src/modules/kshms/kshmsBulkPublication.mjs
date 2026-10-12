import {routineApprovalState,sameRoutineContent} from './kshmsDraft.mjs';
import {ACK_STATEMENT} from './kshmsCatalog.mjs';
export const COMPANY_APPROVAL_STATEMENT='Jeg har gjennomgått alle de oppførte rutineutkastene og vurdert at innholdet er tilpasset firmaets arbeid, risikoer og ansvarsfordeling. Jeg godkjenner at disse utkastene publiseres som firmaets rutiner.';
export const companyPublicationSummary=assessment=>`${assessment.trim()}\n\n${COMPANY_APPROVAL_STATEMENT}`;
export const publicationScope=(data,companyId,userId)=>data?.context?.enabled===true&&data.context.manage===true&&data.context.publish===true&&data.context.company_id===companyId&&data.context.user_id===userId;
export function pendingCompanyPublications(data,companyId,userId){
 if(!publicationScope(data,companyId,userId))return[];
 return data.routines.filter(row=>!row.archived).flatMap(row=>{
  const status=routineApprovalState(row,data.versions);
  return status.status==='approved'?[]:[{...row,next_number:(status.current?.number||0)+1,previous_version_id:status.current?.id||null}];
 }).sort((a,b)=>a.draft.title.localeCompare(b.draft.title,'nb-NO')||a.id.localeCompare(b.id));
}
export const publicationListKey=rows=>JSON.stringify(rows.map(row=>[row.id,row.revision,row.next_number,row.previous_version_id]).sort((a,b)=>a[0].localeCompare(b[0])));
export function publicationSnapshotCurrent(snapshot,data,companyId,userId){
 const current=new Map(pendingCompanyPublications(data,companyId,userId).map(row=>[row.id,row]));
 return snapshot.length>0&&snapshot.every(row=>{const saved=current.get(row.id);return saved&&publicationListKey([saved])===publicationListKey([row])&&sameRoutineContent(saved.draft,row.draft);});
}
export function verifiedCompanyPublications({data,companyId,userId,snapshot,assessment,requiresAck,selfAcknowledgment}){
 if(!publicationScope(data,companyId,userId))return null;
 const versions=snapshot.map(row=>data.versions.find(version=>version.routine_id===row.id&&version.number===row.next_number));
 if(!versions.every((version,index)=>version&&version.published_by===userId&&version.publisher_identity?.id===userId&&Number.isFinite(new Date(version.published_at).getTime())&&version.change_summary===companyPublicationSummary(assessment)&&version.requires_ack===(snapshot[index].next_number===1||requiresAck)&&sameRoutineContent(version.content,snapshot[index].draft)))return null;
 if(selfAcknowledgment&&!versions.every(version=>data.acknowledgments.some(row=>row.version_id===version.id&&row.user_id===userId&&row.statement===ACK_STATEMENT&&Number.isFinite(new Date(row.acknowledged_at).getTime()))))return null;
 return versions;
}
