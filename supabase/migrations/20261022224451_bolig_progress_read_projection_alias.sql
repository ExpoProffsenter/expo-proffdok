-- The PL/pgSQL variable t shadows a result-set alias under use_variable.
-- Use an unambiguous alias for notices/deliveries, including plain GET/reload.
-- No schema, authorization, revision, data or grants are changed.
do $$
declare body text;before text;after text;
begin
 body:=pg_get_functiondef('bolig_private.progress_workspace(uuid,uuid,uuid,text,jsonb)'::regprocedure);
 before:=$old$'deliveries',(select coalesce(jsonb_agg(jsonb_build_object('id',d.id,'task_id',d.task_id,'notice_id',d.notice_id,'kind',d.kind,'status',d.status,'accepted_at',d.accepted_at)),'[]') from bolig_private.progress_deliveries d join bolig_private.progress_tasks t on t.id=d.task_id where d.root_id=root and (unit is null or t.unit_id=unit))$old$;
 after:=replace(replace(before,'progress_tasks t on','progress_tasks projected_task on'),'t.','projected_task.');
 if position(before in body)=0 then raise exception 'Unexpected delivery projection; no change applied';end if;
 body:=replace(body,before,after);
 before:=$old$'notices',(select coalesce(jsonb_agg(to_jsonb(x)||jsonb_build_object('current',x.basis=bolig_private.progress_notice_basis(t,x),'valid',bolig_private.progress_notice_valid(x),'recipient',(select contact_email from bolig_private.units where id=t.unit_id),'title',t.title,'planned_start',t.planned_start,'planned_end',t.planned_end,'unit_number',(select number from bolig_private.units where id=t.unit_id)) order by x.created_at desc),'[]') from bolig_private.progress_notices x join bolig_private.progress_tasks t on t.id=x.task_id where x.root_id=root and (unit is null or t.unit_id=unit))$old$;
 after:=replace(replace(replace(before,'progress_tasks t on','progress_tasks projected_task on'),'t.','projected_task.'),'progress_notice_basis(t,x)','progress_notice_basis(projected_task,x)');
 if position(before in body)=0 then raise exception 'Unexpected notice projection; no change applied';end if;
 body:=replace(body,before,after);execute body;
end$$;
notify pgrst,'reload schema';
