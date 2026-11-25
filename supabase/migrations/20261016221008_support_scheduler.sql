-- Isolated support retry schedule. Installation never enables HTTP or mail.
create table support_private.worker_settings(
 singleton boolean primary key default true check(singleton),
 enabled boolean not null default false,
 endpoint text check(endpoint in (
  'https://dqffxflaoyarbxyiyhop.supabase.co/functions/v1/support-mail',
  'https://ppvircenkjizeiqdxphj.supabase.co/functions/v1/support-mail')),
 secret_id uuid not null,
 check(not enabled or endpoint is not null)
);
alter table support_private.worker_settings enable row level security;
revoke all on support_private.worker_settings from public,anon,authenticated,service_role;
insert into support_private.worker_settings(secret_id)
 values(vault.create_secret(replace(gen_random_uuid()::text||gen_random_uuid()::text,'-',''),
 'support_queue_worker','Private support queue authentication'));

create function public.support_worker_authorize(p_token text) returns boolean
language sql stable security definer set search_path='' as $$
 select coalesce(length(p_token) between 32 and 256 and exists(
  select 1 from support_private.worker_settings s
  join vault.decrypted_secrets v on v.id=s.secret_id
  where s.singleton and s.enabled and s.endpoint is not null
  and length(v.decrypted_secret)>=32
  and sha256(convert_to(v.decrypted_secret,'UTF8'))=sha256(convert_to(p_token,'UTF8'))
 ),false)
$$;
revoke all on function public.support_worker_authorize(text) from public,anon,authenticated;
grant execute on function public.support_worker_authorize(text) to service_role;

create function support_private.dispatch_queue() returns bigint
language plpgsql security definer set search_path='' as $$
declare cfg support_private.worker_settings; token text;
begin
 select * into cfg from support_private.worker_settings where singleton;
 if not found or not cfg.enabled or cfg.endpoint is null then return null; end if;
 select decrypted_secret into token from vault.decrypted_secrets where id=cfg.secret_id;
 if token is null or length(token)<32 then return null; end if;
 return net.http_post(url:=cfg.endpoint,
  headers:=jsonb_build_object('content-type','application/json','x-support-worker-token',token),
  body:='{}'::jsonb,timeout_milliseconds:=120000);
end; $$;
revoke all on function support_private.dispatch_queue() from public,anon,authenticated,service_role;
select cron.schedule('support-queue-worker','*/5 * * * *','select support_private.dispatch_queue();');
