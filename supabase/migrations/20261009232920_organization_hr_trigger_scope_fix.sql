-- Preserve existing HR-only register behavior. Organization loop checking applies only after this company builds its chart.
create or replace function org_private.on_hr_leader() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if tg_op='INSERT' and exists(select 1 from org_private.placements where company_id=new.company_id and user_id=new.user_id and leader_id is distinct from new.leader_id)
 then raise exception 'Velg samme nærmeste leder som organisasjonskartet ved HR-registrering.' using errcode='22023';end if;
 if new.leader_id is not null
 and exists(select 1 from org_private.settings where company_id=new.company_id)
 and exists(with recursive managers as (
  select new.leader_id id,array[new.leader_id] path
  union all select case when h.id is not null then h.leader_id else o.leader_id end,
   p.path||case when h.id is not null then h.leader_id else o.leader_id end from managers p
   left join hr_private.employees h on h.company_id=new.company_id and h.user_id=p.id
   left join org_private.placements o on o.company_id=new.company_id and o.user_id=p.id
   where (case when h.id is not null then h.leader_id else o.leader_id end)=any(p.path) is not true
   and case when h.id is not null then h.leader_id else o.leader_id end is not null
 )select 1 from managers where id=new.user_id)
 then raise exception 'Lederlinjen kan ikke gå i ring.' using errcode='22023';end if;
 if tg_op='UPDATE' and new.leader_id is distinct from old.leader_id then
  update org_private.placements set leader_id=new.leader_id where company_id=new.company_id and user_id=new.user_id;
  if exists(select 1 from org_private.settings where company_id=new.company_id) then
   update org_private.settings set revision=revision+1 where company_id=new.company_id;
  end if;
 end if;
 return new;
end$$;
