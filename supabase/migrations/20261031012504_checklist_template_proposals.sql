-- Employee-owned proposals. No control/customer/signature data, grants or existing RPCs change.
create table checklist_private.template_proposals (
 id uuid primary key, company_id uuid not null references public.sales_company_scopes(id),
 submitted_by uuid not null references public.profiles(id), submitted_identity jsonb not null,
 definition jsonb not null, content_hash text not null, created_at timestamptz not null default now(),
 status text not null default 'pending' check(status in ('pending','approved','rejected')),
 revision bigint not null default 1, target_template_id uuid not null default gen_random_uuid() unique,
 reviewed_by uuid references public.profiles(id), reviewed_at timestamptz, decision_note text not null default '',
 review_request_id uuid unique, review_hash text, review_result jsonb,
 template_id uuid references public.kshms_checklist_templates(id), version_id uuid references public.kshms_checklist_versions(id),
 check(length(decision_note)<=2000),check((status='pending')=(reviewed_at is null)),
 check((status='approved')=(version_id is not null))
);
create index checklist_template_proposals_company on checklist_private.template_proposals(company_id,created_at desc,id desc);
create index checklist_template_proposals_submitter on checklist_private.template_proposals(submitted_by);
create index checklist_template_proposals_reviewer on checklist_private.template_proposals(reviewed_by);
create index checklist_template_proposals_template on checklist_private.template_proposals(template_id);
create index checklist_template_proposals_version on checklist_private.template_proposals(version_id);
alter table checklist_private.template_proposals enable row level security;
revoke all on checklist_private.template_proposals from public,anon,authenticated,service_role;

create function checklist_private.proposal_context(c uuid) returns jsonb language plpgsql stable set search_path='' as $$
declare x jsonb;manager boolean;ks_enabled boolean;
begin
 x:=checklist_private.context(c);
 select coalesce(enabled,false) into ks_enabled from public.company_module_access where company_id=c and module_key='kshms';
 manager:=exists(select 1 from public.sales_company_memberships where company_id=c and user_id=auth.uid() and workspace_role in ('firmaadmin','admin'))
  or (coalesce(ks_enabled,false) and exists(select 1 from public.kshms_settings where company_id=c and responsible_user_id=auth.uid()));
 return x||jsonb_build_object('can_review',manager,'can_publish',manager and coalesce(ks_enabled,false));
end $$;
revoke all on function checklist_private.proposal_context(uuid) from public,anon,authenticated,service_role;

