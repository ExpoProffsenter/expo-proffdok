import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {build} from 'vite';
import {freeTextLines} from '../src/modules/sales/utils/offerFreeText.js';
const {JSDOM}=await import(process.env.KSHMS_JSDOM_PATH||'jsdom');
const root=process.cwd(),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'offer-text-pdf-'));
const lines=freeTextLines([{id:'a',mainPostId:'custom',mainPostTitle:'Arbeid',description:'POST-A',amount:'1000'},{id:'b',mainPostId:'custom',mainPostTitle:'Arbeid',description:'POST-B',amount:'2000'}],[
 {id:'intro',title:'TEXT-HEADING-A',text:'TEXT-START-A\n'+Array.from({length:150},(_,i)=>'Tekstrad '+String(i+1).padStart(3,'0')+' med forklaring om arbeidet.').join('\n')+'\nTEXT-END-A',after:''},
 {id:'middle',title:'TEXT-HEADING-B',text:'TEXT-MIDDLE-B',after:'a'},
 {id:'last',title:'TEXT-HEADING-C',text:'TEXT-END-C',after:'b'}]);
const request={id:'QA-TEXT',title:'QA',offerTitle:'QA fritekst',offerLines:lines,offerOptions:[],offerTotal:3000,companyName:'QA firma',customer:'QA kunde',address:'QA veien',acceptedBy:'QA kunde',acceptedAt:'2026-11-25T12:00:00Z',acceptedOfferLines:lines,acceptedOptions:[],acceptedTotal:3000,acceptedOfferVersionNumber:1};
const contract={id:'QA-contract',status:'signed',request_ref:'QA-TEXT',snapshot:{company:{companyName:'QA firma'},customer:{name:'QA kunde',address:'QA veien'},offer:{version_number:1,title:'QA fritekst',lines,total_ex_vat:3000},acceptance:{selected_options:[],accepted_by:'QA kunde',accepted_at:request.acceptedAt},contract:{price_incl_vat:3750}}};
fs.writeFileSync(path.join(tmp,'entry.js'),`
import {createPublishedOfferPdfPolishedV2 as offer} from '${root}/src/modules/sales/services/salesOfferPdfPolishedV2.js';
import {createAcceptanceProofPdfPolished as accepted} from '${root}/src/modules/sales/services/salesAcceptancePdfPolished.js';
import {createFinalSalesContractPdf as contract} from '${root}/src/modules/sales/services/salesContractPdf.js';
window.run=async()=>{const result=[];for(const [kind,fn] of [['offer',()=>offer({selectedRequest:${JSON.stringify(request)}})],['acceptance',()=>accepted({selectedRequest:${JSON.stringify(request)}})],['contract',()=>contract(${JSON.stringify(contract)})]]){const file=await fn();result.push({kind,bytes:Array.from(new Uint8Array(await file.blob.arrayBuffer()))});}return result;};`);
let dom;
try{
 const modulePath=process.env.KSHMS_JSPDF_PATH||path.join(root,'scripts/qa/node_modules/jspdf/dist/jspdf.es.min.js');
 const output=await build({root,configFile:false,logLevel:'silent',plugins:[{name:'real-local-jspdf',enforce:'pre',resolveId(id){if(id==='https://esm.sh/jspdf@2.5.1')return modulePath;}}],build:{write:false,minify:false,lib:{entry:path.join(tmp,'entry.js'),formats:['iife'],name:'OfferTextPdfQA'}}});
 dom=new JSDOM('',{url:'https://qa.example.invalid',runScripts:'outside-only',pretendToBeVisual:true});const w=dom.window;
 w.Blob=Blob;w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;
 w.eval((Array.isArray(output)?output[0]:output).output.find(o=>o.type==='chunk'&&o.isEntry).code);
 for(const file of await w.run()){
  const pdf=path.join(tmp,file.kind+'.pdf');fs.writeFileSync(pdf,new Uint8Array(file.bytes));
  const text=execFileSync('pdftotext',['-layout',pdf,'-'],{encoding:'utf8'});
  for(const marker of ['TEXT-START-A','Tekstrad 001','Tekstrad 150','TEXT-END-A','POST-A','TEXT-MIDDLE-B','POST-B','TEXT-END-C'])assert(text.includes(marker),file.kind+' missing '+marker);
  const ordered=['TEXT-END-A','POST-A','TEXT-MIDDLE-B','POST-B','TEXT-END-C'].map(marker=>text.indexOf(marker));
  assert(ordered.every((n,i)=>i===0||n>ordered[i-1]),file.kind+' text/post order');
  assert(text.split('\f').length>3,file.kind+' long text has actual page breaks');
 }
 console.log('PASS real offer/acceptance/signed-contract PDFs: 150 text lines, final marker, before/between/after post order and multipage pagination');
}finally{dom?.window.close();fs.rmSync(tmp,{recursive:true,force:true});}
