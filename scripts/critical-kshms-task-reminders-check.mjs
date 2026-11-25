import assert from 'node:assert/strict';
import {scopedTaskReminderGroups,TASK_REMINDER_TARGETS} from '../src/modules/kshms/kshmsTaskReminders.mjs';
const own={company_id:'a',user_id:'u',as_of:'2026-10-09',groups:[{kind:'reading',count:2},{kind:'sja',count:1}]};
assert.deepEqual(scopedTaskReminderGroups(own,'a','u'),own.groups);
for(const patch of [{company_id:'b'},{user_id:'other'},{as_of:null},{groups:null},{groups:[{kind:'unknown',count:1}]},{groups:[{kind:'reading',count:-1}]},{groups:[{kind:'reading',count:0}]},{groups:[{kind:'reading',count:1.5}]},{groups:[{kind:'reading',count:1},{kind:'reading',count:2}]}])assert.deepEqual(scopedTaskReminderGroups({...own,...patch},'a','u'),[]);
assert.deepEqual(Object.values(TASK_REMINDER_TARGETS).map(t=>t.screen),['rounds','risk','sja','reading']);
console.log('critical-kshms-task-reminders-check: PASS — own-only groups, counts, unique known types and existing task targets');
