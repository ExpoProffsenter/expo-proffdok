import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import { build } from "vite";
import react from "@vitejs/plugin-react";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const cwd = process.cwd(),
  temp = fs.mkdtempSync(path.join(os.tmpdir(), "bolig-deliveries-"));
fs.writeFileSync(
  path.join(temp, "entry.jsx"),
  `
import React from '${cwd}/node_modules/react/index.js';import {createRoot} from '${cwd}/node_modules/react-dom/client.js';
import Completion from '${cwd}/src/modules/bolig/BoligCompletion.jsx';
import '${cwd}/src/style.css';import '${cwd}/src/modules/bolig/bolig.css';
const ctx={user_id:'qa',company_id:'firm',role:'manager',enabled:true},root={id:'root',title:'QA Prosjekt'};
const initial=()=>({scope_id:'unit',kind:'unit',parent_id:'block',title:'H0101 · QA kontrollgate',revision:0,basis:'basis0',source_basis:'source0',source:{issues:[]},status:'not_started',items:[],issues:['Avklar kontrollene'],done:0,total:0,owner_id:'qa',owner_name:'QA Leder',approval:null,handover:null});
let row=initial(),history=[],managed={revision:0,basis:"review0",cases:[],assessment:null,record:null,history:[]};window.__reset=()=>{row=initial();row.restpoints=[{scope_id:'unit',source:'QA Kontroll',title:'Mindre justering',comment:'Rosett justeres'}];row.warnings=['Valgfri liste er under arbeid'];row.source.evidence={checks:2,required_checks:1,completed_required:1,critical:0,minor:1,documents:3,photos:2,fdv:4,fdv_missing:1};history=[];managed={revision:0,basis:'review0',cases:[],assessment:null,record:null,history:[]};};
window.__reject=false;window.__foreign=false;window.__calls=[];window.__hold=false;
const state=()=>({context:ctx,root_id:'root',scope_id:'unit',rows:[{...structuredClone(row),kind:window.__asParent?'block':'unit'},...(window.__asParent?[{scope_id:'child2',parent_id:'unit',kind:'unit',title:'H0102',status:'not_started',issues:['Avklar kontrollene']},{scope_id:'child1',parent_id:'unit',kind:'unit',title:'H0101',status:'ready',issues:[]}]:[])],history,members:[{id:'qa',name:'QA Leder'}],rooms:[{id:'bath',name:'Bad 1'}]});
window.__client={rpc:async(name,args)=>{window.__calls.push({name,args});if(window.__hold)await new Promise(r=>window.__release=r);if(window.__foreign)return {data:{...state(),context:{...ctx,company_id:'wrong'}}};if(name==='bolig_handover_review'){if(args.p_action==='record'){managed.revision++;managed.record={reference:args.p_payload.reference,date:args.p_payload.date,by_name:'QA Leder',at:'2026-10-23T10:00:00Z'};managed.assessment={basis:managed.basis,by_name:'QA Leder',decisions:[]};managed.history.unshift({revision:managed.revision,actor_name:'QA Leder',created_at:'2026-10-23T10:00:00Z',action:'record',snapshot:structuredClone(managed)});row.handover=managed.record;row.status='handed_over';row.manager_handover=true;}return {data:{context:ctx,root_id:'root',scope_id:'unit',...structuredClone(managed),members:[{id:'qa',name:'QA Leder'}]}};}if(args.p_action==='get')return {data:state()};if(window.__reject)return {error:{code:'PT409',message:'QA: Grunnlaget er endret. Kladden er beholdt.'}};
const p=args.p_payload;
if(args.p_action==='start')row.items=['Arbeidet er utført','Sjekklister og kontroller er fullført','Avvik og mangler er avklart','Bilder er kontrollert','Sluttdokumentasjon er kontrollert'].map((title,i)=>({id:'item'+i,title,kind:i?'documents':'execution',done:false,valid:false,evidence:''}));
if(args.p_action==='review_all')row.items=row.items.map(i=>({...i,done:true,valid:true,evidence:p.note||'Samlet gjennomgang'}));
if(args.p_action==='item')row.items=row.items.map(i=>i.id===p.id?{...i,done:p.done,valid:p.done,evidence:p.evidence,by_name:'QA Leder',at:'2026-10-22T10:00:00Z'}:i);
if(args.p_action==='add')row.items.push({...p,valid:p.done});
if(args.p_action==='approve')row.approval={by_name:'QA Leder',at:'2026-10-22T10:00:00Z'};
if(args.p_action==='handover')row.handover={reference:p.reason,at:'2026-10-22T10:00:00Z'};
if(args.p_action==='reopen'){row.approval=null;row.handover=managed.record;}
row.done=row.items.filter(i=>i.valid).length;row.total=row.items.length;row.issues=row.items.filter(i=>!i.valid).map(i=>i.title+': dokumentasjon mangler.');row.status=row.handover?(row.restpoints?.length?'handed_over_with_rest':'handed_over'):row.approval?(row.restpoints?.length?'ready_with_rest':'ready'):row.done===row.total?'controlled':row.items[0]?.valid?'executed':'in_progress';row.revision++;row.basis='basis'+row.revision;
history=[{id:row.revision,action:args.p_action,actor_name:'QA Leder',at:'2026-10-22T10:00:00Z',reason:p.reason},...history];return {data:state()};}};
const app=createRoot(document.getElementById('app'));window.__show=(role='manager')=>app.render(<div className="bolig-dialog" data-qa-role={role} style={{position:'static',display:'block',maxWidth:850,margin:'auto'}}><Completion key={role} context={{...ctx,role}} root={root} scopeId="unit"/></div>);window.__show();
`,
);
let server,
  browser,
  checks = 0;
