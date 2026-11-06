-- Run only on the authorized Sandbox after hr_conversation_extended_text.
-- Existing synthetic DEMO case only; CAS and explicit identity/title/stage fence.
-- No COMMIT, invitation, confirmation, notification or transport. Always rollback.
begin;
set local request.jwt.claim.sub='d0000000-0000-4000-8000-000000000001';
set local role authenticated;
do $qa$
declare
 company constant uuid:='e0000000-0000-4000-8000-000000000001';
 employee constant uuid:='fa950f47-7c81-4eb7-89dc-f84b3e1de588';
 conversation constant uuid:='7e4378a7-9d3e-4981-be80-d41c0b6d12f0';
 before_value jsonb;saved jsonb;checked_value jsonb;answers jsonb;action jsonb;rejected boolean;
 long_text text:=repeat('æ',9994)||' SLUTT';long_task text:=repeat('ø',1994)||' SLUTT';
 first_question text;data jsonb;
begin
 before_value:=public.hr_conversation_get(company,employee,conversation);
 assert before_value#>>'{employee,user_id}'='d0000000-0000-4000-8000-000000000103','Only the authorized synthetic employee';
 assert before_value#>>'{conversation,template,title}'='DEMO – Årlig medarbeidersamtale','Only the existing DEMO template';
 assert before_value#>>'{conversation,stage}'='meeting' and (before_value->>'current_revision')::int=4,'Expected original revision/stage';
 select jsonb_object_agg(q->>'id',long_text),min(q->>'id') into answers,first_question
 from jsonb_array_elements(before_value#>'{conversation,template,questions}') q where q->>'phase'='meeting';
 assert first_question is not null,'Meeting questions exist';
 action:=jsonb_build_object('id','dd000000-0000-4000-8000-000000000001','task',long_task,'owner_id','d0000000-0000-4000-8000-000000000103','due_on','2026-11-20','done',false);
 data:=jsonb_build_object('answers',answers,'actions',jsonb_build_array(action),'next_on','2026-11-21');
 saved:=public.hr_conversation_command(company,employee,1,conversation,4,'meeting',data);
 assert saved#>'{conversation,meeting}'=answers,'All long meeting answers returned without truncation';
 assert saved#>>'{conversation,actions,0,task}'=long_task,'Full 2000-character action returned';
 assert saved#>'{conversation,preparation}'=before_value#>'{conversation,preparation}','Original shared preparation retained';
 checked_value:=public.hr_conversation_get(company,employee,conversation);
 assert checked_value#>'{conversation,meeting}'=answers and checked_value#>>'{conversation,actions,0,task}'=long_task,'Fresh server readback';
 rejected:=false;
 begin perform public.hr_conversation_command(company,employee,1,conversation,5,'meeting',jsonb_set(data,array['answers',first_question],to_jsonb(long_text||'x')));
 exception when sqlstate '22023' then rejected:=true;end;
 assert rejected,'10001-character answer must be rejected';
 assert public.hr_conversation_get(company,employee,conversation)=checked_value,'Invalid answer did not alter revision or content';
 rejected:=false;
 begin perform public.hr_conversation_command(company,employee,1,conversation,5,'meeting',jsonb_set(data,'{actions,0,task}',to_jsonb(long_task||'x')));
 exception when sqlstate '22023' then rejected:=true;end;
 assert rejected,'2001-character action must be rejected';
 assert public.hr_conversation_get(company,employee,conversation)=checked_value,'Invalid action did not alter revision or content';
 saved:=public.hr_conversation_command(company,employee,1,conversation,5,'comment',jsonb_build_object('text',long_text));
 assert saved#>>'{conversation,comments,leader}'=long_text,'Full 10000-character own comment returned';
 checked_value:=public.hr_conversation_get(company,employee,conversation);
 assert checked_value#>>'{conversation,comments,leader}'=long_text,'Own long comment survives fresh read';
 rejected:=false;
 begin perform public.hr_conversation_command(company,employee,1,conversation,6,'comment',jsonb_build_object('text',long_text||'x'));
 exception when sqlstate '22023' then rejected:=true;end;
 assert rejected,'10001-character comment must be rejected';
 assert public.hr_conversation_get(company,employee,conversation)=checked_value,'Invalid comment did not alter saved review';
 rejected:=false;
 begin perform public.hr_conversation_command(company,employee,1,conversation,5,'meeting',data);
 exception when sqlstate 'PT409' then rejected:=true;end;
 assert rejected,'Stale revision still fenced by HTTP409 contract';
end $qa$;
rollback;
select 'PASS: existing synthetic HR case, long meeting/action/comment readback, over-limit atomic rejection, PT409, full rollback' as result;
