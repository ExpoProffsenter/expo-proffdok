-- Read-only, firm-bound overview. No prices, private documents or invented progress.
create function bolig_private.overview(c uuid, root uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare ctx jsonb; rows jsonb;
begin
  ctx := bolig_private.context(c);
  if coalesce((ctx->>'enabled')::boolean,false) is not true or not exists(select 1 from bolig_private.roots r where r.id=root and r.company_id=c) then
    raise exception 'Hovedprosjektet er ikke tilgjengelig i aktivt firma.' using errcode='42501';
  end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'unit_id',u.id,'choice_revision',coalesce(cv.revision,0),
    'catalog_changed',cv.revision is not null and (cv.snapshot->>'catalog_revision')::bigint is distinct from coalesce(cs.revision,0),
    'order_revision',coalesce(od.revision,0),
    'order_outdated',od.revision is not null and od.source_choice_revision is distinct from cv.revision
  ) order by u.id),'[]'::jsonb) into rows
  from bolig_private.units u
  join bolig_private.entrances e on e.id=u.entrance_id and not e.archived
  join bolig_private.blocks b on b.id=e.block_id and not b.archived
  left join bolig_private.catalog_states cs on cs.root_id=u.root_id
  left join lateral (select v.revision,v.snapshot from bolig_private.choice_versions v where v.unit_id=u.id and v.root_id=root order by v.revision desc limit 1) cv on true
  left join lateral (select d.revision,d.source_choice_revision from bolig_private.order_draft_versions d where d.unit_id=u.id and d.root_id=root order by d.revision desc limit 1) od on true
  where u.root_id=root and not u.archived;
  return jsonb_build_object('context',ctx,'root_id',root,'units',rows);
end$$;
revoke all on function bolig_private.overview(uuid,uuid) from public,anon,authenticated,service_role;
grant execute on function bolig_private.overview(uuid,uuid) to authenticated;
create function public.bolig_overview(p_company_id uuid,p_root_id uuid) returns jsonb
language sql stable security invoker set search_path='' as $$select bolig_private.overview(p_company_id,p_root_id)$$;
revoke all on function public.bolig_overview(uuid,uuid) from public,anon,service_role;
grant execute on function public.bolig_overview(uuid,uuid) to authenticated;
