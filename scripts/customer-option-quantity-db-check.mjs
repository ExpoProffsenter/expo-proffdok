const CONFLICT_CODE=process.env.QA_RPC_CONFLICT_POLICY==='1'?'PT409':'40001';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const { PGlite } = await import(process.env.HR_PGLITE_PATH || '@electric-sql/pglite');
const db = new PGlite();
let checks = 0;
const eq = (a, b, label) => { assert.deepEqual(a, b, label); checks++; };
const id = n => `98000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const options = [
  {id:'spot', title:'Spot', optionType:'addition', amount:'2400', quantity:'1', unit:'stk', customerCanChooseQuantity:true, supplierProductNumber:'SPOT-1'},
  {id:'fixed', title:'Fast tillegg', amount:'100', quantity:'2'},
  {id:'legacy', title:'Uten antall', amount:'1600,-'},
  {id:'alt', title:'Alternativ', optionType:'alternative', replacementLineId:'base', amount:'-100', quantity:'2'},
  {id:'alt2', title:'Alternativ 2', optionType:'alternative', replacementLineId:'base', amount:'10', quantity:'2'},
  {id:'free', title:'Gratis tillegg', amount:'0', customerCanChooseQuantity:true},
];
const rpc = async (selected, version=id(2), legacy=false) => (await db.query(
  legacy ? 'select public.accept_sales_offer($1,$2,$3::jsonb) result' : 'select public.accept_sales_offer_quantities($1,$2,$3::jsonb,$4) result',
  legacy ? [id(3),'QA kunde',JSON.stringify(selected)] : [id(3),'QA kunde',JSON.stringify(selected),version]
)).rows[0].result;
const transaction = async fn => { await db.exec('begin;'); try { await fn(); } finally { await db.exec('rollback;'); } };
const rejects = async (selected, code='22023', version=id(2), legacy=false) => transaction(async () => { await assert.rejects(() => rpc(selected,version,legacy), e=>e.code===code); checks++; });
try {
  await db.exec(`create role anon; create role authenticated;
    create table public.sales_offers(id uuid primary key, public_token uuid, active_version_id uuid, status text, accepted_at timestamptz, accepted_by text, accepted_payload jsonb, updated_at timestamptz);
    create table public.sales_offer_versions(id uuid primary key, offer_id uuid, version_number integer, lines jsonb, options jsonb, validity_days integer, total_ex_vat numeric, created_at timestamptz);
    alter table public.sales_offers enable row level security; alter table public.sales_offer_versions enable row level security;
    grant usage on schema public to anon, authenticated;`);
  await db.exec(await fs.readFile('supabase/migrations/20261017124151_customer_option_quantities.sql','utf8'));
  await db.query('insert into sales_offers(id,public_token,active_version_id,status) values($1,$2,$3,$4)',[id(1),id(3),id(2),'sent']);
  await db.query('insert into sales_offer_versions values($1,$2,1,$3::jsonb,$4::jsonb,30,10000,now())',[id(2),id(1),JSON.stringify([{id:'base',amount:10000}]),JSON.stringify(options)]);
  await db.exec('set role anon;');
  await assert.rejects(()=>db.query('select * from sales_offers'), e=>e.code==='42501'); checks++;
  await transaction(async()=>{
    const r=await rpc([{id:'spot',quantity:'4',amount:'0',title:'Forged',supplierProductNumber:'EVIL'},{id:'fixed',quantity:999,amount:0}]);
    eq(r.accepted_total,19800,'server computes base + 4 unit prices + fixed quantity');
    eq(r.selected_options[0].quantity,4); eq(r.selected_options[0].amount,'2400');
    eq(r.selected_options[0].title,'Spot'); eq(r.selected_options[0].supplierProductNumber,'SPOT-1');
    eq(r.selected_options[1].quantity,'2','fixed option ignores submitted quantity');
    eq(r.version_snapshot.options,options,'published snapshot remains original');
    await assert.rejects(()=>rpc([]),e=>e.code==='P0001');checks++;
  });
  await transaction(async()=>{ const r=await rpc([{id:'spot',quantity:'2,125'}]);eq(r.selected_options[0].quantity,2.125);eq(r.accepted_total,15100); });
  await transaction(async()=>{ const r=await rpc([{id:'legacy'},{id:'alt',quantity:999,amount:999}]);eq(r.accepted_total,11400);eq(r.selected_options[1].amount,'-100');eq(r.selected_options[1].quantity,'2'); });
  await transaction(async()=>{ const r=await rpc([{id:'free',quantity:3}]);eq(r.accepted_total,10000);eq(r.selected_options[0].quantity,3); });
  await transaction(async()=>eq((await rpc([])).accepted_total,10000,'no option selected'));
  await transaction(async()=>eq((await rpc([{id:'spot',quantity:4}],id(2),true)).selected_options[0].amount,'2400','legacy RPC cannot bypass server prices'));
  for (const quantity of [0,-1,'','abc','NaN','Infinity','1e2','1.0001',100001,null,{},[]]) {
    // JSON null falls back to the published default, just like an old client.
    if(quantity===null)continue;
    await rejects([{id:'spot',quantity}]);
  }
  await rejects([{id:'unknown'}]);await rejects([{id:'spot'},{id:'spot'}]);await rejects([{id:'alt'},{id:'alt2'}]);
  await rejects({},'22023');await rejects([1],'22023');
  await rejects([],CONFLICT_CODE,id(9));await rejects([],CONFLICT_CODE,null);
  for (const status of ['accepted','declined']) await transaction(async()=>{
    await db.exec(`reset role;update sales_offers set status='${status}';set role anon;`);
    await assert.rejects(()=>rpc([]),e=>e.code==='P0001');checks++;
  });
  await transaction(async()=>{
    await db.exec(`reset role;update sales_offer_versions set lines='[{"__storeOfferMeta":true}]',created_at=now()-interval '31 days';set role anon;`);
    await assert.rejects(()=>rpc([]),e=>e.code==='P0001');checks++;
  });
  for(const role of ['anon','authenticated']){
    await db.exec(`reset role;set role ${role};`);
    await transaction(async()=>eq((await rpc([{id:'spot',quantity:1}])).selected_options[0].quantity,1,'token acceptance '+role));
  }
  console.log(`PASS customer option quantity database: ${checks} PostgreSQL checks; real migration, anon/authenticated, tampering, legacy/fixed/alternative, decimals, expiry, immutable snapshot and version lock.`);
} finally { await db.close(); }
