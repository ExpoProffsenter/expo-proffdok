import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
import {contractPlatform} from './fixtures/bolig-contract-platform.mjs';
import {createContractFiles,contractDigest} from '../supabase/functions/_shared/bolig-contract-files.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const platform=await contractPlatform();let server,browser,checks=0;
const eq=(a,b,m)=>{assert.deepEqual(a,b,m);checks++;};
const minimalPdf=()=>{
 const content='BT /F1 18 Tf 50 750 Td (QA private original) Tj ET';
 const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',`<< /Length ${content.length} >>\nstream\n${content}\nendstream`];
 let output='%PDF-1.4\n',offsets=[0];objects.forEach((o,i)=>{offsets.push(output.length);output+=`${i+1} 0 obj\n${o}\nendobj\n`;});const xref=output.length;output+=`xref\n0 6\n0000000000 65535 f \n`+offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;return Buffer.from(output);
};
const sample=process.env.BOLIG_CONTRACT_SAMPLE_FILE;
const original=sample?await fs.readFile(sample):minimalPdf();
const files=new Map(),control={lostFinish:false,delay:0,revokeOnDownload:false};let uploads=0;
try{
 const built=await build({configFile:false,logLevel:'silent',plugins:[react(),{name:'contract-test-client',enforce:'pre',resolveId:id=>id.endsWith('appSupabaseClientRegistry.js')?'\0client':null,load:id=>id==='\0client'?'export const getAppSupabaseClient=()=>window.__client;':null}],define:{'process.env.NODE_ENV':'"production"','import.meta.env.VITE_SUPABASE_ANON_KEY':'"qa-public"'},build:{write:false,minify:false,lib:{entry:'scripts/fixtures/bolig-contract-harness.jsx',name:'QA',formats:['iife'],cssFileName:'qa'}}});
 const output=(Array.isArray(built)?built[0]:built).output,js=output.find(o=>o.type==='chunk').code,css=output.filter(o=>o.type==='asset'&&o.fileName.endsWith('.css')).map(o=>o.source).join('\n');
 const actors={owner:platform.owner,reader:platform.reader,admin:platform.admin};
 const actorFrom=authorization=>actors[String(authorization).replace('Bearer qa-','')];
 let handler;
 server=http.createServer(async(req,res)=>{
  try{
   if(req.url==='/app.js'){res.setHeader('content-type','text/javascript');res.end(js);return;}
   if(req.url==='/app.css'){res.setHeader('content-type','text/css');res.end(css);return;}
   if(req.method==='POST'){
    const chunks=[];for await(const chunk of req)chunks.push(chunk);const body=Buffer.concat(chunks);
    if(req.url==='/qa/control'){Object.assign(control,JSON.parse(body));res.end('{}');return;}
    if(req.url==='/rpc'){
     const a=JSON.parse(body);if(control.delay&&a.p_action==='get')await new Promise(resolve=>setTimeout(resolve,control.delay));
     try{const data=await platform.rpc(actorFrom(req.headers.authorization),a.p_company_id,a.p_root_id,a.p_action,a.p_payload);res.setHeader('content-type','application/json');res.end(JSON.stringify({data}));}catch(e){res.end(JSON.stringify({error:{code:e.code,message:e.message}}));}return;
    }
    if(req.url==='/functions/v1/bolig-contract-files'){
     const response=await handler(new Request('http://127.0.0.1:'+server.address().port+req.url,{method:'POST',headers:req.headers,body}));
     res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;
    }
   }
   res.setHeader('content-type','text/html');res.end('<!doctype html><html lang="nb"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"><script>window.__qaConfig='+JSON.stringify({company:platform.company,owner:platform.owner,reader:platform.reader,admin:platform.admin,root:platform.root})+'</script><div id="app"></div><script src="/app.js"></script></html>');
  }catch(e){res.statusCode=500;res.end(JSON.stringify({error:e.message}));}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
 handler=createContractFiles({origins:[base],authenticate:async authorization=>{
  const user=actorFrom(authorization);if(!user)return null;
  return {user_id:user,rpc:async(c,r,action,p)=>{const data=await platform.rpc(user,c,r,action,p);if(control.lostFinish&&action==='finish'){control.lostFinish=false;throw Error('QA lost response');}return data;},
   upload:async(path,bytes,mime)=>{if(files.has(path))return {ok:false,status:409};files.set(path,bytes);uploads++;await platform.system("insert into storage.objects values('bolig-contracts',$1,$2)",[path,{size:bytes.length,mimetype:mime}]);return {ok:true,status:200};},
   download:async path=>{if(control.revokeOnDownload){control.revokeOnDownload=false;await platform.system("update bolig_private.contract_access set access_role='none',revision=revision+1 where root_id=$1 and user_id=$2",[platform.root.id,user]);}return new Response(files.get(path)||null,{status:files.has(path)?200:404});}};
 }});
 browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,args:['--no-sandbox','--disable-dev-shm-usage']}: {})});
 const page=await browser.newPage({viewport:{width:1366,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const button=name=>page.getByRole('button',{name,exact:true});
 const setControl=value=>page.evaluate(async value=>{await fetch('/qa/control',{method:'POST',body:JSON.stringify(value)});},value);
 await page.goto(base);await button('Last opp dokument').waitFor();eq(uploads,0,'no writes on mount');
 await button('Last opp dokument').click();await page.getByLabel('Tittel',{exact:true}).fill('QA avtalegrunnlag');
 await page.evaluate(()=>{
  window.__qaUploadDialog=document.querySelector('dialog');window.__qaDialogTransitions=[];
  window.__qaDialogObserver=new MutationObserver(records=>window.__qaDialogTransitions.push(...records.map(r=>r.attributeName)));
  window.__qaDialogObserver.observe(window.__qaUploadDialog,{attributes:true,attributeFilter:['open','hidden']});
 });
 await setControl({delay:600});
 const chooserPromise=page.waitForEvent('filechooser');await page.getByLabel(/Fil \(PDF/).click();const chooser=await chooserPromise;
 await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await page.waitForTimeout(50);
 eq(await page.locator('dialog:visible').count(),1,'native file-picker blur keeps upload dialog open');
 eq(await button('Last opp og lagre').isDisabled(),true,'upload remains blocked during picker reauthorization');
 await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await page.waitForTimeout(100);
 eq(await page.locator('dialog:visible').count(),1,'delayed picker-return authorization keeps same dialog open');
 await chooser.setFiles({name:'qa-original.pdf',mimeType:'application/pdf',buffer:original});
 await button('Last opp og lagre').waitFor();await page.waitForFunction(()=>!document.querySelector('section [role="status"]'));
 eq(await page.evaluate(()=>window.__qaUploadDialog===document.querySelector('dialog')&&window.__qaDialogTransitions.length===0),true,'file selection never closes, hides or replaces upload dialog');
 eq(await page.getByLabel('Tittel',{exact:true}).inputValue(),'QA avtalegrunnlag','file-picker return preserves title');
 const cancelPromise=page.waitForEvent('filechooser');await page.getByLabel(/Fil \(PDF/).click();await cancelPromise;
 await page.evaluate(()=>{window.dispatchEvent(new Event('blur'));window.dispatchEvent(new Event('focus'));document.querySelector('input[type=file]').dispatchEvent(new Event('cancel',{bubbles:true}));});
 await page.waitForFunction(()=>!document.querySelector('section [role="status"]'));
 eq(await page.evaluate(()=>window.__qaUploadDialog===document.querySelector('dialog')&&window.__qaDialogTransitions.length===0),true,'picker cancel does not close or reopen parent dialog');
 eq(await page.getByText(/qa-original.pdf ·/).count(),1,'picker cancel preserves previous file');
 await page.evaluate(()=>window.__qaDialogObserver.disconnect());await setControl({delay:0});
 const backgroundChooser=page.waitForEvent('filechooser');await page.getByLabel(/Fil \(PDF/).click();await backgroundChooser;
 await page.evaluate(()=>{window.dispatchEvent(new Event('blur'));Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
 await page.locator('dialog').waitFor({state:'hidden'});eq(await page.locator('dialog:visible').count(),0,'actual background hides upload even during native picker');
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));document.querySelector('input[type=file]').dispatchEvent(new Event('cancel',{bubbles:true}));});
 await page.getByLabel('Tittel',{exact:true}).waitFor();eq(await page.getByText(/qa-original.pdf ·/).count(),1,'background during picker preserves scoped file draft');
 await page.getByLabel('Merknad til versjonen (valgfritt)').fill('QA original');
 await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await page.getByLabel('Tittel',{exact:true}).waitFor();
 eq(await page.getByLabel('Tittel',{exact:true}).inputValue(),'QA avtalegrunnlag','focus preserves unsent form');
 await page.evaluate(()=>window.dispatchEvent(new Event('blur')));eq(await page.locator('dialog:visible').count(),0,'real blur hides unsent contract form');
 await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await page.getByLabel('Tittel',{exact:true}).waitFor();eq(await page.getByLabel('Tittel',{exact:true}).inputValue(),'QA avtalegrunnlag','blur return preserves scoped draft');
 await page.evaluate(()=>window.__qaShow(false));await page.getByText('QA annet arbeidsområde').waitFor();await page.evaluate(()=>window.__qaShow(true));await button('Fortsett opplasting').click();
 eq(await page.getByLabel('Tittel',{exact:true}).inputValue(),'QA avtalegrunnlag','navigation remount preserves RAM-only title/file draft');
 await setControl({lostFinish:true});await button('Last opp og lagre').click();await button('Prøv samme opplasting igjen').waitFor();eq(uploads,1,'first bytes stored once');
 await button('Prøv samme opplasting igjen').click();await page.getByRole('heading',{name:'QA avtalegrunnlag',exact:true}).waitFor();eq(uploads,1,'lost receipt retry creates no second upload');
 if(process.env.BOLIG_CONTRACT_EVIDENCE_DIR){await fs.mkdir(process.env.BOLIG_CONTRACT_EVIDENCE_DIR,{recursive:true});await page.setViewportSize({width:390,height:1000});await page.screenshot({path:process.env.BOLIG_CONTRACT_EVIDENCE_DIR+'/contracts-390.png',fullPage:true});await page.setViewportSize({width:1366,height:1000});}
 await button('Vis dokument').click();await page.locator('iframe[title="Originalt kontraktsdokument"]').waitFor();
 const url1=await page.locator('iframe').getAttribute('src');eq(url1.startsWith('blob:'),true,'preview uses private local bytes, no signed/public URL');
 await page.locator('iframe').click({position:{x:20,y:20}});eq(await page.locator('iframe').getAttribute('src'),url1,'focusing PDF frame does not close or reload private preview');
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
 await page.locator('dialog').waitFor({state:'hidden',timeout:3000});
 eq(await page.locator('dialog:visible').count(),0,'background hides private viewer');
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
 await page.waitForFunction(old=>document.querySelector('iframe')?.src.startsWith('blob:')&&document.querySelector('iframe')?.src!==old,url1,{timeout:5000});
 await page.locator('iframe').waitFor();const url2=await page.locator('iframe').getAttribute('src');eq(url2!==url1,true,'return gets freshly authorized bytes');
 const downloadPromise=page.waitForEvent('download');await button('Last ned original').click();const downloaded=await downloadPromise;const saved=await fs.readFile(await downloaded.path());eq(await contractDigest(saved),await contractDigest(original),'download preserves exact original bytes');eq(await page.locator('iframe').getAttribute('src'),url2,'download keeps preview open');
 await button('Lukk privat dokumentvisning').click();await button('Ny versjon').click();
 await page.getByLabel(/Fil \(PDF/).setInputFiles({name:'qa-revisjon.pdf',mimeType:'application/pdf',buffer:Buffer.concat([original,Buffer.from('\n% QA revision\n')])});
 await page.getByLabel('Merknad til versjonen (valgfritt)').fill('QA revisjon');await button('Lagre ny versjon').click();await button('Versjoner (2)').waitFor();eq(uploads,2);
 await button('Versjoner (2)').click();await page.getByRole('heading',{name:'Versjon 1',exact:true}).waitFor();eq(await page.locator('dialog .bolig-contract-list article').count(),2,'both immutable versions visible');await button('Lukk dokumentets versjoner').click();
 await button('Tilgang').click();await page.getByLabel('Kontraktstilgang for QA Leser').selectOption('reader');await page.getByText('Kontraktstilgangen er lagret.',{exact:true}).waitFor();await button('Lukk tilgang til kontrakter').click();
 await page.evaluate(()=>window.__qaSwitch('admin'));await page.getByText('Dette området er privat',{exact:true}).waitFor();eq(await page.getByText('QA avtalegrunnlag',{exact:true}).count(),0,'firmaadmin gets no implicit contract metadata');
 await page.evaluate(()=>window.__qaSwitch('reader'));await page.getByRole('heading',{name:'QA avtalegrunnlag',exact:true}).waitFor();eq(await button('Last opp dokument').count(),0,'explicit reader cannot upload');
 for(const width of [320,390,768,1366]){await page.setViewportSize({width,height:1000});eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'fits '+width);}
 await setControl({revokeOnDownload:true});await button('Vis dokument').click();await page.getByText('Dette området er privat',{exact:true}).waitFor();eq(await page.locator('iframe').count(),0,'revoke while reading returns no viewer bytes');
 await page.evaluate(()=>window.__qaSwitch('owner'));await button('Last opp dokument').waitFor();await button('Last opp dokument').click();await page.getByLabel('Tittel',{exact:true}).fill('QA usendt kladd');
 const revokedChooser=page.waitForEvent('filechooser');await page.getByLabel(/Fil \(PDF/).click();const revokedPicker=await revokedChooser;
 await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
 await platform.system('update public.profiles set deactivated=true where id=$1',[platform.owner]);
 await revokedPicker.setFiles({name:'qa-revoked.pdf',mimeType:'application/pdf',buffer:original});
 await page.locator('dialog').waitFor({state:'hidden'});eq(await page.locator('dialog:visible').count(),0,'revocation while choosing file closes upload after fresh authorization');eq(uploads,2,'revoked picker never writes bytes');
 await platform.system('update public.profiles set deactivated=false where id=$1',[platform.owner]);
 await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await button('Last opp dokument').click();eq(await page.getByLabel('Tittel',{exact:true}).inputValue(),'','revocation clears file and title draft');
 await page.getByLabel('Tittel',{exact:true}).fill('QA usendt kladd');
 await page.evaluate(()=>{window.dispatchEvent(new CustomEvent('expo-proffdok-work-profile',{detail:{active_company_id:'different-company'}}));});
 await page.waitForTimeout(100);eq(await page.locator('dialog:visible').count(),0,'real company change cannot restore old dialog');
 eq(await page.evaluate(()=>localStorage.length+sessionStorage.length),0,'no contract drafts or data stored on device');eq(errors,[]);
 console.log(`Private contracts browser: ${checks} assertions PASS; actual React, actual SQL ACL/version RPCs and actual Edge handler over local HTTP. Auth/Storage are synthetic. ${sample?'Actual attached PDF used locally without persisting its content.':'Synthetic original.'}`);
}finally{await browser?.close();if(server)await new Promise(resolve=>server.close(resolve));await platform.db.close();}
