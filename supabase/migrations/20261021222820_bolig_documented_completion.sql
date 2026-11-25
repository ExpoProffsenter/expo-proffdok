-- Documented completion is separate from goods delivery and legal acceptance.
-- Existing project/checklist data is read through its original access checks.
create table bolig_private.completion_states (
 root_id uuid not null references bolig_private.roots(id),scope_id uuid not null,
 kind text not null check(kind in ('unit','block','project')),
 revision bigint not null default 0,owner_id uuid references auth.users(id),
 items jsonb not null default '[]',approval jsonb,handover jsonb,
 primary key(root_id,scope_id)
);
create index bolig_completion_owner on bolig_private.completion_states(owner_id);
create table bolig_private.completion_events (
 id bigint generated always as identity primary key,
 root_id uuid not null,scope_id uuid not null,revision bigint not null,
 action text not null,actor_id uuid not null references auth.users(id),
 actor_name text not null,created_at timestamptz not null default clock_timestamp(),
 snapshot jsonb not null,reason text not null default '',
 foreign key(root_id,scope_id) references bolig_private.completion_states(root_id,scope_id),
 unique(root_id,scope_id,revision)
);
create index bolig_completion_events_actor on bolig_private.completion_events(actor_id);
alter table bolig_private.completion_states enable row level security;
alter table bolig_private.completion_events enable row level security;
revoke all on bolig_private.completion_states,bolig_private.completion_events from public,anon,authenticated,service_role;

