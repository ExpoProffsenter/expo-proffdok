-- Invitation withdrawal and durable per-recipient send history. No automatic email.
create schema company_invitation_private;
revoke all on schema company_invitation_private from public,anon,service_role;
grant usage on schema company_invitation_private to authenticated;
create table company_invitation_private.deliveries (
 id uuid primary key, invite_id uuid not null references public.company_user_invites(id),
 company_id uuid not null references public.sales_company_scopes(id), actor_id uuid not null,
 fingerprint text not null, status text not null check(status in ('sending','confirmed','uncertain')),
 started_at timestamptz not null default clock_timestamp(), finished_at timestamptz
);
create index on company_invitation_private.deliveries(invite_id,started_at desc);
alter table company_invitation_private.deliveries enable row level security;
revoke all on company_invitation_private.deliveries from public,anon,authenticated,service_role;
create function company_invitation_private.manage(c uuid, invitation uuid, action text, payload jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare i public.company_user_invites%rowtype; fp text; rid uuid; prior company_invitation_private.deliveries%rowtype;
begin
 perform company_admin_private.require_manager(c);
 select ci.* into i from public.company_user_invites ci join public.sales_company_scopes s
 on s.normalized_name=public.sales_normalize_company_name(ci.company_name)
 where ci.id=invitation and s.id=c for update of ci;
 if i.id is null then raise exception 'Invitasjonen finnes ikke i valgt firma.' using errcode='42501';end if;
 fp:=md5(jsonb_build_array(i.email,i.company_name,i.company_role,i.invited_by,i.created_at)::text);
 if payload->>'fingerprint' is distinct from fp then raise exception 'Invitasjonen er endret. Oppdater oversikten.' using errcode='PT409';end if;
 if action='withdraw' then
  if coalesce(i.accepted,false) or i.status='accepted' then raise exception 'Brukeren har allerede registrert seg. Administrer brukeren i brukerlisten.' using errcode='PT409';end if;
  if i.status='revoked' then return jsonb_build_object('withdrawn',true);end if;
  if i.status not in ('pending','active') then raise exception 'Invitasjonen er ikke aktiv.' using errcode='PT409';end if;
  update public.company_user_invites set status='revoked' where id=i.id;
  return jsonb_build_object('withdrawn',true);
 end if;
 rid:=(payload->>'request_id')::uuid;
 if rid is null then raise exception 'Forsøksreferanse mangler.' using errcode='22023';end if;
 if action='begin' then
  perform public.company_admin_resend_invite(c,i.id);
  if exists(select 1 from company_invitation_private.deliveries d where d.invite_id=i.id and d.status='sending' and d.started_at>clock_timestamp()-interval '5 minutes') then
   raise exception 'En utsending pågår eller har uavklart resultat. Vent fem minutter og kontroller før nytt forsøk.' using errcode='PT409';end if;
  if exists(select 1 from company_invitation_private.deliveries where id=rid) then raise exception 'Dette sendeforsøket er allerede brukt. Kontroller sendestatus.' using errcode='PT409';end if;
  update company_invitation_private.deliveries set status='uncertain',finished_at=clock_timestamp() where invite_id=i.id and status='sending';
  insert into company_invitation_private.deliveries(id,invite_id,company_id,actor_id,fingerprint,status) values(rid,i.id,c,auth.uid(),fp,'sending');
 elsif action in ('confirmed','uncertain') then
  select * into prior from company_invitation_private.deliveries where id=rid for update;
  if prior.id is null or prior.invite_id<>i.id or prior.company_id<>c or prior.actor_id<>auth.uid() or prior.fingerprint<>fp then raise exception 'Utsendingen tilhører ikke denne handlingen.' using errcode='42501';end if;
  if prior.status='sending' then update company_invitation_private.deliveries set status=action,finished_at=clock_timestamp() where id=rid;end if;
 else raise exception 'Ukjent handling.' using errcode='22023';end if;
 return jsonb_build_object('request_id',rid,'company_id',c,'invitation_id',i.id);
end$$;
revoke all on function company_invitation_private.manage(uuid,uuid,text,jsonb) from public,anon,service_role;
grant execute on function company_invitation_private.manage(uuid,uuid,text,jsonb) to authenticated;
create function public.company_admin_manage_invitation(p_company_id uuid,p_invite_id uuid,p_action text,p_payload jsonb default '{}')
returns jsonb language sql security invoker set search_path='' as $$select company_invitation_private.manage(p_company_id,p_invite_id,p_action,p_payload)$$;
revoke all on function public.company_admin_manage_invitation(uuid,uuid,text,jsonb) from public,anon,service_role;
grant execute on function public.company_admin_manage_invitation(uuid,uuid,text,jsonb) to authenticated;
-- Keep current admin/user/access projection, add only invitation metadata.
alter function public.company_admin_snapshot(uuid) rename to company_admin_snapshot_before_invitation_management;
revoke all on function public.company_admin_snapshot_before_invitation_management(uuid) from public,anon,authenticated,service_role;
create function company_invitation_private.snapshot(c uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 c:=coalesce(c,public.current_active_company_scope_id());perform company_admin_private.require_manager(c);
 result:=public.company_admin_snapshot_before_invitation_management(c);
 return result||jsonb_build_object('invitation_management',true,'invites',coalesce((
 select jsonb_agg(item||jsonb_build_object('fingerprint',md5(jsonb_build_array(i.email,i.company_name,i.company_role,i.invited_by,i.created_at)::text),
 'last_sent_at',(select max(d.finished_at) from company_invitation_private.deliveries d where d.invite_id=i.id and d.status='confirmed'),
 'send_count',(select count(*) from company_invitation_private.deliveries d where d.invite_id=i.id and d.status='confirmed'),
 'last_send_status',(select d.status from company_invitation_private.deliveries d where d.invite_id=i.id order by d.started_at desc limit 1)))
 from jsonb_array_elements(result->'invites') item join public.company_user_invites i on i.id=(item->>'id')::uuid where not coalesce(i.accepted,false)
 ),'[]'::jsonb));
end$$;
revoke all on function company_invitation_private.snapshot(uuid) from public,anon,service_role;
grant execute on function company_invitation_private.snapshot(uuid) to authenticated;
create function public.company_admin_snapshot(p_company_id uuid default null) returns jsonb language sql security invoker set search_path='' as $$select company_invitation_private.snapshot(p_company_id)$$;
revoke all on function public.company_admin_snapshot(uuid) from public,anon,service_role;
grant execute on function public.company_admin_snapshot(uuid) to authenticated;
notify pgrst,'reload schema';
