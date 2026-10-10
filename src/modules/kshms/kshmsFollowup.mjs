// Read models over the existing authorized company state. No writes or grants.
export function acknowledgmentOverview(data) {
 const versions=new Map(data.versions.map(version=>[version.id,version]));
 const members=new Map(data.members.map(member=>[member.id,member]));
 const acknowledgments=new Map(data.acknowledgments.map(row=>[`${row.user_id}:${row.version_id}`,row]));
 const groups=new Map(),seen=new Set();
 for(const assignment of data.assignments){
  const version=versions.get(assignment.version_id),key=`${assignment.user_id}:${assignment.version_id}`;
  if(!version||!(version.requires_ack||version.number===1)||seen.has(key))continue;
  seen.add(key);
  if(!groups.has(assignment.user_id))groups.set(assignment.user_id,{userId:assignment.user_id,label:members.get(assignment.user_id)?.email||assignment.user_id,entries:[],confirmed:0,missing:0});
  const group=groups.get(assignment.user_id),acknowledgment=acknowledgments.get(key)||null;
  group.entries.push({version,acknowledgment});
  group[acknowledgment?'confirmed':'missing']++;
 }
 const rows=[...groups.values()].sort((a,b)=>Number(b.missing>0)-Number(a.missing>0)||a.label.localeCompare(b.label,'nb'));
 return {groups:rows,missing:rows.reduce((total,row)=>total+row.missing,0),pendingMembers:rows.filter(row=>row.missing>0).length};
}

export function pendingAssignmentOptions(data,latest) {
 const eligible=data.members.filter(member=>member.enabled||member.workspace_role==='firmaadmin');
 const assigned=new Set(data.assignments.map(row=>`${row.user_id}:${row.version_id}`));
 return latest.map(version=>({version,members:eligible.filter(member=>!assigned.has(`${member.id}:${version.id}`))})).filter(option=>option.members.length>0);
}
