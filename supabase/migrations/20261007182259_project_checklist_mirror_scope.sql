create or replace function kshms_private.protect_project_checklist_answers() returns trigger
language plpgsql security definer set search_path='' as $$
declare r record;v_checklist jsonb;begin
 for r in select distinct on(q.category) q.category,q.answers,q.company_id from kshms_private.project_checklist_runs q
  where q.project_id=new.id order by q.category,q.sequence desc loop
  if new.company_scope_id is distinct from r.company_id then raise exception 'Prosjektets sjekklister tilhører et annet firma.' using errcode='42501';end if;
  v_checklist:=coalesce(new.data->'checklist','{}'::jsonb);
  v_checklist:=jsonb_set(v_checklist,array[r.category],coalesce(v_checklist->r.category,'{}'::jsonb)||r.answers,true);
  new.data:=jsonb_set(new.data,'{checklist}',v_checklist,true);
 end loop;return new;
end $$;
