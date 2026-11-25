const types={sja:['draft','signed'],ruh:['open','in_progress','closed'],round:['draft','completed'],risk:['draft','completed']};
export function documentCountText(kind,counts){
 if(!counts)return 'Oversikt ikke hentet';
 if(!counts.total)return 'Ingen registrerte';
 if(kind==='sja')return `${counts.draft} utkast · ${counts.signed} signerte`;
 if(kind==='ruh')return `${counts.open+counts.in_progress} åpne · ${counts.closed} lukkede`;
 return `${counts.draft} under arbeid · ${counts.completed} fullførte`;
}
export async function readProjectDocumentOverview({rpc,companyId,userId,projectId,isCurrent=()=>true}){
 const base={p_company_id:companyId,p_project_id:projectId};
 const responses=await Promise.all([
  rpc('kshms_project_report',{...base,p_sja_ids:null,p_ruh_ids:null}),
  rpc('kshms_project_execution_report',{...base,p_round_ids:null,p_risk_ids:null})
 ]);
 if(!isCurrent())return null;
 const result={};
 for(const [i,pairs] of [[0,[['sja','sjas'],['ruh','ruhs']]],[1,[['round','rounds'],['risk','risks']]]]){
  const response=responses[i],x=response?.context;
  if(!x?.enabled||x.company_id!==companyId||x.user_id!==userId||x.project_id!==projectId)throw Object.assign(Error('Tilgangen til prosjektoversikten er endret.'),{code:'42501'});
  for(const [kind,key] of pairs){
   const rows=response.choices?.[key];
   if(!Array.isArray(rows)||rows.some(row=>!row?.id||!types[kind].includes(row.status))||new Set(rows.map(r=>r.id)).size!==rows.length)throw Error('Dokumentoversikten kunne ikke bekreftes.');
   const counts=Object.fromEntries(types[kind].map(status=>[status,0]));
   for(const row of rows)counts[row.status]++;
   result[kind]={...counts,total:rows.length};
  }
 }
 return result;
}
