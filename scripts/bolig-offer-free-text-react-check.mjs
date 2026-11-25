import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
import {shopPayload,shopDraftFrom} from '../src/modules/bolig/boligShopCore.js';
const {JSDOM}=await import(process.env.KSHMS_JSDOM_PATH||'jsdom');
const root=process.cwd(),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'bolig-text-react-'));
fs.writeFileSync(path.join(tmp,'entry.jsx'),`
import React,{act,useState} from '${root}/node_modules/react/index.js';
import {createRoot} from '${root}/node_modules/react-dom/client.js';
import Summary from '${root}/src/modules/bolig/BoligAgreementSummary.jsx';
import {BoligOfferTextEditor} from '${root}/src/modules/bolig/BoligOfferText.jsx';
const goods=[{key:'a',name:'Vare A',quantity:1,unit:'stk',price_cents:100000,installation_cents:0},{key:'b',name:'Vare B',quantity:1,unit:'stk',price_cents:200000,installation_cents:0}];
window.act=act;const root=createRoot(document.getElementById('app'));
function App({kind='choice',source,initial=[]}){const [blocks,setBlocks]=useState(initial);window.blocks=blocks;return <><BoligOfferTextEditor goods={goods} blocks={blocks} onChange={setBlocks}/><Summary document={{kind,snapshot:{source,reason:'QA',goods,before_goods:[],shop_lines:goods,text_blocks:blocks,total_cents:300000,delta_cents:300000}}}/></>;}
window.render=(kind,source,blocks=[])=>root.render(<App key={kind+':'+source} kind={kind} source={source} initial={blocks}/>);
`);
const output=await build({root,configFile:false,logLevel:'silent',resolve:{alias:{'react/jsx-runtime':path.join(root,'node_modules/react/jsx-runtime.js')}},define:{'process.env.NODE_ENV':'"development"'},plugins:[react()],build:{write:false,minify:false,lib:{entry:path.join(tmp,'entry.jsx'),formats:['iife'],name:'BoligTextQA',cssFileName:'bolig-text-qa'}}});
const dom=new JSDOM('<div id="app"></div>',{url:'https://qa.example.invalid',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
w.IS_REACT_ACT_ENVIRONMENT=true;w.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setImmediate(()=>this.port1.onmessage?.())};}};w.crypto.randomUUID=()=>crypto.randomUUID();
w.eval((Array.isArray(output)?output[0]:output).output.find(o=>o.type==='chunk').code);
const act=w.act;let checks=0;const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
try{
 for(const [kind,source] of [['choice',undefined],['change',undefined],['change','shop']]){
  await act(async()=>w.render(kind,source,[{id:'before',title:'Først',text:'Første tekst',after:0},{id:'middle',title:'Mellom',text:'Mellomtekst',after:1},{id:'end',title:'Sist',text:'Sluttekst',after:2}]));
  const summary=w.document.querySelector('.bolig-agreement-summary');
  const container=kind==='change'&&!source?summary.querySelector('details'):summary;
  const text=container.textContent;
  eq(text.indexOf('Første tekst')<text.indexOf('Vare A'),true,'first '+kind+source);
  eq(text.indexOf('Vare A')<text.indexOf('Mellomtekst')&&text.indexOf('Mellomtekst')<text.indexOf('Vare B'),true,'between '+kind+source);
  eq(text.indexOf('Sluttekst')>text.indexOf('Vare B'),true,'last '+kind+source);
  eq(summary.querySelectorAll('[aria-label=Tilbudstekst]').length,3,'all three blocks visible');
 }
 const select=w.document.querySelector('.sales-free-text-block select');
 await act(async()=>{select.value='2';select.dispatchEvent(new w.Event('change',{bubbles:true}));});
 eq(w.blocks[0].after,'2','actual housing editor moves existing block');
 const payload=shopPayload({title:'Butikk',lines:[{name:'Vare',sku:'',room_name:'',unit:'stk',quantity:'1',price:'1250',installation:'0',image_url:''}],text_blocks:[{id:'t',title:'Info',text:'Før varen\nNeste linje',after:''}]});
 eq(payload.text_blocks[0].after,0,'shop serializes first position');
 eq(payload.lines[0].price_cents,125000,'shop prices unchanged');
 eq(shopDraftFrom({snapshot:{reason:'Butikk',shop_lines:[],text_blocks:payload.text_blocks}}).text_blocks,payload.text_blocks,'shop snapshot hydration keeps text');
 console.log('PASS bolig offer text React: '+checks+' editor, choice/change/shop ordering and persisted payload/price checks');
}finally{dom.window.close();fs.rmSync(tmp,{recursive:true,force:true});}
