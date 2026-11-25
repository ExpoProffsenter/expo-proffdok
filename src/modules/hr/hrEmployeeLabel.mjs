// Authorized employee metadata only. Never derive an identity from a case title or the actor.
export function hrEmployeeLabel(employee){
 const name=typeof employee?.full_name==='string'?employee.full_name.trim():'';
 const email=typeof employee?.email==='string'?employee.email.trim():'';
 return name||email||'Medarbeider';
}
