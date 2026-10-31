import React from 'react';
import {createRoot} from 'react-dom/client';
import Order from '../../src/modules/storeCatalog/SupplierOrder.jsx';
import '../../src/style.css';
import '../../src/modules/ui/proffdokWorkspace.css';
import {APP_RUNTIME_STYLES} from '../../src/modules/app/appRuntimeStyles.js';
const runtime=document.createElement('style');runtime.textContent=APP_RUNTIME_STYLES;document.head.appendChild(runtime);
window.qa={calls:[],fail:false,disabled:false};
window.transport={
 context:async()=>({company:{companyName:'QA Firma'},replyTo:'sender@example.invalid',contacts:[{id:'qa-saved',name:'QA Grossist',email:'saved@example.invalid'}]}),
 remove:async()=>{throw Error('No contact deletion in layout review');},
 prepare:async(company,id,order)=>{window.qa.calls.push({kind:'prepare',company,id,order});return {snapshot:{...order,company:{companyName:'QA Firma'},replyTo:'sender@example.invalid',totalNet:308.63,items:order.items.map(i=>({...i,description:'QA Serverens varenavn',supplier:'QA Produsent',number:'0012',gtin:'07000000000001',unitNet:123.45,lineNet:308.63}))}};},
 send:async(company,id,order)=>{window.qa.calls.push({kind:'send',company,id,order});if(window.qa.fail){const e=new Error('QA Sendingen kunne ikke bekreftes');e.uncertain=true;throw e;}return {ok:true};}
};
const items=[{id:'a',description:'QA Vare med langt navn og modellbetegnelse',supplier_name:'QA Produsent A',supplier_product_number:'0012',pickQuantity:'2,5'},{id:'b',description:'QA Vare B',supplier_name:'QA Produsent B',supplier_product_number:'0023',pickQuantity:'3'}];
const root=createRoot(document.getElementById('app'));
window.render=()=>root.render(<div data-expo-app-shell="true"><main><div className="priceSearchInlineView"><section className="priceSearchSelected" aria-label="Valgte varer"><Order companyId="qa-company" orderNumber="00458" items={items} disabled={window.qa.disabled}/></section></div></main></div>);
window.render();
