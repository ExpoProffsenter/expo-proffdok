import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const {PGlite}=await import(process.env.HR_PGLITE_PATH||'@electric-sql/pglite');
const db=new PGlite();let checks=0;
const eq=(a,b,n)=>{assert.deepEqual(a,b,n);checks++;};
const sql=v=>v==null?'null':"'"+String(v).replaceAll("'","''")+"'";
const uuid=n=>`98000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const migration='supabase/migrations/20261016190242_smart_price_search.sql';
const actor=async({access=true,net=false,uid=uuid(1)}={})=>db.exec(`reset role;select set_config('request.jwt.claim.sub',${sql(uid)},false);select set_config('qa.access',${sql(String(access))},false);select set_config('qa.net',${sql(String(net))},false);set role authenticated;`);
const search=async(query,limit=30,offset=0)=>(await db.query('select * from public.search_internal_store_catalog_prices_smart($1,$2,$3)',[query,limit,offset])).rows;
const rejects=async(fn,code)=>{await assert.rejects(fn,e=>e.code===code);checks++;};
try{
await db.exec(`create role anon;create role authenticated;create schema auth;
create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
create function public.current_user_has_internal_store_price_search_access() returns boolean language sql as $$select coalesce(current_setting('qa.access',true),'false')='true'$$;
create function public.current_user_has_feature_access(text) returns boolean language sql as $$select coalesce(current_setting('qa.net',true),'false')='true'$$;
create function public.internal_store_catalog_normalize_sku(text) returns text language sql immutable as $$select upper(trim(coalesce($1,'')))$$;
create function public.internal_store_catalog_normalize_gtin(text) returns text language sql immutable as $$select nullif(regexp_replace(coalesce($1,''),'\\D','','g'),'')$$;
create table public.internal_store_catalog_imports(id uuid primary key,status text);
create table public.internal_store_catalog_items(id uuid primary key,supplier_name text,supplier_product_number text,supplier_product_number_key text,description text,gtin text,nobb_number text,product_url text,image_url text,product_group text,price_date date,purchase_net_ex_vat numeric,customer_price_ex_vat numeric,customer_price_incl_vat numeric,purchase_discount_percent numeric,gross_margin_percent numeric,last_import_id uuid,is_active boolean,search_text text);
alter table public.internal_store_catalog_items enable row level security;
grant usage on schema public,auth to authenticated,anon;
insert into public.internal_store_catalog_imports values('${uuid(10)}','active'),('${uuid(11)}','inactive');`);
await db.exec(await fs.readFile(migration,'utf8'));
const fixtures=[['Oras Direkte','A-230','ORAS OPTIMA STYLE, KJØKKENKRAN BØRSTET BRONSE 230/9V HYBRID','07000000000001'],['Oras Direkte','B-5553','SERVANTKRAN MEDIPRO 5553F','07000000000002'],['Tapwell','C-071','VIC071 ASCOT GREY SERVANTBATTERI','07000000000003'],['Tapwell','D-069','ARM069 BIDÉ MATTSVART-SERVANTBATTERI','07000000000004'],['Farveringen','AA-12','BATTERI LONGLIFE POWER AA 12PK','07000000000005'],['QA','E-001','TOALETT VEGGHENGT HVIT 60CM','07000000000006'],['QA','E-002','WC VEGGHENGT SORT 60CM','07000000000007']];
for(let n=0;n<fixtures.length;n++){
 const [supplier,number,description,gtin]=fixtures[n];
 await db.query(`insert into public.internal_store_catalog_items(id,supplier_name,supplier_product_number,supplier_product_number_key,description,gtin,product_group,price_date,purchase_net_ex_vat,customer_price_ex_vat,customer_price_incl_vat,purchase_discount_percent,gross_margin_percent,last_import_id,is_active,search_text) values($1,$2,$3,upper($3),$4,$5,'Armatur','2026-10-16',100,200,250,20,50,$6,true,lower($2||' '||$3||' '||$4||' '||$5||' Armatur'))`,[uuid(100+n),supplier,number,description,gtin,uuid(10)]);
}
// Inactive product/import never appears, even by exact code.
await db.exec(`insert into public.internal_store_catalog_items(id,supplier_name,supplier_product_number,supplier_product_number_key,description,last_import_id,is_active,search_text) values('${uuid(200)}','QA','DEAD','DEAD','WC SORT','${uuid(10)}',false,'wc sort dead'),('${uuid(201)}','QA','OLD','OLD','WC SORT','${uuid(11)}',true,'wc sort old');`);
await actor();
eq((await search('bronse Oras kjøkkenbatteri')).map(x=>x.supplier_product_number),['A-230'],'reordered words + supplier + kitchen tap alias');
eq((await search('kjokkenbatteri oras')).map(x=>x.supplier_product_number),['A-230'],'ASCII Norwegian spelling');
eq((await search('medipro oras servantbatteri')).map(x=>x.supplier_product_number),['B-5553'],'servantkran alias');
eq((await search('servbatt tapwell')).length,2,'trade abbreviation');
eq((await search('tapwell sort servantbatteri')).map(x=>x.supplier_product_number),['D-069'],'joined mattsvart and sort alias');
eq((await search('tapwell hvit servantbatteri')).length,0,'all color/brand/product constraints retained');
eq((await search('toalett 60')).length,2,'all word constraints independent of order');
eq((await search('wc sort 60')).length,1,'dimensions retained');
eq((await search('wc sort 90')).length,0,'different dimension never relaxed');
eq((await search('servantbatteri')).some(x=>x.supplier_product_number==='AA-12'),false,'tap aliases do not match generic batteries');
eq((await search('a-230'))[0]?.match_kind,'number','exact SKU first');
eq((await search('07000000000001'))[0]?.supplier_product_number,'A-230','barcode lookup remains exact');
eq((await search('servantbatteri'))[0]?.match_kind,'words','literal word matches before aliases');
eq((await search('medipro servantbatteri'))[0]?.match_kind,'related','alias disclosed');
for(const word of ['DEAD','OLD'])eq((await search(word)).length,0,'inactive cannot be recovered '+word);
for(const word of ['', 'a', '%_', "'; drop table public.internal_store_catalog_items; --"]){eq((await search(word)).length,0,'empty/special/injection query stays harmless '+word);}
await rejects(()=>search('a '.repeat(81)),'22023');await rejects(()=>search('one two three four five six seven eight nine ten eleven'),'22023');
let rows=await search('servant');eq(rows.length,3,'full result set');eq(rows[0].total_count,3,'correct total');
const first=await search('servant',1,0),second=await search('servant',1,1),third=await search('servant',1,2);
eq(new Set([...first,...second,...third].map(x=>x.id)).size,3,'stable nonduplicating pages');eq(first[0].total_count,3,'total independent of page size');eq((await search('servant',1,3)).length,0,'end of pages');
for(const field of ['purchase_net_ex_vat','purchase_discount_percent','gross_margin_percent'])eq(rows.every(x=>x[field]===null),true,'masked '+field);
eq(Number(rows[0].customer_price_incl_vat),250,'customer price preserved');
await actor({net:true});rows=await search('medipro');eq(Number(rows[0].purchase_net_ex_vat),100,'authorized net');eq(Number(rows[0].purchase_discount_percent),20,'authorized discount');eq(Number(rows[0].gross_margin_percent),50,'authorized margin');
await rejects(()=>db.query('select * from public.internal_store_catalog_items'),'42501');await rejects(()=>db.query("select public.internal_store_catalog_smart_patterns('wc')"),'42501');
await actor({access:false,net:true});await rejects(()=>search('wc'),'42501');await actor({uid:''});await rejects(()=>search('wc'),'42501');
await db.exec('reset role;set role anon');await rejects(()=>search('wc'),'42501');
await db.exec("reset role;update public.internal_store_catalog_imports set status='loading' where id='"+uuid(11)+"';");await actor();await rejects(()=>search('wc'),'55000');
await db.exec('reset role');eq((await db.query('select count(*)::int as n from public.internal_store_catalog_items')).rows[0].n,9,'searches never mutate catalog');
console.log('smart-price-search-db-check: '+checks+' PostgreSQL checks PASS (real migration, aliases/order, IDs, pagination, masking, denied access, import and no catalog writes).');
}finally{await db.close();}
