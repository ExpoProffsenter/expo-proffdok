-- Read-only, scoped documentation snapshot. It does not approve, sign, close or
-- email anything. Parent common documentation is included for unit/building use.
create function bolig_private.documentation_export(c uuid,root uuid,scope uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
#variable_conflict use_variable
declare access jsonb;tree jsonb;selected jsonb;scopes jsonb:='[]';r record;q bolig_private.quality_states%rowtype;entry jsonb;row_data jsonb;scope_data jsonb;events jsonb;files jsonb;goods jsonb;parent uuid;result jsonb;
begin
 access:=bolig_private.quality_scope(c,root,scope);tree:=bolig_private.completion_tree(c,root);
 select value into selected from jsonb_array_elements(tree->'rows') where value->>'scope_id'=scope::text;
 if selected is null then raise exception 'Arbeidsområdet er ikke tilgjengelig.' using errcode='42501';end if;
 parent:=nullif(selected->>'parent_id','')::uuid;
 for r in
  select x,coalesce((x->>'scope_id')::uuid<>scope and (x->>'scope_id'=root::text or x->>'scope_id'=parent::text),false) common from jsonb_array_elements(tree->'rows') x
  where scope=root or x->>'scope_id'=scope::text or x->>'scope_id'=root::text or x->>'scope_id'=parent::text or x->>'parent_id'=scope::text
  order by case x->>'kind' when 'project' then 0 when 'block' then 1 else 2 end,x->>'title',x->>'scope_id'
 loop
  row_data:=r.x;
  if coalesce((row_data#>>'{source,restricted}')::boolean,false) then raise exception 'Du trenger tilgang til koblet prosjekt for å eksportere denne dokumentasjonen.' using errcode='42501';end if;
  select * into q from bolig_private.quality_states where root_id=root and scope_id=(row_data->>'scope_id')::uuid;
  scope_data:=coalesce(q.data,'{"checks":[],"documents":[],"protocols":[],"fdv":{}}');
  -- Full stored control versions live in immutable history. Keep the snapshot
  -- bounded and explicit; large projects can be exported building by building.
  select coalesce(jsonb_agg(jsonb_build_object('revision',e.revision,'action',e.action,'actor_name',e.actor_name,'at',e.created_at,'reason',e.reason,'snapshot',e.snapshot) order by e.revision),'[]') into events from bolig_private.quality_events e where e.root_id=root and e.scope_id=(row_data->>'scope_id')::uuid;
  select coalesce(jsonb_agg(doc||jsonb_build_object('available',o.name is not null,'size',case when to_jsonb(o)#>>'{metadata,size}' ~ '^[0-9]{1,12}$' then (to_jsonb(o)#>>'{metadata,size}')::bigint else null end) order by n),'[]') into files from jsonb_array_elements(scope_data->'documents') with ordinality d(doc,n) left join storage.objects o on o.bucket_id='bolig-documents' and o.name=doc->>'path';
  scope_data:=jsonb_set(scope_data,'{documents}',files);
  entry:=jsonb_build_object('id',row_data->>'scope_id','kind',row_data->>'kind','title',row_data->>'title','common',r.common,'revision',coalesce(q.revision,0),'completion',case when r.common then (row_data-'source'-'restpoints'-'issues'-'warnings'-'approval'-'handover')||jsonb_build_object('approval',case when jsonb_typeof(row_data->'approval')='object' then (row_data->'approval')-'restpoints'-'warnings' else null end,'handover',row_data->'handover') else row_data end,'data',scope_data,'history',events,
  'completion_history',case when r.common then '[]'::jsonb else coalesce((select jsonb_agg(jsonb_build_object('revision',e.revision,'action',e.action,'actor_name',e.actor_name,'at',e.created_at,'reason',e.reason,'snapshot',e.snapshot) order by e.revision) from bolig_private.completion_events e where e.root_id=root and e.scope_id=(row_data->>'scope_id')::uuid),'[]') end,
  'rooms',coalesce((select jsonb_agg(jsonb_build_object('id',room.id,'name',room.name,'archived',room.archived) order by room.name) from bolig_private.rooms room where room.root_id=root and room.unit_id=(row_data->>'scope_id')::uuid),'[]'));
  scopes:=scopes||jsonb_build_array(entry);
 end loop;
 goods:=bolig_private.fdv_rows(root,scope);
 result:=jsonb_build_object('context',access->'context','root_id',root,'scope_id',scope,'title',access->>'title','kind',access->>'kind','project',(select title from bolig_private.roots where id=root),'scopes',scopes,'fdv',goods,'status',selected->>'status','restpoints',selected->'restpoints',
 'notice','Uttrekk av lagret dokumentasjon. Kontroller faktisk montert leveranse. Ekstern FDV følger som lenker, ikke vedlagte filer. Eventuelt koblet ordinært prosjekt følger bare som dokumentreferanse.');
 if octet_length(result::text)>20000000 then raise exception 'Dokumentasjonen er stor. Last ned per bygg eller bolig.' using errcode='22023';end if;
 return result||jsonb_build_object('basis',md5(result::text));
end$$;
revoke all on function bolig_private.documentation_export(uuid,uuid,uuid) from public,anon,service_role;
grant execute on function bolig_private.documentation_export(uuid,uuid,uuid) to authenticated;
create function public.bolig_documentation_export(p_company_id uuid,p_root_id uuid,p_scope_id uuid) returns jsonb language sql security invoker set search_path='' as $$select bolig_private.documentation_export(p_company_id,p_root_id,p_scope_id)$$;
revoke all on function public.bolig_documentation_export(uuid,uuid,uuid) from public,anon,service_role;
grant execute on function public.bolig_documentation_export(uuid,uuid,uuid) to authenticated;
notify pgrst,'reload schema';
