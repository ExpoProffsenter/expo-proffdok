-- Qualify version columns; a regression found the template_id variable collision.
create or replace function public.kshms_checklist_command(p_company_id uuid,p_action text,p_request_id uuid,p_payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb; t public.kshms_checklist_templates%rowtype; v public.kshms_checklist_versions%rowtype; receipt public.kshms_checklist_commands%rowtype;
 content jsonb; content_hash text; payload_hash text; template_id uuid; result jsonb;
begin
 x:=kshms_private.require_context(p_company_id,true,p_action='publish');
 perform 1 from public.company_module_access where company_id=p_company_id and module_key='kshms' for update;
 x:=kshms_private.require_context(p_company_id,true,p_action='publish');
 if p_request_id is null or p_action not in ('save','publish','archive') or jsonb_typeof(p_payload) is distinct from 'object' then raise exception 'Invalid checklist command'; end if;
 payload_hash:=encode(sha256(convert_to(p_action||p_payload::text,'UTF8')),'hex');
 select * into receipt from public.kshms_checklist_commands where company_id=p_company_id and request_id=p_request_id;
 if found then
  if receipt.actor_id<>auth.uid() or receipt.payload_hash<>payload_hash then raise exception 'Request reused with different content' using errcode='40001'; end if;
  return receipt.result;
 end if;
 template_id:=(p_payload->>'id')::uuid;
 if template_id is null then raise exception 'Missing checklist id'; end if;
 select * into t from public.kshms_checklist_templates where id=template_id and company_id=p_company_id for update;
 if not found then
  if p_action='archive' or coalesce((p_payload->>'revision')::bigint,-1)<>0 then raise exception 'Sjekklisten er endret. Oppdater og sammenlign teksten.' using errcode='40001'; end if;
  content:=kshms_private.checklist_content(p_payload->'content');
  insert into public.kshms_checklist_templates(id,company_id,draft,created_by,updated_by) values(template_id,p_company_id,content,auth.uid(),auth.uid()) returning * into t;
 else
  if t.archived or t.revision<>coalesce((p_payload->>'revision')::bigint,-1) then raise exception 'Sjekklisten er endret eller arkivert. Oppdater og sammenlign teksten.' using errcode='40001'; end if;
  if p_action='archive' then
   update public.kshms_checklist_templates set archived=true,revision=revision+1,updated_by=auth.uid(),updated_at=now() where id=t.id returning * into t;
  else
   content:=kshms_private.checklist_content(p_payload->'content');
   update public.kshms_checklist_templates set draft=content,revision=revision+1,updated_by=auth.uid(),updated_at=now() where id=t.id returning * into t;
  end if;
 end if;
 if p_action='publish' then
  content_hash:=encode(sha256(convert_to(content::text,'UTF8')),'hex');
  select * into v from public.kshms_checklist_versions cv where cv.company_id=p_company_id and cv.template_id=t.id order by cv.number desc limit 1;
  if v.id is null or v.content_hash<>content_hash then
   insert into public.kshms_checklist_versions(company_id,template_id,number,content,content_hash,published_by,published_identity)
   values(p_company_id,t.id,coalesce(v.number,0)+1,content,content_hash,auth.uid(),kshms_private.identity_snapshot(auth.uid())) returning * into v;
  end if;
 end if;
 result:=jsonb_build_object('template',to_jsonb(t),'version',case when v.id is null then null else to_jsonb(v) end);
 insert into public.kshms_checklist_commands(company_id,request_id,actor_id,payload_hash,result) values(p_company_id,p_request_id,auth.uid(),payload_hash,result);
 insert into public.kshms_audit(company_id,actor_id,action,object_id) values(p_company_id,auth.uid(),'checklist-'||p_action,t.id);
 return result;
end $$;
