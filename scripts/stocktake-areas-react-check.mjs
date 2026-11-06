import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import http from 'node:http';import {build} from 'vite';import react from '@vitejs/plugin-react';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');const root=process.cwd(),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'stocktake-')),entry=path.join(tmp,'entry.jsx');
fs.writeFileSync(entry,`import React from '${root}/node_modules/react/index.js';import {createRoot} from '${root}/node_modules/react-dom/client.js';import '${root}/src/style.css';import '${root}/src/modules/ui/proffdokWorkspace.css';import {APP_RUNTIME_STYLES} from '${root}/src/modules/app/appRuntimeStyles.js';const style=document.createElement('style');style.textContent=APP_RUNTIME_STYLES;document.head.appendChild(style);import Entry from '${root}/src/modules/stocktake/StocktakeEntry.jsx';import Admin from '${root}/src/modules/stocktake/StocktakeCompanyAccess.jsx';const root=createRoot(document.getElementById('app'));globalThis.render=(visible=true)=>root.render(React.createElement(React.Fragment,null,React.createElement('div',{hidden:!visible},React.createElement(Entry,{visible}))));globalThis.render(true);`);
const bundled=await build({root,configFile:false,logLevel:'silent',plugins:[react(),{name:'api-boundary',enforce:'pre',resolveId(id){if(id.endsWith('/moduleAccessClient.js'))return '\0access';if(id.endsWith('/workProfileClient.js'))return '\0profile';if(id.endsWith('/PriceSearchBarcodeScanner.jsx'))return '\0scan';},load(id){
 if(id==='\0access')return `export const MANAGED_ACCESS_EVENT='managed',MODULE_ACCESS_EVENT='module';export const rpcWithStoredSession=(n,a)=>window.api(n,a);export const publishManagedAccessChange=()=>window.dispatchEvent(new Event('managed'));`;
 if(id==='\0profile')return `export const WORK_PROFILE_EVENT='profile';`;
 if(id==='\0scan')return `import React from '${root}/node_modules/react/index.js';export default function Scanner(p){return React.createElement('button',{onClick:()=>p.onScan('07000000000001')},'QA camera scan');}`;
}}],build:{write:false,cssCodeSplit:false,minify:false,rollupOptions:{input:entry,output:{inlineDynamicImports:true}}}});
const js=bundled.output.find(f=>f.type==='chunk').code,css=bundled.output.filter(f=>f.fileName.endsWith('.css')).map(f=>f.source).join('\n');

