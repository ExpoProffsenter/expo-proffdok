import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.cwd(),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'report-choice-036-'));
let browser,checks=0;const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
fs.writeFileSync(path.join(tmp,'entry.jsx'),`import React,{useState,useLayoutEffect} from '${root}/node_modules/react/index.js';import {createRoot} from '${root}/node_modules/react-dom/client.js';
import {useKshmsProjectReport,KshmsProjectReportChoice,KshmsProjectReportDialog} from '${root}/src/modules/kshms/KshmsProjectReport.jsx';
import '${root}/src/style.css';import '${root}/src/modules/ui/proffdokWorkspace.css';
import {APP_RUNTIME_STYLES} from '${root}/src/modules/app/appRuntimeStyles.js';const style=document.createElement('style');style.textContent=APP_RUNTIME_STYLES;document.head.appendChild(style);
window.calls=[];window.fail=false;window.hold=false;window.company='company-a';window.enabled=true;
const keys=['sjas','ruhs','rounds','risks'];
const rows=key=>Array.from({length:6},(_,i)=>({id:key+i,title:'QA '+key+' – dokument '+i+' med lang tittel og status',status:key==='ruhs'?'open':'draft'}));
window.rpc=async(name,args)=>{window.calls.push({name,args:structuredClone(args)});if(window.hold)await new Promise(resolve=>window.release=resolve);if(window.fail)throw Error('QA lesefeil');const part=name==='kshms_project_report'?keys.slice(0,2):keys.slice(2);return {context:{user_id:'reader',company_id:args.p_company_id,project_id:args.p_project_id,enabled:true},choices:Object.fromEntries(part.map(k=>[k,rows(k)]))};};
function App(){const [company,setCompany]=useState('company-a'),[enabled,setEnabled]=useState(true),[draft,setDraft]=useState('Usendt prosjektkladd');window.scope=(c,e)=>{setCompany(c);setEnabled(e);};useLayoutEffect(()=>{window.committed=company+enabled;},[company,enabled]);const report=useKshmsProjectReport({userId:'reader',context:{company_id:company,user_id:'reader',enabled,manage:false},projectId:'project-a'});window.report=report;return <><label>Usendt kladd<input value={draft} onChange={e=>setDraft(e.target.value)}/></label><KshmsProjectReportChoice report={report}/><KshmsProjectReportDialog chooser={report.chooser}/></>;}
createRoot(document.getElementById('app')).render(<App/>);`);
const result=await build({root,resolve:{alias:{'react/jsx-runtime':root+'/node_modules/react/jsx-runtime.js'}},configFile:false,logLevel:'silent',plugins:[react(),{name:'report-fixture-transport',enforce:'pre',resolveId(id){if(id.endsWith('/kshmsAccess.js'))return '\0report-rpc';},load(id){if(id==='\0report-rpc')return 'export const kshmsRpc=(...args)=>window.rpc(...args);';}}],build:{write:false,minify:false,cssCodeSplit:false,rollupOptions:{input:path.join(tmp,'entry.jsx'),output:{inlineDynamicImports:true}}}});
const js=result.output.find(x=>x.type==='chunk').code,css=result.output.filter(x=>x.fileName.endsWith('.css')).map(x=>x.source).join('\n');
const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html;charset=utf-8');res.end(`<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><div data-expo-app-shell="true" data-expo-project-shell="1"><main><section><div id="app"></div></section></main></div><script type="module">${js.replaceAll('</script','<\\/script')}</script>`);});await new Promise(r=>server.listen(0,'127.0.0.1',r));
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:1363,height:936}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
 await page.goto('http://127.0.0.1:'+server.address().port);const open=()=>page.getByRole('button',{name:'Velg KS/HMS til rapport',exact:true}).click();await open();await page.locator('.ks-report-option').first().waitFor();
 const dialog=page.getByRole('dialog'),draft=await page.getByLabel('Usendt kladd').elementHandle();await page.locator('.ks-report-option input').first().check();
 for(const width of [320,390,768,1363,1920]){
  await page.setViewportSize({width,height:936});const box=await dialog.boundingBox();
  eq(await dialog.evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(255, 255, 255)','report picker opaque on real nested app CSS '+width);
  eq(box.y===0&&Math.abs(box.x+box.width-width)<1,true,'report panel top and right '+width);eq(box.height,936,'full viewport report '+width);
  eq(await page.locator('.ks-report-dialog-head').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(16, 33, 43)','shared navy report header '+width);
  eq(await page.locator('#ks-report-title').evaluate(e=>parseFloat(getComputedStyle(e).fontSize)),width<=620?25:28,'readable report title '+width);
  eq(await dialog.evaluate(e=>e.scrollWidth<=e.clientWidth+1),true,'no report horizontal overflow '+width);
  eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'no page overflow '+width);
  eq(await page.locator('.ks-report-option input').first().isChecked(),true,'same selection after resize '+width);
  eq(await page.locator('.ks-report-dialog-body').evaluate(e=>getComputedStyle(e).overflowY),'auto','independent report body '+width);
  const footer=await page.locator('.ks-report-dialog-footer').boundingBox();eq(footer.y+footer.height<=936.01,true,'report footer always visible '+width);
  eq(await dialog.evaluate(e=>[...e.querySelectorAll('button')].filter(n=>n.getBoundingClientRect().height<43.99).map(n=>({text:n.textContent,height:n.getBoundingClientRect().height}))),[],'44px report actions '+width);
  await page.locator('.ks-report-dialog-body').evaluate(e=>e.scrollTo(0,e.scrollHeight));
  eq((await page.locator('.ks-report-dialog-head').boundingBox()).y,0,'scroll never hides report header '+width);
  if(process.env.PROJECT_UX_SCREENSHOTS){fs.mkdirSync(process.env.PROJECT_UX_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.PROJECT_UX_SCREENSHOTS,'report-choice-'+width+'.png')});}
 }
 await page.setViewportSize({width:320,height:320});const footer=await page.locator('.ks-report-dialog-footer').boundingBox();eq(footer.y+footer.height<=320.01,true,'actions stay visible on short screen');eq((await page.locator('.ks-report-dialog-body').boundingBox()).height>0,true,'short screen still has scroll body');
 await dialog.press('Escape');await dialog.waitFor({state:'hidden'});eq(await page.getByRole('button',{name:'Velg KS/HMS til rapport',exact:true}).evaluate(e=>document.activeElement===e),true,'native owner returns focus');
 eq(await draft.evaluate(e=>e.isConnected),true,'project field not remounted');eq(await page.getByLabel('Usendt kladd').inputValue(),'Usendt prosjektkladd','project draft unchanged');
 await page.setViewportSize({width:1363,height:936});await page.evaluate(()=>window.fail=true);await open();await page.getByRole('alert').waitFor();eq(await page.getByRole('button',{name:'Bruk valget i rapporten',exact:true}).isDisabled(),true,'read error cannot confirm');await page.evaluate(()=>window.fail=false);await page.getByRole('button',{name:'Oppdater listen',exact:true}).click();await page.locator('.ks-report-option').first().waitFor();eq(await page.locator('.ks-report-option input:checked').count(),0,'retry retains native cleared selection');
 const last=page.getByRole('button',{name:'Avbryt',exact:true}),first=page.getByRole('button',{name:'Lukk rapportvalg',exact:true});await last.focus();await last.press('Tab');eq(await first.evaluate(e=>document.activeElement===e),true,'forward focus stays in report');await first.press('Shift+Tab');eq(await last.evaluate(e=>document.activeElement===e),true,'backward focus stays in report');await first.click();await dialog.waitFor({state:'hidden'});
 await open();await page.locator('.ks-report-option').first().waitFor();await page.evaluate(()=>window.scope('company-b',true));await page.waitForFunction(()=>window.committed==='company-btrue');await dialog.waitFor({state:'hidden'});eq(await dialog.count(),0,'firm switch removes old chooser');await open();await page.locator('.ks-report-option').first().waitFor();await page.evaluate(()=>window.scope('company-b',false));await page.waitForFunction(()=>window.committed==='company-bfalse');await dialog.waitFor({state:'hidden'});eq(await page.getByRole('button',{name:'Velg KS/HMS til rapport',exact:true}).count(),0,'revoked context removes report entry');
 eq(await page.evaluate(()=>window.calls.every(c=>['kshms_project_report','kshms_project_execution_report'].includes(c.name)&&c.args.p_sja_ids==null&&c.args.p_round_ids==null)),true,'only native read lists; no export/write');eq(errors,[],'no React errors');console.log('Report choice workspace Chromium PASS: '+checks+' assertions; actual hook/dialog, app CSS, five widths, short screen, selection, draft, focus, errors/retry, scope and revoke. Synthetic read transport.');
}finally{await browser?.close();await new Promise(r=>server.close(r));fs.rmSync(tmp,{recursive:true,force:true});}
