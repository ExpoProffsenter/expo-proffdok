export const checklistRunDraftKey = (userId,companyId,projectId,category) =>
 `expo:checklist-run:v1:${userId}:${companyId||'local'}:${projectId||'new'}:${category}`;
export function readRunDraft(storage,key) {
 try {const value=JSON.parse(storage.getItem(key));return value?.id&&value.definition?.category&&value.answers&&value.requestId?value:null;} catch {return null;}
}
export function sameRunValue(a,b) {
 const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])])):value;
 return JSON.stringify(stable(a))===JSON.stringify(stable(b));
}
export function runDefinition(group,instances=[],warrantyPoint=false) {
 const source=instances.find(row=>row.category===group.category);
 return {...group,items:[...group.items],requirements:Object.fromEntries(group.items.map(item=>[item,{...group.requirements?.[item],...(warrantyPoint?{documentation_either:true}:{})}])),...(source?{source_version_id:source.version_id}:{})};
}
export function answersForDefinition(definition,answers={},fresh=false) {
 return Object.fromEntries(definition.items.map(item=>{
  const value=answers?.[item]||{};
  return [item,fresh&&!value.ks_deviation_id&&value.status!=='Avvik'?{}:{...value,photos:[...(value.photos||[])]}];
 }));
}
export function currentRunAnswers(run,checklist={}) {
 return Object.fromEntries(run.definition.items.map(item=>{
  const saved=run.answers[item]||{},current=checklist?.[run.category]?.[item];
  return [item,run.status==='draft'&&current?.ks_deviation_id?{...saved,...Object.fromEntries(['ks_deviation_id','status','closedAt','closedBy','closeComment'].filter(key=>key in current).map(key=>[key,current[key]]))}:saved];
 }));
}
export function completionProblem(definition,answers) {
 for(const item of definition.items){
  const answer=answers[item]||{},required=definition.requirements?.[item]||{};
  if(!answer.status)return `Vurder punktet «${item}» før du fullfører.`;
  if(answer.status==='Ikke aktuelt')continue;
  const photo=(answer.photos||[]).some(value=>String(value.url||'').trim()),comment=String(answer.comment||'').trim();
  if(required.documentation_either&&!photo&&!comment)return `Legg til bilde eller kommentar på «${item}».`;
  if(!required.documentation_either&&required.image_required&&!photo)return `Legg til bilde på «${item}».`;
  if(!required.documentation_either&&required.comment_required&&!comment)return `Legg til kommentar på «${item}».`;
 }
 return '';
}
export async function commitChecklistRun({companyId,projectId,userId,draft,action,rpc,isCurrent=()=>true}) {
 const payload={id:draft.id,revision:draft.revision,predecessor_id:draft.predecessor_id||null,definition:draft.definition,answers:draft.answers};
 const result=await rpc('project_checklist_command',{p_company_id:companyId,p_project_id:projectId,p_action:action,p_request_id:draft.requestId,p_payload:payload});
 if(!isCurrent())return null;
 const state=await rpc('project_checklist_state',{p_company_id:companyId,p_project_id:projectId});
 if(!isCurrent())return null;
 const row=state.runs?.find(value=>value.id===draft.id);
 const expected=action==='complete'?'completed':'draft';
 if(result.context?.company_id!==companyId||result.context.project_id!==projectId||result.context.user_id!==userId
  ||state.context?.company_id!==companyId||state.context.project_id!==projectId||state.context.user_id!==userId
  ||row?.company_id!==companyId||row.project_id!==projectId||row.revision!==result.run?.revision||row.status!==expected
  ||!sameRunValue(row.definition,draft.definition)||!sameRunValue(row.answers,result.run.answers))
  throw new Error('Lagringen kunne ikke bekreftes. Kladden er beholdt. Prøv samme lagring igjen.');
 return {state,run:row,answers:result.answers};
}
