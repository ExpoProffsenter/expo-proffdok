import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import {build} from 'vite';import react from '@vitejs/plugin-react';
const {JSDOM}=await import(process.env.KSHMS_JSDOM_PATH||'jsdom');
const cwd=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'warranty-setup-'));
const main=fs.readFileSync('src/main.jsx','utf8');
const native=(from,to)=>{const a=main.indexOf('  function '+from+'('),b=main.indexOf(to,a+1);assert(a>=0&&b>a);return main.slice(a,b);};
const primitives=native('Section','  const { renderProductSections }')+native('Input','  const { ProjectImagesPanel');
const adapter=main.match(/\(0, import_jsx_runtime\.jsx\)\(ProjectWarrantySetup, \{[^\n]+\}\)/)?.[0];assert(adapter,'actual main warranty adapter');
fs.writeFileSync(path.join(temp,'entry.jsx'),`import React,{act} from '${cwd}/node_modules/react/index.js';import {createRoot} from '${cwd}/node_modules/react-dom/client.js';import * as import_jsx_runtime from '${cwd}/node_modules/react/jsx-runtime.js';import {createWarrantyViewTools} from '${cwd}/src/modules/warranty/warrantyViewToolsCore.js';
const stopInteractivePropagation=e=>e.stopPropagation();
${primitives}
const root=createRoot(document.getElementById('app'));window.__act=act;window.qa={locked:false,support:false,readonly:false,templates:[],writes:[],warranty:{enabled:true,system:'qa',durationYears:15,issued:true,issuedAt:'2026-09-15'}};const soproWarrantySystems=[{id:'qa',label:'QA system',product:'QA',sintefApproval:'QA approval'}],project={customChecklistGroups:[]};const {ProjectWarrantySetup}=createWarrantyViewTools({Section,Grid,Input,Select,emptyWarranty:()=>({enabled:false}),getWarrantyYears:w=>w.durationYears||10,WARRANTY_YEAR_OPTIONS:[10,12,15],WARRANTY_YEARS:10,standardWetroomTemplateTradeOptions:['Rørlegger'],standardWetroomTemplateDefaultTrades:[],customChecklistTradeIconUrl:()=>''});
window.__render=()=>{const {locked:isProjectLocked,support:isProjectSupportReadOnly,readonly:isReadOnly,warranty}=window.qa;const setWarranty=next=>{window.qa.writes.push(next);window.qa.warranty=next;window.__render();};const createStandardWetroomTemplate=trades=>window.qa.templates.push(trades);root.render(${adapter});};`);
const built=await build({root:cwd,configFile:false,logLevel:'silent',plugins:[react()],define:{'process.env.NODE_ENV':'"development"'},build:{write:false,minify:false,lib:{entry:path.join(temp,'entry.jsx'),formats:['iife'],name:'WarrantySetupProof'}}});
const code=(Array.isArray(built)?built[0]:built).output.find(x=>x.type==='chunk').code;
const dom=new JSDOM('<div id="app"></div>',{url:'https://example.invalid',runScripts:'outside-only',pretendToBeVisual:true});let checks=0;const eq=(a,b,m)=>{assert.deepEqual(a,b,m);checks++;};
try{const w=dom.window;w.IS_REACT_ACT_ENVIRONMENT=true;w.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setImmediate(()=>this.port1.onmessage?.())};}};w.eval(code);const act=w.__act;
const render=async flags=>{Object.assign(w.qa,{locked:false,support:false,readonly:false},flags);await act(async()=>w.__render());};
const controls=()=>[...w.document.querySelectorAll('.warrantyProjectSetup input,.warrantyProjectSetup select,.warrantyProjectSetup button')];
const before=JSON.stringify(w.qa.warranty);
for(const flags of [{locked:true},{support:true},{readonly:true}]){
 await render(flags);eq(controls().length>=6,true,'actual warranty controls exist');eq(controls().every(x=>x.disabled),true,'all setup controls respect active read-only source '+JSON.stringify(flags));
 await act(async()=>{for(const e of controls().filter(x=>x.tagName==='BUTTON'||x.type==='radio'))e.click();});
 eq(JSON.stringify(w.qa.warranty),before,'read-only clicks preserve original warranty');eq(w.qa.templates.length,0,'read-only never creates trade checklist');
}
await render({});eq(controls().every(x=>!x.disabled||x.textContent==='Legg til sjekkpunkter for andre fag'),true,'unlocked setup keeps existing controls');
const trade=controls().find(x=>x.tagName==='BUTTON'&&x.textContent.includes('Rørlegger'));await act(async()=>trade.click());
const apply=controls().find(x=>x.textContent==='Legg til sjekkpunkter for andre fag');eq(apply.disabled,false,'unlocked trade selection enables original action');
await act(async()=>apply.click());eq(JSON.parse(JSON.stringify(w.qa.templates)),[['Rørlegger']],'existing selected trade reaches original callback');
await render({locked:true});eq(controls().every(x=>x.disabled),true,'later lock disables existing trade draft');await render({});eq(controls().find(x=>x.textContent==='Legg til sjekkpunkter for andre fag').disabled,false,'unlock preserves selected trade');
const year=[...w.document.querySelectorAll('select')][0];await act(async()=>{Object.getOwnPropertyDescriptor(w.HTMLSelectElement.prototype,'value').set.call(year,'12');year.dispatchEvent(new w.Event('change',{bubbles:true}));});eq(w.qa.warranty.durationYears,12,'unlocked existing duration handler remains editable');eq(w.qa.warranty.issuedAt,'2026-09-15','existing issuance metadata preserved');
eq(w.qa.writes.length,1,'lock and trade presentation cause no warranty write');
console.log('Project warranty setup actual React: '+checks+' assertions PASS; actual main adapter, locked/support/readonly controls, preserved trade draft and unlocked callback; synthetic state only.');
}finally{dom.window.close();fs.rmSync(temp,{recursive:true,force:true});}
