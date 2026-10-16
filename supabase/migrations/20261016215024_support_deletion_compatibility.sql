-- Support must not block pre-existing account/company deletion.
-- Erasing a ticket owner removes that owner's private support data. Removing a
-- support agent clears attribution/assignment while preserving another owner's
-- saved conversation. Pending mail rechecks the author's existence/role.
alter table support_private.tickets drop constraint tickets_company_id_fkey,
 add constraint tickets_company_id_fkey foreign key(company_id) references public.sales_company_scopes(id) on delete cascade;
alter table support_private.tickets drop constraint tickets_owner_id_fkey,
 add constraint tickets_owner_id_fkey foreign key(owner_id) references auth.users(id) on delete cascade;
alter table support_private.tickets drop constraint tickets_assigned_id_fkey,
 add constraint tickets_assigned_id_fkey foreign key(assigned_id) references auth.users(id) on delete set null;
alter table support_private.messages alter column author_id drop not null;
alter table support_private.messages drop constraint messages_author_id_fkey,
 add constraint messages_author_id_fkey foreign key(author_id) references auth.users(id) on delete set null;
alter table support_private.messages drop constraint messages_ticket_id_fkey,
 add constraint messages_ticket_id_fkey foreign key(ticket_id) references support_private.tickets(id) on delete cascade;
alter table support_private.outbox drop constraint outbox_message_id_fkey,
 add constraint outbox_message_id_fkey foreign key(message_id) references support_private.messages(id) on delete cascade;
alter table support_private.inbound_events drop constraint inbound_events_ticket_id_fkey,
 add constraint inbound_events_ticket_id_fkey foreign key(ticket_id) references support_private.tickets(id) on delete cascade;
