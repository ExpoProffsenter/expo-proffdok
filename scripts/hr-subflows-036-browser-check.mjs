import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.cwd(),output=process.env.HR_SURFACE_036_SCREENSHOTS;
if(output)fs.mkdirSync(output,{recursive:true});
let checks=0,browser;const eq=(actual,expected,label)=>{assert.deepEqual(actual,expected,label);checks++;};
const built=await build({root,configFile:false,logLevel:'silent',plugins:[react(),{name:'hr-synthetic-registry',enforce:'pre',resolveId(id){if(id.endsWith('/appSupabaseClientRegistry.js'))return '\0hr-client';if(id.endsWith('/cordelAccess.js'))return '\0cordel';},load(id){if(id==='\0hr-client')return 'export const getAppSupabaseClient=()=>window.qa?.client;';if(id==='\0cordel')return 'export const useCordelAccess=()=>false;';}}],resolve:{alias:{react:path.join(root,'node_modules/react'),'react-dom':path.join(root,'node_modules/react-dom')}},define:{'process.env.NODE_ENV':'"production"','import.meta.env.VITE_EXPO_BACKEND_TARGET':'"sandbox"'},build:{write:false,minify:false,target:'esnext',lib:{entry:path.join(root,'scripts/fixtures/hr-workspace-036-harness.jsx'),formats:['es'],name:'HrWorkspace036',cssFileName:'hr036'}}});
const items=(Array.isArray(built)?built[0]:built).output,entry=items.find(item=>item.type==='chunk'&&item.isEntry).fileName,chunks=new Map(items.filter(item=>item.type==='chunk').map(item=>[item.fileName,item.code])),css=items.filter(item=>item.fileName.endsWith('.css')).map(item=>item.source).join('\n');
const server=http.createServer((req,res)=>{const name=new URL(req.url,'http://127.0.0.1').pathname.slice(1);if(chunks.has(name)){res.setHeader('Content-Type','text/javascript; charset=utf-8');res.end(chunks.get(name));return;}res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style><div id="app"></div><script type="module" src="/'+entry+'"></script>');});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const seen=new Set();
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1363,height:936}}),errors=[],outbound=[];page.setDefaultTimeout(10000);
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>{if(new URL(route.request().url()).hostname==='127.0.0.1')return route.continue();outbound.push(route.request().url());return route.abort('blockedbyclient');});
 await page.goto('http://127.0.0.1:'+server.address().port+'/?surfaces');
 await page.locator('.hr-employee').first().waitFor();
 const employee=()=>page.getByRole('dialog',{name:'Emma Berg',exact:true});
 const openEmployee=async()=>{await page.locator('.hr-employee').first().click();await employee().waitFor();await employee().locator('.hr-sick-case .hrp-saved[open]').waitFor();};
 const capture=async name=>{seen.add(name);if(output)await page.screenshot({path:path.join(output,name+'.png')});};
 const fits=async(locator,label)=>{
  const geometry=await locator.evaluate(el=>{const r=el.getBoundingClientRect();return {fits:r.left>=-1&&r.right<=innerWidth+1&&el.scrollWidth<=el.clientWidth+1,width:el.clientWidth,scroll:el.scrollWidth,bad:[...el.querySelectorAll('*')].filter(n=>n.checkVisibility()&&n.getBoundingClientRect().right>r.right+1).slice(0,8).map(n=>({tag:n.tagName,cls:n.className,text:n.textContent.slice(0,60),right:n.getBoundingClientRect().right,width:n.getBoundingClientRect().width}))};});
  if(!geometry.fits&&output){await page.screenshot({path:path.join(output,'failure.png')});console.error(await locator.evaluate(el=>[...el.querySelectorAll('*')].filter(n=>n.checkVisibility()&&n.scrollWidth>n.clientWidth+1).slice(-10).map(n=>({tag:n.tagName,cls:n.className,text:n.textContent.slice(0,70),client:n.clientWidth,scroll:n.scrollWidth,style:getComputedStyle(n).cssText}))));}
  eq(geometry.fits,true,label+': no horizontal overflow '+JSON.stringify(geometry));
  eq(await locator.evaluate(el=>[...el.querySelectorAll('button,summary,input:not([type=checkbox]):not([type=radio]),select,textarea')].filter(n=>n.getClientRects().length&&n.checkVisibility()&&parseFloat(getComputedStyle(n).fontSize)<16).map(n=>({tag:n.tagName,label:n.textContent.trim().slice(0,80),size:getComputedStyle(n).fontSize}))),[],label+': readable 16px controls, including native disclosure rows');
  eq(await locator.evaluate(el=>[...el.querySelectorAll('button,summary')].filter(n=>n.checkVisibility()&&n.getBoundingClientRect().height<43.99).map(n=>({tag:n.tagName,label:n.textContent.trim().slice(0,80),height:n.getBoundingClientRect().height}))),[],label+': visible actions retain 44px targets');
  eq(await locator.evaluate(el=>[...el.querySelectorAll('.hr-field>span,.hrp-field>span')].filter(n=>n.checkVisibility()&&parseFloat(getComputedStyle(n).fontSize)<16).map(n=>n.textContent)),[],label+': field labels retain 16px on phones');
 };
 await openEmployee();
 // This is deliberately the first design assertion: the real old stylesheet
 // must fail for the exact discrepancy in the user's screenshot.
 const groupStyles=await employee().locator('.hr-detail > :is(.hr-private-contact,.hrp,.hr-access-036)').evaluateAll(nodes=>nodes.map(el=>{const s=getComputedStyle(el);return {background:s.backgroundColor,border:s.borderTopWidth,radius:s.borderRadius,padding:s.paddingLeft};}));
 eq(groupStyles.length,4,'all four actual employee subfunctions participate');
 eq(groupStyles.every(s=>s.background==='rgb(255, 255, 255)'&&s.border==='1px'&&s.radius==='8px'&&s.padding==='16px'),true,'contact, conversation, sick leave and leader/access use the same 03.6 frame: '+JSON.stringify(groupStyles));
 for(const [width,height]of[[1363,936],[1920,1080],[768,936],[390,700],[320,480]]){
  await page.setViewportSize({width,height});
  const panel=employee();await fits(panel,'employee '+width);
  eq(await panel.evaluate(el=>{const r=el.getBoundingClientRect(),head=el.querySelector('.deviation-dialog-header').getBoundingClientRect();return Math.abs(r.right-innerWidth)<2&&r.top===0&&Math.abs(r.height-innerHeight)<2&&head.top===0&&getComputedStyle(el).borderRadius==='0px';}),true,'full-height flush native employee panel '+width);
  const contact=panel.locator('.hr-private-contact');await contact.locator('summary').click();await contact.getByRole('textbox',{name:'Adresse',exact:true}).waitFor();
  eq(await contact.getByRole('textbox',{name:'Adresse',exact:true}).inputValue(),'QA-veien 1','actual contact read '+width);
  eq(await contact.getByRole('textbox',{name:'Adresse',exact:true}).getAttribute('readonly'),'','admin does not impersonate employee '+width);
  await fits(contact,'contact '+width);await capture('contact-'+width);await contact.locator('summary').click();
  const access=panel.locator('.hr-access-036');await access.locator(':scope>summary').click();
  await fits(access,'leader/access '+width);
  eq(await access.locator(':scope>summary').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(245, 249, 250)','same neutral disclosure header '+width);
  await access.getByLabel('Ekstra leser',{exact:true}).selectOption('new');await access.getByLabel('Begrunnelse for ekstra lesetilgang',{exact:true}).fill('Usendt QA begrunnelse');
  const reason=await access.getByLabel('Begrunnelse for ekstra lesetilgang',{exact:true}).elementHandle();
  await access.locator(':scope>summary').click();await access.locator(':scope>summary').click();
  eq(await access.getByLabel('Begrunnelse for ekstra lesetilgang',{exact:true}).evaluate((n,original)=>n===original,reason),true,'access collapse keeps actual input '+width);
  eq(await access.getByLabel('Begrunnelse for ekstra lesetilgang',{exact:true}).inputValue(),'Usendt QA begrunnelse','access collapse keeps unsent reason '+width);
  await capture('access-'+width);await access.locator('.hr-ending>summary').click();
  eq(await access.getByRole('button',{name:'Avslutt og slett HR-registeroppføring',exact:true}).isDisabled(),true,'destructive native confirmation remains required '+width);await fits(access,'ending '+width);await capture('ending-'+width);await access.locator('.hr-ending>summary').click();await access.locator(':scope>summary').click();
  for(const [selector,navigation,prefix,steps]of[
   ['.hr-real-conversation:not(.hr-sick-case)','Steg i medarbeidersamtalen','conversation',['Forberedelse','Felles møte','Tiltak','Referat']],
   ['.hr-sick-case','Steg i sykefraværsoppfølgingen','sick',['Forberedelse','Felles plan','Tiltak','Gjennomgang','Frister','Deling og avslutning']]
  ]){
   const block=panel.locator(selector);await block.locator('.hrp-saved>button').first().click();await block.getByRole('navigation',{name:navigation,exact:true}).waitFor();
   const start=block.locator('.hrp-saved').filter({has:page.locator('form')}).first();
   await start.locator('summary').click();await fits(start,prefix+' new '+width);await capture(prefix+'-new-'+width);await start.locator('summary').click();
   if(prefix==='conversation'){
    const schedule=block.locator('.hrp-saved').filter({hasText:'Endre tidspunkt og sted'});await schedule.locator('summary').click();await fits(schedule,'schedule '+width);await capture('schedule-'+width);await schedule.locator('summary').click();
    const calendar=block.locator('.hrp-calendar');await calendar.locator('summary').click();await fits(calendar,'calendar help '+width);await capture('calendar-'+width);await calendar.locator('summary').click();
   }
   for(let index=0;index<steps.length;index++){
    await block.getByRole('navigation',{name:navigation,exact:true}).getByRole('button').nth(index).click();
    await block.locator('.hrp-step-body>h4').filter({hasText:steps[index]}).waitFor();
    await fits(block,prefix+' '+steps[index]+' '+width);
    eq(await block.getByRole('navigation',{name:navigation,exact:true}).getByRole('button').nth(index).getAttribute('aria-current'),'step','actual selected '+prefix+' step '+index);
    await capture(prefix+'-'+index+'-'+width);
   }
   if(width===1363){
    await block.getByRole('navigation',{name:navigation,exact:true}).getByRole('button').nth(3).click();
    await block.getByLabel('Åpne historisk utgave',{exact:true}).fill('1');await block.getByRole('button',{name:'Åpne utgave',exact:true}).click();await block.getByText('Historisk utgave. Denne kan bare leses.',{exact:false}).waitFor();await fits(block,prefix+' historical');await capture(prefix+'-historical');
    await block.getByRole('button',{name:'Åpne gjeldende utgave',exact:true}).click();await block.locator('.hrp-readonly').filter({hasText:'Historisk utgave'}).waitFor({state:'hidden'});
   }
  }
  const convo=panel.locator('.hr-real-conversation:not(.hr-sick-case)');
  await convo.getByRole('navigation').getByRole('button').nth(1).click();const note=convo.getByRole('textbox',{name:'Hva er avtalt?',exact:true});await note.fill('Usendt møtenotat '+width);
  await convo.getByRole('navigation').getByRole('button').nth(2).click();await convo.getByRole('navigation').getByRole('button').nth(1).click();eq(await note.inputValue(),'Usendt møtenotat '+width,'same conversation draft after step switch '+width);
 }
 await page.setViewportSize({width:1363,height:936});
 const note=employee().locator('.hr-real-conversation:not(.hr-sick-case)').getByRole('textbox',{name:'Hva er avtalt?',exact:true});
 await page.evaluate(()=>{window.dispatchEvent(new Event('focus'));document.dispatchEvent(new Event('visibilitychange'));});
 await page.waitForFunction(()=>document.querySelector('.hr-real-conversation textarea')&&!document.querySelector('.hr-real-conversation textarea').disabled);
 eq(await note.inputValue(),'Usendt møtenotat 320','actual note survives focus and visibility refresh');
 await page.keyboard.press('Escape');await employee().waitFor({state:'hidden'});
 // Enumerate the real support routes, then exercise their inner states. This
 // prevents the landing page's successful geometry from attesting these forms.
 const tools=async()=>{await page.getByRole('navigation',{name:'Arbeid med HR'}).getByRole('button',{name:'Alle HR-funksjoner',exact:true}).click();await page.getByRole('dialog',{name:'Alle HR-funksjoner',exact:true}).waitFor();};
 await tools();const toolsPanel=page.getByRole('dialog',{name:'Alle HR-funksjoner',exact:true});
 for(const width of[1363,390,320]){await page.setViewportSize({width,height:700});await fits(toolsPanel,'tools '+width);await capture('tools-'+width);}
 await toolsPanel.getByRole('button',{name:'Åpne timer og utlegg',exact:true}).click();const timePanel=page.getByRole('dialog',{name:'Timer og utlegg',exact:true});await timePanel.getByRole('button',{name:'Hent uker i perioden',exact:true}).waitFor();
 for(const width of[1363,390,320]){await page.setViewportSize({width,height:700});await fits(timePanel,'time entry '+width);await capture('time-entry-'+width);}
 await page.keyboard.press('Escape');await timePanel.waitFor({state:'hidden'});eq(await toolsPanel.isVisible(),true,'nested time closes without discarding containing HR tools');await page.keyboard.press('Escape');await toolsPanel.waitFor({state:'hidden'});
 for(const [button,title,field]of[
  ['Åpne oppsett','Oppsett og kontrollfrist','Formål med registeret'],
  ['Åpne sykefravær','Sykefravær','Eksempel på startdato'],
  ['Se slettekvitteringer','Slettekvitteringer',null],
  ['Åpne samtalemaler','Samtalemaler',null]
 ]){
  await tools();await page.getByRole('button',{name:button,exact:true}).click();const panel=page.getByRole('dialog',{name:title,exact:true});await panel.waitFor();if(field)await panel.getByLabel(field,{exact:true}).waitFor();
  for(const width of[1363,390,320]){await page.setViewportSize({width,height:700});await fits(panel,title+' '+width);await capture('support-'+title+'-'+width);}
  await page.setViewportSize({width:1363,height:936});
  if(title==='Samtalemaler'){
   await panel.locator('.hr-template-catalog button').first().click();await panel.getByRole('button',{name:'Rediger mal',exact:true}).waitFor();
   await panel.getByRole('button',{name:'Rediger mal',exact:true}).click();
   for(const width of[1363,390,320]){await page.setViewportSize({width,height:700});await fits(panel,'saved template editor '+width);const nav=await panel.locator('.hr-template-question-grid nav').evaluate(n=>({list:n.querySelector('ol').getBoundingClientRect().width,width:n.clientWidth,display:getComputedStyle(n).display,padding:getComputedStyle(n).padding}));eq(Math.abs(nav.list-nav.width)<2,true,'question list uses full native navigation width '+width+': '+JSON.stringify(nav));await panel.getByLabel('Tema',{exact:true}).scrollIntoViewIfNeeded();await capture('template-edit-'+width);}
   await panel.getByRole('button',{name:'Forhåndsvis mal',exact:true}).click();for(const width of[1363,390,320]){await page.setViewportSize({width,height:700});await fits(panel,'template preview '+width);await capture('template-preview-'+width);}
   await panel.locator('.hr-template-history>summary').click();await panel.getByRole('button',{name:'Hent malhistorikk',exact:true}).click();await panel.getByRole('button',{name:'Se utgave 1',exact:true}).waitFor();for(const width of[1363,390,320]){await page.setViewportSize({width,height:700});await fits(panel,'template history '+width);await panel.locator('.hr-template-history').scrollIntoViewIfNeeded();await capture('template-history-'+width);}
   await panel.getByRole('button',{name:'Se utgave 1',exact:true}).click();await panel.getByText(/Viser utgave 1/).waitFor();await capture('template-old-version');
  }
  await page.keyboard.press('Escape');await panel.waitFor({state:'hidden'});
 }
 for(const [button,title]of[['Legg til medarbeider','Legg til medarbeider'],['Se frister og tiltak','Frister og avtalte tiltak'],['Slik bruker du HR','Slik bruker du HR']]){
  await page.getByRole('button',{name:button,exact:true}).click();const panel=page.getByRole('dialog',{name:title,exact:true});await panel.waitFor();for(const width of[1363,390,320]){await page.setViewportSize({width,height:700});await fits(panel,title+' '+width);await capture('direct-'+title+'-'+width);}await page.keyboard.press('Escape');await panel.waitFor({state:'hidden'});
 }
 await tools();await page.getByRole('button',{name:'Åpne prøvesamtale',exact:true}).click();const practice=page.getByRole('dialog',{name:'Prøv medarbeidersamtale',exact:true});await practice.getByRole('button',{name:'Prøv medarbeidersamtale',exact:true}).click();
 for(const width of[1363,320]){await page.setViewportSize({width,height:700});for(let i=0;i<4;i++){await practice.getByRole('navigation',{name:'Steg i prøvesamtalen'}).getByRole('button').nth(i).click();await fits(practice,'practice '+i+' '+width);await capture('practice-'+i+'-'+width);}}
 await page.keyboard.press('Escape');await practice.waitFor({state:'hidden'});
 await page.evaluate(()=>window.qa.show('personal'));await page.locator('.hr-employee').first().waitFor();await openEmployee();
 eq(await employee().locator('.hr-employee-dialog-036').count(),1,'Min side uses the same employee panel frame');
 eq(await employee().locator('.hr-detail>.hr-access-036').count(),1,'Min side also groups its read-only leader/access information in the shared frame');
 eq(await employee().locator('.hr-detail>.hr-access-036').evaluate(el=>{const s=getComputedStyle(el);return s.backgroundColor==='rgb(255, 255, 255)'&&s.borderRadius==='8px'&&s.borderTopWidth==='1px';}),true,'personal leader/access shares the sibling section style');
 await employee().locator('.hr-private-contact>summary').click();eq(await employee().getByRole('textbox',{name:'Adresse',exact:true}).getAttribute('readonly'),null,'self retains native editable contact form');await fits(employee(),'personal employee');await capture('personal-contact');
 await page.keyboard.press('Escape');await employee().waitFor({state:'hidden'});
 eq(await page.evaluate(()=>window.qa.commands.length),0,'entire reading/design sweep has no HR business writes');
 eq(await page.evaluate(()=>window.qa.unexpected),[],'every native request is explicitly handled');eq(outbound,[],'no live transport');eq(errors,[],'no runtime error');
 eq([...seen].filter(x=>/^sick-\d-/.test(x)).length,30,'all six sick-leave steps inspected at five viewports');
 eq([...seen].filter(x=>/^conversation-\d-/.test(x)).length,20,'all four conversation steps inspected at five viewports');
 if(process.env.HR_SURFACE_036_EVIDENCE)fs.writeFileSync(process.env.HR_SURFACE_036_EVIDENCE,JSON.stringify({checks,view_count:seen.size,visited:[...seen].sort(),transport:'synthetic reads only',runtime_css:true},null,2)+'\n');
 console.log(`PASS HR subflows 03.6: ${checks} assertions, ${seen.size} explicitly visited views; actual contact/access/conversation/sick-leave/template/history/setup/practice/personal, full runtime CSS, synthetic reads only.`);
}finally{await browser?.close();await new Promise(r=>server.close(r));}
