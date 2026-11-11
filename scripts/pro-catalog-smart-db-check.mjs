import assert from 'node:assert/strict';import fs from 'node:fs/promises';
const {PGlite}=await import(process.env.HR_PGLITE_PATH||'@electric-sql/pglite');const db=new PGlite();let count=0;
const eq=(a,b,m)=>{assert.deepEqual(a,b,m);count++;};
try{
await db.exec(`create role anon;create role authenticated;create schema auth;
create function auth.uid() returns uuid language sql as $$select nullif(current_setting('qa.user',true),'')::uuid$$;
create function public.current_profile_is_systemadmin() returns boolean language sql as $$select current_setting('qa.admin',true)='true'$$;
create function public.current_user_has_pro_store_catalog_access() returns boolean language sql as $$select current_setting('qa.access',true)='true'$$;
create function public.current_user_can_view_store_catalog_net_price() returns boolean language sql as $$select current_setting('qa.net',true)='true'$$;
create function public.current_sales_company_id() returns uuid language sql as $$select current_setting('qa.company')::uuid$$;
create function public.internal_store_catalog_normalize_sku(text) returns text language sql as $$select upper(trim($1))$$;
create function public.internal_store_catalog_normalize_gtin(text) returns text language sql as $$select nullif(regexp_replace($1,'[^0-9]','','g'),'')$$;
create table public.internal_store_catalog_imports(id uuid,status text);
create table public.internal_store_catalog_items(id uuid,supplier_key text,supplier_name text,supplier_product_number text,supplier_product_number_key text,description text,gtin text,nobb_number text,product_url text,image_url text,product_group text,price_date date,customer_price_ex_vat numeric,customer_price_incl_vat numeric,is_active boolean,last_import_id uuid,search_text text);
create table public.store_catalog_company_supplier_access(company_id uuid,supplier_key text,is_active boolean,discount_percent numeric);
insert into public.internal_store_catalog_imports values('00000000-0000-4000-8000-000000000001','active');
insert into public.internal_store_catalog_items(id,supplier_key,supplier_name,supplier_product_number,supplier_product_number_key,description,customer_price_ex_vat,customer_price_incl_vat,is_active,last_import_id,search_text) values
('00000000-0000-4000-8000-000000000011','allowed','Leverandør','A1','A1','Oras servantkran krom',100,125,true,'00000000-0000-4000-8000-000000000001','oras servantkran krom'),
('00000000-0000-4000-8000-000000000012','other','Annen','A2','A2','Oras servantkran krom',200,250,true,'00000000-0000-4000-8000-000000000001','oras servantkran krom');
insert into public.store_catalog_company_supplier_access values
('00000000-0000-4000-8000-000000000002','allowed',true,30),
('00000000-0000-4000-8000-000000000003','other',true,10);
select set_config('qa.user','00000000-0000-4000-8000-000000000004',false),set_config('qa.company','00000000-0000-4000-8000-000000000002',false),set_config('qa.access','true',false),set_config('qa.net','true',false),set_config('qa.admin','false',false);`);
const aliases=await fs.readFile('supabase/migrations/20261016190242_smart_price_search.sql','utf8');await db.exec(aliases.slice(0,aliases.indexOf('create or replace function public.search_internal_store_catalog_prices_smart')));
await db.exec(await fs.readFile('supabase/migrations/20261111164011_pro_catalog_smart_search.sql','utf8'));
await db.exec('set role authenticated');
const search=async(q,company=null)=>(await db.query('select * from public.search_pro_store_catalog_smart($1,30,0,$2)',[q,company])).rows;
let rows=await search('krom oras servantbatteri');eq(rows.length,1,'all words, reversed order and trade aliases');eq(rows[0].supplier_product_number,'A1','only agreed supplier');eq(Number(rows[0].my_net_price_ex_vat),70,'own company discount');
for(const field of ['purchase_net_ex_vat','purchase_discount_percent','gross_margin_percent'])eq(Object.hasOwn(rows[0],field),false,'internal price never returned');
eq((await search('A1'))[0].match_kind,'number','exact number');eq((await search('ukjent')).length,0,'real empty result');
await assert.rejects(()=>search('oras','00000000-0000-4000-8000-000000000003'),e=>e.code==='42501');count++;
await db.exec("select set_config('qa.net','false',false)");eq((await search('oras'))[0].my_net_price_ex_vat,null,'revoked price access masked');
await db.exec("select set_config('qa.admin','true',false)");rows=await search('oras','00000000-0000-4000-8000-000000000003');eq(rows[0].supplier_product_number,'A2','support uses selected company supplier');eq(Number(rows[0].my_net_price_ex_vat),180,'support selected company price');
await db.exec("select set_config('qa.access','false',false)");await assert.rejects(()=>search('oras'),e=>e.code==='42501');count++;
await db.exec('reset role;set role anon');await assert.rejects(()=>search('oras'),e=>e.code==='42501');count++;
console.log(`Pro catalog smart search: ${count} SQL assertions PASS; aliases, exact code, supplier isolation, own price, revoked access, support scope and anonymous denial.`);
}finally{await db.close();}
