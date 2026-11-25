-- Additive, private support storage. Existing access/email functions are untouched.
create schema support_private;
revoke all on schema support_private from public,anon,authenticated,service_role;
create table support_private.tickets (
 id uuid primary key,
 number bigint generated always as identity unique,
 company_id uuid not null references public.sales_company_scopes(id),
 owner_id uuid not null references auth.users(id),
 subject text not null check(length(subject) between 1 and 160),
 category text not null check(category in ('question','error','suggestion')),
 status text not null default 'new' check(status in ('new','working','solved')),
 assigned_id uuid references auth.users(id),
 revision integer not null default 1,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 owner_seen_at timestamptz,
 admin_seen_at timestamptz,
 reply_token text not null default replace(gen_random_uuid()::text,'-','') unique
);
create table support_private.messages (
 id uuid primary key,
 ticket_id uuid not null references support_private.tickets(id),
 author_id uuid not null references auth.users(id),
 kind text not null check(kind in ('user','support','internal')),
 source text not null default 'app' check(source in ('app','email')),
 body text not null check(length(body) between 1 and 12000),
 created_at timestamptz not null default now(),
 message_id text,
 references_header text
);
create table support_private.outbox (
 id uuid primary key default gen_random_uuid(),
 message_id uuid not null unique references support_private.messages(id),
 audience text not null check(audience in ('internal','user')),
 state text not null default 'pending' check(state in ('pending','sending','accepted','failed','uncertain','review')),
 first_attempt_at timestamptz,
 lease_until timestamptz,
 lease_id uuid,
 provider_id text,
 attempts integer not null default 0
);
create table support_private.inbound_events (
 provider_id text primary key,
 message_id text not null unique,
 ticket_id uuid not null references support_private.tickets(id),
 created_at timestamptz not null default now()
);
create index support_ticket_owner_idx on support_private.tickets(owner_id,company_id,updated_at desc);
create index support_ticket_updated_idx on support_private.tickets(updated_at desc,id);
create index support_ticket_company_idx on support_private.tickets(company_id);
create index support_ticket_assigned_idx on support_private.tickets(assigned_id);
create index support_message_ticket_idx on support_private.messages(ticket_id,created_at,id);
create index support_message_author_idx on support_private.messages(author_id,created_at);
create index support_inbound_ticket_idx on support_private.inbound_events(ticket_id);
alter table support_private.tickets enable row level security;
alter table support_private.messages enable row level security;
alter table support_private.outbox enable row level security;
alter table support_private.inbound_events enable row level security;
revoke all on all tables in schema support_private from public,anon,authenticated,service_role;
revoke all on all sequences in schema support_private from public,anon,authenticated,service_role;

create function support_private.active_user(p_user uuid,p_company uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles p join auth.users u on u.id=p.id
 where p.id=p_user and p.approved and not coalesce(p.deactivated,false)
 and u.email_confirmed_at is not null and (u.banned_until is null or u.banned_until<now())
 and exists(select 1 from public.sales_company_memberships m where m.user_id=p_user and m.company_id=p_company))
$$;
create function support_private.check_actor(p_company uuid,p_admin boolean default false) returns void
language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or p_company is null
 or p_company is distinct from public.current_active_company_scope_id()
 or not exists(select 1 from public.profiles p join auth.users u on p.id=u.id
 where p.id=auth.uid() and p.approved and not coalesce(p.deactivated,false)
 and u.email_confirmed_at is not null and (u.banned_until is null or u.banned_until<now()))
 or not (coalesce(public.current_profile_is_systemadmin(),false) or support_private.active_user(auth.uid(),p_company))
 or (p_admin and not coalesce(public.current_profile_is_systemadmin(),false))
 then raise exception 'Du har ikke tilgang til support i dette firmaet.' using errcode='42501'; end if;
end; $$;
create function support_private.check_ticket(p_company uuid,p_ticket uuid,p_admin boolean) returns void
language plpgsql stable security definer set search_path='' as $$
begin
 perform support_private.check_actor(p_company,p_admin);
 if not exists(select 1 from support_private.tickets t where t.id=p_ticket
 and (p_admin or (t.owner_id=auth.uid() and t.company_id=p_company)))
 then raise exception 'Supportsaken er ikke tilgjengelig.' using errcode='42501'; end if;
