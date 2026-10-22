-- Sandbox-only parked HR ledger callback; never merge demo overlay into main.
do $migration$
declare definition text; changed text; before_acl aclitem[];
begin
 select pg_get_functiondef(oid),proacl into definition,before_acl from pg_proc
 where oid='public.hr_ledger_ack(text,text,bigint,text,jsonb)'::regprocedure;
 if md5(definition) <> '5cf05722f351bca6543d5c95499bb1c2' then raise exception 'Sandbox ledger callback changed; inspect before migration.';end if;
 changed:=replace(definition,$old$errcode='40001'$old$,$new$errcode='PT409'$new$);
 execute changed;
 if (select pg_get_functiondef(oid) is distinct from changed or proacl is distinct from before_acl from pg_proc where oid='public.hr_ledger_ack(text,text,bigint,text,jsonb)'::regprocedure)
 then raise exception 'Sandbox ledger callback or ACL preservation failed.';end if;
end
$migration$;
