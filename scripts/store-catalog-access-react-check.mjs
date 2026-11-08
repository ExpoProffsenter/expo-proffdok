import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {build} from 'vite';
import react from '@vitejs/plugin-react';

// Actual components and client, synthetic read-only RPC. Never imports live data.
const {JSDOM}=await import(process.env.KSHMS_JSDOM_PATH||'jsdom');
const root=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'catalog-access-'));
let checks=0;
const eq=(actual,expected,label)=>{assert.deepEqual(actual,expected,label);checks++;};
try {
 const entry=path.join(temp,'entry.jsx');
 fs.writeFileSync(entry,`import React,{act} from '${root}/node_modules/react/index.js';
import {createRoot} from '${root}/node_modules/react-dom/client.js';
import {StoreCatalogAdminOnlyPanel} from '${root}/src/modules/storeCatalog/StoreCatalogOfferTools.jsx';
import Panel from '${root}/src/modules/storeCatalog/StoreCatalogPanel.jsx';
import {registerAppSupabaseClient} from '${root}/src/modules/access/appSupabaseClientRegistry.js';
import {canAccessInternalStoreCatalog,canManageInternalStoreCatalog} from '${root}/src/modules/storeCatalog/storeCatalogClient.js';
registerAppSupabaseClient({rpc:(...args)=>window.rpc(...args)});
window.act=act;window.checkAccess=canAccessInternalStoreCatalog;window.checkManage=canManageInternalStoreCatalog;
const app=createRoot(document.getElementById('app'));let key=0;
window.render=(inner=false)=>app.render(inner?<Panel key={++key}/>:<StoreCatalogAdminOnlyPanel key={++key}/>);
window.unmount=()=>app.unmount();`);
 const output=await build({root,configFile:false,logLevel:'silent',define:{'process.env.NODE_ENV':JSON.stringify('development')},resolve:{alias:{'react/jsx-runtime':root+'/node_modules/react/jsx-runtime.js'}},plugins:[react()],build:{write:false,minify:false,cssCodeSplit:false,lib:{entry,formats:['iife'],name:'CatalogAccessProof'}}});
 const dom=new JSDOM('<div id="app"></div>',{url:'https://example.invalid',runScripts:'outside-only',pretendToBeVisual:true});
 try {
  const w=dom.window;w.IS_REACT_ACT_ENVIRONMENT=true;
  w.MessageChannel=class {constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setImmediate(()=>this.port1.onmessage?.())};}};
  let mode='allowed',calls=[],pending=[];
  w.rpc=async(name)=>{
   calls.push(name);
   if(name==='get_pending_internal_store_catalog_import')return {data:null};
   assert(['current_user_has_internal_store_catalog_access','current_user_can_manage_internal_store_catalog'].includes(name),'only read-only permission RPC');
   if(mode==='hold')return new Promise(resolve=>pending.push(resolve));
   if(mode==='error')return {data:null,error:{message:'Synthetic network failure'}};
   if(mode==='throw')throw Error('Synthetic rejected transport');
   return {data:mode==='allowed'};
  };
  w.eval((Array.isArray(output)?output[0]:output).output.find(item=>item.type==='chunk').code);
  const text=()=>w.document.getElementById('app').textContent;
  const render=async(inner=false)=>w.act(async()=>w.render(inner));
  const retry=async()=>w.act(async()=>w.document.querySelector('button').click());
  for(const inner of [false,true]) {
   mode='hold';calls=[];pending=[];await render(inner);
   eq(text().includes('Kontrollerer tilgang'),true,'visible pending permission');
   eq(w.document.querySelector('.catalog-panel'),null,'no search or import before permission');
   mode='denied';await w.act(async()=>pending.splice(0).forEach(resolve=>resolve({data:false})));
   eq(text().includes('har ikke tilgang'),true,'denial is explained');
   eq(w.document.querySelector('input'),null,'denial cannot expose search/upload');
   eq(calls.includes('get_pending_internal_store_catalog_import'),false,'denial cannot fetch import');
   for(const failure of ['error','throw']) {
    mode=failure;await render(inner);
    eq(w.document.querySelector('[role="alert"]')!==null,true,'RPC and transport failures have error state');
    eq(text().includes('har ikke tilgang'),false,'failure is distinct from actual denial');
    mode='hold';pending=[];await retry();
    eq(text().includes('Kontrollerer tilgang'),true,'manual retry returns to loading');
    mode='allowed';await w.act(async()=>pending.splice(0).forEach(resolve=>resolve({data:true})));
    eq(w.document.querySelector('.catalog-panel')!==null,true,'successful fresh read restores real panel');
    eq(w.document.querySelector('input[type="file"]')!==null,true,'authorized import UI preserved');
   }
  }
  mode='error';
  eq(await w.checkAccess({rpc:w.rpc}),false,'lookup callers retain default fail-closed behavior');
  eq(await w.checkManage({rpc:w.rpc}),false,'other manage callers retain default fail-closed behavior');
  mode='hold';pending=[];await render();await w.act(async()=>w.unmount());
  await w.act(async()=>pending.splice(0).forEach(resolve=>resolve({data:true})));
  eq(text(),'','late permission response cannot restore unmounted UI');
  console.log('Catalog access actual React/client: '+checks+' assertions PASS; loading, denial, RPC/transport errors, manual retry, import gating and late response.');
 } finally {dom.window.close();}
} finally {fs.rmSync(temp,{recursive:true,force:true});}
