-- Preview rollout: old Demo stays compatible until both approved UIs are live.
-- Signed RPCs always require ink. Enforce legacy commands only after TEST OK,
-- Production verification and controlled main-to-demo sync; never client-writable.
create table kshms_private.execution_signature_rollout(singleton boolean primary key check(singleton),enforced boolean not null default false);
alter table kshms_private.execution_signature_rollout enable row level security;
revoke all on kshms_private.execution_signature_rollout from public,anon,authenticated,service_role;
insert into kshms_private.execution_signature_rollout(singleton) values(true);
-- Only normal execution checklists. No existing history is backfilled.
create function kshms_private.execution_signature_image(value text) returns text
language plpgsql immutable set search_path='' as $$
declare b bytea;w bigint;h bigint;
begin
 if coalesce(value,'')='' then return '';end if;
 if length(value) not between 128 and 180000 or value!~'^data:image/png;base64,[A-Za-z0-9+/]+={0,2}$' then raise exception 'Tegn en gyldig signatur i signaturfeltet.' using errcode='22023';end if;
 begin b:=decode(substring(value from 23),'base64');exception when others then raise exception 'Signaturen har ugyldig bildeformat.' using errcode='22023';end;
 if octet_length(b)<50 or encode(substring(b from 1 for 8),'hex')<>'89504e470d0a1a0a' or encode(substring(b from 13 for 4),'hex')<>'49484452' or encode(substring(b from octet_length(b)-7),'hex')<>'49454e44ae426082' then raise exception 'Signaturen har ugyldig PNG-format.' using errcode='22023';end if;
 w:=get_byte(b,16)*16777216::bigint+get_byte(b,17)*65536+get_byte(b,18)*256+get_byte(b,19);
 h:=get_byte(b,20)*16777216::bigint+get_byte(b,21)*65536+get_byte(b,22)*256+get_byte(b,23);
 if w not between 128 and 2000 or h not between 64 and 600 then raise exception 'Signaturen har ugyldig størrelse.' using errcode='22023';end if;
 return value;
end $$;

create function kshms_private.execution_checklist_signatures(value jsonb,previous jsonb,basis jsonb,record_id uuid,revision bigint,required boolean)
returns jsonb language plpgsql set search_path='' as $$
declare own_image text;external_image text;external_name text;external_role text;requested boolean;own jsonb;external jsonb;identity jsonb;stamp timestamptz:=clock_timestamp();digest text;old jsonb:=coalesce(previous,'{}');
begin
 if auth.uid() is null then raise exception 'Logg inn for å signere.' using errcode='42501';end if;
 if value is null or value='null'::jsonb then value:='{}';end if;
 if jsonb_typeof(value)<>'object' or jsonb_typeof(coalesce(value->'own','{}'))<>'object' or jsonb_typeof(coalesce(value->'external','{}'))<>'object' then raise exception 'Kontroller signaturfeltene.' using errcode='22023';end if;
 own_image:=kshms_private.execution_signature_image(value#>>'{own,image}');
 external_image:=kshms_private.execution_signature_image(value#>>'{external,image}');
 external_name:=coalesce(value#>>'{external,name}','');external_role:=coalesce(value#>>'{external,role}','');
 requested:=coalesce((value#>>'{external,requested}')::boolean,false);
 if length(external_name)>160 or length(external_role)>160 then raise exception 'Bruk inntil 160 tegn for navn og rolle.' using errcode='22023';end if;
 if required and own_image='' then raise exception 'Tegn din signatur før du fullfører sjekklisten.' using errcode='22023';end if;
 if required and (requested or external_image<>'' or external_name<>'' or external_role<>'') and (external_image='' or nullif(btrim(external_name),'') is null or nullif(btrim(external_role),'') is null) then raise exception 'Fyll inn navn, rolle/firma og ekstern signatur, eller fjern valget for ekstern signatur.' using errcode='22023';end if;
 if external_image<>'' and external_image=old#>>'{external,image}' and (external_name is distinct from old#>>'{external,name}' or external_role is distinct from old#>>'{external,role}') then raise exception 'Navn eller rolle er endret. Be den eksterne signataren signere på nytt.' using errcode='22023';end if;
 digest:=encode(sha256(convert_to(basis::text,'UTF8')),'hex');
 if old->>'basis_hash' is distinct from digest and (own_image<>'' and own_image=old#>>'{own,image}' or external_image<>'' and external_image=old#>>'{external,image}') then raise exception 'Svar eller grunnlag er endret. Tøm den gamle signaturen og signer på nytt.' using errcode='22023';end if;
 if own_image<>'' and own_image=old#>>'{own,image}' and old#>>'{own,user_id}' is distinct from auth.uid()::text then raise exception 'Den som fullfører må tegne sin egen signatur.' using errcode='22023';end if;
 identity:=kshms_private.identity_snapshot(auth.uid());
 own:=jsonb_build_object('image',own_image);
 if own_image<>'' then own:=own||jsonb_build_object('user_id',auth.uid(),'identity',case when own_image=old#>>'{own,image}' then old#>'{own,identity}' else identity end,'signed_at',case when own_image=old#>>'{own,image}' then old#>>'{own,signed_at}' else stamp::text end);end if;
 external:=jsonb_build_object('image',external_image,'name',external_name,'role',external_role,'requested',requested);
 if external_image<>'' then
  if external_image=old#>>'{external,image}' and external_name=old#>>'{external,name}' and external_role=old#>>'{external,role}' then external:=(old->'external')||jsonb_build_object('requested',requested);
  else external:=external||jsonb_build_object('signed_at',stamp,'witness',jsonb_build_object('identity',identity,'user_id',auth.uid()));end if;
 end if;
 return jsonb_build_object('own',own,'external',external,'record_id',record_id,'revision',revision,'basis_hash',digest);
end $$;
revoke all on function kshms_private.execution_signature_image(text),kshms_private.execution_checklist_signatures(jsonb,jsonb,jsonb,uuid,bigint,boolean) from public,anon,authenticated,service_role;
