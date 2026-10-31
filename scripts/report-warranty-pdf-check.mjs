import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {build} from 'vite';
import {soproWarrantySystems} from '../src/modules/config/projectConfig.js';
import {SOPRO_SYSTEM_CHECKLIST_TEMPLATES} from '../src/modules/config/soproChecklistTemplates.mjs';
const root=process.cwd(),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'warranty-report-'));
const {JSDOM}=await import(process.env.KSHMS_JSDOM_PATH||new URL('./qa/node_modules/jsdom/lib/api.js',import.meta.url).href);
const pdfPath=process.env.KSHMS_JSPDF_PATH||root+'/scripts/qa/node_modules/jspdf/dist/jspdf.es.min.js';
const entry=path.join(tmp,'entry.js');
fs.writeFileSync(entry,`import {createReportTools} from '${root}/src/modules/report/reportTools.js';window.runReport=d=>createReportTools(d).downloadClickablePdfReport();`);
const bundle=await build({root,configFile:false,logLevel:'silent',plugins:[{name:'native-pdf-engine',enforce:'pre',transform(code,id){if(process.env.REPORT_WARRANTY_SOURCE&&id.endsWith('/reportTools.js'))return fs.readFileSync(process.env.REPORT_WARRANTY_SOURCE,'utf8');},resolveId(id){if(id==='https://esm.sh/jspdf@2.5.1')return '\0native-pdf';},load(id){if(id==='\0native-pdf')return `import {jsPDF as Real} from '${pdfPath}';export function jsPDF(args){const d=new Real(args);window.instrumentPdf(d);d.save=name=>window.recordPdf(name,d);return d;}`;}}],build:{write:false,minify:false,lib:{entry,formats:['iife'],name:'ReportQA'}}});
let checks=0;const eq=(a,b,m)=>{assert.deepEqual(a,b,m);checks++;};
for(const system of soproWarrantySystems.filter(s=>!process.env.WARRANTY_SYSTEM||s.id===process.env.WARRANTY_SYSTEM)) for(const scenario of [{long:false,locked:true},{long:true,locked:true},{long:false,locked:false}]){
 const {long,locked}=scenario;
 if(process.env.REPORT_WARRANTY_BASELINE&&(!long||!locked))continue;
 const dom=new JSDOM('<div class="report"></div>',{url:'https://qa.invalid/',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
 let docs=[],writes=0,updated=null;const alerts=[];w.alert=v=>alerts.push(v);w.confirm=()=>true;
 const ink=Uint8Array.from(Buffer.from('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','base64'));
 const imageBytes=fs.readFileSync('public/brands/ringside-rorleggerbedrift.png'),data='data:image/png;base64,'+imageBytes.toString('base64');
 w.fetch=async url=>{if(!String(url).startsWith('https://qa.invalid/'))throw Error('No remote network in QA');return {ok:true,blob:async()=>new w.Blob([String(url).includes('/sign-')?ink:imageBytes],{type:'image/png'})};};
 w.Image=class{constructor(){this.width=400;this.height=160;}set src(v){this._src=v;w.setTimeout(()=>this.onload?.(),0);}get src(){return this._src;}};
 w.HTMLCanvasElement.prototype.getContext=function(){const c=this;return {fillRect(){},drawImage(img){c._data=img.src;},fillStyle:''};};w.HTMLCanvasElement.prototype.toDataURL=function(){return this._data||data;};
 w.instrumentPdf=d=>{
  d._texts=[];const native=d.text.bind(d);
  d.text=(value,x,y,opts={})=>{
   if(typeof x==='number'&&typeof y==='number'){
    const lines=Array.isArray(value)?value:[value],lineHeight=d.getFontSize()*.352778*(opts.lineHeightFactor||d.getLineHeightFactor());
    lines.forEach((line,i)=>{const width=d.getTextWidth(String(line));d._texts.push({text:String(line),page:d.internal.getCurrentPageInfo().pageNumber,x:x-(opts.align==='center'?width/2:opts.align==='right'?width:0),y:y+i*lineHeight,width});});
   }
   return native(value,x,y,opts);
  };
 };
 w.recordPdf=(name,doc)=>docs.push({name,doc});
 w.eval((Array.isArray(bundle)?bundle[0]:bundle).output.find(r=>r.type==='chunk').code);
 const repeat=(txt,n=12)=>long?(txt+' ').repeat(n)+'END-'+txt:txt;
 const project={projectName:repeat('Øvingsbad ÆØÅ',8),address:'Testveien 10',postnr:'0001',city:'Oslo',customer:repeat('QA mottaker ÆØÅ',15),responsible:repeat('QA utførende',12),date:'2026-10-01',locked:true};
 const warranty={enabled:true,system:system.id,issued:true,status:'issued',guaranteeNumber:'QA-GARANTI-001',durationYears:15,issuedAt:'2026-10-02T10:00:00Z',termsAccepted:true,termsAcceptedBy:repeat('QA mottaker ÆØÅ',15)};
 const overtagelse={enabled:true,dato:'2026-10-02',signKunde:'QA kunde',signUtførende:'QA utførende',signKundeImage:'https://qa.invalid/sign-kunde.png',signUtførendeImage:'https://qa.invalid/sign-firma.png',kommentar:repeat('QA lang overtagelsesmerknad',120)};
 const deps={project,company:{companyName:'QA firma',orgNumber:'999999999',email:repeat('kontakt',22)+'@example.invalid',logoUrl:'https://qa.invalid/logo.png'},name:'QA firma',user:{name:'QA leder'},authUser:{id:'QA-user'},projectId:'QA-project',warranty,overtagelse,warrantyReadiness:{selectedSystem:{...system,sintefUrl:'https://qa.invalid/tg'},termsAccepted:true},isProjectLocked:locked,getWarrantyYears:()=>15,hasValue:v=>v!=null&&String(v).trim()!=='',projectHasOvertagelse:()=>true,getOpenDeviationCount:()=>0,emptyWarranty:()=>({}),setWarranty:fn=>{writes++;updated=fn(warranty);},setTab:()=>{},activeChecklistTemplate:SOPRO_SYSTEM_CHECKLIST_TEMPLATES[system.id],checklist:Object.fromEntries(SOPRO_SYSTEM_CHECKLIST_TEMPLATES[system.id].map(g=>[g.category,Object.fromEntries(g.items.map(item=>[item,{status:'Ok',comment:'Syntetisk dokumentert – æøå'}]))])),selected:[{item:system.product,section:'Membran'}],manualSelected:[],manualProducts:{},other:{},surf:{},bathroomEquipment:{},photos:[{url:'https://qa.invalid/photo.png',category:'Ferdig',name:'QA ferdigbilde'}],files:[],inst:[],access:[],tilbud:{enabled:false},getPhotoIdentity:p=>p.url,buildBathroomEquipmentReportGroups:()=>[],publicProjectFileUrl:p=>p.url||'',normalizeExternalUrl:v=>/^https?:/.test(v||'')?v:'',shouldIncludeProductReportDoc:()=>false,productReportDocumentOptions:[],makeProjectLink:()=>'',DEFAULT_REPORT_HERO_IMAGE_URL:''};
 const before=JSON.stringify(deps);await w.runReport(deps);
 eq(docs.length,1,alerts.join('\n'));eq(writes,locked?0:1,'only unlocked final report stamps existing receipt');if(!locked){eq(updated.guaranteeNumber,warranty.guaranteeNumber,'guarantee number retained');eq(updated.status,'issued','issued state retained');eq(Number.isNaN(Date.parse(updated.reportGeneratedAt)),false,'fresh generation time');}eq(JSON.stringify(deps),before,'source data unchanged');
 const out=Buffer.from(docs[0].doc.output('arraybuffer'));const all=docs[0].doc.internal.pages.flat().join('\n');
 eq(out.subarray(0,5).toString(),'%PDF-','real PDF bytes');eq(out.includes(Buffer.from('/Subtype /Image')),true,'actual logo, photo and synthetic signature assets embedded');
 if(process.env.REPORT_WARRANTY_OUTPUT){fs.mkdirSync(process.env.REPORT_WARRANTY_OUTPUT,{recursive:true});fs.writeFileSync(path.join(process.env.REPORT_WARRANTY_OUTPUT,`sluttrapport-${system.id}-${long?'lang':'kort'}-${locked?'last':'apen'}.pdf`),out);}
 const visibleText=docs[0].doc._texts.map(t=>t.text).join(' ').replace(/\s+/g,' ');
 eq(visibleText.includes(system.product),true,'native system retained');
 eq(visibleText.includes(system.sintefApproval),true,'native TG retained');
 for(const group of SOPRO_SYSTEM_CHECKLIST_TEMPLATES[system.id]) for(const item of group.items) eq(visibleText.includes(item),true,'full original Sopro point retained: '+item);
 // A continuation page must identify its original category before its first row.
 if(!process.env.REPORT_WARRANTY_BASELINE){
  for(const group of SOPRO_SYSTEM_CHECKLIST_TEMPLATES[system.id]){
   const sourceItems=group.items.map(item=>docs[0].doc._texts.find(t=>t.text===item)).filter(Boolean);
   for(const pageNo of new Set(sourceItems.map(t=>t.page))){
    const headingText=docs[0].doc._texts.filter(t=>t.page===pageNo&&t.y<sourceItems.find(t=>t.page===pageNo).y).map(t=>t.text).join(' ').replace(/\s+/g,' ');
    eq(headingText.includes(group.category),true,'original category repeated before rows on page '+pageNo);
   }
  }
 }
 // WinAnsi text is kept in actual PDF stream; verify late sentinels in certificate area below.
 if(long&&!process.env.REPORT_WARRANTY_BASELINE){
  const pages=docs[0].doc.internal.pages;let certificate=pages.findIndex(p=>p?.join('\n').includes('GARANTISERTIFIKAT'));
  assert(certificate>0,'native guarantee certificate exists');checks++;
  const late=pages.slice(certificate).flat().join('\n');
  const text=docs[0].doc._texts.filter(t=>t.page>=certificate&&t.page<docs[0].doc.internal.getNumberOfPages()-1&&t.y>10&&t.y<280);
  eq(text.filter(t=>t.x<10||t.x+t.width>201),[],'all certificate text inside horizontal margins');
  eq(docs[0].doc._texts.filter(t=>t.text.includes('QA lang overtagelsesmerknad')&&t.y>279),[],'handover remarks never cross bottom margin');
  eq(late.includes('END-QA mottaker'),true,'certificate must retain full customer value');
  eq(late.includes('END-QA utf'),true,'certificate must retain full contact value');
  eq(docs[0].doc._texts.filter(t=>t.page===1&&t.y>50&&t.y<135).every(t=>t.x>=14&&t.x+t.width<=196),true,'cover title wraps with actual font metrics');
 }
 console.log(`Native warranty report ${system.id} ${long?'long':'short'}/${locked?'locked':'unlocked'}: ${docs[0].doc.internal.getNumberOfPages()} pages; no mutation.`);
 dom.window.close();
}
console.log(`Native warranty/closeout PDF PASS: ${checks} checks. Synthetic transport only; existing createReportTools/jsPDF.`);
fs.rmSync(tmp,{recursive:true,force:true});
