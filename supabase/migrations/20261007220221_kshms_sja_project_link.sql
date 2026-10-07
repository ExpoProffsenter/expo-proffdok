-- Add a real project link without changing old drafts or signed content.
alter table public.kshms_sjas add column project_id uuid references public.projects(id);
create index kshms_sjas_project_updated_idx on public.kshms_sjas(project_id,company_id,updated_at desc,id) where project_id is not null;

create function kshms_private.sja_state(p_company_id uuid,p_query text,p_status text,p_project_id uuid) returns jsonb language plpgsql set search_path='' as $$
declare x jsonb; result jsonb; p public.projects%rowtype;
begin
 x:=kshms_private.require_context(p_company_id);
 if p_status not in ('all','draft','signed') or length(coalesce(p_query,''))>160 then raise exception 'Ugyldig SJA-søk.'; end if;
 if p_project_id is not null then
  p:=kshms_private.project_checklist_access(p_company_id,p_project_id,false);
  x:=x||jsonb_build_object('project_id',p.id);
 end if;
 with visible as (
  select s.*,pr.title as project_title,pr.data as project_data from public.kshms_sjas s left join public.projects pr on pr.id=s.project_id
  where s.company_id=p_company_id
  and (p_project_id is null or s.project_id=p_project_id)
  and (s.project_id is null or (pr.company_scope_id=p_company_id and public.project_row_access_allowed(pr.company_scope_id,pr.user_id)))
  and (s.status='signed' or s.created_by=(select auth.uid()) or s.leader_id=(select auth.uid()) or (x->>'manage')::boolean)
  and (p_status='all' or s.status=p_status)
  and (coalesce(p_query,'')='' or strpos(lower((s.content->>'title')||' '||(s.content->>'workplace')||' '||(s.content->>'project_reference')||' '||coalesce(pr.title,'')),lower(p_query))>0)
 ), recent as (select * from visible order by updated_at desc,id limit 100)
 select jsonb_build_object('context',x,'total',(select count(*) from visible),
  'project',case when p.id is null then null else jsonb_build_object('id',p.id,'name',coalesce(nullif(p.data#>>'{project,projectName}',''),p.title),'locked',coalesce(p.locked,false) or coalesce((p.data#>>'{project,locked}')::boolean,false)) end,
  'items',(select coalesce(jsonb_agg(jsonb_build_object('id',r.id,'company_id',r.company_id,'project_id',r.project_id,'project_name',coalesce(nullif(r.project_data#>>'{project,projectName}',''),r.project_title),'revision',r.revision,'status',r.status,'title',r.content->>'title','workplace',r.content->>'workplace','project_reference',r.content->>'project_reference','leader_id',r.leader_id,'leader_identity',r.leader_identity,'signed_identity',r.signed_identity,'signed_at',r.signed_at) order by r.updated_at desc,r.id),'[]') from recent r),
  'members',(select coalesce(jsonb_agg(jsonb_build_object('id',u.id,'identity',kshms_private.identity_snapshot(u.id)) order by u.email),'[]') from public.sales_company_memberships m join public.profiles u on u.id=m.user_id where m.company_id=p_company_id and kshms_private.deviation_member(p_company_id,u.id))) into result;
 return result;
end $$;
create or replace function public.kshms_sja_state(p_company_id uuid,p_query text default '',p_status text default 'all') returns jsonb language sql security definer set search_path='' as $$
 select kshms_private.sja_state(p_company_id,p_query,p_status,null);
$$;
create function public.kshms_project_sja_state(p_company_id uuid,p_project_id uuid,p_query text default '',p_status text default 'all') returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if p_project_id is null then raise exception 'Velg et lagret prosjekt.'; end if;
 return kshms_private.sja_state(p_company_id,p_query,p_status,p_project_id);
end $$;
create or replace function public.kshms_sja_detail(p_company_id uuid,p_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb; s public.kshms_sjas%rowtype; p public.projects%rowtype;
begin
 x:=kshms_private.require_context(p_company_id);
 select * into s from public.kshms_sjas where company_id=p_company_id and id=p_id;
 if found and not (s.status='signed' or s.created_by=auth.uid() or s.leader_id=auth.uid() or (x->>'manage')::boolean) then raise exception 'SJA-en er ikke tilgjengelig.' using errcode='42501'; end if;
 if s.project_id is not null then p:=kshms_private.project_checklist_access(p_company_id,s.project_id,false); end if;
 return jsonb_build_object('context',x,'sja',case when s.id is null then null else to_jsonb(s)||jsonb_build_object('project_name',coalesce(nullif(p.data#>>'{project,projectName}',''),p.title),'project_locked',coalesce(p.locked,false) or coalesce((p.data#>>'{project,locked}')::boolean,false)) end);
end $$;

create or replace function public.kshms_sja_command(p_company_id uuid,p_action text,p_request_id uuid,p_payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb; s public.kshms_sjas%rowtype; receipt public.kshms_sja_commands%rowtype; sja_id uuid; content_data jsonb; leader uuid; payload_digest text; result jsonb; linked_project uuid;
 statement_value constant text:='Jeg har gjennomgått denne SJA-en sammen med deltakerne. Arbeidsoppgaven, farene, tiltakene og beredskapen er vurdert for forholdene på stedet. Nødvendige tiltak er kontrollert før arbeidet starter. Ved endringer eller uavklart risiko stanser vi og vurderer arbeidet på nytt.';
begin
 x:=kshms_private.require_context(p_company_id);
 perform 1 from public.company_module_access where company_id=p_company_id and module_key='kshms' for update;
 x:=kshms_private.require_context(p_company_id);
 if p_action is null or p_action not in ('save','sign') or p_request_id is null or jsonb_typeof(p_payload) is distinct from 'object' then raise exception 'Ugyldig SJA-kommando.'; end if;
 payload_digest:=encode(sha256(convert_to(p_action||p_payload::text,'UTF8')),'hex');
 select * into receipt from public.kshms_sja_commands where company_id=p_company_id and request_id=p_request_id;
 if found then
  if receipt.actor_id<>auth.uid() or receipt.payload_hash<>payload_digest then raise exception 'Forespørselen er brukt med annen tekst eller bruker.' using errcode='40001'; end if;
  if nullif(receipt.result#>>'{sja,project_id}','') is not null then perform kshms_private.project_checklist_access(p_company_id,(receipt.result#>>'{sja,project_id}')::uuid,false); end if;
  return receipt.result;
 end if;
 sja_id:=(p_payload->>'id')::uuid;
 if sja_id is null then raise exception 'SJA-ID mangler.'; end if;
 select * into s from public.kshms_sjas where id=sja_id and company_id=p_company_id for update;
 if found then
  if s.status='signed' then raise exception 'SJA-en er signert og kan ikke endres.' using errcode='42501'; end if;
  if not ((x->>'manage')::boolean or s.created_by=auth.uid() or s.leader_id=auth.uid()) then raise exception 'Du kan ikke endre denne SJA-en.' using errcode='42501'; end if;
  if s.revision<>coalesce((p_payload->>'revision')::bigint,-1) then raise exception 'En kollega har lagret en nyere SJA. Sammenlign før du fortsetter.' using errcode='40001'; end if;
 else
  if exists(select 1 from public.kshms_sjas other where other.id=sja_id) then raise exception 'SJA-en er ikke tilgjengelig.' using errcode='42501'; end if;
  if coalesce((p_payload->>'revision')::bigint,-1)<>0 then raise exception 'SJA-en ble ikke funnet. Kladden er beholdt.' using errcode='40001'; end if;
 end if;
 linked_project:=case when p_payload ? 'project_id' then nullif(p_payload->>'project_id','')::uuid else s.project_id end;
 if s.id is not null and s.project_id is distinct from linked_project then raise exception 'SJA-en kan ikke flyttes til et annet prosjekt. Lag en ny analyse fra riktig prosjekt.' using errcode='42501'; end if;
 if linked_project is not null then perform kshms_private.project_checklist_access(p_company_id,linked_project,true); end if;
 content_data:=kshms_private.sja_content(p_payload->'content',p_action='sign');leader:=nullif(content_data->>'leader_id','')::uuid;
 if leader is not null and not kshms_private.deviation_member(p_company_id,leader) then raise exception 'Velg en aktiv intern prosjektleder med KS/HMS-tilgang.' using errcode='42501'; end if;
 if p_action='sign' and (leader<>auth.uid() or p_payload->>'statement' is distinct from statement_value or p_payload->'prepared' is distinct from 'true'::jsonb) then raise exception 'Bare valgt ansvarlig prosjektleder kan signere etter egen bekreftelse.' using errcode='42501'; end if;
 if s.id is null then
  insert into public.kshms_sjas(id,company_id,project_id,content,leader_id,leader_identity,created_by,creator_identity,updated_by)
  values(sja_id,p_company_id,linked_project,content_data,leader,case when leader is null then null else kshms_private.identity_snapshot(leader) end,auth.uid(),kshms_private.identity_snapshot(auth.uid()),auth.uid()) returning * into s;
 else
  update public.kshms_sjas set content=content_data,leader_id=leader,leader_identity=case when leader is null then null else kshms_private.identity_snapshot(leader) end,revision=revision+1,updated_by=auth.uid(),updated_at=now() where id=s.id returning * into s;
 end if;
 if p_action='sign' then
  update public.kshms_sjas set status='signed',signed_by=auth.uid(),signed_identity=kshms_private.identity_snapshot(auth.uid()),signed_at=now(),statement=statement_value where id=s.id returning * into s;
 end if;
 result:=jsonb_build_object('sja',to_jsonb(s));
 insert into public.kshms_sja_commands(company_id,request_id,actor_id,payload_hash,result) values(p_company_id,p_request_id,auth.uid(),payload_digest,result);
 insert into public.kshms_audit(company_id,actor_id,action,object_id) values(p_company_id,auth.uid(),'sja-'||p_action,s.id);
 return result;
end $$;

revoke all on function kshms_private.sja_state(uuid,text,text,uuid) from public,anon,authenticated;
revoke all on function public.kshms_project_sja_state(uuid,uuid,text,text) from public,anon;
grant execute on function public.kshms_project_sja_state(uuid,uuid,text,text) to authenticated;
notify pgrst,'reload schema';
