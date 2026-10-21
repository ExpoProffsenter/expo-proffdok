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
import React from '${cwd}/node_modules/react/index.js';import {createRoot} from '${cwd}/node_modules/react-dom/client.js';import Deliveries from '${cwd}/src/modules/bolig/BoligDeliveries.jsx';import OrderDraft from '${cwd}/src/modules/bolig/BoligOrderDraft.jsx';import '${cwd}/src/style.css';import '${cwd}/src/modules/ui/appUxReview.css';import '${cwd}/src/modules/bolig/bolig.css';
const ctx={user_id:'qa',company_id:'firm',role:'manager',enabled:true},root={id:'root',reference:'00420',title:'QA Boligprosjekt'},unit={id:'unit',number:'H0101'};
const goods=[{key:'a',name:'Servant',sku:'00123',quantity:2.5,unit:'stk',room_name:'Bad 1'},{key:'b',name:'Flis',sku:'00456',quantity:1,unit:'m²',room_name:'Bad 2'}];
const draft={revision:1,source_choice_revision:1,snapshot:{goods}};
let state={context:ctx,root_id:'root',unit_id:'unit',revision:0,settings:{address:'',note:''},unit_settings:{address_mode:'common',address:'',order_mode:'combined',delivery_mode:'combined'},orders:[],events:[]};
window.__calls=[];window.__hold=false;window.__sendFail=false;window.__sends=[];window.__client={auth:{getSession:async()=>({data:{session:{access_token:'qa'}}})},rpc:async(name,args)=>{window.__calls.push({name,args});if(window.__hold)await new Promise(r=>window.__release=r);
if(name==='bolig_order_draft'){return {data:{context:ctx,root_id:'root',unit_id:'unit',selection:{revision:1,snapshot:{goods}},draft:{...draft,revision:args.p_action==='save'?2:1,snapshot:{goods,selected_positions:[0,1],excluded_count:0}}}};}
if(name==='bolig_order_mail'){const o=state.orders.find(o=>o.id===args.p_payload.order_id);return {data:{id:args.p_payload.request_id,sent:false,snapshot:{...o.snapshot,to:args.p_payload.to,company:{companyName:'QA Firma'},replyTo:'qa@example.invalid',order_id:o.id,order_number:o.number,goods:o.snapshot.goods.map((g,i)=>({...g,supplier:args.p_payload.fag[i]}))}}};}
if(name!=='bolig_deliveries')return {error:{message:'unexpected '+name}};const p=args.p_payload;
if(args.p_action==='create' && window.__rejectCreate)return {error:{code:'22023',message:'QA: Kontroller bestillingen'}};
if(args.p_action!=='get') {if(p.revision!==state.revision)return {error:{code:'PT409',message:'Endret grunnlag'}};
if(args.p_action==='settings')state.settings=p.settings;
if(args.p_action==='unit_settings')state.unit_settings=p.settings;
if(args.p_action==='create')state.orders.unshift({id:'order'+state.orders.length,number:'B-'+(state.revision+1),status:'prepared',source_choice_revision:1,received:{},snapshot:{goods:goods.filter((_,i)=>p.positions.includes(i)),reference:p.reference,supplier:p.supplier,supplier_reference:p.supplier_reference,address:state.unit_settings.address_mode==='common'?state.settings.address:state.unit_settings.address,requested_date:p.requested_date,note:p.note,delivery_mode:state.unit_settings.delivery_mode,identity:{project:'QA Boligprosjekt',number:'H0101',block:'Blokk A',address:'Gate 1A'}}});
if(args.p_action==='ordered')Object.assign(state.orders.find(o=>o.id===p.order_id),{status:'ordered',ordered_at:p.date});
if(args.p_action==='receive'){const o=state.orders.find(o=>o.id===p.order_id);p.lines.forEach(l=>o.received[l.position]=Number(o.received[l.position]||0)+l.quantity);o.status=o.snapshot.goods.every((g,i)=>o.received[i]===g.quantity)?'delivered':'partial';}
if(args.p_action==='supplier_reference')state.orders.find(o=>o.id===p.order_id).snapshot.supplier_reference=p.supplier_reference;
state.revision++;}return {data:structuredClone(state)};}};
window.fetch=async(url,args)=>{window.__sends.push(JSON.parse(args.body));if(window.__sendFail)throw Error('Mistet nettverkssvar');return {ok:true,json:async()=>({ok:true})};};
const app=createRoot(document.getElementById('app'));window.__render=(role='manager',company='firm')=>app.render(<div className="bolig-dialog" style={{padding:20,maxWidth:950,margin:'auto'}}><Deliveries context={{...ctx,role,company_id:company}} root={root} unit={unit} draft={draft} choiceRevision={1}/></div>);window.__renderDraft=()=>{state={...state,revision:0,orders:[],settings:{address:'',note:''},unit_settings:{...state.unit_settings,address_mode:'common',address:''}};app.render(<OrderDraft context={ctx} root={root} unit={unit} choiceRevision={1}/>);};window.__render();
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
  await page.getByText("Ingen bestillinger ennå", { exact: true }).waitFor();
  eq(await button("Klargjør bestilling").isEnabled(), true);
  await button("Leveringsoppsett").click();
  let d = dialog("Leveringsoppsett");
  await d
    .getByLabel("Felles leveringsadresse", { exact: true })
    .fill("Gate 1\n0123 Oslo");
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  eq(
    await d.getByLabel("Felles leveringsadresse", { exact: true }).inputValue(),
    "Gate 1\n0123 Oslo",
  );
  await d
    .getByRole("button", { name: "Lagre endringer", exact: true })
    .nth(0)
    .click();
  await d.waitFor({ state: "hidden" });
  eq(
    (await page.locator(".bolig-delivery-summary").innerText()).includes(
      "Gate 1",
    ),
    true,
  );
  await button("Leveringsoppsett").click();
  d = dialog("Leveringsoppsett");
  await d.getByLabel("Bestilling", { exact: true }).selectOption("split");
  await d.getByLabel("Levering", { exact: true }).selectOption("partial");
  await d
    .getByLabel("Leveringsadresse", { exact: true })
    .selectOption("individual");
  await d
    .getByLabel("Egen leveringsadresse", { exact: true })
    .fill("Boligadresse 2");
  await d
    .getByRole("button", { name: "Lagre endringer", exact: true })
    .nth(1)
    .click();
  await d.waitFor({ state: "hidden" });
  await button("Klargjør bestilling").click();
  d = dialog("Klargjør bestilling");
  await d.getByLabel("Leverandør", { exact: true }).fill("QA Grossist");
  await d.getByLabel("Ønsket leveringsdato (valgfritt)").fill("2026-11-12");
  eq(
    await d
      .getByLabel("Leverandørordrenummer (valgfritt)")
      .getAttribute("required"),
    null,
  );
  await d.getByRole("checkbox").nth(1).uncheck();
  await d.getByRole("checkbox").last().check();
  await button("Lukk og behold kladd").click();
  await button("Klargjør bestilling").click();
  d = dialog("Klargjør bestilling");
  eq(
    await d.getByLabel("Leverandør", { exact: true }).inputValue(),
    "QA Grossist",
  );
  await d.locator("details>summary").click();
  eq(await d.getByRole("checkbox").nth(1).isChecked(), false);
  for (const width of [320, 390, 1024, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    eq(
      await d.evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
      true,
      "no dialog overflow " + width,
    );
    await page.screenshot({
      path: path.join(temp, "order-" + width + ".png"),
      fullPage: true,
    });
  }
  await page.evaluate(() => (window.__rejectCreate = true));
  await button("Lagre og gå til sending").click();
  await d
    .getByRole("alert")
    .getByText("QA: Kontroller bestillingen", { exact: false })
    .waitFor();
  eq(
    await d.isVisible(),
    true,
    "A rejected save explains the problem inside the active dialog",
  );
  await page.evaluate(() => {
    window.__rejectCreate = false;
    window.__hold = true;
  });
  await button("Lagre og gå til sending").click();
  await page.waitForFunction(() => !!window.__release, null, {
    timeout: 10000,
  });
  await page.evaluate(() => {
    window.dispatchEvent(new Event("focus"));
    window.__hold = false;
    window.__release();
  });
  await dialog("Send bestilling").waitFor();
  eq(
    await page.evaluate(() => window.__sends.length),
    0,
    "Saving opens mail without sending",
  );
  await button("Lukk og behold kladd").click();
  eq(
    await button("Send bestilling · B-3").isVisible(),
    true,
    "Send remains visible with collapsed order",
  );
  eq(
    (await page.locator(".bolig-delivery-summary").innerText()).includes(
      "Boligadresse 2",
    ),
    true,
  );
  eq(await page.locator(".bolig-delivery-order").count(), 1);
  await page.locator(".bolig-delivery-order>summary").click();
  eq(
    await page.getByText("Ikke oppgitt (valgfritt)", { exact: false }).count(),
    1,
  );
  await button("Send bestilling på e-post").click();
  d = dialog("Send bestilling");
  await d.getByLabel("Leverandørens e-postadresse").fill("qa@example.invalid");
  await d.getByLabel("Vareleverandør: Servant", { exact: true }).fill("QA Rør");
  await button("Forhåndsvis e-post og vedlegg").click();
  await d.locator("iframe").waitFor();
  eq(await button("Last ned Excel-vedlegg").count(), 1);
  eq(await button("Last ned Cordel-vedlegg").count(), 1);
  eq(
    (await d.locator("iframe").getAttribute("srcdoc")).includes("H0101"),
    true,
  );
  const downloadPromise = page.waitForEvent("download");
  await button("Last ned Excel-vedlegg").click();
  const dl = await downloadPromise;
  eq(dl.suggestedFilename().endsWith(".xlsx"), true);
  await page.screenshot({
    path: path.join(temp, "email-preview.png"),
    fullPage: true,
  });
  await page.evaluate(() => (window.__sendFail = true));
  await button("Send bestilling med to vedlegg").click();
  await page.getByRole("alert").getByText("Mistet nettverkssvar").waitFor();
  eq(await button("Prøv samme sending igjen").count(), 1);
  eq(await button("Endre mottaker og vareleverandør").count(), 0);
  await page.evaluate(() => (window.__sendFail = false));
  await button("Prøv samme sending igjen").click();
  await page
    .getByText(
      "E-posttjenesten har bekreftet sendingen. Bestillingen er registrert som Bestilt.",
    )
    .waitFor();
  eq(
    await page.evaluate(
      () => window.__sends[0].requestId === window.__sends[1].requestId,
    ),
    true,
  );
  await button("Lukk og behold kladd").click();
  await button("Registrer som bestilt").click();
  d = dialog("Registrer som bestilt");
  await d.getByRole("checkbox").check();
  await button("Bekreft bestilt").click();
  await d.waitFor({ state: "hidden" });
  eq(await page.locator(".bolig-delivery-badge").innerText(), "Bestilt");
  await button("Registrer varemottak").click();
  d = dialog("Registrer varemottak");
  await d.getByLabel("Mottatt nå: Servant").fill("1.25");
  await button("Lagre varemottak").click();
  await d.waitFor({ state: "hidden" });
  eq(await page.locator(".bolig-delivery-badge").innerText(), "Delvis levert");
  await button("Registrer varemottak").click();
  await button("Fyll inn alt som gjenstår").click();
  await button("Lagre varemottak").click();
  await dialog("Registrer varemottak").waitFor({ state: "hidden" });
  eq(await page.locator(".bolig-delivery-badge").innerText(), "Levert");
  await page.evaluate(() => window.__render("reader"));
  // React root.render schedules the role change; the existing refresh button
  // is present in both roles and is not a completion signal.
  await button("Klargjør bestilling").waitFor({ state: "detached" });
  await button("Oppdater status").waitFor();
  eq(await button("Klargjør bestilling").count(), 0);
  eq(await button("Registrer varemottak").count(), 0);
  await page.evaluate(() => window.__renderDraft());
  await button("Lagre og fortsett").waitFor();
  await page.waitForFunction(
    () =>
      !document.querySelector('[aria-label="Bestillingsutkast"] fieldset')
        .disabled,
  );
  await button("Lagre og fortsett").click();
  d = dialog("Leveringsoppsett");
  await d.waitFor();
  eq(
    await d.isVisible(),
    true,
    "Saving goods opens address setup when missing",
  );
  await d
    .getByLabel("Felles leveringsadresse", { exact: true })
    .fill("QA Varemottak 1");
  await d
    .getByRole("button", { name: "Lagre endringer", exact: true })
    .first()
    .click();
  d = dialog("Klargjør bestilling");
  await d.waitFor();
  eq(
    await d.getByLabel("Vårt ordrenummer", { exact: true }).inputValue(),
    "00420",
    "Address save continues into the order review",
  );
  await button("Lukk og behold kladd").click();
  eq(errors, [], "no runtime errors");
  console.log(
    "PASS bolig delivery Chromium: " + checks + " assertions. " + temp,
  );
} finally {
  await browser?.close();
  await new Promise((r) => (server ? server.close(r) : r()));
}
