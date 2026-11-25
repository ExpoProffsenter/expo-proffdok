const date=/^\d{4}-\d{2}-\d{2}$/;
export function scopedReviewTask(value,companyId,userId) {
 if(value?.company_id!==companyId||value?.user_id!==userId||!date.test(value.as_of||''))return null;
 const task=value.task;
 if(!task||!date.test(task.due_on||'')||!['overdue','today','soon'].includes(task.deadline_status))return null;
 const expected=task.due_on<value.as_of?'overdue':task.due_on===value.as_of?'today':'soon';
 return task.deadline_status===expected?task:null;
}
export const reviewDeadlineLabel=status=>({overdue:'Datoen for revisjon er passert',today:'Håndboken skal revideres i dag',soon:'Håndboken skal revideres innen sju dager'})[status]||'';
