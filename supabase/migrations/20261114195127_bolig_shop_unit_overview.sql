-- Additive read projection for personally assigned eligible shop staff.
-- Existing authorization and exact server deadline calculation are retained.
create or replace function bolig_private.my_collaborations(root uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare selected_root bolig_private.roots%rowtype;
begin
 if auth.uid() is null then raise exception 'Logg inn med din egen bruker.' using errcode='42501';end if;
 if root is null then return jsonb_build_object('user_id',auth.uid(),'projects',coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'title',r.title,'company',s.display_name) order by r.title,r.id)
 from bolig_private.roots r join public.sales_company_scopes s on s.id=r.company_id where bolig_private.commerce_collaborator(r.company_id,r.id,'read')),'[]'));end if;
 select * into selected_root from bolig_private.roots where id=root;
 if selected_root.id is null or not bolig_private.commerce_collaborator(selected_root.company_id,selected_root.id,'read') then raise exception 'Prosjekttilgangen er utløpt eller tilbakekalt.' using errcode='42501';end if;
 return jsonb_build_object('user_id',auth.uid(),'root',jsonb_build_object('id',selected_root.id,'title',selected_root.title,'archived',selected_root.archived),
 'context',bolig_private.commerce_read_context(selected_root.company_id,selected_root.id),
 'units',coalesce((select jsonb_agg(jsonb_build_object('id',u.id,'number',u.number,'contact_name',u.contact_name,'address',e.address) || case when bolig_private.shop_staff_eligible(auth.uid()) and exists(
 select 1 from bolig_private.shop_staff_access g where g.user_id=auth.uid() and g.root_id=root and g.enabled and g.expires_at>clock_timestamp()) then jsonb_build_object(
 'contact_phone',u.contact_phone,'contact_email',u.contact_email,
 'choice_deadline_at',bolig_private.choice_deadline_at(root,u.choice_deadline),
 'activities',coalesce((select jsonb_agg(jsonb_build_object('id',t.id,'title',t.title,'planned_start',t.planned_start,'planned_end',t.planned_end,'status',t.status) order by t.planned_start,t.planned_end,t.id)
 from bolig_private.progress_tasks t where t.root_id=root and t.unit_id=u.id and not t.archived and t.status<>'done'),'[]')) else '{}'::jsonb end order by e.address,u.number,u.id)
 from bolig_private.units u join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id
 where u.root_id=root and not u.archived and not e.archived and not b.archived),'[]'));
end$$;
revoke all on function bolig_private.my_collaborations(uuid) from public,anon,service_role;
grant execute on function bolig_private.my_collaborations(uuid) to authenticated;
