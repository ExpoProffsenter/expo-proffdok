import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
import {contractPlatform} from './fixtures/bolig-contract-platform.mjs';
import {createContractFiles,contractDigest} from '../supabase/functions/_shared/bolig-contract-files.mjs';
import {createContractReviewHandler} from '../supabase/functions/_shared/bolig-contract-review.mjs';
import {contractAssetsPlugin} from './bolig-contract-assets.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const platform=await contractPlatform();let server,browser,checks=0;
const eq=(a,b,m)=>{assert.deepEqual(a,b,m);checks++;};
const minimalPdf=()=>{
 const content='BT /F1 12 Tf 50 750 Td (QA private original. Endringer skal varsles skriftlig for arbeidet starter.) Tj ET';
 const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',`<< /Length ${content.length} >>\nstream\n${content}\nendstream`];
 let output='%PDF-1.4\n',offsets=[0];objects.forEach((o,i)=>{offsets.push(output.length);output+=`${i+1} 0 obj\n${o}\nendobj\n`;});const xref=output.length;output+=`xref\n0 6\n0000000000 65535 f \n`+offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;return Buffer.from(output);
};
const sample=process.env.BOLIG_CONTRACT_SAMPLE_FILE;
const original=sample?await fs.readFile(sample):minimalPdf();
const reviewQA=process.env.BOLIG_CONTRACT_REVIEW_QA==='1';
const files=new Map(),control={lostFinish:false,delay:0,revokeOnDownload:false,modelUnavailable:false,reviewDelay:0};let uploads=0,reviewCalls=0,extractedSummary=null;
try{
 const built=await build({configFile:false,logLevel:'silent',plugins:[react(),...(reviewQA?[contractAssetsPlugin()]:[]),{name:'contract-test-client',enforce:'pre',resolveId:id=>id.endsWith('appSupabaseClientRegistry.js')?'\0client':null,load:id=>id==='\0client'?'export const getAppSupabaseClient=()=>window.__client;':null}],define:{'process.env.NODE_ENV':'"production"','import.meta.env.VITE_SUPABASE_ANON_KEY':'"qa-public"'},build:{write:false,minify:false,lib:{entry:'scripts/fixtures/bolig-contract-harness.jsx',name:'QA',formats:['es'],cssFileName:'qa'}}});
 const output=(Array.isArray(built)?built[0]:built).output,js=output.find(o=>o.type==='chunk'&&o.isEntry).code,css=output.filter(o=>o.type==='asset'&&o.fileName.endsWith('.css')).map(o=>o.source).join('\n');
 const assets=new Map(output.map(o=>['/'+o.fileName,o.type==='chunk'?o.code:o.source]));
 const actors={owner:platform.owner,reader:platform.reader,admin:platform.admin};
 const actorFrom=authorization=>actors[String(authorization).replace('Bearer qa-','')];
 let handler,reviewHandler;
 server=http.createServer(async(req,res)=>{
  try{
   if(req.url==='/app.js'){res.setHeader('content-type','text/javascript');res.end(js);return;}
   if(req.url==='/app.css'){res.setHeader('content-type','text/css');res.end(css);return;}
   if(assets.has(req.url)){res.setHeader('content-type',req.url.endsWith('.wasm')?'application/wasm':req.url.endsWith('.gz')?'application/gzip':'text/javascript');res.end(assets.get(req.url));return;}
   if(req.method==='POST'){
    const chunks=[];for await(const chunk of req)chunks.push(chunk);const body=Buffer.concat(chunks);
    if(req.url==='/qa/control'){Object.assign(control,JSON.parse(body));res.end('{}');return;}
    if(req.url==='/rpc'){
     const a=JSON.parse(body);if(control.delay&&a.p_action==='get')await new Promise(resolve=>setTimeout(resolve,control.delay));
     try{const data=await platform[a.__name==='bolig_contract_review'?'review':'rpc'](actorFrom(req.headers.authorization),a.p_company_id,a.p_root_id,a.p_action,a.p_payload);res.setHeader('content-type','application/json');res.end(JSON.stringify({data}));}catch(e){res.end(JSON.stringify({error:{code:e.code,message:e.message}}));}return;
    }
    if(req.url==='/functions/v1/bolig-contract-files'){
     const response=await handler(new Request('http://127.0.0.1:'+server.address().port+req.url,{method:'POST',headers:req.headers,body}));
     res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;
    }
    if(req.url==='/api/bolig-contract-review'){
     const response=await reviewHandler(new Request('http://127.0.0.1:'+server.address().port+req.url,{method:'POST',headers:{...req.headers,origin:base},body}));
     res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;
    }
   }
   res.setHeader('content-type','text/html');res.end('<!doctype html><html lang="nb"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"><script>window.__qaConfig='+JSON.stringify({company:platform.company,owner:platform.owner,reader:platform.reader,admin:platform.admin,root:platform.root})+'</script><div id="app"></div><script type="module" src="/app.js"></script></html>');
  }catch(e){res.statusCode=500;res.end(JSON.stringify({error:e.message}));}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
 handler=createContractFiles({origins:[base],authenticate:async authorization=>{
  const user=actorFrom(authorization);if(!user)return null;
  return {user_id:user,rpc:async(c,r,action,p)=>{const data=await platform.rpc(user,c,r,action,p);if(control.lostFinish&&action==='finish'){control.lostFinish=false;throw Error('QA lost response');}return data;},
   upload:async(path,bytes,mime)=>{if(files.has(path))return {ok:false,status:409};files.set(path,bytes);uploads++;await platform.system("insert into storage.objects values('bolig-contracts',$1,$2)",[path,{size:bytes.length,mimetype:mime}]);return {ok:true,status:200};},
   download:async path=>{if(control.revokeOnDownload){control.revokeOnDownload=false;await platform.system("update bolig_private.contract_access set access_role='none',revision=revision+1 where root_id=$1 and user_id=$2",[platform.root.id,user]);}return new Response(files.get(path)||null,{status:files.has(path)?200:404});}};
 }});
 reviewHandler=createContractReviewHandler({allowedOrigins:new Set([base]),authenticate:async authorization=>{const actor=actorFrom(authorization);return actor?{rpc:(c,r,a,v)=>platform.review(actor,c,r,a,v)}:null;},generate:async input=>{
  reviewCalls++;if(control.reviewDelay)await new Promise(resolve=>setTimeout(resolve,control.reviewDelay));if(control.modelUnavailable)throw Error('QA unavailable');
  const source=input.sources[0],page=source.pages.find(p=>p.text.trim().length>=40);
  if(!page)throw Error('QA no readable source');
  return {findings:[{kind:'uncertain',topic:'notification',title:'QA kildebelagt forslag',explanation:'QA-forslag basert på valgt tekstside. Kontroller originalen.',sources:[{text_id:source.id,page:page.number,quote:page.text.trim().slice(0,80)}]}],not_found:['QA: øvrige forhold kan ikke fastslås i valgt tekstgrunnlag.'],limitations:['QA: syntetisk modellforslag, ikke en virkelig kontraktsanalyse.']};
 }});
 browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,args:['--no-sandbox','--disable-dev-shm-usage']}: {})});
 const page=await browser.newPage({viewport:{width:1366,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 if(process.env.BOLIG_CONTRACT_QA_DIAGNOSTICS==='1')page.on('console',m=>{if(['error','warning'].includes(m.type()))console.log('QA browser:',m.text().slice(0,250));});
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
 if(reviewQA){
  const external=[];const watch=req=>{if(!req.url().startsWith(base)&&!req.url().startsWith('blob:')&&!req.url().startsWith('data:'))external.push(new URL(req.url()).origin);};page.on('request',watch);
  // Preloaded synthetic scan, independent of the upload/retry counters below.
  // Exercise actual OCR and abort/restart in CI even when the PDF has native text.
  const png=Buffer.from(await page.evaluate(()=>{const c=document.createElement('canvas');c.width=1800;c.height=800;const x=c.getContext('2d');x.fillStyle='white';x.fillRect(0,0,c.width,c.height);x.fillStyle='black';x.font='48px Arial';x.fillText('Endringer skal varsles skriftlig.',70,170);x.fillText('Betalingsfrist er 30 dager etter mottatt faktura.',70,260);return c.toDataURL('image/png').split(',')[1];}),'base64');
  const scanId=crypto.randomUUID(),scanDoc=crypto.randomUUID(),scan=await platform.rpc(platform.owner,platform.company,platform.root.id,'prepare',{id:scanId,document_id:scanDoc,revision:0,title:'QA OCR test',kind:'attachment',name:'qa-scan.png',mime:'image/png',size:png.length,sha256:await contractDigest(png),comment:''});
  files.set(scan.path,png);await platform.system("insert into storage.objects values('bolig-contracts',$1,$2)",[scan.path,{size:png.length,mimetype:'image/png'}]);await platform.rpc(platform.owner,platform.company,platform.root.id,'finish',{id:scanId});
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await button('Les og gjennomgå kontrakter').click();
  const scanCard=page.locator('.bolig-contract-review-docs article').filter({hasText:'QA OCR test'});
  // Synchronize with actual worker I/O, not a short-lived progress label. Cold
  // worker startup differs between CI and local Chromium; the following restart
  // still has to read real words and leave exactly one complete text snapshot.
  const ocrStarted=page.waitForRequest(req=>req.url()===base+'/bolig/ocr/nor.traineddata.gz',{timeout:120000});
  await scanCard.getByRole('button',{name:'Gjør søkbar',exact:true}).click();await ocrStarted;
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));eq(await page.locator('dialog:visible').count(),0,'background cancels OCR and hides scan draft');
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await scanCard.getByRole('button',{name:'Gjør søkbar',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.bolig-contract-review [role="alert"]')||Array.from(document.querySelectorAll('.bolig-contract-review [role="status"]')).some(e=>e.textContent.startsWith('Tekstutgaven er lagret.')),null,{timeout:120000});
  eq(await page.locator('.bolig-contract-review [role="alert"]').allTextContents(),[],'actual OCR can restart after background abort');
  const scanText=(await platform.system('select pages from bolig_private.contract_texts where file_id=$1',[scanId]))[0].pages;
  eq(scanText[0].method,'ocr','actual image uses OCR worker');eq(/varsles/i.test(scanText[0].text),true,'OCR reads synthetic scanned words');
  eq((await platform.system('select count(*)::int n from bolig_private.contract_texts where file_id=$1',[scanId]))[0].n,1,'aborted OCR creates no partial or duplicate text snapshot');
  await button('Lukk kontraktsgjennomgang').click();
  await platform.system('delete from bolig_private.contract_texts where file_id=$1',[scanId]);await platform.system('delete from bolig_private.contract_files where id=$1',[scanId]);await platform.system('delete from bolig_private.contract_documents where id=$1',[scanDoc]);await platform.system('delete from bolig_private.contract_events where entity_id=$1',[scanId]);await platform.system('delete from storage.objects where name=$1',[scan.path]);files.delete(scan.path);
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await button('Les og gjennomgå kontrakter').click();await button('Gjør søkbar').click();
  await page.waitForFunction(()=>document.querySelector('.bolig-contract-review [role="alert"]')||Array.from(document.querySelectorAll('.bolig-contract-review [role="status"]')).some(e=>e.textContent.startsWith('Tekstutgaven er lagret.')),null,{timeout:240000});
  eq(await page.locator('.bolig-contract-review [role="alert"]').allTextContents(),[],'text/OCR worker completes without errors');
  eq(await page.locator('.bolig-contract-review-pages>details').count(),sample?7:1,'actual PDF text/OCR produces one record per original PDF page');
  const storedPages=(await platform.system('select pages from bolig_private.contract_texts order by created_at desc limit 1'))[0].pages;extractedSummary={pages:storedPages.length,uncertain:storedPages.filter(p=>p.text.trim().length<40||(p.method==='ocr'&&p.confidence<70)).length,readable:storedPages.filter(p=>p.text.trim().length>=40).length};
  eq(external,[],'OCR, worker, WASM and language assets are served locally; no document request to CDN');page.off('request',watch);
  const textBody=await page.locator('.bolig-contract-review-page-text').first().textContent();const word=textBody.match(/[A-Za-zÆØÅæøå]{6,}/)?.[0];assert.ok(word,'local extraction found searchable text');checks++;
  await page.getByLabel('Søk i kontraktstekst',{exact:true}).fill(word);await button('Søk i teksten').click();await page.locator('.bolig-contract-review-source').first().waitFor();
  eq(await page.locator('.bolig-contract-review-source').count()>0,true,'search finds private page text');
  await page.setViewportSize({width:390,height:600});
  await page.locator('.bolig-contract-review-pages>details').first().locator('summary').click();
  await page.evaluate(()=>{window.__qaReadingDialog=document.querySelector('dialog[open]');window.__qaReadingPage=document.querySelector('.bolig-contract-review-pages>details');window.__qaReadingDialog.scrollTop=140;window.__qaReadingScroll=window.__qaReadingDialog.scrollTop;});
  await setControl({delay:300});await page.evaluate(()=>window.__qaContractInterval());
  await page.waitForTimeout(50);
  eq(await page.locator('dialog:visible').count(),1,'periodic ACL check keeps authorized reading dialog open');
  await page.waitForFunction(()=>!Array.from(document.querySelectorAll('button')).find(b=>b.textContent==='Hent siste oversikt')?.disabled);
  eq(await page.evaluate(()=>document.querySelector('.bolig-contract-review-pages>details')===window.__qaReadingPage&&window.__qaReadingPage.open),true,'periodic check keeps the same expanded text page');
  eq(await page.evaluate(()=>window.__qaReadingDialog.scrollTop),await page.evaluate(()=>window.__qaReadingScroll),'periodic check preserves reading scroll');
  eq(await page.locator('.bolig-contract-review-source').count()>0,true,'periodic check preserves current search results');
  await setControl({delay:0});await page.setViewportSize({width:1366,height:1000});
  await page.getByRole('button',{name:'Åpne kildeside',exact:true}).first().click();await page.locator('iframe').waitFor();eq((await page.locator('iframe').getAttribute('src')).includes('#page='),true,'source opens exact original PDF page');
  await button('Tilbake til gjennomgang').click();await button('Gjennomgang').click();await page.getByLabel('Spørsmål til kontrakten (valgfritt)').fill('QA: Hva står det om varsling?');
  await setControl({delay:500});await page.evaluate(()=>window.dispatchEvent(new Event('blur')));eq(await page.locator('dialog:visible').count(),0,'background hides private review');
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await page.getByLabel('Spørsmål til kontrakten (valgfritt)').waitFor();eq(await page.getByLabel('Spørsmål til kontrakten (valgfritt)').inputValue(),'QA: Hva står det om varsling?','delayed authorization preserves unsent review question and tab');await setControl({delay:0});
  await setControl({reviewDelay:1200});await button('Start gjennomgang (1)').click();await page.getByText('Gjennomgår valgte tekstutgaver og kontrollerer kildeutdrag …',{exact:true}).waitFor();await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await page.getByText('QA kildebelagt forslag',{exact:true}).waitFor();eq(reviewCalls,1,'foreground ACL refresh keeps the same generation without duplicate or lost result');await setControl({reviewDelay:0});
  await page.locator('.bolig-contract-review-finding summary').click();eq(await page.locator('.bolig-contract-review-finding blockquote').count(),1,'saved finding carries verified quote and version/page');
  await page.locator('.bolig-contract-review-finding').getByRole('button',{name:'Åpne kildeside',exact:true}).click();await page.locator('iframe').waitFor();await button('Tilbake til gjennomgang').click();await page.getByText('QA kildebelagt forslag',{exact:true}).waitFor();eq(await page.locator('textarea').inputValue(),'QA: Hva står det om varsling?','source roundtrip keeps report, question and reading tab');
  if(process.env.BOLIG_CONTRACT_EVIDENCE_DIR){await page.setViewportSize({width:390,height:1000});await page.screenshot({path:process.env.BOLIG_CONTRACT_EVIDENCE_DIR+'/review-390.png',fullPage:true});await page.setViewportSize({width:1366,height:1000});}
  for(const width of [320,390,768,1366]){await page.setViewportSize({width,height:1000});eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'review fits '+width);}await page.setViewportSize({width:1366,height:1000});
  await platform.system("update bolig_private.contract_reviews set created_at=now()-interval '1 minute'");await setControl({modelUnavailable:true});await page.locator('.bolig-contract-review-configuration summary').click();await button('Start gjennomgang (1)').click();await page.getByText('Analysetjenesten er ikke tilgjengelig. Tekst og søk er beholdt. Prøv senere eller kontakt systemadministrator.',{exact:true}).waitFor();
  eq((await platform.system("select count(*)::int n from bolig_private.contract_reviews where state='ready'"))[0].n,1,'provider failure never becomes a saved analysis');await setControl({modelUnavailable:false});
  await button('Lukk kontraktsgjennomgang').click();
 }
 if(process.env.BOLIG_CONTRACT_EVIDENCE_DIR){await fs.mkdir(process.env.BOLIG_CONTRACT_EVIDENCE_DIR,{recursive:true});await page.setViewportSize({width:390,height:1000});await page.screenshot({path:process.env.BOLIG_CONTRACT_EVIDENCE_DIR+'/contracts-390.png',fullPage:true});await page.setViewportSize({width:1366,height:1000});}
 await button('Vis dokument').click();await page.locator('iframe[title="Originalt kontraktsdokument"]').waitFor();
 const url1=await page.locator('iframe').getAttribute('src');eq(url1.startsWith('blob:'),true,'preview uses private local bytes, no signed/public URL');
 await page.evaluate(()=>{window.__qaOriginalFrame=document.querySelector('iframe');window.__qaContractInterval();});
 await page.waitForFunction(()=>!Array.from(document.querySelectorAll('button')).find(b=>b.textContent==='Hent siste oversikt')?.disabled);
 eq(await page.evaluate(()=>document.querySelector('iframe')===window.__qaOriginalFrame),true,'periodic authorization keeps the original PDF frame mounted');
 eq(await page.locator('iframe').getAttribute('src'),url1,'periodic authorization does not reload the PDF or reset its page');
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
 if(reviewQA){await button('Les og gjennomgå kontrakter').click();await button('Gjennomgang').click();await page.locator('.bolig-contract-review-history summary').click();await page.getByRole('button',{name:/Lagret forslag/}).click();await page.getByText('Dette er et historisk grunnlag.',{exact:false}).waitFor();eq(await page.getByText('QA kildebelagt forslag',{exact:true}).count(),1,'new version keeps and labels historical review');await button('Lukk kontraktsgjennomgang').click();}
 await button('Versjoner (2)').click();await page.getByRole('heading',{name:'Versjon 1',exact:true}).waitFor();eq(await page.locator('dialog .bolig-contract-list article').count(),2,'both immutable versions visible');await button('Lukk dokumentets versjoner').click();
 await button('Tilgang').click();await page.getByLabel('Kontraktstilgang for QA Leser').selectOption('reader');await page.getByText('Kontraktstilgangen er lagret.',{exact:true}).waitFor();await button('Lukk tilgang til kontrakter').click();
 await page.evaluate(()=>window.__qaSwitch('admin'));await page.getByText('Dette området er privat',{exact:true}).waitFor();eq(await page.getByText('QA avtalegrunnlag',{exact:true}).count(),0,'firmaadmin gets no implicit contract metadata');
 await page.evaluate(()=>window.__qaSwitch('reader'));await page.getByRole('heading',{name:'QA avtalegrunnlag',exact:true}).waitFor();eq(await button('Last opp dokument').count(),0,'explicit reader cannot upload');
 if(reviewQA){await button('Les og gjennomgå kontrakter').click();eq(await button('Gjør søkbar').count(),0,'reader cannot create private text');await button('Gjennomgang').click();await page.locator('.bolig-contract-review-history summary').click();await page.getByRole('button',{name:/Lagret forslag/}).click();await page.getByText('QA kildebelagt forslag',{exact:true}).waitFor();eq(await page.getByRole('button',{name:/Start gjennomgang/,includeHidden:true}).isDisabled(),true,'reader may read existing report but cannot spend generation');await button('Lukk kontraktsgjennomgang').click();}
 for(const width of [320,390,768,1366]){await page.setViewportSize({width,height:1000});eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'fits '+width);}
 await button('Vis dokument').click();await page.locator('iframe').waitFor();
 await platform.rpc(platform.owner,platform.company,platform.root.id,'grant',{user_id:platform.reader,role:'none',revision:1});
 await page.evaluate(()=>window.__qaContractInterval());await page.getByText('Dette området er privat',{exact:true}).waitFor();
 eq(await page.locator('iframe').count(),0,'periodic ACL denial removes cached original bytes');
 eq(await page.locator('dialog:visible').count(),0,'periodic ACL denial closes private reading view');
 await platform.rpc(platform.owner,platform.company,platform.root.id,'grant',{user_id:platform.reader,role:'reader',revision:2});
 await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await page.getByRole('heading',{name:'QA avtalegrunnlag',exact:true}).waitFor();
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
 if(reviewQA)eq(await page.evaluate(async()=>typeof indexedDB.databases==='function'?(await indexedDB.databases()).length:0),0,'OCR does not persist private data or models in IndexedDB');
 if(reviewQA)console.log('Local text/OCR quality counts:',JSON.stringify(extractedSummary));
 console.log(`Private contracts browser: ${checks} assertions PASS; actual React, actual SQL ACL/version RPCs and actual Edge handler over local HTTP. Auth/Storage are synthetic. ${sample?'Actual attached PDF used locally without persisting its content.':'Synthetic original.'}`);
}finally{await browser?.close();if(server)await new Promise(resolve=>server.close(resolve));await platform.db.close();}
