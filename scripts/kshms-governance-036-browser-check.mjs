import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.cwd(),out=process.env.KS_GOVERNANCE_SCREENSHOTS;
if(out)fs.mkdirSync(out,{recursive:true});
let checks=0,browser;const seen=[];const eq=(a,b,message)=>{assert.deepEqual(a,b,message);checks++;};
const built=await build({root,configFile:false,logLevel:'silent',plugins:[react(),{name:'governance-transport-only',enforce:'pre',resolveId(id){if(id.endsWith('/kshmsAccess.js'))return '\0ks-rpc';if(id.endsWith('/appSupabaseClientRegistry.js'))return '\0ks-client';},load(id){if(id==='\0ks-rpc')return 'export const kshmsRpc=(...args)=>window.rpc(...args);';if(id==='\0ks-client')return 'export const getAppSupabaseClient=()=>null;';if(process.env.KS_GOVERNANCE_NEGATIVE&&id.endsWith('/kshmsGovernance036.css'))return '';}}],resolve:{alias:{react:path.join(root,'node_modules/react'),'react-dom':path.join(root,'node_modules/react-dom')}},define:{'process.env.NODE_ENV':'"production"','import.meta.env.VITE_EXPO_BACKEND_TARGET':'"sandbox"'},build:{write:false,minify:false,target:'esnext',lib:{entry:path.join(root,'scripts/fixtures/kshms-governance-036-harness.jsx'),formats:['es'],name:'KsGovernance036',cssFileName:'ks-governance036'}}});
const items=(Array.isArray(built)?built[0]:built).output,entry=items.find(x=>x.type==='chunk'&&x.isEntry).fileName,chunks=new Map(items.filter(x=>x.type==='chunk').map(x=>[x.fileName,x.code])),css=items.filter(x=>x.fileName.endsWith('.css')).map(x=>x.source).join('\n');
const server=http.createServer((req,res)=>{const name=new URL(req.url,'http://127.0.0.1').pathname.slice(1);if(chunks.has(name)){res.setHeader('Content-Type','text/javascript');res.end(chunks.get(name));return;}res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style><div id="app"></div><script type="module" src="/'+entry+'"></script>');});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});
 const page=await browser.newPage(),errors=[],outbound=[];page.setDefaultTimeout(10000);
 page.on('pageerror',error=>errors.push(error.message));page.on('dialog',dialog=>dialog.dismiss());
 await page.route('**/*',route=>{if(new URL(route.request().url()).hostname==='127.0.0.1')return route.continue();outbound.push(route.request().url());return route.abort();});
 await page.goto('http://127.0.0.1:'+server.address().port);
 const native=()=>page.locator('.ks-native-workspace:not([hidden])');
 const render=async(role='manager')=>{const serial=await page.evaluate(role=>window.qa.render(role),role);await page.waitForFunction(serial=>window.qa.committed.serial===serial,serial);await page.locator('.ks-module').waitFor();};
 const navigate=async(label,screen)=>{await page.getByRole('button',{name:'Verktøy og maler',exact:true}).click();await page.getByRole('dialog',{name:'KS/HMS-verktøy',exact:true}).getByRole('button',{name:label,exact:true}).click();await page.locator('.ks-native-workspace[data-ks-screen="'+screen+'"]:not([hidden])').waitFor();};
 const inspect=async(label)=>{
  seen.push(label);
  eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,label+' no horizontal document overflow');
  const bad=await native().locator('button,summary,input:not([type=checkbox]):not([type=radio]),select,textarea').evaluateAll(nodes=>nodes.filter(n=>n.checkVisibility()).flatMap(n=>{const r=n.getBoundingClientRect(),s=getComputedStyle(n);return parseFloat(s.fontSize)<16||r.height<43.99?[{tag:n.tagName,text:n.textContent.slice(0,45),font:s.fontSize,height:r.height}]:[];}));
  eq(bad,[],label+' all actual controls 16px/44px');
  const frames=await native().locator('.ks-card,.ks-proposal,.ks-selection-review,.ks-ack-person,.ks-personal-routine,.ks-library-card').evaluateAll(nodes=>nodes.filter(n=>n.checkVisibility()).map(n=>{const s=getComputedStyle(n);return {radius:s.borderRadius,border:s.borderTopWidth};}).filter(s=>s.radius!=='8px'||s.border!=='1px'));
  eq(frames,[],label+' same 8px/1px native frames');
  if(out&&(/-(1363|390)$/.test(label)))await page.screenshot({path:path.join(out,label+'.png')});
 };
 for(const [width,height] of [[1363,700],[1920,936],[768,600],[390,600],[320,480]]){
  await page.setViewportSize({width,height});await render();await navigate('Håndbok','handbook');
  if(width===1363||width===390){
   await page.getByText('Legg til flere rutiner',{exact:true}).click();
   const library=page.getByRole('region',{name:'Velg standardrutiner',exact:true});
   await library.getByRole('button',{name:/^Alle forslag /}).click();
   await library.getByRole('searchbox',{name:'Søk i ProffDoks forslag',exact:true}).fill('umuligsyntetiskord');
   eq(await library.locator('.ks-library-card').count(),0,'no invented library search hit');
   await library.getByRole('button',{name:/^Butikk, lager og truck /}).click();
   eq(await library.locator('.ks-library-card').count(),14,'all store source proposals available');
   const checkbox=library.getByRole('checkbox').first();await checkbox.check();
   const preview=library.getByRole('button',{name:/^Les forslag:/}).first();await preview.click();await inspect('library-proposal-'+width);
   await page.getByRole('button',{name:'Lukk forslag',exact:true}).click();eq(await checkbox.isChecked(),true,'preview close keeps native selection');
   await library.getByRole('button',{name:'Fjern markeringer',exact:true}).click();
   await library.getByRole('button',{name:/^Anbefalte /}).click();await inspect('library-filters-'+width);
   await page.getByText('Legg til flere rutiner',{exact:true}).click();
  }
  await page.getByRole('button',{name:'Ny rutine fra blank mal',exact:true}).click();
  const form=native().locator('.ks-routine-form-036'),title=form.getByLabel('Tittel',{exact:true}),chapter=form.getByLabel('Kapittel',{exact:true});
  await form.waitFor();
  const boxes=await Promise.all([title.boundingBox(),chapter.boundingBox()]);eq(width>760?Math.abs(boxes[0].y-boxes[1].y)<2:boxes[1].y>boxes[0].y,true,'editor '+width+' uses PC columns and mobile sequence');
  await inspect('blank-editor-'+width);
  await title.fill('QA lokal egen rutine');const handle=await title.elementHandle();
  await form.getByRole('button',{name:'Lagre utkast',exact:true}).click();
  eq(await form.evaluate(n=>n.querySelector(':invalid')!==null),true,'native required stops blank fields before command');
  await page.getByRole('button',{name:'Fyll tomme rutinefelt med tekstforslag',exact:true}).click();eq(await title.inputValue(),'QA lokal egen rutine','suggestions keep own title');
  await form.getByRole('button',{name:'Legg til kilde',exact:true}).click();
  await form.getByLabel('Kildenavn 1',{exact:true}).fill('QA kilde');await form.getByLabel('Lenke til kilde 1',{exact:true}).fill('https://example.invalid/qa');
  await form.getByRole('combobox',{name:/Kildetype/}).selectOption('company');await inspect('source-fields-'+width);
  await form.getByRole('button',{name:'Fjern kilde 1',exact:true}).click();eq(await form.locator('.ks-reference').count(),0,'remove only local source');eq(await title.evaluate((n,original)=>n===original,handle),true,'same title DOM through source add/remove');
  await page.evaluate(()=>{window.dispatchEvent(new Event('blur'));document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new Event('focus'));});eq(await title.inputValue(),'QA lokal egen rutine','own draft after focus/visibility');
  await form.getByRole('button',{name:'Lukk redigering',exact:true}).click();
  // A fresh actor keeps the following read-only scenarios independent of that
  // intentionally retained device-local draft. No storage reset or app stub.
  await render();await navigate('Håndbok','handbook');
  await page.getByRole('button',{name:'Godkjenn flere rutiner (1)',exact:true}).click();
  const batch=page.getByRole('region',{name:'Samlet firmagodkjenning',exact:true});
  await batch.getByText('Les lagret tekst',{exact:true}).click();await inspect('batch-selection-'+width);
  await batch.getByRole('button',{name:'Velg alle som venter (1)',exact:true}).click();await batch.getByRole('button',{name:'Se over 1 valgte rutiner',exact:true}).click();
  await batch.getByText('Les teksten som blir publisert',{exact:true}).click();await batch.getByText('Valgfritt: Bekreft også egen gjennomgang',{exact:true}).click();
  eq(await batch.getByRole('button',{name:'Godkjenn og publiser 1 valgte rutiner',exact:true}).isDisabled(),true,'opening final publication never consents');await inspect('batch-review-'+width);
  await batch.getByRole('textbox',{name:/^Felles vurdering – hva er kontrollert eller endret/}).fill('QA lokal vurdering');
  await batch.getByRole('button',{name:'Tilbake til utvalget',exact:true}).click();await batch.getByRole('button',{name:'Se over 1 valgte rutiner',exact:true}).click();eq(await batch.getByRole('textbox',{name:/^Felles vurdering – hva er kontrollert eller endret/}).inputValue(),'QA lokal vurdering','back preserves actual assessment');eq(await batch.getByRole('checkbox').first().isChecked(),false,'back clears actual consent');await batch.getByRole('button',{name:'Avbryt',exact:true}).click();
  await page.getByRole('searchbox',{name:'Søk i firmaets rutiner',exact:true}).fill('QA Venter');
  await page.getByRole('button',{name:'Åpne godkjenning: QA Venter på godkjenning',exact:true}).click();
  eq(await page.getByRole('button',{name:'Godkjenn og publiser',exact:true}).isDisabled(),true,'single publication retains required assessment');await inspect('single-publication-'+width);
  await page.getByRole('button',{name:'Avbryt',exact:true}).click();await page.getByRole('searchbox',{name:'Søk i firmaets rutiner',exact:true}).fill('QA Firmaets');
  await page.getByText('Les publisert versjon 2',{exact:true}).click();
  await page.getByText('Versjonshistorikk (2)',{exact:true}).click();const versions=page.locator('.ks-chapter details details>summary');
  for(let i=0;i<await versions.count();i++)await versions.nth(i).click();await inspect('published-history-'+width);
  await navigate('Oppfølging og revisjon','followup');await page.getByRole('button',{name:'Sammenlign tekstforslag',exact:true}).first().click();
  const compare=page.getByRole('complementary',{name:'Sammenlign ProffDoks tekstforslag',exact:true});
  const summaries=compare.locator('details>summary');eq(await summaries.count(),8,'all eight source fields');
  for(let i=0;i<await summaries.count();i++){await summaries.nth(i).click();await inspect('source-compare-'+i+'-'+width);await summaries.nth(i).click();}
  const own=page.getByLabel('I vår bedrift har vi følgende rutine',{exact:true});const oldOwn=await own.inputValue();await compare.getByText(/Fremgangsmåte ·/).click();await compare.getByRole('button',{name:'Bruk forslagets fremgangsmåte',exact:true}).click();eq(await own.inputValue()!==oldOwn,true,'partial source adoption changes only native draft');
  eq(await page.getByRole('searchbox',{name:'Søk i firmaets rutiner',exact:true}).isVisible(),true,'source adoption keeps handbook destination');await page.getByRole('button',{name:'Lukk redigering',exact:true}).click();
  await render();await navigate('Oppfølging og revisjon','followup');await page.getByText('Gjennomfør revisjon',{exact:true}).click();await page.getByText('Revisjonshistorikk (1)',{exact:true}).click();await page.locator('.ks-ack-person>summary').click();await page.getByText('Gi godkjente rutiner til nye medarbeidere',{exact:true}).click();await inspect('revision-history-followup-'+width);
  eq(await page.getByRole('button',{name:'Signer revisjon',exact:true}).isDisabled(),true,'revision stays unsigned');await page.getByLabel('Hva har du kontrollert?',{exact:true}).fill('QA lokal revisjonskladd');await page.getByText('Gjennomfør revisjon',{exact:true}).click();await page.getByText('Gjennomfør revisjon',{exact:true}).click();eq(await page.getByLabel('Hva har du kontrollert?',{exact:true}).inputValue(),'QA lokal revisjonskladd','revision disclosure preserves actual field');
  await navigate('Oppstart og tilgang','setup');await inspect('setup-and-access-'+width);eq(await page.locator('.ks-member select').first().isDisabled(),true,'firmaadmin native access remains automatic/read only');
  await navigate('Les og bekreft (1)','reading');await page.getByRole('button',{name:'Se og bekreft alle 1 rutineutgaver',exact:true}).click();await inspect('own-batch-consent-'+width);eq(await page.getByRole('button',{name:'Bekreft alle 1 rutineutgaver',exact:true}).isDisabled(),true,'own batch requires own unchecked consent');
  await page.locator('.ks-bulk-ack .ks-selected-list button').click();await inspect('own-single-reading-'+width);eq(await page.getByRole('button',{name:'Bekreft versjon 2',exact:true}).isDisabled(),true,'own single requires own unchecked consent');
  await navigate('Min personalhåndbok','personal');await page.locator('.ks-personal-routine>summary').click();await inspect('personal-version-history-'+width);
 }
 await render('reader');eq(await page.getByRole('button',{name:'Forvaltning',exact:true}).count(),0,'reader cannot see management phase');await navigate('Les og bekreft (1)','reading');await inspect('reader-reading');
 await page.getByRole('button',{name:'Verktøy og maler',exact:true}).click();eq(await page.getByRole('dialog').getByRole('button',{name:'Oppstart og tilgang',exact:true}).count(),0,'reader tools cannot reach access editor');await page.keyboard.press('Escape');
 eq(await page.evaluate(()=>window.qa.calls.filter(call=>/command|publish|acknowledge_batch|assign$/.test(call.name))),[],'all edits and reads isolated: no business command');eq(outbound,[],'no outgoing network');eq(errors,[],'no actual child runtime errors');
 console.log(`PASS KS governance03.6: ${checks} assertions / ${seen.length} visited states×widths; real Module and all handbook children; synthetic transport only.`);
 if(process.env.KS_GOVERNANCE_EVIDENCE)fs.writeFileSync(process.env.KS_GOVERNANCE_EVIDENCE,JSON.stringify({checks,visited:seen,transport:'synthetic only',ui_stubs:false,runtime_css:true},null,2)+'\n');
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
