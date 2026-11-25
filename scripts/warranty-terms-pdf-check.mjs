import assert from 'node:assert/strict';
import fs from 'node:fs';
import {soproWarrantySystems} from '../src/modules/config/projectConfig.js';
import {renderWarrantyTermsPdf} from '../src/modules/warranty/warrantyTermsPdf.mjs';
const engine = await import(process.env.KSHMS_JSPDF_NODE_PATH || process.env.HR_PRACTICE_JSPDF_PATH || new URL('./qa/node_modules/jspdf/dist/jspdf.node.min.js',import.meta.url).href);
const JsPDF=engine.jsPDF||engine.default?.jsPDF;
let checks=0;
for (const system of soproWarrantySystems.filter(s=>!process.env.WARRANTY_SYSTEM||s.id===process.env.WARRANTY_SYSTEM)) for (const years of [10,12,15]) for (const long of [false,true]) {
 const doc=new JsPDF({unit:'mm',format:'a4',compress:true}), written=[];
 const original=doc.text.bind(doc);doc.text=(text,x,y,opts)=>{written.push({text:String(text),x,y,width:doc.getTextWidth(String(text)),align:opts?.align});return original(text,x,y,opts);};
 const text=long?'Norsk øvingsprosjekt med æøå ÆØÅ og lang prosjektbeskrivelse. '.repeat(180)+'SLUTT-PROSJEKT':'QA – våtrom';
 renderWarrantyTermsPdf({doc,warrantyYears:years,project:{projectName:text,customer:'Syntetisk kunde'},name:'QA utførende',selectedSystem:system,warranty:{termsReceiptName:'Syntetisk mottaker',termsReceiptRole:'Kunde'}});
 const eq=(a,b,msg)=>{assert.deepEqual(a,b,msg);checks++;};
 eq(written.some(r=>r.text.includes(system.product)&&r.text.includes(system.sintefApproval)),true,'full native system and TG');
 eq(written.every(r=>r.y>=10&&r.y<=287.01),true,'all baselines remain inside margins');
 eq(written.filter(r=>!r.align).every(r=>r.x>=18&&r.x+r.width<=192.01),true,'all text wraps within content width');
 eq(written.some(r=>r.text.includes('6. Dokumentasjon og arkiv')),true,'all unchanged warranty sections retained');
 eq(written.some(r=>r.text.includes('Signatur:')),true,'receipt signature line retained');
 eq(written.filter(r=>r.align==='right').length,doc.internal.getNumberOfPages(),'number every page');
 eq(written.filter(r=>r.text==='Expo ProffDok | Garantivilkår').length,doc.internal.getNumberOfPages(),'repeat header every page');
 if(long){eq(doc.internal.getNumberOfPages()>3,true,'long input paginates');eq(written.some(r=>r.text.includes('SLUTT-PROSJEKT')),true,'no truncation of long input');}
 const bytes=Buffer.from(doc.output('arraybuffer'));eq(bytes.subarray(0,5).toString(),'%PDF-','actual renderer produces PDF');
 if(process.env.WARRANTY_PDF_OUTPUT){fs.mkdirSync(process.env.WARRANTY_PDF_OUTPUT,{recursive:true});fs.writeFileSync(`${process.env.WARRANTY_PDF_OUTPUT}/garantivilkar-${system.id}-${years}-${long?'lang':'kort'}.pdf`,bytes);}
}
console.log(`Warranty native terms PDF PASS: ${checks} checks; 10/12/15 years, short/long Norwegian data, actual jsPDF, all text within margins, repeated headers and page numbers. No issuance/signing/persistence.`);
