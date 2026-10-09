export const TASK_REMINDER_TARGETS={round:{screen:'rounds',label:'Vernerunder/kontroller'},risk:{screen:'risk',label:'Risikovurdering'},sja:{screen:'sja',label:'SJA'},reading:{screen:'reading',label:'Les og bekreft'}};
export function scopedTaskReminderGroups(value,companyId,userId) {
 if(value?.company_id!==companyId||value?.user_id!==userId||!/^\d{4}-\d{2}-\d{2}$/.test(value.as_of||'')||!Array.isArray(value.groups)||value.groups.length>4)return [];
 const seen=new Set();
 for(const group of value.groups){if(!Object.hasOwn(TASK_REMINDER_TARGETS,group.kind)||seen.has(group.kind)||!Number.isSafeInteger(group.count)||group.count<=0)return [];seen.add(group.kind);}
 return value.groups;
}
