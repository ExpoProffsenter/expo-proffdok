export const HR_CONTACT_SAVED_EVENT='hr-contact-profile-saved';

const reminderFields=[['address','gateadresse'],['postal_code','postnummer'],['city','poststed'],['relative_name','pårørendes navn'],['relative_phone','pårørendes telefon']];
export function missingContactFields(data){
 return reminderFields.filter(([key])=>typeof data?.[key]!=='string'||!data[key].trim()).map(([,label])=>label);
}

// Keep only completion metadata. Contact values never enter the reminder state.
export async function readContactReminder({rpc,companyId,userId}){
 const valid=value=>value?.context?.company_id===companyId&&value.context.user_id===userId;
 const first=await rpc('hr_contact_get',{p_company_id:companyId,p_employee_id:null});
 if(!valid(first))throw Error('Arbeidsprofilen er endret.');
 if(!first.available||!first.registered||!first.editable)return {available:false,missing:[]};
 const fresh=await rpc('hr_contact_get',{p_company_id:companyId,p_employee_id:null});
 if(!valid(fresh)||!fresh.registered||!fresh.available||!fresh.editable||!fresh.employee?.id||
    fresh.employee.id!==first.employee?.id||fresh.employee.revision!==first.employee.revision||fresh.revision!==first.revision)
  throw Error('Tilgangen eller kontaktprofilen er endret.');
 return {available:true,missing:missingContactFields(fresh.data)};
}