const eq = (a, b, m) => {
  assert.deepEqual(a, b, m);
  checks++;
};
try {
  const r = await build({
    root: cwd,
    configFile: false,
    define: {
      "process.env.NODE_ENV": '"production"',
      "import.meta.env.VITE_SUPABASE_URL": '"https://qa.supabase.co"',
      "import.meta.env.VITE_SUPABASE_ANON_KEY": '"qa"',
    },
    logLevel: "silent",
    plugins: [
      react({ jsxRuntime: "classic" }),
      {
        name: "mock",
        enforce: "pre",
        resolveId(id) {
          if (id.endsWith("appSupabaseClientRegistry.js")) return "\0mock";
        },
        load(id) {
          if (id === "\0mock")
            return "export const getAppSupabaseClient=()=>window.__client;";
        },
      },
    ],
    build: {
      write: false,
      minify: false,
      lib: {
        entry: path.join(temp, "entry.jsx"),
        formats: ["iife"],
        name: "Qa",
        cssFileName: "qa",
      },
    },
  });
  const out = (Array.isArray(r) ? r[0] : r).output,
    script = out.find((x) => x.type === "chunk").code,
    css = out
      .filter((x) => x.type === "asset" && x.fileName.endsWith(".css"))
      .map((x) => x.source)
      .join("\n");
  server = http.createServer((req, res) => {
    if (req.url === "/app.js") {
      res.setHeader("content-type", "text/javascript");
      res.end(script);
    } else if (req.url === "/app.css") {
      res.setHeader("content-type", "text/css");
      res.end(css);
    } else
      res.end(
        '<!doctype html><html lang="nb"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"><div id="app"></div><script src="/app.js"></script></html>',
      );
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? {
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
          args: ["--no-sandbox"],
        }
      : {}),
  });
  const page = await browser.newPage({
      viewport: { width: 1366, height: 900 },
    }),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:" + server.address().port);
  const button = (name) => page.getByRole("button", { name, exact: true }),
    dialog = (name) => page.getByRole("dialog", { name, exact: true });
  const area = page.getByRole("region", { name: "Dokumentert ferdigstilling" });
  await button("Opprett kontrollplan").click();
  await area.locator(".bolig-completion-proof-details > summary").click();
  eq(
    await button("Godkjenn intern sluttkontroll").isEnabled(),
    false,
    "Unfinished proof cannot approve",
  );
  const first = area.getByRole("button", { name: /Arbeidet er utført/ });
  await first.click();
  await page
    .getByLabel("Dokumentreferanse og kontrollbeskrivelse")
    .fill("QA utførelse protokoll 1");
  await page.getByLabel("Kontrollen er utført og dokumentert").check();
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  eq(
    await page
      .getByLabel("Dokumentreferanse og kontrollbeskrivelse")
      .inputValue(),
    "QA utførelse protokoll 1",
    "Focus preserves unsent evidence",
  );
  await button("Avbryt og behold kladd").click();
  await first.click();
  eq(
    await page
      .getByLabel("Dokumentreferanse og kontrollbeskrivelse")
      .inputValue(),
    "QA utførelse protokoll 1",
    "Closed draft restored",
  );
  for (const width of [320, 390, 1024, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    eq(
      await page
        .getByRole("dialog", { name: "Dokumenter kontroll", exact: true })
        .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
      true,
      "No completion overflow " + width,
    );
    eq(
      await page
        .getByLabel("Dokumentreferanse og kontrollbeskrivelse")
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize) >= 16),
      true,
      "Readable evidence " + width,
    );
  }
  await page.evaluate(() => (window.__reject = true));
  await button("Lagre kontroll").click();
  await page.getByRole("alert").waitFor();
  eq(
    await page
      .getByLabel("Dokumentreferanse og kontrollbeskrivelse")
      .inputValue(),
    "QA utførelse protokoll 1",
    "Write failure retains proof",
  );
  await page.evaluate(() => (window.__reject = false));
  await button("Lagre kontroll").click();
  await area.getByRole("status").waitFor();
  for (const title of [
    "Sjekklister og kontroller er fullført",
    "Avvik og mangler er avklart",
    "Bilder er kontrollert",
    "Sluttdokumentasjon er kontrollert",
  ]) {
    await area.getByRole("button", { name: new RegExp(title) }).click();
    await page
      .getByLabel("Dokumentreferanse og kontrollbeskrivelse")
      .fill("QA dokument " + title);
    await page.getByLabel("Kontrollen er utført og dokumentert").check();
    await button("Lagre kontroll").click();
    await area.getByRole("status").waitFor();
  }
  eq(
    await button("Godkjenn intern sluttkontroll").isEnabled(),
    true,
    "Completed evidence enables approval",
  );
  await button("Godkjenn intern sluttkontroll").click();
  eq(
    await page.evaluate(
      () => window.__calls.filter((c) => c.args.p_action === "approve").length,
    ),
    0,
    "Review has no mutation",
  );
  await button("Bekreft godkjenning").click();
  await button("Registrer overtagelse").waitFor();
  eq(
    await area.getByRole("button", { name: /Arbeidet er utført/ }).isEnabled(),
    false,
    "Approved evidence locked",
  );
  await button("Registrer overtagelse").click();
  await page.getByLabel("Hva vil du lagre?").selectOption("record");
  await page
    .getByLabel("Referanse til gjennomført overtakelsesprotokoll")
    .fill("QA overtagelsesprotokoll 22 oktober");
  await page.getByLabel("Hva vil du lagre?").selectOption("record");
  await page.getByLabel("Jeg har gjennomgått alle åpne forhold og står for vurderingene ovenfor.").check();
  await button("Registrer gjennomført overtakelse").click();
  await area.getByText("Overtatt", { exact: true }).first().waitFor();
  await button("Gjenåpne med begrunnelse").click();
  await page.getByLabel("Begrunnelse").fill("QA endring krever ny kontroll");
  await button("Gjenåpne ferdigstilling").click();
  await button("Godkjenn intern sluttkontroll").waitFor();
  eq(
    await button("Registrer overtagelse").count(),
    0,
    "Legacy entry hidden after actual handover",
  );
  await area.getByText(/Historikk for vurdering og overtakelse ·/).click();
  eq(await area.getByRole("button",{name:/Overtakelse registrert \/ rettet/}).count(),1,"Past actual handover retained after internal reopening");
  await button("Legg til kontrollpunkt").click();
  await page.getByLabel("Navn på kontrollpunkt").fill("QA ekstra badkontroll");
  await page.getByLabel("Rom", { exact: true }).selectOption("bath");
  await button("Lagre kontroll").click();
  eq(
    await button("Godkjenn intern sluttkontroll").isEnabled(),
    false,
    "Added pending room control blocks approval",
  );
  const readerCallStart = await page.evaluate(() => window.__calls.length);
  await page.evaluate(() => window.__show("reader"));
  await page.locator('[data-qa-role="reader"]').getByRole("heading", {
    name: "H0101 · QA kontrollgate", exact: true,
  }).waitFor();
  eq(await button("Legg til kontrollpunkt").count(), 0, "Reader has no writes");
  eq(await page.evaluate(start => window.__calls.slice(start).filter(call => call.args.p_action !== "get").length, readerCallStart), 0, "Reader render makes no mutation calls");
  await page.evaluate(()=>{window.__reset();window.__show("manager");});
  await button("Opprett kontrollplan").click();
  eq(await area.locator(".bolig-completion-proof-details").getAttribute("open"),null,"Individual proof fields start collapsed");
  await button("Samlet gjennomgang").click();
  await page.getByLabel("Jeg har gjennomgått arbeidet, kontrollene, avvikene, bildene og sluttdokumentasjonen.",{exact:true}).check();
  await button("Lagre samlet gjennomgang").click();
  eq(await button("Godkjenn intern sluttkontroll").isEnabled(),true,"One explicit review covers core requirements without repeated text");
  await button("Godkjenn intern sluttkontroll").click();
  await button("Bekreft – klar med restpunkter").click();
  eq(await area.locator(".bolig-completion-badge").innerText(),"Klar med restpunkter","Minor items are disclosed in readiness status");
  eq(await button("Registrer overtagelse").isEnabled(),true,"Actual handover can be recorded with minor remaining work");
  await page.evaluate(() => {
    window.__asParent = true;
    window.__show("manager");
    window.dispatchEvent(new Event("focus"));
  });
  await page.locator(".bolig-completion-children strong").first().waitFor();
  eq(
    await page.locator(".bolig-completion-children strong").first().innerText(),
    "H0101",
    "Natural dwelling order",
  );
  eq(
    await page
      .locator(".bolig-completion-children strong")
      .first()
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
    16,
    "Readable dwelling title",
  );
  eq(
    await page
      .locator(".bolig-completion-children button")
      .first()
      .evaluate((el) => el.getBoundingClientRect().height >= 72),
    true,
    "Comfortable dwelling target",
  );
  await page.evaluate(() => window.__show("reader"));
  await page.evaluate(() => {
    window.__foreign = true;
    window.__show("manager");
  });
  await page.getByRole("alert").waitFor();
  eq(
    await page.getByText("QA utførelse protokoll 1", { exact: true }).count(),
    0,
    "Foreign context hides evidence",
  );
  eq(errors, [], "No runtime exceptions");
  console.log(
    "PASS completion Chromium: " +
      checks +
      " assertions; proof/draft/focus, review, handover/reopen/history, room requirements, responsive layout and access.",
  );
} finally {
  await browser?.close();
  await new Promise((r) => (server ? server.close(r) : r()));
}
