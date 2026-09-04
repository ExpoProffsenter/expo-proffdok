-- Expo ProffDok – FASE 35B
-- Prosjektinvolverte som felles distribusjonsliste og varsler etter utsendt prosjektmail.

create table if not exists public.project_participants (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null default '',
  company text not null default '',
  role text not null default '',
  email text not null default '',
  phone text not null default '',
  receive_email boolean not null default true,
  created_by uuid null references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists project_participants_project_email_uq
  on public.project_participants (project_id, lower(email))
  where btrim(email) <> '';
create index if not exists project_participants_project_idx
  on public.project_participants (project_id);

alter table public.project_participants enable row level security;
revoke all on public.project_participants from anon;
grant select, insert, update, delete on public.project_participants to authenticated;

drop policy if exists project_participants_select_scoped on public.project_participants;
create policy project_participants_select_scoped on public.project_participants
for select to authenticated
using (exists (
  select 1 from public.projects p
  where p.id = project_id
    and public.project_row_access_allowed(p.company_scope_id, p.user_id)
));

drop policy if exists project_participants_insert_scoped on public.project_participants;
create policy project_participants_insert_scoped on public.project_participants
for insert to authenticated
with check (exists (
  select 1 from public.projects p
  where p.id = project_id
    and public.project_row_access_allowed(p.company_scope_id, p.user_id)
));

drop policy if exists project_participants_update_scoped on public.project_participants;
create policy project_participants_update_scoped on public.project_participants
for update to authenticated
using (exists (
  select 1 from public.projects p
  where p.id = project_id
    and public.project_row_access_allowed(p.company_scope_id, p.user_id)
))
with check (exists (
  select 1 from public.projects p
  where p.id = project_id
    and public.project_row_access_allowed(p.company_scope_id, p.user_id)
));

drop policy if exists project_participants_delete_scoped on public.project_participants;
create policy project_participants_delete_scoped on public.project_participants
for delete to authenticated
using (exists (
  select 1 from public.projects p
  where p.id = project_id
    and public.project_row_access_allowed(p.company_scope_id, p.user_id)
));

create table if not exists public.project_participant_notices (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  recipient_email text not null,
  subject text not null default '',
  message text not null default '',
  mail_kind text not null default 'project_update',
  sent_by uuid null references auth.users(id) on delete set null default auth.uid(),
  sent_at timestamptz not null default now(),
  read_at timestamptz null
);

create index if not exists project_participant_notices_recipient_idx
  on public.project_participant_notices (lower(recipient_email), sent_at desc);
create index if not exists project_participant_notices_project_idx
  on public.project_participant_notices (project_id, sent_at desc);

alter table public.project_participant_notices enable row level security;
revoke all on public.project_participant_notices from anon;
grant select, insert, update on public.project_participant_notices to authenticated;

drop policy if exists project_participant_notices_select_scoped on public.project_participant_notices;
create policy project_participant_notices_select_scoped on public.project_participant_notices
for select to authenticated
using (
  lower(recipient_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  or exists (
    select 1 from public.projects p
    where p.id = project_id
      and public.project_row_access_allowed(p.company_scope_id, p.user_id)
  )
);

drop policy if exists project_participant_notices_insert_scoped on public.project_participant_notices;
create policy project_participant_notices_insert_scoped on public.project_participant_notices
for insert to authenticated
with check (
  exists (
    select 1 from public.projects p
    where p.id = project_id
      and public.project_row_access_allowed(p.company_scope_id, p.user_id)
  )
  and exists (
    select 1 from public.project_participants pp
    where pp.project_id = project_id
      and pp.receive_email = true
      and lower(pp.email) = lower(recipient_email)
  )
);

drop policy if exists project_participant_notices_update_scoped on public.project_participant_notices;
create policy project_participant_notices_update_scoped on public.project_participant_notices
for update to authenticated
using (
  lower(recipient_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  or exists (
    select 1 from public.projects p
    where p.id = project_id
      and public.project_row_access_allowed(p.company_scope_id, p.user_id)
  )
)
with check (
  lower(recipient_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  or exists (
    select 1 from public.projects p
    where p.id = project_id
      and public.project_row_access_allowed(p.company_scope_id, p.user_id)
  )
);
