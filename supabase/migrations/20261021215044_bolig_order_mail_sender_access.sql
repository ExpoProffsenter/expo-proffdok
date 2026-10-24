-- Supplier-order sending is a Boligprosjekter manager capability. Cordel is a
-- generated receiver attachment, not a permission the ordering user must hold.
-- Existing Cordel export access elsewhere in the application is unchanged.
do $patch$
declare body text;old text;
begin
 body:=pg_get_functiondef('bolig_private.order_mail(uuid,uuid,uuid,text,jsonb)'::regprocedure);
 old:=$a$if ctx->>'role' is distinct from 'manager' or not coalesce(public.get_cordel_export_access(),false) then raise exception 'Prosjektleder- og Cordel-tilgang kreves for bestilling med vedlegg.' using errcode='42501';end if;$a$;
 if position(old in body)=0 then raise exception 'Missing order-mail sender authorization anchor';end if;
 body:=replace(body,old,$a$if ctx->>'role' is distinct from 'manager' then raise exception 'Prosjektledertilgang kreves for å sende bestilling.' using errcode='42501';end if;$a$);
 body:=replace(body,'Kontroller mottaker og Cordel-fagområde for hver vare.','Kontroller mottaker og vareleverandør for hver vare.');
 body:=replace(body,'Hver vare må ha gyldig varenummer og leverandør/fagområde for Cordel.','Hver vare må ha gyldig varenummer og vareleverandør.');
 execute body;
end$patch$;