end; $$;
create function support_private.ticket_json(t support_private.tickets,p_admin boolean) returns jsonb
language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',t.id,'number',t.number,'subject',t.subject,'category',t.category,
 'status',t.status,'revision',t.revision,'created_at',t.created_at,'updated_at',t.updated_at,
 'company',case when p_admin then (select display_name from public.sales_company_scopes where id=t.company_id) end,
 'owner',case when p_admin then (select email from auth.users where id=t.owner_id) end,
 'assigned_id',case when p_admin then t.assigned_id end,
 'unread',exists(select 1 from support_private.messages m where m.ticket_id=t.id and
 case when p_admin then m.kind='user' and m.created_at>coalesce(t.admin_seen_at,'-infinity')
 else m.kind='support' and m.created_at>coalesce(t.owner_seen_at,'-infinity') end))
$$;
create function public.support_context() returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare c uuid:=public.current_active_company_scope_id(); a boolean:=coalesce(public.current_profile_is_systemadmin(),false);
begin
 perform support_private.check_actor(c);
 return jsonb_build_object('user_id',auth.uid(),'company_id',c,'is_admin',a,
 'company',(select display_name from public.sales_company_scopes where id=c),
 'sender',(select email from auth.users where id=auth.uid()),
 'admins',case when a then coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'label',u.email) order by u.email)
 from public.profiles p join auth.users u on u.id=p.id where p.system_role='systemadmin'
 and p.approved and not coalesce(p.deactivated,false)),'[]'::jsonb) else '[]'::jsonb end);
end; $$;
create function public.support_list(p_company_id uuid,p_admin boolean default false,p_offset integer default 0,p_status text default '') returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 perform support_private.check_actor(p_company_id,p_admin);
 if p_offset is null or p_offset<0 or p_offset>100000 or p_status is null or p_status not in ('','new','working','solved')
 then raise exception 'Ugyldig side eller status.' using errcode='22023'; end if;
 return jsonb_build_object('items',coalesce((select jsonb_agg(s.value order by s.updated_at desc,s.id) from
 (select support_private.ticket_json(t,p_admin) value,t.updated_at,t.id from support_private.tickets t
 where (p_admin or (t.company_id=p_company_id and t.owner_id=auth.uid())) and (p_status='' or t.status=p_status)
 order by t.updated_at desc,t.id limit 40 offset p_offset) s),'[]'::jsonb),
 'total',(select count(*) from support_private.tickets t where (p_admin or (t.company_id=p_company_id and t.owner_id=auth.uid())) and (p_status='' or t.status=p_status)));
end; $$;
create function public.support_get(p_company_id uuid,p_ticket_id uuid,p_admin boolean default false) returns jsonb
language plpgsql security definer set search_path='' as $$
declare t support_private.tickets%rowtype;
begin
 perform support_private.check_ticket(p_company_id,p_ticket_id,p_admin);
 select * into t from support_private.tickets where id=p_ticket_id for update;
 if p_admin then update support_private.tickets set admin_seen_at=now() where id=t.id;
 else update support_private.tickets set owner_seen_at=now() where id=t.id; end if;
 return jsonb_build_object('ticket',support_private.ticket_json(t,p_admin),
 'messages',coalesce((select jsonb_agg(jsonb_build_object('id',m.id,'kind',m.kind,'source',m.source,
 'body',m.body,'created_at',m.created_at,'delivery',o.state) order by m.created_at,m.id)
 from support_private.messages m left join support_private.outbox o on o.message_id=m.id
 where m.ticket_id=t.id and (p_admin or m.kind<>'internal')),'[]'::jsonb));
end; $$;
create function public.support_create(p_company_id uuid,p_id uuid,p_subject text,p_category text,p_body text) returns uuid
language plpgsql security definer set search_path='' as $$
declare t support_private.tickets%rowtype;
begin
 perform support_private.check_actor(p_company_id);
 if p_id is null or length(btrim(p_subject)) not between 1 and 160 or p_subject ~ '[[:cntrl:]]'
 or p_category is null or p_category not in ('question','error','suggestion')
 or p_body is null or length(btrim(p_body)) not between 1 and 12000 or p_subject is null
 then raise exception 'Fyll ut emne, kategori og beskrivelse.' using errcode='22023'; end if;
 perform 1 from public.profiles where id=auth.uid() for update;
 select * into t from support_private.tickets where id=p_id;
 if found then
  if t.owner_id<>auth.uid() or t.company_id<>p_company_id or t.subject<>btrim(p_subject) or t.category<>p_category
  or not exists(select 1 from support_private.messages where id=p_id and body=btrim(p_body))
  then raise exception 'Lagringsnøkkelen er allerede brukt.' using errcode='22023'; end if;
  return t.id;
 end if;
 if (select count(*) from support_private.tickets where owner_id=auth.uid() and created_at>now()-interval '1 hour')>=10
 then raise exception 'Du har sendt mange saker. Vent litt før du oppretter en ny.' using errcode='54000'; end if;
 insert into support_private.tickets(id,company_id,owner_id,subject,category) values(p_id,p_company_id,auth.uid(),btrim(p_subject),p_category);
 insert into support_private.messages(id,ticket_id,author_id,kind,body) values(p_id,p_id,auth.uid(),'user',btrim(p_body));
 insert into support_private.outbox(message_id,audience) values(p_id,'internal');
 return p_id;
