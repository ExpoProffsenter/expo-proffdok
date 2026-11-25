import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
const {JSDOM}=await import(process.env.KSHMS_JSDOM_PATH||'jsdom');
const root=process.cwd(),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'offer-text-react-'));
fs.writeFileSync(path.join(tmp,'entry.jsx'),`
import React,{act,useState} from '${root}/node_modules/react/index.js';
import {createRoot} from '${root}/node_modules/react-dom/client.js';
import Editor from '${root}/src/modules/sales/components/SalesFreeTextEditor.jsx';
import Customer from '${root}/src/modules/sales/components/SalesCustomerViewCore.jsx';
import Summary from '${root}/src/modules/bolig/BoligAgreementSummary.jsx';
import List from '${root}/src/modules/sales/components/SalesListView.jsx';
const posts=[{id:'a',mainPostId:'custom',mainPostTitle:'Arbeid',description:'Arbeid A',amount:'1000'},{id:'b',mainPostId:'custom',mainPostTitle:'Arbeid',description:'Arbeid B',amount:'2000'}];
window.act=act;let app=createRoot(document.getElementById('app'));
function App(){const [lines,setLines]=useState(posts);window.lines=lines;const request={id:'QA',title:'QA',status:'Tilbud',offerLines:lines,offerOptions:[],offerTotal:3000,offerIntro:'QA'};return <><Editor lines={lines} onChange={setLines}/><Customer mode="customer-offer" selectedRequest={request} acceptanceForm={{selectedOptionIds:[]}} readOnlyPreview hideDecisionControls/></>;}
window.renderEditor=()=>app.render(<App/>);
window.renderSummary=(source,blocks)=>app.render(<Summary document={{kind:'choice',snapshot:{source,reason:'QA',goods:posts.map(p=>({key:p.id,name:p.description,quantity:1,unit:'stk'})),shop_lines:posts.map(p=>({key:p.id,name:p.description,quantity:1,unit:'stk',price_cents:100000,installation_cents:0})),text_blocks:blocks,total_cents:300000,delta_cents:300000}}}/>);
window.renderList=()=>app.render(<List activeRequests={[{id:'published',title:'Publisert',status:'Tilbud',offerPublishedAt:'2026-11-17T23:30:00Z',offerEmailSentAt:'2026-11-24T12:00:00Z'},{id:'draft',title:'Kladd',status:'Tilbud',__createdAt:'2026-11-15T12:00:00Z'}]} requestListLoadState={{status:'ready'}}/>);
`);
const output=await build({root,configFile:false,logLevel:'silent',resolve:{alias:{'react/jsx-runtime':path.join(root,'node_modules/react/jsx-runtime.js')}},define:{'process.env.NODE_ENV':'"development"'},plugins:[react(),{name:'no-network',enforce:'pre',resolveId(id){if(id.endsWith('/SalesSupportNotice.jsx'))return '\0empty';if(id.endsWith('/salesSupabase.js'))return '\0transport';},load(id){if(id==='\0empty')return 'export default function(){return null;}';if(id==='\0transport')return 'export const createDefaultSalesSupabaseClient=()=>null,getSalesRequestsLoadState=()=>({status:"ready"}),getSalesSupportCompanyId=()=>"",resolveSalesCompanyScope=()=>null,setSalesRequestArchivedAt=()=>null,subscribeSalesRequestsLoadState=()=>()=>{};export const createStorageSignedUrl=()=>null,fetchProjectById=()=>null,fetchSalesRequestDetailRow=()=>null,getSalesOfferByToken=()=>null,upsertSalesRequests=()=>null;';}}],build:{write:false,minify:false,lib:{entry:path.join(tmp,'entry.jsx'),formats:['iife'],name:'OfferTextQA',cssFileName:'offer-text-qa'}}});
const dom=new JSDOM('<div id="app"></div>',{url:'https://qa.example.invalid',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window;w.IS_REACT_ACT_ENVIRONMENT=true;w.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setImmediate(()=>this.port1.onmessage?.())};}};w.scrollTo=()=>{};w.crypto.randomUUID=()=>crypto.randomUUID();
w.eval((Array.isArray(output)?output[0]:output).output.find(o=>o.type==='chunk').code);
const act=w.act; let checks=0;const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
const click=async node=>act(async()=>node.click());
const fill=async(node,value)=>act(async()=>{Object.getOwnPropertyDescriptor(node.tagName==='TEXTAREA'?w.HTMLTextAreaElement.prototype:w.HTMLInputElement.prototype,'value').set.call(node,value);node.dispatchEvent(new w.Event('input',{bubbles:true}));});
try{
 await act(async()=>w.renderEditor());
 await click([...w.document.querySelectorAll('button')].find(n=>n.textContent==='+ Ny fri tekst'));
 await fill(w.document.querySelector('.sales-free-text-block input'),'Tekstoverskrift');
 const content='Første avsnitt\n\nAndre avsnitt <script>ingen kode</script>';
 await fill(w.document.querySelector('.sales-free-text-block textarea'),content);
 eq(w.lines.find(l=>l.freeTextBlock).storeTextBody,content,'actual editor updates controlled draft');
 const select=w.document.querySelector('.sales-free-text-block select');
 await act(async()=>{select.value='a';select.dispatchEvent(new w.Event('change',{bubbles:true}));});
 eq(w.lines.map(l=>l.id).filter(id=>['a','b'].includes(id)).join(','),'a,b','priced posts unchanged');
 const text=w.document.querySelector('.sales-customer-free-text');
 eq(text.querySelector('p').textContent,content,'customer keeps complete text and paragraphs');
 eq(text.querySelectorAll('script').length,0,'customer text is escaped');
 eq(text.textContent.includes('0,00'),false,'no zero-price label on text');
 eq(text.previousElementSibling.textContent.includes('Arbeid A'),true,'customer text is after selected post');
 eq(text.nextElementSibling.textContent.includes('Arbeid B'),true,'customer text is before next post');
 for(const source of [undefined,'shop']){
  await act(async()=>w.renderSummary(source,[{id:'before',title:'Først',text:'Første tekst',after:0},{id:'middle',title:'Mellom',text:'Mellomtekst',after:1},{id:'end',title:'Sist',text:'Sluttekst',after:2}]));
  const body=w.document.body.textContent;
  eq(body.indexOf('Første tekst')<body.indexOf('Arbeid A'),true,'bolig first '+source);
  eq(body.indexOf('Arbeid A')<body.indexOf('Mellomtekst')&&body.indexOf('Mellomtekst')<body.indexOf('Arbeid B'),true,'bolig between '+source);
  eq(body.indexOf('Sluttekst')>body.indexOf('Arbeid B'),true,'bolig last '+source);
 }
 await act(async()=>w.renderList());
 await click(w.document.querySelector(".sales-status-tile-work"));
 eq(w.document.body.textContent.includes('Tilbudsdato: 18.11.2026'),true,'offer date uses Norwegian calendar day');
 eq(w.document.body.textContent.includes('Opprettet 15.11.2026'),true,'unpublished draft shows original creation date');
 console.log('PASS offer text React: '+checks+' actual editor, customer/bolig ordering, paragraphs, escaping, no text prices, and overview dates');
}finally{dom.window.close();fs.rmSync(tmp,{recursive:true,force:true});}
