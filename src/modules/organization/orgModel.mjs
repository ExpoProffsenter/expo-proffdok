export const ORG_KINDS={leader:'Leder',middle:'Mellomleder',employee:'Ansatt',apprentice:'Lærling'};
export const ORG_COLORS={teal:['#e2f4ee','#096457'],blue:['#e8f1ff','#285998'],amber:['#fff3d8','#805719'],violet:['#f0eaff','#6b46a0'],rose:['#fcebef','#9a4057']};
export function orgFingerprint(data){return JSON.stringify([data.context,data.revision,data.units,data.people,data.members]);}
export function orgBranches(data) {
 const units=new Map(data.units.map(unit=>[unit.id,{...unit,children:[],people:[]}]));
 if(units.size!==data.units.length)throw Error('Kartet har dupliserte avdelinger.');
 const roots=[];
 for(const unit of units.values()){
  let parent=unit,seen=new Set([unit.id]);
  while(parent.parent_id){
   if(seen.has(parent.parent_id)||seen.size>=12)throw Error('Avdelingsstrukturen må kontrolleres.');
   seen.add(parent.parent_id);parent=units.get(parent.parent_id);
   if(!parent)throw Error('En overordnet avdeling mangler. Hent kartet på nytt.');
  }
  if(unit.parent_id)units.get(unit.parent_id).children.push(unit);else roots.push(unit);
 }
 const people=new Set(),users=new Set(),unplaced=[];
 for(const person of data.people){
  if(people.has(person.id)||users.has(person.user_id)||!ORG_KINDS[person.kind])throw Error('Medarbeiderlisten må kontrolleres.');
  people.add(person.id);users.add(person.user_id);
  if(person.unit_id){if(!units.has(person.unit_id))throw Error('Medarbeiderens avdeling mangler.');units.get(person.unit_id).people.push(person);}
  else unplaced.push(person);
 }
 const sort=nodes=>{nodes.sort((a,b)=>a.name.localeCompare(b.name,'nb'));for(const node of nodes)sort(node.children);};sort(roots);
 return {roots,units,unplaced};
}
export function orgPersonRows(people) {
 const byUser=new Map(people.map(p=>[p.user_id,p])),children=new Map(),result=[],seen=new Set();
 const sorted=[...people].sort((a,b)=>a.name.localeCompare(b.name,'nb'));
 for(const person of sorted){const parent=byUser.has(person.leader_id)?person.leader_id:null;
  if(!children.has(parent))children.set(parent,[]);children.get(parent).push(person);}
 const visit=(person,depth)=>{if(seen.has(person.id))return;seen.add(person.id);result.push({...person,depth});
  for(const child of children.get(person.user_id)||[])visit(child,Math.min(depth+1,12));};
 for(const person of children.get(null)||[])visit(person,0);
 // Older register data may contain a loop: show every row, never silently lose a person.
 for(const person of sorted)if(!seen.has(person.id))visit(person,0);
 return result;
}
export function createOrgSession({rpc,companyId,userId,onClear=()=>{}}) {
 let generation=0,disposed=false;
 const invalidate=()=>{generation++;onClear();};
 const read=async()=>{
  const ticket=generation;if(disposed)throw Error('Kartøkten er avsluttet.');
  try {
   const value=await rpc('organization_state',{p_company_id:companyId});
   if(disposed||ticket!==generation)throw Error('Kartforespørselen er utløpt.');
   if(value?.context?.company_id!==companyId||value.context.user_id!==userId
    ||!Number.isInteger(value.revision)||!Array.isArray(value.units)||!Array.isArray(value.people)||!Array.isArray(value.members)
    ||value.units.length>100||value.people.length>500||value.members.length>500)throw Error('Kartets tilgang eller omfang er endret.');
   orgBranches(value);return value;
  }catch(error){if(!disposed&&ticket===generation)invalidate();throw error;}
 };
 return {read,invalidate,dispose(){disposed=true;invalidate();},
  async command(expected,action,payload){
   const ticket=generation;try {const fresh=await read();
   if(orgFingerprint(fresh)!==orgFingerprint(expected)){invalidate();throw Error('Kartet eller medarbeiderne er endret. Hent på nytt før lagring.');}
   const result=await rpc('organization_command',{p_company_id:companyId,p_revision:fresh.revision,p_action:action,p_payload:payload});
   if(disposed||ticket!==generation)throw Error('Kartforespørselen er utløpt.');
   if(result?.context?.company_id!==companyId||result.context.user_id!==userId){invalidate();throw Error('Arbeidsprofilen er endret.');}
   return await read();
   }catch(error){if(!disposed&&ticket===generation)invalidate();throw error;}
  }
 };
}
