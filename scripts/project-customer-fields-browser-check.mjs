import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const dir=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'project-customer-'));
const main=fs.readFileSync('src/main.jsx','utf8');
const source=(from,to)=>main.slice(main.indexOf('  function '+from+'('),main.indexOf('  function '+to+'('));
let browser,checks=0;const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
fs.writeFileSync(path.join(temp,'entry.jsx'),`
import React,{useState} from '${dir}/node_modules/react/index.js';
import {createRoot} from '${dir}/node_modules/react-dom/client.js';
import * as jsxRuntime from '${dir}/node_modules/react/jsx-runtime.js';
import Fields from '${dir}/src/modules/project/ProjectInformationFields.jsx';
import {WORK_PROFILE_EVENT} from '${dir}/src/modules/access/workProfileClient.js';
import '${dir}/src/style.css';import '${dir}/src/modules/project/projectWorkspace.css';
import {APP_RUNTIME_STYLES} from '${dir}/src/modules/app/appRuntimeStyles.js';
document.head.insertAdjacentHTML('beforeend','<style>'+APP_RUNTIME_STYLES+'</style>');
const inputSource=new Function('import_jsx_runtime','stopInteractivePropagation',${JSON.stringify(source('Input','Textarea')+';return Input;')});
const textareaSource=new Function('import_jsx_runtime','stopInteractivePropagation',${JSON.stringify(source('Textarea','Select')+';return Textarea;')});
const stop=e=>e.stopPropagation(),Input=inputSource(jsxRuntime,stop),Textarea=textareaSource(jsxRuntime,stop);
window.company='company-a';window.calls=[];window.holdSearch=false;window.readOnly=false;
const customer={id:'customer-a',revision:2,customer:{customer:'QA lagret kunde',email:'saved@example.invalid',phone:'90000000',address:'Lagret testadresse 2',postnr:'0001',city:'Oslo'}};
window.rpc=async(name,args)=>{
 window.calls.push({name,args});
 if(name==='search_company_customers'){
  if(window.holdSearch&&args.p_query){const company=window.company;await new Promise(resolve=>window.finishSearch=resolve);return {company_id:company,customers:[customer]};}
  return {company_id:window.company,customers:window.company==='company-a'?[customer]:[]};
 }
 if(name==='save_company_customer')return {...customer,revision:3,customer:args.p_customer};
 throw Error('Unexpected transport '+name);
};
function App(){const [project,setProject]=useState({projectName:'QA – samlet kundeboks',responsible:'QA prosjektleder',date:'2026-10-17',address:'Testveien 17',postnr:'',city:'',customer:'QA Kunde – ikke reell',customerEmail:'qa@example.invalid',customerPhone:'',notes:''}),[readOnly,setReadOnly]=useState(false);window.currentProject=project;window.makeReadOnly=()=>setReadOnly(true);window.switchCompany=()=>window.dispatchEvent(new CustomEvent(WORK_PROFILE_EVENT));return <main style={{maxWidth:1180,margin:'20px auto',padding:12}}><section className="project-info-editor"><h2>Rediger kunde- og prosjektinfo</h2><details className="collapsibleBlock" open><summary>Kunde- og prosjektdata</summary><div className="collapsibleBlockBody"><div className="grid"><Fields project={project} setProject={setProject} Input={Input} Textarea={Textarea} readOnly={readOnly}/></div></div></details></section></main>;}
createRoot(document.getElementById('app')).render(<App/>);
`);
const result=await build({root:dir,configFile:false,logLevel:'silent',resolve:{alias:{'react/jsx-runtime':path.join(dir,'node_modules/react/jsx-runtime.js')}},plugins:[react(),{name:'customer-qa-transport',enforce:'pre',resolveId(id){if(id.endsWith('/moduleAccessClient.js'))return '\0rpc';},load(id){if(id==='\0rpc')return 'export const rpcWithStoredSession=(...args)=>window.rpc(...args);';}}],build:{write:false,minify:false,cssCodeSplit:false,rollupOptions:{input:path.join(temp,'entry.jsx'),output:{inlineDynamicImports:true}}}});
const js=result.output.find(x=>x.type==='chunk').code,css=result.output.filter(x=>x.fileName.endsWith('.css')).map(x=>x.source).join('\n');
const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html;charset=utf-8');res.end('<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style><div id="app"></div><script type="module">'+js.replaceAll('</script','<\\/script')+'</script>');});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1363,height:1050},locale:'nb-NO',timezoneId:'Europe/Oslo'}),errors=[];page.setDefaultTimeout(5000);page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:'+server.address().port);
 const customerGroup=page.getByRole('group',{name:'Kunde',exact:true}),projectGroup=page.getByRole('group',{name:'Prosjektopplysninger',exact:true}),register=page.locator('.project-customer-register');
 await customerGroup.waitFor();eq(await customerGroup.getByLabel('Kunde',{exact:true}).inputValue(),'QA Kunde – ikke reell','contact remains in one customer box');
 for(const label of ['Kunde','Kunde e-post','Kunde telefon'])eq(await customerGroup.getByLabel(label,{exact:true}).count(),1,'single contact field '+label);
 eq(await projectGroup.getByLabel('Adresse',{exact:true}).inputValue(),'Testveien 17','project address remains separate');
 eq(await register.getAttribute('open'),null,'register initially collapsed');eq(await register.getByRole('combobox').isVisible(),false,'register does not push contacts apart');
 for(const [width,columns] of [[1363,3],[768,2],[390,1],[320,1]]){
  await page.setViewportSize({width,height:1050});eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'no horizontal scroll '+width);
  eq(await projectGroup.locator('.project-info-inputs').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length),columns,'responsive field columns '+width);
  eq(await customerGroup.getByLabel('Kunde e-post',{exact:true}).isVisible(),true,'contact visible '+width);
 }
 await page.setViewportSize({width:1363,height:1050});
 eq((await page.getByLabel('Notater',{exact:true}).boundingBox()).height<=90,true,'notes do not create an oversized blank cell');
 if(process.env.PROJECT_CUSTOMER_QA_SCREENSHOT)await page.screenshot({path:process.env.PROJECT_CUSTOMER_QA_SCREENSHOT,fullPage:true});
 await customerGroup.getByLabel('Kunde telefon',{exact:true}).fill('12345678');await page.getByLabel('Notater',{exact:true}).fill('Bevart QA-notat');eq(await page.evaluate(()=>window.calls.filter(c=>c.name==='save_company_customer').length),0,'manual fields never auto-save to customer register');
 await register.getByText('Kunderegister – hent eller lagre kunde',{exact:true}).click();
 eq(await register.getByRole('checkbox',{name:'Lagre i firmaets kunderegister',exact:true}).isChecked(),false,'register saving remains opt-in');
 await register.getByRole('combobox').selectOption('customer-a');
 eq(await customerGroup.getByLabel('Kunde e-post',{exact:true}).inputValue(),'saved@example.invalid','existing customer selection updates contact');eq(await projectGroup.getByLabel('Adresse',{exact:true}).inputValue(),'Lagret testadresse 2','original selection still populates project address');
 eq(await page.locator('.project-info-notes textarea').inputValue(),'Bevart QA-notat','selection preserves other project content');
 eq(await page.evaluate(()=>window.calls.filter(c=>c.name==='save_company_customer').length),0,'selecting does not save a customer');
 await register.getByRole('checkbox',{name:'Lagre i firmaets kunderegister',exact:true}).check();await register.getByRole('button',{name:'Oppdater lagret kunde',exact:true}).click();await register.getByRole('status').getByText('Kunden er lagret i firmaets kunderegister.',{exact:true}).waitFor();
 const save=await page.evaluate(()=>window.calls.find(c=>c.name==='save_company_customer').args);eq(save.p_expected_company_id,'company-a','existing company scope reaches register save');eq(save.p_expected_revision,2,'existing concurrency revision retained');eq(save.p_customer.email,'saved@example.invalid','current contact reaches original explicit save');
 await register.getByText('Kunderegister – hent eller lagre kunde',{exact:true}).click();await customerGroup.getByRole('textbox',{name:'Kunde',exact:true}).fill('Ny manuell QA-kunde');await register.getByText('Kunderegister – hent eller lagre kunde',{exact:true}).click();eq(await customerGroup.getByRole('textbox',{name:'Kunde',exact:true}).inputValue(),'Ny manuell QA-kunde','collapse/reopen never resets contact');
 await register.getByLabel('Søk lagret kunde',{exact:true}).fill('old search');await page.evaluate(()=>window.holdSearch=true);await register.getByRole('button',{name:'Søk kunder',exact:true}).click();await page.evaluate(()=>{window.company='company-b';window.switchCompany();});await page.waitForFunction(()=>!document.querySelector('.project-customer-register select').disabled);await page.evaluate(()=>{window.holdSearch=false;window.finishSearch();});
 eq(await register.getByRole('combobox').locator('option[value=customer-a]').count(),0,'late old-company search cannot populate new company');eq(await register.getByRole('checkbox',{name:'Lagre i firmaets kunderegister',exact:true}).isChecked(),false,'company change resets save opt-in');
 await page.evaluate(()=>window.makeReadOnly());eq(await page.locator('.project-customer-register').count(),0,'support read-only hides register actions');eq(await customerGroup.getByLabel('Kunde',{exact:true}).isEnabled(),false,'customer field disabled for support');eq(await projectGroup.getByLabel('Adresse',{exact:true}).isEnabled(),false,'address disabled for support');eq(errors,[],'no React/DOM exceptions');
 console.log('Project customer fields browser: '+checks+' assertions PASS — one contact box, responsive spacing, native fields, original search/select/save, company/revision/opt-in, late response and read-only');
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));fs.rmSync(temp,{recursive:true,force:true});}
