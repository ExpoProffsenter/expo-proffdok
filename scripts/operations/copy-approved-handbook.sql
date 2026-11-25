-- Operator-run, explicitly authorized copy to EMPTY target firms only.
-- Run in a transaction, with a frozen source fingerprint and verified firm admin.
-- Uses existing settings/access/save/publish RPCs. Never calls acknowledgment.
create function pg_temp.copy_approved_handbook(source_company uuid,targets uuid[],operator_id uuid,expected_source_hash text)
returns jsonb language plpgsql as $$
declare target uuid;source_settings public.kshms_settings%rowtype;original_scope public.user_active_company_scope%rowtype;
 member record;edition record;created jsonb;published jsonb;result jsonb:='[]';granted integer;copied integer;fingerprint text;source_content jsonb;
begin
 if source_company is null or operator_id is null or cardinality(targets)=0 or source_company=any(targets)
 or cardinality(targets)<>(select count(distinct x) from unnest(targets) x) then raise exception 'Invalid source/target scope';end if;
 if not exists(select 1 from public.profiles where id=operator_id and approved and not coalesce(deactivated,false) and role in ('admin','member','ansatt','firmaadmin'))
 or exists(select 1 from unnest(array_append(targets,source_company)) c where not exists(select 1 from public.sales_company_memberships m where m.company_id=c and m.user_id=operator_id and m.workspace_role='firmaadmin'))
 then raise exception 'Verified active firmaadmin in every firm required';end if;
 perform 1 from public.company_module_access where company_id=any(array_append(targets,source_company)) and module_key='kshms' order by company_id for update;
 if exists(select 1 from unnest(array_append(targets,source_company)) c where not exists(select 1 from public.company_module_access where company_id=c and module_key='kshms' and enabled))
 then raise exception 'Every firm must already have KS/HMS licensed';end if;
 if exists(select 1 from public.kshms_routines where company_id=any(targets)) or exists(select 1 from public.kshms_settings where company_id=any(targets))
 then raise exception 'Targets must be empty; existing company work must be reviewed separately';end if;
 select * into strict source_settings from public.kshms_settings where company_id=source_company;
 select md5(jsonb_agg(jsonb_build_object('id',id,'hash',content_hash) order by id)::text),jsonb_agg(content order by content::text)
 into fingerprint,source_content from(select distinct on(v.routine_id) v.id,v.content_hash,v.content from public.kshms_versions v join public.kshms_routines r on r.id=v.routine_id and r.company_id=v.company_id where v.company_id=source_company and not r.archived order by v.routine_id,v.number desc) current_editions;
 if fingerprint is distinct from expected_source_hash or source_content is null then raise exception 'Source handbook changed or is empty';end if;
 select * into original_scope from public.user_active_company_scope where user_id=operator_id for update;
 perform set_config('request.jwt.claim.sub',operator_id::text,true);
 foreach target in array targets loop
  insert into public.user_active_company_scope(user_id,company_id) values(operator_id,target)
   on conflict(user_id) do update set company_id=excluded.company_id;
  perform public.kshms_command(target,'settings',jsonb_build_object('revision',0,'trades',to_jsonb(source_settings.trades),'activities',source_settings.activities,'responsibilities',source_settings.responsibilities,'risks',source_settings.risks,'responsible_user_id',operator_id));
  granted:=0;
  for member in select m.user_id from public.sales_company_memberships m join public.profiles p on p.id=m.user_id
   left join public.kshms_member_access a on a.company_id=m.company_id and a.user_id=m.user_id
   where m.company_id=target and m.workspace_role='ansatt' and p.approved and not coalesce(p.deactivated,false)
   and p.role in ('admin','member','ansatt','firmaadmin') and not coalesce(a.enabled,false) order by m.user_id
  loop
   perform public.kshms_command(target,'access',jsonb_build_object('user_id',member.user_id,'role','reader','enabled',true));granted:=granted+1;
  end loop;
  copied:=0;
  for edition in select distinct on(v.routine_id) v.content from public.kshms_versions v join public.kshms_routines r on r.id=v.routine_id and r.company_id=v.company_id
   where v.company_id=source_company and not r.archived order by v.routine_id,v.number desc
  loop
   created:=public.kshms_command(target,'save',jsonb_build_object('draft',edition.content));
   published:=public.kshms_command(target,'publish',jsonb_build_object('id',created->>'id','revision',created->'revision','change_summary','Etter Kenneth Skogsruds uttrykkelige instruks 20.10.2026: samme gjeldende, godkjente rutinetekster som Ringside. Kopiert via Codex; ingen ansattbekreftelse er registrert.','requires_ack',true,'acknowledge_self',false));
   if published->'content' is distinct from edition.content then raise exception 'Published content differs from approved source';end if;
   copied:=copied+1;
  end loop;
  if source_content is distinct from(select jsonb_agg(v.content order by v.content::text) from public.kshms_versions v where v.company_id=target)
  then raise exception 'Target handbook does not exactly match source';end if;
  if exists(select 1 from public.kshms_acknowledgments where company_id=target) then raise exception 'No employee confirmation may be created';end if;
  result:=result||jsonb_build_array(jsonb_build_object('company_id',target,'routines_copied',copied,'read_access_added',granted));
 end loop;
 if original_scope.user_id is null then delete from public.user_active_company_scope where user_id=operator_id;
 else update public.user_active_company_scope set company_id=original_scope.company_id,selected_at=original_scope.selected_at where user_id=operator_id;end if;
 return result;
end $$;
