export const validResidentEmail=email=>typeof email==='string'&&email.length<=254&&/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(email);
export function batchRecipients(units){
 const recipients=[],missing=[];
 for(const unit of units){const seen=new Set();for(const contact of unit.contacts||[]){
  const email=(contact.email||'').trim().toLowerCase();
  if(!validResidentEmail(email)){missing.push({unit_id:unit.id,number:unit.number,name:contact.name});continue;}
  if(seen.has(email))continue;seen.add(email);recipients.push({unit_id:unit.id,number:unit.number,name:contact.name,email});
 }}return {recipients,missing};
}
export const batchVisible=(units,block,group)=>units.filter(u=>(!block||u.block_id===block)&&(!group||u.group_id===group));
export function selectionRows(units,selected){
 const rows=units.filter(u=>selected.includes(u.id));
 if(!rows.length||rows.length>500||rows.length!==new Set(selected).size)throw Error('Velg 1–500 tilgjengelige boliger og kontroller utvalget.');
 return rows;
}
