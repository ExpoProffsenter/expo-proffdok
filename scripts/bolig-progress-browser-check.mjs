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
const ctx={user_id:'qa',company_id:'firm',enabled:true,role:'manager'};let state={context:ctx,root_id:'root',unit_id:null,revision:0,tasks:[],units:[{id:'unit',number:'H0101',address:'Plangata 1'}],rooms:[{id:'room',unit_id:'unit',name:'Bad'}],members:[{id:'qa',name:'QA Prosjektleder'}],notices:[],history:[],deliveries:[],mail_enabled:false};const receipts=new Map();window.__calls=[];window.__lost=false;window.__deny=false;window.__conflict=false;
window.__client={rpc(name,p){window.__calls.push(p);return Promise.resolve().then(()=>{if(window.__deny)return {error:{code:'42501',message:'Tilgangen er tilbakekalt.'}};if(p.p_action==='get')return {data:structuredClone({...state,context:{...ctx,role:window.__role||'manager'}})};const v=p.p_payload;if(window.__conflict)return {error:{code:'PT409',message:'Planen er endret. Utkastet er beholdt.'}};if(receipts.has(v.request_id))return {data:structuredClone(receipts.get(v.request_id))};state.revision++;
if(p.p_action==='save'){const i=state.tasks.findIndex(t=>t.id===v.id);const t={...v,active:true,owner_active:true,owner_name:'QA Prosjektleder',room_name:v.room_id?'Bad':null,unit_number:'H0101'};if(i<0)state.tasks.push(t);else state.tasks[i]=t;}
if(p.p_action==='notice')state.notices.unshift({...v,basis:'review-'+state.revision,current:true,valid:false,recipient:'qa@example.invalid',title:state.tasks[0].title,unit_number:'H0101',planned_start:state.tasks[0].planned_start,planned_end:state.tasks[0].planned_end});
if(p.p_action==='approve')state.notices.find(n=>n.id===v.id).valid=true;if(p.p_action==='publish')state.notices.find(n=>n.id===v.id).published_at=new Date().toISOString();
if(p.p_action==='withdraw')state.notices.find(n=>n.id===v.id).withdrawn=true;
const result=structuredClone(state);receipts.set(v.request_id,result);if(window.__lost){window.__lost=false;throw Error('Forbindelsen ble brutt.');}return {data:result};});}};
window.__stale=()=>{state.notices.forEach(n=>{n.current=false;n.valid=false;});state.revision++;};
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
  eq(
    await page.getByText("Start med første aktivitet").isVisible(),
    true,
    "Clear empty state",
  );
  await page.getByRole("button", { name: "Ny aktivitet", exact: true }).click();
  let dialog = page.getByRole("dialog", {
    name: "Aktivitet og faktisk fremdrift",
  });
  await dialog.getByLabel("Arbeid", { exact: true }).fill("Montering på badet");
  await dialog.getByLabel("Bolig", { exact: true }).selectOption("unit");
  await dialog.getByLabel("Rom", { exact: true }).selectOption("room");
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  eq(
    await dialog.getByLabel("Arbeid", { exact: true }).inputValue(),
    "Montering på badet",
    "Focus refresh preserves unsent work",
  );
  await dialog.getByRole("button", { name: "Lukk og behold utkast" }).click();
  eq(await page.getByRole("dialog").count(), 0, "Explicit close wins");
  await page.getByRole("button", { name: "Fortsett aktivitetsutkast" }).click();
  eq(
    await dialog.getByLabel("Rom", { exact: true }).inputValue(),
    "room",
    "Reopened draft has room",
  );
  await page.reload();
  await page.getByRole("button", { name: "Fortsett aktivitetsutkast" }).click();
  dialog = page.getByRole("dialog", { name: "Aktivitet og faktisk fremdrift" });
  eq(
    await dialog.getByLabel("Arbeid", { exact: true }).inputValue(),
    "Montering på badet",
    "Reload preserves local draft before server editor",
  );
  await dialog
    .getByRole("button", { name: "Lagre endringer", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Montering på badet", exact: true })
    .waitFor();
  eq(
    await page.locator(".bolig-progress-task").count(),
    1,
    "Saved single task",
  );
  await page
    .getByRole("button", { name: "Klargjør beboervarsel", exact: true })
    .click();
  dialog = page.getByRole("dialog", {
    name: "Klargjør beboervarsel",
    exact: true,
  });
  await dialog
    .getByLabel("Melding til beboeren")
    .fill("Vi kommer på mandag. Sørg for tilgang.");
  await dialog.getByRole("button", { name: "Lagre varselutkast" }).click();
  await page.locator("summary").filter({ hasText: "Beboervarsler" }).click();
  await page.getByRole("button", { name: "Se over varselet" }).click();
  dialog = page.getByRole("dialog", { name: "Gjennomgå beboervarsel" });
  eq(
    await dialog.getByRole("button", { name: "Godkjenn varselet" }).isEnabled(),
    false,
    "Review confirmation required",
  );
  eq(
    (await dialog.innerText()).includes("qa@example.invalid"),
    true,
    "Canonical recipient visible",
  );
  await dialog.getByRole("checkbox").check();
  await dialog.getByRole("button", { name: "Godkjenn varselet" }).click();
  await page.getByRole("button", { name: "Se over varselet" }).click();
  dialog = page.getByRole("dialog", { name: "Gjennomgå beboervarsel" });
  eq(
    await dialog
      .getByRole("button", { name: "Publiser i beboerportalen" })
      .isEnabled(),
    false,
    "Publication requires own confirmation",
  );
  await dialog.getByRole("checkbox").check();
  await dialog
    .getByRole("button", { name: "Publiser i beboerportalen" })
    .click();
  eq(
    await page.getByText("Publisert i portal", { exact: true }).isVisible(),
    true,
    "Publication has explicit state",
  );
  eq(
    (
      await page.evaluate(() =>
        window.__calls
          .filter((p) => p.p_action !== "get")
          .map((p) => p.p_action),
      )
    ).slice(-3),
    ["notice", "approve", "publish"],
    "No implicit approval/publication",
  );
  await page.evaluate(() => window.__stale());
  await page
    .getByRole("button", { name: "Oppdater status", exact: true })
    .click();
  await page.getByText("Ny godkjenning kreves", { exact: true }).waitFor();
  eq(
    await page.getByRole("button", { name: "Lag ny varselutgave" }).isVisible(),
    true,
    "Stale basis points to new edition",
  );
  await page.getByRole("button", { name: "Oppdater aktivitet" }).click();
  dialog = page.getByRole("dialog", { name: "Aktivitet og faktisk fremdrift" });
  await dialog.getByLabel("Arbeid", { exact: true }).fill("Kladd ved konflikt");
  await page.evaluate(() => (window.__conflict = true));
  await dialog.getByRole("button", { name: "Lagre endringer" }).click();
  await dialog.getByRole("alert").waitFor();
  eq(
    await dialog.getByLabel("Arbeid", { exact: true }).inputValue(),
    "Kladd ved konflikt",
    "PT409 preserves editable draft",
  );
  await page.evaluate(() => (window.__conflict = false));
  await page.evaluate(() => (window.__lost = true));
  await dialog.getByRole("button", { name: "Lagre endringer" }).click();
  await page
    .getByRole("button", { name: "Prøv samme lagring igjen" })
    .waitFor({ state: "attached" });
  await dialog.getByRole("button", { name: "Lukk og behold utkast" }).click();
  await page.getByRole("button", { name: "Prøv samme lagring igjen" }).click();
  await page
    .getByRole("heading", { name: "Kladd ved konflikt", exact: true })
    .waitFor();
  eq(
    await page.locator(".bolig-progress-task").count(),
    1,
    "Lost response replay has no duplicate",
  );
  const writes = await page.evaluate(() =>
    window.__calls.filter((p) => p.p_action === "save"),
  );
  eq(
    writes.at(-1).p_payload.request_id,
    writes.at(-2).p_payload.request_id,
    "Replay uses same request ID",
  );
  await page.screenshot({
    path: path.join(tmp, "desktop.png"),
    fullPage: true,
  });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    eq(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      "No mobile overflow " + width,
    );
    await page.getByRole("button", { name: "Oppdater aktivitet" }).click();
    dialog = page.getByRole("dialog", {
      name: "Aktivitet og faktisk fremdrift",
    });
    eq(await dialog.isVisible(), true, "Mobile editor " + width);
    eq(
      await dialog
        .getByRole("checkbox")
        .evaluate((e) => Math.round(e.getBoundingClientRect().width)),
      18,
      "Checkbox has stable touch visual",
    );
    await page.screenshot({
      path: path.join(tmp, "mobile-" + width + ".png"),
      fullPage: true,
    });
    await dialog.getByRole("button", { name: "Lukk og behold utkast" }).click();
  }
  await page.evaluate(() => window.__show("reader"));
  await page
    .getByRole("button", { name: "Ny aktivitet", exact: true })
    .waitFor({ state: "detached" });
  await page.getByRole("heading", { name: "Fremdrift og varsler" }).waitFor();
  eq(
    await page
      .getByRole("button", { name: "Ny aktivitet", exact: true })
      .count(),
    0,
    "Reader has no write UI",
  );
  await page.evaluate(() => {
    window.__deny = true;
    window.dispatchEvent(new Event("focus"));
  });
  await page.getByText("Tilgangen er tilbakekalt.", { exact: true }).waitFor();
  eq(
    await page.locator(".bolig-progress-task").count(),
    0,
    "Revocation removes prior content",
  );
  eq(errors, [], "No browser errors");
  console.log(
    "PASS bolig progress Chromium: " +
      checks +
      " assertions; draft/focus/reload, conflict/replay, review/publish, stale plan, scoped readers, revocation and 1366/390/320 px. Screenshots: " +
      tmp,
  );
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
