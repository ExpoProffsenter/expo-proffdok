// Only ordinary company handbook text is cached. Individual HR data/files are out of scope.
export const draftKey = (userId,companyId) => `expo:kshms:draft:v1:${userId}:${companyId}`;
export function readDraft(storage,userId,companyId) {
 try { const value=JSON.parse(storage.getItem(draftKey(userId,companyId)) || 'null');
  return value?.schema===1 && value.userId===userId && value.companyId===companyId && value.draft && typeof value.draft.title==='string' ? value : null;
 } catch { return null; }
}
export function persistDraft(storage,userId,companyId,editor) {
 storage.setItem(draftKey(userId,companyId),JSON.stringify({schema:1,userId,companyId,...editor,savedLocallyAt:new Date().toISOString()}));
}

// Compare content, not save timestamps/revisions. JSONB does not preserve object
// key order; array order is meaningful (for example the source reference list).
const ordered=value=>Array.isArray(value)?value.map(ordered):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,ordered(value[key])])):value;
export const sameRoutineContent=(left,right)=>JSON.stringify(ordered(left))===JSON.stringify(ordered(right));
export function routineApprovalState(routine,versions) {
 const current=versions.filter(version=>version.routine_id===routine.id).reduce((latest,version)=>!latest||version.number>latest.number?version:latest,null);
 const status=routine.archived?'archived':!current?'draft':routine.draft&&!sameRoutineContent(routine.draft,current.content)?'changed':'approved';
 return {status,current,label:status==='archived'?'Arkivert':status==='draft'?'Utkast – må godkjennes':status==='changed'?`Endringer må godkjennes · v${current.number} gjelder fortsatt`:`Godkjent v${current.number}`};
}
export function handbookProgress(data) {
 const active=data.routines.filter(routine=>!routine.archived);
 const waiting=active.filter(routine=>routineApprovalState(routine,data.versions).status!=='approved');
 const responsible=data.members.find(member=>member.id===data.settings?.responsible_user_id&&(member.workspace_role==='firmaadmin'||member.enabled&&member.role==='responsible'));
 return {total:active.length,approved:active.length-waiting.length,waiting,step:!responsible?'setup':!active.length?'selection':waiting.length?'approval':'followup'};
}
