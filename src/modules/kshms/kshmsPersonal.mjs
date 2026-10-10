import { matchesRoutineSearch } from './kshmsSearch.mjs';

// The personal view is always derived from this user's exact assignments.
// A manager's broader response must not become their personal handbook.
export function personalHandbook(data,userId,query='') {
 const assigned=new Set(data.assignments.filter(row=>row.user_id===userId).map(row=>row.version_id));
 const acknowledgments=new Map(data.acknowledgments.filter(row=>row.user_id===userId).map(row=>[row.version_id,row]));
 const routines=new Map(data.routines.map(row=>[row.id,row]));
 const grouped=new Map();
 for(const version of data.versions){
  if(!assigned.has(version.id)||version.company_id&&version.company_id!==data.context.company_id)continue;
  if(!grouped.has(version.routine_id))grouped.set(version.routine_id,{routineId:version.routine_id,archived:!!routines.get(version.routine_id)?.archived,editions:[]});
  const group=grouped.get(version.routine_id);
  if(!group.editions.some(row=>row.version.id===version.id))group.editions.push({version,acknowledgment:acknowledgments.get(version.id)||null});
 }
 const all=[...grouped.values()].map(group=>({...group,editions:group.editions.sort((a,b)=>b.version.number-a.version.number)})).sort((a,b)=>Number(a.archived)-Number(b.archived)||a.editions[0].version.content.title.localeCompare(b.editions[0].version.content.title,'nb'));
 return {all,visible:all.filter(group=>group.editions.some(row=>matchesRoutineSearch(row.version.content,query)))};
}

export function identityText(identity,fallback='Ukjent brukerkonto') {
 if(!identity)return fallback;
 return identity.name&&identity.name!==identity.email?`${identity.name}${identity.email?` (${identity.email})`:''}`:identity.email||identity.name||identity.id||fallback;
}
