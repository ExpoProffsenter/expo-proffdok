-- Additive wrapper: publication, immutable versions, assignments, self-reading
-- and ordinary publication notifications use the existing canonical command.
create function public.kshms_publish_batch(
 p_company_id uuid,p_user_id uuid,p_routines jsonb,p_assessment text,
 p_approval_statement text,p_requires_ack boolean,p_acknowledge_self boolean,p_self_statement text
) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();item jsonb;r public.kshms_routines%rowtype;
 previous public.kshms_versions%rowtype;v jsonb;result jsonb:='[]';summary text;
begin
 perform kshms_private.require_context(p_company_id,true,true);
 if actor is null or p_user_id is distinct from actor then raise exception 'Firmagodkjenning krever riktig egen bruker.' using errcode='42501';end if;
 if p_approval_statement is distinct from 'Jeg har gjennomgått alle de oppførte rutineutkastene og vurdert at innholdet er tilpasset firmaets arbeid, risikoer og ansvarsfordeling. Jeg godkjenner at disse utkastene publiseres som firmaets rutiner.'
 or length(trim(coalesce(p_assessment,''))) not between 5 and 1500
 or p_requires_ack is null or p_acknowledge_self is null then raise exception 'Vurdering og uttrykkelig firmagodkjenning kreves.' using errcode='22023';end if;
 if (p_acknowledge_self and p_self_statement is distinct from 'Jeg har gjennomgått denne rutineversjonen, forstår mitt ansvar og vil følge rutinen. Jeg ber om forklaring eller nødvendig opplæring dersom noe er uklart, og melder fra om farlige forhold og avvik. Bekreftelsen dokumenterer gjennomgang; den erstatter ikke opplæring eller faktisk utførelse.')
 or (not p_acknowledge_self and p_self_statement is not null) then raise exception 'Egen lesebekreftelse må velges særskilt.' using errcode='22023';end if;
 if jsonb_typeof(p_routines) is distinct from 'array' then raise exception 'Velg rutineutkast.' using errcode='22023';end if;
 if jsonb_array_length(p_routines) not between 1 and 500 or exists(
  select 1 from jsonb_array_elements(p_routines) a where jsonb_typeof(a) is distinct from 'object'
  or nullif(a->>'id','') is null or jsonb_typeof(a->'revision') is distinct from 'number'
  or jsonb_typeof(a->'next_number') is distinct from 'number' or jsonb_typeof(a->'draft') is distinct from 'object'
 ) then raise exception 'Entydige lagrede rutineutkast kreves.' using errcode='22023';end if;
 if (select count(distinct (a->>'id')::uuid) from jsonb_array_elements(p_routines) a)<>jsonb_array_length(p_routines) then raise exception 'Samme rutine er valgt flere ganger.' using errcode='22023';end if;
 perform 1 from public.company_module_access where company_id=p_company_id and module_key='kshms' for update;
 perform kshms_private.require_context(p_company_id,true,true);
 -- Validate the complete frozen selection before the first canonical write.
 for item in select value from jsonb_array_elements(p_routines) order by value->>'id' loop
  select * into r from public.kshms_routines where company_id=p_company_id and id=(item->>'id')::uuid for update;
  if r.id is null then raise exception 'Rutinen tilhører ikke dette firmaet.' using errcode='42501';end if;
  select * into previous from public.kshms_versions where routine_id=r.id order by number desc limit 1;
  if r.archived or r.revision is distinct from (item->>'revision')::bigint or r.draft is distinct from item->'draft'
  or coalesce(previous.number,0)+1 is distinct from (item->>'next_number')::integer
  or previous.id is distinct from (item->>'previous_version_id')::uuid then raise exception 'Et valgt utkast er endret. Vurder utvalget på nytt.' using errcode='40001';end if;
  if previous.id is not null and previous.content=r.draft then raise exception 'Rutinen er allerede godkjent uten nye endringer.' using errcode='40001';end if;
  perform kshms_private.validate_draft(r.draft);
 end loop;
 summary:=trim(p_assessment)||E'\n\n'||p_approval_statement;
 for item in select value from jsonb_array_elements(p_routines) order by value->>'id' loop
  v:=public.kshms_command(p_company_id,'publish',jsonb_build_object('id',item->>'id','revision',item->'revision','change_summary',summary,'requires_ack',p_requires_ack,'acknowledge_self',p_acknowledge_self,'self_statement',p_self_statement));
  result:=result||jsonb_build_array(jsonb_build_object('id',v->'id','routine_id',v->'routine_id','number',v->'number','published_at',v->'published_at','published_by',v->'published_by'));
 end loop;
 return jsonb_build_object('versions',result,'published_count',jsonb_array_length(result));
end$$;
revoke all on function public.kshms_publish_batch(uuid,uuid,jsonb,text,text,boolean,boolean,text) from public,anon,authenticated,service_role;
grant execute on function public.kshms_publish_batch(uuid,uuid,jsonb,text,text,boolean,boolean,text) to authenticated;
comment on function public.kshms_publish_batch(uuid,uuid,jsonb,text,text,boolean,boolean,text) is 'Samlet eksplisitt firmagodkjenning av eksakte lagrede utkast via uendret kanonisk publisering, atomisk og med vanlig tildeling/varsling.';
