import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
const {JSDOM}=await import(process.env.KSHMS_JSDOM_PATH||'jsdom');
const root=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'product-categories-'));
let checks=0;const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
try {
 const entry=path.join(temp,'entry.jsx');
 fs.writeFileSync(entry,`import React,{act,useState} from '${root}/node_modules/react/index.js';import {createRoot} from '${root}/node_modules/react-dom/client.js';import {createProductViewTools} from '${root}/src/modules/product/productViewTools.js';
const Box=({children})=><div>{children}</div>,Input=({label,value,onChange,disabled})=><label>{label}<input value={value} disabled={disabled} onChange={e=>onChange(e.target.value)}/></label>;
const tools=createProductViewTools({Section:Box,Grid:Box,Input,Select:Box,hasValue:v=>v!=null&&String(v).trim()!=='',productSupportsColorChoice:()=>false,productReportDocumentOptions:[{key:'Fdv',field:'fdvUrl',label:'FDV'}],hasProductReportChoice:()=>true});
const sections=[{title:'Primer',items:['QA primer','QA alternativ']},{title:'Membran',items:['QA membran']},{title:'Tom kategori',items:['QA ubrukt']}];
function App(){const [open,setOpen]=useState({}),[locked,setLocked]=useState(false),[checked,setChecked]=useState({'QA primer':true}),[docs,setDocs]=useState({'QA primer':{comment:'Opprinnelig kommentar'}}),[manual,setManual]=useState([{id:'m',name:'QA annet produkt',fdvUrl:'https://example.invalid/manual.pdf',comment:'Bevart manuell tekst'}]);
window.lock=setLocked;window.snapshot={checked,docs,manual};window.calls=window.calls||[];
return tools.renderProductSections({effectiveProductSections:sections,getManualProductsForSection:title=>title==='Membran'?manual:[],isProjectLocked:locked,checked,openProductSections:open,setOpenProductSections:setOpen,productDocs:docs,toggleProductChecked:(key,value)=>{window.calls.push('check');setChecked(p=>({...p,[key]:value}));},updateProductDoc:(key,value)=>{window.calls.push('doc');setDocs(p=>({...p,[key]:{...p[key],...value}}));},getProductColorOptions:()=>[],addManualProduct:()=>{throw Error('No add requested');},updateManualProduct:(section,id,value)=>{window.calls.push('manual');setManual(p=>p.map(row=>row.id===id?{...row,...value}:row));},removeManualProduct:()=>{throw Error('No removal requested');}});}
window.act=act;const app=createRoot(document.getElementById('app'));window.render=()=>app.render(<App/>);window.unmount=()=>app.unmount();`);
 const out=await build({root,configFile:false,logLevel:'silent',define:{'process.env.NODE_ENV':JSON.stringify('development')},resolve:{alias:{'react/jsx-runtime':root+'/node_modules/react/jsx-runtime.js'}},plugins:[react()],build:{write:false,minify:false,lib:{entry,formats:['iife'],name:'ProductCategoriesProof',cssFileName:'product-categories-proof'}}});
 const dom=new JSDOM('<div id="app"></div>',{url:'https://example.invalid',runScripts:'outside-only',pretendToBeVisual:true});
 try {
  const w=dom.window;const errors=[];w.console.error=(...args)=>errors.push(args.map(String).join(" "));w.IS_REACT_ACT_ENVIRONMENT=true;w.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setImmediate(()=>this.port1.onmessage?.())};}};
  w.eval((Array.isArray(out)?out[0]:out).output.find(x=>x.type==='chunk').code);
  const doc=w.document,button=name=>[...doc.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')===name||b.textContent.trim()===name),click=async name=>{assert(button(name),name);await w.act(async()=>button(name).click());};
  const fill=async(label,value)=>{const input=[...doc.querySelectorAll('label')].find(l=>l.textContent===label).querySelector('input');await w.act(async()=>{Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype,'value').set.call(input,value);input.dispatchEvent(new w.Event('input',{bubbles:true}));});};
  await w.act(async()=>w.render());const initial=JSON.stringify(w.snapshot);
  eq(doc.querySelectorAll('.product-category').length,3,'all editable categories visible');eq(doc.querySelectorAll('.product-category.is-open').length,0,'existing choices do not expand all editors on entry');
  eq(button('Åpne Primer').getAttribute('aria-expanded'),'false','collapsed semantic state');eq(doc.querySelectorAll('.product-category h2').length,3,'one category heading each');
  eq(doc.getElementById(button('Åpne Primer').getAttribute('aria-controls')).hidden,true,'controls references actual hidden body');
  await click('QA primer · Primer');eq(button('Lukk Primer').getAttribute('aria-expanded'),'true','missing-document shortcut opens correct category');
  await fill('FDV-/databladlink','https://example.invalid/fdv.pdf');await fill('Hvor brukt / kommentar','Bevart redigert kommentar');
  const changed=JSON.stringify(w.snapshot),calls=w.calls.length;
  await click('Åpne Membran');eq(doc.querySelectorAll('.product-category.is-open').length,1,'only requested category expands');eq(button('Åpne Primer').getAttribute('aria-expanded'),'false','previous category closes');
  eq(doc.querySelector('input[value="QA annet produkt"]').value,'QA annet produkt','same manual product');await click('Åpne Primer');
  eq([...doc.querySelectorAll('input')].some(i=>i.value==='Bevart redigert kommentar'),true,'comment survives category change');eq([...doc.querySelectorAll('input')].some(i=>i.value==='https://example.invalid/fdv.pdf'),true,'FDV survives category change');
  eq(JSON.stringify(w.snapshot),changed,'category changes never mutate product state');eq(w.calls.length,calls,'category changes invoke no product writes');
  await w.act(async()=>w.lock(true));eq(doc.querySelectorAll('.product-category').length,2,'locked view contains used categories only');eq(doc.querySelectorAll('.product-category>h2 button').length,0,'locked categories are static headings');eq(doc.querySelectorAll('input[type="checkbox"]').length,0,'locked selection unavailable');eq([...doc.querySelectorAll('input')].every(i=>i.disabled),true,'locked standard fields retain native disabled');eq(doc.body.textContent.includes('Bevart manuell tekst'),true,'locked manual documentation remains visible');eq(JSON.stringify(w.snapshot),changed,'locking does not change products');
  await w.act(async()=>w.lock(false));await click('Lukk Primer');eq(JSON.stringify(w.snapshot),changed,'closing retains choices and metadata');eq(initial===changed,false,'only explicit edits changed state');
  await w.act(async()=>w.unmount());eq(errors,[],'no React runtime or key warnings');
  console.log('Product categories actual React: '+checks+' assertions PASS; compact initial state, precise disclosure, missing-link shortcut, standard/manual FDV and comments, no navigation writes and locked-only used products.');
 } finally {dom.window.close();}
} finally {fs.rmSync(temp,{recursive:true,force:true});}
