const CONFLICT_CODE=process.env.QA_RPC_CONFLICT_POLICY==='1'?'PT409':'40001';
import assert from 'node:assert/strict';import fs from 'node:fs/promises';
const {PGlite}=await import(process.env.HR_PGLITE_PATH||'@electric-sql/pglite');const db=new PGlite();
let checks=0;const eq=(a,b,n)=>{assert.deepEqual(a,b,n);checks++;};const q=v=>v==null?'null':"'"+String(typeof v==='object'?JSON.stringify(v):v).replaceAll("'","''")+"'";
const id=n=>`96000000-0000-4000-8000-${String(n).padStart(12,'0')}`,u=id(1),peer=id(2),foreign=id(3),company=id(4),other=id(5),product=id(6),product2=id(7),imp=id(8),session=id(9);
const rpc=async(n,a=[])=>(await db.query(`select public.${n}(${a.map(q).join(',')}) as result`)).rows[0].result;
const actor=async(user=u)=>db.exec(`reset role;select set_config('request.jwt.claim.sub',${q(user)},false);set role authenticated;`);
const rejects=async(fn,code='42501')=>{await assert.rejects(fn,e=>e.code===code);checks++;};
let serial=100;const record=(input,command=id(serial++))=>rpc('stocktake_record',[company,session,command,input]);
try{
 await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;
 create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create table public.profiles(id uuid primary key,approved boolean default true,deactivated boolean default false,system_role text);
 create table public.sales_company_scopes(id uuid primary key,display_name text);
 create table public.sales_company_memberships(user_id uuid,company_id uuid);
 create table public.user_active_company_scope(user_id uuid,company_id uuid);
 create function public.current_active_company_scope_id() returns uuid language sql security definer as $$select company_id from public.user_active_company_scope where user_id=auth.uid()$$;
 create function public.current_profile_is_systemadmin() returns boolean language sql security definer as $$select coalesce(system_role='systemadmin',false) from public.profiles where id=auth.uid()$$;
 create function public.current_user_has_internal_store_price_search_access() returns boolean language sql security definer as $$select approved and not deactivated from public.profiles where id=auth.uid()$$;
 create table public.internal_store_catalog_imports(id uuid primary key,status text);
 create table public.internal_store_catalog_items(id uuid primary key,supplier_name text,supplier_product_number text,description text,gtin text,last_import_id uuid,is_active boolean);
 grant usage on schema public,auth to authenticated;
 insert into public.profiles(id,system_role) values(${q(u)},'systemadmin'),(${q(peer)},null),(${q(foreign)},null);
 insert into public.sales_company_scopes values(${q(company)},'QA Firma'),(${q(other)},'Annet firma');
 insert into public.sales_company_memberships values(${q(u)},${q(company)}),(${q(peer)},${q(company)}),(${q(foreign)},${q(other)});
 insert into public.user_active_company_scope values(${q(u)},${q(company)}),(${q(peer)},${q(company)}),(${q(foreign)},${q(other)});
 insert into public.internal_store_catalog_imports values(${q(imp)},'active');
 insert into public.internal_store_catalog_items values(${q(product)},'Leverandør A','00123','Rørdel','07000000000001',${q(imp)},true),(${q(product2)},'Leverandør B','00123','Samme strekkode','07000000000001',${q(imp)},true);`);
 await db.exec(await fs.readFile('supabase/migrations/20261015105313_stocktake_company_counts.sql','utf8'));
 // A pre-existing line is migrated without changing its ID, quantity or export identity.
 await actor();await rpc('stocktake_admin_set',[company,true,0]);await rpc('stocktake_create',[company,session,'Områdetest','QA-IKKE-IMPORTER','2026-11-05']);
 const legacy=await record({action:'add',supplier:'Grossist',number:'000123',description:'Eksisterende vare',location:'Reol gammel',quantity:'2.5'});
 await db.exec('reset role');
 await db.exec(await fs.readFile('supabase/migrations/20261105014939_stocktake_areas_handover_history.sql','utf8'));
 await actor();let page=await rpc('stocktake_get',[company,session,0]);
 eq(page.items[0].id,legacy.id);eq(page.items[0].quantity,2.5);eq(page.areas[0].name,'Reol gammel');eq(page.areas[0].status,'paused');
 let history=await rpc('stocktake_history',[company,session,null,0]);eq(history.items[0].action,'baseline');eq(history.items[0].after_value.id,legacy.id);
 await rejects(()=>db.query('select * from stocktake_private.events'));await rejects(()=>db.query('select * from stocktake_private.areas'));await rejects(()=>rpc('stocktake_history',[other,session,null,0]));
 await rejects(()=>db.query(`select stocktake_private.record_base(${q(company)},${q(session)},${q(id(991))},'{}')`));
 let area=(await record({action:'area_create',name:'Reol A'})).area;eq(area.status,'counting');eq(area.owner_id,u);
 eq((await record({action:'area_create',name:' reol a '})).code,'PT409','duplicate location names cannot split the same shelf');
 const input={action:'add',catalog_id:product,supplier:'Forged',number:'Forged',location:area.name,area_revision:area.revision,quantity:'3.5'};
 const receipt=id(50);let row=await record(input,receipt);eq(row.quantity,3.5);eq(row.number,'00123');eq(row.supplier,'Leverandør A');
 eq((await record(input,receipt)).quantity,3.5,'exact retry returns original receipt');eq((await record({...input,quantity:'7'},receipt)).code,'22023');
 row=await record(input);eq(row.quantity,7,'repeated partial counts sum on same shelf');history=await rpc('stocktake_history',[company,session,area.id,0]);eq(history.items[0].before_value.quantity,3.5,'catalog history uses canonical server identity');eq(history.items[0].after_value.quantity,7);
 const lineBefore=row;
 row=await record({action:'set',line_id:row.id,revision:row.revision,quantity:'8',area_revision:area.revision});eq(row.quantity,8);
 eq((await record({action:'set',line_id:row.id,revision:lineBefore.revision,quantity:'10',area_revision:area.revision})).code,CONFLICT_CODE,'old line cannot overwrite newer correction');
 await actor(peer);eq((await record(input)).code,'PT409','another counter cannot count on an owned shelf');
 const takeId=id(51),taken=await record({action:'area_takeover',area_id:area.id,revision:area.revision},takeId);eq(taken.area.owner_id,peer);eq((await record({action:'area_takeover',area_id:area.id,revision:area.revision},takeId)).area.revision,taken.area.revision,'lost takeover response is idempotent');
 await actor();eq((await record(input)).code,'PT409','old screen is fenced after handover');eq((await record(input,receipt)).quantity,3.5,'already accepted pre-handover retry returns receipt without new counting');
 area=(await record({action:'area_takeover',area_id:area.id,revision:taken.area.revision})).area;eq((await record(input)).code,'PT409','ownership away and back does not revive a stale draft');
 const paused=await record({action:'area_pause',area_id:area.id,revision:area.revision,note:'Venstre halvdel er telt. Fortsett ved røde deler.'});eq(paused.area.status,'paused');eq(paused.area.owner_id,null);
 await actor(peer);area=(await record({action:'area_claim',area_id:area.id,revision:paused.area.revision})).area;eq(area.note,'Venstre halvdel er telt. Fortsett ved røde deler.');eq(area.owner_id,peer);
 let extra=await record({...input,quantity:'2.5',area_revision:area.revision});eq(extra.quantity,10.5,'new teller continues existing total');
 const removed=await record({action:'delete',line_id:extra.id,revision:extra.revision,area_revision:area.revision});eq(removed.deleted,extra.id);
 history=await rpc('stocktake_history',[company,session,area.id,0]);eq(history.items[0].before_value.quantity,10.5);eq(history.items[0].action,'delete');eq(history.items.filter(e=>e.command_id===takeId).length,1,'one audit event per accepted command');
 const finished=await record({action:'area_done',area_id:area.id,revision:area.revision,note:'Hele hyllen er ferdig.'});eq(finished.area.status,'done');eq((await record({...input,area_revision:finished.area.revision})).code,'PT409','finished shelf is write protected');
 eq((await record({action:'area_claim',area_id:area.id,revision:finished.area.revision})).code,'PT409');
 area=(await record({action:'area_reopen',area_id:area.id,revision:finished.area.revision})).area;eq(area.status,'counting');
 // Ten separate identities share one stocktake, each claiming its own area.
 await db.exec('reset role');
 const people=Array.from({length:10},(_,i)=>id(2000+i));
 for(const person of people)await db.exec(`insert into public.profiles(id) values(${q(person)});insert into public.sales_company_memberships values(${q(person)},${q(company)});insert into public.user_active_company_scope values(${q(person)},${q(company)});`);
 const work=[];
 for(let i=0;i<10;i++){await actor(people[i]);const a=(await record({action:'area_create',name:'Hylle '+i})).area;work.push({actor:people[i],area:a});}
 // PGlite queues statements: tests ten distinct actors and overlapping promises, not server load.
 await db.exec('reset role');
 const concurrent=work.map((w,i)=>db.query(`with actor as materialized(select set_config('request.jwt.claim.sub',${q(w.actor)},false)) select public.stocktake_record(${q(company)},${q(session)},${q(id(3000+i))},${q({action:'add',supplier:'Grossist',number:'000123',description:'Felles vare',location:w.area.name,area_revision:w.area.revision,quantity:'1.25'})}::jsonb) as result from actor`));
 const results=await Promise.all(concurrent);for(const result of results)eq(result.rows[0].result.quantity,1.25);
 await actor();page=await rpc('stocktake_get',[company,session,0]);eq(page.areas.filter(a=>a.status==='counting').length,11);eq(page.items.filter(l=>l.number==='000123').length,11);
 eq((await rpc('stocktake_area_get',[company,session,work[0].area.id,0])).total,1,'selected area filters on server before pagination');
 eq((await rpc('stocktake_area_get',[company,session,work[0].area.id,0])).session_total,11);
 await rejects(()=>rpc('stocktake_area_get',[company,session,id(99999),0]));await rejects(()=>rpc('stocktake_history',[company,session,id(99999),0]));
 const csv=(await import('../src/modules/stocktake/stocktakeModel.mjs'));eq(new TextDecoder('windows-1252').decode(csv.stocktakeCordel(page.items)),'000123;15;Grossist\r\n','areas are summed only in Cordel, including existing 2.5 + ten 1.25');
 eq(new TextDecoder().decode(csv.stocktakeCsv(page.session,page.items,'QA')).includes('Hylle 9'),true);
 // Actual >100 lines, >50 history entries and all existing quantity/supplier protections.
 await actor(work[0].actor);for(let i=0;i<110;i++)await record({action:'add',supplier:'Grossist',number:'B-'+i,description:'Bulk '+i,location:work[0].area.name,area_revision:work[0].area.revision,quantity:'0'});
 eq((await rpc('stocktake_area_get',[company,session,work[0].area.id,0])).items.length,100);eq((await rpc('stocktake_area_get',[company,session,work[0].area.id,100])).items.length,11);
 history=await rpc('stocktake_history',[company,session,work[0].area.id,0]);eq(history.items.length,50);eq((await rpc('stocktake_history',[company,session,work[0].area.id,50])).items.length,50);
 const histCount=history.total;await record({action:'add',supplier:'Grossist',number:'BAD',description:'Bad',location:work[0].area.name,area_revision:work[0].area.revision,quantity:'-1'});eq((await rpc('stocktake_history',[company,session,work[0].area.id,0])).total,histCount,'failed command writes no event');
 await actor();page=await rpc('stocktake_get',[company,session,0]);eq((await record({action:'close',revision:page.session.revision})).code,'55000','unfinished areas block closing');
 await actor(foreign);await rejects(()=>rpc('stocktake_history',[company,session,null,0]));await rejects(()=>record({action:'area_create',name:'Cross company'}));
 await actor();await rpc('stocktake_admin_set',[company,false,1]);await rejects(()=>rpc('stocktake_history',[company,session,null,0]));await rejects(()=>record({action:'area_create',name:'Disabled'}));await rpc('stocktake_admin_set',[company,true,2]);
 // Complete all areas with explicit takeover where needed, then close under revision control.
 page=await rpc('stocktake_get',[company,session,0]);for(let a of page.areas){if(a.status==='done')continue;if(a.status==='paused')a=(await record({action:'area_claim',area_id:a.id,revision:a.revision})).area;else if(a.owner_id!==u)a=(await record({action:'area_takeover',area_id:a.id,revision:a.revision})).area;eq((await record({action:'area_done',area_id:a.id,revision:a.revision})).area.status,'done');}
 page=await rpc('stocktake_get',[company,session,0]);eq((await record({action:'close',revision:page.session.revision-1})).code,CONFLICT_CODE);eq((await record({action:'close',revision:page.session.revision})).closed,true);
 eq((await record({action:'area_create',name:'Too late'})).code,'55000');eq((await rpc('stocktake_history',[company,session,null,0])).items[0].action,'close');
 await db.exec('reset role;set role anon');await rejects(()=>rpc('stocktake_get',[company,session,0]));await rejects(()=>rpc('stocktake_history',[company,session,null,0]));await rejects(()=>rpc('stocktake_area_get',[company,session,area.id,0]));
 console.log(`stocktake-areas-db-check: ${checks} assertions OK – real migrations, ten identities, area ownership/replay/fencing, history, existing counts and export, permissions and closure`);
}finally{await db.close();}
