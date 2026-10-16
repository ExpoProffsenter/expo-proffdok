-- Read-only counts for Min side/Systemadmin, scoped through the existing gate.
create function public.support_overview(p_admin boolean default false) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare c uuid:=public.current_active_company_scope_id(); result jsonb;
begin
 perform support_private.check_actor(c,p_admin);
 select jsonb_build_object('user_id',auth.uid(),'company_id',c,'is_admin',p_admin,
 'total',count(*),'new',count(*) filter(where t.status='new'),
 'working',count(*) filter(where t.status='working'),'solved',count(*) filter(where t.status='solved'),
 'unread',count(*) filter(where exists(select 1 from support_private.messages m where m.ticket_id=t.id and
  case when p_admin then m.kind='user' and m.created_at>coalesce(t.admin_seen_at,'-infinity')
  else m.kind='support' and m.created_at>coalesce(t.owner_seen_at,'-infinity') end)),
 'latest_unread',(select tt.id from support_private.tickets tt where
  (p_admin or (tt.owner_id=auth.uid() and tt.company_id=c)) and exists(
   select 1 from support_private.messages mm where mm.ticket_id=tt.id and
   case when p_admin then mm.kind='user' and mm.created_at>coalesce(tt.admin_seen_at,'-infinity')
   else mm.kind='support' and mm.created_at>coalesce(tt.owner_seen_at,'-infinity') end)
  order by tt.updated_at desc,tt.id limit 1)) into result
 from support_private.tickets t where p_admin or (t.owner_id=auth.uid() and t.company_id=c);
 return result;
end; $$;
revoke all on function public.support_overview(boolean) from public,anon,service_role;
grant execute on function public.support_overview(boolean) to authenticated;

-- Preserve the existing pagination/status contract; add an unread filter.
create or replace function public.support_list(p_company_id uuid,p_admin boolean default false,p_offset integer default 0,p_status text default '') returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 perform support_private.check_actor(p_company_id,p_admin);
 if p_offset is null or p_offset<0 or p_offset>100000 or p_status is null or p_status not in ('','new','working','solved','unread')
 then raise exception 'Ugyldig side eller status.' using errcode='22023'; end if;
 return jsonb_build_object('items',coalesce((select jsonb_agg(s.value order by s.updated_at desc,s.id) from
 (select support_private.ticket_json(t,p_admin) value,t.updated_at,t.id from support_private.tickets t
 where (p_admin or (t.company_id=p_company_id and t.owner_id=auth.uid()))
 and (p_status='' or t.status=p_status or (p_status='unread' and (support_private.ticket_json(t,p_admin)->>'unread')::boolean))
 order by t.updated_at desc,t.id limit 40 offset p_offset) s),'[]'::jsonb),
 'total',(select count(*) from support_private.tickets t where
 (p_admin or (t.company_id=p_company_id and t.owner_id=auth.uid()))
 and (p_status='' or t.status=p_status or (p_status='unread' and (support_private.ticket_json(t,p_admin)->>'unread')::boolean))));
end; $$;
revoke all on function public.support_list(uuid,boolean,integer,text) from public,anon,service_role;
grant execute on function public.support_list(uuid,boolean,integer,text) to authenticated;
