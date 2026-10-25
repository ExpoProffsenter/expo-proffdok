-- Agreed 22 October: progressive setup, explicit checklist requirements and
-- critical/minor defects. Existing answers, orders and approval history survive.
-- Empty addresses are unknown, never invented street addresses.
alter table bolig_private.entrances drop constraint entrances_address_check;
alter table bolig_private.entrances add constraint entrances_address_check check(length(trim(address))<=200);
alter table bolig_private.entrances drop constraint entrances_root_id_address_key;
create unique index bolig_entrance_known_address on bolig_private.entrances(root_id,address) where length(trim(address))>0;

do $patch$
declare body text;
begin
 body:=pg_get_functiondef('bolig_private.create_plan(uuid,jsonb)'::regprocedure);
 if position($s$length(trim(item->>'address')) not between 1 and 200$s$ in body)=0 then raise exception 'Missing builder address contract';end if;
 body:=replace(body,$s$length(trim(item->>'address')) not between 1 and 200$s$,$s$length(trim(item->>'address'))>200$s$);
 body:=replace(body,$s$length(trim(entrance->>'address')) not between 1 and 200$s$,$s$length(trim(entrance->>'address'))>200$s$);
 execute body;
end$patch$;

do $patch$
declare body text;
begin
 body:=pg_get_functiondef('bolig_private.preparation(uuid,uuid,text,jsonb)'::regprocedure);
 if position($s$length(trim(data->>'entrance_address')) not between 1 and 200$s$ in body)=0 then raise exception 'Missing preparation address contract';end if;
 body:=replace(body,$s$length(trim(data->>'address')) not between 1 and 200$s$,$s$length(trim(data->>'address'))>200$s$);
 body:=replace(body,$s$length(trim(data->>'entrance_address')) not between 1 and 200$s$,$s$length(trim(data->>'entrance_address'))>200$s$);
 body:=replace(body,$s$id<>e.id and address=trim(data->>'entrance_address')$s$,$s$id<>e.id and length(trim(data->>'entrance_address'))>0 and address=trim(data->>'entrance_address')$s$);
 execute body;
end$patch$;