if(process.env.STOCKTAKE_AREAS_BUILD_ONLY==='1'){console.log('Stocktake areas native fixture build PASS (browser not started)');fs.rmSync(tmp,{recursive:true,force:true});} else {
const {PGlite}=await import(process.env.HR_PGLITE_PATH||'@electric-sql/pglite');const db=new PGlite();
const id=n=>`96000000-0000-4000-8000-${String(n).padStart(12,'0')}`,u=id(1),peer=id(2),foreign=id(3),company=id(4),other=id(5),product=id(6),product2=id(7),imp=id(8);
const q=v=>v==null?'null':"'"+String(typeof v==='object'?JSON.stringify(v):v).replaceAll("'","''")+"'";
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
 await db.exec(fs.readFileSync('supabase/migrations/20261015105313_stocktake_company_counts.sql','utf8'));
await db.exec(`alter table public.profiles add column email text;update public.profiles set email=case when id=${q(u)} then 'teller-a@example.invalid' else 'teller-b@example.invalid' end;`);
await db.exec(fs.readFileSync('supabase/migrations/20261105014939_stocktake_areas_handover_history.sql','utf8'));
await db.exec(`select set_config('request.jwt.claim.sub',${q(u)},false);select public.stocktake_admin_set(${q(company)},true,0);set role authenticated;`);
const params={stocktake_context:[],stocktake_list:['p_company_id'],stocktake_create:['p_company_id','p_id','p_title','p_warehouse','p_date'],stocktake_get:['p_company_id','p_id','p_offset'],stocktake_area_get:['p_company_id','p_id','p_area_id','p_offset'],stocktake_record:['p_company_id','p_id','p_command_id','p_input'],stocktake_history:['p_company_id','p_id','p_area_id','p_offset']};
async function api(user,n,a={}){
 if(![u,peer].includes(user))throw Error('Unknown fixture actor');
 if(n==='get_cordel_export_access')return true;
 if(n.startsWith('search_internal_store_catalog_prices'))return [{id:product,supplier_name:'Leverandør A',supplier_product_number:'00123',description:'Rørdel',gtin:'07000000000001',total_count:1}];
 if(!Object.hasOwn(params,n))throw Error('Unexpected RPC '+n);
 const args=params[n].map(key=>q(a[key])).join(',');
 return (await db.query(`with actor as materialized(select set_config('request.jwt.claim.sub',${q(user)},false)) select public.${n}(${args}) as result from actor`)).rows[0].result;
}
const server=http.createServer(async(req,res)=>{try{
 if(req.url==='/rpc'){let body='';for await(const chunk of req)body+=chunk;const {user,n,a}=JSON.parse(body);const result=await api(user,n,a);res.setHeader('Content-Type','application/json');res.end(JSON.stringify({result}));return;}
 res.setHeader('Content-Type','text/html; charset=utf-8');res.end(`<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font:15px Arial;margin:8px} ${css}</style><div data-expo-app-shell="true"><main><div id="app"></div></main></div><script type="module">${js.replaceAll('</script','<\\/script')}</script>`);
 }catch(e){res.statusCode=400;res.end(JSON.stringify({error:e.message}));}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser,checks=0;const eq=(a,b,n)=>{assert.deepEqual(a,b,n);checks++;};
try{
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox']});const errors=[];
 const newPage=async(user)=>{const page=await browser.newPage({viewport:{width:1363,height:1000}});page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>route.request().url().startsWith(`http://127.0.0.1:${server.address().port}`)?route.continue():route.abort());
  await page.addInitScript(user=>{window.calls=[];window.api=async(n,a)=>{window.calls.push({n,a:structuredClone(a)});const response=await fetch('/rpc',{method:'POST',body:JSON.stringify({user,n,a})});const data=await response.json();if(data.error)throw Error(data.error);if(n==='stocktake_record'&&data.result?.error&&window.holdAfterStaleCommand){window.holdAfterStaleCommand=false;window.holdNextRefresh=true;}if(n==='stocktake_get'&&window.holdNextRefresh){window.holdNextRefresh=false;await new Promise(resolve=>window.releaseHeldRefresh=resolve);}if(n==='stocktake_record'&&window.loseNext){window.loseNext=false;throw Error('Svaret ble borte');}return data.result;};},user);
  await page.goto(`http://127.0.0.1:${server.address().port}`);return page;};
 const a=await newPage(u),button=(page,name)=>page.getByRole('button',{name,exact:true});
 await a.getByLabel('Lager i Cordel',{exact:true}).fill('QA-IKKE-IMPORTER');await button(a,'Opprett telling').click();await a.getByRole('heading',{name:'Hyller og områder'}).waitFor();eq(await button(a,'Legg inn vare manuelt').isDisabled(),true,'counting needs an area first');
 await a.getByText('Opprett en hylle eller et område',{exact:true}).click();await a.getByLabel('Navn på nytt område').fill('Reol A');await a.evaluate(()=>window.loseNext=true);await button(a,'Opprett og start område').click();await button(a,'Prøv registrering igjen').waitFor();await button(a,'Prøv registrering igjen').click();await a.getByText('Reol A · Pågår',{exact:true}).waitFor();eq(await a.getByLabel('Velg hylle eller område').locator('option').count(),2,'uncertain create produces one area');
 let sessionId=(await a.evaluate(()=>window.calls.find(c=>c.n==='stocktake_create'))).a.p_id;
 const manual=async(page,num,amount)=>{await button(page,'Legg inn vare manuelt').click();await page.getByLabel('Leverandør',{exact:true}).fill('Grossist');await page.getByLabel('Varenummer i Cordel',{exact:true}).fill(num);await page.getByLabel('Beskrivelse',{exact:true}).fill('Manuell '+num);await page.getByLabel('Antall du har telt',{exact:true}).fill(amount);};
 await manual(a,'000123','2,5');eq(await a.getByLabel('Område / hylle',{exact:true}).inputValue(),'Reol A');eq(await a.getByLabel('Område / hylle',{exact:true}).getAttribute('readonly'),'','area is automatic for every item');await button(a,'Registrer antall').click();await a.getByText('Antallet er lagret i firmaet.',{exact:true}).waitFor();
 await manual(a,'000124','0');eq(await a.getByLabel('Område / hylle',{exact:true}).inputValue(),'Reol A');await button(a,'Registrer antall').click();await a.locator('.stocktakeSession p').filter({hasText:'2 registrerte varelinjer'}).waitFor();
 await a.getByLabel('Hvor stoppet du? / merknad').fill('Venstre halvdel telt. Fortsett ved røde deler.');await button(a,'Sett område på pause').click();await a.getByText('Reol A · Pauset',{exact:true}).waitFor();eq(await button(a,'Legg inn vare manuelt').isDisabled(),true);
 const b=await newPage(peer);await b.getByLabel('Åpne lagret telling').selectOption(sessionId);await b.getByRole('heading',{name:'Hyller og områder'}).waitFor();const areaId=(await api(peer,'stocktake_get',{p_company_id:company,p_id:sessionId,p_offset:0})).areas[0].id;await b.getByLabel('Velg hylle eller område').selectOption(areaId);await b.getByText('Merknad ved siste stopp:',{exact:true}).waitFor();await button(b,'Fortsett telling her').click();await b.getByText('Reol A · Pågår',{exact:true}).waitFor();eq(await b.locator('.stocktakeLine').count(),2,'takeover shows existing shelf counts');
 await manual(b,'000123','1,5');await button(b,'Registrer antall').click();await b.getByText('Antallet er lagret i firmaet.',{exact:true}).waitFor();eq((await api(peer,'stocktake_get',{p_company_id:company,p_id:sessionId,p_offset:0})).items.find(l=>l.number==='000123').quantity,4,'second teller continues previous partial quantity');
 await manual(b,'000125','8');const draftNode=await b.getByLabel('Antall du har telt',{exact:true}).elementHandle();await b.evaluate(()=>window.render(false));await b.evaluate(()=>window.render(true));eq(await draftNode.evaluate(e=>e.isConnected),true);eq(await b.getByLabel('Antall du har telt',{exact:true}).inputValue(),'8');await b.reload();await b.getByLabel('Antall du har telt',{exact:true}).waitFor();eq(await b.getByLabel('Antall du har telt',{exact:true}).inputValue(),'8','area and unsent quantity survive reload');
 // A takes the active shelf from B while B holds an unsent draft.
 await button(a,'Hent telling på nytt').click();await a.getByText('Teller: teller-b@example.invalid',{exact:false}).waitFor();await button(a,'Overta område').click();eq(await button(a,'Bekreft overtakelse').count(),1,'takeover is explicit');await button(a,'Bekreft overtakelse').click();await a.getByText('Teller: Du',{exact:false}).waitFor();
 // The stale-write error is shown before the required fresh-area read ends.
 // Hold that read explicitly: cancel stays protected during it, then becomes
 // available. The original cancellation/draft/ownership requirements remain.
 await b.evaluate(()=>window.holdAfterStaleCommand=true);
 await button(b,'Registrer antall').click();await b.getByRole('alert').filter({hasText:'Området kan ha blitt overtatt'}).waitFor();eq(await b.getByLabel('Antall du har telt',{exact:true}).inputValue(),'8','rejected stale write preserves draft');
 await b.waitForFunction(()=>typeof window.releaseHeldRefresh==='function');
 eq(await button(b,'Avbryt innlegging').isDisabled(),true,'pending fresh-area read still fences all draft actions');
 eq(await b.getByLabel('Antall du har telt',{exact:true}).inputValue(),'8','pending fresh-area read retains stale draft');
 await b.evaluate(()=>window.releaseHeldRefresh());
 await b.waitForFunction(()=>{const node=[...document.querySelectorAll('button')].find(n=>n.textContent.trim()==='Avbryt innlegging');return node&&!node.matches(':disabled');});
 eq(await button(b,'Avbryt innlegging').isEnabled(),true,'stale draft can be consciously cancelled');await button(b,'Avbryt innlegging').click();eq(await button(b,'Legg inn vare manuelt').isDisabled(),true);
 await a.getByText('Historikk og kontroll',{exact:true}).click();await a.getByText('Overtok telling',{exact:true}).first().waitFor();eq(await a.getByText('teller-a@example.invalid',{exact:false}).count()>0,true);eq(await a.getByText('teller-b@example.invalid',{exact:false}).count()>0,true);eq(await a.getByText('2,5 → 4',{exact:false}).count()>0,true,'audit shows amount before and after handover count');
 for(const width of [320,390,768,1363,1920]){await a.setViewportSize({width,height:936});eq(await a.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'no page overflow '+width);eq(await a.locator('.stocktakeAreas input,.stocktakeAreas select,.stocktakeAreas textarea').evaluateAll(nodes=>nodes.filter(e=>e.getBoundingClientRect().height&&parseFloat(getComputedStyle(e).fontSize)<16).length),0,'readable controls '+width);}
 const shots=process.env.STOCKTAKE_QA_DIR||tmp;fs.mkdirSync(shots,{recursive:true});await a.setViewportSize({width:1363,height:1000});await a.screenshot({path:path.join(shots,'stocktake-areas-desktop.png'),fullPage:true});await a.setViewportSize({width:390,height:844});await a.screenshot({path:path.join(shots,'stocktake-areas-mobile.png'),fullPage:true});
 await button(a,'Området er ferdig telt').click();await a.getByText('Reol A · Ferdig telt',{exact:true}).waitFor();eq(await a.getByText('Området er ferdig telt. Velg et annet område, eller bruk «Gjenåpne område» hvis noe mangler.',{exact:true}).isVisible(),true,'finished area explains the actual next button');eq(await button(a,'Legg inn vare manuelt').isDisabled(),true);await button(a,'Gjenåpne område').click();await button(a,'Bekreft gjenåpning').click();await a.getByText('Reol A · Pågår',{exact:true}).waitFor();await button(a,'Området er ferdig telt').click();await a.getByText('Reol A · Ferdig telt',{exact:true}).waitFor();
 const download=a.waitForEvent('download');await button(a,'Last ned Cordel-tekstfil').click();const file=await download;const bytes=fs.readFileSync(await file.path());eq(new TextDecoder('windows-1252').decode(bytes).trimEnd().split('\r\n').sort(),['000123;4;Grossist','000124;0;Grossist'],'Cordel has quantities only, never areas; UUID line order is not an export contract');
 await button(a,'Avslutt telling').click();await button(a,'Bekreft avslutning').click();await a.getByText('Tellingen er avsluttet og kan eksporteres.',{exact:true}).waitFor();eq(await button(a,'Registrer antall').count(),0);eq(await button(a,'Last ned Cordel-tekstfil').isEnabled(),true);eq(errors,[],'no component errors');
 console.log(`stocktake-areas-react-check: ${checks} assertions OK – real React + PostgreSQL migration, two users, partial shelf handover, fencing, draft, history, five widths, export and close`);
}finally{await browser?.close();await new Promise(r=>server.close(r));await db.close();fs.rmSync(tmp,{recursive:true,force:true});}

}
