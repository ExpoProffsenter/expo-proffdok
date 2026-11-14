-- Editable project identity, using the existing firm/role/revision boundaries.
alter function bolig_private.workspace(uuid,text,uuid,bigint,jsonb) rename to workspace_before_project_info;
create function bolig_private.workspace(c uuid,action text,root uuid,expected bigint,payload jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare ctx jsonb; r bolig_private.roots%rowtype;
begin
 if action <> 'project_info' then
  return bolig_private.workspace_before_project_info(c,action,root,expected,payload);
 end if;
 ctx:=bolig_private.context(c);
 if auth.uid() is null or not coalesce((ctx->>'enabled')::boolean,false) or ctx->>'role' is distinct from 'manager' then
  raise exception 'Prosjektledertilgang i aktivt firma kreves.' using errcode='42501';
 end if;
 select * into r from bolig_private.roots where id=root and company_id=c for update;
 if not found then raise exception 'Prosjektet er ikke tilgjengelig i aktivt firma.' using errcode='42501';end if;
 if r.archived then raise exception 'Gjenopprett prosjektet før du redigerer.' using errcode='22023';end if;
 if expected is distinct from r.revision then raise exception 'Prosjektinfo er endret. Hent siste versjon og se over kladden.' using errcode='PT409';end if;
 if jsonb_typeof(payload) is distinct from 'object'
 or jsonb_typeof(payload->'title') is distinct from 'string'
 or length(trim(payload->>'title')) not between 1 and 160
 or jsonb_typeof(payload->'reference') is distinct from 'string'
 or length(trim(payload->>'reference'))>80 then
  raise exception 'Fyll inn prosjektnavn og et prosjektnummer på maksimalt 80 tegn.' using errcode='22023';
 end if;
 update bolig_private.roots set title=trim(payload->>'title'),reference=trim(payload->>'reference'),revision=revision+1,updated_at=now() where id=root returning * into r;
 insert into bolig_private.audit(company_id,root_id,actor_id,action,entity_id,revision) values(c,root,auth.uid(),'project_info',root,r.revision);
 return bolig_private.workspace_before_project_info(c,'get',root,null,'{}');
end$$;
revoke all on function bolig_private.workspace(uuid,text,uuid,bigint,jsonb) from public,anon,service_role;
grant execute on function bolig_private.workspace(uuid,text,uuid,bigint,jsonb) to authenticated;
notify pgrst,'reload schema';