-- The existing canonical validator, template version checks, typed fields,
-- immutable completed controls, revision checks and history stay in place.
do $patch$
declare body text;
begin
 body:=pg_get_functiondef('bolig_private.quality(uuid,uuid,uuid,text,bigint,jsonb)'::regprocedure);
 if position($s$elsif action='check_add' then$s$ in body)=0 then raise exception 'Missing checklist creation contract';end if;
 body:=replace(body,$s$'fdv_link')$s$,$s$'fdv_link','check_requirement')$s$);
 body:=replace(body,$s$  elsif action='check_add' then$s$,$s$  elsif action='check_requirement' then
   if jsonb_typeof(payload->'required') is distinct from 'boolean' then raise exception 'Velg om kontrollen er påkrevd.' using errcode='22023';end if;
   if not exists(select 1 from jsonb_array_elements(d->'checks') x where x->>'id'=rid::text and not coalesce((x->>'archived')::boolean,false)) then raise exception 'Kontrollen er ikke tilgjengelig.' using errcode='42501';end if;
   select jsonb_agg(case when x->>'id'=rid::text then x||jsonb_build_object('required',payload->'required','requirement_by',auth.uid(),'requirement_at',now_at) else x end order by n) into points from jsonb_array_elements(d->'checks') with ordinality q(x,n);
   d:=jsonb_set(d,'{checks}',points);
  elsif action='check_add' then$s$);
 body:=replace(body,$s$   if nullif(payload->>'version_id','') is not null then$s$,$s$   if jsonb_typeof(coalesce(payload->'required','true'::jsonb)) is distinct from 'boolean' then raise exception 'Velg om kontrollen er påkrevd.' using errcode='22023';end if;
   if nullif(payload->>'copy_check_id','') is not null then
    perform bolig_private.quality_scope(c,root,(payload->>'copy_scope_id')::uuid);
    select x into old from bolig_private.quality_states qs cross join lateral jsonb_array_elements(qs.data->'checks') x where qs.root_id=root and qs.scope_id=(payload->>'copy_scope_id')::uuid and x->>'id'=payload->>'copy_check_id' and not coalesce((x->>'archived')::boolean,false);
    if old is null then raise exception 'Prosjektlisten er ikke tilgjengelig.' using errcode='42501';end if;
    clean:=old->'definition';
   elsif nullif(payload->>'version_id','') is not null then$s$);
 body:=replace(body,$s$'definition',clean,'source_version_id',version.id$s$,$s$'required',coalesce(payload->'required','true'::jsonb),'copy_check_id',old->>'id','copy_scope_id',payload->>'copy_scope_id','definition',clean,'source_version_id',coalesce(version.id,nullif(old->>'source_version_id','')::uuid)$s$);
 body:=replace(body,$s$'source_hash',version.content_hash,'source_number',version.number$s$,$s$'source_hash',coalesce(version.content_hash,old->>'source_hash'),'source_number',coalesce(version.number,(old->>'source_number')::int)$s$);
 body:=replace(body,$s$clean:=jsonb_build_object('status',coalesce(answer->>'status','')$s$,$s$if coalesce(answer->>'severity',old->>'severity','critical') not in ('critical','minor') then raise exception 'Velg kritisk avvik eller mindre restpunkt.' using errcode='22023';end if;
     clean:=jsonb_build_object('severity',coalesce(answer->>'severity',old->>'severity','critical'),'status',coalesce(answer->>'status','')$s$);
 body:=replace(body,$s$row:=row||jsonb_build_object('answers',answers$s$,$s$if payload ? 'required' then
     if jsonb_typeof(payload->'required') is distinct from 'boolean' then raise exception 'Velg om kontrollen er påkrevd.' using errcode='22023';end if;
     row:=row||jsonb_build_object('required',payload->'required','requirement_by',auth.uid(),'requirement_at',now_at);
    end if;
    row:=row||jsonb_build_object('answers',answers$s$);
 body:=replace(body,$s$clean:=jsonb_build_object('id',(point->>'id')::uuid,'text'$s$,$s$if coalesce(point->>'severity','critical') not in ('critical','minor') then raise exception 'Velg kritisk merknad eller mindre restpunkt.' using errcode='22023';end if;
     clean:=jsonb_build_object('severity',coalesce(point->>'severity','critical'),'id',(point->>'id')::uuid,'text'$s$);
 execute body;
end$patch$;

create or replace function bolig_private.quality_source(root uuid,scope uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
#variable_conflict use_variable
declare d jsonb;issues jsonb:='[]';warnings jsonb:='[]';rest jsonb:='[]';check_row jsonb;answer jsonb;point jsonb;protocol jsonb;remark jsonb;required bool;count_open int;critical int:=0;minor int:=0;goods jsonb;
begin
 select data into d from bolig_private.quality_states where root_id=root and scope_id=scope;
 d:=coalesce(d,'{"checks":[],"documents":[],"protocols":[],"fdv":{}}');
 for check_row in select value from jsonb_array_elements(d->'checks') where not coalesce((value->>'archived')::boolean,false) loop
  required:=coalesce((check_row->>'required')::boolean,true);
  if check_row->>'status'<>'completed' then
   if required then issues:=issues||jsonb_build_array('Påkrevd sjekkliste ikke fullført: '||(check_row#>>'{definition,title}'));
   else warnings:=warnings||jsonb_build_array('Valgfri sjekkliste under arbeid: '||(check_row#>>'{definition,title}'));end if;
  end if;
  if nullif(check_row->>'room_id','') is not null and not exists(select 1 from bolig_private.rooms r where r.id=(check_row->>'room_id')::uuid and r.unit_id=scope and r.root_id=root and not r.archived) then
   if required then issues:=issues||jsonb_build_array('Påkrevd kontroll er knyttet til arkivert rom: '||(check_row#>>'{definition,title}'));
   else warnings:=warnings||jsonb_build_array('Valgfri kontroll er knyttet til arkivert rom: '||(check_row#>>'{definition,title}'));end if;
  end if;
  for point in select value from jsonb_array_elements(check_row#>'{definition,points}') loop
   answer:=check_row->'answers'->(point->>'id');
   if answer->>'status'='Avvik' then
    if coalesce(answer->>'severity','critical')='critical' then critical:=critical+1;issues:=issues||jsonb_build_array('Kritisk avvik: '||(point->>'title'));
    else minor:=minor+1;rest:=rest||jsonb_build_array(jsonb_build_object('scope_id',scope,'check_id',check_row->>'id','point_id',point->>'id','source',check_row#>>'{definition,title}','title',point->>'title','comment',coalesce(answer->>'comment',''),'severity','minor'));end if;
   end if;
  end loop;
 end loop;
 for protocol in select value from jsonb_array_elements(d->'protocols') where not coalesce((value->>'superseded')::boolean,false) loop
  count_open:=0;
  for remark in select value from jsonb_array_elements(protocol->'remarks') where coalesce(value->'rectified','false'::jsonb)<>'true'::jsonb loop
   count_open:=count_open+1;
   if coalesce(remark->>'severity','critical')='critical' then critical:=critical+1;issues:=issues||jsonb_build_array('Kritisk protokollmerknad: '||(remark->>'text'));
   else minor:=minor+1;rest:=rest||jsonb_build_array(jsonb_build_object('scope_id',scope,'protocol_id',protocol->>'id','point_id',remark->>'id','source',protocol->>'title','title',remark->>'text','comment',coalesce(remark->>'evidence',''),'severity','minor'));end if;
  end loop;
  if protocol->'confirmation' is null then
   if jsonb_array_length(protocol->'remarks')=0 and length(trim(coalesce(protocol->>'no_remarks','')))<3 then issues:=issues||jsonb_build_array('Gjennomgå merknadene i protokollen: '||(protocol->>'title'));
   else warnings:=warnings||jsonb_build_array('Retting er ikke bekreftet for: '||(protocol->>'title'));end if;
  end if;
 end loop;
 goods:=bolig_private.fdv_rows(root,scope);
 return jsonb_build_object('basis',md5(jsonb_build_object('data',d,'goods',goods)::text),'issues',issues,'warnings',warnings,'restpoints',rest,
 'evidence',jsonb_build_object('checks',(select count(*) from jsonb_array_elements(d->'checks') x where not coalesce((x->>'archived')::boolean,false)),
 'required_checks',(select count(*) from jsonb_array_elements(d->'checks') x where not coalesce((x->>'archived')::boolean,false) and coalesce((x->>'required')::boolean,true)),
 'completed_required',(select count(*) from jsonb_array_elements(d->'checks') x where not coalesce((x->>'archived')::boolean,false) and coalesce((x->>'required')::boolean,true) and x->>'status'='completed'),
 'critical',critical,'minor',minor,'photos',(select count(*) from jsonb_array_elements(d->'documents') x where x->>'kind'='photo'),'documents',jsonb_array_length(d->'documents'),'protocols',jsonb_array_length(d->'protocols'),'fdv',jsonb_array_length(goods),'fdv_missing',(select count(*) from jsonb_array_elements(goods) x where coalesce(x->>'fdv_url','')='')));
end$$;
revoke all on function bolig_private.quality_source(uuid,uuid) from public,anon,authenticated,service_role;

create or replace function bolig_private.completion_tree(c uuid,root uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
#variable_conflict use_variable
declare ctx jsonb;native jsonb;warnings jsonb;rest jsonb;r record;s bolig_private.completion_states%rowtype;src jsonb;child jsonb;rows jsonb:='[]';items jsonb;item jsonb;issues jsonb;basis text;proof text;status text;good bool;done int;executed bool;title text;valid bool;owner_name text;
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
  native:=bolig_private.quality_source(root,r.scope_id);
  src:=src||jsonb_build_object('basis',md5((src->>'basis')||(native->>'basis')),'issues',(src->'issues')||(native->'issues'),'warnings',coalesce(src->'warnings','[]'::jsonb)||(native->'warnings'),'evidence',native->'evidence');
  warnings:=src->'warnings';rest:=native->'restpoints';
  select coalesce(jsonb_agg(value order by value->>'scope_id'),'[]') into child from jsonb_array_elements(rows) where value->>'parent_id'=r.scope_id::text;
  issues:=src->'issues';
  if r.kind<>'unit' then
   if jsonb_array_length(child)=0 then issues:=issues||jsonb_build_array('Ingen aktive '||case when r.kind='block' then 'boliger i bygget.' else 'bygg i prosjektet.' end);end if;
   for item in select value from jsonb_array_elements(child) where value->>'status' not in ('ready','ready_with_rest','handed_over','handed_over_with_rest') loop
    issues:=issues||jsonb_build_array((item->>'title')||': '||case when item->>'status'='review' then 'må kontrolleres på nytt.' else 'ikke klar for overtagelse.' end);
   end loop;
  end if;
  for item in select value from jsonb_array_elements(child) loop
   rest:=rest||coalesce(item->'restpoints','[]'::jsonb);
   if jsonb_array_length(coalesce(item->'warnings','[]'::jsonb))>0 then warnings:=warnings||jsonb_build_array((item->>'title')||': har påminnelser.');end if;
  end loop;
  proof:=src->>'basis';items:='[]';done:=0;executed:=false;
  for item in select value from jsonb_array_elements(coalesce(s.items,'[]')) loop
   good:=coalesce((item->>'done')::boolean,false) and coalesce(length(trim(item->>'evidence')),0)>=3 and (nullif(item->>'room_id','') is null or exists(select 1 from bolig_private.rooms where id=(item->>'room_id')::uuid and unit_id=r.scope_id and not archived));
   if good then done:=done+1;if item->>'kind'='execution' then executed:=true;end if;
   else issues:=issues||jsonb_build_array((item->>'title')||case when (item->>'done')::boolean then ': grunnlaget er endret – kontroller på nytt.' else ': dokumentasjon mangler.' end);end if;
   items:=items||jsonb_build_array(item||jsonb_build_object('valid',good));
  end loop;
  if jsonb_array_length(items)=0 then issues:=issues||jsonb_build_array('Avklar hvilke arbeider og dokumenter som skal kontrolleres.');end if;
  select coalesce(nullif(to_jsonb(p)->>'full_name',''),p.email) into owner_name from public.profiles p join public.sales_company_memberships m on m.user_id=p.id where p.id=s.owner_id and m.company_id=c and m.workspace_role in ('firmaadmin','ansatt') and p.approved and not coalesce(p.deactivated,false) limit 1;
  if owner_name is null then issues:=issues||jsonb_build_array('Velg en aktiv ansvarlig i firmaet.');end if;
  basis:=md5(jsonb_build_object('source',proof,'items',s.items,'owner',s.owner_id,'children',(select coalesce(jsonb_agg(jsonb_build_object('id',x->'scope_id','basis',x->'basis','approval_basis',x#>'{approval,basis}') order by x->>'scope_id'),'[]') from jsonb_array_elements(child) x))::text);
  if r.kind<>'unit' and (jsonb_array_length(child)=0 or exists(select 1 from jsonb_array_elements(child) x where x->>'status' not in ('executed','controlled','ready','ready_with_rest','handed_over','handed_over_with_rest'))) then executed:=false;end if;
  valid:=s.approval is not null and s.approval->>'basis'=basis and jsonb_array_length(issues)=0;
  status:=case when s.approval is not null and not valid then 'review' when valid and s.handover is not null then case when jsonb_array_length(rest)>0 then 'handed_over_with_rest' else 'handed_over' end when valid then case when jsonb_array_length(rest)>0 then 'ready_with_rest' else 'ready' end when jsonb_array_length(items)=0 then 'not_started' when jsonb_array_length(issues)=0 then 'controlled' when executed then 'executed' else 'in_progress' end;
  rows:=rows||jsonb_build_array(jsonb_build_object('scope_id',r.scope_id,'kind',r.kind,'parent_id',r.parent_id,'title',r.title,'revision',coalesce(s.revision,0),'owner_id',s.owner_id,'owner_name',owner_name,'status',status,'basis',basis,'source_basis',proof,'source',src-'basis','items',case when coalesce((src->>'restricted')::boolean,false) then '[]'::jsonb else items end,'done',case when coalesce((src->>'restricted')::boolean,false) then 0 else done end,'total',jsonb_array_length(items),'issues',issues,'warnings',warnings,'restpoints',rest,'approval',case when coalesce((src->>'restricted')::boolean,false) then null else s.approval end,'handover',case when coalesce((src->>'restricted')::boolean,false) then null else s.handover end));
 end loop;
 return jsonb_build_object('context',ctx,'root_id',root,'rows',rows,'root_archived',(select archived from bolig_private.roots where id=root));
end$$;
revoke all on function bolig_private.completion_tree(uuid,uuid) from public,anon,authenticated,service_role;


-- Optional ordinary-project links supply additional context. Their unplanned
-- drafts are reminders; their existing unclassified open defects still block.
do $patch$
declare body text;
begin
 body:=pg_get_functiondef('bolig_private.completion_source(uuid,uuid,uuid)'::regprocedure);
 body:=replace(body,$s$issues jsonb:='[]';$s$,$s$issues jsonb:='[]';warnings jsonb:='[]';$s$);
 body:=replace(body,$s$issues:=issues||jsonb_build_array('Ingen dokumentert kontroll er fullført i leilighetsprosjektet.')$s$,$s$warnings:=warnings||jsonb_build_array('Ingen dokumentert kontroll er fullført i koblet leilighetsprosjekt.')$s$);
 body:=replace(body,$s$issues:=issues||jsonb_build_array(n||' sjekklister har en kontroll som ikke er fullført.')$s$,$s$warnings:=warnings||jsonb_build_array(n||' sjekklister i koblet leilighetsprosjekt er under arbeid.')$s$);
 body:=replace(body,$s$'basis',md5(src::text),'issues',issues$s$,$s$'basis',md5(src::text),'issues',issues,'warnings',warnings$s$);
 execute body;
 body:=pg_get_functiondef('bolig_private.completion(uuid,uuid,uuid,text,bigint,jsonb)'::regprocedure);
 if position($s$elsif action='owner' then$s$ in body)=0 then raise exception 'Missing completion review contract';end if;
 body:=replace(body,$s$'handover','reopen')$s$,$s$'handover','reopen','review_all')$s$);
 body:=replace(body,$s$reason:=trim(payload->>'reason');$s$,$s$reason:=case when action='no_common' then coalesce(nullif(trim(payload->>'reason'),''),'Fellesarbeidene er avklart. Ingen egne fellesarbeider i dette arbeidsområdet.') else trim(payload->>'reason') end;$s$);
 body:=replace(body,$s$  elsif action='owner' then$s$,$s$  elsif action='review_all' then
   if jsonb_array_length(s.items)=0 or payload->'confirmed' is distinct from 'true'::jsonb or coalesce(length(payload->>'note'),0)>2000 then raise exception 'Opprett kontrollplan og bekreft gjennomgangen.' using errcode='22023';end if;
   reason:=trim(coalesce(payload->>'note',''));
   select jsonb_agg(case when x->>'kind' in ('execution','checklist','deviation','photos','documents') and not coalesce((x->>'custom')::boolean,false) and (x->>'kind'<>'documents' or x->>'title' in ('Sluttdokumentasjon er kontrollert','Felles dokumentasjon er kontrollert')) and nullif(x->>'room_id','') is null then x||jsonb_build_object('done',true,'evidence',coalesce(nullif(reason,''),'Arbeid og lagret dokumentasjon er gjennomgått samlet. Se dokumentgrunnlaget og kontrollhistorikken.'),'basis',row->>'source_basis','by',auth.uid(),'by_name',identity,'at',now_at,'reviewed_evidence',row#>'{source,evidence}') else x end order by n) into items from jsonb_array_elements(s.items) with ordinality q(x,n);
   update bolig_private.completion_states set items=items where root_id=root and scope_id=scope;
  elsif action='owner' then$s$);
 body:=replace(body,$s$'id',rid,'kind','documents','title'$s$,$s$'id',rid,'custom',true,'kind','documents','title'$s$);
 -- Capture the exact disclosed outstanding work with the approval.
 body:=replace(body,$s$'at',now_at),handover=null$s$,$s$'at',now_at,'restpoints',row->'restpoints','warnings',row->'warnings'),handover=null$s$);
 body:=replace(body,$s$x->>'status'<>'handed_over'$s$,$s$x->>'status' not in ('handed_over','handed_over_with_rest')$s$);
 body:=replace(body,$s$row->>'status'<>'ready'$s$,$s$row->>'status' not in ('ready','ready_with_rest')$s$);
 execute body;
end$patch$;
notify pgrst,'reload schema';
