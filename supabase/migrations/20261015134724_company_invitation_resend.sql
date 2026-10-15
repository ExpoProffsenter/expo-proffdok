-- Read the original pending invitation without rewriting it or its access choices.
create function public.company_admin_resend_invite(p_company_id uuid,p_invite_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare i public.company_user_invites%rowtype;
begin
 perform company_admin_private.require_manager(p_company_id);
 select ci.* into i from public.company_user_invites ci
 join public.sales_company_scopes s on s.normalized_name=public.sales_normalize_company_name(ci.company_name)
 where ci.id=p_invite_id and s.id=p_company_id
   and ci.status in ('pending','active') and not coalesce(ci.accepted,false);
 if i.id is null then
  raise exception 'Invitasjonen er allerede brukt eller er ikke lenger tilgjengelig. Oppdater firmaoversikten.' using errcode='42501';
 end if;
 if exists(select 1 from public.profiles p where lower(trim(p.email))=lower(trim(i.email)) and coalesce(p.deactivated,false)) then
  raise exception 'Kontoen er deaktivert. Systemadministrator må behandle brukeren.' using errcode='42501';
 end if;
 return jsonb_build_object('invitation_id',i.id,'company_id',p_company_id,'email',i.email,
  'invite_company_name',i.company_name,'accepted',false);
end $$;
revoke all on function public.company_admin_resend_invite(uuid,uuid) from public,anon,service_role;
grant execute on function public.company_admin_resend_invite(uuid,uuid) to authenticated;
