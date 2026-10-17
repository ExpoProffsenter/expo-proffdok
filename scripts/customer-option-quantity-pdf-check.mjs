import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { build } from 'vite';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'quantity-pdf-'));
const option={id:'spot',mainPostId:'rorlegger',mainPostTitle:'Rørlegger',optionType:'addition',title:'Downlight',description:'Montert downlight',amount:'2400',quantity:4,unit:'stk',customerCanChooseQuantity:true};
const lines=[{id:'base',mainPostId:'rorlegger',mainPostTitle:'Rørlegger',description:'Grunnarbeid',amount:10000}];
const request={id:'QUANTITY-QA',offerTitle:'Antallskontroll',offerLines:lines,offerOptions:[{...option,quantity:1}],offerTotal:10000,companyName:'QA firma',customer:'QA kunde',address:'QA veien',acceptedBy:'QA kunde',acceptedAt:'2026-10-17T12:00:00Z',acceptedOfferLines:lines,acceptedOptions:[option],acceptedTotal:19600,acceptedOfferVersionNumber:1};
const contract={id:'signed-qa',status:'signed',request_ref:'QUANTITY-QA',company_signed_by_name:'QA firma',customer_signed_by_name:'QA kunde',snapshot:{company:{companyName:'QA firma'},customer:{name:'QA kunde',address:'QA veien'},offer:{version_number:1,title:'Antallskontroll',lines,total_ex_vat:10000},acceptance:{selected_options:[option],accepted_by:'QA kunde',accepted_at:request.acceptedAt},contract:{price_incl_vat:24500}}};
fs.writeFileSync(path.join(temp,'entry.js'),`
import{createPublishedOfferPdfPolishedV2}from'${root}/src/modules/sales/services/salesOfferPdfPolishedV2.js';
import{createAcceptanceProofPdfPolished}from'${root}/src/modules/sales/services/salesAcceptancePdfPolished.js';
import{createFinalSalesContractPdf}from'${root}/src/modules/sales/services/salesContractPdf.js';
window.run=async()=>{const result=[];for(const[kind,fn]of[['offer',()=>createPublishedOfferPdfPolishedV2({selectedRequest:${JSON.stringify(request)}})],['acceptance',()=>createAcceptanceProofPdfPolished({selectedRequest:${JSON.stringify(request)}})],['contract',()=>createFinalSalesContractPdf(${JSON.stringify(contract)})]]){window.currentKind=kind;const file=await fn();result.push({kind,fileName:file.fileName,bytes:Array.from(new Uint8Array(await file.blob.arrayBuffer()))});}return result;};`);
let browser;
try{
  const modulePath=process.env.KSHMS_JSPDF_PATH;
  assert(modulePath,'KSHMS_JSPDF_PATH required for real PDF renderer');
  const bundle=await build({root,configFile:false,logLevel:'silent',plugins:[{name:'local-real-jspdf',enforce:'pre',resolveId(id){if(id==='https://esm.sh/jspdf@2.5.1')return modulePath;}}],build:{write:false,minify:false,lib:{entry:path.join(temp,'entry.js'),formats:['iife'],name:'QuantityPdf'}}});
  const js=(Array.isArray(bundle)?bundle[0]:bundle).output.find(x=>x.type==='chunk'&&x.isEntry).code;
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});const page=await browser.newPage();
  await page.route('**/*',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><title>PDF QA</title>'}));await page.goto('https://quantity-pdf.example.invalid');await page.addScriptTag({content:js});
  const files=await page.evaluate(()=>window.run());
  const out=process.env.OPTION_QUANTITY_QA_OUTPUT||temp;fs.mkdirSync(out,{recursive:true});
  for(const file of files){
    const pdf=path.join(out,file.kind+'.pdf');fs.writeFileSync(pdf,new Uint8Array(file.bytes));
    const text=execFileSync('pdftotext',['-layout',pdf,'-'],{encoding:'utf8'});
    assert(text.includes('Downlight'),file.kind+' missing option');
    if(file.kind==='offer'){assert(text.includes('Kunden kan velge antall'), 'offer must distinguish default from chosen quantity');assert(/1 stk\s+x\s+3\s?000/.test(text),'published default quantity/unit price');}
    else{assert(/4 stk\s+[x×]\s+3\s?000/.test(text),file.kind+' chosen quantity/unit price missing');assert(/12\s?000/.test(text),file.kind+' selected total missing');assert(/24\s?500/.test(text),file.kind+' accepted total missing');}
    fs.writeFileSync(path.join(out,file.kind+'.txt'),text);
  }
  console.log('PASS real offer, acceptance and signed-contract PDFs: published opt-in/default, accepted 4 stk × 3000, selected 12000 and total 24500 incl VAT.');
}finally{await browser?.close();fs.rmSync(temp,{recursive:true,force:true});}
