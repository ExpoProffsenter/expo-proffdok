-- Actual handover is a manager decision, independent from internal certification.
-- No checklist, deviation, activity or message is marked completed by this flow.
create table bolig_private.handover_states (
 root_id uuid not null references bolig_private.roots(id),scope_id uuid not null,revision bigint not null default 0,
 assessment jsonb,record jsonb,primary key(root_id,scope_id)
);
create table bolig_private.handover_events (
 id bigint generated always as identity primary key,root_id uuid not null,scope_id uuid not null,revision bigint not null,
 actor_id uuid not null references auth.users(id),actor_name text not null,created_at timestamptz not null default now(),
 action text not null,snapshot jsonb not null,unique(root_id,scope_id,revision),
 foreign key(root_id,scope_id) references bolig_private.handover_states(root_id,scope_id)
);
create index bolig_handover_actor on bolig_private.handover_events(actor_id);
alter table bolig_private.handover_states enable row level security;
alter table bolig_private.handover_events enable row level security;
revoke all on bolig_private.handover_states,bolig_private.handover_events from public,anon,authenticated,service_role;

-- Preserve the strict internal control calculation. Overlay only a separately
-- recorded actual handover; subsequent work never erases that historical fact.
alter function bolig_private.completion_tree(uuid,uuid) rename to completion_tree_before_manager_handover;
revoke all on function bolig_private.completion_tree_before_manager_handover(uuid,uuid) from public,anon,authenticated,service_role;
create function bolig_private.completion_tree(c uuid,root uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
#variable_conflict use_variable
declare tree jsonb;rows jsonb:='[]';r jsonb;s bolig_private.handover_states%rowtype;restricted bool;
begin
 tree:=bolig_private.completion_tree_before_manager_handover(c,root);
 for r in select value from jsonb_array_elements(tree->'rows') loop
  select * into s from bolig_private.handover_states where root_id=root and scope_id=(r->>'scope_id')::uuid;
  select exists(select 1 from jsonb_array_elements(tree->'rows') x where (x->>'scope_id'=r->>'scope_id' or x->>'parent_id'=r->>'scope_id' or r->>'scope_id'=root::text) and coalesce((x#>>'{source,restricted}')::boolean,false)) into restricted;
  if s.record is not null and not restricted then
   r:=r||jsonb_build_object('control_status',r->>'status','status',case when coalesce((s.record->>'case_count')::int,0)>0 then 'handed_over_with_rest' else 'handed_over' end,'handover',s.record,'manager_handover',true);
  end if;
  rows:=rows||jsonb_build_array(r);
 end loop;
 return tree||jsonb_build_object('rows',rows);
end$$;
revoke all on function bolig_private.completion_tree(uuid,uuid) from public,anon,authenticated,service_role;

-- Internal approval keeps its strict validation against its own control status.
do $patch$
declare body text;
begin
 body:=pg_get_functiondef('bolig_private.completion(uuid,uuid,uuid,text,bigint,jsonb)'::regprocedure);
 if position('tree:=bolig_private.completion_tree(c,root);ctx:=' in body)=0 then raise exception 'Missing internal completion anchor';end if;
 body:=replace(body,'tree:=bolig_private.completion_tree(c,root);ctx:=','tree:=bolig_private.completion_tree_before_manager_handover(c,root);ctx:=');
 body:=replace(body,' return tree||jsonb_build_object(', E' tree:=bolig_private.completion_tree(c,root);\n return tree||jsonb_build_object(');
 execute body;
end$patch$;

create function bolig_private.handover_cases(root uuid,scope uuid,tree jsonb) returns jsonb language plpgsql stable set search_path='' as $$
#variable_conflict use_variable
declare r jsonb;x jsonb;entry jsonb;cases jsonb:='[]';ids uuid[];restricted bool:=false;basis jsonb:='[]';n int;
begin
 select array_agg((node->>'scope_id')::uuid) into ids from jsonb_array_elements(tree->'rows') node
 where node->>'scope_id'=scope::text or node->>'parent_id'=scope::text or scope=root;
 if ids is null then raise exception 'Velg en aktiv bolig, et bygg eller prosjektet.' using errcode='42501';end if;
 for r in select value from jsonb_array_elements(tree->'rows') where (value->>'scope_id')::uuid=any(ids) order by value->>'scope_id' loop
  if coalesce((r#>>'{source,restricted}')::boolean,false) then restricted:=true;continue;end if;
  basis:=basis||jsonb_build_array(jsonb_build_object('scope',r->'scope_id','basis',r->'basis','revision',r->'revision'));
  for entry in select jsonb_build_object('category','Kontroll / avvik','title',value#>>'{}','critical',(value#>>'{}') like 'Kritisk%') from jsonb_array_elements(r->'issues')
   union all select jsonb_build_object('category','Påminnelse','title',value#>>'{}','critical',false) from jsonb_array_elements(coalesce(r->'warnings','[]'))
   union all select jsonb_build_object('category','Restpunkt','title',value->>'title','description',coalesce(value->>'comment',''),'critical',false,'source',value->>'source') from jsonb_array_elements(coalesce(r->'restpoints','[]')) where value->>'scope_id'=r->>'scope_id'
  loop
   x:=entry||jsonb_build_object('scope_id',r->'scope_id','scope_title',r->'title');
   cases:=cases||jsonb_build_array(x||jsonb_build_object('id',md5(x::text)));
  end loop;
  -- Missing internal approval is information, never a prerequisite for actual handover.
  if r->'approval'='null'::jsonb or r->>'control_status'='review' or (r->>'status'='review') then
   x:=jsonb_build_object('scope_id',r->'scope_id','scope_title',r->'title','category','Intern godkjenning','title','Intern sluttkontroll er ikke godkjent på gjeldende grunnlag.','critical',false);
   cases:=cases||jsonb_build_array(x||jsonb_build_object('id',md5(x::text)));
  end if;
 end loop;
 for entry in
  select jsonb_build_object('id','task:'||t.id,'scope_id',u.id,'scope_title',u.number,'category','Aktivitet','title',t.title,'description','Arbeidet er ikke registrert som utført.','critical',false) from bolig_private.progress_tasks t join bolig_private.units u on u.id=t.unit_id where t.root_id=root and t.unit_id=any(ids) and not t.archived and t.status<>'done'
  union all
  select jsonb_build_object('id','message:'||v.id,'scope_id',u.id,'scope_title',u.number,'category','Beboermelding','title','Ubehandlet beboermelding','description',to_char(v.created_at at time zone 'Europe/Oslo','DD.MM.YYYY HH24:MI'),'critical',false)
   from bolig_private.resident_events v join bolig_private.resident_portals p on p.id=v.portal_id join bolig_private.units u on u.id=p.unit_id
   where p.root_id=root and p.unit_id=any(ids) and p.contact_basis=md5(jsonb_build_array(u.contact_name,u.contact_email)::text) and v.contact_basis=p.contact_basis and v.kind='message' and v.sender='resident' and v.handled_at is null
 loop cases:=cases||jsonb_build_array(entry);end loop;
 select coalesce(jsonb_agg(node order by node->>'scope_title',node->>'category',node->>'title',node->>'id'),'[]') into cases from (select distinct value node from jsonb_array_elements(cases)) d;
 if jsonb_array_length(cases)>20000 then raise exception 'Velg et bygg eller en bolig for å gjennomgå denne listen.' using errcode='22023';end if;
 return jsonb_build_object('cases',case when restricted then '[]'::jsonb else cases end,'restricted',restricted,'basis',md5(jsonb_build_array(basis,cases)::text));
end$$;
revoke all on function bolig_private.handover_cases(uuid,uuid,jsonb) from public,anon,authenticated,service_role;

create function bolig_private.handover_review(c uuid,root uuid,scope uuid,action text,expected bigint,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare tree jsonb;ctx jsonb;row jsonb;source jsonb;s bolig_private.handover_states%rowtype;rev bigint;decisions jsonb:='[]';entry jsonb;decision jsonb;owner uuid;identity text;assessment jsonb;now_at timestamptz:=clock_timestamp();receipt bolig_private.progress_receipts%rowtype;rid uuid;fp text;result jsonb;
begin
 ctx:=bolig_private.context(c);
 if auth.uid() is null or coalesce((ctx->>'enabled')::boolean,false) is not true then raise exception 'Boligtilgang kreves.' using errcode='42501';end if;
 perform 1 from bolig_private.roots where id=root and company_id=c for update;
 if not found then raise exception 'Prosjektet er ikke tilgjengelig.' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtextextended('bolig-catalog:'||root::text,0));
 if action is null or action not in('get','assess','record') or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>4000000 then raise exception 'Ugyldig overtakelsesvurdering.' using errcode='22023';end if;
 tree:=bolig_private.completion_tree(c,root);
 select value into row from jsonb_array_elements(tree->'rows') where value->>'scope_id'=scope::text;
 if row is null then raise exception 'Arbeidsområdet er ikke tilgjengelig.' using errcode='42501';end if;
 source:=bolig_private.handover_cases(root,scope,tree);
 select * into s from bolig_private.handover_states where root_id=root and scope_id=scope;
 rev:=coalesce(s.revision,0);
 if action<>'get' then
  if ctx->>'role' is distinct from 'manager' or (tree->>'root_archived')::boolean or (source->>'restricted')::boolean then raise exception 'Prosjektleder og tilgang til hele vurderingsgrunnlaget kreves.' using errcode='42501';end if;
  rid:=(payload->>'request_id')::uuid;fp:=md5(jsonb_build_array('handover_review',scope,action,expected,payload)::text);
  if rid is null then raise exception 'Forsøksreferanse mangler.' using errcode='22023';end if;
  select * into receipt from bolig_private.progress_receipts where root_id=root and actor_id=auth.uid() and request_id=rid;
  if found then if receipt.fingerprint<>fp then raise exception 'Forsøket har annet innhold.' using errcode='PT409';end if;return receipt.result;end if;
  if expected is distinct from rev or payload->>'basis' is distinct from source->>'basis' then raise exception 'Åpne forhold er endret. Kladden beholdes. Hent siste oversikt og vurder endringene.' using errcode='PT409';end if;
  if jsonb_typeof(payload->'decisions') is distinct from 'array' or jsonb_array_length(payload->'decisions')>jsonb_array_length(source->'cases') or (action='record' and (jsonb_array_length(payload->'decisions')<>jsonb_array_length(source->'cases') or payload->'confirmed' is distinct from 'true'::jsonb)) then raise exception 'Vurder hvert åpent forhold og bekreft gjennomgangen før du registrerer overtakelse.' using errcode='22023';end if;
  if (select count(distinct x->>'id') from jsonb_array_elements(payload->'decisions') x)<>jsonb_array_length(payload->'decisions') or exists(select 1 from jsonb_array_elements(payload->'decisions') x where not exists(select 1 from jsonb_array_elements(source->'cases') node where node->>'id'=x->>'id')) then raise exception 'Hvert forhold skal vurderes én gang.' using errcode='22023';end if;
  for entry in select value from jsonb_array_elements(source->'cases') loop
   select value into decision from jsonb_array_elements(payload->'decisions') where value->>'id'=entry->>'id';
   if decision is null and action='assess' then continue;end if;
   if decision is null or coalesce(decision->>'decision','') not in('block','carry') or length(trim(coalesce(decision->>'reason',''))) not between 3 and 2000 then raise exception 'Velg hindrer overtakelse eller følges opp, med begrunnelse for hvert forhold.' using errcode='22023';end if;
   if entry->'critical'='true'::jsonb and (decision->'critical_confirmed' is distinct from 'true'::jsonb or length(trim(decision->>'reason'))<15) then raise exception 'Et kritisk forhold krever særskilt bekreftelse og en konkret begrunnelse på minst 15 tegn.' using errcode='22023';end if;
   owner:=(decision->>'owner_id')::uuid;
   if not bolig_private.progress_member(c,owner) or owner is null then raise exception 'Velg en aktiv intern oppfølgingsansvarlig.' using errcode='42501';end if;
   decisions:=decisions||jsonb_build_array(entry||jsonb_build_object('decision',decision->>'decision','reason',trim(decision->>'reason'),'owner_id',owner,'owner_name',(select coalesce(nullif(to_jsonb(p)->>'full_name',''),p.email) from public.profiles p where id=owner),'critical_confirmed',coalesce(decision->'critical_confirmed','false')));
  end loop;
  select coalesce(nullif(to_jsonb(p)->>'full_name',''),p.email) into identity from public.profiles p where id=auth.uid();
  assessment:=jsonb_build_object('basis',source->>'basis','decisions',decisions,'by',auth.uid(),'by_name',identity,'at',now_at,'complete',jsonb_array_length(decisions)=jsonb_array_length(source->'cases'));
  if action='record' then
   if exists(select 1 from jsonb_array_elements(decisions) x where x->>'decision'='block') then raise exception 'Et forhold er vurdert som til hinder for overtakelse. Lagre vurderingen eller avklar forholdet først.' using errcode='PT409';end if;
   if length(trim(coalesce(payload->>'reference',''))) not between 3 and 2000 or coalesce(payload->>'date','') !~ '^\d{4}-\d{2}-\d{2}$' or (payload->>'date')::date>(now_at at time zone 'Europe/Oslo')::date then raise exception 'Oppgi protokollreferanse og faktisk overtakelsesdato, senest i dag.' using errcode='22023';end if;
   if s.record is not null and length(trim(coalesce(payload->>'correction_reason',''))) not between 3 and 2000 then raise exception 'Begrunn rettingen av den tidligere registreringen.' using errcode='22023';end if;
  end if;
  insert into bolig_private.handover_states(root_id,scope_id) values(root,scope) on conflict do nothing;
  update bolig_private.handover_states set revision=rev+1,assessment=assessment,record=case when action='record' then jsonb_build_object('reference',trim(payload->>'reference'),'date',payload->>'date','by',auth.uid(),'by_name',identity,'at',now_at,'basis',source->>'basis','case_count',jsonb_array_length(decisions),'correction_reason',coalesce(payload->>'correction_reason',''),'manager_recorded',true) else record end where root_id=root and scope_id=scope returning * into s;
  insert into bolig_private.handover_events(root_id,scope_id,revision,actor_id,actor_name,action,snapshot) values(root,scope,s.revision,auth.uid(),identity,action,to_jsonb(s));
 end if;
 result:=jsonb_build_object('context',ctx,'root_id',root,'scope_id',scope,'revision',coalesce(s.revision,0),'basis',source->>'basis','cases',source->'cases','restricted',source->'restricted','root_archived',tree->'root_archived','assessment',case when (source->>'restricted')::boolean then null else s.assessment end,'record',case when (source->>'restricted')::boolean then null else s.record end,'members',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'name',coalesce(nullif(to_jsonb(p)->>'full_name',''),p.email)) order by p.email) from public.profiles p join public.sales_company_memberships m on m.user_id=p.id where m.company_id=c and bolig_private.progress_member(c,p.id)),'[]'),'history',case when (source->>'restricted')::boolean then '[]'::jsonb else coalesce((select jsonb_agg(to_jsonb(h) order by h.revision desc) from (select revision,actor_name,created_at,action,snapshot from bolig_private.handover_events where root_id=root and scope_id=scope order by revision desc limit 100) h),'[]') end);
 if action<>'get' then insert into bolig_private.progress_receipts(root_id,actor_id,request_id,fingerprint,result) values(root,auth.uid(),rid,fp,result);end if;
 return result;
end$$;
revoke all on function bolig_private.handover_review(uuid,uuid,uuid,text,bigint,jsonb) from public,anon,service_role;
grant execute on function bolig_private.handover_review(uuid,uuid,uuid,text,bigint,jsonb) to authenticated;
create function public.bolig_handover_review(p_company_id uuid,p_root_id uuid,p_scope_id uuid,p_action text default 'get',p_revision bigint default null,p_payload jsonb default '{}') returns jsonb language sql security invoker set search_path='' as $$select bolig_private.handover_review(p_company_id,p_root_id,p_scope_id,p_action,p_revision,p_payload)$$;
revoke all on function public.bolig_handover_review(uuid,uuid,uuid,text,bigint,jsonb) from public,anon,service_role;
grant execute on function public.bolig_handover_review(uuid,uuid,uuid,text,bigint,jsonb) to authenticated;

-- Include manager decisions in selected/descendant documentation, never in a
-- parent common section exported to one apartment (neighbour privacy).
alter function bolig_private.documentation_export(uuid,uuid,uuid) rename to documentation_export_before_handover_review;
revoke all on function bolig_private.documentation_export_before_handover_review(uuid,uuid,uuid) from public,anon,authenticated,service_role;
create function bolig_private.documentation_export(c uuid,root uuid,scope uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
#variable_conflict use_variable
declare result jsonb;scopes jsonb:='[]';entry jsonb;s bolig_private.handover_states%rowtype;history jsonb;
begin
 result:=bolig_private.documentation_export_before_handover_review(c,root,scope);
 for entry in select value from jsonb_array_elements(result->'scopes') loop
  if not (entry->>'common')::boolean then
   select * into s from bolig_private.handover_states where root_id=root and scope_id=(entry->>'id')::uuid;
   select coalesce(jsonb_agg(to_jsonb(h) order by revision),'[]') into history from (select revision,actor_name,created_at,action,snapshot from bolig_private.handover_events where root_id=root and scope_id=(entry->>'id')::uuid) h;
   entry:=entry||jsonb_build_object('handover_review',jsonb_build_object('assessment',s.assessment,'record',s.record,'history',history));
  end if;
  scopes:=scopes||jsonb_build_array(entry);
 end loop;
 result:=result||jsonb_build_object('scopes',scopes);
 if octet_length(result::text)>20000000 then raise exception 'Dokumentasjonen er stor. Last ned per bygg eller bolig.' using errcode='22023';end if;
 return result||jsonb_build_object('basis',md5((result-'basis')::text));
end$$;
revoke all on function bolig_private.documentation_export(uuid,uuid,uuid) from public,anon,service_role;
grant execute on function bolig_private.documentation_export(uuid,uuid,uuid) to authenticated;
notify pgrst,'reload schema';