end; $$;
create function public.support_reply(p_company_id uuid,p_ticket_id uuid,p_id uuid,p_body text,p_admin boolean default false,p_internal boolean default false) returns uuid
language plpgsql security definer set search_path='' as $$
declare m support_private.messages%rowtype; k text:=case when p_admin then case when p_internal then 'internal' else 'support' end else 'user' end;
begin
 perform support_private.check_ticket(p_company_id,p_ticket_id,p_admin);
 if p_id is null or p_body is null or length(btrim(p_body)) not between 1 and 12000 or (p_internal and not p_admin)
 then raise exception 'Skriv en melding.' using errcode='22023'; end if;
 perform 1 from support_private.tickets where id=p_ticket_id for update;
 select * into m from support_private.messages where id=p_id;
 if found then
  if m.ticket_id<>p_ticket_id or m.author_id<>auth.uid() or m.body<>btrim(p_body) or m.kind<>k
  then raise exception 'Lagringsnøkkelen er allerede brukt.' using errcode='22023'; end if;
  return m.id;
 end if;
 if (select count(*) from support_private.messages where author_id=auth.uid() and created_at>now()-interval '1 hour')>=60
 then raise exception 'For mange meldinger. Vent litt og prøv igjen.' using errcode='54000'; end if;
 insert into support_private.messages(id,ticket_id,author_id,kind,body) values(p_id,p_ticket_id,auth.uid(),k,btrim(p_body));
 if k<>'internal' then insert into support_private.outbox(message_id,audience) values(p_id,case when p_admin then 'user' else 'internal' end); end if;
 update support_private.tickets set updated_at=now(),revision=revision+1,
 status=case when k='user' then 'new' when k='support' and status='new' then 'working' else status end where id=p_ticket_id;
 return p_id;
