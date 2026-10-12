-- App-only handling receipts. Existing feedback revision, commands and mail outbox are unchanged.
-- Receipts cascade with the private conversation. Restore without receipts means unread again.
create table hr_private.conversation_feedback_receipts (
 conversation_id uuid not null references hr_private.conversations(id) on delete cascade,
 leader_id uuid not null,
 feedback_revision integer not null check(feedback_revision>0),
 handled_at timestamptz not null default now(),
 primary key(conversation_id,leader_id)
);
alter table hr_private.conversation_feedback_receipts enable row level security;
revoke all on hr_private.conversation_feedback_receipts from public,anon,authenticated,service_role;

create function public.hr_conversation_feedback_notices(p_company_id uuid,p_after uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$declare x jsonb;rows jsonb;begin
 x:=hr_private.require_context(p_company_id);perform hr_private.require_content_ready();
 select coalesce(jsonb_agg(to_jsonb(q) order by q.case_id),'[]'::jsonb) into rows from(
 select c.id case_id,e.id employee_id,'employee-feedback'::text task_key,
 a.payload->>'on' due_on,'conversation'::text kind,
 (a.payload->>'employee_feedback_revision')::integer feedback_revision
 from hr_private.conversations c
 join hr_private.employees e on e.id=c.employee_id and e.company_id=c.company_id
 join hr_private.artifacts a on a.id=c.current_artifact_id
 left join hr_private.conversation_feedback_receipts r on r.conversation_id=c.id and r.leader_id=auth.uid()
 where c.company_id=p_company_id and e.leader_id=auth.uid()
 and hr_private.active_member(p_company_id,e.user_id) and hr_private.has_module_access(p_company_id,e.user_id)
 and hr_private.has_module_access(p_company_id,e.leader_id)
 and a.payload->>'shared'='true'
 and coalesce((a.payload->>'employee_feedback_revision')::integer,0)>coalesce(r.feedback_revision,0)
 and(p_after is null or c.id>p_after)
 order by c.id limit 51)q;
 x:=hr_private.require_context(p_company_id);
 return jsonb_build_object('context',x,'tasks',case when jsonb_array_length(rows)>50 then rows-'50'::int else rows end,
 'next',case when jsonb_array_length(rows)>50 then rows->49->>'case_id' else null end);
end$$;

create function public.hr_conversation_feedback_handle(p_company_id uuid,p_employee_id uuid,p_employee_revision integer,
 p_conversation_id uuid,p_feedback_revision integer) returns jsonb
language plpgsql security definer set search_path='' as $$declare e hr_private.employees%rowtype;c hr_private.conversations%rowtype;v jsonb;x jsonb;begin
 -- Same lock order as conversation commands/leader changes. Never modify the case or outbox.
 perform 1 from hr_private.firms where company_id=p_company_id for update;
 e:=hr_private.conversation_employee(p_company_id,p_employee_id);
 if auth.uid() is distinct from e.leader_id or not hr_private.has_module_access(p_company_id,e.user_id) then
 raise exception 'Bare gjeldende nærmeste leder håndterer innspillet.' using errcode='42501';end if;
 if p_employee_revision is distinct from e.revision then raise exception 'Medarbeiderens tilgang er endret.' using errcode='40001';end if;
 select * into c from hr_private.conversations where company_id=p_company_id and employee_id=e.id and id=p_conversation_id for update;
 if c.id is null then raise exception 'Samtalen er ikke tilgjengelig.' using errcode='42501';end if;
 select payload into v from hr_private.artifacts where id=c.current_artifact_id;
 if p_feedback_revision is null or p_feedback_revision<1 or v->>'shared' is distinct from 'true'
 or p_feedback_revision is distinct from coalesce((v->>'employee_feedback_revision')::integer,0) then
 raise exception 'Innspillet er endret. Åpne det nyeste innspillet før du markerer det som håndtert.' using errcode='40001';end if;
 insert into hr_private.conversation_feedback_receipts(conversation_id,leader_id,feedback_revision)
 values(c.id,auth.uid(),p_feedback_revision)
 on conflict(conversation_id,leader_id) do update set feedback_revision=excluded.feedback_revision,handled_at=now()
 where hr_private.conversation_feedback_receipts.feedback_revision<excluded.feedback_revision;
 x:=hr_private.require_context(p_company_id);
 return jsonb_build_object('context',x,'employee_id',e.id,'conversation_id',c.id,'feedback_revision',p_feedback_revision,'handled',true);
end$$;
revoke all on function public.hr_conversation_feedback_notices(uuid,uuid),public.hr_conversation_feedback_handle(uuid,uuid,integer,uuid,integer) from public,anon,authenticated,service_role;
grant execute on function public.hr_conversation_feedback_notices(uuid,uuid),public.hr_conversation_feedback_handle(uuid,uuid,integer,uuid,integer) to authenticated;
