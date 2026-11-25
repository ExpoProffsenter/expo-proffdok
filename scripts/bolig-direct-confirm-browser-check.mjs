import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import http from 'node:http';
import {build} from 'vite';import react from '@vitejs/plugin-react';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.cwd(),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'bolig-direct-')),entry=path.join(tmp,'entry.jsx');
let checks=0;const eq=(a,b,m)=>{assert.deepEqual(a,b,m);checks++;};
fs.writeFileSync(entry,`
import React from '${root}/node_modules/react/index.js';import {createRoot} from '${root}/node_modules/react-dom/client.js';
import Page from '${root}/src/modules/bolig/BoligPortalPage.jsx';import Manager from '${root}/src/modules/bolig/BoligPortalManager.jsx';
import publicCss from '${root}/src/modules/bolig/boligResident.css?inline';import appCss from '${root}/src/style.css?inline';import boligCss from '${root}/src/modules/bolig/bolig.css?inline';import commerceCss from '${root}/src/modules/bolig/boligCommerce.css?inline';import {unitStatus} from '${root}/src/modules/bolig/BoligBuildingOverview.jsx';window.__unitStatus=unitStatus;
const context={user_id:'manager',company_id:'company',role:'manager',enabled:true};
const baseGood={key:'common/base',name:'Standard servant',sku:'BASE',quantity:1,unit:'stk',room_name:'Bad',image_url:'https://qa.invalid/product.png'};
const good={...baseGood,key:'common/oak',name:'Eikeservant med montering',sku:'OAK'};
const price={id:'common/oak',name:'Eikeservant med montering',net_cents:25000,price_cents:35000,deduction_cents:10000,replace_key:'base'};
window.__state={id:'portal',direct_confirmation:true,choice_locked:false,changes_revision:0,confirmation:null,confirmation_mail:[],combine_base_id:'base',menu_version:1,expires_at:'2027-12-01',choice_deadline:'2027-11-30',choice_deadline_time:'12:00',choice_deadline_at:'2027-11-30T11:00:00Z',choices_closed:false,identity:{project:'Aamodthagen QA',company:'Orvei QA',unit:'H0101',block:'Bygg A',address:'QA gate 7'},offers:[{id:'base',title:'Grunnpakke',total_cents:0,goods:[baseGood],price_details:[]},{id:'oak',title:'Eik med montering',total_cents:25000,goods:[good],price_details:[price]}],agreements:[],events:[],documents:[],messaging_enabled:false,offers_draft:[],revoked:false};
window.__calls=[];window.__deny=false;window.__lose=false;let revision=1;
window.fetch=async(url,options)=>{const b=JSON.parse(options.body);window.__calls.push(b);if(window.__deny)return {ok:false,json:async()=>({code:'42501',message:'Tilgangen er tilbakekalt'})};
 if(b.p_action==='confirm'){
  if(!window.__state.confirmation){const selected=b.p_payload.offer_ids.includes('oak');const doc={id:'accepted',kind:'choice',status:'accepted',version:1,revision:1,created_at:'2026-11-25T17:00:00Z',accepted_at:'2026-11-25T17:00:00Z',accepted_name:b.p_payload.name,snapshot:{source:'resident',identity:window.__state.identity,goods:selected?[good]:[baseGood],price_details:selected?[price]:[],total_cents:selected?25000:0,reason:b.p_payload.body,selected_offer_ids:b.p_payload.offer_ids}};window.__state.confirmation=doc;window.__state.agreements=[doc];window.__state.choice_locked=true;window.__state.changes_revision++;window.__state.confirmation_mail=[{kind:'resident',status:'paused'},{kind:'manager',status:'paused'}];}
  if(window.__lose){window.__lose=false;throw Error('Lost response');}
 }
 return {ok:true,json:async()=>structuredClone(window.__state)};};
window.__client={supabaseUrl:'https://qa.invalid',rpc:async(name,b)=>{window.__calls.push({name,...b});if(window.__deny)return {data:null,error:{code:'42501',message:'Tilgangen er tilbakekalt'}};if(b.p_action==='reopen'){window.__state.choice_locked=false;window.__state.changes_until=b.p_payload.deadline+'T11:00:00Z';window.__state.changes_revision++;revision++;}return {data:{context,root_id:'root',unit_id:'unit',revision,choice_revision:2,components:[],packages:[],options:[],contact:{name:'QA Beboer',email:'qa@example.invalid'},portal:structuredClone(window.__state)}};}};
const css=document.createElement('style');document.head.append(css);const app=createRoot(document.getElementById('app'));window.__show=mode=>{css.textContent=mode==='manager'?appCss+'\\n'+boligCss+'\\n'+commerceCss:publicCss;app.render(mode==='manager'?<div className="bolig-unit-dialog" style={{maxWidth:720,width:'100%'}}><Manager context={context} root={{id:'root'}} unit={{id:'unit',number:'H0101'}}/></div>:<Page/>);};window.__show(new URL(location.href).searchParams.get('mode'));
`);
let server,browser,page;
try{
 const bundle=await build({root,configFile:false,logLevel:'silent',plugins:[react({jsxRuntime:'classic'}),{name:'qa-client',enforce:'pre',resolveId(id){if(id.endsWith('appSupabaseClientRegistry.js'))return '\0qa';},load(id){if(id==='\0qa')return 'export const getAppSupabaseClient=()=>window.__client;';}}],define:{'process.env.NODE_ENV':'"production"','import.meta.env.VITE_SUPABASE_URL':'"https://qa.invalid"','import.meta.env.VITE_SUPABASE_ANON_KEY':'"qa"'},build:{write:false,lib:{entry,formats:['iife'],name:'DirectQA',cssFileName:'qa'},minify:false}});
 const output=(Array.isArray(bundle)?bundle[0]:bundle).output,js=output.find(f=>f.type==='chunk').code,css=output.filter(f=>f.fileName.endsWith('.css')).map(f=>f.source).join('\n');
 server=http.createServer((req,res)=>{res.setHeader('Content-Type',req.url.startsWith('/app.js')?'application/javascript':'text/html');res.end(req.url.startsWith('/app.js')?js:'<!doctype html><html lang="nb"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style><div id="app"></div><script src="/app.js"></script></html>');});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage']});
 const context=await browser.newContext({viewport:{width:390,height:844}});await context.route('**/*',route=>route.request().url().startsWith('http://127.0.0.1')?route.continue():route.request().url()==='https://qa.invalid/product.png'?route.fulfill({contentType:'image/png',body:fs.readFileSync(path.join(root,'public/expo-logo.png'))}):route.abort());
 page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const url='http://127.0.0.1:'+server.address().port;await page.goto(url+'/#portal='+'a'.repeat(64));await page.getByRole('heading',{name:'Velg det som passer deg'}).waitFor();
 eq(await page.getByText('Ingen ekstra kostnad',{exact:false}).isVisible(),true);await page.getByRole('checkbox',{name:'Eik med montering'}).check();await page.getByRole('button',{name:'Se over valget',exact:true}).click();
 eq(await page.getByRole('button',{name:'Bekreft bestilling',exact:true}).isDisabled(),true);eq(await page.getByText('Eikeservant med montering',{exact:true}).last().isVisible(),true);eq(await page.getByText('Kontroller før du sender',{exact:true}).evaluate(n=>n===n.ownerDocument.activeElement),true);
 await page.getByRole('textbox',{name:'Fullt navn'}).fill('QA Beboer');await page.getByRole('checkbox',{name:'Jeg har gjennomgått'}).check();eq(await page.getByRole('button',{name:'Bekreft bestilling',exact:true}).isEnabled(),true);
 await page.evaluate(()=>window.__lose=true);await page.getByRole('button',{name:'Bekreft bestilling',exact:true}).click();await page.getByRole('heading',{name:'Sendingen er ikke bekreftet'}).waitFor();const first=await page.evaluate(()=>window.__calls.find(c=>c.p_action==='confirm'));eq(first.p_payload.name,'QA Beboer');eq(first.p_payload.confirmed,true);eq(first.p_payload.changes_revision,0);eq(first.p_payload.offer_ids,['oak']);
 // Reload recovers the exact persisted attempt, even though the first attempt committed.
 const persisted=await page.evaluate(()=>sessionStorage.getItem(Object.keys(sessionStorage).find(k=>k.startsWith('expo-bolig-portal:'))));eq(JSON.parse(persisted).pending.payload.request_id,first.p_payload.request_id);
 await page.getByRole('button',{name:'Prøv samme sending igjen',exact:true}).click();await page.getByRole('heading',{name:'Din bekreftede bestilling · utgave 1'}).waitFor();
 const calls=await page.evaluate(()=>window.__calls.filter(c=>c.p_action==='confirm'));eq(calls.length,2);eq(calls[1],calls[0]);eq(await page.getByRole('button',{name:'Bekreft bestilling',exact:true}).count(),0);eq(await page.getByText('Bestillingen er låst.',{exact:true}).isVisible(),true);eq(await page.getByText('E-postkvitteringer er pauset',{exact:false}).isVisible(),true);
 eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Mobile has no horizontal overflow');await page.screenshot({path:path.join(tmp,'confirmed-mobile.png'),fullPage:true});
 await page.waitForFunction(()=>[...document.querySelectorAll('.bolig-confirmed-order img')].every(i=>i.complete&&i.naturalWidth>0));
 await page.emulateMedia({media:'print'});await page.pdf({path:path.join(tmp,'resident-confirmation.pdf'),format:'A4',printBackground:true});
 const printed=execFileSync('pdftotext',[path.join(tmp,'resident-confirmation.pdf'),'-'],{encoding:'utf8'});
 for(const marker of ['H0101','QA gate 7','Aamodthagen QA','OAK','250,00'])eq(printed.includes(marker),true,'Customer PDF preserves '+marker);
 eq(printed.includes('Velg det som passer deg'),false,'Unconfirmed editing is absent from the receipt PDF');
 eq(execFileSync('pdfimages',['-list',path.join(tmp,'resident-confirmation.pdf')],{encoding:'utf8'}).includes('image'),true,'Customer PDF contains actual image objects');
 await page.emulateMedia({media:'screen'});
 // Read-only preview uses identical page component in an isolated document.
 await page.evaluate(()=>window.__show('manager'));await page.getByRole('heading',{name:'Beboerens bestilling',exact:true}).waitFor();eq(await page.locator('.bolig-direct-confirmation-panel').evaluate(n=>n.scrollWidth<=n.clientWidth+1),true,'Actual internal style stack: confirmation panel has no overflow');eq(await page.getByText('Innsendte valg går til gjennomgang',{exact:false}).count(),0,'Old double-check instruction is gone');eq(await page.evaluate(()=>window.__unitStatus({}, {resident_confirmed:true,resident_choice_locked:true,catalog_changed:true}, 'choice').label),'Bekreftet og låst');await page.getByRole('button',{name:'Se som beboer',exact:true}).click();const frame=page.frameLocator('iframe[title="Beboerens portal – skrivebeskyttet"]');await frame.getByRole('heading',{name:'Din bekreftede bestilling · utgave 1'}).waitFor();eq(await frame.getByRole('button',{name:'Skriv ut bestillingsbekreftelse'}).isDisabled(),true);eq(await frame.getByText('QA gate 7',{exact:true}).first().isVisible(),true);
 await frame.getByRole('button',{name:'Mine valg',exact:true}).click();const before=await page.evaluate(()=>window.__calls.length);await frame.getByRole('button',{name:'Avtaler',exact:true}).click();eq(await page.evaluate(()=>window.__calls.length),before,'Preview navigation performs no mutation');await page.screenshot({path:path.join(tmp,'manager-preview.png'),fullPage:true});
 await page.getByRole('button',{name:'Lukk se som beboer',exact:true}).click();await page.getByLabel('Ny frist for denne boligen').fill('31.02.2027');eq(await page.getByRole('button',{name:'Åpne for endringer',exact:true}).isDisabled(),true,'Invalid Norwegian calendar date cannot reopen');await page.getByLabel('Ny frist for denne boligen').fill('02.12.2027');await page.getByRole('button',{name:'Åpne for endringer',exact:true}).click();await page.getByText('Endringsfrist:',{exact:false}).waitFor();const reopen=await page.evaluate(()=>window.__calls.find(c=>c.p_action==='reopen'));eq(reopen.p_payload.deadline,'2027-12-02');eq(typeof reopen.p_payload.request_id,'string');
 // Manager may explore local choices and review, while all sends remain disabled.
 await page.getByRole('button',{name:'Se som beboer',exact:true}).click();
 await frame.getByRole('heading',{name:'Velg det som passer deg'}).waitFor();
 const previewCalls=await page.evaluate(()=>window.__calls.length);
 eq(await frame.getByRole('checkbox',{name:'Eik med montering'}).isEnabled(),true);
 eq(await frame.getByRole('checkbox',{name:'Eik med montering'}).evaluate(n=>n.checked),true,'Preview seeds the same previously confirmed options as the resident');
 await frame.getByRole('checkbox',{name:'Eik med montering'}).check();
 await frame.getByRole('button',{name:'Se over valget',exact:true}).click();
 eq(await frame.getByRole('button',{name:'Bekreft bestilling',exact:true}).isVisible(),true);
 eq(await frame.getByRole('button',{name:'Bekreft bestilling',exact:true}).isDisabled(),true);
 await frame.getByRole('button',{name:'Meldinger',exact:true}).click();
 eq(await frame.getByRole('button',{name:'Send melding',exact:true}).isVisible(),true);
 eq(await frame.getByRole('button',{name:'Send melding',exact:true}).isDisabled(),true);
 // Even a forced DOM submit cannot bypass the preview guard.
 await frame.locator('form').evaluate(f=>f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
 eq(await page.evaluate(()=>window.__calls.length),previewCalls,'Exploring and forced preview submit perform no RPC');
 eq(await page.evaluate(()=>window.__state.confirmation.version),1,'Preview preserves accepted version');
 await page.getByRole('button',{name:'Lukk se som beboer',exact:true}).click();
 // Switching back to resident after reopen retains the old receipt and seeds previous options.
 await page.evaluate(()=>window.__show('public'));await page.getByRole('heading',{name:'Velg det som passer deg'}).waitFor();eq(await page.getByRole('checkbox',{name:'Eik med montering'}).isChecked(),true);eq(await page.getByRole('heading',{name:'Din bekreftede bestilling · utgave 1'}).isVisible(),true);eq(await page.getByText('Denne bekreftelsen gjelder frem til',{exact:false}).isVisible(),true);
 await page.evaluate(()=>{window.__deny=true;});await page.getByRole('button',{name:'Hent siste status',exact:true}).click();await page.getByRole('heading',{name:'Portalen kan ikke åpnes'}).waitFor();eq(await page.getByRole('heading',{name:'Din bekreftede bestilling · utgave 1'}).count(),0,'Revoked access removes frozen details');eq(errors,[]);
 console.log('PASS direct confirmation Chromium: '+checks+' assertions; one confirmation, price review, explicit name/approval, lost response exact retry, locked receipt, mobile, read-only iframe preview, per-unit reopening, prefilled previous choices and revoked access. Artifacts: '+tmp);
}catch(e){if(page)console.error((await page.locator('body').innerText()).slice(-2500));throw e;}finally{await browser?.close();await new Promise(r=>server?server.close(r):r());}
