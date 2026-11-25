-- Named staff assignments, independent of bearer partner links and firm switching.
create table bolig_private.shop_staff_access (
 id uuid primary key default gen_random_uuid(),root_id uuid not null references bolig_private.roots(id),
 user_id uuid not null references auth.users(id),enabled boolean not null default true,
 expires_at timestamptz not null,revision bigint not null default 1,
 created_by uuid not null references auth.users(id),created_at timestamptz not null default now(),
 unique(root_id,user_id)
);
alter table bolig_private.shop_staff_access enable row level security;
revoke all on bolig_private.shop_staff_access from public,anon,authenticated,service_role;
create index shop_staff_user on bolig_private.shop_staff_access(user_id);

create function bolig_private.shop_staff_eligible(u uuid) returns boolean language sql stable set search_path='' as $$
 select exists(select 1 from public.profiles p join auth.users a on a.id=p.id
 where p.id=u and p.approved and not coalesce(p.deactivated,false)
 and exists(select 1 from public.sales_company_memberships m where m.user_id=p.id
 and m.workspace_role in ('ansatt','firmaadmin') and public.is_internal_work_profile_company(m.company_id)))
$$;
revoke all on function bolig_private.shop_staff_eligible(uuid) from public,anon,authenticated,service_role;

alter function bolig_private.commerce_collaborator(uuid,uuid,text) rename to commerce_partner_collaborator;
create function bolig_private.commerce_collaborator(c uuid,root uuid,permission text default 'read') returns boolean
language sql stable set search_path='' as $$
 select bolig_private.commerce_partner_collaborator(c,root,permission) or (
 permission in ('read','edit_choices','publish_shop') and bolig_private.shop_staff_eligible(auth.uid()) and exists(
 select 1 from bolig_private.shop_staff_access g join bolig_private.roots r on r.id=g.root_id
 join bolig_private.firms f on f.company_id=r.company_id
 where g.user_id=auth.uid() and g.root_id=root and r.company_id=c and g.enabled and g.expires_at>clock_timestamp()
 and not r.archived and f.enabled))
$$;
revoke all on function bolig_private.commerce_collaborator(uuid,uuid,text) from public,anon,authenticated,service_role;

