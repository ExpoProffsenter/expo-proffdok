import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { build } from "vite";
import react from "@vitejs/plugin-react";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const root = process.cwd();
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "sales-store-layout-"));
let browser;
let checks = 0;
const eq = (actual, expected, message) => {
  assert.deepEqual(actual, expected, message);
  checks++;
};

// The actual grouped editor and the actual design selectors are exercised.
// State/save/back callbacks and the template service are synthetic. No auth,
// Supabase transport, mail, file upload or customer decision is used.
const entry = path.join(temp, "entry.jsx");
fs.writeFileSync(entry, `
import React,{useState} from '${root}/node_modules/react/index.js';
import {createRoot} from '${root}/node_modules/react-dom/client.js';
import Grouped from '${root}/src/modules/sales/components/SalesStoreOfferBuilderGrouped.jsx';
import '${root}/src/style.css';
import '${root}/src/modules/app/mobileResponsive41A.css';
import '${root}/src/modules/sales/sales.css';
import '${root}/src/modules/ui/proffdokWorkspace.css';
window.__expoProffDokWorkProfile={active_company_profile:{companyName:'Kun lokal QA'}};
window.qa={calls:[],templateCalls:[]};
function App(){
 const [form,setForm]=useState({title:'Syntetisk generelt tilbud',intro:'Innledning som skal beholdes',terms:'Kun lokal test',paymentTerms:'10 dager netto',validityDays:'30',lines:[{id:'qa-product',lineType:'store_product',mainPostId:'butikk-varer',description:'Lagret vare med lang beskrivelse',quantity:'2',unit:'stk',amount:100,storeUnitPriceInclVat:'125'}],options:[]});
 window.qa.form=form;
 return <div data-expo-app-shell="true"><main><Grouped
  selectedRequest={{id:'QA-STORE-LAYOUT',directOffer:true,source:'Butikktilbud / varesalg',title:'Syntetisk tilbud',customer:'Eksempelkunde',responsible:'QA'}}
  offerForm={form} offerDraftSaveStatus="saved"
  updateOfferForm={(key,value)=>setForm(current=>({...current,[key]:value}))}
  onBack={()=>window.qa.calls.push({name:'back'})}
  handleSaveOffer={event=>{event.preventDefault();window.qa.calls.push({name:'save',form:structuredClone(form)});}}
 /></main></div>;
}
createRoot(document.getElementById('app')).render(<App/>);
`);

