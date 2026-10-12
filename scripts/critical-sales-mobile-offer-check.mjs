import assert from 'node:assert/strict';import fs from 'node:fs';
import {openMobileCustomerPreview,MOBILE_PREVIEW_EVENT} from '../src/modules/sales/services/salesMobilePreview.mjs';
class EventWithDetail extends Event{constructor(type,options){super(type,options);this.detail=options.detail;}}
const priorWindow=globalThis.window,priorEvent=globalThis.CustomEvent;
try{
const bus=new EventTarget();globalThis.window={location:{origin:'https://qa.example.invalid'},matchMedia:()=>({matches:true}),dispatchEvent:event=>bus.dispatchEvent(event)};globalThis.CustomEvent=EventWithDetail;
assert.equal(openMobileCustomerPreview('/?publicOffer=synthetic'),false,'missing listener keeps old new-tab fallback');
const handler=e=>{assert.equal(e.detail.url,'https://qa.example.invalid/?publicOffer=synthetic');e.preventDefault();};bus.addEventListener(MOBILE_PREVIEW_EVENT,handler);
assert.equal(openMobileCustomerPreview('/?publicOffer=synthetic'),true);assert.equal(openMobileCustomerPreview('https://other.example.invalid/?publicOffer=x'),false);assert.equal(openMobileCustomerPreview('/unrelated'),false);
window.matchMedia=()=>({matches:false});assert.equal(openMobileCustomerPreview('/?publicOffer=synthetic'),false,'desktop new tab preserved');
}finally{globalThis.window=priorWindow;globalThis.CustomEvent=priorEvent;}
const tools=fs.readFileSync('src/modules/sales/components/SalesMobileTools.jsx','utf8');assert(tools.includes('showModal()'));assert(tools.includes('Tilbake til tilbudet'));assert(tools.includes("removeEventListener(MOBILE_PREVIEW_EVENT"));assert(!/localStorage|sessionStorage|\.rpc\(|fetch\(/.test(tools));
assert(tools.includes('createPortal'));assert(tools.includes('visualViewport'));assert(tools.includes('mutations.disconnect()'));
const group=fs.readFileSync('src/modules/sales/components/SalesOfferGroup.jsx','utf8');assert(group.includes('Åpne hovedpost'));assert(group.includes('Lukk hovedpost'));assert(group.includes('onToggle'));
const css=fs.readFileSync('src/modules/sales/sales.css','utf8');assert(css.includes('.sales-internal-offer-row > strong:first-child'));assert(css.includes('grid-row:2'));assert(css.includes('.sales-internal-offer-option{grid-template-columns:minmax(0,1fr)!important}'));
console.log('Sales mobile offer critical PASS: narrow reading layout, accessible folding, same-origin handled modal, desktop/no-listener fallback, no storage or server writes.');
