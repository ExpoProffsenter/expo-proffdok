import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { build } from 'vite';
import react from '@vitejs/plugin-react';

// Execute the actual legacy memo, handler, Select and company field from main.
// Only server transport and the surrounding application state are synthetic.
const source = fs.readFileSync(process.env.SYSTEMADMIN_COMPANY_SOURCE || 'src/main.jsx', 'utf8');
function between(start, end) {
  const a = source.indexOf(start), b = source.indexOf(end, a);
  assert(a >= 0 && b > a, `Missing production block: ${start}`);
  return source.slice(a, b);
}
const memo = between('const registeredCompanyOptions = ', 'const supportCompanies = ');
const handler = between('const updateAdminUserCompanyName = ', 'const setAdminUserSystemAdmin = ');
const select = between('function Select({', 'const { ProjectImagesPanel, LimitedProjectImagesPanel }');
const fieldStart = source.indexOf('(0, import_jsx_runtime.jsx)(Select, {\n                  label: "Firma",');
const fieldEnd = source.indexOf('\n                })', fieldStart);
assert(fieldStart > 0 && fieldEnd > fieldStart);
const field = source.slice(fieldStart, fieldEnd + '\n                })'.length);
const cwd = process.cwd(), temp = fs.mkdtempSync(path.join(os.tmpdir(), 'systemadmin-company-'));
const entry = path.join(temp, 'entry.jsx');
fs.writeFileSync(entry, `
import React, * as import_react from '${cwd}/node_modules/react/index.js';
import * as import_jsx_runtime from '${cwd}/node_modules/react/jsx-runtime.js';
import {createRoot} from '${cwd}/node_modules/react-dom/client.js';
const stopInteractivePropagation=e=>e.stopPropagation();
${select}
function Harness(){
 const [adminUsers,setAdminUsers]=React.useState(window.users);
 const [revision,setRevision]=React.useState(0);
 window.refresh=()=>{setAdminUsers([...window.users]);setRevision(n=>n+1);};
 const projectListRows=window.projects||[],profile=window.profile||{},company=window.company||{};
 const isAdminUser=window.isAdmin;
 const loadAdminUsers=async()=>{window.reads++;setAdminUsers([...window.users]);};
 const supabase={from:table=>({update:payload=>({eq:async(key,id)=>{
  window.writes.push({table,payload,key,id});
  if(window.fail)return {error:{message:'Synthetic failure'}};
  window.users=window.users.map(u=>u.id===id?{...u,...payload}:u);return {error:null};
 }})})};
 ${memo}
 ${handler}
 window.changeCompany=(u,v)=>updateAdminUserCompanyName(u,v);
 const u=adminUsers[0];
 return React.createElement('div',{'data-revision':revision},${field});
}
createRoot(document.getElementById('app')).render(React.createElement(Harness));
`);
const result = await build({ root: cwd, configFile: false, logLevel: 'silent', plugins: [react()], build: { write: false, minify: false, rollupOptions: { input: entry, output: { inlineDynamicImports: true } } } });
const js = result.output.find(x => x.type === 'chunk' && x.isEntry).code;
const server = http.createServer((req,res) => { res.setHeader('Content-Type','text/html; charset=utf-8'); res.end(`<div id="app"></div><script type="module">${js.replaceAll('</script','<\\/script')}</script>`); });
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
let browser, checks=0;
const eq=(a,b,n)=>{assert.deepEqual(a,b,n);checks++;};
try {
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 const page=await browser.newPage(),errors=[];
 page.on('pageerror',e=>{errors.push(e.message);console.error('Browser error:',e.message);});page.on('console',m=>{if(m.type()==='error')console.error(m.text());}); page.setDefaultTimeout(7000);
 await page.addInitScript(()=>{
  window.users=[{id:'target',email:'user@example.invalid',company_name:'Maximum bygg as ',company_role:'firmaadmin',approved:true,deactivated:false}, {id:'other',company_name:'Another AS'}];
  window.projects=[];window.writes=[];window.reads=0;window.isAdmin=true;window.fail=false;
  window.dialogs=[];window.accept=true;window.alert=t=>window.dialogs.push({alert:t});window.confirm=t=>{window.dialogs.push({confirm:t});return window.accept;};
 });
 await page.goto('http://127.0.0.1:'+server.address().port);
 const company=page.locator('select');await company.waitFor();
 eq(await company.inputValue(),'Maximum bygg as','trailing space must display existing firm, not placeholder');
 eq(await page.evaluate(()=>window.writes.length),0,'render never writes to profile');
 // Case variants from other users/projects share one option and remain selected.
 await page.evaluate(()=>{window.users[0].company_name='  MAXIMUM BYGG AS  ';window.projects=[{row:{data:{company:{companyName:'Maximum bygg as'}}}}];window.refresh();});
 await page.waitForFunction(()=>document.querySelector('select').value==='Maximum bygg as');checks++;
 eq(await company.locator('option').allTextContents(),['Velg firma','Another AS','Maximum bygg as']);
 await page.evaluate(()=>window.changeCompany(window.users[0],'Maximum bygg as'));
 eq(await page.evaluate(()=>[window.writes.length,window.dialogs.length]),[0,0],'same normalized firm does not prompt or transfer');
 await page.evaluate(()=>window.accept=false);await company.selectOption('Another AS');
 eq(await page.evaluate(()=>window.writes.length),0,'cancel preserves user');
 eq(await page.evaluate(()=>window.users[0].company_name),'  MAXIMUM BYGG AS  ');
 await page.evaluate(()=>{window.accept=true;window.refresh();});await company.selectOption('Another AS');
 await page.waitForFunction(()=>window.reads===1);
 eq(await company.inputValue(),'Another AS','saved server value selected after reload');
 eq(await page.evaluate(()=>window.writes),[{table:'profiles',payload:{company_name:'Another AS'},key:'id',id:'target'}],'only selected user company is written');
 eq(await page.evaluate(()=>[window.users[0].company_role,window.users[0].approved,window.users[0].deactivated]),['firmaadmin',true,false],'role/status untouched');
 await page.evaluate(()=>{window.fail=true;});await company.selectOption('Maximum bygg as');
 eq(await page.evaluate(()=>window.reads),1,'failed update never reloads as success');
 eq(await page.evaluate(()=>window.users[0].company_name),'Another AS','failed save retains persisted firm');
 eq(await page.evaluate(()=>window.dialogs.at(-1).alert),'Kunne ikke endre firma: Synthetic failure');
 await page.evaluate(()=>window.changeCompany(window.users[0],'Unknown firm'));
 eq(await page.evaluate(()=>window.writes.length),2,'unknown company cannot be written');
 await page.evaluate(()=>{window.isAdmin=false;window.refresh();});await page.waitForFunction(()=>document.querySelector('[data-revision]').dataset.revision==='3');
 await page.evaluate(()=>window.changeCompany(window.users[0],'Maximum bygg as'));
 eq(await page.evaluate(()=>window.writes.length),2,'non-admin blocked before write');
 await page.evaluate(()=>{window.isAdmin=true;window.users[0].company_name='';window.refresh();});
 await page.waitForFunction(()=>document.querySelector('select').value==='');checks++;
 eq(await page.evaluate(()=>window.writes.length),2,'empty firm remains placeholder without mutation');
 eq(errors,[]);
 console.log(`systemadmin-company-selection: ${checks} Chromium assertions PASS; actual main memo/Select/field/handler, legacy whitespace/case, no-op, cancel, save/readback, failure and authorization; synthetic transport only.`);
} finally {await browser?.close();await new Promise(r=>server.close(r));fs.rmSync(temp,{recursive:true,force:true});}