try {
  const built = await build({
    root,
    configFile: false,
    logLevel: "silent",
    plugins: [react(), {
      name: "synthetic-store-template-service",
      enforce: "pre",
      resolveId(id) {
        if (id.endsWith("/salesStoreOfferTemplates.js")) return "\0qa-store-templates";
      },
      load(id) {
        if (id === "\0qa-store-templates") return `
          export async function loadStoreTextTemplates(){window.qa.templateCalls.push('load');return [{id:'qa-template',name:'Kun syntetisk mal'}];}
          export async function saveStoreTextTemplate(){throw Error('Template writes are outside this layout test');}
          export async function removeStoreTextTemplate(){throw Error('Template deletion is outside this layout test');}
        `;
      },
    }],
    resolve: { alias: {
      react: path.join(root, "node_modules/react"),
      "react-dom": path.join(root, "node_modules/react-dom"),
    } },
    define: {
      "process.env.NODE_ENV": '"production"',
      "import.meta.env.VITE_SUPABASE_URL": '"https://synthetic-store.example.invalid"',
      "import.meta.env.VITE_SUPABASE_ANON_KEY": '"synthetic-public-key"',
    },
    build: { write: false, minify: false, lib: {
      entry, formats: ["iife"], name: "StoreLayoutQA", cssFileName: "store-layout-qa",
    } },
  });
  const output = (Array.isArray(built) ? built[0] : built).output;
  const script = output.find(item => item.type === "chunk" && item.isEntry).code;
  const css = output.filter(item => item.type === "asset" && item.fileName.endsWith(".css"))
    .map(item => item.source).join("\n");
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    args: ["--no-sandbox"],
  });

  for (const width of [320, 390, 768, 1024, 1366, 1920]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    page.setDefaultTimeout(7000);
    const errors = [];
    const network = [];
    page.on("pageerror", error => errors.push(error.message));
    // No request is permitted to leave the fixture, even if an import regresses.
    await page.route("**/*", route => {
      network.push(route.request().url());
      return route.abort();
    });
    await page.setContent('<!doctype html><html lang="nb"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><div id="app"></div></html>');
    await page.addStyleTag({ content: css });
    await page.addScriptTag({ content: script });
    await page.locator(".store-summary").waitFor();
    if (width === 1920) eq(await page.locator('.store-grouped-builder .sales-main').evaluate(el=>el.getBoundingClientRect().width>1180&&el.getBoundingClientRect().width<=1600),true,'general offer content uses available desktop width');
    const workbar = page.locator(".store-workbar");
    const product = page.locator(".store-product-container").first();
    await product.locator(".store-group-heading").click();
    const title = product.getByLabel("Varenavn *", { exact: true });
    const quantity = product.getByLabel("Antall", { exact: true });
    const price = product.getByLabel(/^Pris pr\. enhet inkl\. mva\./);
    await title.fill("Ulagret varetekst med lang beskrivelse som skal beholdes");
    await quantity.fill("3");
    await price.fill("1250");
    const before = await page.evaluate(() => structuredClone(window.qa.form));

    const assertLayout = async label => {
      eq(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `${label}: no page overflow at ${width}`);
      const overflowingPanels = await page.locator(".store-product-container.is-open,.store-product-body,.store-workbar,.store-summary,.store-room")
        .evaluateAll(nodes => nodes.filter(node => node.scrollWidth > node.clientWidth + 1).map(node => ({className:node.className,scrollWidth:node.scrollWidth,clientWidth:node.clientWidth,children:[...node.children].map(child=>({className:child.className,width:child.getBoundingClientRect().width,scrollWidth:child.scrollWidth}))})));
      eq(overflowingPanels, [], `${label}: actual editor panels fit at ${width}`);
      const targets = await page.locator(".store-icon-button,.store-workbar button,.store-product-actions button,.store-summary-actions button")
        .evaluateAll(nodes => nodes.map(node => ({
          label: node.getAttribute("aria-label") || node.textContent.trim(),
          width: node.getBoundingClientRect().width,
          height: node.getBoundingClientRect().height,
        })).filter(rect => rect.width && rect.height));
      eq(targets.length >= 7, true, `${label}: central action targets are present at ${width}`);
      // Chromium can report 43.99988px for a computed 44px sticky control.
      // Normalize only numerical noise; 40/42px controls still fail.
      eq(targets.filter(rect => rect.width + 0.001 < 44 || rect.height + 0.001 < 44), [], `${label}: central item/work actions are at least 44px at ${width}`);
    };
    await assertLayout("opened product");
    eq(await product.locator("input:not([type=checkbox]),select,summary")
      .evaluateAll(nodes => nodes.filter(node => node.getBoundingClientRect().height)
        .every(node => parseFloat(getComputedStyle(node).fontSize) >= 16)), true, `readable product controls at ${width}`);

    const extras = product.locator("details.store-product-extra");
    eq(await extras.count(), 2, `identity and media details retained at ${width}`);
    for (let i = 0; i < 2; i++) {
      const extra = extras.nth(i);
      await extra.locator(":scope > summary").click();
      eq(await extra.getAttribute("open"), "", `extra ${i} opens at ${width}`);
      await assertLayout(`extra ${i} open`);
      await extra.locator(":scope > summary").click();
      eq(await extra.getAttribute("open"), null, `extra ${i} closes at ${width}`);
    }
    await page.evaluate(() => {
      window.dispatchEvent(new Event("focus"));
      document.dispatchEvent(new Event("visibilitychange"));
    });
    eq(await page.evaluate(() => window.qa.form), before, `details/focus preserve all offer values at ${width}`);
    eq(await title.inputValue(), before.lines.find(line => line.id === "qa-product").description, `item text preserved at ${width}`);
    eq(await quantity.inputValue(), "3", `quantity preserved at ${width}`);
    eq(await price.inputValue(), "1250", `unit price preserved at ${width}`);
    for (const height of [480, 320]) {
      await page.setViewportSize({ width, height });
      await quantity.click();
      const focusedField = await quantity.evaluate(node => {
        const rect = node.getBoundingClientRect();
        const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
        return {visible:rect.top >= -1 && rect.bottom <= innerHeight + 1 && hit === node,top:rect.top,bottom:rect.bottom,hit:hit?.outerHTML.slice(0,300)};
      });
      if (!focusedField.visible) console.error({width,height,focusedField});
      eq(focusedField.visible, true, `focused quantity remains visible at ${width}x${height}`);
    }
    await page.setViewportSize({ width, height: 900 });

    await workbar.getByRole("button", { name: "Legg til vare", exact: true }).click();
    eq(await page.locator(".store-product-container").count(), 2, `add item uses existing state callback at ${width}`);
    let active = page.locator(".store-product-container.is-open");
    await active.getByLabel("Varenavn *", { exact: true }).fill("Ny syntetisk vare");
    const nextPrice = active.getByLabel(/^Pris pr\. enhet inkl\. mva\./);
    await nextPrice.fill("250");
    await nextPrice.press("Enter");
    eq(await page.locator(".store-product-container").count(), 3, `Enter in price adds the next item at ${width}`);
    active = page.locator(".store-product-container.is-open");
    await active.getByLabel("Varenavn *", { exact: true }).fill("Tastaturvare");
    await active.getByLabel(/^Pris pr\. enhet inkl\. mva\./).fill("300");
    const roomsBefore = await page.locator(".store-room").count();
    await workbar.getByRole("button", { name: "Legg til avsnitt", exact: true }).click();
    eq(await page.locator(".store-room").count(), roomsBefore + 1, `add section preserves the ungrouped items at ${width}`);
    eq(await page.getByLabel("Avsnittsnavn", { exact: true }).count(), 1, `one editable named section added at ${width}`);
    await page.getByLabel("Avsnittsnavn", { exact: true }).fill("Bad og vaskerom – syntetisk avsnitt med lang tittel");
    await assertLayout("new items and section");
    await page.getByRole("button", { name: "Lagre tilbud", exact: true }).click();
    eq(await page.evaluate(() => window.qa.calls.map(call => call.name)), ["save"], `only the original save callback fires at ${width}`);
    eq(await page.evaluate(() => window.qa.calls[0].form.lines.find(line => line.id === "qa-product")), before.lines.find(line => line.id === "qa-product"), `saving keeps existing product values at ${width}`);
    await page.locator(".sales-header").getByRole("button", { name: "Tilbake", exact: true }).click();
    eq(await page.evaluate(() => window.qa.calls.map(call => call.name)), ["save", "back"], `original back callback at ${width}`);
    eq(await page.evaluate(() => window.qa.templateCalls), ["load"], `template reads remain synthetic at ${width}`);
    eq(network, [], `no external transport at ${width}`);
    eq(errors, [], `no runtime errors at ${width}`);
    if (process.env.SALES_STORE_LAYOUT_QA_OUTPUT) {
      fs.mkdirSync(process.env.SALES_STORE_LAYOUT_QA_OUTPUT, { recursive: true });
      await page.screenshot({ path: path.join(process.env.SALES_STORE_LAYOUT_QA_OUTPUT, `general-offer-${width}.png`), fullPage: true });
    }
    await page.close();
  }
  console.log(`PASS general offer design layout: ${checks} checks; actual Grouped editor, real shell/styles, six widths, short screens, item details/value preservation, price Enter, add item/section and original save/back callbacks. All transport and template writes are synthetic/blocked; not a live portal, database or Safari test.`);
} finally {
  await browser?.close();
  fs.rmSync(temp, { recursive: true, force: true });
}
