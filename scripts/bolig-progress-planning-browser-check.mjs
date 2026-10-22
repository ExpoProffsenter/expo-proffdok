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
const root = process.cwd(),
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bolig-progress-qa-")),
  entry = path.join(tmp, "entry.jsx");
let checks = 0;
const eq = (a, b, m) => {
  assert.deepEqual(a, b, m);
  checks++;
};
fs.writeFileSync(
  entry,
  `
import React from '${root}/node_modules/react/index.js';import {createRoot} from '${root}/node_modules/react-dom/client.js';import Progress from '${root}/src/modules/bolig/BoligProgress.jsx';import '${root}/src/style.css';import '${root}/src/modules/bolig/bolig.css';
const ctx={user_id:'qa',company_id:'firm',enabled:true,role:'manager'};let state={context:ctx,root_id:'root',unit_id:null,revision:0,tasks:[],units:[{id:'unit',number:'H0101',address:'Plangata 1',block_id:'b',block_name:'Bygg A',entrance_id:'e',floor:1,position:1},{id:'unit2',number:'H0102',address:'Plangata 1',block_id:'b',block_name:'Bygg A',entrance_id:'e',floor:1,position:2},{id:'unit3',number:'H0201',address:'Plangata 2',block_id:'b2',block_name:'Bygg B',entrance_id:'e2',floor:2,position:1}],rooms:[{id:'room',unit_id:'unit',name:'Bad'}],members:[{id:'qa',name:'QA Prosjektleder'}],notices:[],history:[],deliveries:[],mail_enabled:false};const receipts=new Map();window.__calls=[];window.__lost=false;window.__deny=false;window.__conflict=false;
window.__client={rpc(name,p){window.__calls.push(p);return Promise.resolve().then(()=>{if(window.__deny)return {error:{code:'42501',message:'Tilgangen er tilbakekalt.'}};if(p.p_action==='get')return {data:structuredClone({...state,context:{...ctx,role:window.__role||'manager'}})};const v=p.p_payload;if(window.__conflict)return {error:{code:'PT409',message:'Planen er endret. Utkastet er beholdt.'}};if(receipts.has(v.request_id))return {data:structuredClone(receipts.get(v.request_id))};state.revision++;
if(p.p_action==='batch'){for(const item of v.items){const at=state.tasks.findIndex(t=>t.id===item.id);if(v.mode==='create'){const u=state.units.find(u=>u.id===item.unit_id);state.tasks.push({...item,status:'planned',active:true,owner_active:true,owner_name:'QA Prosjektleder',unit_number:u.number,address:u.address,actual_start:null,actual_end:null});}else Object.assign(state.tasks[at],item);}state.notices.forEach(n=>{n.current=false;n.valid=false;});} if(p.p_action==='save'){const i=state.tasks.findIndex(t=>t.id===v.id);const t={...v,active:true,owner_active:true,owner_name:'QA Prosjektleder',room_name:v.room_id?'Bad':null,unit_number:'H0101'};if(i<0)state.tasks.push(t);else state.tasks[i]=t;}
if(p.p_action==='notice')state.notices.unshift({...v,basis:'review-'+state.revision,current:true,valid:false,recipient:'qa@example.invalid',title:state.tasks[0].title,unit_number:'H0101',planned_start:state.tasks[0].planned_start,planned_end:state.tasks[0].planned_end});
if(p.p_action==='approve')state.notices.find(n=>n.id===v.id).valid=true;if(p.p_action==='publish')state.notices.find(n=>n.id===v.id).published_at=new Date().toISOString();
if(p.p_action==='withdraw')state.notices.find(n=>n.id===v.id).withdrawn=true;
const result=structuredClone(state);receipts.set(v.request_id,result);if(window.__lost){window.__lost=false;throw Error('Forbindelsen ble brutt.');}return {data:result};});}};
window.__state=()=>structuredClone(state);window.__bump=()=>{state.revision++;window.dispatchEvent(new Event('focus'));};window.__stale=()=>{state.notices.forEach(n=>{n.current=false;n.valid=false;});state.revision++;};
const app=createRoot(document.getElementById('app'));window.__show=(role='manager')=>{window.__role=role;app.render(<div style={{maxWidth:1100,margin:'auto',padding:16}}><Progress key={role} context={{...ctx,role}} root={{id:'root'}}/></div>);};window.__show();
`,
);
let server, browser, page;
try {
  await build({
    configFile: false,
    root: tmp,
    logLevel: "silent",
    plugins: [
      react({ jsxRuntime: "classic" }),
      {
        name: "qa",
        enforce: "pre",
        resolveId(id) {
          if (id.endsWith("appSupabaseClientRegistry.js")) return "\0qa";
        },
        load(id) {
          if (id === "\0qa")
            return "export const getAppSupabaseClient=()=>window.__client;";
        },
      },
    ],
    define: { "process.env.NODE_ENV": '"production"' },
    build: {
      outDir: path.join(tmp, "dist"),
      rollupOptions: { input: entry },
      minify: false,
    },
  });
  const out = path.join(tmp, "dist");
  let js = fs
    .readdirSync(path.join(out, "assets"))
    .find((n) => n.endsWith(".js"));
  const css = fs
    .readdirSync(path.join(out, "assets"))
    .filter((n) => n.endsWith(".css"));
  server = http.createServer((req, res) => {
    if (req.url === "/") {
      res.setHeader("content-type", "text/html");
      res.end(
        '<!doctype html><html><meta name="viewport" content="width=device-width,initial-scale=1">' +
          css
            .map((c) => '<link rel="stylesheet" href="/assets/' + c + '">')
            .join("") +
          '<div id="app"></div><script type="module" src="/assets/' +
          js +
          '"></script></html>',
      );
      return;
    }
    const file = path.join(out, req.url);
    res.setHeader(
      "content-type",
      file.endsWith(".css") ? "text/css" : "text/javascript",
    );
    res.end(fs.readFileSync(file));
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ["--no-sandbox"],
  });
  page = await browser.newPage({
    viewport: { width: 1366, height: 950 },
  });
  page.setDefaultTimeout(7000);
  let errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:" + server.address().port);

  await page.getByRole("heading", { name: "Fremdrift og varsler" }).waitFor();
  const button = (name) => page.getByRole("button", { name, exact: true });
  await button("Planlegg flere boliger").click();
  let d = page.getByRole("dialog", {
    name: "Planlegg flere boliger",
    exact: true,
  });
  await d.getByLabel("Bygg", { exact: true }).selectOption("b");
  await d
    .getByRole("button", { name: "Velg alle treff (2)", exact: true })
    .click();
  await d.getByLabel("Første oppstart", { exact: true }).fill("2026-10-23");
  await d.getByLabel("Dager mellom boligstarter").fill("2");
  await d.getByLabel("Arbeid 1", { exact: true }).fill("Riving");
  await d.getByLabel("Varighet 1", { exact: true }).fill("2");
  await d.getByLabel("Legg til standardaktivitet").selectOption("rorlegger");
  eq(
    await d.getByLabel("Arbeid 2", { exact: true }).inputValue(),
    "Rørlegger",
    "Reused standard activity names",
  );
  await page.evaluate(() => {
    window.dispatchEvent(new Event("focus"));
    window.dispatchEvent(new Event("expo-work-profile-changed"));
  });
  eq(
    await d.getByLabel("Arbeid 1", { exact: true }).inputValue(),
    "Riving",
    "Focus preserves batch form",
  );
  await d.getByRole("button", { name: "Lukk og behold utkast" }).click();
  await page.reload();
  await button("Fortsett masseoppsett").click();
  d = page.getByRole("dialog", { name: "Planlegg flere boliger", exact: true });
  eq(
    await d.getByLabel("Arbeid 1", { exact: true }).inputValue(),
    "Riving",
    "Reload preserves batch form",
  );
  await d.getByRole("button", { name: "Forhåndsvis planen" }).click();
  eq(
    await d.locator("tbody tr").count(),
    4,
    "Two apartments × two activities reviewed",
  );
  eq(
    (await d.locator("tbody tr").first().innerText()).includes("23.10.2026"),
    true,
    "Dates shown before save",
  );
  eq(
    await page.evaluate(
      () => window.__calls.filter((c) => c.p_action === "batch").length,
    ),
    0,
    "Preview does not write",
  );
  await page.evaluate(() => (window.__lost = true));
  await d.getByRole("button", { name: "Lagre 4 aktiviteter samlet" }).click();
  await d.getByText("Forbindelsen ble brutt.", { exact: true }).waitFor();
  await d
    .getByRole("button", { name: "Lukk planlegg flere boliger", exact: true })
    .click();
  await button("Prøv samme lagring igjen").click();
  await page.getByText("Endringen er lagret.", { exact: true }).waitFor();
  eq(
    (await page.evaluate(() => window.__state())).tasks.length,
    4,
    "Replay does not duplicate batch",
  );
  const calls = await page.evaluate(() =>
    window.__calls.filter((c) => c.p_action === "batch"),
  );
  eq(
    calls[0].p_payload.request_id,
    calls[1].p_payload.request_id,
    "Exact retry identity",
  );
  await button("Flytt datoer samlet").click();
  d = page.getByRole("dialog", { name: "Flytt datoer samlet", exact: true });
  await d.getByLabel("Flytt antall dager").fill("3");
  await d.getByRole("button", { name: "Forhåndsvis planen" }).click();
  eq(await d.locator("tbody tr").count(), 4, "Group shift preview");
  await d.getByRole("button", { name: "Lagre 4 aktiviteter samlet" }).click();
  await d.waitFor({ state: "hidden" });
  await button("Åpne samlet tidslinje").click();
  const board = page.locator("dialog.ks-plan-expanded[open]");
  await board.waitFor();
  eq(
    await board.locator(".ks-timeline-row").count(),
    4,
    "Existing shared board reused",
  );
  eq(
    await board
      .getByRole("button", { name: "Bemanningsplan", exact: true })
      .count(),
    0,
    "No fabricated staffing",
  );
  eq(
    await board.getByRole("button", { name: "Dag", exact: true }).count(),
    0,
    "Dates only, no fabricated work times",
  );
  await board.getByRole("button", { name: "Til planen", exact: true }).click();
  const band = board.locator(".ks-plan-band-body").first();
  await band.focus();
  await band.press("Alt+ArrowRight");
  await board
    .getByRole("button", { name: "Lagre fremdriftsplan", exact: true })
    .waitFor();
  await board.getByRole("button", { name: "Angre", exact: true }).click();
  eq(
    await board.getByRole("button", { name: "Lagret", exact: true }).count(),
    1,
    "Shared timeline undo",
  );
  await band.focus();
  await band.press("Alt+ArrowRight");
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  eq(
    await board
      .getByRole("button", { name: "Lagre fremdriftsplan", exact: true })
      .isEnabled(),
    true,
    "Timeline draft survives fresh scoped read",
  );
  await board
    .getByRole("button", { name: "Lagre fremdriftsplan", exact: true })
    .click();
  d = page.getByRole("dialog", { name: "Se over datoendringer", exact: true });
  eq(
    await d.locator("tbody tr").count(),
    1,
    "Timeline edit reviewed as one task change",
  );
  await d
    .getByRole("button", { name: "Lagre datoendringer", exact: true })
    .click();
  await d.waitFor({ state: "hidden" });
  eq(
    (await page.evaluate(() => window.__state())).tasks[0].actual_start,
    null,
    "Timeline does not set actual execution",
  );
  await button("Åpne samlet tidslinje").click();
  await board.waitFor();
  eq(
    await board.getByRole("button", { name: "Måned", exact: true }).isVisible(),
    true,
    "Explicit reopen expands shared timeline",
  );
  await board
    .getByRole("button", { name: "Lukk planbygger", exact: true })
    .click();
  await button("Fortsett masseoppsett").click();
  d = page.getByRole("dialog", { name: "Planlegg flere boliger", exact: true });
  await d.getByRole("button", { name: "Forhåndsvis planen" }).click();
  await page.evaluate(() => window.__bump());
  await d
    .getByText("Fremdriften er endret. Gå tilbake og forhåndsvis på nytt.", {
      exact: true,
    })
    .waitFor();
  eq(
    await d
      .getByRole("button", { name: "Lagre 4 aktiviteter samlet" })
      .isDisabled(),
    true,
    "Stale review cannot overwrite new plan",
  );
  await d.getByRole("button", { name: "Tilbake til oppsett" }).click();
  await d.getByRole("button", { name: "Lukk og behold utkast" }).click();
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 850 });
    await button("Fortsett masseoppsett").click();
    d = page.getByRole("dialog", {
      name: "Planlegg flere boliger",
      exact: true,
    });
    eq(
      await d.evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
      true,
      "Mobile dialog width " + width,
    );
    await d.getByRole("button", { name: "Forhåndsvis planen" }).click();
    eq(await d.locator("tbody tr").count(), 4, "Mobile review " + width);
    await d
      .getByRole("button", { name: "Lukk planlegg flere boliger", exact: true })
      .click();
  }
  await page.evaluate(() => window.__show("reader"));
  await button("Åpne samlet tidslinje").waitFor();
  eq(
    await button("Planlegg flere boliger").count(),
    0,
    "Reader has no batch editing",
  );
  await button("Åpne samlet tidslinje").click();
  await board.waitFor();
  eq(
    await board.getByText("Kun visning", { exact: true }).count(),
    1,
    "Reader shared board read-only",
  );
  await board.locator("button.ks-timeline-label").first().click();
  const inspected = page.getByRole("dialog", {
    name: "Aktivitet",
    exact: true,
  });
  await inspected.waitFor();
  eq(
    await inspected
      .getByText("Ansvarlig: QA Prosjektleder", { exact: true })
      .count(),
    1,
    "Reader opens actual Bolig task details",
  );
  await inspected.getByRole("button", { name: "Lukk", exact: true }).click();
  await button("Åpne samlet tidslinje").click();
  await board.waitFor();
  await page.evaluate(() => {
    window.__deny = true;
    window.dispatchEvent(new Event("focus"));
  });
  await page.getByText("Tilgangen er tilbakekalt.", { exact: true }).waitFor();
  eq(
    await page.locator(".ks-timeline-row").count(),
    0,
    "Revocation removes timeline immediately",
  );
  eq(errors, [], "No browser errors");
  console.log(`PASS bolig bulk/timeline Chromium: ${checks} assertions`);
} catch (e) {
  console.log((await page?.locator("body").innerText())?.slice(-5000));
  await page?.screenshot({
    path: path.join(tmp, "failure.png"),
    fullPage: true,
  });
  console.log("Failure screenshot: " + tmp);
  throw e;
} finally {
  await browser?.close();
  await new Promise((r) => (server ? server.close(r) : r()));
}