-- Legacy editor can only revoke. New assignments use the explicit admin action.
alter function bolig_private.partner_commerce_manage(uuid,uuid,uuid,text,bigint,jsonb) rename to partner_commerce_manage_legacy;
revoke all on function bolig_private.partner_commerce_manage_legacy(uuid,uuid,uuid,text,bigint,jsonb) from public,anon,authenticated,service_role;
create function bolig_private.partner_commerce_manage(c uuid,root uuid,access uuid,action text,expected bigint,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 if action='save' and (payload->'enabled' is distinct from 'false'::jsonb or payload->'edit_choices' is distinct from 'false'::jsonb or payload->'edit_catalog' is distinct from 'false'::jsonb or coalesce(payload->'publish_shop','false')<>'false'::jsonb) then
 raise exception 'Nye butikktilganger tildeles av systemadmin under Butikktilgang.' using errcode='42501';end if;
 return bolig_private.partner_commerce_manage_legacy(c,root,access,action,expected,payload);
end$$;
revoke all on function bolig_private.partner_commerce_manage(uuid,uuid,uuid,text,bigint,jsonb) from public,anon,service_role;
grant execute on function bolig_private.partner_commerce_manage(uuid,uuid,uuid,text,bigint,jsonb) to authenticated;

create function bolig_private.shop_staff_manage(c uuid,root uuid,action text,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare ctx jsonb; real_actor uuid:=auth.uid(); sid uuid; can_assign boolean; target uuid; email text;
 g bolig_private.shop_staff_access%rowtype; rid uuid; fp bytea; prior bolig_private.partner_receipts%rowtype;
 result jsonb; candidate jsonb; actor_key text; rows jsonb; expected bigint; days int;
begin
 if auth.uid() is null then raise exception 'Logg inn.' using errcode='42501';end if;
 ctx:=bolig_private.context(c);
 if ctx->>'role' is distinct from 'manager' or not coalesce((ctx->>'enabled')::boolean,false)
 or not exists(select 1 from bolig_private.roots where id=root and company_id=c and not archived) then
 raise exception 'Prosjektet er ikke tilgjengelig.' using errcode='42501';end if;
 if nullif(current_setting('app.support.session_id',true),'') is not null then
 -- The existing validated transport supplies the real administrator. Never trust payload actor IDs.
 select s.actor_id,s.id into real_actor,sid from app_support_private.request_session() s where s.company_id=c;
 if real_actor is null then raise exception 'Supportøkten gjelder et annet firma.' using errcode='42501';end if;
 end if;
 can_assign:=exists(select 1 from public.profiles where id=real_actor and approved and not coalesce(deactivated,false) and system_role='systemadmin');
 if action is null or action not in ('list','lookup','assign','revoke') or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>3000 then raise exception 'Ugyldig butikktilgang.' using errcode='22023';end if;
 if action in ('lookup','assign') and not can_assign then raise exception 'Kun systemadmin kan tildele butikkansatte.' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtextextended('bolig-shop-staff:'||root::text,0));
 if action in ('lookup','assign') then
 email:=lower(trim(payload->>'email'));
 if email is null or length(email) not between 3 and 254 or position('@' in email)=0 then raise exception 'Oppgi en gyldig e-postadresse.' using errcode='22023';end if;
 select u.id into target from auth.users u where lower(u.email)=email and bolig_private.shop_staff_eligible(u.id);
 if target is not null then
 select jsonb_build_object('id',target,'email',u.email,'companies',(
 select string_agg(distinct s.display_name,', ' order by s.display_name) from public.sales_company_memberships m join public.sales_company_scopes s on s.id=m.company_id
 where m.user_id=target and m.workspace_role in ('ansatt','firmaadmin') and public.is_internal_work_profile_company(m.company_id))) into candidate from auth.users u where u.id=target;
 select * into g from bolig_private.shop_staff_access where root_id=root and user_id=target;
 candidate:=candidate||jsonb_build_object('revision',coalesce(g.revision,0));
 end if;
 end if;
 if action in ('assign','revoke') then
 rid:=(payload->>'request_id')::uuid;expected:=(payload->>'revision')::bigint;
 if rid is null or expected is null then raise exception 'Lagringsreferanse mangler. Hent siste status.' using errcode='22023';end if;
 if action='assign' and (target is null or target is distinct from (payload->>'user_id')::uuid or payload->'reviewed' is distinct from 'true'::jsonb) then raise exception 'Velg og kontroller en godkjent ansatt først.' using errcode='22023';end if;
 actor_key:='shop-staff/'||real_actor::text;
 fp:=sha256(convert_to(jsonb_build_array(action,payload)::text,'UTF8'));
 select * into prior from bolig_private.partner_receipts where root_id=root and actor=actor_key and request_id=rid;
 if found then
 if prior.fingerprint<>fp then raise exception 'Referansen gjelder en annen handling.' using errcode='PT409';end if;
 return prior.result||jsonb_build_object('replayed',true);end if;
 if action='assign' then
 days:=(payload->>'days')::int;
 if days is null or days not in (30,90,365) then raise exception 'Velg gyldighet.' using errcode='22023';end if;
 if expected is distinct from coalesce(g.revision,0) then raise exception 'Tilgangen er endret. Kontroller den ansatte på nytt.' using errcode='PT409';end if;
 insert into bolig_private.shop_staff_access(root_id,user_id,expires_at,created_by) values(root,target,clock_timestamp()+make_interval(days=>days),real_actor)
 on conflict(root_id,user_id) do update set enabled=true,expires_at=excluded.expires_at,revision=shop_staff_access.revision+1 returning * into g;
 else
 select * into g from bolig_private.shop_staff_access where id=(payload->>'id')::uuid and root_id=root;
 if g.id is null then raise exception 'Tilgangen finnes ikke i prosjektet.' using errcode='42501';end if;
 if expected<>g.revision then raise exception 'Tilgangen er endret. Hent siste status.' using errcode='PT409';end if;
 update bolig_private.shop_staff_access set enabled=false,revision=revision+1 where id=g.id returning * into g;
 end if;
 insert into bolig_private.audit(company_id,root_id,actor_id,action,entity_id,revision) values(c,root,real_actor,'shop_staff_'||action,g.id,g.revision);
 if sid is not null then
 insert into app_support_private.audit(session_id,actor_id,target_user_id,company_id,action,resource,after_value)
 values(sid,real_actor,auth.uid(),c,'shop_staff_'||action,'bolig_private.shop_staff_access',jsonb_build_object('root_id',root,'id',g.id,'user_id',g.user_id,'enabled',g.enabled,'revision',g.revision));
 end if;
 end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',s.id,'email',u.email,'enabled',s.enabled,'active',s.enabled and s.expires_at>clock_timestamp() and bolig_private.shop_staff_eligible(s.user_id),'expires_at',s.expires_at,'revision',s.revision) order by s.enabled desc,lower(u.email)),'[]') into rows
 from bolig_private.shop_staff_access s join auth.users u on u.id=s.user_id where s.root_id=root;
 result:=jsonb_build_object('context',ctx,'root_id',root,'can_assign',can_assign,'actor_id',real_actor,'support',sid is not null,'staff',rows,'candidate',candidate);
 if action in ('assign','revoke') then insert into bolig_private.partner_receipts values(root,actor_key,rid,fp,result);end if;
 return result;
end$$;
revoke all on function bolig_private.shop_staff_manage(uuid,uuid,text,jsonb) from public,anon,service_role;
grant execute on function bolig_private.shop_staff_manage(uuid,uuid,text,jsonb) to authenticated;
create function public.bolig_shop_staff(p_company_id uuid,p_root_id uuid,p_action text default 'list',p_payload jsonb default '{}') returns jsonb
language sql security invoker set search_path='' as $$select bolig_private.shop_staff_manage(p_company_id,p_root_id,p_action,p_payload)$$;
revoke all on function public.bolig_shop_staff(uuid,uuid,text,jsonb) from public,anon,service_role;
grant execute on function public.bolig_shop_staff(uuid,uuid,text,jsonb) to authenticated;
notify pgrst,'reload schema';
