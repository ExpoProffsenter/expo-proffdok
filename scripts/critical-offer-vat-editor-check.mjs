import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import assert from 'node:assert/strict';
// Render the production router, including the real grouped/catalog wrappers.
// Hooks are not mounted; this test performs no authentication or backend calls.
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { default: Builder } = await server.ssrLoadModule('/src/modules/sales/components/SalesOfferBuilder.jsx');
  globalThis.window = { __expoProffDokWorkProfile: {active_company_profile:{companyName:'Ringside Rørleggerbedrift AS'}}, location:{origin:'https://qa.invalid'} };
  const { default: RequestForm } = await server.ssrLoadModule('/src/modules/sales/components/SalesRequestForm.jsx');
  const requestHtml = renderToStaticMarkup(React.createElement(RequestForm, { form:{source:'Butikktilbud / varesalg'}, isDirectOffer:true, onUpdateForm:()=>{} }));
  assert(requestHtml.includes('Velg lagret kunde'), 'Customer dropdown missing');
  assert(requestHtml.includes('Søk kunder'), 'Customer search missing');
  assert(requestHtml.indexOf('Lagre kunde for senere bruk') > requestHtml.indexOf('Kundenavn *'), 'Opt-in must follow customer fields');
  assert(requestHtml.indexOf('Lagre kunde for senere bruk') < requestHtml.indexOf('sales-form-actions'), 'Opt-in must precede create offer actions');
  assert(!/type="checkbox"[^>]*checked/.test(requestHtml), 'Customer save must default off');
  for (const ex of [false, true]) {
    const props = { selectedRequest: {id:'QA-vat-editor', directOffer:true, source:'Butikktilbud / varesalg'}, offerForm: { lines:[{id:'qa-product',lineType:'store_product',mainPostId:'butikk-varer',description:'QA vare',quantity:1,amount:100,storeUnitPriceInclVat:'125'}],options:[],showPricesExVat:ex }, updateOfferForm:()=>{} };
    const html = renderToStaticMarkup(React.createElement(Builder, props));
    assert(html.includes('store-grouped-builder'), 'Test must reach the active general offer builder');
    assert(html.includes('Vis priser eks. mva.'), 'Active editor must expose VAT choice');
    const input = html.match(/<input[^>]+type="checkbox"[^>]*>\s*<span>Vis priser eks\. mva\.<\/span>/)?.[0];
    assert(input, 'VAT choice must have an accessible label and checkbox');
    assert.equal(input.includes('checked=""'), ex, 'Checkbox must follow current offer form');
    const summary = html.match(/class="store-summary-price"[^]*?<\/div>/)?.[0];
    assert(summary?.includes(ex ? '<strong>100' : '<strong>125'), 'Editor summary must use selected presentation');
    assert(summary?.includes(ex ? 'eks. mva.</strong>' : 'inkl. mva.</strong>'));
  }
  console.log('critical-offer-vat-editor-check: OK – real general offer router, VAT checkbox and summary');
} finally { delete globalThis.window; await server.close(); }
