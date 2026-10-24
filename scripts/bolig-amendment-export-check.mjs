import assert from 'node:assert/strict';
import {supplierDelta,agreementOverview} from '../src/modules/bolig/boligCommerceCore.js';
import {amendmentWorkbook} from '../src/modules/bolig/boligAmendmentExport.js';
let count=0;const eq=(a,b,m)=>{assert.deepEqual(a,b,m);count++;};
const a={key:'a',sku:'00123',name:'Servant',unit:'stk',quantity:2},b={key:'b',sku:'00456',name:'Batteri',unit:'stk',quantity:1};
eq(supplierDelta([a,b],[{...a,quantity:3}]).map(g=>[g.sku,g.quantity]),[['00123',1],['00456',-1]],'only actual additions and credits');
eq(supplierDelta([a],[{...a,sku:'00999',name:'Ny servant'}]).map(g=>[g.sku,g.quantity]),[['00123',-2],['00999',2]],'replacement credits old product separately');
eq(supplierDelta([a],[{...a,fdv_url:'https://example.com/fdv.pdf'}]),[],'documentation changes do not duplicate order quantities');
const docs=[{id:'pending',kind:'choice',group_id:'old',version:1,status:'published',created_at:'2026-10-21'}, {id:'accepted',kind:'choice',group_id:'new',version:1,status:'accepted',created_at:'2026-10-20'}];
const view=agreementOverview(docs);eq(view.choice.id,'accepted');eq(view.history.map(d=>d.id),['pending']);eq(view.changes,[]);
const changes=agreementOverview([{id:'new',group_id:'new-change',kind:'change',version:1,status:'draft',created_at:'2026-10-22',snapshot:{order_id:'order'}},{id:'old',group_id:'old-change',kind:'change',version:1,status:'handled',created_at:'2026-10-21',snapshot:{order_id:'order'}}]);
eq(changes.changes.map(d=>d.id),['new'],'latest amendment per order is shown');eq(changes.history.map(d=>d.id),['old'],'earlier applied amendments remain in history');
const document={kind:'change',version:2,snapshot:{order_number:'B-2',identity:{company:'QA',unit:'H0101',project:'QA hus',address:'Boligadresse'},supplier_order:{reference:'ORDRE-001',supplier:'QA Leverandør',address:'Riktig varemottak'},before_goods:[a,b],goods:[{...a,quantity:3}],delta_cents:-35000,reason:'QA tillegg og kredit'}};
const bytes=amendmentWorkbook(document,{company_name:'QA Firma'});const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);let p=0,sheet='';
while(p+30<bytes.length && v.getUint32(p,true)===0x04034b50){const n=v.getUint16(p+26,true),e=v.getUint16(p+28,true),size=v.getUint32(p+18,true),name=new TextDecoder().decode(bytes.slice(p+30,p+30+n));if(name==='xl/worksheets/sheet1.xml')sheet=new TextDecoder().decode(bytes.slice(p+30+n+e,p+30+n+e+size));p+=30+n+e+size;}
eq(sheet.includes('Riktig varemottak'),true);eq(sheet.includes('ORDRE-001'),true);eq(sheet.includes('ENDRINGSBESTILLING / KREDITERING'),true);eq(sheet.includes('00123'),true);eq(sheet.includes('<v>-1</v>'),true);eq(sheet.includes('<v>3</v>'),false,'delta export is not a fresh full order');eq(sheet.includes('350'),false,'resident price never enters supplier attachment');eq(sheet.includes('QA tillegg og kredit'),false,'resident free text stays out of supplier attachment');
console.log(`PASS amendment export/overview: ${count} assertions; signed deltas, replacement credit, canonical choice and real XLSX.`);