create function bolig_private.completion_source(c uuid,root uuid,unit uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
#variable_conflict use_variable
declare u bolig_private.units%rowtype;p public.projects%rowtype;src jsonb:='{}';checks jsonb;latest jsonb;issues jsonb:='[]';n int;
begin
 select * into u from bolig_private.units where id=unit and root_id=root;
 src:=jsonb_build_object('unit',to_jsonb(u),
  'choices',(select max(revision) from bolig_private.choice_versions where unit_id=unit),
  'rooms',(select revision from bolig_private.room_states where unit_id=unit),
  'orders',(select coalesce(jsonb_agg(jsonb_build_object('id',o.id,'status',o.status,'received',o.received,'choice',o.source_choice_revision) order by o.id),'[]') from bolig_private.purchase_orders o where o.unit_id=unit and o.root_id=root));
 if u.project_id is not null then
  select * into p from public.projects where id=u.project_id and company_scope_id=c;
  if p.id is null or not public.current_user_has_module_access('projects') or not public.project_row_access_allowed(p.company_scope_id,p.user_id) then
   return jsonb_build_object('basis','restricted','issues',jsonb_build_array('Prosjekttilgang kreves for å kontrollere koblet dokumentasjon.'),'restricted',true);
  end if;
  begin
   checks:=public.project_checklist_state(c,u.project_id);
  exception when insufficient_privilege then
   return jsonb_build_object('basis','restricted','issues',jsonb_build_array('Prosjekttilgang kreves for å kontrollere koblet dokumentasjon.'),'restricted',true);
  end;
  select coalesce(jsonb_agg(value order by value->>'category'),'[]') into latest from (
   select distinct on (value->>'category') value from jsonb_array_elements(checks->'runs') order by value->>'category',(value->>'sequence')::bigint desc
  ) x;
  if jsonb_array_length(latest)=0 then issues:=issues||jsonb_build_array('Ingen dokumentert kontroll er fullført i leilighetsprosjektet.');end if;
  select count(*) into n from jsonb_array_elements(latest) x where x->>'status'<>'completed';
  if n>0 then issues:=issues||jsonb_build_array(n||' sjekklister har en kontroll som ikke er fullført.');end if;
  -- Current authoritative answers own deviation closure; completed runs stay immutable.
  select count(*) into n from jsonb_each(coalesce(checks->'checklist','{}')) cat cross join lateral jsonb_each(cat.value) answer where answer.value->>'status'='Avvik';
  if n>0 then issues:=issues||jsonb_build_array(n||' åpne avvik i sjekklistene.');end if;
  select count(*) into n from public.kshms_deviations d where d.company_id=c and d.project_id=u.project_id and d.status<>'closed';
  if n>0 then issues:=issues||jsonb_build_array(n||' åpne saker i avvikssentralen.');end if;
  src:=src||jsonb_build_object('project_data',p.data,'controls',checks-'context',
   'deviations',(select coalesce(jsonb_agg(jsonb_build_object('id',d.id,'revision',d.revision,'status',d.status) order by d.id),'[]') from public.kshms_deviations d where d.company_id=c and d.project_id=u.project_id));
 end if;
 return jsonb_build_object('basis',md5(src::text),'issues',issues,'linked_project',u.project_id is not null,'restricted',false);
end$$;
revoke all on function bolig_private.completion_source(uuid,uuid,uuid) from public,anon,authenticated,service_role;

-- Build units first, then buildings, then project: both child work and own
-- common-work review are necessary. No active children never means complete.
create function bolig_private.completion_tree(c uuid,root uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
#variable_conflict use_variable
declare ctx jsonb;r record;s bolig_private.completion_states%rowtype;src jsonb;child jsonb;rows jsonb:='[]';items jsonb;item jsonb;issues jsonb;basis text;proof text;status text;good bool;done int;executed bool;title text;valid bool;owner_name text;
begin
 ctx:=bolig_private.context(c);
 if auth.uid() is null or coalesce((ctx->>'enabled')::boolean,false) is not true or not exists(select 1 from bolig_private.roots where id=root and company_id=c) then raise exception 'Boligprosjektet er ikke tilgjengelig i aktivt firma.' using errcode='42501';end if;
 for r in
  select 0 priority,'unit' kind,u.id scope_id,e.block_id parent_id,u.number||' · '||e.address title from bolig_private.units u join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id where u.root_id=root and not u.archived and not e.archived and not b.archived
  union all select 1,'block',b.id,root,b.name from bolig_private.blocks b where b.root_id=root and not b.archived
  union all select 2,'project',p.id,null::uuid,p.title from bolig_private.roots p where p.id=root
  order by priority,scope_id
 loop
  select * into s from bolig_private.completion_states where root_id=root and scope_id=r.scope_id;
  src:=case when r.kind='unit' then bolig_private.completion_source(c,root,r.scope_id) else jsonb_build_object('basis',r.scope_id,'issues','[]'::jsonb) end;
  select coalesce(jsonb_agg(value order by value->>'scope_id'),'[]') into child from jsonb_array_elements(rows) where value->>'parent_id'=r.scope_id::text;
  issues:=src->'issues';
  if r.kind<>'unit' then
   if jsonb_array_length(child)=0 then issues:=issues||jsonb_build_array('Ingen aktive '||case when r.kind='block' then 'boliger i bygget.' else 'bygg i prosjektet.' end);end if;
   for item in select value from jsonb_array_elements(child) where value->>'status' not in ('ready','handed_over') loop
    issues:=issues||jsonb_build_array((item->>'title')||': '||case when item->>'status'='review' then 'må kontrolleres på nytt.' else 'ikke klar for overtagelse.' end);
   end loop;
  end if;
  proof:=src->>'basis';items:='[]';done:=0;executed:=false;
  for item in select value from jsonb_array_elements(coalesce(s.items,'[]')) loop
   good:=coalesce((item->>'done')::boolean,false) and coalesce(length(trim(item->>'evidence')),0)>=3 and (r.kind<>'unit' or item->>'basis'=proof) and (nullif(item->>'room_id','') is null or exists(select 1 from bolig_private.rooms where id=(item->>'room_id')::uuid and unit_id=r.scope_id and not archived));
   if good then done:=done+1;if item->>'kind'='execution' then executed:=true;end if;
   else issues:=issues||jsonb_build_array((item->>'title')||case when (item->>'done')::boolean then ': grunnlaget er endret – kontroller på nytt.' else ': dokumentasjon mangler.' end);end if;
   items:=items||jsonb_build_array(item||jsonb_build_object('valid',good));
  end loop;
  if jsonb_array_length(items)=0 then issues:=issues||jsonb_build_array('Avklar hvilke arbeider og dokumenter som skal kontrolleres.');end if;
  select coalesce(nullif(to_jsonb(p)->>'full_name',''),p.email) into owner_name from public.profiles p join public.sales_company_memberships m on m.user_id=p.id where p.id=s.owner_id and m.company_id=c and m.workspace_role in ('firmaadmin','ansatt') and p.approved and not coalesce(p.deactivated,false) limit 1;
  if owner_name is null then issues:=issues||jsonb_build_array('Velg en aktiv ansvarlig i firmaet.');end if;
  basis:=md5(jsonb_build_object('source',proof,'items',s.items,'owner',s.owner_id,'children',(select coalesce(jsonb_agg(jsonb_build_object('id',x->'scope_id','basis',x->'basis','status',x->'status','revision',x->'revision') order by x->>'scope_id'),'[]') from jsonb_array_elements(child) x))::text);
  valid:=s.approval is not null and s.approval->>'basis'=basis and jsonb_array_length(issues)=0;
  status:=case when s.approval is not null and not valid then 'review' when valid and s.handover is not null then 'handed_over' when valid then 'ready' when jsonb_array_length(items)=0 then 'not_started' when jsonb_array_length(issues)=0 then 'controlled' when executed then 'executed' else 'in_progress' end;
  rows:=rows||jsonb_build_array(jsonb_build_object('scope_id',r.scope_id,'kind',r.kind,'parent_id',r.parent_id,'title',r.title,'revision',coalesce(s.revision,0),'owner_id',s.owner_id,'owner_name',owner_name,'status',status,'basis',basis,'source_basis',proof,'source',src-'basis','items',case when coalesce((src->>'restricted')::boolean,false) then '[]'::jsonb else items end,'done',case when coalesce((src->>'restricted')::boolean,false) then 0 else done end,'total',jsonb_array_length(items),'issues',issues,'approval',case when coalesce((src->>'restricted')::boolean,false) then null else s.approval end,'handover',case when coalesce((src->>'restricted')::boolean,false) then null else s.handover end));
 end loop;
 return jsonb_build_object('context',ctx,'root_id',root,'rows',rows,'root_archived',(select archived from bolig_private.roots where id=root));
end$$;
revoke all on function bolig_private.completion_tree(uuid,uuid) from public,anon,authenticated,service_role;

create function bolig_private.completion(c uuid,root uuid,scope uuid,action text,expected bigint,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare tree jsonb;row jsonb;ctx jsonb;s bolig_private.completion_states%rowtype;items jsonb;item jsonb;identity text;reason text;kind text;rid uuid;room uuid;owner uuid;now_at timestamptz:=clock_timestamp();
begin
 if action is null or action not in ('get','start','no_common','owner','item','add','approve','handover','reopen') or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>15000 then raise exception 'Ugyldig ferdigstillingshandling.' using errcode='22023';end if;
 if action<>'get' then
  -- Same root lock as structural writes, plus catalog/room locks used by choices.
  perform 1 from bolig_private.roots where id=root and company_id=c for update;
  perform pg_advisory_xact_lock(hashtextextended('bolig-catalog:'||root::text,0));
  if scope is not null then perform pg_advisory_xact_lock(hashtextextended('bolig-rooms:'||scope::text,0));end if;
 end if;
 tree:=bolig_private.completion_tree(c,root);ctx:=tree->'context';
 if scope is not null then select value into row from jsonb_array_elements(tree->'rows') where value->>'scope_id'=scope::text;if row is null then raise exception 'Velg en aktiv bolig, et bygg eller prosjektet.' using errcode='42501';end if;end if;
 if action<>'get' then
  if ctx->>'role'<>'manager' or (tree->>'root_archived')::boolean then raise exception 'Prosjektleder og aktivt boligprosjekt kreves.' using errcode='42501';end if;
  if scope is null then raise exception 'Velg arbeidsområde.' using errcode='22023';end if;
  if expected is distinct from (row->>'revision')::bigint or payload->>'basis' is distinct from row->>'basis' then raise exception 'Grunnlaget er endret. Kladden er beholdt. Hent siste versjon og se over endringene.' using errcode='PT409';end if;
  if row->'approval'<>'null'::jsonb and action not in ('reopen','handover') then raise exception 'Gjenåpne med en begrunnelse før du endrer eller godkjenner på nytt.' using errcode='PT409';end if;
  if coalesce((row->'source'->>'restricted')::boolean,false) then raise exception 'Du trenger tilgang til leilighetsprosjektet for å kontrollere grunnlaget.' using errcode='42501';end if;
  kind:=row->>'kind';
  insert into bolig_private.completion_states(root_id,scope_id,kind) values(root,scope,kind) on conflict do nothing;
  select * into s from bolig_private.completion_states where root_id=root and scope_id=scope;
  select coalesce(nullif(to_jsonb(p)->>'full_name',''),p.email) into identity from public.profiles p where p.id=auth.uid();
  if action in ('start','no_common') then
   if jsonb_array_length(s.items)>0 then raise exception 'Kontrollplanen er allerede opprettet.' using errcode='PT409';end if;
   if action='no_common' and kind='unit' then raise exception 'Boliger krever dokumentert arbeid.' using errcode='22023';end if;
   reason:=trim(payload->>'reason');
   if action='no_common' and coalesce(length(reason),0) not between 3 and 2000 then raise exception 'Beskriv hvorfor det ikke er fellesarbeider.' using errcode='22023';end if;
   items:='[]';
   for item in select value from jsonb_array_elements(case when action='no_common' then '[{"kind":"execution","title":"Fellesarbeider avklart – ingen egne arbeider"}]'::jsonb when kind='unit' then '[{"kind":"execution","title":"Arbeidet er utført"},{"kind":"checklist","title":"Sjekklister og kontroller er fullført"},{"kind":"deviation","title":"Avvik og mangler er avklart"},{"kind":"photos","title":"Bilder er kontrollert"},{"kind":"documents","title":"Sluttdokumentasjon er kontrollert"}]'::jsonb else '[{"kind":"execution","title":"Fellesarbeidene er utført"},{"kind":"checklist","title":"Fellesarbeidene er kontrollert"},{"kind":"documents","title":"Felles dokumentasjon er kontrollert"}]'::jsonb end) loop
    items:=items||jsonb_build_array(item||jsonb_build_object('id',gen_random_uuid(),'done',action='no_common','evidence',coalesce(reason,''),'room_id',room,'basis',row->>'source_basis','by',auth.uid(),'at',now_at));
   end loop;
   update bolig_private.completion_states set items=items,owner_id=auth.uid() where root_id=root and scope_id=scope;
  elsif action='owner' then
   owner:=(payload->>'owner_id')::uuid;
   if not exists(select 1 from public.sales_company_memberships m join public.profiles p on p.id=m.user_id where m.company_id=c and m.user_id=owner and m.workspace_role in ('firmaadmin','ansatt') and p.approved and not coalesce(p.deactivated,false) and p.role in ('admin','member','ansatt','firmaadmin')) then raise exception 'Velg en aktiv intern ansvarlig i firmaet.' using errcode='42501';end if;
   update bolig_private.completion_states set owner_id=owner where root_id=root and scope_id=scope;
  elsif action in ('item','add') then
   rid:=(payload->>'id')::uuid;reason:=trim(payload->>'evidence');
   if rid is null or jsonb_typeof(payload->'done') is distinct from 'boolean' or coalesce(length(reason),0)>2000 or ((payload->>'done')::boolean and coalesce(length(reason),0)<3) then raise exception 'Oppgi en dokumentreferanse eller en konkret kontrollbeskrivelse (3–2000 tegn).' using errcode='22023';end if;
   room:=nullif(payload->>'room_id','')::uuid;
   if room is not null and (kind<>'unit' or not exists(select 1 from bolig_private.rooms where id=room and unit_id=scope and root_id=root and not archived)) then raise exception 'Velg et aktivt rom i denne boligen.' using errcode='42501';end if;
   if action='add' then
    if jsonb_array_length(s.items)=0 or jsonb_array_length(s.items)>=100 or coalesce(length(trim(payload->>'title')),0) not between 3 and 160 then raise exception 'Start kontrollplanen først. Bruk en tittel på 3–160 tegn og høyst 100 kontrollpunkter.' using errcode='22023';end if;
    room:=nullif(payload->>'room_id','')::uuid;
    if room is not null and (kind<>'unit' or not exists(select 1 from bolig_private.rooms where id=room and unit_id=scope and root_id=root and not archived)) then raise exception 'Velg et aktivt rom i denne boligen.' using errcode='42501';end if;
    if exists(select 1 from jsonb_array_elements(s.items) where value->>'id'=rid::text) then raise exception 'Punktet finnes allerede.' using errcode='PT409';end if;
    s.items:=s.items||jsonb_build_array(jsonb_build_object('id',rid,'kind','documents','title',trim(payload->>'title'),'room_id',room));
   end if;
   if not exists(select 1 from jsonb_array_elements(s.items) where value->>'id'=rid::text) then raise exception 'Kontrollpunktet finnes ikke.' using errcode='42501';end if;
   select jsonb_agg(case when value->>'id'=rid::text then value||jsonb_build_object('done',(payload->>'done')::boolean,'evidence',coalesce(reason,''),'room_id',room,'basis',row->>'source_basis','by',auth.uid(),'by_name',identity,'at',now_at) else value end order by n) into items from jsonb_array_elements(s.items) with ordinality x(value,n);
   update bolig_private.completion_states set items=items where root_id=root and scope_id=scope;
  elsif action='approve' then
   if jsonb_array_length(row->'issues')>0 or row->>'status'<>'controlled' then raise exception 'Fullfør mangellisten før godkjenning.' using errcode='PT409';end if;
   update bolig_private.completion_states set approval=jsonb_build_object('basis',row->>'basis','by',auth.uid(),'by_name',identity,'at',now_at),handover=null where root_id=root and scope_id=scope;
  elsif action='handover' then
   -- Records an already completed handover; this is not a legal signature.
   reason:=trim(payload->>'reason');
   if row->>'status'<>'ready' or s.handover is not null or coalesce(length(reason),0) not between 3 and 2000 then raise exception 'Godkjenn grunnlaget og oppgi referanse til gjennomført overtagelse (3–2000 tegn).' using errcode='PT409';end if;
   update bolig_private.completion_states set handover=jsonb_build_object('by',auth.uid(),'by_name',identity,'at',now_at,'reference',reason,'basis',row->>'basis') where root_id=root and scope_id=scope;
  elsif action='reopen' then
   reason:=trim(payload->>'reason');
   if s.approval is null or coalesce(length(reason),0) not between 3 and 2000 then raise exception 'Oppgi hvorfor ferdigstillingen gjenåpnes (3–2000 tegn).' using errcode='22023';end if;
   update bolig_private.completion_states set approval=null,handover=null where root_id=root and scope_id=scope;
  end if;
  update bolig_private.completion_states set revision=revision+1 where root_id=root and scope_id=scope returning * into s;
  insert into bolig_private.completion_events(root_id,scope_id,revision,action,actor_id,actor_name,snapshot,reason) values(root,scope,s.revision,action,auth.uid(),identity,to_jsonb(s),coalesce(reason,''));
  tree:=bolig_private.completion_tree(c,root);
 end if;
 return tree||jsonb_build_object('scope_id',scope,'history',coalesce((select jsonb_agg(jsonb_build_object('id',h.id,'revision',h.revision,'action',h.action,'actor_name',h.actor_name,'at',h.created_at,'reason',h.reason,'approval',h.snapshot->'approval','handover',h.snapshot->'handover') order by h.revision desc) from (select * from bolig_private.completion_events where root_id=root and scope_id=scope and not coalesce((row->'source'->>'restricted')::boolean,false) order by revision desc limit 100) h),'[]'),
 'members',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'name',coalesce(nullif(to_jsonb(p)->>'full_name',''),p.email)) order by p.email) from public.profiles p join public.sales_company_memberships m on m.user_id=p.id where m.company_id=c and m.workspace_role in ('firmaadmin','ansatt') and p.approved and not coalesce(p.deactivated,false) and p.role in ('admin','member','ansatt','firmaadmin')),'[]'),
 'rooms',coalesce((select jsonb_agg(jsonb_build_object('id',id,'name',name) order by name) from bolig_private.rooms where unit_id=scope and root_id=root and not archived),'[]'));
end$$;
revoke all on function bolig_private.completion(uuid,uuid,uuid,text,bigint,jsonb) from public,anon,service_role;
grant execute on function bolig_private.completion(uuid,uuid,uuid,text,bigint,jsonb) to authenticated;
create function public.bolig_completion(p_company_id uuid,p_root_id uuid,p_scope_id uuid default null,p_action text default 'get',p_revision bigint default null,p_payload jsonb default '{}') returns jsonb language sql security invoker set search_path='' as $$select bolig_private.completion(p_company_id,p_root_id,p_scope_id,p_action,p_revision,p_payload)$$;
revoke all on function public.bolig_completion(uuid,uuid,uuid,text,bigint,jsonb) from public,anon,service_role;
grant execute on function public.bolig_completion(uuid,uuid,uuid,text,bigint,jsonb) to authenticated;
