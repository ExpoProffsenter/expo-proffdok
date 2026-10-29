import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import { build } from "vite";
import react from "@vitejs/plugin-react";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const root = process.cwd(), temp = fs.mkdtempSync(path.join(os.tmpdir(), "sales-handler-ui-"));
let checks = 0, browser;
const eq = (a, b, label) => { assert.deepEqual(a, b, label); checks++; };
fs.writeFileSync(path.join(temp, "entry.jsx"), `
import React,{useState} from '${root}/node_modules/react/index.js';
import {createRoot} from '${root}/node_modules/react-dom/client.js';
import Form from '${root}/src/modules/sales/components/SalesRequestForm.jsx';
import Control from '${root}/src/modules/sales/components/SalesCaseHandlerControl.jsx';
import {salesCaseHandlerFields} from '${root}/src/modules/sales/services/salesCaseHandlers.js';
import '${root}/src/style.css';import '${root}/src/modules/sales/sales.css';
const candidates=[{userId:'person-a',displayName:'QA Saksbehandler',email:'a@example.invalid'},{userId:'person-b',displayName:'QA Saksbehandler',email:'b@example.invalid'}];
window.calls=[];window.support=false;window.stale=false;
const client={rpc:async(name,args)=>{window.calls.push({name,args});if(name==='sales_case_handler_candidates')return {data:candidates};if(name==='sales_set_case_handler'){if(window.deferSet)await new Promise(resolve=>window.finishSet=resolve);return window.stale?{error:{code:'PT409',message:'Saksbehandleren er endret. Hent saken på nytt før du velger.'}}:{data:{...candidates.find(p=>p.userId===args.p_user_id),revision:args.p_expected_revision+1}};}throw Error('Unexpected RPC');}};
function App(){const [form,setForm]=useState({customer:'QA Kunde',phone:'',email:'customer@example.invalid',address:'QA gate',postnr:'0001',city:'Oslo',title:'Modernisering av bad',source:'Telefon',note:''}),[request,setRequest]=useState({id:'QA-1',status:'Akseptert',responsible:'Gammelt fritekstnavn',responsibleRevision:0}),[view,setView]=useState('form');
window.view=value=>setView(value);window.setSupport=value=>{window.support=value;setView('empty');};
return <div className="sales-app"><button onClick={()=>setView('form')}>Skjema QA</button><button onClick={()=>setView('case')}>Sak QA</button>{view==='form'?<Form form={form} isDirectOffer onBack={()=>{}} onCancel={()=>{}} onUpdateForm={(key,value)=>setForm(f=>({...f,[key]:value}))} caseHandlerClient={client} caseHandlerCompanyId="qa-company" onChooseCaseHandler={handler=>setForm(f=>({...f,responsibleUserId:handler.userId,responsibleName:handler.displayName}))} onSubmit={event=>{event.preventDefault();window.submitted=form;}}/>:view==='case'?<Control request={request} client={client} companyId="qa-company" storeOffer={false} onSaved={handler=>{window.saved=handler;setRequest(r=>({...r,...salesCaseHandlerFields(handler)}));}}/>:null}</div>;
}createRoot(document.getElementById('app')).render(<App/>);
`);
const bundle = await build({ configFile: false, root, define: { "process.env.NODE_ENV": '"production"' }, logLevel: "silent", resolve: { alias: { react: path.join(root, "node_modules/react"), "react-dom": path.join(root, "node_modules/react-dom") } }, plugins: [react(), {
  name: "isolated-handler-transport", enforce: "pre",
  resolveId(id) {
    if (id.endsWith("/salesSupabase.js")) return "\0transport";
    if (id.endsWith("/salesLocalStorage.js")) return "\0storage";
    if (id.endsWith("/CompanyCustomerPicker.jsx")) return "\0customers";
  },
  load(id) {
    if (id === "\0transport") return 'export const getSalesSupportCompanyId=()=>window.support?"qa-company":"";';
    if (id === "\0storage") return 'export const loadSalesEntryDraft=()=>null;export const saveSalesEntryDraft=()=>{};';
    if (id === "\0customers") return 'export const CompanyCustomerProvider=({children})=>children;export const CompanyCustomerSearch=()=>null;export const CompanyCustomerSave=()=>null;';
  },
}], build: { write: false, minify: false, rollupOptions: { input: path.join(temp, "entry.jsx"), output: { inlineDynamicImports: true } } } });
const files = bundle.output;
const server = http.createServer((req, res) => {
  if (req.url === "/") { res.setHeader("Content-Type", "text/html"); res.end('<div id="app"></div><script type="module" src="/entry.js"></script><link rel="stylesheet" href="/style.css">'); return; }
  const file = req.url === "/entry.js" ? files.find(file => file.type === "chunk") : files.find(file => file.fileName.endsWith(".css"));
  res.setHeader("Content-Type", req.url === "/entry.js" ? "application/javascript" : "text/css"); res.end(file?.code || file?.source || "");
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
try {
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } }), errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.route("**/*", route => route.request().url().startsWith(`http://127.0.0.1:${server.address().port}/`) ? route.continue() : route.abort("blockedbyclient"));
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  const select = page.getByRole("combobox", { name: "Saksbehandler", exact: true });
  await select.locator('option[value="person-b"]').waitFor({ state: "attached" });
  eq(await select.inputValue(), "", "new case requires explicit selection");
  eq(await select.locator("option").allTextContents(), ["Velg saksbehandler", "QA Saksbehandler (a@example.invalid)", "QA Saksbehandler (b@example.invalid)"], "identical names remain distinguishable by email");
  await page.getByRole("button", { name: "Opprett våtromstilbud", exact: true }).click();
  eq(await page.evaluate(() => Boolean(window.submitted)), false, "native required blocks unbound creation");
  await select.selectOption("person-b");
  await page.getByRole("button", { name: "Opprett våtromstilbud", exact: true }).click();
  eq(await page.evaluate(() => [window.submitted.responsibleUserId, window.submitted.responsibleName]), ["person-b", "QA Saksbehandler"], "UUID and label travel together through actual form");
  await page.getByRole("button", { name: "Sak QA", exact: true }).click();
  await page.getByText(/Saken mangler en bekreftet saksbehandler/).waitFor();
  eq(await page.getByRole("button", { name: "Lagre saksbehandler", exact: true }).isEnabled(), false, "legacy case is not silently assigned");
  await select.selectOption("person-a");
  await page.getByRole("button", { name: "Lagre saksbehandler", exact: true }).click();
  await page.waitForFunction(() => window.saved?.revision === 1);
  eq(await page.evaluate(() => window.calls.filter(call => call.name === "sales_set_case_handler").at(-1).args), { p_company_id: "qa-company", p_request_ref: "QA-1", p_user_id: "person-a", p_expected_revision: 0 }, "accepted legacy case explicitly binds revision0 with selected UUID");
  await page.evaluate(() => { window.stale = true; });
  await select.selectOption("person-b");
  await page.getByRole("button", { name: "Lagre saksbehandler", exact: true }).click();
  await page.getByRole("alert").filter({ hasText: "Saksbehandleren er endret" }).waitFor();
  eq(await page.evaluate(() => window.saved.userId), "person-a", "stale set never overwrites server-confirmed local binding");
  for (const width of [320, 390, 768, 1366]) {
    await page.setViewportSize({ width, height: 844 });
    eq(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, "case handler section fits " + width);
    eq(await select.evaluate(element => parseFloat(getComputedStyle(element).fontSize) >= 16), true, "legible selector " + width);
    eq((await page.getByRole("button", { name: "Lagre saksbehandler", exact: true }).boundingBox()).height >= 44, true, "save target44 " + width);
  }
  await page.evaluate(() => { window.stale = false; window.deferSet = true; });
  await select.selectOption("person-b");
  await page.getByRole("button", { name: "Lagre saksbehandler", exact: true }).click();
  await page.waitForFunction(() => typeof window.finishSet === "function");
  await page.getByRole("button", { name: "Skjema QA", exact: true }).click();
  await page.getByRole("region", { name: "Saksbehandler for akseptvarsel" }).waitFor({ state: "detached" });
  await page.evaluate(() => window.finishSet());
  await page.waitForFunction(() => window.calls.filter(call => call.name === "sales_set_case_handler").length === 3);
  eq(await page.evaluate(() => window.saved.userId), "person-a", "late assignment response after deliberate navigation cannot change local scope");
  const before = await page.evaluate(() => window.calls.length);
  await page.evaluate(() => window.setSupport(true));
  await page.getByRole("region", { name: "Saksbehandler for akseptvarsel" }).waitFor({ state: "detached" });
  await page.evaluate(() => window.view('case'));
  await page.getByText("Saksbehandler kan bare endres i firmaets ordinære arbeidsflate.").waitFor();
  eq(await select.count(), 0, "support cannot choose a handler");
  eq(await page.evaluate(() => window.calls.length), before, "support never fetches or changes assignments");
  eq(errors, [], "no browser runtime errors");
  console.log(`PASS sales case-handler UI: ${checks} Chromium checks; actual form/control, synthetic RPC, all external transport blocked.`);
} finally { await browser?.close(); server.close(); fs.rmSync(temp, { recursive: true, force: true }); }