create function public.checklist_template_proposal_state(p_company_id uuid,p_id uuid default null,p_before timestamptz default null,p_before_id uuid default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb;r checklist_private.template_proposals%rowtype;rows jsonb;cursor_row jsonb;
begin
 x:=checklist_private.proposal_context(p_company_id);
 if p_id is not null then
  select * into r from checklist_private.template_proposals where id=p_id and company_id=p_company_id and (submitted_by=auth.uid() or (x->>'can_review')::boolean);
  if r.id is null then raise exception 'Forslaget er ikke tilgjengelig i aktivt firma.' using errcode='42501';end if;
  return jsonb_build_object('context',x,'record',to_jsonb(r));
 end if;
 select coalesce(jsonb_agg(value order by created_at desc,id desc),'[]') into rows from (
  select p.id,p.created_at,jsonb_build_object('id',p.id,'title',p.definition->>'title','trade',p.definition->>'trade','point_count',jsonb_array_length(p.definition->'points'),'status',p.status,'revision',p.revision,'submitted_by',p.submitted_by,'submitted_identity',p.submitted_identity,'created_at',p.created_at,'reviewed_at',p.reviewed_at,'decision_note',p.decision_note,'template_id',p.template_id,'version_id',p.version_id) value
  from checklist_private.template_proposals p where p.company_id=p_company_id and (p.submitted_by=auth.uid() or (x->>'can_review')::boolean)
  and (p_before is null or (p.created_at,p.id)<(p_before,p_before_id)) order by p.created_at desc,p.id desc limit 51
 ) q;
 if jsonb_array_length(rows)>50 then rows:=rows-50;cursor_row:=jsonb_build_object('created_at',rows->49->'created_at','id',rows->49->'id');end if;
 return jsonb_build_object('context',x,'proposals',rows,'next',cursor_row);
end $$;

create function public.checklist_template_proposal_submit(p_company_id uuid,p_request_id uuid,p_definition jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb;r checklist_private.template_proposals%rowtype;content jsonb;digest text;
begin
 x:=checklist_private.proposal_context(p_company_id);
 if p_request_id is null or octet_length(p_definition::text)>250000 then raise exception 'Forslaget mangler ID eller er for stort.' using errcode='22023';end if;
 content:=kshms_private.checklist_content(p_definition);
 if exists(select 1 from jsonb_array_elements(content->'points')p where p->>'subform_version_id' is not null) then raise exception 'Foreslå egne sjekkpunkter uten lenker til underskjema.' using errcode='22023';end if;
 digest:=encode(sha256(convert_to(content::text,'UTF8')),'hex');
 perform pg_advisory_xact_lock(hashtextextended(p_request_id::text,117));
 select * into r from checklist_private.template_proposals where id=p_request_id;
 if r.id is not null then
  if r.company_id<>p_company_id or r.submitted_by<>auth.uid() or r.content_hash<>digest then raise exception 'Forslagsforsøket er endret. Det opprinnelige forslaget er beholdt.' using errcode='PT409';end if;
 else
  insert into checklist_private.template_proposals(id,company_id,submitted_by,submitted_identity,definition,content_hash)
  values(p_request_id,p_company_id,auth.uid(),kshms_private.identity_snapshot(auth.uid()),content,digest) returning * into r;
  insert into public.kshms_audit(company_id,actor_id,action,object_id) values(p_company_id,auth.uid(),'checklist-proposal-submit',r.id);
 end if;
 return jsonb_build_object('context',x,'record',to_jsonb(r));
end $$;

create function public.checklist_template_proposal_review(p_company_id uuid,p_id uuid,p_revision bigint,p_request_id uuid,p_decision text,p_note text default '')
returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb;r checklist_private.template_proposals%rowtype;t public.kshms_checklist_templates%rowtype;v public.kshms_checklist_versions%rowtype;digest text;snapshot jsonb;result jsonb;note text:=btrim(coalesce(p_note,''));
begin
 x:=checklist_private.proposal_context(p_company_id);
 if not (x->>'can_review')::boolean then raise exception 'Bare firmaadmin eller firmaets KS/HMS-ansvarlige kan behandle forslaget.' using errcode='42501';end if;
 perform 1 from public.company_module_access where company_id=p_company_id and module_key='kshms' for update;
 select * into r from checklist_private.template_proposals where id=p_id and company_id=p_company_id for update;
 x:=checklist_private.proposal_context(p_company_id);
 if not (x->>'can_review')::boolean or r.id is null then raise exception 'Forslaget er ikke tilgjengelig for godkjenning.' using errcode='42501';end if;
 if p_request_id is null or p_decision is null or p_decision not in ('approve','reject') or length(note)>2000 or (p_decision='reject' and note='') then raise exception 'Velg godkjenning eller skriv en begrunnelse for avslaget.' using errcode='22023';end if;
 digest:=encode(sha256(convert_to(jsonb_build_object('revision',p_revision,'decision',p_decision,'note',note)::text,'UTF8')),'hex');
 if r.review_request_id=p_request_id and r.reviewed_by=auth.uid() and r.review_hash=digest then return r.review_result;end if;
 if r.status<>'pending' or r.revision is distinct from p_revision then raise exception 'Forslaget er allerede behandlet eller er endret. Oppdater oversikten.' using errcode='PT409';end if;
 if p_decision='approve' then
  if not (x->>'can_publish')::boolean then raise exception 'Firmaet må ha aktivert KS/HMS før en firmamal kan godkjennes.' using errcode='42501';end if;
  snapshot:=kshms_private.checklist_snapshot(p_company_id,r.target_template_id,r.definition);
  insert into public.kshms_checklist_templates(id,company_id,draft,created_by,updated_by) values(r.target_template_id,p_company_id,r.definition,auth.uid(),auth.uid()) returning * into t;
  insert into public.kshms_checklist_versions(company_id,template_id,number,content,content_hash,published_by,published_identity)
   values(p_company_id,t.id,1,snapshot,encode(sha256(convert_to(snapshot::text,'UTF8')),'hex'),auth.uid(),kshms_private.identity_snapshot(auth.uid())) returning * into v;
 end if;
 update checklist_private.template_proposals set status=case when p_decision='approve' then 'approved' else 'rejected' end,revision=revision+1,
 reviewed_by=auth.uid(),reviewed_at=now(),decision_note=note,review_request_id=p_request_id,review_hash=digest,template_id=t.id,version_id=v.id where id=r.id returning * into r;
 result:=jsonb_build_object('context',x,'record',to_jsonb(r)-'review_result','version',case when v.id is not null then to_jsonb(v) else null end);
 update checklist_private.template_proposals set review_result=result where id=r.id;
 insert into public.kshms_audit(company_id,actor_id,action,object_id) values(p_company_id,auth.uid(),'checklist-proposal-'||p_decision,r.id);
 return result;
end $$;
revoke all on function public.checklist_template_proposal_state(uuid,uuid,timestamptz,uuid),public.checklist_template_proposal_submit(uuid,uuid,jsonb),public.checklist_template_proposal_review(uuid,uuid,bigint,uuid,text,text) from public,anon,service_role;
grant execute on function public.checklist_template_proposal_state(uuid,uuid,timestamptz,uuid),public.checklist_template_proposal_submit(uuid,uuid,jsonb),public.checklist_template_proposal_review(uuid,uuid,bigint,uuid,text,text) to authenticated;
notify pgrst,'reload schema';
