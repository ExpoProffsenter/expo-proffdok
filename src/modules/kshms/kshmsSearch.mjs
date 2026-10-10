const normalize=text=>String(text||'').toLocaleLowerCase('nb-NO').normalize('NFKD').replace(/\p{M}/gu,'').replaceAll('ø','o');
export function matchesRoutineSearch(content,query='') {
 const words=normalize(query).split(/\s+/).filter(Boolean);
 if(!words.length)return true;
 const text=normalize(['title','chapter','goal','responsibility','procedure','documentation','confirmation'].map(field=>content?.[field]||'').join(' '));
 return words.every(word=>text.includes(word));
}

// Search only the current state already authorized by the server. For readers,
// explicitly use their assigned published versions, never a manager's draft.
export function filterFirmRoutines(data,query) {
 const assigned=new Set(data.assignments.filter(row=>row.user_id===data.context.user_id).map(row=>row.version_id));
 const byRoutine=new Map();
 for(const version of data.versions)if(data.context.manage||assigned.has(version.id)){
  const versions=byRoutine.get(version.routine_id)||[];versions.push(version);byRoutine.set(version.routine_id,versions);
 }
 return data.routines.filter(routine=>{
  const versions=byRoutine.get(routine.id)||[];
  if(!data.context.manage)return versions.some(version=>matchesRoutineSearch(version.content,query));
  const current=versions.reduce((latest,version)=>!latest||version.number>latest.number?version:latest,null);
  return matchesRoutineSearch(routine.draft||current?.content,query)||Boolean(current&&matchesRoutineSearch(current.content,query));
 });
}
