-- Disambiguate local employee ID from table column in live command. ACL unchanged.
create or replace function public.hr_employee_command(p_company_id uuid,p_action text,p_payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare x jsonb; e hr_private.employees%rowtype; d hr_private.closed_employments%rowtype;
 employee_target uuid; u uuid; leader uuid; rev integer; reader uuid; keys text[];
begin
 -- All H1 mutations are firmadmin-only and serialize at the firm boundary.
 perform 1 from hr_private.firms where company_id=p_company_id for update;
 x:=hr_private.require_context(p_company_id,true);
 if p_action not in ('create','leader','reader','revoke_reader','end') or p_action is null or jsonb_typeof(p_payload) is distinct from 'object' then raise exception 'Ugyldig HR-handling.' using errcode='22023'; end if;
 keys:=case p_action when 'create' then array['user_id','leader_id'] when 'leader' then array['id','revision','leader_id','clear_old_leader_reader'] when 'reader' then array['id','revision','reader_id','reason'] when 'revoke_reader' then array['id','revision','reader_id'] else array['id','revision','confirm'] end;
 if exists(select 1 from jsonb_object_keys(p_payload) k where not k=any(keys)) then raise exception 'Innhold eller ukjente felt kan ikke lagres i HR-fundamentet.' using errcode='22023'; end if;
 if p_action='create' then
  u:=(p_payload->>'user_id')::uuid; leader:=(p_payload->>'leader_id')::uuid;
  if not hr_private.active_member(p_company_id,u) or (leader is not null and (leader=u or not hr_private.active_member(p_company_id,leader))) then raise exception 'Velg aktive interne brukere i samme firma.' using errcode='42501'; end if;
  insert into hr_private.employees(company_id,user_id,leader_id) values(p_company_id,u,leader) returning * into e;
 else
  employee_target:=(p_payload->>'id')::uuid; rev:=(p_payload->>'revision')::integer;
  select * into e from hr_private.employees where company_id=p_company_id and employees.id=employee_target for update;
  if e.id is null then
   -- Idempotent acknowledgement after a lost closure response, no resurrection.
   select * into d from hr_private.closed_employments where company_id=p_company_id and employee_id=employee_target;
   if p_action='end' and d.employee_id is not null and rev=d.previous_revision and p_payload->>'confirm'='END_AND_DELETE' then
    return jsonb_build_object('context',x,'deleted',true,'receipt_id',d.employee_id,'deleted_at',d.deleted_at);
   end if;
   raise exception 'HR-medarbeideren er ikke tilgjengelig.' using errcode='42501';
  end if;
  if rev is distinct from e.revision then raise exception 'HR-registeret er endret. Hent på nytt.' using errcode='40001'; end if;
  if p_action='leader' then
   leader:=(p_payload->>'leader_id')::uuid;
   if leader is not null and (leader=e.user_id or not hr_private.active_member(p_company_id,leader)) then raise exception 'Velg en aktiv leder i samme firma.' using errcode='42501'; end if;
   if leader is distinct from e.leader_id and exists(select 1 from hr_private.readers where employee_id=e.id and user_id=e.leader_id) then
    if p_payload->>'clear_old_leader_reader' is distinct from 'true' then raise exception 'Tidligere leder har ekstra lesetilgang. Fjern den uttrykkelig før lederbyttet.' using errcode='22023'; end if;
    delete from hr_private.readers where employee_id=e.id and user_id=e.leader_id;
   end if;
   update hr_private.employees set leader_id=leader,revision=revision+1 where employees.id=e.id returning * into e;
  elsif p_action in ('reader','revoke_reader') then
   reader:=(p_payload->>'reader_id')::uuid;
   if reader is null or reader=e.user_id then raise exception 'Velg en annen aktiv leser.' using errcode='22023'; end if;
   if p_action='reader' then
    if not hr_private.active_member(p_company_id,reader) then raise exception 'Leser er ikke aktiv i samme firma.' using errcode='42501'; end if;
    insert into hr_private.readers(company_id,employee_id,user_id,granted_by,reason) values(p_company_id,e.id,reader,auth.uid(),p_payload->>'reason')
    on conflict(employee_id,user_id) do update set granted_by=excluded.granted_by,granted_at=now(),reason=excluded.reason;
   else delete from hr_private.readers where employee_id=e.id and user_id=reader; end if;
   update hr_private.employees set revision=revision+1 where employees.id=e.id returning * into e;
  elsif p_action='end' then
   if p_payload->>'confirm' is distinct from 'END_AND_DELETE' then raise exception 'Bekreft avslutning og sletting uttrykkelig.' using errcode='22023'; end if;
   insert into hr_private.closed_employments(employee_id,company_id,user_id,previous_revision) values(e.id,p_company_id,e.user_id,e.revision) returning * into d;
   -- Remove the departing person's explicit grants and leader assignments elsewhere.
   update hr_private.employees o set revision=o.revision+1,leader_id=case when o.leader_id=e.user_id then null else o.leader_id end
    where o.company_id=p_company_id and o.id<>e.id and (o.leader_id=e.user_id or exists(select 1 from hr_private.readers r where r.employee_id=o.id and r.user_id=e.user_id));
   delete from hr_private.readers where company_id=p_company_id and user_id=e.user_id;
   delete from hr_private.employees where employees.id=e.id; -- cascades all readers/reasons
   return jsonb_build_object('context',x,'deleted',true,'receipt_id',d.employee_id,'deleted_at',d.deleted_at);
  end if;
 end if;
 return jsonb_build_object('context',x,'employee',hr_private.employee_json(e),'content_enabled',false);
end $$;