end; $$;
create function public.support_update(p_company_id uuid,p_ticket_id uuid,p_revision integer,p_status text,p_assigned_id uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 perform support_private.check_ticket(p_company_id,p_ticket_id,true);
 if p_status is null or p_status not in ('new','working','solved') or (p_assigned_id is not null and not exists(
 select 1 from public.profiles p where p.id=p_assigned_id and p.approved and not coalesce(p.deactivated,false) and p.system_role='systemadmin'))
 then raise exception 'Velg gyldig status og ansvarlig.' using errcode='22023'; end if;
 update support_private.tickets set status=p_status,assigned_id=p_assigned_id,revision=revision+1,updated_at=now()
 where id=p_ticket_id and revision=p_revision;
 if not found then raise exception 'Saken er endret. Oppdater før du lagrer.' using errcode='40001'; end if;
end; $$;
-- Browser receives only an opaque queue ID. Recipient/token are service-only.
create function public.support_delivery_authorize(p_company_id uuid,p_message_id uuid,p_admin boolean default false) returns uuid
language plpgsql stable security definer set search_path='' as $$
declare m support_private.messages%rowtype;
begin
 select * into m from support_private.messages where id=p_message_id;
 perform support_private.check_ticket(p_company_id,m.ticket_id,p_admin);
 if m.kind='internal' or (not p_admin and m.author_id<>auth.uid())
 then raise exception 'Du kan ikke sende denne meldingen.' using errcode='42501'; end if;
 return (select id from support_private.outbox where message_id=m.id);
end; $$;

create function public.support_mail_claim(p_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare o support_private.outbox%rowtype;m support_private.messages%rowtype;t support_private.tickets%rowtype;v_email text;lease uuid:=gen_random_uuid();
begin
 select * into o from support_private.outbox where id=p_id for update;
 if not found or o.state in ('accepted','review') or o.lease_until>now() then return null; end if;
 if o.first_attempt_at<now()-interval '23 hours' then update support_private.outbox set state='review' where id=p_id; return null; end if;
 select * into m from support_private.messages where id=o.message_id;
 select * into t from support_private.tickets where id=m.ticket_id;
 if not support_private.active_user(t.owner_id,t.company_id) or (m.kind='support' and not exists(select 1 from public.profiles p
 where p.id=m.author_id and p.approved and not coalesce(p.deactivated,false) and p.system_role='systemadmin'))
 then update support_private.outbox set state='failed' where id=p_id;return null;end if;
 select lower(email) into v_email from auth.users where id=t.owner_id;
 update support_private.outbox set state='sending',lease_until=now()+interval '45 seconds',lease_id=lease,
 first_attempt_at=coalesce(first_attempt_at,now()),attempts=attempts+1 where id=p_id;
 return jsonb_build_object('id',o.id,'lease_id',lease,'audience',o.audience,'email',v_email,
 'ticket_id',t.id,'number',t.number,'subject',t.subject,'body',case when o.audience='user' then m.body end,
 'reply_token',case when o.audience='user' then t.reply_token end,
 'references',(select string_agg(mm.message_id,' ' order by mm.created_at,mm.id) from support_private.messages mm where mm.ticket_id=t.id and mm.message_id is not null));
end; $$;
create function public.support_mail_finish(p_id uuid,p_lease_id uuid,p_state text,p_provider_id text default null,p_rfc_message_id text default null) returns void
language plpgsql security definer set search_path='' as $$
begin
 if p_state is null or p_state not in ('accepted','failed','uncertain') or (p_state='accepted' and coalesce(length(p_provider_id),0) not between 1 and 150)
 then raise exception 'Ugyldig sendestatus.' using errcode='22023';end if;
 update support_private.outbox set state=p_state,provider_id=p_provider_id,lease_until=null
 where id=p_id and lease_id=p_lease_id and state='sending';
 if found and p_state='accepted' and p_rfc_message_id ~ '^<[^<>[:space:]]+>$' and length(p_rfc_message_id)<=998 then
 update support_private.messages set message_id=p_rfc_message_id where id=(select message_id from support_private.outbox where id=p_id); end if;
end; $$;
create function public.support_inbound_store(p_provider_id text,p_message_id text,p_token text,p_sender text,p_body text,p_references text default null) returns uuid
language plpgsql security definer set search_path='' as $$
declare t support_private.tickets%rowtype;mid uuid:=gen_random_uuid();oid uuid;existing support_private.inbound_events%rowtype;
begin
 if p_provider_id is null or length(p_provider_id) not between 1 and 150 or p_message_id is null or length(p_message_id) not between 1 and 998
 or p_token is null or p_token !~ '^[a-f0-9]{32}$' or p_body is null or length(btrim(p_body)) not between 1 and 12000 or coalesce(length(p_references),0)>4000
 then raise exception 'Ugyldig innkommende melding.' using errcode='22023';end if;
 select * into t from support_private.tickets where reply_token=p_token for update;
 if not found or not support_private.active_user(t.owner_id,t.company_id) or not exists(select 1 from auth.users u where u.id=t.owner_id and lower(u.email)=lower(p_sender))
 then return null;end if;
 select * into existing from support_private.inbound_events where provider_id=p_provider_id or message_id=p_message_id;
 if found then return null;end if;
 if (select count(*) from support_private.messages where author_id=t.owner_id and source='email' and created_at>now()-interval '1 hour')>=30 then return null;end if;
 insert into support_private.inbound_events(provider_id,message_id,ticket_id) values(p_provider_id,p_message_id,t.id) on conflict do nothing;
 if not found then return null;end if;
 insert into support_private.messages(id,ticket_id,author_id,kind,source,body,message_id,references_header)
 values(mid,t.id,t.owner_id,'user','email',btrim(p_body),p_message_id,p_references);
 insert into support_private.outbox(message_id,audience) values(mid,'internal') returning id into oid;
 update support_private.tickets set status='new',revision=revision+1,updated_at=now() where id=t.id;
 return oid;
end; $$;
-- All privileged entry points explicitly revoke PostgreSQL's default PUBLIC execute.
revoke all on all functions in schema support_private from public,anon,authenticated,service_role;
revoke all on function public.support_context(),public.support_list(uuid,boolean,integer,text),public.support_get(uuid,uuid,boolean),public.support_create(uuid,uuid,text,text,text),public.support_reply(uuid,uuid,uuid,text,boolean,boolean),public.support_update(uuid,uuid,integer,text,uuid),public.support_delivery_authorize(uuid,uuid,boolean) from public,anon,service_role;
grant execute on function public.support_context(),public.support_list(uuid,boolean,integer,text),public.support_get(uuid,uuid,boolean),public.support_create(uuid,uuid,text,text,text),public.support_reply(uuid,uuid,uuid,text,boolean,boolean),public.support_update(uuid,uuid,integer,text,uuid),public.support_delivery_authorize(uuid,uuid,boolean) to authenticated;
revoke all on function public.support_mail_claim(uuid),public.support_mail_finish(uuid,uuid,text,text,text),public.support_inbound_store(text,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.support_mail_claim(uuid),public.support_mail_finish(uuid,uuid,text,text,text),public.support_inbound_store(text,text,text,text,text,text) to service_role;
