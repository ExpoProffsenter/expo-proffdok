import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import http from 'node:http';import {execFileSync} from 'node:child_process';import {build} from 'vite';import react from '@vitejs/plugin-react';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.cwd(),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'bolig-print-qa-'));let browser,server,debugPage;let checks=0;const eq=(a,b,m)=>{assert.deepEqual(a,b,m);checks++;};
fs.writeFileSync(path.join(tmp,'entry.jsx'),`
import React from '${root}/node_modules/react/index.js';import {createRoot} from '${root}/node_modules/react-dom/client.js';import Print from '${root}/src/modules/bolig/BoligWorkOrderPrint.jsx';import '${root}/src/modules/bolig/bolig.css';import '${root}/src/style.css';
const app=createRoot(document.getElementById('app'));window.__calls=0;window.__prints=0;window.print=()=>window.__prints++;window.__denied=false;
window.__state={context:{user_id:'user',company_id:'firm',role:'manager',enabled:true},root_id:'root',unit_id:'unit',basis:'frozen-one',confirmed:true,identity:{company:'QA firma',project:'QA prosjekt',block:'Bygg A',unit:'H0101',address:'Eksempelveien 10'},sources:[{id:'accepted-v2',title:'Godkjent boligvalg',version:2,at:'2026-11-20T12:00:00Z'}],notes:[{title:'Forbehold',text:'Registrert hos kunden.\\n\\nBehold avsnitt.',blocks:[{id:'t',text:'FROZEN-TEXT'}]}],goods:Array.from({length:24},(_,i)=>({key:String(i),name:i===0?'GRUNNPAKKE SERVANT':i===1?'VALGT TILVALG BATTERI':'Vare '+i+' LangtOrd'.repeat(15),sku:'QA-'+i,quantity:2,unit:'stk',room_name:'Bad',section_name:'Sanitær',image_url:'https://images.example.invalid/product.png'}))};
window.__client={rpc:async()=>{window.__calls++;if(window.__denied)return {error:{message:'Tilgang tilbakekalt',code:'42501'}};return {data:structuredClone(window.__state)};}};
window.__show=(company='firm')=>app.render(<><p>INTERNAL-PRIVATE-SHELL</p><Print context={{user_id:'user',company_id:company,role:'manager',enabled:true}} root={{id:'root'}} unit={{id:'unit'}}/></>);window.__show();
`);
try{
 const result=await build({configFile:false,root,logLevel:'silent',define:{'process.env.NODE_ENV':'"production"'},plugins:[react({jsxRuntime:"classic"}),{name:'print-client',enforce:'pre',resolveId(id){if(id.endsWith('appSupabaseClientRegistry.js'))return '\0print-client';},load(id){if(id==='\0print-client')return 'export const getAppSupabaseClient=()=>window.__client;';}}],build:{write:false,minify:false,lib:{entry:path.join(tmp,'entry.jsx'),formats:['iife'],name:'PrintQA',cssFileName:'print'}}});
 const output=(Array.isArray(result)?result[0]:result).output,js=output.find(o=>o.type==='chunk').code,css=output.filter(o=>o.type==='asset'&&o.fileName.endsWith('.css')).map(o=>o.source).join('\n');
 server=http.createServer((req,res)=>{if(req.url==='/app.js'){res.setHeader('content-type','text/javascript;charset=utf-8');res.end(js);}else if(req.url==='/app.css'){res.setHeader('content-type','text/css;charset=utf-8');res.end(css);}else{res.setHeader('content-type','text/html;charset=utf-8');res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"><div id="app"></div><script src="/app.js"></script>');}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:1280,height:900}});page.setDefaultTimeout(10000);debugPage=page;page.on('pageerror',e=>console.error('Print fixture runtime:',e.message));
 await page.route('https://images.example.invalid/**',route=>route.fulfill({contentType:'image/png',body:fs.readFileSync(path.join(root,'public/expo-logo.png'))}));
 await page.goto('http://127.0.0.1:'+server.address().port);await page.getByRole('button',{name:'Skriv ut leveranseoversikt',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'Leveranseoversikt til håndverker',exact:true});await dialog.getByRole('button',{name:'Skriv ut / lagre som PDF',exact:true}).waitFor();
 await page.waitForFunction(()=>[...document.querySelectorAll('.bolig-work-image img')].length===24&&[...document.querySelectorAll('.bolig-work-image img')].every(i=>i.complete&&i.naturalWidth>0));
 eq(await dialog.getByText('Kundebekreftet bestilling',{exact:true}).count(),1,'accepted source clearly labelled');eq(await dialog.locator('.bolig-work-good').count(),24,'full base and selections included');
 await page.setViewportSize({width:360,height:800});eq(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth+1),true,'360px dialog has no horizontal overflow');eq(await dialog.locator('.bolig-work-good').first().evaluate(el=>el.scrollWidth<=el.clientWidth+1),true,'image and text fit mobile');
 await dialog.evaluate(el=>{el.scrollTop=el.scrollHeight;});
 await page.emulateMedia({media:'print'});await page.pdf({path:path.join(tmp,'sheet.pdf'),format:'A4',printBackground:true});
 if(process.env.BOLIG_PRINT_ARTIFACT_DIR){fs.mkdirSync(process.env.BOLIG_PRINT_ARTIFACT_DIR,{recursive:true});fs.copyFileSync(path.join(tmp,'sheet.pdf'),path.join(process.env.BOLIG_PRINT_ARTIFACT_DIR,'long-list.pdf'));}
 const text=execFileSync('pdftotext',[path.join(tmp,'sheet.pdf'),'-'],{encoding:'utf8'});for(const marker of ['H0101','Eksempelveien 10','GRUNNPAKKE SERVANT','VALGT TILVALG BATTERI','FROZEN-TEXT','accepted-v2'])eq(text.includes(marker),true,'actual PDF '+marker);
 for(let i=0;i<24;i++)eq(new RegExp('QA-'+i+'\\b').test(text),true,'all 24 item references survive pagination: '+i);
 eq(text.split('\f').filter(p=>p.trim()).every(p=>p.includes('H0101')&&p.includes('Eksempelveien 10')),true,'identity repeats on every printed page');
 eq(text.split('\f')[0].includes('QA firma'),true,'actual first-page header survives global app CSS and scrolled dialog');
 eq(text.includes('INTERNAL-PRIVATE-SHELL'),false,'internal app stays off printed pages');eq(text.split('\f').length>2,true,'real multipage PDF');
 eq(execFileSync('pdfimages',['-list',path.join(tmp,'sheet.pdf')],{encoding:'utf8'}).split('\n').filter(l=>/\s+image\s+/.test(l)).length>0,true,'actual image objects embedded in PDF');
 await page.emulateMedia({media:'screen'});
 eq(await dialog.locator('.bolig-work-sheet').getAttribute('data-columns'),'2','many items automatically use two columns');
 await page.evaluate(()=>{window.__original=structuredClone(window.__state.goods);window.__state.goods=window.__original.slice(0,12).map((g,i)=>({...g,name:'Servantmodell '+i}));});
 await dialog.getByRole('button',{name:'Hent utskriften på nytt',exact:true}).click();await dialog.locator('.bolig-work-good').nth(11).waitFor();
 await page.waitForFunction(()=>[...document.querySelectorAll('.bolig-work-image img')].length===12&&[...document.querySelectorAll('.bolig-work-image img')].every(i=>i.complete&&i.naturalWidth>0));
 await page.emulateMedia({media:'print'});await page.pdf({path:path.join(tmp,'compact.pdf'),preferCSSPageSize:true,printBackground:true});
 if(process.env.BOLIG_PRINT_ARTIFACT_DIR){fs.copyFileSync(path.join(tmp,'compact.pdf'),path.join(process.env.BOLIG_PRINT_ARTIFACT_DIR,'compact-12.pdf'));execFileSync('pdftoppm',['-singlefile','-scale-to','1400','-png',path.join(tmp,'compact.pdf'),path.join(process.env.BOLIG_PRINT_ARTIFACT_DIR,'compact-12')]);}
 const compact=execFileSync('pdftotext',[path.join(tmp,'compact.pdf'),'-'],{encoding:'utf8'});
 eq(compact.split('\f').filter(p=>p.trim()).length,1,'12 normal items with images, identity, notes and provenance fit one A4');
 for(let i=0;i<12;i++)eq(new RegExp('QA-'+i+'\\b').test(compact),true,'compact PDF retains item '+i);
 for(const marker of ['QA firma','Eksempelveien 10','FROZEN-TEXT','accepted-v2'])eq(compact.includes(marker),true,'compact PDF retains '+marker);
 eq(/Page size:\s+595\.\d+ x 841\.\d+ pts \(A4\)/.test(execFileSync('pdfinfo',[path.join(tmp,'compact.pdf')],{encoding:'utf8'})),true,'actual document uses A4');
 eq(await dialog.locator('.bolig-work-good h3').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize)>=13.3),true,'item name stays at least 10pt');
 await page.emulateMedia({media:'screen'});await dialog.getByRole('combobox',{name:'Oppsett',exact:true}).selectOption('1');
 eq(await dialog.locator('.bolig-work-sheet').getAttribute('data-columns'),'1','manual larger-image layout overrides automatic columns');
 await page.evaluate(()=>window.__state.goods=window.__original.slice(0,2));await dialog.getByRole('button',{name:'Hent utskriften på nytt',exact:true}).click();await dialog.locator('.bolig-work-good').nth(1).waitFor();
 await dialog.getByRole('combobox',{name:'Oppsett',exact:true}).selectOption('auto');eq(await dialog.locator('.bolig-work-sheet').getAttribute('data-columns'),'1','few goods automatically retain one column');
 await dialog.getByRole('button',{name:'Skriv ut / lagre som PDF',exact:true}).click();eq(await page.evaluate(()=>window.__prints),1,'explicit print revalidates then opens printer');
 await page.evaluate(()=>window.__state.basis='changed');await dialog.getByRole('button',{name:'Skriv ut / lagre som PDF',exact:true}).click();await dialog.getByRole('alert').waitFor();eq(await page.evaluate(()=>window.__prints),1,'changed confirmed basis blocks stale print');
 await dialog.getByRole('button',{name:'Hent utskriften på nytt',exact:true}).click();await dialog.getByText('Kundebekreftet bestilling',{exact:true}).waitFor();
 await page.evaluate(()=>window.__denied=true);await dialog.getByRole('button',{name:'Skriv ut / lagre som PDF',exact:true}).click();await dialog.getByRole('alert').waitFor();eq(await dialog.locator('.bolig-work-sheet').count(),0,'revoked access removes sheet');
 await page.evaluate(()=>window.__show('other'));await page.getByRole('dialog').waitFor({state:'hidden'});eq(await page.getByRole('dialog').count(),0,'company switch closes private print sheet');
 console.log('PASS confirmed work order print: '+checks+' actual Chromium/PDF assertions, image objects, frozen base+upgrade, mobile, multipage, stale basis and revoked access');
}catch(e){console.error('Print fixture state:',await debugPage?.locator('body').innerText());throw e;}finally{await browser?.close();if(server)await new Promise(r=>server.close(r));fs.rmSync(tmp,{recursive:true,force:true});}
