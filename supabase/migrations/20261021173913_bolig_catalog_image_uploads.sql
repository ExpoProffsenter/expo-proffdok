-- Private, immutable catalog images. Existing choice/order snapshots keep their
-- original object reference when a manager replaces or removes a catalog image.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('bolig-catalog-images','bolig-catalog-images',false,2097152,array['image/jpeg'])
on conflict(id) do nothing;
create function public.bolig_catalog_image_access(object_name text, writing boolean default false)
returns boolean language plpgsql stable security definer set search_path='' as $$
declare c uuid; root uuid; ctx jsonb; archived boolean;
begin
 if auth.uid() is null or object_name !~ '^[a-f0-9-]{36}/[a-f0-9-]{36}/[a-f0-9-]{36}[.]jpg$' then return false;end if;
 c:=split_part(object_name,'/',1)::uuid;root:=split_part(object_name,'/',2)::uuid;
 ctx:=bolig_private.context(c);
 if not coalesce((ctx->>'enabled')::boolean,false) then return false;end if;
 select r.archived into archived from bolig_private.roots r where r.id=root and r.company_id=c;
 if not found then return false;end if;
 return not writing or (ctx->>'role'='manager' and not archived);
exception when invalid_text_representation or insufficient_privilege then return false;
end$$;
revoke all on function public.bolig_catalog_image_access(text,boolean) from public,anon,service_role;
grant execute on function public.bolig_catalog_image_access(text,boolean) to authenticated;
create policy bolig_catalog_images_read on storage.objects for select to authenticated
using(bucket_id='bolig-catalog-images' and public.bolig_catalog_image_access(name,false));
create policy bolig_catalog_images_insert on storage.objects for insert to authenticated
with check(bucket_id='bolig-catalog-images' and public.bolig_catalog_image_access(name,true));
-- No UPDATE or DELETE: replacing an image always creates a new object. Old
-- snapshots remain readable; removing an image only detaches its reference.
